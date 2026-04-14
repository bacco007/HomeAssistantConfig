var ko = Object.defineProperty;
var as = (t) => {
  throw TypeError(t);
};
var Lo = (t, e, n) => e in t ? ko(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n;
var F = (t, e, n) => Lo(t, typeof e != "symbol" ? e + "" : e, n), Qr = (t, e, n) => e.has(t) || as("Cannot " + n);
var u = (t, e, n) => (Qr(t, e, "read from private field"), n ? n.call(t) : e.get(t)), N = (t, e, n) => e.has(t) ? as("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, n), R = (t, e, n, i) => (Qr(t, e, "write to private field"), i ? i.call(t, n) : e.set(t, n), n), D = (t, e, n) => (Qr(t, e, "access private method"), n);
var Vs;
typeof window < "u" && ((Vs = window.__svelte ?? (window.__svelte = {})).v ?? (Vs.v = /* @__PURE__ */ new Set())).add("5");
const Po = {
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
}, Do = [
  "expanded",
  "icon",
  "arrow-color",
  "title",
  "style"
];
var _r = /* @__PURE__ */ ((t) => (t.CSS = "css", t.Object = "object", t))(_r || {});
const Mo = { name: "style", label: "CSS text", selector: { text: { multiline: !0 } } }, Ho = { name: "style", label: "CSS structured object", selector: { object: {} } }, jo = { icon: {} }, Fo = { text: {} }, qo = { boolean: {} }, Go = (t) => ({
  number: {
    unit_of_measurement: t
  }
}), Uo = (t, e) => ({
  name: t,
  label: e,
  selector: jo
}), K = (t, e) => ({
  name: t,
  label: e,
  selector: Fo
}), un = (t, e) => ({
  name: t,
  label: e,
  selector: qo
}), os = (t, e, n) => ({
  name: t,
  label: e,
  selector: Go(n)
}), zo = [
  {
    type: "expandable",
    label: "Expander Card Settings",
    icon: "mdi:arrow-down-bold-box-outline",
    schema: [
      {
        ...K("title", "Title")
      },
      {
        ...Uo("icon", "Icon")
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
                ...os("min-width-expanded", "Min width expanded", "px")
              },
              {
                ...os("max-width-expanded", "Max width expanded", "px")
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
                ...un("clear", "Clear border and background")
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
], Bo = (t, e) => new Promise((n) => {
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
            submit: (s) => {
              n(s), r && r(s);
            }
          }
        },
        bubbles: !0,
        composed: !0
      }
    )
  );
}), Un = window;
let vr = Un.cardHelpers;
const Vo = new Promise((t) => {
  vr && t(), Un.loadCardHelpers && Un.loadCardHelpers().then((e) => {
    vr = e, Un.cardHelpers = vr, t();
  });
});
async function Wo() {
  const t = document.querySelector("home-assistant"), e = t == null ? void 0 : t.hass;
  return e ? (await e.callWS({ type: "config/auth/list" })).filter((i) => !i.system_generated).map((i) => i.name) : void 0;
}
const Yo = async () => {
  const t = await Vo.then(() => vr.createCardElement({ type: "vertical-stack", cards: [] })), e = await customElements.whenDefined("hui-vertical-stack-card").then(() => t.constructor.getConfigElement()), n = await Wo();
  return class extends e.constructor {
    constructor() {
      super(), this.showDialogCallback = (r) => {
        var a, o, l, c;
        ((l = (o = (a = r.detail) == null ? void 0 : a.dialogParams) == null ? void 0 : o.schema) == null ? void 0 : l.find((d) => d.name === "expander_card_title_card_marker")) && (r.stopPropagation(), (c = r.detail) != null && c.dialogImport && r.detail.dialogImport().then(async () => {
          var f, b, m, _, $, h, v, g;
          const d = {
            title: "Title card",
            config: this._config["title-card"] || {},
            submit: (b = (f = r.detail) == null ? void 0 : f.dialogParams) == null ? void 0 : b.submit,
            cancel: (_ = (m = r.detail) == null ? void 0 : m.dialogParams) == null ? void 0 : _.cancel,
            submitText: (h = ($ = r.detail) == null ? void 0 : $.dialogParams) == null ? void 0 : h.submitText,
            cancelText: (g = (v = r.detail) == null ? void 0 : v.dialogParams) == null ? void 0 : g.cancelText,
            lovelace: this.lovelace
          };
          await Bo(
            this,
            d
          );
        }));
      }, this._computeLabelCallback = (r) => r.label ?? r.name ?? "", this._valueChanged = (r) => {
        const s = r.detail.value, a = Object.entries(Po);
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
    setConfig(r) {
      this._config = r;
    }
    // define _schema getter to return our own schema
    get _schema() {
      const s = JSON.stringify(zo), a = this._users.map((f) => f.replace(/\\/g, "\\\\").replace(/"/g, '\\"')).join('","');
      let o = s.replace(/\[\[users\]\]/g, a);
      o = o.replace(
        /\[\[templates\]\]/g,
        // NOSONAR es2019
        Do.filter((f) => {
          var b;
          return !((b = this._config.templates) != null && b.some((m) => m.template === f));
        }).join('","')
      );
      const c = (this._config.style && typeof this._config.style == "object" ? _r.Object : _r.CSS) === _r.CSS ? JSON.stringify(Mo) : JSON.stringify(Ho);
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
}, Jo = (async () => {
  for (; customElements.get("home-assistant") === void 0; )
    await new Promise((t) => Un.setTimeout(t, 100));
  if (!customElements.get("expander-card-editor")) {
    const t = await Yo();
    customElements.define("expander-card-editor", t);
  }
}), Ko = 1, Xo = 2, Qo = 16, Zo = 1, el = 2, Ks = "[", Si = "[!", ls = "[?", xi = "]", Zt = {}, Y = Symbol(), Xs = "http://www.w3.org/1999/xhtml", tl = "http://www.w3.org/2000/svg", nl = "http://www.w3.org/1998/Math/MathML", rl = !1;
var Qs = Array.isArray, il = Array.prototype.indexOf, On = Array.prototype.includes, qr = Array.from, Cr = Object.keys, Rr = Object.defineProperty, gn = Object.getOwnPropertyDescriptor, sl = Object.getOwnPropertyDescriptors, al = Object.prototype, ol = Array.prototype, Zs = Object.getPrototypeOf, cs = Object.isExtensible;
const ll = () => {
};
function cl(t) {
  for (var e = 0; e < t.length; e++)
    t[e]();
}
function ea() {
  var t, e, n = new Promise((i, r) => {
    t = i, e = r;
  });
  return { promise: n, resolve: t, reject: e };
}
const te = 2, Sn = 4, Gr = 8, ta = 1 << 24, Je = 16, Ge = 32, Tt = 64, li = 128, xe = 512, V = 1024, Q = 2048, Ke = 4096, ie = 8192, ve = 16384, It = 32768, ci = 1 << 25, xn = 65536, di = 1 << 17, dl = 1 << 18, sn = 1 << 19, ul = 1 << 20, lt = 1 << 25, en = 65536, ui = 1 << 21, Kn = 1 << 22, Ot = 1 << 23, gr = Symbol("$state"), hl = Symbol("legacy props"), fl = Symbol(""), nt = new class extends Error {
  constructor() {
    super(...arguments);
    F(this, "name", "StaleReactionError");
    F(this, "message", "The reaction that called `getAbortSignal()` was re-run or destroyed");
  }
}();
var Ws;
const pl = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  !!((Ws = globalThis.document) != null && Ws.contentType) && /* @__PURE__ */ globalThis.document.contentType.includes("xml")
), Ur = 3, Ln = 8;
function _l(t) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function vl() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function gl(t, e, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function ml(t) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function bl() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function yl(t) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function wl() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function El() {
  throw new Error("https://svelte.dev/e/hydration_failed");
}
function $l() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Al() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Ol() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Sl() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
function xl() {
  console.warn("https://svelte.dev/e/derived_inert");
}
function lr(t) {
  console.warn("https://svelte.dev/e/hydration_mismatch");
}
function Tl() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
let L = !1;
function Fe(t) {
  L = t;
}
let I;
function ee(t) {
  if (t === null)
    throw lr(), Zt;
  return I = t;
}
function Tn() {
  return ee(/* @__PURE__ */ Ue(I));
}
function Ze(t) {
  if (L) {
    if (/* @__PURE__ */ Ue(I) !== null)
      throw lr(), Zt;
    I = t;
  }
}
function Nl(t = 1) {
  if (L) {
    for (var e = t, n = I; e--; )
      n = /** @type {TemplateNode} */
      /* @__PURE__ */ Ue(n);
    I = n;
  }
}
function Ir(t = !0) {
  for (var e = 0, n = I; ; ) {
    if (n.nodeType === Ln) {
      var i = (
        /** @type {Comment} */
        n.data
      );
      if (i === xi) {
        if (e === 0) return n;
        e -= 1;
      } else (i === Ks || i === Si || // "[1", "[2", etc. for if blocks
      i[0] === "[" && !isNaN(Number(i.slice(1)))) && (e += 1);
    }
    var r = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Ue(n)
    );
    t && n.remove(), n = r;
  }
}
function na(t) {
  if (!t || t.nodeType !== Ln)
    throw lr(), Zt;
  return (
    /** @type {Comment} */
    t.data
  );
}
function ra(t) {
  return t === this.v;
}
function Cl(t, e) {
  return t != t ? e == e : t !== e || t !== null && typeof t == "object" || typeof t == "function";
}
function ia(t) {
  return !Cl(t, this.v);
}
let Rl = !1, le = null;
function Nn(t) {
  le = t;
}
function Ti(t, e = !1, n) {
  le = {
    p: le,
    i: !1,
    c: null,
    e: null,
    s: t,
    x: null,
    r: (
      /** @type {Effect} */
      k
    ),
    l: null
  };
}
function Ni(t) {
  var e = (
    /** @type {ComponentContext} */
    le
  ), n = e.e;
  if (n !== null) {
    e.e = null;
    for (var i of n)
      Na(i);
  }
  return t !== void 0 && (e.x = t), e.i = !0, le = e.p, t ?? /** @type {T} */
  {};
}
function sa() {
  return !0;
}
let Ft = [];
function aa() {
  var t = Ft;
  Ft = [], cl(t);
}
function mn(t) {
  if (Ft.length === 0 && !zn) {
    var e = Ft;
    queueMicrotask(() => {
      e === Ft && aa();
    });
  }
  Ft.push(t);
}
function Il() {
  for (; Ft.length > 0; )
    aa();
}
function oa(t) {
  var e = k;
  if (e === null)
    return P.f |= Ot, t;
  if ((e.f & It) === 0 && (e.f & Sn) === 0)
    throw t;
  $t(t, e);
}
function $t(t, e) {
  for (; e !== null; ) {
    if ((e.f & li) !== 0) {
      if ((e.f & It) === 0)
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
const kl = -7169;
function U(t, e) {
  t.f = t.f & kl | e;
}
function Ci(t) {
  (t.f & xe) !== 0 || t.deps === null ? U(t, V) : U(t, Ke);
}
function la(t) {
  if (t !== null)
    for (const e of t)
      (e.f & te) === 0 || (e.f & en) === 0 || (e.f ^= en, la(
        /** @type {Derived} */
        e.deps
      ));
}
function ca(t, e, n) {
  (t.f & Q) !== 0 ? e.add(t) : (t.f & Ke) !== 0 && n.add(t), la(t.deps), U(t, V);
}
const Dt = /* @__PURE__ */ new Set();
let x = null, X = null, hi = null, zn = !1, Zr = !1, _n = null, mr = null;
var ds = 0;
let Ll = 1;
var yn, wn, zt, rt, Be, tr, he, nr, wt, it, Ve, En, $n, Bt, z, br, da, yr, fi, wr, Pl;
const Hr = class Hr {
  constructor() {
    N(this, z);
    F(this, "id", Ll++);
    /**
     * The current values of any signals that are updated in this batch.
     * Tuple format: [value, is_derived] (note: is_derived is false for deriveds, too, if they were overridden via assignment)
     * They keys of this map are identical to `this.#previous`
     * @type {Map<Value, [any, boolean]>}
     */
    F(this, "current", /* @__PURE__ */ new Map());
    /**
     * The values of any signals (sources and deriveds) that are updated in this batch _before_ those updates took place.
     * They keys of this map are identical to `this.#current`
     * @type {Map<Value, any>}
     */
    F(this, "previous", /* @__PURE__ */ new Map());
    /**
     * When the batch is committed (and the DOM is updated), we need to remove old branches
     * and append new ones by calling the functions added inside (if/each/key/etc) blocks
     * @type {Set<(batch: Batch) => void>}
     */
    N(this, yn, /* @__PURE__ */ new Set());
    /**
     * If a fork is discarded, we need to destroy any effects that are no longer needed
     * @type {Set<(batch: Batch) => void>}
     */
    N(this, wn, /* @__PURE__ */ new Set());
    /**
     * Callbacks that should run only when a fork is committed.
     * @type {Set<(batch: Batch) => void>}
     */
    N(this, zt, /* @__PURE__ */ new Set());
    /**
     * Async effects that are currently in flight
     * @type {Map<Effect, number>}
     */
    N(this, rt, /* @__PURE__ */ new Map());
    /**
     * Async effects that are currently in flight, _not_ inside a pending boundary
     * @type {Map<Effect, number>}
     */
    N(this, Be, /* @__PURE__ */ new Map());
    /**
     * A deferred that resolves when the batch is committed, used with `settled()`
     * TODO replace with Promise.withResolvers once supported widely enough
     * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
     */
    N(this, tr, null);
    /**
     * The root effects that need to be flushed
     * @type {Effect[]}
     */
    N(this, he, []);
    /**
     * Effects created while this batch was active.
     * @type {Effect[]}
     */
    N(this, nr, []);
    /**
     * Deferred effects (which run after async work has completed) that are DIRTY
     * @type {Set<Effect>}
     */
    N(this, wt, /* @__PURE__ */ new Set());
    /**
     * Deferred effects that are MAYBE_DIRTY
     * @type {Set<Effect>}
     */
    N(this, it, /* @__PURE__ */ new Set());
    /**
     * A map of branches that still exist, but will be destroyed when this batch
     * is committed — we skip over these during `process`.
     * The value contains child effects that were dirty/maybe_dirty before being reset,
     * so they can be rescheduled if the branch survives.
     * @type {Map<Effect, { d: Effect[], m: Effect[] }>}
     */
    N(this, Ve, /* @__PURE__ */ new Map());
    /**
     * Inverse of #skipped_branches which we need to tell prior batches to unskip them when committing
     * @type {Set<Effect>}
     */
    N(this, En, /* @__PURE__ */ new Set());
    F(this, "is_fork", !1);
    N(this, $n, !1);
    /** @type {Set<Batch>} */
    N(this, Bt, /* @__PURE__ */ new Set());
  }
  /**
   * Add an effect to the #skipped_branches map and reset its children
   * @param {Effect} effect
   */
  skip_effect(e) {
    u(this, Ve).has(e) || u(this, Ve).set(e, { d: [], m: [] }), u(this, En).delete(e);
  }
  /**
   * Remove an effect from the #skipped_branches map and reschedule
   * any tracked dirty/maybe_dirty child effects
   * @param {Effect} effect
   * @param {(e: Effect) => void} callback
   */
  unskip_effect(e, n = (i) => this.schedule(i)) {
    var i = u(this, Ve).get(e);
    if (i) {
      u(this, Ve).delete(e);
      for (var r of i.d)
        U(r, Q), n(r);
      for (r of i.m)
        U(r, Ke), n(r);
    }
    u(this, En).add(e);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} value
   * @param {boolean} [is_derived]
   */
  capture(e, n, i = !1) {
    e.v !== Y && !this.previous.has(e) && this.previous.set(e, e.v), (e.f & Ot) === 0 && (this.current.set(e, [n, i]), X == null || X.set(e, n)), this.is_fork || (e.v = n);
  }
  activate() {
    x = this;
  }
  deactivate() {
    x = null, X = null;
  }
  flush() {
    try {
      Zr = !0, x = this, D(this, z, yr).call(this);
    } finally {
      ds = 0, hi = null, _n = null, mr = null, Zr = !1, x = null, X = null, Jt.clear();
    }
  }
  discard() {
    for (const e of u(this, wn)) e(this);
    u(this, wn).clear(), u(this, zt).clear(), Dt.delete(this);
  }
  /**
   * @param {Effect} effect
   */
  register_created_effect(e) {
    u(this, nr).push(e);
  }
  /**
   * @param {boolean} blocking
   * @param {Effect} effect
   */
  increment(e, n) {
    let i = u(this, rt).get(n) ?? 0;
    if (u(this, rt).set(n, i + 1), e) {
      let r = u(this, Be).get(n) ?? 0;
      u(this, Be).set(n, r + 1);
    }
  }
  /**
   * @param {boolean} blocking
   * @param {Effect} effect
   * @param {boolean} skip - whether to skip updates (because this is triggered by a stale reaction)
   */
  decrement(e, n, i) {
    let r = u(this, rt).get(n) ?? 0;
    if (r === 1 ? u(this, rt).delete(n) : u(this, rt).set(n, r - 1), e) {
      let s = u(this, Be).get(n) ?? 0;
      s === 1 ? u(this, Be).delete(n) : u(this, Be).set(n, s - 1);
    }
    u(this, $n) || i || (R(this, $n, !0), mn(() => {
      R(this, $n, !1), this.flush();
    }));
  }
  /**
   * @param {Set<Effect>} dirty_effects
   * @param {Set<Effect>} maybe_dirty_effects
   */
  transfer_effects(e, n) {
    for (const i of e)
      u(this, wt).add(i);
    for (const i of n)
      u(this, it).add(i);
    e.clear(), n.clear();
  }
  /** @param {(batch: Batch) => void} fn */
  oncommit(e) {
    u(this, yn).add(e);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(e) {
    u(this, wn).add(e);
  }
  /** @param {(batch: Batch) => void} fn */
  on_fork_commit(e) {
    u(this, zt).add(e);
  }
  run_fork_commit_callbacks() {
    for (const e of u(this, zt)) e(this);
    u(this, zt).clear();
  }
  settled() {
    return (u(this, tr) ?? R(this, tr, ea())).promise;
  }
  static ensure() {
    if (x === null) {
      const e = x = new Hr();
      Zr || (Dt.add(x), zn || mn(() => {
        x === e && e.flush();
      }));
    }
    return x;
  }
  apply() {
    {
      X = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(e) {
    var r;
    if (hi = e, (r = e.b) != null && r.is_pending && (e.f & (Sn | Gr | ta)) !== 0 && (e.f & It) === 0) {
      e.b.defer_effect(e);
      return;
    }
    for (var n = e; n.parent !== null; ) {
      n = n.parent;
      var i = n.f;
      if (_n !== null && n === k && (P === null || (P.f & te) === 0))
        return;
      if ((i & (Tt | Ge)) !== 0) {
        if ((i & V) === 0)
          return;
        n.f ^= V;
      }
    }
    u(this, he).push(n);
  }
};
yn = new WeakMap(), wn = new WeakMap(), zt = new WeakMap(), rt = new WeakMap(), Be = new WeakMap(), tr = new WeakMap(), he = new WeakMap(), nr = new WeakMap(), wt = new WeakMap(), it = new WeakMap(), Ve = new WeakMap(), En = new WeakMap(), $n = new WeakMap(), Bt = new WeakMap(), z = new WeakSet(), br = function() {
  return this.is_fork || u(this, Be).size > 0;
}, da = function() {
  for (const i of u(this, Bt))
    for (const r of u(i, Be).keys()) {
      for (var e = !1, n = r; n.parent !== null; ) {
        if (u(this, Ve).has(n)) {
          e = !0;
          break;
        }
        n = n.parent;
      }
      if (!e)
        return !0;
    }
  return !1;
}, yr = function() {
  var o, l;
  if (ds++ > 1e3 && (Dt.delete(this), Dl()), !D(this, z, br).call(this)) {
    for (const c of u(this, wt))
      u(this, it).delete(c), U(c, Q), this.schedule(c);
    for (const c of u(this, it))
      U(c, Ke), this.schedule(c);
  }
  const e = u(this, he);
  R(this, he, []), this.apply();
  var n = _n = [], i = [], r = mr = [];
  for (const c of e)
    try {
      D(this, z, fi).call(this, c, n, i);
    } catch (d) {
      throw fa(c), d;
    }
  if (x = null, r.length > 0) {
    var s = Hr.ensure();
    for (const c of r)
      s.schedule(c);
  }
  if (_n = null, mr = null, D(this, z, br).call(this) || D(this, z, da).call(this)) {
    D(this, z, wr).call(this, i), D(this, z, wr).call(this, n);
    for (const [c, d] of u(this, Ve))
      ha(c, d);
  } else {
    u(this, rt).size === 0 && Dt.delete(this), u(this, wt).clear(), u(this, it).clear();
    for (const c of u(this, yn)) c(this);
    u(this, yn).clear(), us(i), us(n), (o = u(this, tr)) == null || o.resolve();
  }
  var a = (
    /** @type {Batch | null} */
    /** @type {unknown} */
    x
  );
  if (u(this, he).length > 0) {
    const c = a ?? (a = this);
    u(c, he).push(...u(this, he).filter((d) => !u(c, he).includes(d)));
  }
  a !== null && (Dt.add(a), D(l = a, z, yr).call(l));
}, /**
 * Traverse the effect tree, executing effects or stashing
 * them for later execution as appropriate
 * @param {Effect} root
 * @param {Effect[]} effects
 * @param {Effect[]} render_effects
 */
fi = function(e, n, i) {
  e.f ^= V;
  for (var r = e.first; r !== null; ) {
    var s = r.f, a = (s & (Ge | Tt)) !== 0, o = a && (s & V) !== 0, l = o || (s & ie) !== 0 || u(this, Ve).has(r);
    if (!l && r.fn !== null) {
      a ? r.f ^= V : (s & Sn) !== 0 ? n.push(r) : cr(r) && ((s & Je) !== 0 && u(this, it).add(r), Rn(r));
      var c = r.first;
      if (c !== null) {
        r = c;
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
wr = function(e) {
  for (var n = 0; n < e.length; n += 1)
    ca(e[n], u(this, wt), u(this, it));
}, Pl = function() {
  var d, f, b;
  for (const m of Dt) {
    var e = m.id < this.id, n = [];
    for (const [_, [$, h]] of this.current) {
      if (m.current.has(_)) {
        var i = (
          /** @type {[any, boolean]} */
          m.current.get(_)[0]
        );
        if (e && $ !== i)
          m.current.set(_, [$, h]);
        else
          continue;
      }
      n.push(_);
    }
    var r = [...m.current.keys()].filter((_) => !this.current.has(_));
    if (r.length === 0)
      e && m.discard();
    else if (n.length > 0) {
      if (e)
        for (const _ of u(this, En))
          m.unskip_effect(_, ($) => {
            var h;
            ($.f & (Je | Kn)) !== 0 ? m.schedule($) : D(h = m, z, wr).call(h, [$]);
          });
      m.activate();
      var s = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Map();
      for (var o of n)
        ua(o, r, s, a);
      a = /* @__PURE__ */ new Map();
      var l = [...m.current.keys()].filter(
        (_) => this.current.has(_) ? (
          /** @type {[any, boolean]} */
          this.current.get(_)[0] !== _
        ) : !0
      );
      for (const _ of u(this, nr))
        (_.f & (ve | ie | di)) === 0 && Ri(_, l, a) && ((_.f & (Kn | Je)) !== 0 ? (U(_, Q), m.schedule(_)) : u(m, wt).add(_));
      if (u(m, he).length > 0) {
        m.apply();
        for (var c of u(m, he))
          D(d = m, z, fi).call(d, c, [], []);
        R(m, he, []);
      }
      m.deactivate();
    }
  }
  for (const m of Dt)
    u(m, Bt).has(this) && (u(m, Bt).delete(this), u(m, Bt).size === 0 && !D(f = m, z, br).call(f) && (m.activate(), D(b = m, z, yr).call(b)));
};
let Nt = Hr;
function Ae(t) {
  var e = zn;
  zn = !0;
  try {
    for (var n; ; ) {
      if (Il(), x === null)
        return (
          /** @type {T} */
          n
        );
      x.flush();
    }
  } finally {
    zn = e;
  }
}
function Dl() {
  try {
    wl();
  } catch (t) {
    $t(t, hi);
  }
}
let Le = null;
function us(t) {
  var e = t.length;
  if (e !== 0) {
    for (var n = 0; n < e; ) {
      var i = t[n++];
      if ((i.f & (ve | ie)) === 0 && cr(i) && (Le = /* @__PURE__ */ new Set(), Rn(i), i.deps === null && i.first === null && i.nodes === null && i.teardown === null && i.ac === null && ka(i), (Le == null ? void 0 : Le.size) > 0)) {
        Jt.clear();
        for (const r of Le) {
          if ((r.f & (ve | ie)) !== 0) continue;
          const s = [r];
          let a = r.parent;
          for (; a !== null; )
            Le.has(a) && (Le.delete(a), s.push(a)), a = a.parent;
          for (let o = s.length - 1; o >= 0; o--) {
            const l = s[o];
            (l.f & (ve | ie)) === 0 && Rn(l);
          }
        }
        Le.clear();
      }
    }
    Le = null;
  }
}
function ua(t, e, n, i) {
  if (!n.has(t) && (n.add(t), t.reactions !== null))
    for (const r of t.reactions) {
      const s = r.f;
      (s & te) !== 0 ? ua(
        /** @type {Derived} */
        r,
        e,
        n,
        i
      ) : (s & (Kn | Je)) !== 0 && (s & Q) === 0 && Ri(r, e, i) && (U(r, Q), Ii(
        /** @type {Effect} */
        r
      ));
    }
}
function Ri(t, e, n) {
  const i = n.get(t);
  if (i !== void 0) return i;
  if (t.deps !== null)
    for (const r of t.deps) {
      if (On.call(e, r))
        return !0;
      if ((r.f & te) !== 0 && Ri(
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
function Ii(t) {
  x.schedule(t);
}
function ha(t, e) {
  if (!((t.f & Ge) !== 0 && (t.f & V) !== 0)) {
    (t.f & Q) !== 0 ? e.d.push(t) : (t.f & Ke) !== 0 && e.m.push(t), U(t, V);
    for (var n = t.first; n !== null; )
      ha(n, e), n = n.next;
  }
}
function fa(t) {
  U(t, V);
  for (var e = t.first; e !== null; )
    fa(e), e = e.next;
}
function Ml(t) {
  let e = 0, n = tn(0), i;
  return () => {
    Pi() && (p(n), Di(() => (e === 0 && (i = Me(() => t(() => Bn(n)))), e += 1, () => {
      mn(() => {
        e -= 1, e === 0 && (i == null || i(), i = void 0, Bn(n));
      });
    })));
  };
}
var Hl = xn | sn;
function jl(t, e, n, i) {
  new Fl(t, e, n, i);
}
var fe, rr, we, Vt, ae, Ee, re, pe, st, Wt, Et, An, ir, sr, at, jr, j, pa, _a, va, pi, Er, $r, _i, vi;
class Fl {
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(e, n, i, r) {
    N(this, j);
    /** @type {Boundary | null} */
    F(this, "parent");
    F(this, "is_pending", !1);
    /**
     * API-level transformError transform function. Transforms errors before they reach the `failed` snippet.
     * Inherited from parent boundary, or defaults to identity.
     * @type {(error: unknown) => unknown}
     */
    F(this, "transform_error");
    /** @type {TemplateNode} */
    N(this, fe);
    /** @type {TemplateNode | null} */
    N(this, rr, L ? I : null);
    /** @type {BoundaryProps} */
    N(this, we);
    /** @type {((anchor: Node) => void)} */
    N(this, Vt);
    /** @type {Effect} */
    N(this, ae);
    /** @type {Effect | null} */
    N(this, Ee, null);
    /** @type {Effect | null} */
    N(this, re, null);
    /** @type {Effect | null} */
    N(this, pe, null);
    /** @type {DocumentFragment | null} */
    N(this, st, null);
    N(this, Wt, 0);
    N(this, Et, 0);
    N(this, An, !1);
    /** @type {Set<Effect>} */
    N(this, ir, /* @__PURE__ */ new Set());
    /** @type {Set<Effect>} */
    N(this, sr, /* @__PURE__ */ new Set());
    /**
     * A source containing the number of pending async deriveds/expressions.
     * Only created if `$effect.pending()` is used inside the boundary,
     * otherwise updating the source results in needless `Batch.ensure()`
     * calls followed by no-op flushes
     * @type {Source<number> | null}
     */
    N(this, at, null);
    N(this, jr, Ml(() => (R(this, at, tn(u(this, Wt))), () => {
      R(this, at, null);
    })));
    var s;
    R(this, fe, e), R(this, we, n), R(this, Vt, (a) => {
      var o = (
        /** @type {Effect} */
        k
      );
      o.b = this, o.f |= li, i(a);
    }), this.parent = /** @type {Effect} */
    k.b, this.transform_error = r ?? ((s = this.parent) == null ? void 0 : s.transform_error) ?? ((a) => a), R(this, ae, Mi(() => {
      if (L) {
        const a = (
          /** @type {Comment} */
          u(this, rr)
        );
        Tn();
        const o = a.data === Si;
        if (a.data.startsWith(ls)) {
          const c = JSON.parse(a.data.slice(ls.length));
          D(this, j, _a).call(this, c);
        } else o ? D(this, j, va).call(this) : D(this, j, pa).call(this);
      } else
        D(this, j, pi).call(this);
    }, Hl)), L && R(this, fe, I);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(e) {
    ca(e, u(this, ir), u(this, sr));
  }
  /**
   * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!u(this, we).pending;
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   * @param {Batch} batch
   */
  update_pending_count(e, n) {
    D(this, j, _i).call(this, e, n), R(this, Wt, u(this, Wt) + e), !(!u(this, at) || u(this, An)) && (R(this, An, !0), mn(() => {
      R(this, An, !1), u(this, at) && Cn(u(this, at), u(this, Wt));
    }));
  }
  get_effect_pending() {
    return u(this, jr).call(this), p(
      /** @type {Source<number>} */
      u(this, at)
    );
  }
  /** @param {unknown} error */
  error(e) {
    if (!u(this, we).onerror && !u(this, we).failed)
      throw e;
    x != null && x.is_fork ? (u(this, Ee) && x.skip_effect(u(this, Ee)), u(this, re) && x.skip_effect(u(this, re)), u(this, pe) && x.skip_effect(u(this, pe)), x.on_fork_commit(() => {
      D(this, j, vi).call(this, e);
    })) : D(this, j, vi).call(this, e);
  }
}
fe = new WeakMap(), rr = new WeakMap(), we = new WeakMap(), Vt = new WeakMap(), ae = new WeakMap(), Ee = new WeakMap(), re = new WeakMap(), pe = new WeakMap(), st = new WeakMap(), Wt = new WeakMap(), Et = new WeakMap(), An = new WeakMap(), ir = new WeakMap(), sr = new WeakMap(), at = new WeakMap(), jr = new WeakMap(), j = new WeakSet(), pa = function() {
  try {
    R(this, Ee, Oe(() => u(this, Vt).call(this, u(this, fe))));
  } catch (e) {
    this.error(e);
  }
}, /**
 * @param {unknown} error The deserialized error from the server's hydration comment
 */
_a = function(e) {
  const n = u(this, we).failed;
  n && R(this, pe, Oe(() => {
    n(
      u(this, fe),
      () => e,
      () => () => {
      }
    );
  }));
}, va = function() {
  const e = u(this, we).pending;
  e && (this.is_pending = !0, R(this, re, Oe(() => e(u(this, fe)))), mn(() => {
    var n = R(this, st, document.createDocumentFragment()), i = Te();
    n.append(i), R(this, Ee, D(this, j, $r).call(this, () => Oe(() => u(this, Vt).call(this, i)))), u(this, Et) === 0 && (u(this, fe).before(n), R(this, st, null), Kt(
      /** @type {Effect} */
      u(this, re),
      () => {
        R(this, re, null);
      }
    ), D(this, j, Er).call(
      this,
      /** @type {Batch} */
      x
    ));
  }));
}, pi = function() {
  try {
    if (this.is_pending = this.has_pending_snippet(), R(this, Et, 0), R(this, Wt, 0), R(this, Ee, Oe(() => {
      u(this, Vt).call(this, u(this, fe));
    })), u(this, Et) > 0) {
      var e = R(this, st, document.createDocumentFragment());
      Fi(u(this, Ee), e);
      const n = (
        /** @type {(anchor: Node) => void} */
        u(this, we).pending
      );
      R(this, re, Oe(() => n(u(this, fe))));
    } else
      D(this, j, Er).call(
        this,
        /** @type {Batch} */
        x
      );
  } catch (n) {
    this.error(n);
  }
}, /**
 * @param {Batch} batch
 */
Er = function(e) {
  this.is_pending = !1, e.transfer_effects(u(this, ir), u(this, sr));
}, /**
 * @template T
 * @param {() => T} fn
 */
$r = function(e) {
  var n = k, i = P, r = le;
  Ce(u(this, ae)), ce(u(this, ae)), Nn(u(this, ae).ctx);
  try {
    return Nt.ensure(), e();
  } catch (s) {
    return oa(s), null;
  } finally {
    Ce(n), ce(i), Nn(r);
  }
}, /**
 * Updates the pending count associated with the currently visible pending snippet,
 * if any, such that we can replace the snippet with content once work is done
 * @param {1 | -1} d
 * @param {Batch} batch
 */
_i = function(e, n) {
  var i;
  if (!this.has_pending_snippet()) {
    this.parent && D(i = this.parent, j, _i).call(i, e, n);
    return;
  }
  R(this, Et, u(this, Et) + e), u(this, Et) === 0 && (D(this, j, Er).call(this, n), u(this, re) && Kt(u(this, re), () => {
    R(this, re, null);
  }), u(this, st) && (u(this, fe).before(u(this, st)), R(this, st, null)));
}, /**
 * @param {unknown} error
 */
vi = function(e) {
  u(this, Ee) && (se(u(this, Ee)), R(this, Ee, null)), u(this, re) && (se(u(this, re)), R(this, re, null)), u(this, pe) && (se(u(this, pe)), R(this, pe, null)), L && (ee(
    /** @type {TemplateNode} */
    u(this, rr)
  ), Nl(), ee(Ir()));
  var n = u(this, we).onerror;
  let i = u(this, we).failed;
  var r = !1, s = !1;
  const a = () => {
    if (r) {
      Tl();
      return;
    }
    r = !0, s && Sl(), u(this, pe) !== null && Kt(u(this, pe), () => {
      R(this, pe, null);
    }), D(this, j, $r).call(this, () => {
      D(this, j, pi).call(this);
    });
  }, o = (l) => {
    try {
      s = !0, n == null || n(l, a), s = !1;
    } catch (c) {
      $t(c, u(this, ae) && u(this, ae).parent);
    }
    i && R(this, pe, D(this, j, $r).call(this, () => {
      try {
        return Oe(() => {
          var c = (
            /** @type {Effect} */
            k
          );
          c.b = this, c.f |= li, i(
            u(this, fe),
            () => l,
            () => a
          );
        });
      } catch (c) {
        return $t(
          c,
          /** @type {Effect} */
          u(this, ae).parent
        ), null;
      }
    }));
  };
  mn(() => {
    var l;
    try {
      l = this.transform_error(e);
    } catch (c) {
      $t(c, u(this, ae) && u(this, ae).parent);
      return;
    }
    l !== null && typeof l == "object" && typeof /** @type {any} */
    l.then == "function" ? l.then(
      o,
      /** @param {unknown} e */
      (c) => $t(c, u(this, ae) && u(this, ae).parent)
    ) : o(l);
  });
};
function ql(t, e, n, i) {
  const r = zr;
  var s = t.filter((b) => !b.settled);
  if (n.length === 0 && s.length === 0) {
    i(e.map(r));
    return;
  }
  var a = (
    /** @type {Effect} */
    k
  ), o = Gl(), l = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((b) => b.promise)) : null;
  function c(b) {
    o();
    try {
      i(b);
    } catch (m) {
      (a.f & ve) === 0 && $t(m, a);
    }
    kr();
  }
  if (n.length === 0) {
    l.then(() => c(e.map(r)));
    return;
  }
  var d = ga();
  function f() {
    Promise.all(n.map((b) => /* @__PURE__ */ Ul(b))).then((b) => c([...e.map(r), ...b])).catch((b) => $t(b, a)).finally(() => d());
  }
  l ? l.then(() => {
    o(), f(), kr();
  }) : f();
}
function Gl() {
  var t = (
    /** @type {Effect} */
    k
  ), e = P, n = le, i = (
    /** @type {Batch} */
    x
  );
  return function(s = !0) {
    Ce(t), ce(e), Nn(n), s && (t.f & ve) === 0 && (i == null || i.activate(), i == null || i.apply());
  };
}
function kr(t = !0) {
  Ce(null), ce(null), Nn(null), t && (x == null || x.deactivate());
}
function ga() {
  var t = (
    /** @type {Effect} */
    k
  ), e = (
    /** @type {Boundary} */
    t.b
  ), n = (
    /** @type {Batch} */
    x
  ), i = e.is_rendered();
  return e.update_pending_count(1, n), n.increment(i, t), (r = !1) => {
    e.update_pending_count(-1, n), n.decrement(i, t, r);
  };
}
// @__NO_SIDE_EFFECTS__
function zr(t) {
  var e = te | Q;
  return k !== null && (k.f |= sn), {
    ctx: le,
    deps: null,
    effects: null,
    equals: ra,
    f: e,
    fn: t,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      Y
    ),
    wv: 0,
    parent: k,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function Ul(t, e, n) {
  let i = (
    /** @type {Effect | null} */
    k
  );
  i === null && vl();
  var r = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = tn(
    /** @type {V} */
    Y
  ), a = !P, o = /* @__PURE__ */ new Map();
  return Zl(() => {
    var m;
    var l = (
      /** @type {Effect} */
      k
    ), c = ea();
    r = c.promise;
    try {
      Promise.resolve(t()).then(c.resolve, c.reject).finally(kr);
    } catch (_) {
      c.reject(_), kr();
    }
    var d = (
      /** @type {Batch} */
      x
    );
    if (a) {
      if ((l.f & It) !== 0)
        var f = ga();
      if (
        /** @type {Boundary} */
        i.b.is_rendered()
      )
        (m = o.get(d)) == null || m.reject(nt), o.delete(d);
      else {
        for (const _ of o.values())
          _.reject(nt);
        o.clear();
      }
      o.set(d, c);
    }
    const b = (_, $ = void 0) => {
      if (f) {
        var h = $ === nt;
        f(h);
      }
      if (!($ === nt || (l.f & ve) !== 0)) {
        if (d.activate(), $)
          s.f |= Ot, Cn(s, $);
        else {
          (s.f & Ot) !== 0 && (s.f ^= Ot), Cn(s, _);
          for (const [v, g] of o) {
            if (o.delete(v), v === d) break;
            g.reject(nt);
          }
        }
        d.deactivate();
      }
    };
    c.promise.then(b, (_) => b(null, _ || "unknown"));
  }), Kl(() => {
    for (const l of o.values())
      l.reject(nt);
  }), new Promise((l) => {
    function c(d) {
      function f() {
        d === r ? l(s) : c(r);
      }
      d.then(f, f);
    }
    c(r);
  });
}
// @__NO_SIDE_EFFECTS__
function jn(t) {
  const e = /* @__PURE__ */ zr(t);
  return Da(e), e;
}
// @__NO_SIDE_EFFECTS__
function zl(t) {
  const e = /* @__PURE__ */ zr(t);
  return e.equals = ia, e;
}
function Bl(t) {
  var e = t.effects;
  if (e !== null) {
    t.effects = null;
    for (var n = 0; n < e.length; n += 1)
      se(
        /** @type {Effect} */
        e[n]
      );
  }
}
function ki(t) {
  var e, n = k, i = t.parent;
  if (!dt && i !== null && (i.f & (ve | ie)) !== 0)
    return xl(), t.v;
  Ce(i);
  try {
    t.f &= ~en, Bl(t), e = Fa(t);
  } finally {
    Ce(n);
  }
  return e;
}
function ma(t) {
  var e = ki(t);
  if (!t.equals(e) && (t.wv = Ha(), (!(x != null && x.is_fork) || t.deps === null) && (x !== null ? x.capture(t, e, !0) : t.v = e, t.deps === null))) {
    U(t, V);
    return;
  }
  dt || (X !== null ? (Pi() || x != null && x.is_fork) && X.set(t, e) : Ci(t));
}
function Vl(t) {
  var e, n;
  if (t.effects !== null)
    for (const i of t.effects)
      (i.teardown || i.ac) && ((e = i.teardown) == null || e.call(i), (n = i.ac) == null || n.abort(nt), i.teardown = ll, i.ac = null, Xn(i, 0), Hi(i));
}
function ba(t) {
  if (t.effects !== null)
    for (const e of t.effects)
      e.teardown && Rn(e);
}
let gi = /* @__PURE__ */ new Set();
const Jt = /* @__PURE__ */ new Map();
let ya = !1;
function tn(t, e) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: t,
    reactions: null,
    equals: ra,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function H(t, e) {
  const n = tn(t);
  return Da(n), n;
}
// @__NO_SIDE_EFFECTS__
function wa(t, e = !1, n = !0) {
  const i = tn(t);
  return e || (i.equals = ia), i;
}
function S(t, e, n = !1) {
  P !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!qe || (P.f & di) !== 0) && sa() && (P.f & (te | Je | Kn | di)) !== 0 && (Ne === null || !On.call(Ne, t)) && Ol();
  let i = n ? Ye(e) : e;
  return Cn(t, i, mr);
}
function Cn(t, e, n = null) {
  if (!t.equals(e)) {
    Jt.set(t, dt ? e : t.v);
    var i = Nt.ensure();
    if (i.capture(t, e), (t.f & te) !== 0) {
      const r = (
        /** @type {Derived} */
        t
      );
      (t.f & Q) !== 0 && ki(r), X === null && Ci(r);
    }
    t.wv = Ha(), Ea(t, Q, n), k !== null && (k.f & V) !== 0 && (k.f & (Ge | Tt)) === 0 && (be === null ? tc([t]) : be.push(t)), !i.is_fork && gi.size > 0 && !ya && Wl();
  }
  return e;
}
function Wl() {
  ya = !1;
  for (const t of gi)
    (t.f & V) !== 0 && U(t, Ke), cr(t) && Rn(t);
  gi.clear();
}
function Bn(t) {
  S(t, t.v + 1);
}
function Ea(t, e, n) {
  var i = t.reactions;
  if (i !== null)
    for (var r = i.length, s = 0; s < r; s++) {
      var a = i[s], o = a.f, l = (o & Q) === 0;
      if (l && U(a, e), (o & te) !== 0) {
        var c = (
          /** @type {Derived} */
          a
        );
        X == null || X.delete(c), (o & en) === 0 && (o & xe && (a.f |= en), Ea(c, Ke, n));
      } else if (l) {
        var d = (
          /** @type {Effect} */
          a
        );
        (o & Je) !== 0 && Le !== null && Le.add(d), n !== null ? n.push(d) : Ii(d);
      }
    }
}
function Ye(t) {
  if (typeof t != "object" || t === null || gr in t)
    return t;
  const e = Zs(t);
  if (e !== al && e !== ol)
    return t;
  var n = /* @__PURE__ */ new Map(), i = Qs(t), r = /* @__PURE__ */ H(0), s = Xt, a = (o) => {
    if (Xt === s)
      return o();
    var l = P, c = Xt;
    ce(null), _s(s);
    var d = o();
    return ce(l), _s(c), d;
  };
  return i && n.set("length", /* @__PURE__ */ H(
    /** @type {any[]} */
    t.length
  )), new Proxy(
    /** @type {any} */
    t,
    {
      defineProperty(o, l, c) {
        (!("value" in c) || c.configurable === !1 || c.enumerable === !1 || c.writable === !1) && $l();
        var d = n.get(l);
        return d === void 0 ? a(() => {
          var f = /* @__PURE__ */ H(c.value);
          return n.set(l, f), f;
        }) : S(d, c.value, !0), !0;
      },
      deleteProperty(o, l) {
        var c = n.get(l);
        if (c === void 0) {
          if (l in o) {
            const d = a(() => /* @__PURE__ */ H(Y));
            n.set(l, d), Bn(r);
          }
        } else
          S(c, Y), Bn(r);
        return !0;
      },
      get(o, l, c) {
        var m;
        if (l === gr)
          return t;
        var d = n.get(l), f = l in o;
        if (d === void 0 && (!f || (m = gn(o, l)) != null && m.writable) && (d = a(() => {
          var _ = Ye(f ? o[l] : Y), $ = /* @__PURE__ */ H(_);
          return $;
        }), n.set(l, d)), d !== void 0) {
          var b = p(d);
          return b === Y ? void 0 : b;
        }
        return Reflect.get(o, l, c);
      },
      getOwnPropertyDescriptor(o, l) {
        var c = Reflect.getOwnPropertyDescriptor(o, l);
        if (c && "value" in c) {
          var d = n.get(l);
          d && (c.value = p(d));
        } else if (c === void 0) {
          var f = n.get(l), b = f == null ? void 0 : f.v;
          if (f !== void 0 && b !== Y)
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
        if (l === gr)
          return !0;
        var c = n.get(l), d = c !== void 0 && c.v !== Y || Reflect.has(o, l);
        if (c !== void 0 || k !== null && (!d || (b = gn(o, l)) != null && b.writable)) {
          c === void 0 && (c = a(() => {
            var m = d ? Ye(o[l]) : Y, _ = /* @__PURE__ */ H(m);
            return _;
          }), n.set(l, c));
          var f = p(c);
          if (f === Y)
            return !1;
        }
        return d;
      },
      set(o, l, c, d) {
        var w;
        var f = n.get(l), b = l in o;
        if (i && l === "length")
          for (var m = c; m < /** @type {Source<number>} */
          f.v; m += 1) {
            var _ = n.get(m + "");
            _ !== void 0 ? S(_, Y) : m in o && (_ = a(() => /* @__PURE__ */ H(Y)), n.set(m + "", _));
          }
        if (f === void 0)
          (!b || (w = gn(o, l)) != null && w.writable) && (f = a(() => /* @__PURE__ */ H(void 0)), S(f, Ye(c)), n.set(l, f));
        else {
          b = f.v !== Y;
          var $ = a(() => Ye(c));
          S(f, $);
        }
        var h = Reflect.getOwnPropertyDescriptor(o, l);
        if (h != null && h.set && h.set.call(d, c), !b) {
          if (i && typeof l == "string") {
            var v = (
              /** @type {Source<number>} */
              n.get("length")
            ), g = Number(l);
            Number.isInteger(g) && g >= v.v && S(v, g + 1);
          }
          Bn(r);
        }
        return !0;
      },
      ownKeys(o) {
        p(r);
        var l = Reflect.ownKeys(o).filter((f) => {
          var b = n.get(f);
          return b === void 0 || b.v !== Y;
        });
        for (var [c, d] of n)
          d.v !== Y && !(c in o) && l.push(c);
        return l;
      },
      setPrototypeOf() {
        Al();
      }
    }
  );
}
var hs, $a, Aa, Oa;
function mi() {
  if (hs === void 0) {
    hs = window, $a = /Firefox/.test(navigator.userAgent);
    var t = Element.prototype, e = Node.prototype, n = Text.prototype;
    Aa = gn(e, "firstChild").get, Oa = gn(e, "nextSibling").get, cs(t) && (t.__click = void 0, t.__className = void 0, t.__attributes = null, t.__style = void 0, t.__e = void 0), cs(n) && (n.__t = void 0);
  }
}
function Te(t = "") {
  return document.createTextNode(t);
}
// @__NO_SIDE_EFFECTS__
function Se(t) {
  return (
    /** @type {TemplateNode | null} */
    Aa.call(t)
  );
}
// @__NO_SIDE_EFFECTS__
function Ue(t) {
  return (
    /** @type {TemplateNode | null} */
    Oa.call(t)
  );
}
function _t(t, e) {
  if (!L)
    return /* @__PURE__ */ Se(t);
  var n = /* @__PURE__ */ Se(I);
  if (n === null)
    n = I.appendChild(Te());
  else if (e && n.nodeType !== Ur) {
    var i = Te();
    return n == null || n.before(i), ee(i), i;
  }
  return e && Li(
    /** @type {Text} */
    n
  ), ee(n), n;
}
function fs(t, e = !1) {
  if (!L) {
    var n = /* @__PURE__ */ Se(t);
    return n instanceof Comment && n.data === "" ? /* @__PURE__ */ Ue(n) : n;
  }
  if (e) {
    if ((I == null ? void 0 : I.nodeType) !== Ur) {
      var i = Te();
      return I == null || I.before(i), ee(i), i;
    }
    Li(
      /** @type {Text} */
      I
    );
  }
  return I;
}
function Mt(t, e = 1, n = !1) {
  let i = L ? I : t;
  for (var r; e--; )
    r = i, i = /** @type {TemplateNode} */
    /* @__PURE__ */ Ue(i);
  if (!L)
    return i;
  if (n) {
    if ((i == null ? void 0 : i.nodeType) !== Ur) {
      var s = Te();
      return i === null ? r == null || r.after(s) : i.before(s), ee(s), s;
    }
    Li(
      /** @type {Text} */
      i
    );
  }
  return ee(i), i;
}
function Sa(t) {
  t.textContent = "";
}
function xa() {
  return !1;
}
function Br(t, e, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(e ?? Xs, t, void 0)
  );
}
function Li(t) {
  if (
    /** @type {string} */
    t.nodeValue.length < 65536
  )
    return;
  let e = t.nextSibling;
  for (; e !== null && e.nodeType === Ur; )
    e.remove(), t.nodeValue += /** @type {string} */
    e.nodeValue, e = t.nextSibling;
}
function Ta(t) {
  var e = P, n = k;
  ce(null), Ce(null);
  try {
    return t();
  } finally {
    ce(e), Ce(n);
  }
}
function Yl(t) {
  k === null && (P === null && yl(), bl()), dt && ml();
}
function Jl(t, e) {
  var n = e.last;
  n === null ? e.last = e.first = t : (n.next = t, t.prev = n, e.last = t);
}
function Xe(t, e) {
  var n = k;
  n !== null && (n.f & ie) !== 0 && (t |= ie);
  var i = {
    ctx: le,
    deps: null,
    nodes: null,
    f: t | Q | xe,
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
  };
  x == null || x.register_created_effect(i);
  var r = i;
  if ((t & Sn) !== 0)
    _n !== null ? _n.push(i) : Nt.ensure().schedule(i);
  else if (e !== null) {
    try {
      Rn(i);
    } catch (a) {
      throw se(i), a;
    }
    r.deps === null && r.teardown === null && r.nodes === null && r.first === r.last && // either `null`, or a singular child
    (r.f & sn) === 0 && (r = r.first, (t & Je) !== 0 && (t & xn) !== 0 && r !== null && (r.f |= xn));
  }
  if (r !== null && (r.parent = n, n !== null && Jl(r, n), P !== null && (P.f & te) !== 0 && (t & Tt) === 0)) {
    var s = (
      /** @type {Derived} */
      P
    );
    (s.effects ?? (s.effects = [])).push(r);
  }
  return i;
}
function Pi() {
  return P !== null && !qe;
}
function Kl(t) {
  const e = Xe(Gr, null);
  return U(e, V), e.teardown = t, e;
}
function bn(t) {
  Yl();
  var e = (
    /** @type {Effect} */
    k.f
  ), n = !P && (e & Ge) !== 0 && (e & It) === 0;
  if (n) {
    var i = (
      /** @type {ComponentContext} */
      le
    );
    (i.e ?? (i.e = [])).push(t);
  } else
    return Na(t);
}
function Na(t) {
  return Xe(Sn | ul, t);
}
function Xl(t) {
  Nt.ensure();
  const e = Xe(Tt | sn, t);
  return () => {
    se(e);
  };
}
function Ql(t) {
  Nt.ensure();
  const e = Xe(Tt | sn, t);
  return (n = {}) => new Promise((i) => {
    n.outro ? Kt(e, () => {
      se(e), i(void 0);
    }) : (se(e), i(void 0));
  });
}
function Ca(t) {
  return Xe(Sn, t);
}
function Zl(t) {
  return Xe(Kn | sn, t);
}
function Di(t, e = 0) {
  return Xe(Gr | e, t);
}
function et(t, e = [], n = [], i = []) {
  ql(i, e, n, (r) => {
    Xe(Gr, () => t(...r.map(p)));
  });
}
function Mi(t, e = 0) {
  var n = Xe(Je | e, t);
  return n;
}
function Oe(t) {
  return Xe(Ge | sn, t);
}
function Ra(t) {
  var e = t.teardown;
  if (e !== null) {
    const n = dt, i = P;
    ps(!0), ce(null);
    try {
      e.call(null);
    } finally {
      ps(n), ce(i);
    }
  }
}
function Hi(t, e = !1) {
  var n = t.first;
  for (t.first = t.last = null; n !== null; ) {
    const r = n.ac;
    r !== null && Ta(() => {
      r.abort(nt);
    });
    var i = n.next;
    (n.f & Tt) !== 0 ? n.parent = null : se(n, e), n = i;
  }
}
function ec(t) {
  for (var e = t.first; e !== null; ) {
    var n = e.next;
    (e.f & Ge) === 0 && se(e), e = n;
  }
}
function se(t, e = !0) {
  var n = !1;
  (e || (t.f & dl) !== 0) && t.nodes !== null && t.nodes.end !== null && (Ia(
    t.nodes.start,
    /** @type {TemplateNode} */
    t.nodes.end
  ), n = !0), U(t, ci), Hi(t, e && !n), Xn(t, 0);
  var i = t.nodes && t.nodes.t;
  if (i !== null)
    for (const s of i)
      s.stop();
  Ra(t), t.f ^= ci, t.f |= ve;
  var r = t.parent;
  r !== null && r.first !== null && ka(t), t.next = t.prev = t.teardown = t.ctx = t.deps = t.fn = t.nodes = t.ac = t.b = null;
}
function Ia(t, e) {
  for (; t !== null; ) {
    var n = t === e ? null : /* @__PURE__ */ Ue(t);
    t.remove(), t = n;
  }
}
function ka(t) {
  var e = t.parent, n = t.prev, i = t.next;
  n !== null && (n.next = i), i !== null && (i.prev = n), e !== null && (e.first === t && (e.first = i), e.last === t && (e.last = n));
}
function Kt(t, e, n = !0) {
  var i = [];
  La(t, i, !0);
  var r = () => {
    n && se(t), e && e();
  }, s = i.length;
  if (s > 0) {
    var a = () => --s || r();
    for (var o of i)
      o.out(a);
  } else
    r();
}
function La(t, e, n) {
  if ((t.f & ie) === 0) {
    t.f ^= ie;
    var i = t.nodes && t.nodes.t;
    if (i !== null)
      for (const o of i)
        (o.is_global || n) && e.push(o);
    for (var r = t.first; r !== null; ) {
      var s = r.next, a = (r.f & xn) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (r.f & Ge) !== 0 && (t.f & Je) !== 0;
      La(r, e, a ? n : !1), r = s;
    }
  }
}
function ji(t) {
  Pa(t, !0);
}
function Pa(t, e) {
  if ((t.f & ie) !== 0) {
    t.f ^= ie, (t.f & V) === 0 && (U(t, Q), Nt.ensure().schedule(t));
    for (var n = t.first; n !== null; ) {
      var i = n.next, r = (n.f & xn) !== 0 || (n.f & Ge) !== 0;
      Pa(n, r ? e : !1), n = i;
    }
    var s = t.nodes && t.nodes.t;
    if (s !== null)
      for (const a of s)
        (a.is_global || e) && a.in();
  }
}
function Fi(t, e) {
  if (t.nodes)
    for (var n = t.nodes.start, i = t.nodes.end; n !== null; ) {
      var r = n === i ? null : /* @__PURE__ */ Ue(n);
      e.append(n), n = r;
    }
}
let Ar = !1, dt = !1;
function ps(t) {
  dt = t;
}
let P = null, qe = !1;
function ce(t) {
  P = t;
}
let k = null;
function Ce(t) {
  k = t;
}
let Ne = null;
function Da(t) {
  P !== null && (Ne === null ? Ne = [t] : Ne.push(t));
}
let oe = null, ue = 0, be = null;
function tc(t) {
  be = t;
}
let Ma = 1, qt = 0, Xt = qt;
function _s(t) {
  Xt = t;
}
function Ha() {
  return ++Ma;
}
function cr(t) {
  var e = t.f;
  if ((e & Q) !== 0)
    return !0;
  if (e & te && (t.f &= ~en), (e & Ke) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      t.deps
    ), i = n.length, r = 0; r < i; r++) {
      var s = n[r];
      if (cr(
        /** @type {Derived} */
        s
      ) && ma(
        /** @type {Derived} */
        s
      ), s.wv > t.wv)
        return !0;
    }
    (e & xe) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    X === null && U(t, V);
  }
  return !1;
}
function ja(t, e, n = !0) {
  var i = t.reactions;
  if (i !== null && !(Ne !== null && On.call(Ne, t)))
    for (var r = 0; r < i.length; r++) {
      var s = i[r];
      (s.f & te) !== 0 ? ja(
        /** @type {Derived} */
        s,
        e,
        !1
      ) : e === s && (n ? U(s, Q) : (s.f & V) !== 0 && U(s, Ke), Ii(
        /** @type {Effect} */
        s
      ));
    }
}
function Fa(t) {
  var $;
  var e = oe, n = ue, i = be, r = P, s = Ne, a = le, o = qe, l = Xt, c = t.f;
  oe = /** @type {null | Value[]} */
  null, ue = 0, be = null, P = (c & (Ge | Tt)) === 0 ? t : null, Ne = null, Nn(t.ctx), qe = !1, Xt = ++qt, t.ac !== null && (Ta(() => {
    t.ac.abort(nt);
  }), t.ac = null);
  try {
    t.f |= ui;
    var d = (
      /** @type {Function} */
      t.fn
    ), f = d();
    t.f |= It;
    var b = t.deps, m = x == null ? void 0 : x.is_fork;
    if (oe !== null) {
      var _;
      if (m || Xn(t, ue), b !== null && ue > 0)
        for (b.length = ue + oe.length, _ = 0; _ < oe.length; _++)
          b[ue + _] = oe[_];
      else
        t.deps = b = oe;
      if (Pi() && (t.f & xe) !== 0)
        for (_ = ue; _ < b.length; _++)
          (($ = b[_]).reactions ?? ($.reactions = [])).push(t);
    } else !m && b !== null && ue < b.length && (Xn(t, ue), b.length = ue);
    if (sa() && be !== null && !qe && b !== null && (t.f & (te | Ke | Q)) === 0)
      for (_ = 0; _ < /** @type {Source[]} */
      be.length; _++)
        ja(
          be[_],
          /** @type {Effect} */
          t
        );
    if (r !== null && r !== t) {
      if (qt++, r.deps !== null)
        for (let h = 0; h < n; h += 1)
          r.deps[h].rv = qt;
      if (e !== null)
        for (const h of e)
          h.rv = qt;
      be !== null && (i === null ? i = be : i.push(.../** @type {Source[]} */
      be));
    }
    return (t.f & Ot) !== 0 && (t.f ^= Ot), f;
  } catch (h) {
    return oa(h);
  } finally {
    t.f ^= ui, oe = e, ue = n, be = i, P = r, Ne = s, Nn(a), qe = o, Xt = l;
  }
}
function nc(t, e) {
  let n = e.reactions;
  if (n !== null) {
    var i = il.call(n, t);
    if (i !== -1) {
      var r = n.length - 1;
      r === 0 ? n = e.reactions = null : (n[i] = n[r], n.pop());
    }
  }
  if (n === null && (e.f & te) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (oe === null || !On.call(oe, e))) {
    var s = (
      /** @type {Derived} */
      e
    );
    (s.f & xe) !== 0 && (s.f ^= xe, s.f &= ~en), s.v !== Y && Ci(s), Vl(s), Xn(s, 0);
  }
}
function Xn(t, e) {
  var n = t.deps;
  if (n !== null)
    for (var i = e; i < n.length; i++)
      nc(t, n[i]);
}
function Rn(t) {
  var e = t.f;
  if ((e & ve) === 0) {
    U(t, V);
    var n = k, i = Ar;
    k = t, Ar = !0;
    try {
      (e & (Je | ta)) !== 0 ? ec(t) : Hi(t), Ra(t);
      var r = Fa(t);
      t.teardown = typeof r == "function" ? r : null, t.wv = Ma;
      var s;
      rl && Rl && (t.f & Q) !== 0 && t.deps;
    } finally {
      Ar = i, k = n;
    }
  }
}
function p(t) {
  var e = t.f, n = (e & te) !== 0;
  if (P !== null && !qe) {
    var i = k !== null && (k.f & ve) !== 0;
    if (!i && (Ne === null || !On.call(Ne, t))) {
      var r = P.deps;
      if ((P.f & ui) !== 0)
        t.rv < qt && (t.rv = qt, oe === null && r !== null && r[ue] === t ? ue++ : oe === null ? oe = [t] : oe.push(t));
      else {
        (P.deps ?? (P.deps = [])).push(t);
        var s = t.reactions;
        s === null ? t.reactions = [P] : On.call(s, P) || s.push(P);
      }
    }
  }
  if (dt && Jt.has(t))
    return Jt.get(t);
  if (n) {
    var a = (
      /** @type {Derived} */
      t
    );
    if (dt) {
      var o = a.v;
      return ((a.f & V) === 0 && a.reactions !== null || Ga(a)) && (o = ki(a)), Jt.set(a, o), o;
    }
    var l = (a.f & xe) === 0 && !qe && P !== null && (Ar || (P.f & xe) !== 0), c = (a.f & It) === 0;
    cr(a) && (l && (a.f |= xe), ma(a)), l && !c && (ba(a), qa(a));
  }
  if (X != null && X.has(t))
    return X.get(t);
  if ((t.f & Ot) !== 0)
    throw t.v;
  return t.v;
}
function qa(t) {
  if (t.f |= xe, t.deps !== null)
    for (const e of t.deps)
      (e.reactions ?? (e.reactions = [])).push(t), (e.f & te) !== 0 && (e.f & xe) === 0 && (ba(
        /** @type {Derived} */
        e
      ), qa(
        /** @type {Derived} */
        e
      ));
}
function Ga(t) {
  if (t.v === Y) return !0;
  if (t.deps === null) return !1;
  for (const e of t.deps)
    if (Jt.has(e) || (e.f & te) !== 0 && Ga(
      /** @type {Derived} */
      e
    ))
      return !0;
  return !1;
}
function Me(t) {
  var e = qe;
  try {
    return qe = !0, t();
  } finally {
    qe = e;
  }
}
const Gt = Symbol("events"), Ua = /* @__PURE__ */ new Set(), bi = /* @__PURE__ */ new Set();
function ei(t, e, n) {
  (e[Gt] ?? (e[Gt] = {}))[t] = n;
}
function rc(t) {
  for (var e = 0; e < t.length; e++)
    Ua.add(t[e]);
  for (var n of bi)
    n(t);
}
let vs = null;
function gs(t) {
  var h, v;
  var e = this, n = (
    /** @type {Node} */
    e.ownerDocument
  ), i = t.type, r = ((h = t.composedPath) == null ? void 0 : h.call(t)) || [], s = (
    /** @type {null | Element} */
    r[0] || t.target
  );
  vs = t;
  var a = 0, o = vs === t && t[Gt];
  if (o) {
    var l = r.indexOf(o);
    if (l !== -1 && (e === document || e === /** @type {any} */
    window)) {
      t[Gt] = e;
      return;
    }
    var c = r.indexOf(e);
    if (c === -1)
      return;
    l <= c && (a = l);
  }
  if (s = /** @type {Element} */
  r[a] || t.target, s !== e) {
    Rr(t, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var d = P, f = k;
    ce(null), Ce(null);
    try {
      for (var b, m = []; s !== null; ) {
        var _ = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var $ = (v = s[Gt]) == null ? void 0 : v[i];
          $ != null && (!/** @type {any} */
          s.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          t.target === s) && $.call(s, t);
        } catch (g) {
          b ? m.push(g) : b = g;
        }
        if (t.cancelBubble || _ === e || _ === null)
          break;
        s = _;
      }
      if (b) {
        for (let g of m)
          queueMicrotask(() => {
            throw g;
          });
        throw b;
      }
    } finally {
      t[Gt] = e, delete t.currentTarget, ce(d), Ce(f);
    }
  }
}
var Ys;
const ti = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  ((Ys = globalThis == null ? void 0 : globalThis.window) == null ? void 0 : Ys.trustedTypes) && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (t) => t
  })
);
function ic(t) {
  return (
    /** @type {string} */
    (ti == null ? void 0 : ti.createHTML(t)) ?? t
  );
}
function sc(t) {
  var e = Br("template");
  return e.innerHTML = ic(t.replaceAll("<!>", "<!---->")), e.content;
}
function ct(t, e) {
  var n = (
    /** @type {Effect} */
    k
  );
  n.nodes === null && (n.nodes = { start: t, end: e, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function ut(t, e) {
  var n = (e & Zo) !== 0, i = (e & el) !== 0, r, s = !t.startsWith("<!>");
  return () => {
    if (L)
      return ct(I, null), I;
    r === void 0 && (r = sc(s ? t : "<!>" + t), n || (r = /** @type {TemplateNode} */
    /* @__PURE__ */ Se(r)));
    var a = (
      /** @type {TemplateNode} */
      i || $a ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    if (n) {
      var o = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Se(a)
      ), l = (
        /** @type {TemplateNode} */
        a.lastChild
      );
      ct(o, l);
    } else
      ct(a, a);
    return a;
  };
}
function ms() {
  if (L)
    return ct(I, null), I;
  var t = document.createDocumentFragment(), e = document.createComment(""), n = Te();
  return t.append(e, n), ct(e, n), t;
}
function ye(t, e) {
  if (L) {
    var n = (
      /** @type {Effect & { nodes: EffectNodes }} */
      k
    );
    ((n.f & It) === 0 || n.nodes.end === null) && (n.nodes.end = I), Tn();
    return;
  }
  t !== null && t.before(
    /** @type {Node} */
    e
  );
}
const ac = ["touchstart", "touchmove"];
function oc(t) {
  return ac.includes(t);
}
function lc(t, e) {
  var n = e == null ? "" : typeof e == "object" ? `${e}` : e;
  n !== (t.__t ?? (t.__t = t.nodeValue)) && (t.__t = n, t.nodeValue = `${n}`);
}
function za(t, e) {
  return Ba(t, e);
}
function cc(t, e) {
  mi(), e.intro = e.intro ?? !1;
  const n = e.target, i = L, r = I;
  try {
    for (var s = /* @__PURE__ */ Se(n); s && (s.nodeType !== Ln || /** @type {Comment} */
    s.data !== Ks); )
      s = /* @__PURE__ */ Ue(s);
    if (!s)
      throw Zt;
    Fe(!0), ee(
      /** @type {Comment} */
      s
    );
    const a = Ba(t, { ...e, anchor: s });
    return Fe(!1), /**  @type {Exports} */
    a;
  } catch (a) {
    if (a instanceof Error && a.message.split(`
`).some((o) => o.startsWith("https://svelte.dev/e/")))
      throw a;
    return a !== Zt && console.warn("Failed to hydrate: ", a), e.recover === !1 && El(), mi(), Sa(n), Fe(!1), za(t, e);
  } finally {
    Fe(i), ee(r);
  }
}
const pr = /* @__PURE__ */ new Map();
function Ba(t, { target: e, anchor: n, props: i = {}, events: r, context: s, intro: a = !0, transformError: o }) {
  mi();
  var l = void 0, c = Ql(() => {
    var d = n ?? e.appendChild(Te());
    jl(
      /** @type {TemplateNode} */
      d,
      {
        pending: () => {
        }
      },
      (m) => {
        Ti({});
        var _ = (
          /** @type {ComponentContext} */
          le
        );
        if (s && (_.c = s), r && (i.$$events = r), L && ct(
          /** @type {TemplateNode} */
          m,
          null
        ), l = t(m, i) || {}, L && (k.nodes.end = I, I === null || I.nodeType !== Ln || /** @type {Comment} */
        I.data !== xi))
          throw lr(), Zt;
        Ni();
      },
      o
    );
    var f = /* @__PURE__ */ new Set(), b = (m) => {
      for (var _ = 0; _ < m.length; _++) {
        var $ = m[_];
        if (!f.has($)) {
          f.add($);
          var h = oc($);
          for (const w of [e, document]) {
            var v = pr.get(w);
            v === void 0 && (v = /* @__PURE__ */ new Map(), pr.set(w, v));
            var g = v.get($);
            g === void 0 ? (w.addEventListener($, gs, { passive: h }), v.set($, 1)) : v.set($, g + 1);
          }
        }
      }
    };
    return b(qr(Ua)), bi.add(b), () => {
      var h;
      for (var m of f)
        for (const v of [e, document]) {
          var _ = (
            /** @type {Map<string, number>} */
            pr.get(v)
          ), $ = (
            /** @type {number} */
            _.get(m)
          );
          --$ == 0 ? (v.removeEventListener(m, gs), _.delete(m), _.size === 0 && pr.delete(v)) : _.set(m, $);
        }
      bi.delete(b), d !== n && ((h = d.parentNode) == null || h.removeChild(d));
    };
  });
  return yi.set(l, c), l;
}
let yi = /* @__PURE__ */ new WeakMap();
function dc(t, e) {
  const n = yi.get(t);
  return n ? (yi.delete(t), n(e)) : Promise.resolve();
}
var De, We, _e, Yt, ar, or, Fr;
class uc {
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(e, n = !0) {
    /** @type {TemplateNode} */
    F(this, "anchor");
    /** @type {Map<Batch, Key>} */
    N(this, De, /* @__PURE__ */ new Map());
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
    N(this, We, /* @__PURE__ */ new Map());
    /**
     * Similar to #onscreen with respect to the keys, but contains branches that are not yet
     * in the DOM, because their insertion is deferred.
     * @type {Map<Key, Branch>}
     */
    N(this, _e, /* @__PURE__ */ new Map());
    /**
     * Keys of effects that are currently outroing
     * @type {Set<Key>}
     */
    N(this, Yt, /* @__PURE__ */ new Set());
    /**
     * Whether to pause (i.e. outro) on change, or destroy immediately.
     * This is necessary for `<svelte:element>`
     */
    N(this, ar, !0);
    /**
     * @param {Batch} batch
     */
    N(this, or, (e) => {
      if (u(this, De).has(e)) {
        var n = (
          /** @type {Key} */
          u(this, De).get(e)
        ), i = u(this, We).get(n);
        if (i)
          ji(i), u(this, Yt).delete(n);
        else {
          var r = u(this, _e).get(n);
          r && (u(this, We).set(n, r.effect), u(this, _e).delete(n), r.fragment.lastChild.remove(), this.anchor.before(r.fragment), i = r.effect);
        }
        for (const [s, a] of u(this, De)) {
          if (u(this, De).delete(s), s === e)
            break;
          const o = u(this, _e).get(a);
          o && (se(o.effect), u(this, _e).delete(a));
        }
        for (const [s, a] of u(this, We)) {
          if (s === n || u(this, Yt).has(s)) continue;
          const o = () => {
            if (Array.from(u(this, De).values()).includes(s)) {
              var c = document.createDocumentFragment();
              Fi(a, c), c.append(Te()), u(this, _e).set(s, { effect: a, fragment: c });
            } else
              se(a);
            u(this, Yt).delete(s), u(this, We).delete(s);
          };
          u(this, ar) || !i ? (u(this, Yt).add(s), Kt(a, o, !1)) : o();
        }
      }
    });
    /**
     * @param {Batch} batch
     */
    N(this, Fr, (e) => {
      u(this, De).delete(e);
      const n = Array.from(u(this, De).values());
      for (const [i, r] of u(this, _e))
        n.includes(i) || (se(r.effect), u(this, _e).delete(i));
    });
    this.anchor = e, R(this, ar, n);
  }
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(e, n) {
    var i = (
      /** @type {Batch} */
      x
    ), r = xa();
    if (n && !u(this, We).has(e) && !u(this, _e).has(e))
      if (r) {
        var s = document.createDocumentFragment(), a = Te();
        s.append(a), u(this, _e).set(e, {
          effect: Oe(() => n(a)),
          fragment: s
        });
      } else
        u(this, We).set(
          e,
          Oe(() => n(this.anchor))
        );
    if (u(this, De).set(i, e), r) {
      for (const [o, l] of u(this, We))
        o === e ? i.unskip_effect(l) : i.skip_effect(l);
      for (const [o, l] of u(this, _e))
        o === e ? i.unskip_effect(l.effect) : i.skip_effect(l.effect);
      i.oncommit(u(this, or)), i.ondiscard(u(this, Fr));
    } else
      L && (this.anchor = I), u(this, or).call(this, i);
  }
}
De = new WeakMap(), We = new WeakMap(), _e = new WeakMap(), Yt = new WeakMap(), ar = new WeakMap(), or = new WeakMap(), Fr = new WeakMap();
function Va(t) {
  le === null && _l(), bn(() => {
    const e = Me(t);
    if (typeof e == "function") return (
      /** @type {() => void} */
      e
    );
  });
}
function vt(t, e, n = !1) {
  var i;
  L && (i = I, Tn());
  var r = new uc(t), s = n ? xn : 0;
  function a(o, l) {
    if (L) {
      var c = na(
        /** @type {TemplateNode} */
        i
      );
      if (o !== parseInt(c.substring(1))) {
        var d = Ir();
        ee(d), r.anchor = d, Fe(!1), r.ensure(o, l), Fe(!0);
        return;
      }
    }
    r.ensure(o, l);
  }
  Mi(() => {
    var o = !1;
    e((l, c = 0) => {
      o = !0, a(c, l);
    }), o || a(-1, null);
  }, s);
}
function hc(t, e, n) {
  for (var i = [], r = e.length, s, a = e.length, o = 0; o < r; o++) {
    let f = e[o];
    Kt(
      f,
      () => {
        if (s) {
          if (s.pending.delete(f), s.done.add(f), s.pending.size === 0) {
            var b = (
              /** @type {Set<EachOutroGroup>} */
              t.outrogroups
            );
            wi(t, qr(s.done)), b.delete(s), b.size === 0 && (t.outrogroups = null);
          }
        } else
          a -= 1;
      },
      !1
    );
  }
  if (a === 0) {
    var l = i.length === 0 && n !== null;
    if (l) {
      var c = (
        /** @type {Element} */
        n
      ), d = (
        /** @type {Element} */
        c.parentNode
      );
      Sa(d), d.append(c), t.items.clear();
    }
    wi(t, e, !l);
  } else
    s = {
      pending: new Set(e),
      done: /* @__PURE__ */ new Set()
    }, (t.outrogroups ?? (t.outrogroups = /* @__PURE__ */ new Set())).add(s);
}
function wi(t, e, n = !0) {
  var i;
  if (t.pending.size > 0) {
    i = /* @__PURE__ */ new Set();
    for (const a of t.pending.values())
      for (const o of a)
        i.add(
          /** @type {EachItem} */
          t.items.get(o).e
        );
  }
  for (var r = 0; r < e.length; r++) {
    var s = e[r];
    if (i != null && i.has(s)) {
      s.f |= lt;
      const a = document.createDocumentFragment();
      Fi(s, a);
    } else
      se(e[r], n);
  }
}
var bs;
function fc(t, e, n, i, r, s = null) {
  var a = t, o = /* @__PURE__ */ new Map();
  {
    var l = (
      /** @type {Element} */
      t
    );
    a = L ? ee(/* @__PURE__ */ Se(l)) : l.appendChild(Te());
  }
  L && Tn();
  var c = null, d = /* @__PURE__ */ zl(() => {
    var g = n();
    return Qs(g) ? g : g == null ? [] : qr(g);
  }), f, b = /* @__PURE__ */ new Map(), m = !0;
  function _(g) {
    (v.effect.f & ve) === 0 && (v.pending.delete(g), v.fallback = c, pc(v, f, a, e, i), c !== null && (f.length === 0 ? (c.f & lt) === 0 ? ji(c) : (c.f ^= lt, Gn(c, null, a)) : Kt(c, () => {
      c = null;
    })));
  }
  function $(g) {
    v.pending.delete(g);
  }
  var h = Mi(() => {
    f = /** @type {V[]} */
    p(d);
    var g = f.length;
    let w = !1;
    if (L) {
      var T = na(a) === Si;
      T !== (g === 0) && (a = Ir(), ee(a), Fe(!1), w = !0);
    }
    for (var O = /* @__PURE__ */ new Set(), C = (
      /** @type {Batch} */
      x
    ), M = xa(), W = 0; W < g; W += 1) {
      L && I.nodeType === Ln && /** @type {Comment} */
      I.data === xi && (a = /** @type {Comment} */
      I, w = !0, Fe(!1));
      var me = f[W], kt = i(me, W), de = m ? null : o.get(kt);
      de ? (de.v && Cn(de.v, me), de.i && Cn(de.i, W), M && C.unskip_effect(de.e)) : (de = _c(
        o,
        m ? a : bs ?? (bs = Te()),
        me,
        kt,
        W,
        r,
        e,
        n
      ), m || (de.e.f |= lt), o.set(kt, de)), O.add(kt);
    }
    if (g === 0 && s && !c && (m ? c = Oe(() => s(a)) : (c = Oe(() => s(bs ?? (bs = Te()))), c.f |= lt)), g > O.size && gl(), L && g > 0 && ee(Ir()), !m)
      if (b.set(C, O), M) {
        for (const [fr, ln] of o)
          O.has(fr) || C.skip_effect(ln.e);
        C.oncommit(_), C.ondiscard($);
      } else
        _(C);
    w && Fe(!0), p(d);
  }), v = { effect: h, items: o, pending: b, outrogroups: null, fallback: c };
  m = !1, L && (a = I);
}
function Fn(t) {
  for (; t !== null && (t.f & Ge) === 0; )
    t = t.next;
  return t;
}
function pc(t, e, n, i, r) {
  var W;
  var s = e.length, a = t.items, o = Fn(t.effect.first), l, c = null, d = [], f = [], b, m, _, $;
  for ($ = 0; $ < s; $ += 1) {
    if (b = e[$], m = r(b, $), _ = /** @type {EachItem} */
    a.get(m).e, t.outrogroups !== null)
      for (const me of t.outrogroups)
        me.pending.delete(_), me.done.delete(_);
    if ((_.f & ie) !== 0 && ji(_), (_.f & lt) !== 0)
      if (_.f ^= lt, _ === o)
        Gn(_, null, n);
      else {
        var h = c ? c.next : o;
        _ === t.effect.last && (t.effect.last = _.prev), _.prev && (_.prev.next = _.next), _.next && (_.next.prev = _.prev), ft(t, c, _), ft(t, _, h), Gn(_, h, n), c = _, d = [], f = [], o = Fn(c.next);
        continue;
      }
    if (_ !== o) {
      if (l !== void 0 && l.has(_)) {
        if (d.length < f.length) {
          var v = f[0], g;
          c = v.prev;
          var w = d[0], T = d[d.length - 1];
          for (g = 0; g < d.length; g += 1)
            Gn(d[g], v, n);
          for (g = 0; g < f.length; g += 1)
            l.delete(f[g]);
          ft(t, w.prev, T.next), ft(t, c, w), ft(t, T, v), o = v, c = T, $ -= 1, d = [], f = [];
        } else
          l.delete(_), Gn(_, o, n), ft(t, _.prev, _.next), ft(t, _, c === null ? t.effect.first : c.next), ft(t, c, _), c = _;
        continue;
      }
      for (d = [], f = []; o !== null && o !== _; )
        (l ?? (l = /* @__PURE__ */ new Set())).add(o), f.push(o), o = Fn(o.next);
      if (o === null)
        continue;
    }
    (_.f & lt) === 0 && d.push(_), c = _, o = Fn(_.next);
  }
  if (t.outrogroups !== null) {
    for (const me of t.outrogroups)
      me.pending.size === 0 && (wi(t, qr(me.done)), (W = t.outrogroups) == null || W.delete(me));
    t.outrogroups.size === 0 && (t.outrogroups = null);
  }
  if (o !== null || l !== void 0) {
    var O = [];
    if (l !== void 0)
      for (_ of l)
        (_.f & ie) === 0 && O.push(_);
    for (; o !== null; )
      (o.f & ie) === 0 && o !== t.fallback && O.push(o), o = Fn(o.next);
    var C = O.length;
    if (C > 0) {
      var M = s === 0 ? n : null;
      hc(t, O, M);
    }
  }
}
function _c(t, e, n, i, r, s, a, o) {
  var l = (a & Ko) !== 0 ? (a & Qo) === 0 ? /* @__PURE__ */ wa(n, !1, !1) : tn(n) : null, c = (a & Xo) !== 0 ? tn(r) : null;
  return {
    v: l,
    i: c,
    e: Oe(() => (s(e, l ?? n, c ?? r, o), () => {
      t.delete(i);
    }))
  };
}
function Gn(t, e, n) {
  if (t.nodes)
    for (var i = t.nodes.start, r = t.nodes.end, s = e && (e.f & lt) === 0 ? (
      /** @type {EffectNodes} */
      e.nodes.start
    ) : n; i !== null; ) {
      var a = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Ue(i)
      );
      if (s.before(i), i === r)
        return;
      i = a;
    }
}
function ft(t, e, n) {
  e === null ? t.effect.first = n : e.next = n, n === null ? t.effect.last = e : n.prev = e;
}
function vc(t, e, n = !1, i = !1, r = !1, s = !1) {
  var a = t, o = "";
  if (n) {
    var l = (
      /** @type {Element} */
      t
    );
    L && (a = ee(/* @__PURE__ */ Se(l)));
  }
  et(() => {
    var c = (
      /** @type {Effect} */
      k
    );
    if (o === (o = e() ?? "")) {
      L && Tn();
      return;
    }
    if (n && !L) {
      c.nodes = null, l.innerHTML = /** @type {string} */
      o, o !== "" && ct(
        /** @type {TemplateNode} */
        /* @__PURE__ */ Se(l),
        /** @type {TemplateNode} */
        l.lastChild
      );
      return;
    }
    if (c.nodes !== null && (Ia(
      c.nodes.start,
      /** @type {TemplateNode} */
      c.nodes.end
    ), c.nodes = null), o !== "") {
      if (L) {
        I.data;
        for (var d = Tn(), f = d; d !== null && (d.nodeType !== Ln || /** @type {Comment} */
        d.data !== ""); )
          f = d, d = /* @__PURE__ */ Ue(d);
        if (d === null)
          throw lr(), Zt;
        ct(I, f), a = ee(d);
        return;
      }
      var b = i ? tl : r ? nl : void 0, m = (
        /** @type {HTMLTemplateElement | SVGElement | MathMLElement} */
        Br(i ? "svg" : r ? "math" : "template", b)
      );
      m.innerHTML = /** @type {any} */
      o;
      var _ = i || r ? m : (
        /** @type {HTMLTemplateElement} */
        m.content
      );
      if (ct(
        /** @type {TemplateNode} */
        /* @__PURE__ */ Se(_),
        /** @type {TemplateNode} */
        _.lastChild
      ), i || r)
        for (; /* @__PURE__ */ Se(_); )
          a.before(
            /** @type {TemplateNode} */
            /* @__PURE__ */ Se(_)
          );
      else
        a.before(_);
    }
  });
}
function Wa(t, e) {
  Ca(() => {
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
      const r = Br("style");
      r.id = e.hash, r.textContent = e.code, i.appendChild(r);
    }
  });
}
function gc(t, e, n) {
  var i = t == null ? "" : "" + t;
  return e && (i = i ? i + " " + e : e), i === "" ? null : i;
}
function mc(t, e) {
  return t == null ? null : String(t);
}
function ke(t, e, n, i, r, s) {
  var a = t.__className;
  if (L || a !== n || a === void 0) {
    var o = gc(n, i);
    (!L || o !== t.getAttribute("class")) && (o == null ? t.removeAttribute("class") : t.className = o), t.__className = n;
  }
  return s;
}
function gt(t, e, n, i) {
  var r = t.__style;
  if (L || r !== e) {
    var s = mc(e);
    (!L || s !== t.getAttribute("style")) && (s == null ? t.removeAttribute("style") : t.style.cssText = s), t.__style = e;
  }
  return i;
}
const bc = Symbol("is custom element"), yc = Symbol("is html"), wc = pl ? "link" : "LINK";
function Ya(t, e, n, i) {
  var r = Ec(t);
  L && (r[e] = t.getAttribute(e), e === "src" || e === "srcset" || e === "href" && t.nodeName === wc) || r[e] !== (r[e] = n) && (e === "loading" && (t[fl] = n), n == null ? t.removeAttribute(e) : typeof n != "string" && Ja(t).includes(e) ? t[e] = n : t.setAttribute(e, n));
}
function ys(t, e, n) {
  var i = P, r = k;
  let s = L;
  L && Fe(!1), ce(null), Ce(null);
  try {
    // `style` should use `set_attribute` rather than the setter
    e !== "style" && // Don't compute setters for custom elements while they aren't registered yet,
    // because during their upgrade/instantiation they might add more setters.
    // Instead, fall back to a simple "an object, then set as property" heuristic.
    (Ei.has(t.getAttribute("is") || t.nodeName) || // customElements may not be available in browser extension contexts
    !customElements || customElements.get(t.getAttribute("is") || t.nodeName.toLowerCase()) ? Ja(t).includes(e) : n && typeof n == "object") ? t[e] = n : Ya(t, e, n == null ? n : String(n));
  } finally {
    ce(i), Ce(r), s && Fe(!0);
  }
}
function Ec(t) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    t.__attributes ?? (t.__attributes = {
      [bc]: t.nodeName.includes("-"),
      [yc]: t.namespaceURI === Xs
    })
  );
}
var Ei = /* @__PURE__ */ new Map();
function Ja(t) {
  var e = t.getAttribute("is") || t.nodeName, n = Ei.get(e);
  if (n) return n;
  Ei.set(e, n = []);
  for (var i, r = t, s = Element.prototype; s !== r; ) {
    i = sl(r);
    for (var a in i)
      i[a].set && n.push(a);
    r = Zs(r);
  }
  return n;
}
function ws(t, e) {
  return t === e || (t == null ? void 0 : t[gr]) === e;
}
function mt(t = {}, e, n, i) {
  var r = (
    /** @type {ComponentContext} */
    le.r
  ), s = (
    /** @type {Effect} */
    k
  );
  return Ca(() => {
    var a, o;
    return Di(() => {
      a = o, o = [], Me(() => {
        t !== n(...o) && (e(t, ...o), a && ws(n(...a), t) && e(null, ...a));
      });
    }), () => {
      let l = s;
      for (; l !== r && l.parent !== null && l.parent.f & ci; )
        l = l.parent;
      const c = () => {
        o && ws(n(...o), t) && e(null, ...o);
      }, d = l.teardown;
      l.teardown = () => {
        c(), d == null || d();
      };
    };
  }), t;
}
function Pe(t, e, n, i) {
  var r = (
    /** @type {V} */
    i
  ), s = !0, a = () => (s && (s = !1, r = /** @type {V} */
  i), r), o;
  o = /** @type {V} */
  t[e], o === void 0 && i !== void 0 && (o = a());
  var l;
  l = () => {
    var b = (
      /** @type {V} */
      t[e]
    );
    return b === void 0 ? a() : (s = !0, b);
  };
  var c = !1, d = /* @__PURE__ */ zr(() => (c = !1, l())), f = (
    /** @type {Effect} */
    k
  );
  return (
    /** @type {() => V} */
    (function(b, m) {
      if (arguments.length > 0) {
        const _ = m ? p(d) : b;
        return S(d, _), c = !0, r !== void 0 && (r = _), b;
      }
      return dt && c || (f.f & ve) !== 0 ? d.v : p(d);
    })
  );
}
function $c(t) {
  return new Ac(t);
}
var ot, $e;
class Ac {
  /**
   * @param {ComponentConstructorOptions & {
   *  component: any;
   * }} options
   */
  constructor(e) {
    /** @type {any} */
    N(this, ot);
    /** @type {Record<string, any>} */
    N(this, $e);
    var s;
    var n = /* @__PURE__ */ new Map(), i = (a, o) => {
      var l = /* @__PURE__ */ wa(o, !1, !1);
      return n.set(a, l), l;
    };
    const r = new Proxy(
      { ...e.props || {}, $$events: {} },
      {
        get(a, o) {
          return p(n.get(o) ?? i(o, Reflect.get(a, o)));
        },
        has(a, o) {
          return o === hl ? !0 : (p(n.get(o) ?? i(o, Reflect.get(a, o))), Reflect.has(a, o));
        },
        set(a, o, l) {
          return S(n.get(o) ?? i(o, l), l), Reflect.set(a, o, l);
        }
      }
    );
    R(this, $e, (e.hydrate ? cc : za)(e.component, {
      target: e.target,
      anchor: e.anchor,
      props: r,
      context: e.context,
      intro: e.intro ?? !1,
      recover: e.recover,
      transformError: e.transformError
    })), (!((s = e == null ? void 0 : e.props) != null && s.$$host) || e.sync === !1) && Ae(), R(this, ot, r.$$events);
    for (const a of Object.keys(u(this, $e)))
      a === "$set" || a === "$destroy" || a === "$on" || Rr(this, a, {
        get() {
          return u(this, $e)[a];
        },
        /** @param {any} value */
        set(o) {
          u(this, $e)[a] = o;
        },
        enumerable: !0
      });
    u(this, $e).$set = /** @param {Record<string, any>} next */
    (a) => {
      Object.assign(r, a);
    }, u(this, $e).$destroy = () => {
      dc(u(this, $e));
    };
  }
  /** @param {Record<string, any>} props */
  $set(e) {
    u(this, $e).$set(e);
  }
  /**
   * @param {string} event
   * @param {(...args: any[]) => any} callback
   * @returns {any}
   */
  $on(e, n) {
    u(this, ot)[e] = u(this, ot)[e] || [];
    const i = (...r) => n.call(this, ...r);
    return u(this, ot)[e].push(i), () => {
      u(this, ot)[e] = u(this, ot)[e].filter(
        /** @param {any} fn */
        (r) => r !== i
      );
    };
  }
  $destroy() {
    u(this, $e).$destroy();
  }
}
ot = new WeakMap(), $e = new WeakMap();
let Ka;
typeof HTMLElement == "function" && (Ka = class extends HTMLElement {
  /**
   * @param {*} $$componentCtor
   * @param {*} $$slots
   * @param {ShadowRootInit | undefined} shadow_root_init
   */
  constructor(e, n, i) {
    super();
    /** The Svelte component constructor */
    F(this, "$$ctor");
    /** Slots */
    F(this, "$$s");
    /** @type {any} The Svelte component instance */
    F(this, "$$c");
    /** Whether or not the custom element is connected */
    F(this, "$$cn", !1);
    /** @type {Record<string, any>} Component props data */
    F(this, "$$d", {});
    /** `true` if currently in the process of reflecting component props back to attributes */
    F(this, "$$r", !1);
    /** @type {Record<string, CustomElementPropDefinition>} Props definition (name, reflected, type etc) */
    F(this, "$$p_d", {});
    /** @type {Record<string, EventListenerOrEventListenerObject[]>} Event listeners */
    F(this, "$$l", {});
    /** @type {Map<EventListenerOrEventListenerObject, Function>} Event listener unsubscribe functions */
    F(this, "$$l_u", /* @__PURE__ */ new Map());
    /** @type {any} The managed render effect for reflecting attributes */
    F(this, "$$me");
    /** @type {ShadowRoot | null} The ShadowRoot of the custom element */
    F(this, "$$shadowRoot", null);
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
        return (s) => {
          const a = Br("slot");
          r !== "default" && (a.name = r), ye(s, a);
        };
      };
      if (await Promise.resolve(), !this.$$cn || this.$$c)
        return;
      const n = {}, i = Oc(this);
      for (const r of this.$$s)
        r in i && (r === "default" && !this.$$d.children ? (this.$$d.children = e(r), n.default = !0) : n[r] = e(r));
      for (const r of this.attributes) {
        const s = this.$$g_p(r.name);
        s in this.$$d || (this.$$d[s] = Or(s, r.value, this.$$p_d, "toProp"));
      }
      for (const r in this.$$p_d)
        !(r in this.$$d) && this[r] !== void 0 && (this.$$d[r] = this[r], delete this[r]);
      this.$$c = $c({
        component: this.$$ctor,
        target: this.$$shadowRoot || this,
        props: {
          ...this.$$d,
          $$slots: n,
          $$host: this
        }
      }), this.$$me = Xl(() => {
        Di(() => {
          var r;
          this.$$r = !0;
          for (const s of Cr(this.$$c)) {
            if (!((r = this.$$p_d[s]) != null && r.reflect)) continue;
            this.$$d[s] = this.$$c[s];
            const a = Or(
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
      for (const r in this.$$l)
        for (const s of this.$$l[r]) {
          const a = this.$$c.$on(r, s);
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
  attributeChangedCallback(e, n, i) {
    var r;
    this.$$r || (e = this.$$g_p(e), this.$$d[e] = Or(e, i, this.$$p_d, "toProp"), (r = this.$$c) == null || r.$set({ [e]: this.$$d[e] }));
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
    return Cr(this.$$p_d).find(
      (n) => this.$$p_d[n].attribute === e || !this.$$p_d[n].attribute && n.toLowerCase() === e
    ) || e;
  }
});
function Or(t, e, n, i) {
  var s;
  const r = (s = n[t]) == null ? void 0 : s.type;
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
function Oc(t) {
  const e = {};
  return t.childNodes.forEach((n) => {
    e[
      /** @type {Element} node */
      n.slot || "default"
    ] = !0;
  }), e;
}
function Xa(t, e, n, i, r, s) {
  let a = class extends Ka {
    constructor() {
      super(t, n, r), this.$$p_d = e;
    }
    static get observedAttributes() {
      return Cr(e).map(
        (o) => (e[o].attribute || o).toLowerCase()
      );
    }
  };
  return Cr(e).forEach((o) => {
    Rr(a.prototype, o, {
      get() {
        return this.$$c && o in this.$$c ? this.$$c[o] : this.$$d[o];
      },
      set(l) {
        var f;
        l = Or(o, l, e), this.$$d[o] = l;
        var c = this.$$c;
        if (c) {
          var d = (f = gn(c, o)) == null ? void 0 : f.get;
          d ? c[o] = l : c.$set({ [o]: l });
        }
      }
    });
  }), i.forEach((o) => {
    Rr(a.prototype, o, {
      get() {
        var l;
        return (l = this.$$c) == null ? void 0 : l[o];
      }
    });
  }), s && (a = s(a)), t.element = /** @type {any} */
  a, a;
}
class qi extends Error {
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  constructor(e, ...n) {
    super(...n), Error.captureStackTrace && Error.captureStackTrace(this, qi), this.name = "TimeoutError", this.timeout = e, this.message = `Timed out in ${e} ms.`;
  }
}
const Sc = (t, e) => {
  const n = new Promise((i, r) => {
    setTimeout(() => {
      r(new qi(t));
    }, t);
  });
  return Promise.race([e, n]);
}, Qa = (t) => {
  if (typeof t.getCardSize == "function")
    try {
      return Sc(500, t.getCardSize()).catch(
        () => 1
      );
    } catch {
      return 1;
    }
  return customElements.get(t.localName) ? 1 : customElements.whenDefined(t.localName).then(() => Qa(t));
};
var xc = /* @__PURE__ */ ut('<span class="loading svelte-lv9s7p">Loading...</span>'), Tc = /* @__PURE__ */ ut("<div><!></div>");
const Nc = {
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
function $i(t, e) {
  Ti(e, !0), Wa(t, Nc);
  const n = Pe(e, "config"), i = Pe(e, "hass"), r = Pe(e, "preview"), s = Pe(e, "marginTop", 7, "0px"), a = Pe(e, "open"), o = Pe(e, "animation", 7, !0), l = Pe(e, "animationState"), c = Pe(e, "clearCardCss", 7, !1);
  let d = null, f = /* @__PURE__ */ H(null), b = /* @__PURE__ */ H(!0), m = /* @__PURE__ */ H(0);
  const _ = Me(() => JSON.parse(JSON.stringify(n())));
  bn(() => {
    p(f) && (p(f).hass = i());
  }), bn(() => {
    p(f) && r() !== void 0 && (p(f).preview = r());
  }), bn(() => {
    var w;
    p(f) && (_.disabled = !a(), (w = p(f)._element) == null || w.dispatchEvent(new CustomEvent("card-visibility-changed", { detail: { value: a() }, bubbles: !0, composed: !1 })));
  }), Va(async () => {
    const w = document.createElement("hui-card");
    w.hass = i(), w.preview = r(), _.disabled = !a(), w.config = _, w.load(), d == null || d.appendChild(w), S(f, w, !0), S(b, !1), p(f).addEventListener(
      "ll-upgrade",
      (T) => {
        var O;
        T.stopPropagation(), (O = p(f)) != null && O._element && i() && (p(f)._element.hass = i());
      },
      { capture: !0 }
    ), c() && (w.style.setProperty("--ha-card-background", "transparent"), w.style.setProperty("--ha-card-box-shadow", "none"), w.style.setProperty("--ha-card-border-color", "transparent"), w.style.setProperty("--ha-card-border-width", "0px"), w.style.setProperty("--ha-card-backdrop-filter", "none")), o() && (S(m, await Qa(w) * 56), d && S(m, p(m) + (window.getComputedStyle(d).marginTop ? parseFloat(window.getComputedStyle(d).marginTop) : 0)), new ResizeObserver((O) => {
      for (const C of O)
        if (C.contentBoxSize) {
          const M = Array.isArray(C.contentBoxSize) ? C.contentBoxSize[0] : C.contentBoxSize;
          M.blockSize && (S(m, M.blockSize, !0), p(f) && S(m, p(m) + (window.getComputedStyle(p(f)).marginTop ? parseFloat(window.getComputedStyle(p(f)).marginTop) : 0)));
        } else C.contentRect && (S(m, C.contentRect.height, !0), p(f) && S(m, p(m) + (window.getComputedStyle(p(f)).marginTop ? parseFloat(window.getComputedStyle(p(f)).marginTop) : 0)));
    }).observe(w));
  });
  var $ = {
    get config() {
      return n();
    },
    set config(w) {
      n(w), Ae();
    },
    get hass() {
      return i();
    },
    set hass(w) {
      i(w), Ae();
    },
    get preview() {
      return r();
    },
    set preview(w) {
      r(w), Ae();
    },
    get marginTop() {
      return s();
    },
    set marginTop(w = "0px") {
      s(w), Ae();
    },
    get open() {
      return a();
    },
    set open(w) {
      a(w), Ae();
    },
    get animation() {
      return o();
    },
    set animation(w = !0) {
      o(w), Ae();
    },
    get animationState() {
      return l();
    },
    set animationState(w) {
      l(w), Ae();
    },
    get clearCardCss() {
      return c();
    },
    set clearCardCss(w = !1) {
      c(w), Ae();
    }
  }, h = Tc(), v = _t(h);
  {
    var g = (w) => {
      var T = xc();
      ye(w, T);
    };
    vt(v, (w) => {
      p(b) && w(g);
    });
  }
  return Ze(h), mt(h, (w) => d = w, () => d), et(() => {
    ke(h, 1, `outer-container${a() ? " open" : " close"}${o() ? " animation " + l() : ""}`, "svelte-lv9s7p"), gt(h, `--child-card-margin-top: ${(a() ? s() : "0px") ?? ""};${p(m) ? ` --expander-animation-height: -${p(m)}px;` : ""}`);
  }), ye(t, h), Ni($);
}
customElements.define("expander-sub-card", Xa(
  $i,
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
const Cc = (t, e) => {
  var n;
  (n = t.dispatchEvent) == null || n.call(
    t,
    new CustomEvent(
      "haptic",
      { detail: e, bubbles: !0, composed: !0 }
    )
  );
};
var dr = function(t, e, n) {
  var i;
  n === void 0 && (n = {});
  var r = n.retries, s = r === void 0 ? 10 : r, a = n.delay, o = a === void 0 ? 10 : a, l = n.shouldReject, c = l === void 0 || l, d = (i = n.rejectMessage) !== null && i !== void 0 ? i : "Could not get the result after {{ retries }} retries";
  return new Promise((function(f, b) {
    var m = 0, _ = function() {
      var $ = t();
      e($) ? f($) : ++m < s ? setTimeout(_, o) : c ? b(new Error(d.replace(/\{\{\s*retries\s*\}\}/g, "".concat(s)))) : f($);
    };
    _();
  }));
};
const ni = "[home-assistant-javascript-templates]", Rc = /^([a-z_]+)\.(\w+)$/;
var Lr, vn, He, bt;
(function(t) {
  t.UNKNOWN = "unknown", t.UNAVAILABLE = "unavailable";
})(Lr || (Lr = {})), (function(t) {
  t.AREA_ID = "area_id", t.NAME = "name";
})(vn || (vn = {})), (function(t) {
  t.PANEL_URL = "panel_url", t.LANG = "lang";
})(He || (He = {})), (function(t) {
  t.LOCATION_CHANGED = "location-changed", t.TRANSLATIONS_UPDATED = "translations-updated", t.POPSTATE = "popstate", t.SUBSCRIBE_EVENTS = "subscribe_events", t.STATE_CHANGE_EVENT = "state_changed";
})(bt || (bt = {}));
const Ic = "refs", Es = (t) => t.reduce((e, n) => {
  const [i, r] = n;
  return e[i.replace(Rc, "$2")] = r, e;
}, {}), pt = (t) => t.includes("."), Sr = "ref", Ht = "value", $s = "toJSON", As = (t) => `${Sr}.${t}`;
function kc(t, e, n) {
  const i = () => Object.entries(t.hass.areas), r = () => Object.entries(t.hass.devices), s = () => Object.entries(t.hass.entities), a = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map(), l = (h, v) => {
    n && console.warn(`${h} ${v} used in a JavaScript template doesn't exist`);
  }, c = (h) => l("Entity", h), d = (h) => l("Domain", h), f = (h) => {
    const v = new SyntaxError(h);
    if (e) throw v;
    n && console.warn(v);
  }, b = (h) => {
    t.hass.states[h] ? a.add(h) : c(h);
  }, m = (h) => {
    a.add(h);
  }, _ = (h, v) => {
    const { with_unit: g = !1, rounded: w = !1 } = v;
    if (h) {
      const T = h.state, O = h.attributes.unit_of_measurement, C = Number(w), M = w === !1 || isNaN(Number(T)) ? T : new Intl.NumberFormat(t.hass.language, { minimumFractionDigits: C, maximumFractionDigits: C }).format(Number(T));
      return g && O ? `${M} ${O}` : M;
    }
  }, $ = (h) => new Proxy(h, { get: (v, g) => g === "state_with_unit" ? _(v, { rounded: !0, with_unit: !0 }) : v[g] });
  return { get hass() {
    return t.hass;
  }, states: new Proxy((h, v = {}) => {
    if (pt(h)) return b(h), _(t.hass.states[h], v);
    throw SyntaxError(`${ni}: states method cannot be used with a domain, use it as an object instead.`);
  }, { get(h, v) {
    if (pt(v)) return b(v), $(t.hass.states[v]);
    const g = Object.entries(t.hass.states).filter(([w]) => w.startsWith(v));
    return g.length || d(v), new Proxy(Es(g), { get: (w, T) => (b(`${v}.${T}`), $(w[T])) });
  } }), state_translated(h) {
    if (b(h), t.hass.states[h]) return t.hass.formatEntityState(t.hass.states[h]);
  }, is_state(h, v) {
    var g;
    return b(h), Array.isArray(v) ? v.some((w) => {
      var T;
      return ((T = t.hass.states[h]) === null || T === void 0 ? void 0 : T.state) === w;
    }) : ((g = t.hass.states[h]) === null || g === void 0 ? void 0 : g.state) === v;
  }, state_attr(h, v) {
    var g, w;
    return b(h), (w = (g = t.hass.states[h]) === null || g === void 0 ? void 0 : g.attributes) === null || w === void 0 ? void 0 : w[v];
  }, is_state_attr(h, v, g) {
    return this.state_attr(h, v) === g;
  }, has_value(h) {
    return this.states(h) ? !(this.is_state(h, Lr.UNKNOWN) || this.is_state(h, Lr.UNAVAILABLE)) : (c(h), !1);
  }, entities: new Proxy((h) => {
    if (h === void 0) return t.hass.entities;
    if (pt(h)) return b(h), t.hass.entities[h];
    const v = s().filter(([g]) => g.startsWith(h));
    return v.length || d(h), new Proxy(Es(v), { get: (g, w) => (b(`${h}.${w}`), g[w]) });
  }, { get: (h, v) => h(v) }), entity_prop(h, v) {
    var g;
    return b(h), (g = t.hass.entities[h]) === null || g === void 0 ? void 0 : g[v];
  }, is_entity_prop(h, v, g) {
    return this.entity_prop(h, v) === g;
  }, devices: new Proxy((h) => {
    if (h === void 0) return t.hass.devices;
    if (pt(h)) throw SyntaxError(`${ni}: devices method cannot be used with an entity id, you should use a device id instead.`);
    return t.hass.devices[h];
  }, { get(h, v) {
    if (pt(v)) throw SyntaxError(`${ni}: devices cannot be accesed using an entity id, you should use a device id instead.`);
    return t.hass.devices[v];
  } }), device_attr(h, v) {
    var g, w, T;
    if (pt(h)) {
      b(h);
      const O = (g = t.hass.entities[h]) === null || g === void 0 ? void 0 : g.device_id;
      return (w = t.hass.devices[O]) === null || w === void 0 ? void 0 : w[v];
    }
    return (T = t.hass.devices[h]) === null || T === void 0 ? void 0 : T[v];
  }, is_device_attr(h, v, g) {
    return this.device_attr(h, v) === g;
  }, device_id(h) {
    var v;
    if (pt(h)) return b(h), (v = t.hass.entities[h]) === null || v === void 0 ? void 0 : v.device_id;
    const g = r().find((w) => w[1].name === h);
    return g == null ? void 0 : g[0];
  }, device_name(h) {
    var v, g, w, T, O;
    if (pt(h)) {
      b(h);
      const C = (v = t.hass.entities[h]) === null || v === void 0 ? void 0 : v.device_id;
      return (w = (g = t.hass.devices[C]) === null || g === void 0 ? void 0 : g.name) !== null && w !== void 0 ? w : void 0;
    }
    return (O = (T = t.hass.devices[h]) === null || T === void 0 ? void 0 : T.name) !== null && O !== void 0 ? O : void 0;
  }, areas: () => i().map(([, h]) => h.area_id), area_id(h) {
    var v, g;
    if (h in t.hass.devices) return this.device_attr(h, vn.AREA_ID);
    const w = (v = t.hass.entities[h]) === null || v === void 0 ? void 0 : v.device_id;
    if (w) return this.device_attr(w, vn.AREA_ID);
    const T = i().find(([, O]) => O.name === h);
    return (g = T == null ? void 0 : T[1]) === null || g === void 0 ? void 0 : g.area_id;
  }, area_name(h) {
    var v, g;
    let w;
    h in t.hass.devices && (w = this.device_attr(h, vn.AREA_ID));
    const T = (v = t.hass.entities[h]) === null || v === void 0 ? void 0 : v.device_id;
    T && (w = this.device_attr(T, vn.AREA_ID));
    const O = i().find(([, C]) => C.area_id === h || C.area_id === w);
    return (g = O == null ? void 0 : O[1]) === null || g === void 0 ? void 0 : g.name;
  }, area_entities(h) {
    const v = i().find(([, g]) => g.area_id === h || g.name === h);
    return v ? s().filter(([, g]) => g.area_id === v[1].area_id).map(([g]) => g) : [];
  }, area_devices(h) {
    const v = i().find(([, g]) => g.area_id === h || g.name === h);
    return v ? r().filter(([, g]) => g.area_id === v[1].area_id).map(([, g]) => g.id) : [];
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
  }, cleanTracked() {
    a.clear();
  }, ref(h, v, g = void 0) {
    const w = As(v);
    if (o.has(v)) return o.get(v);
    const T = new Proxy({ [Ht]: g, [$s]() {
      return this[Ht];
    } }, { get(O, C, M) {
      if (C === Ht || C === $s) return m(w), Reflect.get(O, C, M);
      f(`${C} is not a valid ${Sr} property. A ${Sr} only exposes a "${Ht}" property`);
    }, set(O, C, M) {
      if (C === Ht) {
        const W = O[Ht];
        return O[Ht] = M, h({ event_type: bt.STATE_CHANGE_EVENT, data: { entity_id: w, old_state: { state: JSON.stringify(W) }, new_state: { state: JSON.stringify(M) } } }), !0;
      }
      return f(`property "${C}" cannot be set in a ${Sr}`), !1;
    } });
    return o.set(v, T), T;
  }, unref(h, v) {
    const g = As(v);
    o.has(v) ? (o.delete(v), h(g)) : f(`${v} is not a ref or it has been unrefed already`);
  }, refs(h, v, g = {}) {
    const w = this.ref, T = this.unref, O = new Proxy(g, { get: (C, M) => w(h, M).value, set: (C, M, W) => (w(h, M).value = W, !0) });
    return Object.entries(g).forEach((C) => {
      const [M, W] = C;
      o.has(M) && T(v, M), w(h, M, W);
    }), O;
  }, cleanRefs(h) {
    Array.from(o.keys()).forEach((v) => {
      this.unref(h, v);
    });
  }, clientSideProxy: new Proxy({}, { get(h, v) {
    switch (Object.values(He).includes(v) && m(v), v) {
      case He.PANEL_URL:
        return window.location.pathname;
      case He.LANG:
        return t.hass.language;
    }
    n && console.warn(`clientSideProxy should only be used to access these variables: ${Object.values(He).join(", ")}`);
  } }) };
}
let Lc = class {
  constructor(e, n) {
    const { throwErrors: i = !1, throwWarnings: r = !0, variables: s = {}, refs: a = {}, refsVariableName: o = Ic, autoReturn: l = !0 } = n;
    this._throwErrors = i, this._throwWarnings = r, this._variables = s, this._refsVariableName = o, this._autoReturn = l, this._subscriptions = /* @__PURE__ */ new Map(), this._clientSideEntitiesRegExp = new RegExp(`(^|[ \\?(+:\\{\\[><,])(${Object.values(He).join("|")})($|[ \\?)+:\\}\\]><.,])`, "gm"), this._scopped = kc(e, i, r), this.refs = a, this._watchForPanelUrlChange(), this._watchForEntitiesChange(), this._watchForLanguageChange();
  }
  _executeRenderingFunctions(e) {
    this._subscriptions.get(e).forEach((n, i) => {
      n.forEach((r, s) => {
        this.trackTemplate(i, s, r);
      });
    });
  }
  _watchForPanelUrlChange() {
    window.addEventListener(bt.LOCATION_CHANGED, () => {
      this._panelUrlWatchCallback();
    }), window.addEventListener(bt.POPSTATE, () => {
      this._panelUrlWatchCallback();
    });
  }
  _panelUrlWatchCallback() {
    this._subscriptions.has(He.PANEL_URL) && this._executeRenderingFunctions(He.PANEL_URL);
  }
  _watchForEntitiesChange() {
    window.hassConnection.then((e) => {
      e.conn.subscribeMessage((n) => this._entityWatchCallback(n), { type: bt.SUBSCRIBE_EVENTS, event_type: bt.STATE_CHANGE_EVENT });
    });
  }
  _watchForLanguageChange() {
    window.addEventListener(bt.TRANSLATIONS_UPDATED, () => {
      this._subscriptions.has(He.LANG) && this._executeRenderingFunctions(He.LANG);
    });
  }
  _entityWatchCallback(e) {
    if (this._subscriptions.size) {
      const n = e.data.entity_id;
      this._subscriptions.has(n) && this._executeRenderingFunctions(n);
    }
  }
  _storeTracked(e, n, i) {
    this._scopped.tracked.forEach((r) => {
      const s = [n, i];
      if (this._subscriptions.has(r)) {
        const a = this._subscriptions.get(r);
        if (a.has(e)) {
          const o = a.get(e);
          o.has(n) || o.set(...s);
        } else a.set(e, new Map([s]));
      } else this._subscriptions.set(r, /* @__PURE__ */ new Map([[e, new Map([s])]]));
    });
  }
  _untrackTemplate(e, n) {
    this._subscriptions.forEach((i, r) => {
      if (i.has(e)) {
        const s = i.get(e);
        s.delete(n), s.size === 0 && (i.delete(e), i.size === 0 && this._subscriptions.delete(r));
      }
    });
  }
  renderTemplate(e, n = {}) {
    try {
      const { variables: i = {}, refs: r = {} } = n, s = new Map(Object.entries(Object.assign(Object.assign({}, this._variables), i))), a = e.trim().replace(this._clientSideEntitiesRegExp, "$1clientSide.$2$3"), o = a.includes("return") || !this._autoReturn ? a : `return ${a}`;
      return new Function("hass", "states", "state_translated", "is_state", "state_attr", "is_state_attr", "has_value", "entities", "entity_prop", "is_entity_prop", "devices", "device_attr", "is_device_attr", "device_id", "device_name", "areas", "area_id", "area_name", "area_entities", "area_devices", "user_name", "user_is_admin", "user_is_owner", "user_agent", "clientSide", "ref", "unref", this._refsVariableName, ...Array.from(s.keys()), `"use strict"; ${o}`)(this._scopped.hass, this._scopped.states, this._scopped.state_translated.bind(this._scopped), this._scopped.is_state.bind(this._scopped), this._scopped.state_attr.bind(this._scopped), this._scopped.is_state_attr.bind(this._scopped), this._scopped.has_value.bind(this._scopped), this._scopped.entities, this._scopped.entity_prop, this._scopped.is_entity_prop.bind(this._scopped), this._scopped.devices, this._scopped.device_attr.bind(this._scopped), this._scopped.is_device_attr.bind(this._scopped), this._scopped.device_id.bind(this._scopped), this._scopped.device_name.bind(this._scopped), this._scopped.areas.bind(this._scopped), this._scopped.area_id.bind(this._scopped), this._scopped.area_name.bind(this._scopped), this._scopped.area_entities.bind(this._scopped), this._scopped.area_devices.bind(this._scopped), this._scopped.user_name, this._scopped.user_is_admin, this._scopped.user_is_owner, this._scopped.user_agent, this._scopped.clientSideProxy, this._scopped.ref.bind(this._scopped, this._entityWatchCallback.bind(this)), this._scopped.unref.bind(this._scopped, this.cleanTracked.bind(this)), this._scopped.refs(this._entityWatchCallback.bind(this), this.cleanTracked.bind(this), r), ...Array.from(s.values()));
    } catch (i) {
      if (this._throwErrors) throw i;
      return void (this._throwWarnings && console.warn(i));
    }
  }
  trackTemplate(e, n, i = {}) {
    this._scopped.cleanTracked();
    const r = this.renderTemplate(e, i);
    return this._storeTracked(e, n, i), n(r), () => this._untrackTemplate(e, n);
  }
  cleanTracked(e) {
    e ? this._subscriptions.has(e) && this._subscriptions.delete(e) : this._subscriptions.clear();
  }
  get variables() {
    return this._variables;
  }
  set variables(e) {
    this._variables = e;
  }
  get refs() {
    return this._scopped.refs(this._entityWatchCallback.bind(this), this.cleanTracked.bind(this));
  }
  set refs(e) {
    this._scopped.cleanRefs(this.cleanTracked.bind(this)), this._scopped.refs(this._entityWatchCallback.bind(this), this.cleanTracked.bind(this), e);
  }
}, Pc = class {
  constructor(e, n = {}) {
    this._renderer = dr(() => e.hass, (i) => !!(i && i.areas && i.devices && i.entities && i.states && i.user), { retries: 100, delay: 50, rejectMessage: "The provided element doesn't contain a proper or initialised hass object" }).then(() => new Lc(e, n));
  }
  getRenderer() {
    return this._renderer;
  }
};
function Dc(t = {}, e = {}) {
  return new Pc(
    document.querySelector("home-assistant"),
    {
      autoReturn: !1,
      variables: t,
      refs: e,
      refsVariableName: "variables"
    }
  ).getRenderer();
}
function xr(t) {
  return !t || typeof t != "string" ? !1 : String(t).trim().startsWith("[[[") && String(t).trim().endsWith("]]]");
}
function Os(t, e, n, i = {}) {
  if (!xr(n))
    throw new Error("Not a valid JS template");
  return n = String(n).trim().slice(3, -3), t.then((r) => r.trackTemplate(n, e, { variables: i }));
}
function Ss(t, e, n) {
  t.then((i) => {
    i.refs[e] = n;
  });
}
function Mc(t, e) {
  t.then((n) => {
    const i = e.detail;
    Object.keys(i).forEach((r) => {
      const s = i[r].property, a = i[r].value, o = `${r}_${s}`;
      n.refs[o] = a;
    });
  });
}
function Hc(t, e) {
  const n = Mc.bind(null, t);
  return document.addEventListener(e, n), () => {
    document.removeEventListener(e, n);
  };
}
var Pr = function() {
  return Pr = Object.assign || function(t) {
    for (var e, n = 1, i = arguments.length; n < i; n++) for (var r in e = arguments[n]) Object.prototype.hasOwnProperty.call(e, r) && (t[r] = e[r]);
    return t;
  }, Pr.apply(this, arguments);
};
function an(t, e, n, i) {
  return new (n || (n = Promise))((function(r, s) {
    function a(c) {
      try {
        l(i.next(c));
      } catch (d) {
        s(d);
      }
    }
    function o(c) {
      try {
        l(i.throw(c));
      } catch (d) {
        s(d);
      }
    }
    function l(c) {
      var d;
      c.done ? r(c.value) : (d = c.value, d instanceof n ? d : new n((function(f) {
        f(d);
      }))).then(a, o);
    }
    l((i = i.apply(t, [])).next());
  }));
}
function on(t, e) {
  var n, i, r, s = { label: 0, sent: function() {
    if (1 & r[0]) throw r[1];
    return r[1];
  }, trys: [], ops: [] }, a = Object.create((typeof Iterator == "function" ? Iterator : Object).prototype);
  return a.next = o(0), a.throw = o(1), a.return = o(2), typeof Symbol == "function" && (a[Symbol.iterator] = function() {
    return this;
  }), a;
  function o(l) {
    return function(c) {
      return (function(d) {
        if (n) throw new TypeError("Generator is already executing.");
        for (; a && (a = 0, d[0] && (s = 0)), s; ) try {
          if (n = 1, i && (r = 2 & d[0] ? i.return : d[0] ? i.throw || ((r = i.return) && r.call(i), 0) : i.next) && !(r = r.call(i, d[1])).done) return r;
          switch (i = 0, r && (d = [2 & d[0], r.value]), d[0]) {
            case 0:
            case 1:
              r = d;
              break;
            case 4:
              return s.label++, { value: d[1], done: !1 };
            case 5:
              s.label++, i = d[1], d = [0];
              continue;
            case 7:
              d = s.ops.pop(), s.trys.pop();
              continue;
            default:
              if (r = s.trys, !((r = r.length > 0 && r[r.length - 1]) || d[0] !== 6 && d[0] !== 2)) {
                s = 0;
                continue;
              }
              if (d[0] === 3 && (!r || d[1] > r[0] && d[1] < r[3])) {
                s.label = d[1];
                break;
              }
              if (d[0] === 6 && s.label < r[1]) {
                s.label = r[1], r = d;
                break;
              }
              if (r && s.label < r[2]) {
                s.label = r[2], s.ops.push(d);
                break;
              }
              r[2] && s.ops.pop(), s.trys.pop();
              continue;
          }
          d = e.call(t, s);
        } catch (f) {
          d = [6, f], i = 0;
        } finally {
          n = r = 0;
        }
        if (5 & d[0]) throw d[1];
        return { value: d[0] ? d[1] : void 0, done: !0 };
      })([l, c]);
    };
  }
}
var nn = "$", Za = ":host", Gi = "invalid selector", Ct = 10, Rt = 10, Ui = function(t) {
  var e, n = t[0], i = t[1];
  return (e = n) && (e instanceof Document || e instanceof Element || e instanceof ShadowRoot) && typeof i == "string";
};
function zi(t, e) {
  return (function(n) {
    return n.split(",").map((function(i) {
      return i.trim();
    }));
  })(t).map((function(n) {
    var i = (function(r) {
      return r.split(nn).map((function(s) {
        return s.trim();
      }));
    })(n);
    return e(i);
  }));
}
function eo(t, e) {
  var n = e ? " If you want to select a shadowRoot, use ".concat(e, " instead.") : "";
  return "".concat(t, " cannot be used with a selector ending in a shadowRoot (").concat(nn, ").").concat(n);
}
function hn(t) {
  return t instanceof Promise ? t : Promise.resolve(t);
}
function to() {
  return "You can not select a shadowRoot (".concat(nn, ") of the document.");
}
function no() {
  return "You can not select a shadowRoot (".concat(nn, ") of a shadowRoot.");
}
function Bi(t, e) {
  for (var n, i, r = null, s = t.length, a = 0; a < s; a++) {
    if (a === 0) if (t[a].length) r = e.querySelector(t[a]);
    else {
      if (e instanceof Document) throw new SyntaxError(to());
      if (e instanceof ShadowRoot) throw new SyntaxError(no());
      r = ((n = e.shadowRoot) === null || n === void 0 ? void 0 : n.querySelector(t[++a])) || null;
    }
    else r = ((i = r.shadowRoot) === null || i === void 0 ? void 0 : i.querySelector("".concat(Za, " ").concat(t[a]))) || null;
    if (r === null) return null;
  }
  return r;
}
function jc(t, e) {
  var n, i = (function(a, o, l) {
    for (var c, d = 0, f = o.length; d < f; d++) !c && d in o || (c || (c = Array.prototype.slice.call(o, 0, d)), c[d] = o[d]);
    return a.concat(c || Array.prototype.slice.call(o));
  })([], t), r = i.pop();
  if (!i.length) return e.querySelectorAll(r);
  var s = Bi(i, e);
  return ((n = s == null ? void 0 : s.shadowRoot) === null || n === void 0 ? void 0 : n.querySelectorAll("".concat(Za, " ").concat(r))) || null;
}
function Fc(t, e) {
  if (t.length === 1 && !t[0].length) {
    if (e instanceof Document) throw new SyntaxError(to());
    if (e instanceof ShadowRoot) throw new SyntaxError(no());
    return e.shadowRoot;
  }
  var n = Bi(t, e);
  return (n == null ? void 0 : n.shadowRoot) || null;
}
function qc(t, e, n, i) {
  for (var r = zi(t, (function(l) {
    if (!l[l.length - 1].length) throw new SyntaxError(eo(n, i));
    return l;
  })), s = r.length, a = 0; a < s; a++) {
    var o = Bi(r[a], e);
    if (o) return o;
  }
  return null;
}
function Gc(t, e, n) {
  for (var i = zi(t, (function(o) {
    if (!o[o.length - 1].length) throw new SyntaxError(eo(n));
    return o;
  })), r = i.length, s = 0; s < r; s++) {
    var a = jc(i[s], e);
    if (a != null && a.length) return a;
  }
  return document.querySelectorAll(Gi);
}
function Uc(t, e, n, i) {
  for (var r = zi(t, (function(l) {
    if (l.pop().length) throw new SyntaxError((function(c, d) {
      return "".concat(c, " must be used with a selector ending in a shadowRoot (").concat(nn, "). If you don't want to select a shadowRoot, use ").concat(d, " instead.");
    })(n, i));
    return l;
  })), s = r.length, a = 0; a < s; a++) {
    var o = Fc(r[a], e);
    if (o) return o;
  }
  return null;
}
function xs(t, e, n, i) {
  return an(this, void 0, void 0, (function() {
    return on(this, (function(r) {
      return [2, dr((function() {
        return qc(t, e, "asyncQuerySelector", "asyncShadowRootQuerySelector");
      }), (function(s) {
        return !!s;
      }), { retries: n, delay: i, shouldReject: !1 })];
    }));
  }));
}
function Ts(t, e, n, i) {
  return an(this, void 0, void 0, (function() {
    return on(this, (function(r) {
      return [2, dr((function() {
        return Gc(t, e, "asyncQuerySelectorAll");
      }), (function(s) {
        return !!s.length;
      }), { retries: n, delay: i, shouldReject: !1 })];
    }));
  }));
}
function Ns(t, e, n, i) {
  return an(this, void 0, void 0, (function() {
    return on(this, (function(r) {
      return [2, dr((function() {
        return Uc(t, e, "asyncShadowRootQuerySelector", "asyncQuerySelector");
      }), (function(s) {
        return !!s;
      }), { retries: n, delay: i, shouldReject: !1 })];
    }));
  }));
}
var Ai = function(t, e) {
  var n = t.querySelectorAll(e);
  if (n.length) return n;
  if (t instanceof Element && t.shadowRoot) {
    var i = Ai(t.shadowRoot, e);
    if (i.length) return i;
  }
  for (var r = 0, s = Array.from(t.querySelectorAll("*")); r < s.length; r++) {
    var a = s[r], o = Ai(a, e);
    if (o.length) return o;
  }
  return document.querySelectorAll(Gi);
}, Cs = function(t, e, n, i) {
  return dr((function() {
    return Ai(t, e);
  }), (function(r) {
    return !!r.length;
  }), { retries: n, delay: i, shouldReject: !1 });
};
function Rs() {
  for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
  return an(this, void 0, void 0, (function() {
    var n, i, r, s, a;
    return on(this, (function(o) {
      switch (o.label) {
        case 0:
          return Ui(t) ? (n = t[0], i = t[1], r = t[2], [4, xs(i, n, (r == null ? void 0 : r.retries) || Ct, (r == null ? void 0 : r.delay) || Rt)]) : [3, 2];
        case 1:
        case 3:
          return [2, o.sent()];
        case 2:
          return s = t[0], a = t[1], [4, xs(s, document, (a == null ? void 0 : a.retries) || Ct, (a == null ? void 0 : a.delay) || Rt)];
      }
    }));
  }));
}
function Is() {
  for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
  return an(this, void 0, void 0, (function() {
    var n, i, r, s, a;
    return on(this, (function(o) {
      switch (o.label) {
        case 0:
          return Ui(t) ? (n = t[0], i = t[1], r = t[2], [4, Ts(i, n, (r == null ? void 0 : r.retries) || Ct, (r == null ? void 0 : r.delay) || Rt)]) : [3, 2];
        case 1:
          return [2, o.sent()];
        case 2:
          return s = t[0], a = t[1], [2, Ts(s, document, (a == null ? void 0 : a.retries) || Ct, (a == null ? void 0 : a.delay) || Rt)];
      }
    }));
  }));
}
function ks() {
  for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
  return an(this, void 0, void 0, (function() {
    var n, i, r, s, a;
    return on(this, (function(o) {
      switch (o.label) {
        case 0:
          return Ui(t) ? (n = t[0], i = t[1], r = t[2], [4, Ns(i, n, (r == null ? void 0 : r.retries) || Ct, (r == null ? void 0 : r.delay) || Rt)]) : [3, 2];
        case 1:
          return [2, o.sent()];
        case 2:
          return s = t[0], a = t[1], [2, Ns(s, document, (a == null ? void 0 : a.retries) || Ct, (a == null ? void 0 : a.delay) || Rt)];
      }
    }));
  }));
}
var zc = (function() {
  function t(e, n) {
    e instanceof Node || e instanceof Promise ? (this._element = e, this._asyncParams = Pr({ retries: Ct, delay: Rt }, n || {})) : (this._element = document, this._asyncParams = Pr({ retries: Ct, delay: Rt }, e || {}));
  }
  return Object.defineProperty(t.prototype, "element", { get: function() {
    return hn(this._element).then((function(e) {
      return e instanceof NodeList ? e[0] || null : e;
    }));
  }, enumerable: !1, configurable: !0 }), Object.defineProperty(t.prototype, "$", { get: function() {
    var e = this;
    return new t(hn(this._element).then((function(n) {
      return n instanceof Document || n instanceof ShadowRoot || n === null || n instanceof NodeList && n.length === 0 ? null : n instanceof NodeList ? ks(n[0], nn, e._asyncParams) : ks(n, nn, e._asyncParams);
    })), this._asyncParams);
  }, enumerable: !1, configurable: !0 }), Object.defineProperty(t.prototype, "all", { get: function() {
    return hn(this._element).then((function(e) {
      return e instanceof NodeList ? e : document.querySelectorAll(Gi);
    }));
  }, enumerable: !1, configurable: !0 }), Object.defineProperty(t.prototype, "asyncParams", { get: function() {
    return this._asyncParams;
  }, enumerable: !1, configurable: !0 }), t.prototype.eq = function(e) {
    return an(this, void 0, void 0, (function() {
      return on(this, (function(n) {
        return [2, hn(this._element).then((function(i) {
          return i instanceof NodeList && i[e] || null;
        }))];
      }));
    }));
  }, t.prototype.query = function(e) {
    var n = this;
    return new t(hn(this._element).then((function(i) {
      return i === null || i instanceof NodeList && i.length === 0 ? null : i instanceof NodeList ? Is(i[0], e, n._asyncParams) : Is(i, e, n._asyncParams);
    })), this._asyncParams);
  }, t.prototype.deepQuery = function(e) {
    var n = this;
    return new t(hn(this._element).then((function(i) {
      return i === null || i instanceof NodeList && i.length === 0 ? null : i instanceof NodeList ? Promise.race(Array.from(i).map((function(r) {
        return Cs(r, e, n._asyncParams.retries, n._asyncParams.delay);
      }))) : Cs(i, e, n._asyncParams.retries, n._asyncParams.delay);
    })), this._asyncParams);
  }, t;
})();
const St = "$", Bc = { retries: 100, delay: 50, eventThreshold: 450 };
var je, At, B, tt, q;
(function(t) {
  t.HOME_ASSISTANT = "HOME_ASSISTANT", t.HOME_ASSISTANT_MAIN = "HOME_ASSISTANT_MAIN", t.HA_DRAWER = "HA_DRAWER", t.HA_SIDEBAR = "HA_SIDEBAR", t.PARTIAL_PANEL_RESOLVER = "PARTIAL_PANEL_RESOLVER";
})(je || (je = {})), (function(t) {
  t.HA_PANEL_LOVELACE = "HA_PANEL_LOVELACE", t.HUI_ROOT = "HUI_ROOT", t.HEADER = "HEADER", t.HUI_VIEW = "HUI_VIEW";
})(At || (At = {})), (function(t) {
  t.HA_MORE_INFO_DIALOG = "HA_MORE_INFO_DIALOG", t.HA_DIALOG = "HA_DIALOG", t.HA_DIALOG_CONTENT = "HA_DIALOG_CONTENT", t.HA_MORE_INFO_DIALOG_INFO = "HA_MORE_INFO_DIALOG_INFO", t.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK = "HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK", t.HA_DIALOG_MORE_INFO_SETTINGS = "HA_DIALOG_MORE_INFO_SETTINGS";
})(B || (B = {})), (function(t) {
  t.ON_LISTEN = "onListen", t.ON_PANEL_LOAD = "onPanelLoad", t.ON_LOVELACE_PANEL_LOAD = "onLovelacePanelLoad", t.ON_MORE_INFO_DIALOG_OPEN = "onMoreInfoDialogOpen", t.ON_HISTORY_AND_LOGBOOK_DIALOG_OPEN = "onHistoryAndLogBookDialogOpen", t.ON_SETTINGS_DIALOG_OPEN = "onSettingsDialogOpen";
})(tt || (tt = {})), (function(t) {
  t.HOME_ASSISTANT = "home-assistant", t.HOME_ASSISTANT_MAIN = "home-assistant-main", t.HA_DRAWER = "ha-drawer", t.HA_SIDEBAR = "ha-sidebar", t.PARTIAL_PANEL_RESOLVER = "partial-panel-resolver", t.HA_PANEL_LOVELACE = "ha-panel-lovelace", t.HUI_ROOT = "hui-root", t.HEADER = ".header", t.HUI_VIEW = "hui-view", t.HA_MORE_INFO_DIALOG = "ha-more-info-dialog", t.HA_DIALOG = "ha-adaptive-dialog, ha-dialog", t.HA_DIALOG_CONTENT = ".content", t.HA_MORE_INFO_DIALOG_INFO = "ha-more-info-info", t.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK = "ha-more-info-history-and-logbook", t.HA_DIALOG_MORE_INFO_SETTINGS = "ha-more-info-settings";
})(q || (q = {}));
const Vc = { [je.HOME_ASSISTANT]: { selector: q.HOME_ASSISTANT, children: { shadowRoot: { selector: St, children: { [je.HOME_ASSISTANT_MAIN]: { selector: q.HOME_ASSISTANT_MAIN, children: { shadowRoot: { selector: St, children: { [je.HA_DRAWER]: { selector: q.HA_DRAWER, children: { [je.HA_SIDEBAR]: { selector: q.HA_SIDEBAR, children: { shadowRoot: { selector: St } } }, [je.PARTIAL_PANEL_RESOLVER]: { selector: q.PARTIAL_PANEL_RESOLVER } } } } } } } } } } } }, Wc = { [At.HA_PANEL_LOVELACE]: { selector: q.HA_PANEL_LOVELACE, children: { shadowRoot: { selector: St, children: { [At.HUI_ROOT]: { selector: q.HUI_ROOT, children: { shadowRoot: { selector: St, children: { [At.HEADER]: { selector: q.HEADER }, [At.HUI_VIEW]: { selector: q.HUI_VIEW } } } } } } } } } }, Yc = { shadowRoot: { selector: St, children: { [B.HA_MORE_INFO_DIALOG]: { selector: q.HA_MORE_INFO_DIALOG, children: { shadowRoot: { selector: St, children: { [B.HA_DIALOG]: { selector: q.HA_DIALOG, children: { [B.HA_DIALOG_CONTENT]: { selector: q.HA_DIALOG_CONTENT, children: { [B.HA_MORE_INFO_DIALOG_INFO]: { selector: q.HA_MORE_INFO_DIALOG_INFO }, [B.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK]: { selector: q.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK }, [B.HA_DIALOG_MORE_INFO_SETTINGS]: { selector: q.HA_DIALOG_MORE_INFO_SETTINGS } } } } } } } } } } } };
const Vn = (t, e, n, i = !1) => Object.entries(e || {}).reduce((r, s) => {
  const [a, o] = s;
  if (o.selector === St && n) return o.children ? Object.assign(Object.assign({}, r), Vn(t, o.children, n, !0)) : r;
  const l = n ? n.then((c) => {
    return c ? Rs(c, (d = o.selector, i ? "$ " + d : d), t) : null;
    var d;
  }) : Rs(o.selector, t);
  return r[a] = { element: l, children: Vn(t, o.children, l), selector: new zc(l, t) }, r;
}, {}), ro = (t, e) => {
  const n = Object.entries(e);
  for (const i of n) {
    if (i[0] === t) return i[1];
    {
      const r = ro(t, i[1].children);
      if (r) return r;
    }
  }
}, ri = (t, e) => Object.keys(t).reduce((n, i) => {
  const r = ro(i, e);
  if (r) {
    const { children: s } = r, a = (function(o, l) {
      var c = {};
      for (var d in o) Object.prototype.hasOwnProperty.call(o, d) && l.indexOf(d) < 0 && (c[d] = o[d]);
      if (o != null && typeof Object.getOwnPropertySymbols == "function") {
        var f = 0;
        for (d = Object.getOwnPropertySymbols(o); f < d.length; f++) l.indexOf(d[f]) < 0 && Object.prototype.propertyIsEnumerable.call(o, d[f]) && (c[d[f]] = o[d[f]]);
      }
      return c;
    })(r, ["children"]);
    n[i] = Object.assign({}, a);
  }
  return n;
}, {});
let Jc = class {
  constructor() {
    this.delegate = document.createDocumentFragment();
  }
  addEventListener(...e) {
    this.delegate.addEventListener(...e);
  }
  dispatchEvent(...e) {
    return this.delegate.dispatchEvent(...e);
  }
  removeEventListener(...e) {
    return this.delegate.removeEventListener(...e);
  }
}, Kc = class extends Jc {
  constructor(e = {}) {
    super(), this._config = Object.assign(Object.assign({}, Bc), e), this._timestaps = {};
  }
  _dispatchEvent(e, n) {
    const i = Date.now();
    this._timestaps[e] && i - this._timestaps[e] < this._config.eventThreshold || (this._timestaps[e] = i, this.dispatchEvent(new CustomEvent(e, { detail: n })));
  }
  _updateDialogElements(e = B.HA_MORE_INFO_DIALOG_INFO) {
    this._dialogTree = Vn(this._config, Yc, this._haRootElements.HOME_ASSISTANT.element);
    const n = ri(B, this._dialogTree);
    n.HA_DIALOG_CONTENT.element.then((r) => {
      this._dialogsContentObserver.disconnect(), this._dialogsContentObserver.observe(r, { childList: !0 });
    }), this._haDialogElements = ((r, s) => [B.HA_MORE_INFO_DIALOG, B.HA_DIALOG, B.HA_DIALOG_CONTENT, s].reduce((a, o) => (a[o] = r[o], a), {}))(n, e);
    const i = { [B.HA_MORE_INFO_DIALOG_INFO]: tt.ON_MORE_INFO_DIALOG_OPEN, [B.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK]: tt.ON_HISTORY_AND_LOGBOOK_DIALOG_OPEN, [B.HA_DIALOG_MORE_INFO_SETTINGS]: tt.ON_SETTINGS_DIALOG_OPEN };
    this._dispatchEvent(i[e], this._haDialogElements);
  }
  _updateRootElements() {
    this._homeAssistantRootTree = Vn(this._config, Vc), this._haRootElements = ri(je, this._homeAssistantRootTree), this._haRootElements[je.HOME_ASSISTANT].selector.$.element.then((e) => {
      this._dialogsObserver.disconnect(), this._dialogsObserver.observe(e, { childList: !0 });
    }), this._haRootElements[je.PARTIAL_PANEL_RESOLVER].element.then((e) => {
      this._panelResolverObserver.disconnect(), e && this._panelResolverObserver.observe(e, { subtree: !0, childList: !0 });
    }), this._dispatchEvent(tt.ON_LISTEN, this._haRootElements), this._dispatchEvent(tt.ON_PANEL_LOAD, this._haRootElements);
  }
  _updateLovelaceElements() {
    this._homeAssistantResolverTree = Vn(this._config, Wc, this._haRootElements[je.HA_DRAWER].element), this._haResolverElements = ri(At, this._homeAssistantResolverTree), this._haResolverElements[At.HA_PANEL_LOVELACE].element.then((e) => {
      this._lovelaceObserver.disconnect(), e && (this._lovelaceObserver.observe(e.shadowRoot, { childList: !0 }), this._dispatchEvent(tt.ON_LOVELACE_PANEL_LOAD, Object.assign(Object.assign({}, this._haRootElements), this._haResolverElements)));
    });
  }
  _watchDialogs(e) {
    e.forEach(({ addedNodes: n }) => {
      n.forEach((i) => {
        i instanceof Element && i.localName === q.HA_MORE_INFO_DIALOG && this._updateDialogElements();
      });
    });
  }
  _watchDialogsContent(e) {
    e.forEach(({ addedNodes: n }) => {
      n.forEach((i) => {
        const r = { [q.HA_MORE_INFO_DIALOG_INFO]: B.HA_MORE_INFO_DIALOG_INFO, [q.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK]: B.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK, [q.HA_DIALOG_MORE_INFO_SETTINGS]: B.HA_DIALOG_MORE_INFO_SETTINGS };
        if (i instanceof Element && i.localName && i.localName in r) {
          const s = i.localName;
          this._updateDialogElements(r[s]);
        }
      });
    });
  }
  _watchDashboards(e) {
    e.forEach(({ addedNodes: n }) => {
      n.forEach((i) => {
        this._dispatchEvent(tt.ON_PANEL_LOAD, this._haRootElements), i instanceof Element && i.localName === q.HA_PANEL_LOVELACE && this._updateLovelaceElements();
      });
    });
  }
  _watchLovelace(e) {
    e.forEach(({ addedNodes: n }) => {
      n.forEach((i) => {
        i instanceof Element && i.localName === q.HUI_ROOT && this._updateLovelaceElements();
      });
    });
  }
  listen() {
    this._watchDialogsBinded = this._watchDialogs.bind(this), this._watchDialogsContentBinded = this._watchDialogsContent.bind(this), this._watchDashboardsBinded = this._watchDashboards.bind(this), this._watchLovelaceBinded = this._watchLovelace.bind(this), this._dialogsObserver = new MutationObserver(this._watchDialogsBinded), this._dialogsContentObserver = new MutationObserver(this._watchDialogsContentBinded), this._panelResolverObserver = new MutationObserver(this._watchDashboardsBinded), this._lovelaceObserver = new MutationObserver(this._watchLovelaceBinded), this._updateRootElements(), this._updateLovelaceElements();
  }
  addEventListener(e, n, i) {
    super.addEventListener(e, n, i);
  }
};
const io = new Kc();
let Tr = {};
io.addEventListener("onLovelacePanelLoad", ({ detail: t }) => {
  t.HUI_ROOT.element.then((e) => {
    const n = e == null ? void 0 : e.lovelace;
    n != null && n.config && (Tr = n.config["expander-card"] || {});
  }).catch(() => {
    Tr = {};
  }).finally(() => {
    document.body.dispatchEvent(new CustomEvent("expander-card-raw-config-updated", {
      detail: { rawConfig: Tr },
      bubbles: !0,
      composed: !0
    }));
  });
});
io.listen();
const Xc = () => Tr, Ls = (t) => t ? typeof t == "string" ? t : Object.entries(t).map(([e, n]) => {
  if (!Array.isArray(n))
    return null;
  const i = n.map((r) => {
    if (typeof r == "string")
      return `  ${r};`;
    const [s, a] = Object.entries(r)[0];
    return `  ${s}: ${a};`;
  }).join(`
`);
  return `${e} {
${i}
}`;
}).filter((e) => e !== null).join(`
`) : null, Oi = {
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
var Qc = /* @__PURE__ */ ut("<ha-ripple></ha-ripple>", 2), Zc = /* @__PURE__ */ ut('<button aria-label="Toggle button"><ha-icon></ha-icon> <!></button>', 2), ed = /* @__PURE__ */ ut("<ha-ripple></ha-ripple>", 2), td = /* @__PURE__ */ ut('<div id="id1"><div id="id2"><!></div> <!> <!></div>'), nd = /* @__PURE__ */ ut("<button><div> </div> <ha-icon></ha-icon> <ha-ripple></ha-ripple></button>", 2), rd = /* @__PURE__ */ ut("<div><div></div></div>"), id = /* @__PURE__ */ ut("<ha-card><!> <!> <!></ha-card>", 2);
const sd = {
  hash: "svelte-1jqiztq",
  code: `.expander-card.svelte-1jqiztq {display:var(--expander-card-display,block);gap:var(--gap);padding:var(--padding);background:var(--card-background,#fff);-webkit-tap-highlight-color:transparent;}.expander-card.animation.svelte-1jqiztq {transition:gap 0.35s ease, background-color var(--background-animation-duration, 0) ease;}.children-wrapper.svelte-1jqiztq {display:flex;flex-direction:column;}.children-wrapper.animation.opening.svelte-1jqiztq,
    .children-wrapper.animation.closing.svelte-1jqiztq {overflow:hidden;}.children-container.animation.svelte-1jqiztq {transition:padding 0.35s ease, gap 0.35s ease;}.children-container.svelte-1jqiztq {padding:var(--child-padding);display:var(--expander-card-display,block);gap:var(--gap);}.clear.svelte-1jqiztq {background:none !important;background-color:transparent !important;border-style:none !important;box-shadow:none !important;}.title-card-header.svelte-1jqiztq {display:flex;align-items:center;justify-content:space-between;flex-direction:row;position:relative;}.title-card-header.clickable.svelte-1jqiztq {cursor:pointer;border-style:none;border-radius:var(--ha-card-border-radius, var(--ha-border-radius-lg));}.title-card-header-overlay.svelte-1jqiztq {display:block;}.title-card-container.svelte-1jqiztq {width:100%;padding:var(--title-padding);}.header.svelte-1jqiztq {display:flex;flex-direction:row;align-items:center;padding:0.85em 0.85em;background:var(--button-background);border-style:none;border-radius:var(--ha-card-border-radius, var(--ha-border-radius-lg));width:var(--header-width,auto);color:var(--header-color,#fff);cursor:pointer;position:relative;font-family:var(--ha-font-family-body);font-size:var(--ha-font-size-m);}.header-overlay.svelte-1jqiztq {position:absolute;top:0;right:0;margin:var(--overlay-margin);height:var(--expander-card-overlay-height, auto);z-index:1;}.title-card-header-overlay.clickable.svelte-1jqiztq  > .header-overlay:where(.svelte-1jqiztq) {width:calc(100% - var(--overlay-margin) * 2);justify-content:flex-end;}.title-card-header-overlay.clickable.svelte-1jqiztq > .title-card-container:where(.svelte-1jqiztq) {width:calc(100% - var(--overlay-margin) * 2);}.title.svelte-1jqiztq {width:100%;text-align:left;}.ico.animation.svelte-1jqiztq {transition-property:transform;transition-duration:0.35s;}.ico.svelte-1jqiztq {color:var(--arrow-color,var(--primary-text-color,#fff));}.flipped.svelte-1jqiztq {transform:rotate(var(--icon-rotate-degree,180deg));}`
};
function ad(t, e) {
  Ti(e, !0), Wa(t, sd);
  const n = Pe(e, "hass"), i = Pe(e, "preview"), r = Pe(e, "config", 7, Oi);
  let s = /* @__PURE__ */ H(!1), a = /* @__PURE__ */ H(null), o = /* @__PURE__ */ H(Ye(!!Me(() => i()))), l = /* @__PURE__ */ H(Ye(!!Me(() => i()))), c = /* @__PURE__ */ H(Ye(Me(() => i() || (Jr(r()["show-button-users"]) ?? !0)))), d = /* @__PURE__ */ H("idle"), f = /* @__PURE__ */ H(null), b = /* @__PURE__ */ H(0), m = /* @__PURE__ */ H(0), _ = /* @__PURE__ */ H(null), $ = /* @__PURE__ */ H(null), h = /* @__PURE__ */ H(null), v = /* @__PURE__ */ H(null);
  const g = {}, w = {}, T = {}, O = /* @__PURE__ */ H(Ye({}));
  let C = /* @__PURE__ */ H(Ye(Xc()));
  const M = /* @__PURE__ */ jn(() => {
    const y = p(O).style, E = r().style;
    let A = null;
    return y !== void 0 ? A = typeof y == "string" ? y : typeof y == "object" && y !== null ? Ls(y) : String(y) : E && (A = Ls(E)), A ? `<style>${A}</style>` : null;
  }), W = /* @__PURE__ */ jn(() => p(O).icon !== void 0 ? String(p(O).icon) : r().icon), me = /* @__PURE__ */ jn(() => p(O).title !== void 0 ? String(p(O).title) : r().title), kt = /* @__PURE__ */ jn(() => p(O)["arrow-color"] !== void 0 ? String(p(O)["arrow-color"]) : r()["arrow-color"]), de = Me(() => r()["storage-id"]), fr = "expander-open-" + de;
  bn(() => {
    if (p(O).expanded === void 0 || Me(() => i() && p(C)["preview-expanded"] !== !1))
      return;
    const y = !!p(O).expanded;
    queueMicrotask(() => {
      y !== p(o) && Lt(y);
    });
  }), bn(() => {
    if (!(i() === p(l) || i() === void 0)) {
      if (S(l, i(), !0), p(l) && p(C)["preview-expanded"] !== !1) {
        Pn(!0), S(c, !0);
        return;
      }
      if (S(c, Jr(r()["show-button-users"]) ?? !0, !0), ln("expanded")) {
        const y = Me(() => p(O).expanded);
        y !== void 0 && Lt(!!y);
        return;
      }
      Xi();
    }
  });
  function ln(y) {
    const E = r().templates && Array.isArray(r().templates) ? r().templates.find((A) => A.template === y) : void 0;
    if (E && xr(E.value_template))
      return E;
  }
  function Yr(y) {
    if (!r()["expander-card-id"])
      return;
    const E = {};
    E[r()["expander-card-id"]] = { property: "open", value: y }, document.dispatchEvent(new CustomEvent("expander-card", { detail: E, bubbles: !0, composed: !0 }));
  }
  function Jr(y) {
    var E, A, J, Re;
    if (y !== void 0)
      return ((A = (E = n()) == null ? void 0 : E.user) == null ? void 0 : A.name) !== void 0 && y.includes((Re = (J = n()) == null ? void 0 : J.user) == null ? void 0 : Re.name);
  }
  function Xi() {
    if (!ln("expanded")) {
      if (Jr(r()["start-expanded-users"])) {
        ht(!0);
        return;
      }
      if (de === void 0) {
        Qi();
        return;
      }
      try {
        const y = localStorage.getItem(fr);
        if (y === null) {
          Qi();
          return;
        }
        const E = y ? y === "true" : p(o);
        ht(E);
      } catch (y) {
        console.error(y), ht(!1);
      }
    }
  }
  function Qi() {
    if (r().expanded !== void 0) {
      ht(r().expanded);
      return;
    }
    ht(!1);
  }
  function Lt(y) {
    p(f) && (clearTimeout(p(f)), S(f, null));
    const E = y !== void 0 ? y : !p(o);
    if (!r().animation) {
      ht(E);
      return;
    }
    if (Yr(E), S(d, E ? "opening" : "closing", !0), E) {
      Pn(!0), S(
        f,
        setTimeout(
          () => {
            S(d, "idle"), S(f, null);
          },
          350
        ),
        !0
      );
      return;
    }
    S(
      f,
      setTimeout(
        () => {
          Pn(!1), S(d, "idle"), S(f, null);
        },
        350
      ),
      !0
    );
  }
  function ht(y) {
    Pn(y), Yr(y);
  }
  function Pn(y) {
    if (S(o, y, !0), !i() && de !== void 0)
      try {
        localStorage.setItem(fr, p(o) ? "true" : "false");
      } catch (E) {
        console.error(E);
      }
    p(o) && p(b) === 0 && S(b, 0.35);
  }
  function Zi(y) {
    var A;
    const E = (A = y.detail) == null ? void 0 : A.rawConfig;
    E && JSON.stringify(E) !== JSON.stringify(p(C)) && S(C, E, !0);
  }
  function es(y) {
    var A, J;
    const E = (J = (A = y.detail) == null ? void 0 : A["expander-card"]) == null ? void 0 : J.data;
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
  function ho() {
    document.body.removeEventListener("ll-custom", es), document.body.removeEventListener("expander-card-raw-config-updated", Zi), Object.entries(T).forEach(([y, E]) => {
      E.then((A) => {
        A(), delete T[y];
      }).catch(() => {
      });
    }), Object.entries(w).forEach(([y, E]) => {
      E.then((A) => {
        A(), delete w[y];
      }).catch(() => {
      });
    }), Object.entries(g).forEach(([y, E]) => {
      E(), delete g[y];
    });
  }
  const ts = (y) => {
    r().haptic && r().haptic !== "none" && Cc(y, r().haptic);
  };
  let Dn, Mn = !1, ns = 0, rs = 0;
  const fo = (y) => {
    p(v) && (p(v).disabled = !0), Dn = y.target, ns = y.touches[0].clientX, rs = y.touches[0].clientY, Mn = !1;
  }, po = (y) => {
    const E = y.touches[0].clientX, A = y.touches[0].clientY;
    Mn = Math.abs(E - ns) > 10 || Math.abs(A - rs) > 10;
  }, _o = () => {
    p(v) && (p(v).disabled = !1), Dn = void 0, Mn = !1;
  }, vo = () => {
    p(v) && (p(v).disabled = !1);
  }, go = (y) => {
    !Mn && Dn === y.target && r()["title-card-clickable"] && (ts(Dn), Lt(), S(s, !0), S(
      a,
      window.setTimeout(
        () => {
          S(s, !1), S(a, null);
        },
        100
      ),
      !0
    ), p(v) && (p(v).startPressAnimation(), p(v).endPressAnimation())), Dn = void 0, Mn = !1;
  }, mo = (y) => {
    for (const E of Object.values(r().variables ?? {}))
      xr(E.value_template) ? w[E.variable] = Os(
        y,
        (A) => {
          Ss(y, E.variable, A);
        },
        E.value_template,
        { config: r() }
      ) : Ss(y, E.variable, E.value_template);
  }, bo = (y) => {
    g["expander-card"] = Hc(y, "expander-card");
  }, yo = () => {
    if (!r().templates) return;
    const y = Object.values(r().variables || {}).reduce(
      (A, J) => (A[J.variable] = void 0, A),
      {}
    ), E = Dc({ config: r(), expanderCard: {} }, y);
    mo(E), bo(E), Object.values(r().templates || {}).forEach((A) => {
      xr(A.value_template) ? T[A.template] = Os(
        E,
        (J) => {
          p(O)[A.template] = J;
        },
        A.value_template,
        { config: r() }
      ) : p(O)[A.template] = A.value_template;
    });
  };
  function wo() {
    if (ln("expanded"))
      return;
    const y = r()["min-width-expanded"], E = r()["max-width-expanded"], A = document.body.offsetWidth;
    if (y && E) {
      r().expanded = A >= y && A <= E;
      return;
    }
    if (y) {
      r().expanded = A >= y;
      return;
    }
    E && (r().expanded = A <= E);
  }
  function Eo() {
    if (i() && p(C)["preview-expanded"] !== !1) {
      Pn(!0);
      return;
    }
    if (ln("expanded")) {
      const y = Me(() => p(O).expanded);
      ht(y !== void 0 ? !!y : !1);
    } else
      Xi();
  }
  function $o() {
    if (r()["title-card-clickable"] && !r()["title-card-button-overlay"] && p($))
      return p($);
    if (p(h))
      return p(h);
  }
  Va(() => {
    yo(), Yr(!1), wo(), Eo(), document.body.addEventListener("ll-custom", es), document.body.addEventListener("expander-card-raw-config-updated", Zi);
    const y = $o();
    return y && (y.addEventListener("touchstart", fo, { passive: !0, capture: !0 }), y.addEventListener("touchmove", po, { passive: !0, capture: !0 }), y.addEventListener("touchcancel", _o, { passive: !0, capture: !0 }), y.addEventListener("touchend", vo, { passive: !0, capture: !0 }), y.addEventListener("touchend", go, { passive: !1, capture: !1 })), r()["title-card-clickable"] && r()["title-card-button-overlay"] && p($) && new ResizeObserver(() => {
      if (p(h) && p($) && p(_)) {
        const A = p($).getBoundingClientRect();
        S(m, A.height - parseFloat(getComputedStyle(p(h)).marginTop) - parseFloat(getComputedStyle(p(h)).marginBottom) + parseFloat(getComputedStyle(p(_)).paddingTop) + parseFloat(getComputedStyle(p(_)).paddingBottom));
      }
    }).observe(p($)), ho;
  });
  const Kr = (y) => {
    if (!p(s)) {
      ts(y.currentTarget), Lt();
      return;
    }
    return y.preventDefault(), y.stopImmediatePropagation(), S(s, !1), p(a) && (clearTimeout(p(a)), S(a, null)), !1;
  };
  var Ao = {
    get hass() {
      return n();
    },
    set hass(y) {
      n(y), Ae();
    },
    get preview() {
      return i();
    },
    set preview(y) {
      i(y), Ae();
    },
    get config() {
      return r();
    },
    set config(y = Oi) {
      r(y), Ae();
    }
  }, cn = id(), is = _t(cn);
  {
    var Oo = (y) => {
      var E = td(), A = _t(E), J = _t(A);
      $i(J, {
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
      }), Ze(A);
      var Re = Mt(A, 2);
      {
        var Ie = (Z) => {
          var ne = Zc(), ze = _t(ne);
          et(() => ys(ze, "icon", p(W)));
          var Co = Mt(ze, 2);
          {
            var Ro = (Pt) => {
              var Hn = Qc();
              mt(Hn, (Io) => S(v, Io), () => p(v)), ye(Pt, Hn);
            };
            vt(Co, (Pt) => {
              (!r()["title-card-clickable"] || r()["title-card-button-overlay"]) && Pt(Ro);
            });
          }
          Ze(ne), mt(ne, (Pt) => S(h, Pt), () => p(h)), et(() => {
            gt(ne, `--overlay-margin:${r()["overlay-margin"] ?? ""}; --button-background:${r()["button-background"] ?? ""}; --header-color:${r()["header-color"] ?? ""};`), ke(ne, 1, `header ${r()["title-card-button-overlay"] ? " header-overlay" : ""}${p(o) ? " open" : " close"}${r().animation ? " animation " + p(d) : ""}`, "svelte-1jqiztq"), gt(ze, `--arrow-color:${p(kt) ?? ""}`), ke(ze, 1, `ico${p(o) && p(d) !== "closing" ? " flipped open" : " close"}${r().animation ? " animation " + p(d) : ""}`, "svelte-1jqiztq");
          }), ei("click", ne, function(...Pt) {
            var Hn;
            (Hn = !r()["title-card-clickable"] || r()["title-card-button-overlay"] ? Kr : null) == null || Hn.apply(this, Pt);
          }), ye(Z, ne);
        };
        vt(Re, (Z) => {
          p(c) && Z(Ie);
        });
      }
      var dn = Mt(Re, 2);
      {
        var Xr = (Z) => {
          var ne = ed();
          mt(ne, (ze) => S(v, ze), () => p(v)), ye(Z, ne);
        };
        vt(dn, (Z) => {
          r()["title-card-clickable"] && !r()["title-card-button-overlay"] && Z(Xr);
        });
      }
      Ze(E), mt(E, (Z) => S($, Z), () => p($)), et(() => {
        ke(E, 1, `title-card-header${r()["title-card-button-overlay"] ? "-overlay" : ""}${p(o) ? " open" : " close"}${r().animation ? " animation " + p(d) : ""}${r()["title-card-clickable"] ? " clickable" : ""}`, "svelte-1jqiztq"), Ya(E, "role", r()["title-card-clickable"] && !r()["title-card-button-overlay"] ? "button" : void 0), ke(A, 1, `title-card-container${p(o) ? " open" : " close"}${r().animation ? " animation " + p(d) : ""}`, "svelte-1jqiztq"), gt(A, `--title-padding:${(r()["title-card-padding"] ? r()["title-card-padding"] : "0px") ?? ""};`);
      }), ei("click", E, function(...Z) {
        var ne;
        (ne = r()["title-card-clickable"] && !r()["title-card-button-overlay"] ? Kr : null) == null || ne.apply(this, Z);
      }), ye(y, E);
    }, So = (y) => {
      var E = ms(), A = fs(E);
      {
        var J = (Re) => {
          var Ie = nd(), dn = _t(Ie), Xr = _t(dn, !0);
          Ze(dn);
          var Z = Mt(dn, 2);
          et(() => ys(Z, "icon", p(W)));
          var ne = Mt(Z, 2);
          mt(ne, (ze) => S(v, ze), () => p(v)), Ze(Ie), mt(Ie, (ze) => S(h, ze), () => p(h)), et(() => {
            ke(Ie, 1, `header${p(o) ? " open" : " close"}${r().animation ? " animation " + p(d) : ""}`, "svelte-1jqiztq"), gt(Ie, `--header-width:100%; --button-background:${r()["button-background"] ?? ""};--header-color:${r()["header-color"] ?? ""};`), ke(dn, 1, `primary title${p(o) ? " open" : " close"}`, "svelte-1jqiztq"), lc(Xr, p(me)), gt(Z, `--arrow-color:${p(kt) ?? ""}`), ke(Z, 1, `ico${p(o) && p(d) !== "closing" ? " flipped open" : " close"}${r().animation ? " animation " + p(d) : ""}`, "svelte-1jqiztq");
          }), ei("click", Ie, Kr), ye(Re, Ie);
        };
        vt(A, (Re) => {
          p(c) && Re(J);
        });
      }
      ye(y, E);
    };
    vt(is, (y) => {
      r()["title-card"] ? y(Oo) : y(So, -1);
    });
  }
  var ss = Mt(is, 2);
  {
    var xo = (y) => {
      var E = rd(), A = _t(E);
      fc(A, 20, () => r().cards, (J) => J, (J, Re) => {
        {
          let Ie = /* @__PURE__ */ jn(() => p(o) && i());
          $i(J, {
            get hass() {
              return n();
            },
            get preview() {
              return p(Ie);
            },
            get config() {
              return Re;
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
              return p(d);
            },
            get clearCardCss() {
              return r()["clear-children"];
            }
          });
        }
      }), Ze(A), Ze(E), et(() => {
        ke(E, 1, `children-wrapper ${r().animation ? "animation " + p(d) : ""}${p(o) ? " open" : " close"}`, "svelte-1jqiztq"), gt(A, `--expander-card-display:${r()["expander-card-display"] ?? ""};
                --gap:${(p(o) && p(d) !== "closing" ? r()["expanded-gap"] : r().gap) ?? ""};
                --child-padding:${(p(o) && p(d) !== "closing" ? r()["child-padding"] : "0px") ?? ""};`), ke(A, 1, `children-container${p(o) ? " open" : " close"}${r().animation ? " animation " + p(d) : ""}`, "svelte-1jqiztq");
      }), ye(y, E);
    };
    vt(ss, (y) => {
      r().cards && y(xo);
    });
  }
  var To = Mt(ss, 2);
  {
    var No = (y) => {
      var E = ms(), A = fs(E);
      vc(A, () => p(M)), ye(y, E);
    };
    vt(To, (y) => {
      p(M) && y(No);
    });
  }
  return Ze(cn), mt(cn, (y) => S(_, y), () => p(_)), et(() => {
    ke(cn, 1, `expander-card${r().clear ? " clear" : ""}${p(o) ? " open" : " close"} ${p(d)}${r().animation ? " animation " + p(d) : ""}`, "svelte-1jqiztq"), gt(cn, `--expander-card-display:${r()["expander-card-display"] ?? ""};
     --gap:${(p(o) && p(d) !== "closing" ? r()["expanded-gap"] : r().gap) ?? ""}; --padding:${r().padding ?? ""};
     --expander-state:${p(o) ?? ""};
     --icon-rotate-degree:${r()["icon-rotate-degree"] ?? ""};
     --card-background:${(p(o) && p(d) !== "closing" && r()["expander-card-background-expanded"] ? r()["expander-card-background-expanded"] : r()["expander-card-background"]) ?? ""};
     --background-animation-duration:${p(b) ?? ""}s;
     --expander-card-overlay-height:${p(m) ? `${p(m)}px` : "auto"};
    `);
  }), ye(t, cn), Ni(Ao);
}
rc(["click"]);
customElements.define("expander-card", Xa(ad, { hass: {}, preview: {}, config: {} }, [], [], { mode: "open" }, (t) => class extends t {
  constructor() {
    super(...arguments);
    // re-declare props used in customClass.
    F(this, "config");
  }
  static async getConfigElement() {
    return await Jo(), document.createElement("expander-card-editor");
  }
  static getStubConfig() {
    return {
      type: "custom:expander-card",
      title: "Expander Card",
      cards: []
    };
  }
  setConfig(n = {}) {
    this.config = { ...Oi, ...n };
  }
}));
const od = "7.0.5";
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Nr = globalThis, Vi = Nr.ShadowRoot && (Nr.ShadyCSS === void 0 || Nr.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Wi = Symbol(), Ps = /* @__PURE__ */ new WeakMap();
let so = class {
  constructor(e, n, i) {
    if (this._$cssResult$ = !0, i !== Wi) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = n;
  }
  get styleSheet() {
    let e = this.o;
    const n = this.t;
    if (Vi && e === void 0) {
      const i = n !== void 0 && n.length === 1;
      i && (e = Ps.get(n)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), i && Ps.set(n, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const ld = (t) => new so(typeof t == "string" ? t : t + "", void 0, Wi), Yi = (t, ...e) => {
  const n = t.length === 1 ? t[0] : e.reduce((i, r, s) => i + ((a) => {
    if (a._$cssResult$ === !0) return a.cssText;
    if (typeof a == "number") return a;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + t[s + 1], t[0]);
  return new so(n, t, Wi);
}, cd = (t, e) => {
  if (Vi) t.adoptedStyleSheets = e.map((n) => n instanceof CSSStyleSheet ? n : n.styleSheet);
  else for (const n of e) {
    const i = document.createElement("style"), r = Nr.litNonce;
    r !== void 0 && i.setAttribute("nonce", r), i.textContent = n.cssText, t.appendChild(i);
  }
}, Ds = Vi ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let n = "";
  for (const i of e.cssRules) n += i.cssText;
  return ld(n);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: dd, defineProperty: ud, getOwnPropertyDescriptor: hd, getOwnPropertyNames: fd, getOwnPropertySymbols: pd, getPrototypeOf: _d } = Object, xt = globalThis, Ms = xt.trustedTypes, vd = Ms ? Ms.emptyScript : "", ii = xt.reactiveElementPolyfillSupport, Wn = (t, e) => t, Dr = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? vd : null;
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
} }, Ji = (t, e) => !dd(t, e), Hs = { attribute: !0, type: String, converter: Dr, reflect: !1, useDefault: !1, hasChanged: Ji };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), xt.litPropertyMetadata ?? (xt.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let pn = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, n = Hs) {
    if (n.state && (n.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((n = Object.create(n)).wrapped = !0), this.elementProperties.set(e, n), !n.noAccessor) {
      const i = Symbol(), r = this.getPropertyDescriptor(e, i, n);
      r !== void 0 && ud(this.prototype, e, r);
    }
  }
  static getPropertyDescriptor(e, n, i) {
    const { get: r, set: s } = hd(this.prototype, e) ?? { get() {
      return this[n];
    }, set(a) {
      this[n] = a;
    } };
    return { get: r, set(a) {
      const o = r == null ? void 0 : r.call(this);
      s == null || s.call(this, a), this.requestUpdate(e, o, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? Hs;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Wn("elementProperties"))) return;
    const e = _d(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Wn("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Wn("properties"))) {
      const n = this.properties, i = [...fd(n), ...pd(n)];
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
      for (const r of i) n.unshift(Ds(r));
    } else e !== void 0 && n.push(Ds(e));
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
    return cd(e, this.constructor.elementStyles), e;
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
    var s;
    const i = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, i);
    if (r !== void 0 && i.reflect === !0) {
      const a = (((s = i.converter) == null ? void 0 : s.toAttribute) !== void 0 ? i.converter : Dr).toAttribute(n, i.type);
      this._$Em = e, a == null ? this.removeAttribute(r) : this.setAttribute(r, a), this._$Em = null;
    }
  }
  _$AK(e, n) {
    var s, a;
    const i = this.constructor, r = i._$Eh.get(e);
    if (r !== void 0 && this._$Em !== r) {
      const o = i.getPropertyOptions(r), l = typeof o.converter == "function" ? { fromAttribute: o.converter } : ((s = o.converter) == null ? void 0 : s.fromAttribute) !== void 0 ? o.converter : Dr;
      this._$Em = r;
      const c = l.fromAttribute(n, o.type);
      this[r] = c ?? ((a = this._$Ej) == null ? void 0 : a.get(r)) ?? c, this._$Em = null;
    }
  }
  requestUpdate(e, n, i, r = !1, s) {
    var a;
    if (e !== void 0) {
      const o = this.constructor;
      if (r === !1 && (s = this[e]), i ?? (i = o.getPropertyOptions(e)), !((i.hasChanged ?? Ji)(s, n) || i.useDefault && i.reflect && s === ((a = this._$Ej) == null ? void 0 : a.get(e)) && !this.hasAttribute(o._$Eu(e, i)))) return;
      this.C(e, n, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, n, { useDefault: i, reflect: r, wrapped: s }, a) {
    i && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(e) && (this._$Ej.set(e, a ?? n ?? this[e]), s !== !0 || a !== void 0) || (this._$AL.has(e) || (this.hasUpdated || i || (n = void 0), this._$AL.set(e, n)), r === !0 && this._$Em !== e && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(e));
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
        for (const [s, a] of this._$Ep) this[s] = a;
        this._$Ep = void 0;
      }
      const r = this.constructor.elementProperties;
      if (r.size > 0) for (const [s, a] of r) {
        const { wrapped: o } = a, l = this[s];
        o !== !0 || this._$AL.has(s) || l === void 0 || this.C(s, void 0, a, l);
      }
    }
    let e = !1;
    const n = this._$AL;
    try {
      e = this.shouldUpdate(n), e ? (this.willUpdate(n), (i = this._$EO) == null || i.forEach((r) => {
        var s;
        return (s = r.hostUpdate) == null ? void 0 : s.call(r);
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
pn.elementStyles = [], pn.shadowRootOptions = { mode: "open" }, pn[Wn("elementProperties")] = /* @__PURE__ */ new Map(), pn[Wn("finalized")] = /* @__PURE__ */ new Map(), ii == null || ii({ ReactiveElement: pn }), (xt.reactiveElementVersions ?? (xt.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Yn = globalThis, js = (t) => t, Mr = Yn.trustedTypes, Fs = Mr ? Mr.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, ao = "$lit$", yt = `lit$${Math.random().toFixed(9).slice(2)}$`, oo = "?" + yt, gd = `<${oo}>`, rn = document, Qn = () => rn.createComment(""), Zn = (t) => t === null || typeof t != "object" && typeof t != "function", Ki = Array.isArray, md = (t) => Ki(t) || typeof (t == null ? void 0 : t[Symbol.iterator]) == "function", si = `[ 	
\f\r]`, qn = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, qs = /-->/g, Gs = />/g, jt = RegExp(`>|${si}(?:([^\\s"'>=/]+)(${si}*=${si}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Us = /'/g, zs = /"/g, lo = /^(?:script|style|textarea|title)$/i, bd = (t) => (e, ...n) => ({ _$litType$: t, strings: e, values: n }), fn = bd(1), In = Symbol.for("lit-noChange"), G = Symbol.for("lit-nothing"), Bs = /* @__PURE__ */ new WeakMap(), Ut = rn.createTreeWalker(rn, 129);
function co(t, e) {
  if (!Ki(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Fs !== void 0 ? Fs.createHTML(e) : e;
}
const yd = (t, e) => {
  const n = t.length - 1, i = [];
  let r, s = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", a = qn;
  for (let o = 0; o < n; o++) {
    const l = t[o];
    let c, d, f = -1, b = 0;
    for (; b < l.length && (a.lastIndex = b, d = a.exec(l), d !== null); ) b = a.lastIndex, a === qn ? d[1] === "!--" ? a = qs : d[1] !== void 0 ? a = Gs : d[2] !== void 0 ? (lo.test(d[2]) && (r = RegExp("</" + d[2], "g")), a = jt) : d[3] !== void 0 && (a = jt) : a === jt ? d[0] === ">" ? (a = r ?? qn, f = -1) : d[1] === void 0 ? f = -2 : (f = a.lastIndex - d[2].length, c = d[1], a = d[3] === void 0 ? jt : d[3] === '"' ? zs : Us) : a === zs || a === Us ? a = jt : a === qs || a === Gs ? a = qn : (a = jt, r = void 0);
    const m = a === jt && t[o + 1].startsWith("/>") ? " " : "";
    s += a === qn ? l + gd : f >= 0 ? (i.push(c), l.slice(0, f) + ao + l.slice(f) + yt + m) : l + yt + (f === -2 ? o : m);
  }
  return [co(t, s + (t[n] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), i];
};
class er {
  constructor({ strings: e, _$litType$: n }, i) {
    let r;
    this.parts = [];
    let s = 0, a = 0;
    const o = e.length - 1, l = this.parts, [c, d] = yd(e, n);
    if (this.el = er.createElement(c, i), Ut.currentNode = this.el.content, n === 2 || n === 3) {
      const f = this.el.content.firstChild;
      f.replaceWith(...f.childNodes);
    }
    for (; (r = Ut.nextNode()) !== null && l.length < o; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const f of r.getAttributeNames()) if (f.endsWith(ao)) {
          const b = d[a++], m = r.getAttribute(f).split(yt), _ = /([.?@])?(.*)/.exec(b);
          l.push({ type: 1, index: s, name: _[2], strings: m, ctor: _[1] === "." ? Ed : _[1] === "?" ? $d : _[1] === "@" ? Ad : Vr }), r.removeAttribute(f);
        } else f.startsWith(yt) && (l.push({ type: 6, index: s }), r.removeAttribute(f));
        if (lo.test(r.tagName)) {
          const f = r.textContent.split(yt), b = f.length - 1;
          if (b > 0) {
            r.textContent = Mr ? Mr.emptyScript : "";
            for (let m = 0; m < b; m++) r.append(f[m], Qn()), Ut.nextNode(), l.push({ type: 2, index: ++s });
            r.append(f[b], Qn());
          }
        }
      } else if (r.nodeType === 8) if (r.data === oo) l.push({ type: 2, index: s });
      else {
        let f = -1;
        for (; (f = r.data.indexOf(yt, f + 1)) !== -1; ) l.push({ type: 7, index: s }), f += yt.length - 1;
      }
      s++;
    }
  }
  static createElement(e, n) {
    const i = rn.createElement("template");
    return i.innerHTML = e, i;
  }
}
function kn(t, e, n = t, i) {
  var a, o;
  if (e === In) return e;
  let r = i !== void 0 ? (a = n._$Co) == null ? void 0 : a[i] : n._$Cl;
  const s = Zn(e) ? void 0 : e._$litDirective$;
  return (r == null ? void 0 : r.constructor) !== s && ((o = r == null ? void 0 : r._$AO) == null || o.call(r, !1), s === void 0 ? r = void 0 : (r = new s(t), r._$AT(t, n, i)), i !== void 0 ? (n._$Co ?? (n._$Co = []))[i] = r : n._$Cl = r), r !== void 0 && (e = kn(t, r._$AS(t, e.values), r, i)), e;
}
class wd {
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
    const { el: { content: n }, parts: i } = this._$AD, r = ((e == null ? void 0 : e.creationScope) ?? rn).importNode(n, !0);
    Ut.currentNode = r;
    let s = Ut.nextNode(), a = 0, o = 0, l = i[0];
    for (; l !== void 0; ) {
      if (a === l.index) {
        let c;
        l.type === 2 ? c = new ur(s, s.nextSibling, this, e) : l.type === 1 ? c = new l.ctor(s, l.name, l.strings, this, e) : l.type === 6 && (c = new Od(s, this, e)), this._$AV.push(c), l = i[++o];
      }
      a !== (l == null ? void 0 : l.index) && (s = Ut.nextNode(), a++);
    }
    return Ut.currentNode = rn, r;
  }
  p(e) {
    let n = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(e, i, n), n += i.strings.length - 2) : i._$AI(e[n])), n++;
  }
}
class ur {
  get _$AU() {
    var e;
    return ((e = this._$AM) == null ? void 0 : e._$AU) ?? this._$Cv;
  }
  constructor(e, n, i, r) {
    this.type = 2, this._$AH = G, this._$AN = void 0, this._$AA = e, this._$AB = n, this._$AM = i, this.options = r, this._$Cv = (r == null ? void 0 : r.isConnected) ?? !0;
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
    e = kn(this, e, n), Zn(e) ? e === G || e == null || e === "" ? (this._$AH !== G && this._$AR(), this._$AH = G) : e !== this._$AH && e !== In && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : md(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== G && Zn(this._$AH) ? this._$AA.nextSibling.data = e : this.T(rn.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    var s;
    const { values: n, _$litType$: i } = e, r = typeof i == "number" ? this._$AC(e) : (i.el === void 0 && (i.el = er.createElement(co(i.h, i.h[0]), this.options)), i);
    if (((s = this._$AH) == null ? void 0 : s._$AD) === r) this._$AH.p(n);
    else {
      const a = new wd(r, this), o = a.u(this.options);
      a.p(n), this.T(o), this._$AH = a;
    }
  }
  _$AC(e) {
    let n = Bs.get(e.strings);
    return n === void 0 && Bs.set(e.strings, n = new er(e)), n;
  }
  k(e) {
    Ki(this._$AH) || (this._$AH = [], this._$AR());
    const n = this._$AH;
    let i, r = 0;
    for (const s of e) r === n.length ? n.push(i = new ur(this.O(Qn()), this.O(Qn()), this, this.options)) : i = n[r], i._$AI(s), r++;
    r < n.length && (this._$AR(i && i._$AB.nextSibling, r), n.length = r);
  }
  _$AR(e = this._$AA.nextSibling, n) {
    var i;
    for ((i = this._$AP) == null ? void 0 : i.call(this, !1, !0, n); e !== this._$AB; ) {
      const r = js(e).nextSibling;
      js(e).remove(), e = r;
    }
  }
  setConnected(e) {
    var n;
    this._$AM === void 0 && (this._$Cv = e, (n = this._$AP) == null || n.call(this, e));
  }
}
class Vr {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, n, i, r, s) {
    this.type = 1, this._$AH = G, this._$AN = void 0, this.element = e, this.name = n, this._$AM = r, this.options = s, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = G;
  }
  _$AI(e, n = this, i, r) {
    const s = this.strings;
    let a = !1;
    if (s === void 0) e = kn(this, e, n, 0), a = !Zn(e) || e !== this._$AH && e !== In, a && (this._$AH = e);
    else {
      const o = e;
      let l, c;
      for (e = s[0], l = 0; l < s.length - 1; l++) c = kn(this, o[i + l], n, l), c === In && (c = this._$AH[l]), a || (a = !Zn(c) || c !== this._$AH[l]), c === G ? e = G : e !== G && (e += (c ?? "") + s[l + 1]), this._$AH[l] = c;
    }
    a && !r && this.j(e);
  }
  j(e) {
    e === G ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class Ed extends Vr {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === G ? void 0 : e;
  }
}
class $d extends Vr {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== G);
  }
}
class Ad extends Vr {
  constructor(e, n, i, r, s) {
    super(e, n, i, r, s), this.type = 5;
  }
  _$AI(e, n = this) {
    if ((e = kn(this, e, n, 0) ?? G) === In) return;
    const i = this._$AH, r = e === G && i !== G || e.capture !== i.capture || e.once !== i.once || e.passive !== i.passive, s = e !== G && (i === G || r);
    r && this.element.removeEventListener(this.name, this, i), s && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    var n;
    typeof this._$AH == "function" ? this._$AH.call(((n = this.options) == null ? void 0 : n.host) ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class Od {
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
const ai = Yn.litHtmlPolyfillSupport;
ai == null || ai(er, ur), (Yn.litHtmlVersions ?? (Yn.litHtmlVersions = [])).push("3.3.2");
const Sd = (t, e, n) => {
  const i = (n == null ? void 0 : n.renderBefore) ?? e;
  let r = i._$litPart$;
  if (r === void 0) {
    const s = (n == null ? void 0 : n.renderBefore) ?? null;
    i._$litPart$ = r = new ur(e.insertBefore(Qn(), s), s, void 0, n ?? {});
  }
  return r._$AI(t), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Qt = globalThis;
class Jn extends pn {
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
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Sd(n, this.renderRoot, this.renderOptions);
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
    return In;
  }
}
var Js;
Jn._$litElement$ = !0, Jn.finalized = !0, (Js = Qt.litElementHydrateSupport) == null || Js.call(Qt, { LitElement: Jn });
const oi = Qt.litElementPolyfillSupport;
oi == null || oi({ LitElement: Jn });
(Qt.litElementVersions ?? (Qt.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const xd = (t) => (e, n) => {
  n !== void 0 ? n.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Td = { attribute: !0, type: String, converter: Dr, reflect: !1, hasChanged: Ji }, Nd = (t = Td, e, n) => {
  const { kind: i, metadata: r } = n;
  let s = globalThis.litPropertyMetadata.get(r);
  if (s === void 0 && globalThis.litPropertyMetadata.set(r, s = /* @__PURE__ */ new Map()), i === "setter" && ((t = Object.create(t)).wrapped = !0), s.set(n.name, t), i === "accessor") {
    const { name: a } = n;
    return { set(o) {
      const l = e.get.call(this);
      e.set.call(this, o), this.requestUpdate(a, l, t, !0, o);
    }, init(o) {
      return o !== void 0 && this.C(a, void 0, t, o), o;
    } };
  }
  if (i === "setter") {
    const { name: a } = n;
    return function(o) {
      const l = this[a];
      e.call(this, o), this.requestUpdate(a, l, t, !0, o);
    };
  }
  throw Error("Unsupported decorator location: " + i);
};
function Wr(t) {
  return (e, n) => typeof n == "object" ? Nd(t, e, n) : ((i, r, s) => {
    const a = r.hasOwnProperty(s);
    return r.constructor.createProperty(s, i), a ? Object.getOwnPropertyDescriptor(r, s) : void 0;
  })(t, e, n);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function hr(t) {
  return Wr({ ...t, state: !0, attribute: !1 });
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Cd = (t, e, n) => (n.configurable = !0, n.enumerable = !0, Reflect.decorate && typeof e != "object" && Object.defineProperty(t, e, n), n);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function Rd(t, e) {
  return (n, i, r) => {
    const s = (a) => {
      var o;
      return ((o = a.renderRoot) == null ? void 0 : o.querySelector(t)) ?? null;
    };
    return Cd(n, i, { get() {
      return s(this);
    } });
  };
}
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Id = (t) => t ?? G, kd = Yi`
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
`, Ld = Yi`
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
var Pd = Object.defineProperty, Dd = Object.getOwnPropertyDescriptor, Qe = (t, e, n, i) => {
  for (var r = i > 1 ? void 0 : i ? Dd(e, n) : e, s = t.length - 1, a; s >= 0; s--)
    (a = t[s]) && (r = (i ? a(e, n, r) : a(r)) || r);
  return i && r && Pd(e, n, r), r;
};
const uo = "custom:", Md = (t) => t.startsWith(uo), Hd = (t) => {
  var e;
  return (e = window.customCards) == null ? void 0 : e.find((n) => n.type === t);
}, jd = (t) => t.replace(uo, "");
let ge = class extends Jn {
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
      let i;
      Md(this._config.type) ? (i = (n = Hd(
        jd(this._config.type)
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
                        disabled=${Id(t)}
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
      return G;
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
ge.styles = [
  kd,
  Ld,
  Yi`
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
Qe([
  Wr({ attribute: !1 })
], ge.prototype, "hass", 2);
Qe([
  Wr({ type: Boolean, reflect: !0 })
], ge.prototype, "large", 2);
Qe([
  Wr({ attribute: !1 })
], ge.prototype, "lovelace", 2);
Qe([
  hr()
], ge.prototype, "_params", 2);
Qe([
  hr()
], ge.prototype, "_config", 2);
Qe([
  hr()
], ge.prototype, "_cardGUIMode", 2);
Qe([
  hr()
], ge.prototype, "_cardGUIModeAvailable", 2);
Qe([
  hr()
], ge.prototype, "_error", 2);
Qe([
  Rd("hui-card-element-editor")
], ge.prototype, "_cardEditorEl", 2);
ge = Qe([
  xd("expander-card-title-card-edit-form")
], ge);
console.info(
  `%c  Expander-Card 
%c Version ${od}`,
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
customElements.get("expander-card-title-card-edit-form") || customElements.define("expander-card-title-card-edit-form", ge);
export {
  ad as default
};
//# sourceMappingURL=expander-card.js.map
