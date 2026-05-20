var Vo = Object.defineProperty;
var ms = (t) => {
  throw TypeError(t);
};
var Wo = (t, e, n) => e in t ? Vo(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n;
var j = (t, e, n) => Wo(t, typeof e != "symbol" ? e + "" : e, n), oi = (t, e, n) => e.has(t) || ms("Cannot " + n);
var u = (t, e, n) => (oi(t, e, "read from private field"), n ? n.call(t) : e.get(t)), C = (t, e, n) => e.has(t) ? ms("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, n), S = (t, e, n, i) => (oi(t, e, "write to private field"), i ? i.call(t, n) : e.set(t, n), n), P = (t, e, n) => (oi(t, e, "access private method"), n);
var ra;
typeof window < "u" && ((ra = window.__svelte ?? (window.__svelte = {})).v ?? (ra.v = /* @__PURE__ */ new Set())).add("5");
const Yo = {
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
}, Jo = [
  "expanded",
  "icon",
  "arrow-color",
  "title",
  "style"
];
var wr = /* @__PURE__ */ ((t) => (t.CSS = "css", t.Object = "object", t))(wr || {});
const Ko = { name: "style", label: "CSS text", selector: { text: { multiline: !0 } } }, Qo = { name: "style", label: "CSS structured object", selector: { object: {} } }, Xo = { icon: {} }, Zo = { text: {} }, el = { boolean: {} }, tl = (t) => ({
  number: {
    unit_of_measurement: t
  }
}), nl = (t, e) => ({
  name: t,
  label: e,
  selector: Xo
}), Q = (t, e) => ({
  name: t,
  label: e,
  selector: Zo
}), cn = (t, e) => ({
  name: t,
  label: e,
  selector: el
}), bs = (t, e, n) => ({
  name: t,
  label: e,
  selector: tl(n)
}), rl = [
  {
    type: "expandable",
    label: "Expander Card Settings",
    icon: "mdi:arrow-down-bold-box-outline",
    schema: [
      {
        ...Q("title", "Title")
      },
      {
        ...nl("icon", "Icon")
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
                ...cn("expanded", "Start expanded")
              },
              {
                ...cn("animation", "Enable animation")
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
                ...bs("min-width-expanded", "Min width expanded", "px")
              },
              {
                ...bs("max-width-expanded", "Max width expanded", "px")
              },
              {
                ...Q("storage-id", "Storage ID")
              },
              {
                ...Q("expander-card-id", "Expander card ID")
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
                ...Q("arrow-color", "Icon color")
              },
              {
                ...Q("icon-rotate-degree", "Icon rotate degree")
              },
              {
                ...Q("header-color", "Header color")
              },
              {
                ...Q("button-background", "Button background color")
              },
              {
                ...Q("expander-card-background", "Background")
              },
              {
                ...Q("expander-card-background-expanded", "Background when expanded")
              },
              {
                ...Q("expander-card-display", "Expander card display")
              },
              {
                ...cn("clear", "Clear border and background")
              },
              {
                ...Q("gap", "Gap")
              },
              {
                ...Q("padding", "Padding")
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
                ...Q("expanded-gap", "Card gap")
              },
              {
                ...Q("child-padding", "Card padding")
              },
              {
                ...Q("child-margin-top", "Card margin top")
              },
              {
                ...cn("clear-children", "Clear card border and background")
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
                ...cn("title-card-clickable", "Make title card clickable to expand/collapse")
              },
              {
                ...cn("title-card-button-overlay", "Overlay expand button on title card")
              },
              {
                ...Q("overlay-margin", "Overlay margin")
              },
              {
                ...Q("title-card-padding", "Title card padding")
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
], il = (t, e) => new Promise((n) => {
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
}), Yn = window;
let Er = Yn.cardHelpers;
const sl = new Promise((t) => {
  Er && t(), Yn.loadCardHelpers && Yn.loadCardHelpers().then((e) => {
    Er = e, Yn.cardHelpers = Er, t();
  });
});
async function al() {
  const t = document.querySelector("home-assistant"), e = t == null ? void 0 : t.hass;
  return e ? (await e.callWS({ type: "config/auth/list" })).filter((i) => !i.system_generated).map((i) => i.name) : void 0;
}
const ol = async () => {
  const t = await sl.then(() => Er.createCardElement({ type: "vertical-stack", cards: [] })), e = await customElements.whenDefined("hui-vertical-stack-card").then(() => t.constructor.getConfigElement()), n = await al();
  return class extends e.constructor {
    constructor() {
      super(), this.showDialogCallback = (r) => {
        var a, o, l, d;
        ((l = (o = (a = r.detail) == null ? void 0 : a.dialogParams) == null ? void 0 : o.schema) == null ? void 0 : l.find((c) => c.name === "expander_card_title_card_marker")) && (r.stopPropagation(), (d = r.detail) != null && d.dialogImport && r.detail.dialogImport().then(async () => {
          var h, p, y, g, A, f, v, m;
          const c = {
            title: "Title card",
            config: this._config["title-card"] || {},
            submit: (p = (h = r.detail) == null ? void 0 : h.dialogParams) == null ? void 0 : p.submit,
            cancel: (g = (y = r.detail) == null ? void 0 : y.dialogParams) == null ? void 0 : g.cancel,
            submitText: (f = (A = r.detail) == null ? void 0 : A.dialogParams) == null ? void 0 : f.submitText,
            cancelText: (m = (v = r.detail) == null ? void 0 : v.dialogParams) == null ? void 0 : m.cancelText,
            lovelace: this.lovelace
          };
          await il(
            this,
            c
          );
        }));
      }, this._computeLabelCallback = (r) => r.label ?? r.name ?? "", this._valueChanged = (r) => {
        const s = r.detail.value, a = Object.entries(Yo);
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
      const s = JSON.stringify(rl), a = this._users.map((h) => h.replace(/\\/g, "\\\\").replace(/"/g, '\\"')).join('","');
      let o = s.replace(/\[\[users\]\]/g, a);
      o = o.replace(
        /\[\[templates\]\]/g,
        // NOSONAR es2019
        Jo.filter((h) => {
          var p;
          return !((p = this._config.templates) != null && p.some((y) => y.template === h));
        }).join('","')
      );
      const d = (this._config.style && typeof this._config.style == "object" ? wr.Object : wr.CSS) === wr.CSS ? JSON.stringify(Ko) : JSON.stringify(Qo);
      return o = o.replace(/"\[\[style\]\]"/g, d), JSON.parse(o);
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
}, ll = (async () => {
  for (; customElements.get("home-assistant") === void 0; )
    await new Promise((t) => Yn.setTimeout(t, 100));
  if (!customElements.get("expander-card-editor")) {
    const t = await ol();
    customElements.define("expander-card-editor", t);
  }
}), cl = 1, dl = 2, ul = 16, hl = 1, fl = 2, oa = "[", Hi = "[!", ys = "[?", ji = "]", Qt = {}, B = Symbol("uninitialized"), la = "http://www.w3.org/1999/xhtml", pl = "http://www.w3.org/2000/svg", _l = "http://www.w3.org/1998/Math/MathML", ca = !1;
var da = Array.isArray, vl = Array.prototype.indexOf, Tn = Array.prototype.includes, Jr = Array.from, Pr = Object.keys, Dr = Object.defineProperty, gn = Object.getOwnPropertyDescriptor, gl = Object.getOwnPropertyDescriptors, ml = Object.prototype, bl = Array.prototype, ua = Object.getPrototypeOf, ws = Object.isExtensible;
const yl = () => {
};
function wl(t) {
  for (var e = 0; e < t.length; e++)
    t[e]();
}
function ha() {
  var t, e, n = new Promise((i, r) => {
    t = i, e = r;
  });
  return { promise: n, resolve: t, reject: e };
}
const Z = 2, Nn = 4, Kr = 8, fa = 1 << 24, Fe = 16, Ue = 32, lt = 64, bi = 128, Se = 512, W = 1024, J = 2048, Ke = 4096, ie = 8192, xe = 16384, Rt = 32768, yi = 1 << 25, Cn = 65536, Mr = 1 << 17, El = 1 << 18, nn = 1 << 19, $l = 1 << 20, at = 1 << 25, Xt = 65536, Hr = 1 << 21, mn = 1 << 22, Ot = 1 << 23, $r = Symbol("$state"), Al = Symbol("legacy props"), Ol = Symbol(""), Ar = Symbol("attributes"), wi = Symbol("class"), Ei = Symbol("style"), Bn = Symbol("text"), Qr = new class extends Error {
  constructor() {
    super(...arguments);
    j(this, "name", "StaleReactionError");
    j(this, "message", "The reaction that called `getAbortSignal()` was re-run or destroyed");
  }
}();
var ia;
const Sl = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  !!((ia = globalThis.document) != null && ia.contentType) && /* @__PURE__ */ globalThis.document.contentType.includes("xml")
), Xr = 3, Mn = 8;
function xl(t) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function Tl() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function Nl(t, e, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function Cl(t) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function Rl() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function Il(t) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function kl() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Ll() {
  throw new Error("https://svelte.dev/e/hydration_failed");
}
function Pl() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Dl() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Ml() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Hl() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
function jl() {
  console.warn("https://svelte.dev/e/derived_inert");
}
function fr(t) {
  console.warn("https://svelte.dev/e/hydration_mismatch");
}
function Fl() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
let L = !1;
function qe(t) {
  L = t;
}
let k;
function te(t) {
  if (t === null)
    throw fr(), Qt;
  return k = t;
}
function Rn() {
  return te(/* @__PURE__ */ ze(k));
}
function Ze(t) {
  if (L) {
    if (/* @__PURE__ */ ze(k) !== null)
      throw fr(), Qt;
    k = t;
  }
}
function ql(t = 1) {
  if (L) {
    for (var e = t, n = k; e--; )
      n = /** @type {TemplateNode} */
      /* @__PURE__ */ ze(n);
    k = n;
  }
}
function jr(t = !0) {
  for (var e = 0, n = k; ; ) {
    if (n.nodeType === Mn) {
      var i = (
        /** @type {Comment} */
        n.data
      );
      if (i === ji) {
        if (e === 0) return n;
        e -= 1;
      } else (i === oa || i === Hi || // "[1", "[2", etc. for if blocks
      i[0] === "[" && !isNaN(Number(i.slice(1)))) && (e += 1);
    }
    var r = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ ze(n)
    );
    t && n.remove(), n = r;
  }
}
function pa(t) {
  if (!t || t.nodeType !== Mn)
    throw fr(), Qt;
  return (
    /** @type {Comment} */
    t.data
  );
}
function _a(t) {
  return t === this.v;
}
function Gl(t, e) {
  return t != t ? e == e : t !== e || t !== null && typeof t == "object" || typeof t == "function";
}
function va(t) {
  return !Gl(t, this.v);
}
let Ul = !1, le = null;
function In(t) {
  le = t;
}
function Fi(t, e = !1, n) {
  le = {
    p: le,
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
function qi(t) {
  var e = (
    /** @type {ComponentContext} */
    le
  ), n = e.e;
  if (n !== null) {
    e.e = null;
    for (var i of n)
      Ga(i);
  }
  return t !== void 0 && (e.x = t), e.i = !0, le = e.p, t ?? /** @type {T} */
  {};
}
function ga() {
  return !0;
}
let Ht = [];
function ma() {
  var t = Ht;
  Ht = [], wl(t);
}
function bn(t) {
  if (Ht.length === 0 && !Kn) {
    var e = Ht;
    queueMicrotask(() => {
      e === Ht && ma();
    });
  }
  Ht.push(t);
}
function zl() {
  for (; Ht.length > 0; )
    ma();
}
function ba(t) {
  var e = I;
  if (e === null)
    return D.f |= Ot, t;
  if ((e.f & Rt) === 0 && (e.f & Nn) === 0)
    throw t;
  $t(t, e);
}
function $t(t, e) {
  for (; e !== null; ) {
    if ((e.f & bi) !== 0) {
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
const Bl = -7169;
function U(t, e) {
  t.f = t.f & Bl | e;
}
function Gi(t) {
  (t.f & Se) !== 0 || t.deps === null ? U(t, W) : U(t, Ke);
}
function ya(t) {
  if (t !== null)
    for (const e of t)
      (e.f & Z) === 0 || (e.f & Xt) === 0 || (e.f ^= Xt, ya(
        /** @type {Derived} */
        e.deps
      ));
}
function wa(t, e, n) {
  (t.f & J) !== 0 ? e.add(t) : (t.f & Ke) !== 0 && n.add(t), ya(t.deps), U(t, W);
}
let li = null, dn = null, T = null, Jn = null, X = null, $i = null, Kn = !1, ci = !1, _n = null, Or = null;
var Es = 0;
let Vl = 1;
var wn, yt, Gt, En, $n, Ut, An, nt, ar, he, or, wt, Ve, We, On, Sn, M, Ai, Vn, Oi, Ea, $a, Sr, Wl, Si, fn;
const Vr = class Vr {
  constructor() {
    C(this, M);
    j(this, "id", Vl++);
    /** True as soon as `#process` was called */
    C(this, wn, !1);
    j(this, "linked", !0);
    /** @type {Batch | null} */
    C(this, yt, null);
    /** @type {Batch | null} */
    C(this, Gt, null);
    /** @type {Map<Effect, ReturnType<typeof deferred<any>>>} */
    j(this, "async_deriveds", /* @__PURE__ */ new Map());
    /**
     * The current values of any signals that are updated in this batch.
     * Tuple format: [value, is_derived] (note: is_derived is false for deriveds, too, if they were overridden via assignment)
     * They keys of this map are identical to `this.#previous`
     * @type {Map<Value, [any, boolean]>}
     */
    j(this, "current", /* @__PURE__ */ new Map());
    /**
     * The values of any signals (sources and deriveds) that are updated in this batch _before_ those updates took place.
     * They keys of this map are identical to `this.#current`
     * @type {Map<Value, any>}
     */
    j(this, "previous", /* @__PURE__ */ new Map());
    /**
     * Async effects which this batch doesn't take into account anymore when calculating blockers,
     * as it has a value for it already.
     * @type {Set<Effect>}
     */
    j(this, "unblocked", /* @__PURE__ */ new Set());
    /**
     * When the batch is committed (and the DOM is updated), we need to remove old branches
     * and append new ones by calling the functions added inside (if/each/key/etc) blocks
     * @type {Set<(batch: Batch) => void>}
     */
    C(this, En, /* @__PURE__ */ new Set());
    /**
     * If a fork is discarded, we need to destroy any effects that are no longer needed
     * @type {Set<(batch: Batch) => void>}
     */
    C(this, $n, /* @__PURE__ */ new Set());
    /**
     * Callbacks that should run only when a fork is committed.
     * @type {Set<(batch: Batch) => void>}
     */
    C(this, Ut, /* @__PURE__ */ new Set());
    /**
     * The number of async effects that are currently in flight
     */
    C(this, An, 0);
    /**
     * Async effects that are currently in flight, _not_ inside a pending boundary
     * @type {Map<Effect, number>}
     */
    C(this, nt, /* @__PURE__ */ new Map());
    /**
     * A deferred that resolves when the batch is committed, used with `settled()`
     * TODO replace with Promise.withResolvers once supported widely enough
     * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
     */
    C(this, ar, null);
    /**
     * The root effects that need to be flushed
     * @type {Effect[]}
     */
    C(this, he, []);
    /**
     * Effects created while this batch was active.
     * @type {Effect[]}
     */
    C(this, or, []);
    /**
     * Deferred effects (which run after async work has completed) that are DIRTY
     * @type {Set<Effect>}
     */
    C(this, wt, /* @__PURE__ */ new Set());
    /**
     * Deferred effects that are MAYBE_DIRTY
     * @type {Set<Effect>}
     */
    C(this, Ve, /* @__PURE__ */ new Set());
    /**
     * A map of branches that still exist, but will be destroyed when this batch
     * is committed — we skip over these during `process`.
     * The value contains child effects that were dirty/maybe_dirty before being reset,
     * so they can be rescheduled if the branch survives.
     * @type {Map<Effect, { d: Effect[], m: Effect[] }>}
     */
    C(this, We, /* @__PURE__ */ new Map());
    /**
     * Inverse of #skipped_branches which we need to tell prior batches to unskip them when committing
     * @type {Set<Effect>}
     */
    C(this, On, /* @__PURE__ */ new Set());
    j(this, "is_fork", !1);
    C(this, Sn, !1);
  }
  /**
   * Add an effect to the #skipped_branches map and reset its children
   * @param {Effect} effect
   */
  skip_effect(e) {
    u(this, We).has(e) || u(this, We).set(e, { d: [], m: [] }), u(this, On).delete(e);
  }
  /**
   * Remove an effect from the #skipped_branches map and reschedule
   * any tracked dirty/maybe_dirty child effects
   * @param {Effect} effect
   * @param {(e: Effect) => void} callback
   */
  unskip_effect(e, n = (i) => this.schedule(i)) {
    var i = u(this, We).get(e);
    if (i) {
      u(this, We).delete(e);
      for (var r of i.d)
        U(r, J), n(r);
      for (r of i.m)
        U(r, Ke), n(r);
    }
    u(this, On).add(e);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} value
   * @param {boolean} [is_derived]
   */
  capture(e, n, i = !1) {
    e.v !== B && !this.previous.has(e) && this.previous.set(e, e.v), (e.f & Ot) === 0 && (this.current.set(e, [n, i]), X == null || X.set(e, n)), this.is_fork || (e.v = n);
  }
  activate() {
    T = this;
  }
  deactivate() {
    T = null, X = null;
  }
  flush() {
    try {
      ci = !0, T = this, P(this, M, Vn).call(this);
    } finally {
      Es = 0, $i = null, _n = null, Or = null, ci = !1, T = null, X = null, Wt.clear();
    }
  }
  discard() {
    for (const e of u(this, $n)) e(this);
    u(this, $n).clear(), u(this, Ut).clear(), P(this, M, fn).call(this);
  }
  /**
   * @param {Effect} effect
   */
  register_created_effect(e) {
    u(this, or).push(e);
  }
  /**
   * @param {boolean} blocking
   * @param {Effect} effect
   */
  increment(e, n) {
    if (S(this, An, u(this, An) + 1), e) {
      let i = u(this, nt).get(n) ?? 0;
      u(this, nt).set(n, i + 1);
    }
  }
  /**
   * @param {boolean} blocking
   * @param {Effect} effect
   */
  decrement(e, n) {
    if (S(this, An, u(this, An) - 1), e) {
      let i = u(this, nt).get(n) ?? 0;
      i === 1 ? u(this, nt).delete(n) : u(this, nt).set(n, i - 1);
    }
    u(this, Sn) || (S(this, Sn, !0), bn(() => {
      S(this, Sn, !1), this.linked && this.flush();
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
      u(this, Ve).add(i);
    e.clear(), n.clear();
  }
  /** @param {(batch: Batch) => void} fn */
  oncommit(e) {
    u(this, En).add(e);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(e) {
    u(this, $n).add(e);
  }
  /** @param {(batch: Batch) => void} fn */
  on_fork_commit(e) {
    u(this, Ut).add(e);
  }
  run_fork_commit_callbacks() {
    for (const e of u(this, Ut)) e(this);
    u(this, Ut).clear();
  }
  settled() {
    return (u(this, ar) ?? S(this, ar, ha())).promise;
  }
  static ensure() {
    var e;
    if (T === null) {
      const n = T = new Vr();
      P(e = n, M, Si).call(e), !ci && !Kn && bn(() => {
        u(n, wn) || n.flush();
      });
    }
    return T;
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
    if ($i = e, (r = e.b) != null && r.is_pending && (e.f & (Nn | Kr | fa)) !== 0 && (e.f & Rt) === 0) {
      e.b.defer_effect(e);
      return;
    }
    for (var n = e; n.parent !== null; ) {
      n = n.parent;
      var i = n.f;
      if (_n !== null && n === I && (D === null || (D.f & Z) === 0))
        return;
      if ((i & (lt | Ue)) !== 0) {
        if ((i & W) === 0)
          return;
        n.f ^= W;
      }
    }
    u(this, he).push(n);
  }
};
wn = new WeakMap(), yt = new WeakMap(), Gt = new WeakMap(), En = new WeakMap(), $n = new WeakMap(), Ut = new WeakMap(), An = new WeakMap(), nt = new WeakMap(), ar = new WeakMap(), he = new WeakMap(), or = new WeakMap(), wt = new WeakMap(), Ve = new WeakMap(), We = new WeakMap(), On = new WeakMap(), Sn = new WeakMap(), M = new WeakSet(), Ai = function() {
  if (this.is_fork) return !0;
  for (const i of u(this, nt).keys()) {
    for (var e = i, n = !1; e.parent !== null; ) {
      if (u(this, We).has(e)) {
        n = !0;
        break;
      }
      e = e.parent;
    }
    if (!n)
      return !0;
  }
  return !1;
}, Vn = function() {
  var l, d, c, h;
  if (S(this, wn, !0), Es++ > 1e3 && (P(this, M, fn).call(this), Yl()), !P(this, M, Ai).call(this)) {
    for (const p of u(this, wt))
      u(this, Ve).delete(p), U(p, J), this.schedule(p);
    for (const p of u(this, Ve))
      U(p, Ke), this.schedule(p);
  }
  const e = u(this, he);
  S(this, he, []), this.apply();
  var n = _n = [], i = [], r = Or = [];
  for (const p of e)
    try {
      P(this, M, Oi).call(this, p, n, i);
    } catch (y) {
      throw Sa(p), y;
    }
  if (T = null, r.length > 0) {
    var s = Vr.ensure();
    for (const p of r)
      s.schedule(p);
  }
  if (_n = null, Or = null, P(this, M, Ai).call(this)) {
    P(this, M, Sr).call(this, i), P(this, M, Sr).call(this, n);
    for (const [p, y] of u(this, We))
      Oa(p, y);
    r.length > 0 && /** @type {unknown} */
    P(l = T, M, Vn).call(l);
    return;
  }
  const a = P(this, M, Ea).call(this);
  if (a) {
    P(d = a, M, $a).call(d, this);
    return;
  }
  u(this, wt).clear(), u(this, Ve).clear();
  for (const p of u(this, En)) p(this);
  u(this, En).clear(), Jn = this, $s(i), $s(n), Jn = null, (c = u(this, ar)) == null || c.resolve();
  var o = (
    /** @type {Batch | null} */
    /** @type {unknown} */
    T
  );
  if (this.linked && u(this, An) === 0 && P(this, M, fn).call(this), u(this, he).length > 0) {
    o === null && (o = this, P(this, M, Si).call(this));
    const p = o;
    u(p, he).push(...u(this, he).filter((y) => !u(p, he).includes(y)));
  }
  o !== null && P(h = o, M, Vn).call(h);
}, /**
 * Traverse the effect tree, executing effects or stashing
 * them for later execution as appropriate
 * @param {Effect} root
 * @param {Effect[]} effects
 * @param {Effect[]} render_effects
 */
Oi = function(e, n, i) {
  e.f ^= W;
  for (var r = e.first; r !== null; ) {
    var s = r.f, a = (s & (Ue | lt)) !== 0, o = a && (s & W) !== 0, l = o || (s & ie) !== 0 || u(this, We).has(r);
    if (!l && r.fn !== null) {
      a ? r.f ^= W : (s & Nn) !== 0 ? n.push(r) : pr(r) && ((s & Fe) !== 0 && u(this, Ve).add(r), Ln(r));
      var d = r.first;
      if (d !== null) {
        r = d;
        continue;
      }
    }
    for (; r !== null; ) {
      var c = r.next;
      if (c !== null) {
        r = c;
        break;
      }
      r = r.parent;
    }
  }
}, Ea = function() {
  for (var e = u(this, yt); e !== null; ) {
    if (!e.is_fork) {
      for (const [n, [, i]] of this.current)
        if (e.current.has(n) && !i)
          return e;
    }
    e = u(e, yt);
  }
  return null;
}, /**
 * @param {Batch} batch
 */
$a = function(e) {
  var i;
  for (const [r, s] of e.current)
    !this.previous.has(r) && e.previous.has(r) && this.previous.set(r, e.previous.get(r)), this.current.set(r, s);
  for (const [r, s] of e.async_deriveds) {
    const a = this.async_deriveds.get(r);
    a && s.promise.then(a.resolve);
  }
  const n = (r) => {
    var s = r.reactions;
    if (s !== null)
      for (const l of s) {
        var a = l.f;
        if ((a & Z) !== 0)
          n(
            /** @type {Derived} */
            l
          );
        else {
          var o = (
            /** @type {Effect} */
            l
          );
          a & (mn | Fe) && !this.async_deriveds.has(o) && (u(this, Ve).delete(o), U(o, J), this.schedule(o));
        }
      }
  };
  for (const r of this.current.keys())
    n(r);
  this.oncommit(() => e.discard()), P(i = e, M, fn).call(i), T = this, P(this, M, Vn).call(this);
}, /**
 * @param {Effect[]} effects
 */
Sr = function(e) {
  for (var n = 0; n < e.length; n += 1)
    wa(e[n], u(this, wt), u(this, Ve));
}, Wl = function() {
  var c;
  P(this, M, fn).call(this);
  for (let h = li; h !== null; h = u(h, Gt)) {
    var e = h.id < this.id, n = [];
    for (const [p, [y, g]] of this.current) {
      if (h.current.has(p)) {
        var i = (
          /** @type {[any, boolean]} */
          h.current.get(p)[0]
        );
        if (e && y !== i)
          h.current.set(p, [y, g]);
        else
          continue;
      }
      n.push(p);
    }
    if (e)
      for (const [p, y] of this.async_deriveds) {
        const g = h.async_deriveds.get(p);
        g && y.promise.then(g.resolve);
      }
    if (u(h, wn)) {
      var r = [...h.current.keys()].filter((p) => !this.current.has(p));
      if (r.length === 0)
        e && h.discard();
      else if (n.length > 0) {
        if (e)
          for (const p of u(this, On))
            h.unskip_effect(p, (y) => {
              var g;
              (y.f & (Fe | mn)) !== 0 ? h.schedule(y) : P(g = h, M, Sr).call(g, [y]);
            });
        h.activate();
        var s = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Map();
        for (var o of n)
          Aa(o, r, s, a);
        a = /* @__PURE__ */ new Map();
        var l = [...h.current.keys()].filter(
          (p) => this.current.has(p) ? (
            /** @type {[any, boolean]} */
            this.current.get(p)[0] !== p.v
          ) : !0
        );
        if (l.length > 0)
          for (const p of u(this, or))
            (p.f & (xe | ie | Mr)) === 0 && Ui(p, l, a) && ((p.f & (mn | Fe)) !== 0 ? (U(p, J), h.schedule(p)) : u(h, wt).add(p));
        if (u(h, he).length > 0) {
          h.apply();
          for (var d of u(h, he))
            P(c = h, M, Oi).call(c, d, [], []);
          S(h, he, []);
        }
        h.deactivate();
      }
    }
  }
}, Si = function() {
  dn === null ? li = dn = this : (S(dn, Gt, this), S(this, yt, dn)), dn = this;
}, fn = function() {
  var e = u(this, yt), n = u(this, Gt);
  e === null ? li = n : S(e, Gt, n), n === null ? dn = e : S(n, yt, e), this.linked = !1;
};
let Tt = Vr;
function $e(t) {
  var e = Kn;
  Kn = !0;
  try {
    for (var n; ; ) {
      if (zl(), T === null)
        return (
          /** @type {T} */
          n
        );
      T.flush();
    }
  } finally {
    Kn = e;
  }
}
function Yl() {
  try {
    kl();
  } catch (t) {
    $t(t, $i);
  }
}
let Le = null;
function $s(t) {
  var e = t.length;
  if (e !== 0) {
    for (var n = 0; n < e; ) {
      var i = t[n++];
      if ((i.f & (xe | ie)) === 0 && pr(i) && (Le = /* @__PURE__ */ new Set(), Ln(i), i.deps === null && i.first === null && i.nodes === null && i.teardown === null && i.ac === null && Va(i), (Le == null ? void 0 : Le.size) > 0)) {
        Wt.clear();
        for (const r of Le) {
          if ((r.f & (xe | ie)) !== 0) continue;
          const s = [r];
          let a = r.parent;
          for (; a !== null; )
            Le.has(a) && (Le.delete(a), s.push(a)), a = a.parent;
          for (let o = s.length - 1; o >= 0; o--) {
            const l = s[o];
            (l.f & (xe | ie)) === 0 && Ln(l);
          }
        }
        Le.clear();
      }
    }
    Le = null;
  }
}
function Aa(t, e, n, i) {
  if (!n.has(t) && (n.add(t), t.reactions !== null))
    for (const r of t.reactions) {
      const s = r.f;
      (s & Z) !== 0 ? Aa(
        /** @type {Derived} */
        r,
        e,
        n,
        i
      ) : (s & (mn | Fe)) !== 0 && (s & J) === 0 && Ui(r, e, i) && (U(r, J), zi(
        /** @type {Effect} */
        r
      ));
    }
}
function Ui(t, e, n) {
  const i = n.get(t);
  if (i !== void 0) return i;
  if (t.deps !== null)
    for (const r of t.deps) {
      if (Tn.call(e, r))
        return !0;
      if ((r.f & Z) !== 0 && Ui(
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
function zi(t) {
  T.schedule(t);
}
function Oa(t, e) {
  if (!((t.f & Ue) !== 0 && (t.f & W) !== 0)) {
    (t.f & J) !== 0 ? e.d.push(t) : (t.f & Ke) !== 0 && e.m.push(t), U(t, W);
    for (var n = t.first; n !== null; )
      Oa(n, e), n = n.next;
  }
}
function Sa(t) {
  U(t, W);
  for (var e = t.first; e !== null; )
    Sa(e), e = e.next;
}
function Jl(t) {
  let e = 0, n = Zt(0), i;
  return () => {
    Wi() && (_(n), Yi(() => (e === 0 && (i = Me(() => t(() => Qn(n)))), e += 1, () => {
      bn(() => {
        e -= 1, e === 0 && (i == null || i(), i = void 0, Qn(n));
      });
    })));
  };
}
var Kl = Cn | nn;
function Ql(t, e, n, i) {
  new Xl(t, e, n, i);
}
var fe, lr, ye, zt, ae, we, re, pe, rt, Bt, Et, xn, cr, dr, it, Wr, q, xa, Ta, Na, xi, xr, Tr, Ti, Ni;
class Xl {
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(e, n, i, r) {
    C(this, q);
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
    C(this, lr, L ? k : null);
    /** @type {BoundaryProps} */
    C(this, ye);
    /** @type {((anchor: Node) => void)} */
    C(this, zt);
    /** @type {Effect} */
    C(this, ae);
    /** @type {Effect | null} */
    C(this, we, null);
    /** @type {Effect | null} */
    C(this, re, null);
    /** @type {Effect | null} */
    C(this, pe, null);
    /** @type {DocumentFragment | null} */
    C(this, rt, null);
    C(this, Bt, 0);
    C(this, Et, 0);
    C(this, xn, !1);
    /** @type {Set<Effect>} */
    C(this, cr, /* @__PURE__ */ new Set());
    /** @type {Set<Effect>} */
    C(this, dr, /* @__PURE__ */ new Set());
    /**
     * A source containing the number of pending async deriveds/expressions.
     * Only created if `$effect.pending()` is used inside the boundary,
     * otherwise updating the source results in needless `Batch.ensure()`
     * calls followed by no-op flushes
     * @type {Source<number> | null}
     */
    C(this, it, null);
    C(this, Wr, Jl(() => (S(this, it, Zt(u(this, Bt))), () => {
      S(this, it, null);
    })));
    var s;
    S(this, fe, e), S(this, ye, n), S(this, zt, (a) => {
      var o = (
        /** @type {Effect} */
        I
      );
      o.b = this, o.f |= bi, i(a);
    }), this.parent = /** @type {Effect} */
    I.b, this.transform_error = r ?? ((s = this.parent) == null ? void 0 : s.transform_error) ?? ((a) => a), S(this, ae, Ji(() => {
      if (L) {
        const a = (
          /** @type {Comment} */
          u(this, lr)
        );
        Rn();
        const o = a.data === Hi;
        if (a.data.startsWith(ys)) {
          const d = JSON.parse(a.data.slice(ys.length));
          P(this, q, Ta).call(this, d);
        } else o ? P(this, q, Na).call(this) : P(this, q, xa).call(this);
      } else
        P(this, q, xi).call(this);
    }, Kl)), L && S(this, fe, k);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(e) {
    wa(e, u(this, cr), u(this, dr));
  }
  /**
   * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!u(this, ye).pending;
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   * @param {Batch} batch
   */
  update_pending_count(e, n) {
    P(this, q, Ti).call(this, e, n), S(this, Bt, u(this, Bt) + e), !(!u(this, it) || u(this, xn)) && (S(this, xn, !0), bn(() => {
      S(this, xn, !1), u(this, it) && kn(u(this, it), u(this, Bt));
    }));
  }
  get_effect_pending() {
    return u(this, Wr).call(this), _(
      /** @type {Source<number>} */
      u(this, it)
    );
  }
  /** @param {unknown} error */
  error(e) {
    if (!u(this, ye).onerror && !u(this, ye).failed)
      throw e;
    T != null && T.is_fork ? (u(this, we) && T.skip_effect(u(this, we)), u(this, re) && T.skip_effect(u(this, re)), u(this, pe) && T.skip_effect(u(this, pe)), T.on_fork_commit(() => {
      P(this, q, Ni).call(this, e);
    })) : P(this, q, Ni).call(this, e);
  }
}
fe = new WeakMap(), lr = new WeakMap(), ye = new WeakMap(), zt = new WeakMap(), ae = new WeakMap(), we = new WeakMap(), re = new WeakMap(), pe = new WeakMap(), rt = new WeakMap(), Bt = new WeakMap(), Et = new WeakMap(), xn = new WeakMap(), cr = new WeakMap(), dr = new WeakMap(), it = new WeakMap(), Wr = new WeakMap(), q = new WeakSet(), xa = function() {
  try {
    S(this, we, Ae(() => u(this, zt).call(this, u(this, fe))));
  } catch (e) {
    this.error(e);
  }
}, /**
 * @param {unknown} error The deserialized error from the server's hydration comment
 */
Ta = function(e) {
  const n = u(this, ye).failed;
  n && S(this, pe, Ae(() => {
    n(
      u(this, fe),
      () => e,
      () => () => {
      }
    );
  }));
}, Na = function() {
  const e = u(this, ye).pending;
  e && (this.is_pending = !0, S(this, re, Ae(() => e(u(this, fe)))), bn(() => {
    var n = S(this, rt, document.createDocumentFragment()), i = Te();
    n.append(i), S(this, we, P(this, q, Tr).call(this, () => Ae(() => u(this, zt).call(this, i)))), u(this, Et) === 0 && (u(this, fe).before(n), S(this, rt, null), Yt(
      /** @type {Effect} */
      u(this, re),
      () => {
        S(this, re, null);
      }
    ), P(this, q, xr).call(
      this,
      /** @type {Batch} */
      T
    ));
  }));
}, xi = function() {
  try {
    if (this.is_pending = this.has_pending_snippet(), S(this, Et, 0), S(this, Bt, 0), S(this, we, Ae(() => {
      u(this, zt).call(this, u(this, fe));
    })), u(this, Et) > 0) {
      var e = S(this, rt, document.createDocumentFragment());
      Xi(u(this, we), e);
      const n = (
        /** @type {(anchor: Node) => void} */
        u(this, ye).pending
      );
      S(this, re, Ae(() => n(u(this, fe))));
    } else
      P(this, q, xr).call(
        this,
        /** @type {Batch} */
        T
      );
  } catch (n) {
    this.error(n);
  }
}, /**
 * @param {Batch} batch
 */
xr = function(e) {
  this.is_pending = !1, e.transfer_effects(u(this, cr), u(this, dr));
}, /**
 * @template T
 * @param {() => T} fn
 */
Tr = function(e) {
  var n = I, i = D, r = le;
  Ce(u(this, ae)), ce(u(this, ae)), In(u(this, ae).ctx);
  try {
    return Tt.ensure(), e();
  } catch (s) {
    return ba(s), null;
  } finally {
    Ce(n), ce(i), In(r);
  }
}, /**
 * Updates the pending count associated with the currently visible pending snippet,
 * if any, such that we can replace the snippet with content once work is done
 * @param {1 | -1} d
 * @param {Batch} batch
 */
Ti = function(e, n) {
  var i;
  if (!this.has_pending_snippet()) {
    this.parent && P(i = this.parent, q, Ti).call(i, e, n);
    return;
  }
  S(this, Et, u(this, Et) + e), u(this, Et) === 0 && (P(this, q, xr).call(this, n), u(this, re) && Yt(u(this, re), () => {
    S(this, re, null);
  }), u(this, rt) && (u(this, fe).before(u(this, rt)), S(this, rt, null)));
}, /**
 * @param {unknown} error
 */
Ni = function(e) {
  u(this, we) && (se(u(this, we)), S(this, we, null)), u(this, re) && (se(u(this, re)), S(this, re, null)), u(this, pe) && (se(u(this, pe)), S(this, pe, null)), L && (te(
    /** @type {TemplateNode} */
    u(this, lr)
  ), ql(), te(jr()));
  var n = u(this, ye).onerror;
  let i = u(this, ye).failed;
  var r = !1, s = !1;
  const a = () => {
    if (r) {
      Fl();
      return;
    }
    r = !0, s && Hl(), u(this, pe) !== null && Yt(u(this, pe), () => {
      S(this, pe, null);
    }), P(this, q, Tr).call(this, () => {
      P(this, q, xi).call(this);
    });
  }, o = (l) => {
    try {
      s = !0, n == null || n(l, a), s = !1;
    } catch (d) {
      $t(d, u(this, ae) && u(this, ae).parent);
    }
    i && S(this, pe, P(this, q, Tr).call(this, () => {
      try {
        return Ae(() => {
          var d = (
            /** @type {Effect} */
            I
          );
          d.b = this, d.f |= bi, i(
            u(this, fe),
            () => l,
            () => a
          );
        });
      } catch (d) {
        return $t(
          d,
          /** @type {Effect} */
          u(this, ae).parent
        ), null;
      }
    }));
  };
  bn(() => {
    var l;
    try {
      l = this.transform_error(e);
    } catch (d) {
      $t(d, u(this, ae) && u(this, ae).parent);
      return;
    }
    l !== null && typeof l == "object" && typeof /** @type {any} */
    l.then == "function" ? l.then(
      o,
      /** @param {unknown} e */
      (d) => $t(d, u(this, ae) && u(this, ae).parent)
    ) : o(l);
  });
};
function Zl(t, e, n, i) {
  const r = Zr;
  var s = t.filter((p) => !p.settled);
  if (n.length === 0 && s.length === 0) {
    i(e.map(r));
    return;
  }
  var a = (
    /** @type {Effect} */
    I
  ), o = ec(), l = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((p) => p.promise)) : null;
  function d(p) {
    if ((a.f & xe) === 0) {
      o();
      try {
        i(p);
      } catch (y) {
        $t(y, a);
      }
      Fr();
    }
  }
  var c = Ca();
  if (n.length === 0) {
    l.then(() => d(e.map(r))).finally(c);
    return;
  }
  function h() {
    Promise.all(n.map((p) => /* @__PURE__ */ tc(p))).then((p) => d([...e.map(r), ...p])).catch((p) => $t(p, a)).finally(c);
  }
  l ? l.then(() => {
    o(), h(), Fr();
  }) : h();
}
function ec() {
  var t = (
    /** @type {Effect} */
    I
  ), e = D, n = le, i = (
    /** @type {Batch} */
    T
  );
  return function(s = !0) {
    Ce(t), ce(e), In(n), s && (t.f & xe) === 0 && (i == null || i.activate(), i == null || i.apply());
  };
}
function Fr(t = !0) {
  Ce(null), ce(null), In(null), t && (T == null || T.deactivate());
}
function Ca() {
  var t = (
    /** @type {Effect} */
    I
  ), e = (
    /** @type {Boundary} */
    t.b
  ), n = (
    /** @type {Batch} */
    T
  ), i = e.is_rendered();
  return e.update_pending_count(1, n), n.increment(i, t), () => {
    e.update_pending_count(-1, n), n.decrement(i, t);
  };
}
// @__NO_SIDE_EFFECTS__
function Zr(t) {
  var e = Z | J;
  return I !== null && (I.f |= nn), {
    ctx: le,
    deps: null,
    effects: null,
    equals: _a,
    f: e,
    fn: t,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      B
    ),
    wv: 0,
    parent: I,
    ac: null
  };
}
const br = Symbol("obsolete");
// @__NO_SIDE_EFFECTS__
function tc(t, e, n) {
  let i = (
    /** @type {Effect | null} */
    I
  );
  i === null && Tl();
  var r = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = Zt(
    /** @type {V} */
    B
  ), a = !D, o = /* @__PURE__ */ new Set();
  return uc(() => {
    var y;
    var l = (
      /** @type {Effect} */
      I
    ), d = ha();
    r = d.promise;
    try {
      Promise.resolve(t()).then(d.resolve, (g) => {
        g !== Qr && d.reject(g);
      }).finally(Fr);
    } catch (g) {
      d.reject(g), Fr();
    }
    var c = (
      /** @type {Batch} */
      T
    );
    if (a) {
      if ((l.f & Rt) !== 0)
        var h = Ca();
      if (
        /** @type {Boundary} */
        i.b.is_rendered()
      )
        (y = c.async_deriveds.get(l)) == null || y.reject(br);
      else
        for (const g of o.values())
          g.reject(br);
      o.add(d), c.async_deriveds.set(l, d);
    }
    const p = (g, A = void 0) => {
      h == null || h(), o.delete(d), A !== br && (c.activate(), A ? (s.f |= Ot, kn(s, A)) : ((s.f & Ot) !== 0 && (s.f ^= Ot), kn(s, g)), c.deactivate());
    };
    d.promise.then(p, (g) => p(null, g || "unknown"));
  }), lc(() => {
    for (const l of o)
      l.reject(br);
  }), new Promise((l) => {
    function d(c) {
      function h() {
        c === r ? l(s) : d(r);
      }
      c.then(h, h);
    }
    d(r);
  });
}
// @__NO_SIDE_EFFECTS__
function Gn(t) {
  const e = /* @__PURE__ */ Zr(t);
  return Ja(e), e;
}
// @__NO_SIDE_EFFECTS__
function nc(t) {
  const e = /* @__PURE__ */ Zr(t);
  return e.equals = va, e;
}
function rc(t) {
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
function Bi(t) {
  var e, n = I, i = t.parent;
  if (!ct && i !== null && t.v !== B && // if it was never evaluated before, it's guaranteed to fail downstream, so we try to execute instead
  (i.f & (xe | ie)) !== 0)
    return jl(), t.v;
  Ce(i);
  try {
    t.f &= ~Xt, rc(t), e = Za(t);
  } finally {
    Ce(n);
  }
  return e;
}
function Ra(t) {
  var e = Bi(t);
  if (!t.equals(e) && (t.wv = Qa(), (!(T != null && T.is_fork) || t.deps === null) && (T !== null ? (T.capture(t, e, !0), Jn == null || Jn.capture(t, e, !0)) : t.v = e, t.deps === null))) {
    U(t, W);
    return;
  }
  ct || (X !== null ? (Wi() || T != null && T.is_fork) && X.set(t, e) : Gi(t));
}
function ic(t) {
  var e, n;
  if (t.effects !== null)
    for (const i of t.effects)
      (i.teardown || i.ac) && ((e = i.teardown) == null || e.call(i), (n = i.ac) == null || n.abort(Qr), i.fn !== null && (i.teardown = yl), i.ac = null, nr(i, 0), Ki(i));
}
function Ia(t) {
  if (t.effects !== null)
    for (const e of t.effects)
      e.teardown && e.fn !== null && Ln(e);
}
let qr = /* @__PURE__ */ new Set();
const Wt = /* @__PURE__ */ new Map();
let ka = !1;
function Zt(t, e) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: t,
    reactions: null,
    equals: _a,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function F(t, e) {
  const n = Zt(t);
  return Ja(n), n;
}
// @__NO_SIDE_EFFECTS__
function La(t, e = !1, n = !0) {
  const i = Zt(t);
  return e || (i.equals = va), i;
}
function x(t, e, n = !1) {
  D !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!Ge || (D.f & Mr) !== 0) && ga() && (D.f & (Z | Fe | mn | Mr)) !== 0 && (Ne === null || !Tn.call(Ne, t)) && Ml();
  let i = n ? Je(e) : e;
  return kn(t, i, Or);
}
function kn(t, e, n = null) {
  if (!t.equals(e)) {
    Wt.set(t, ct ? e : t.v);
    var i = Tt.ensure();
    if (i.capture(t, e), (t.f & Z) !== 0) {
      const r = (
        /** @type {Derived} */
        t
      );
      (t.f & J) !== 0 && Bi(r), X === null && Gi(r);
    }
    t.wv = Qa(), Pa(t, J, n), I !== null && (I.f & W) !== 0 && (I.f & (Ue | lt)) === 0 && (me === null ? fc([t]) : me.push(t)), !i.is_fork && qr.size > 0 && !ka && sc();
  }
  return e;
}
function sc() {
  ka = !1;
  for (const t of qr) {
    (t.f & W) !== 0 && U(t, Ke);
    let e;
    try {
      e = pr(t);
    } catch {
      e = !0;
    }
    e && Ln(t);
  }
  qr.clear();
}
function Qn(t) {
  x(t, t.v + 1);
}
function Pa(t, e, n) {
  var i = t.reactions;
  if (i !== null)
    for (var r = i.length, s = 0; s < r; s++) {
      var a = i[s], o = a.f, l = (o & J) === 0;
      if (l && U(a, e), (o & Mr) !== 0)
        qr.add(
          /** @type {Effect} */
          a
        );
      else if ((o & Z) !== 0) {
        var d = (
          /** @type {Derived} */
          a
        );
        X == null || X.delete(d), (o & Xt) === 0 && (o & Se && (I === null || (I.f & Hr) === 0) && (a.f |= Xt), Pa(d, Ke, n));
      } else if (l) {
        var c = (
          /** @type {Effect} */
          a
        );
        (o & Fe) !== 0 && Le !== null && Le.add(c), n !== null ? n.push(c) : zi(c);
      }
    }
}
function Je(t) {
  if (typeof t != "object" || t === null || $r in t)
    return t;
  const e = ua(t);
  if (e !== ml && e !== bl)
    return t;
  var n = /* @__PURE__ */ new Map(), i = da(t), r = /* @__PURE__ */ F(0), s = Jt, a = (o) => {
    if (Jt === s)
      return o();
    var l = D, d = Jt;
    ce(null), xs(s);
    var c = o();
    return ce(l), xs(d), c;
  };
  return i && n.set("length", /* @__PURE__ */ F(
    /** @type {any[]} */
    t.length
  )), new Proxy(
    /** @type {any} */
    t,
    {
      defineProperty(o, l, d) {
        (!("value" in d) || d.configurable === !1 || d.enumerable === !1 || d.writable === !1) && Pl();
        var c = n.get(l);
        return c === void 0 ? a(() => {
          var h = /* @__PURE__ */ F(d.value);
          return n.set(l, h), h;
        }) : x(c, d.value, !0), !0;
      },
      deleteProperty(o, l) {
        var d = n.get(l);
        if (d === void 0) {
          if (l in o) {
            const c = a(() => /* @__PURE__ */ F(B));
            n.set(l, c), Qn(r);
          }
        } else
          x(d, B), Qn(r);
        return !0;
      },
      get(o, l, d) {
        var y;
        if (l === $r)
          return t;
        var c = n.get(l), h = l in o;
        if (c === void 0 && (!h || (y = gn(o, l)) != null && y.writable) && (c = a(() => {
          var g = Je(h ? o[l] : B), A = /* @__PURE__ */ F(g);
          return A;
        }), n.set(l, c)), c !== void 0) {
          var p = _(c);
          return p === B ? void 0 : p;
        }
        return Reflect.get(o, l, d);
      },
      getOwnPropertyDescriptor(o, l) {
        var d = Reflect.getOwnPropertyDescriptor(o, l);
        if (d && "value" in d) {
          var c = n.get(l);
          c && (d.value = _(c));
        } else if (d === void 0) {
          var h = n.get(l), p = h == null ? void 0 : h.v;
          if (h !== void 0 && p !== B)
            return {
              enumerable: !0,
              configurable: !0,
              value: p,
              writable: !0
            };
        }
        return d;
      },
      has(o, l) {
        var p;
        if (l === $r)
          return !0;
        var d = n.get(l), c = d !== void 0 && d.v !== B || Reflect.has(o, l);
        if (d !== void 0 || I !== null && (!c || (p = gn(o, l)) != null && p.writable)) {
          d === void 0 && (d = a(() => {
            var y = c ? Je(o[l]) : B, g = /* @__PURE__ */ F(y);
            return g;
          }), n.set(l, d));
          var h = _(d);
          if (h === B)
            return !1;
        }
        return c;
      },
      set(o, l, d, c) {
        var w;
        var h = n.get(l), p = l in o;
        if (i && l === "length")
          for (var y = d; y < /** @type {Source<number>} */
          h.v; y += 1) {
            var g = n.get(y + "");
            g !== void 0 ? x(g, B) : y in o && (g = a(() => /* @__PURE__ */ F(B)), n.set(y + "", g));
          }
        if (h === void 0)
          (!p || (w = gn(o, l)) != null && w.writable) && (h = a(() => /* @__PURE__ */ F(void 0)), x(h, Je(d)), n.set(l, h));
        else {
          p = h.v !== B;
          var A = a(() => Je(d));
          x(h, A);
        }
        var f = Reflect.getOwnPropertyDescriptor(o, l);
        if (f != null && f.set && f.set.call(c, d), !p) {
          if (i && typeof l == "string") {
            var v = (
              /** @type {Source<number>} */
              n.get("length")
            ), m = Number(l);
            Number.isInteger(m) && m >= v.v && x(v, m + 1);
          }
          Qn(r);
        }
        return !0;
      },
      ownKeys(o) {
        _(r);
        var l = Reflect.ownKeys(o).filter((h) => {
          var p = n.get(h);
          return p === void 0 || p.v !== B;
        });
        for (var [d, c] of n)
          c.v !== B && !(d in o) && l.push(d);
        return l;
      },
      setPrototypeOf() {
        Dl();
      }
    }
  );
}
var As, Da, Ma, Ha;
function Ci() {
  if (As === void 0) {
    As = window, Da = /Firefox/.test(navigator.userAgent);
    var t = Element.prototype, e = Node.prototype, n = Text.prototype;
    Ma = gn(e, "firstChild").get, Ha = gn(e, "nextSibling").get, ws(t) && (t[wi] = void 0, t[Ar] = null, t[Ei] = void 0, t.__e = void 0), ws(n) && (n[Bn] = void 0);
  }
}
function Te(t = "") {
  return document.createTextNode(t);
}
// @__NO_SIDE_EFFECTS__
function Oe(t) {
  return (
    /** @type {TemplateNode | null} */
    Ma.call(t)
  );
}
// @__NO_SIDE_EFFECTS__
function ze(t) {
  return (
    /** @type {TemplateNode | null} */
    Ha.call(t)
  );
}
function pt(t, e) {
  if (!L)
    return /* @__PURE__ */ Oe(t);
  var n = /* @__PURE__ */ Oe(k);
  if (n === null)
    n = k.appendChild(Te());
  else if (e && n.nodeType !== Xr) {
    var i = Te();
    return n == null || n.before(i), te(i), i;
  }
  return e && Vi(
    /** @type {Text} */
    n
  ), te(n), n;
}
function Os(t, e = !1) {
  if (!L) {
    var n = /* @__PURE__ */ Oe(t);
    return n instanceof Comment && n.data === "" ? /* @__PURE__ */ ze(n) : n;
  }
  if (e) {
    if ((k == null ? void 0 : k.nodeType) !== Xr) {
      var i = Te();
      return k == null || k.before(i), te(i), i;
    }
    Vi(
      /** @type {Text} */
      k
    );
  }
  return k;
}
function Pt(t, e = 1, n = !1) {
  let i = L ? k : t;
  for (var r; e--; )
    r = i, i = /** @type {TemplateNode} */
    /* @__PURE__ */ ze(i);
  if (!L)
    return i;
  if (n) {
    if ((i == null ? void 0 : i.nodeType) !== Xr) {
      var s = Te();
      return i === null ? r == null || r.after(s) : i.before(s), te(s), s;
    }
    Vi(
      /** @type {Text} */
      i
    );
  }
  return te(i), i;
}
function ja(t) {
  t.textContent = "";
}
function Fa() {
  return !1;
}
function ei(t, e, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(e ?? la, t, void 0)
  );
}
function Vi(t) {
  if (
    /** @type {string} */
    t.nodeValue.length < 65536
  )
    return;
  let e = t.nextSibling;
  for (; e !== null && e.nodeType === Xr; )
    e.remove(), t.nodeValue += /** @type {string} */
    e.nodeValue, e = t.nextSibling;
}
function qa(t) {
  var e = D, n = I;
  ce(null), Ce(null);
  try {
    return t();
  } finally {
    ce(e), Ce(n);
  }
}
function ac(t) {
  I === null && (D === null && Il(), Rl()), ct && Cl();
}
function oc(t, e) {
  var n = e.last;
  n === null ? e.last = e.first = t : (n.next = t, t.prev = n, e.last = t);
}
function Qe(t, e) {
  var n = I;
  n !== null && (n.f & ie) !== 0 && (t |= ie);
  var i = {
    ctx: le,
    deps: null,
    nodes: null,
    f: t | J | Se,
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
  T == null || T.register_created_effect(i);
  var r = i;
  if ((t & Nn) !== 0)
    _n !== null ? _n.push(i) : Tt.ensure().schedule(i);
  else if (e !== null) {
    try {
      Ln(i);
    } catch (a) {
      throw se(i), a;
    }
    r.deps === null && r.teardown === null && r.nodes === null && r.first === r.last && // either `null`, or a singular child
    (r.f & nn) === 0 && (r = r.first, (t & Fe) !== 0 && (t & Cn) !== 0 && r !== null && (r.f |= Cn));
  }
  if (r !== null && (r.parent = n, n !== null && oc(r, n), D !== null && (D.f & Z) !== 0 && (t & lt) === 0)) {
    var s = (
      /** @type {Derived} */
      D
    );
    (s.effects ?? (s.effects = [])).push(r);
  }
  return i;
}
function Wi() {
  return D !== null && !Ge;
}
function lc(t) {
  const e = Qe(Kr, null);
  return U(e, W), e.teardown = t, e;
}
function yn(t) {
  ac();
  var e = (
    /** @type {Effect} */
    I.f
  ), n = !D && (e & Ue) !== 0 && (e & Rt) === 0;
  if (n) {
    var i = (
      /** @type {ComponentContext} */
      le
    );
    (i.e ?? (i.e = [])).push(t);
  } else
    return Ga(t);
}
function Ga(t) {
  return Qe(Nn | $l, t);
}
function cc(t) {
  Tt.ensure();
  const e = Qe(lt | nn, t);
  return () => {
    se(e);
  };
}
function dc(t) {
  Tt.ensure();
  const e = Qe(lt | nn, t);
  return (n = {}) => new Promise((i) => {
    n.outro ? Yt(e, () => {
      se(e), i(void 0);
    }) : (se(e), i(void 0));
  });
}
function Ua(t) {
  return Qe(Nn, t);
}
function uc(t) {
  return Qe(mn | nn, t);
}
function Yi(t, e = 0) {
  return Qe(Kr | e, t);
}
function et(t, e = [], n = [], i = []) {
  Zl(i, e, n, (r) => {
    Qe(Kr, () => t(...r.map(_)));
  });
}
function Ji(t, e = 0) {
  var n = Qe(Fe | e, t);
  return n;
}
function Ae(t) {
  return Qe(Ue | nn, t);
}
function za(t) {
  var e = t.teardown;
  if (e !== null) {
    const n = ct, i = D;
    Ss(!0), ce(null);
    try {
      e.call(null);
    } finally {
      Ss(n), ce(i);
    }
  }
}
function Ki(t, e = !1) {
  var n = t.first;
  for (t.first = t.last = null; n !== null; ) {
    const r = n.ac;
    r !== null && qa(() => {
      r.abort(Qr);
    });
    var i = n.next;
    (n.f & lt) !== 0 ? n.parent = null : se(n, e), n = i;
  }
}
function hc(t) {
  for (var e = t.first; e !== null; ) {
    var n = e.next;
    (e.f & Ue) === 0 && se(e), e = n;
  }
}
function se(t, e = !0) {
  var n = !1;
  (e || (t.f & El) !== 0) && t.nodes !== null && t.nodes.end !== null && (Ba(
    t.nodes.start,
    /** @type {TemplateNode} */
    t.nodes.end
  ), n = !0), U(t, yi), Ki(t, e && !n), nr(t, 0);
  var i = t.nodes && t.nodes.t;
  if (i !== null)
    for (const s of i)
      s.stop();
  za(t), t.f ^= yi, t.f |= xe;
  var r = t.parent;
  r !== null && r.first !== null && Va(t), t.next = t.prev = t.teardown = t.ctx = t.deps = t.fn = t.nodes = t.ac = t.b = null;
}
function Ba(t, e) {
  for (; t !== null; ) {
    var n = t === e ? null : /* @__PURE__ */ ze(t);
    t.remove(), t = n;
  }
}
function Va(t) {
  var e = t.parent, n = t.prev, i = t.next;
  n !== null && (n.next = i), i !== null && (i.prev = n), e !== null && (e.first === t && (e.first = i), e.last === t && (e.last = n));
}
function Yt(t, e, n = !0) {
  var i = [];
  Wa(t, i, !0);
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
function Wa(t, e, n) {
  if ((t.f & ie) === 0) {
    t.f ^= ie;
    var i = t.nodes && t.nodes.t;
    if (i !== null)
      for (const o of i)
        (o.is_global || n) && e.push(o);
    for (var r = t.first; r !== null; ) {
      var s = r.next;
      if ((r.f & lt) === 0) {
        var a = (r.f & Cn) !== 0 || // If this is a branch effect without a block effect parent,
        // it means the parent block effect was pruned. In that case,
        // transparency information was transferred to the branch effect.
        (r.f & Ue) !== 0 && (t.f & Fe) !== 0;
        Wa(r, e, a ? n : !1);
      }
      r = s;
    }
  }
}
function Qi(t) {
  Ya(t, !0);
}
function Ya(t, e) {
  if ((t.f & ie) !== 0) {
    t.f ^= ie, (t.f & W) === 0 && (U(t, J), Tt.ensure().schedule(t));
    for (var n = t.first; n !== null; ) {
      var i = n.next, r = (n.f & Cn) !== 0 || (n.f & Ue) !== 0;
      Ya(n, r ? e : !1), n = i;
    }
    var s = t.nodes && t.nodes.t;
    if (s !== null)
      for (const a of s)
        (a.is_global || e) && a.in();
  }
}
function Xi(t, e) {
  if (t.nodes)
    for (var n = t.nodes.start, i = t.nodes.end; n !== null; ) {
      var r = n === i ? null : /* @__PURE__ */ ze(n);
      e.append(n), n = r;
    }
}
let Nr = !1, ct = !1;
function Ss(t) {
  ct = t;
}
let D = null, Ge = !1;
function ce(t) {
  D = t;
}
let I = null;
function Ce(t) {
  I = t;
}
let Ne = null;
function Ja(t) {
  D !== null && (Ne === null ? Ne = [t] : Ne.push(t));
}
let oe = null, ue = 0, me = null;
function fc(t) {
  me = t;
}
let Ka = 1, jt = 0, Jt = jt;
function xs(t) {
  Jt = t;
}
function Qa() {
  return ++Ka;
}
function pr(t) {
  var e = t.f;
  if ((e & J) !== 0)
    return !0;
  if (e & Z && (t.f &= ~Xt), (e & Ke) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      t.deps
    ), i = n.length, r = 0; r < i; r++) {
      var s = n[r];
      if (pr(
        /** @type {Derived} */
        s
      ) && Ra(
        /** @type {Derived} */
        s
      ), s.wv > t.wv)
        return !0;
    }
    (e & Se) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    X === null && U(t, W);
  }
  return !1;
}
function Xa(t, e, n = !0) {
  var i = t.reactions;
  if (i !== null && !(Ne !== null && Tn.call(Ne, t)))
    for (var r = 0; r < i.length; r++) {
      var s = i[r];
      (s.f & Z) !== 0 ? Xa(
        /** @type {Derived} */
        s,
        e,
        !1
      ) : e === s && (n ? U(s, J) : (s.f & W) !== 0 && U(s, Ke), zi(
        /** @type {Effect} */
        s
      ));
    }
}
function Za(t) {
  var A;
  var e = oe, n = ue, i = me, r = D, s = Ne, a = le, o = Ge, l = Jt, d = t.f;
  oe = /** @type {null | Value[]} */
  null, ue = 0, me = null, D = (d & (Ue | lt)) === 0 ? t : null, Ne = null, In(t.ctx), Ge = !1, Jt = ++jt, t.ac !== null && (qa(() => {
    t.ac.abort(Qr);
  }), t.ac = null);
  try {
    t.f |= Hr;
    var c = (
      /** @type {Function} */
      t.fn
    ), h = c();
    t.f |= Rt;
    var p = t.deps, y = T == null ? void 0 : T.is_fork;
    if (oe !== null) {
      var g;
      if (y || nr(t, ue), p !== null && ue > 0)
        for (p.length = ue + oe.length, g = 0; g < oe.length; g++)
          p[ue + g] = oe[g];
      else
        t.deps = p = oe;
      if (Wi() && (t.f & Se) !== 0)
        for (g = ue; g < p.length; g++)
          ((A = p[g]).reactions ?? (A.reactions = [])).push(t);
    } else !y && p !== null && ue < p.length && (nr(t, ue), p.length = ue);
    if (ga() && me !== null && !Ge && p !== null && (t.f & (Z | Ke | J)) === 0)
      for (g = 0; g < /** @type {Source[]} */
      me.length; g++)
        Xa(
          me[g],
          /** @type {Effect} */
          t
        );
    if (r !== null && r !== t) {
      if (jt++, r.deps !== null)
        for (let f = 0; f < n; f += 1)
          r.deps[f].rv = jt;
      if (e !== null)
        for (const f of e)
          f.rv = jt;
      me !== null && (i === null ? i = me : i.push(.../** @type {Source[]} */
      me));
    }
    return (t.f & Ot) !== 0 && (t.f ^= Ot), h;
  } catch (f) {
    return ba(f);
  } finally {
    t.f ^= Hr, oe = e, ue = n, me = i, D = r, Ne = s, In(a), Ge = o, Jt = l;
  }
}
function pc(t, e) {
  let n = e.reactions;
  if (n !== null) {
    var i = vl.call(n, t);
    if (i !== -1) {
      var r = n.length - 1;
      r === 0 ? n = e.reactions = null : (n[i] = n[r], n.pop());
    }
  }
  if (n === null && (e.f & Z) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (oe === null || !Tn.call(oe, e))) {
    var s = (
      /** @type {Derived} */
      e
    );
    (s.f & Se) !== 0 && (s.f ^= Se, s.f &= ~Xt), s.v !== B && Gi(s), ic(s), nr(s, 0);
  }
}
function nr(t, e) {
  var n = t.deps;
  if (n !== null)
    for (var i = e; i < n.length; i++)
      pc(t, n[i]);
}
function Ln(t) {
  var e = t.f;
  if ((e & xe) === 0) {
    U(t, W);
    var n = I, i = Nr;
    I = t, Nr = !0;
    try {
      (e & (Fe | fa)) !== 0 ? hc(t) : Ki(t), za(t);
      var r = Za(t);
      t.teardown = typeof r == "function" ? r : null, t.wv = Ka;
      var s;
      ca && Ul && (t.f & J) !== 0 && t.deps;
    } finally {
      Nr = i, I = n;
    }
  }
}
function _(t) {
  var e = t.f, n = (e & Z) !== 0;
  if (D !== null && !Ge) {
    var i = I !== null && (I.f & xe) !== 0;
    if (!i && (Ne === null || !Tn.call(Ne, t))) {
      var r = D.deps;
      if ((D.f & Hr) !== 0)
        t.rv < jt && (t.rv = jt, oe === null && r !== null && r[ue] === t ? ue++ : oe === null ? oe = [t] : oe.push(t));
      else {
        (D.deps ?? (D.deps = [])).push(t);
        var s = t.reactions;
        s === null ? t.reactions = [D] : Tn.call(s, D) || s.push(D);
      }
    }
  }
  if (ct && Wt.has(t))
    return Wt.get(t);
  if (n) {
    var a = (
      /** @type {Derived} */
      t
    );
    if (ct) {
      var o = a.v;
      return ((a.f & W) === 0 && a.reactions !== null || to(a)) && (o = Bi(a)), Wt.set(a, o), o;
    }
    var l = (a.f & Se) === 0 && !Ge && D !== null && (Nr || (D.f & Se) !== 0), d = (a.f & Rt) === 0;
    pr(a) && (l && (a.f |= Se), Ra(a)), l && !d && (Ia(a), eo(a));
  }
  if (X != null && X.has(t))
    return X.get(t);
  if ((t.f & Ot) !== 0)
    throw t.v;
  return t.v;
}
function eo(t) {
  if (t.f |= Se, t.deps !== null)
    for (const e of t.deps)
      (e.reactions ?? (e.reactions = [])).push(t), (e.f & Z) !== 0 && (e.f & Se) === 0 && (Ia(
        /** @type {Derived} */
        e
      ), eo(
        /** @type {Derived} */
        e
      ));
}
function to(t) {
  if (t.v === B) return !0;
  if (t.deps === null) return !1;
  for (const e of t.deps)
    if (Wt.has(e) || (e.f & Z) !== 0 && to(
      /** @type {Derived} */
      e
    ))
      return !0;
  return !1;
}
function Me(t) {
  var e = Ge;
  try {
    return Ge = !0, t();
  } finally {
    Ge = e;
  }
}
const Ft = Symbol("events"), no = /* @__PURE__ */ new Set(), Ri = /* @__PURE__ */ new Set();
function di(t, e, n) {
  (e[Ft] ?? (e[Ft] = {}))[t] = n;
}
function _c(t) {
  for (var e = 0; e < t.length; e++)
    no.add(t[e]);
  for (var n of Ri)
    n(t);
}
let Ts = null;
function Ns(t) {
  var f, v;
  var e = this, n = (
    /** @type {Node} */
    e.ownerDocument
  ), i = t.type, r = ((f = t.composedPath) == null ? void 0 : f.call(t)) || [], s = (
    /** @type {null | Element} */
    r[0] || t.target
  );
  Ts = t;
  var a = 0, o = Ts === t && t[Ft];
  if (o) {
    var l = r.indexOf(o);
    if (l !== -1 && (e === document || e === /** @type {any} */
    window)) {
      t[Ft] = e;
      return;
    }
    var d = r.indexOf(e);
    if (d === -1)
      return;
    l <= d && (a = l);
  }
  if (s = /** @type {Element} */
  r[a] || t.target, s !== e) {
    Dr(t, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var c = D, h = I;
    ce(null), Ce(null);
    try {
      for (var p, y = []; s !== null; ) {
        var g = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var A = (v = s[Ft]) == null ? void 0 : v[i];
          A != null && (!/** @type {any} */
          s.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          t.target === s) && A.call(s, t);
        } catch (m) {
          p ? y.push(m) : p = m;
        }
        if (t.cancelBubble || g === e || g === null)
          break;
        s = g;
      }
      if (p) {
        for (let m of y)
          queueMicrotask(() => {
            throw m;
          });
        throw p;
      }
    } finally {
      t[Ft] = e, delete t.currentTarget, ce(c), Ce(h);
    }
  }
}
var sa;
const ui = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  ((sa = globalThis == null ? void 0 : globalThis.window) == null ? void 0 : sa.trustedTypes) && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (t) => t
  })
);
function vc(t) {
  return (
    /** @type {string} */
    (ui == null ? void 0 : ui.createHTML(t)) ?? t
  );
}
function gc(t) {
  var e = ei("template");
  return e.innerHTML = vc(t.replaceAll("<!>", "<!---->")), e.content;
}
function ot(t, e) {
  var n = (
    /** @type {Effect} */
    I
  );
  n.nodes === null && (n.nodes = { start: t, end: e, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function dt(t, e) {
  var n = (e & hl) !== 0, i = (e & fl) !== 0, r, s = !t.startsWith("<!>");
  return () => {
    if (L)
      return ot(k, null), k;
    r === void 0 && (r = gc(s ? t : "<!>" + t), n || (r = /** @type {TemplateNode} */
    /* @__PURE__ */ Oe(r)));
    var a = (
      /** @type {TemplateNode} */
      i || Da ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    if (n) {
      var o = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Oe(a)
      ), l = (
        /** @type {TemplateNode} */
        a.lastChild
      );
      ot(o, l);
    } else
      ot(a, a);
    return a;
  };
}
function Cs() {
  if (L)
    return ot(k, null), k;
  var t = document.createDocumentFragment(), e = document.createComment(""), n = Te();
  return t.append(e, n), ot(e, n), t;
}
function be(t, e) {
  if (L) {
    var n = (
      /** @type {Effect & { nodes: EffectNodes }} */
      I
    );
    ((n.f & Rt) === 0 || n.nodes.end === null) && (n.nodes.end = k), Rn();
    return;
  }
  t !== null && t.before(
    /** @type {Node} */
    e
  );
}
const mc = ["touchstart", "touchmove"];
function bc(t) {
  return mc.includes(t);
}
function yc(t, e) {
  var n = e == null ? "" : typeof e == "object" ? `${e}` : e;
  n !== /** @type {any} */
  (t[Bn] ?? (t[Bn] = t.nodeValue)) && (t[Bn] = n, t.nodeValue = `${n}`);
}
function ro(t, e) {
  return io(t, e);
}
function wc(t, e) {
  Ci(), e.intro = e.intro ?? !1;
  const n = e.target, i = L, r = k;
  try {
    for (var s = /* @__PURE__ */ Oe(n); s && (s.nodeType !== Mn || /** @type {Comment} */
    s.data !== oa); )
      s = /* @__PURE__ */ ze(s);
    if (!s)
      throw Qt;
    qe(!0), te(
      /** @type {Comment} */
      s
    );
    const a = io(t, { ...e, anchor: s });
    return qe(!1), /**  @type {Exports} */
    a;
  } catch (a) {
    if (a instanceof Error && a.message.split(`
`).some((o) => o.startsWith("https://svelte.dev/e/")))
      throw a;
    return a !== Qt && console.warn("Failed to hydrate: ", a), e.recover === !1 && Ll(), Ci(), ja(n), qe(!1), ro(t, e);
  } finally {
    qe(i), te(r);
  }
}
const yr = /* @__PURE__ */ new Map();
function io(t, { target: e, anchor: n, props: i = {}, events: r, context: s, intro: a = !0, transformError: o }) {
  Ci();
  var l = void 0, d = dc(() => {
    var c = n ?? e.appendChild(Te());
    Ql(
      /** @type {TemplateNode} */
      c,
      {
        pending: () => {
        }
      },
      (y) => {
        Fi({});
        var g = (
          /** @type {ComponentContext} */
          le
        );
        if (s && (g.c = s), r && (i.$$events = r), L && ot(
          /** @type {TemplateNode} */
          y,
          null
        ), l = t(y, i) || {}, L && (I.nodes.end = k, k === null || k.nodeType !== Mn || /** @type {Comment} */
        k.data !== ji))
          throw fr(), Qt;
        qi();
      },
      o
    );
    var h = /* @__PURE__ */ new Set(), p = (y) => {
      for (var g = 0; g < y.length; g++) {
        var A = y[g];
        if (!h.has(A)) {
          h.add(A);
          var f = bc(A);
          for (const w of [e, document]) {
            var v = yr.get(w);
            v === void 0 && (v = /* @__PURE__ */ new Map(), yr.set(w, v));
            var m = v.get(A);
            m === void 0 ? (w.addEventListener(A, Ns, { passive: f }), v.set(A, 1)) : v.set(A, m + 1);
          }
        }
      }
    };
    return p(Jr(no)), Ri.add(p), () => {
      var f;
      for (var y of h)
        for (const v of [e, document]) {
          var g = (
            /** @type {Map<string, number>} */
            yr.get(v)
          ), A = (
            /** @type {number} */
            g.get(y)
          );
          --A == 0 ? (v.removeEventListener(y, Ns), g.delete(y), g.size === 0 && yr.delete(v)) : g.set(y, A);
        }
      Ri.delete(p), c !== n && ((f = c.parentNode) == null || f.removeChild(c));
    };
  });
  return Ii.set(l, d), l;
}
let Ii = /* @__PURE__ */ new WeakMap();
function Ec(t, e) {
  const n = Ii.get(t);
  return n ? (Ii.delete(t), n(e)) : Promise.resolve();
}
var De, Ye, _e, Vt, ur, hr, Yr;
class $c {
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(e, n = !0) {
    /** @type {TemplateNode} */
    j(this, "anchor");
    /** @type {Map<Batch, Key>} */
    C(this, De, /* @__PURE__ */ new Map());
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
    C(this, Ye, /* @__PURE__ */ new Map());
    /**
     * Similar to #onscreen with respect to the keys, but contains branches that are not yet
     * in the DOM, because their insertion is deferred.
     * @type {Map<Key, Branch>}
     */
    C(this, _e, /* @__PURE__ */ new Map());
    /**
     * Keys of effects that are currently outroing
     * @type {Set<Key>}
     */
    C(this, Vt, /* @__PURE__ */ new Set());
    /**
     * Whether to pause (i.e. outro) on change, or destroy immediately.
     * This is necessary for `<svelte:element>`
     */
    C(this, ur, !0);
    /**
     * @param {Batch} batch
     */
    C(this, hr, (e) => {
      if (u(this, De).has(e)) {
        var n = (
          /** @type {Key} */
          u(this, De).get(e)
        ), i = u(this, Ye).get(n);
        if (i)
          Qi(i), u(this, Vt).delete(n);
        else {
          var r = u(this, _e).get(n);
          r && (u(this, Ye).set(n, r.effect), u(this, _e).delete(n), r.fragment.lastChild.remove(), this.anchor.before(r.fragment), i = r.effect);
        }
        for (const [s, a] of u(this, De)) {
          if (u(this, De).delete(s), s === e)
            break;
          const o = u(this, _e).get(a);
          o && (se(o.effect), u(this, _e).delete(a));
        }
        for (const [s, a] of u(this, Ye)) {
          if (s === n || u(this, Vt).has(s)) continue;
          const o = () => {
            if (Array.from(u(this, De).values()).includes(s)) {
              var d = document.createDocumentFragment();
              Xi(a, d), d.append(Te()), u(this, _e).set(s, { effect: a, fragment: d });
            } else
              se(a);
            u(this, Vt).delete(s), u(this, Ye).delete(s);
          };
          u(this, ur) || !i ? (u(this, Vt).add(s), Yt(a, o, !1)) : o();
        }
      }
    });
    /**
     * @param {Batch} batch
     */
    C(this, Yr, (e) => {
      u(this, De).delete(e);
      const n = Array.from(u(this, De).values());
      for (const [i, r] of u(this, _e))
        n.includes(i) || (se(r.effect), u(this, _e).delete(i));
    });
    this.anchor = e, S(this, ur, n);
  }
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(e, n) {
    var i = (
      /** @type {Batch} */
      T
    ), r = Fa();
    if (n && !u(this, Ye).has(e) && !u(this, _e).has(e))
      if (r) {
        var s = document.createDocumentFragment(), a = Te();
        s.append(a), u(this, _e).set(e, {
          effect: Ae(() => n(a)),
          fragment: s
        });
      } else
        u(this, Ye).set(
          e,
          Ae(() => n(this.anchor))
        );
    if (u(this, De).set(i, e), r) {
      for (const [o, l] of u(this, Ye))
        o === e ? i.unskip_effect(l) : i.skip_effect(l);
      for (const [o, l] of u(this, _e))
        o === e ? i.unskip_effect(l.effect) : i.skip_effect(l.effect);
      i.oncommit(u(this, hr)), i.ondiscard(u(this, Yr));
    } else
      L && (this.anchor = k), u(this, hr).call(this, i);
  }
}
De = new WeakMap(), Ye = new WeakMap(), _e = new WeakMap(), Vt = new WeakMap(), ur = new WeakMap(), hr = new WeakMap(), Yr = new WeakMap();
function so(t) {
  le === null && xl(), yn(() => {
    const e = Me(t);
    if (typeof e == "function") return (
      /** @type {() => void} */
      e
    );
  });
}
function _t(t, e, n = !1) {
  var i;
  L && (i = k, Rn());
  var r = new $c(t), s = n ? Cn : 0;
  function a(o, l) {
    if (L) {
      var d = pa(
        /** @type {TemplateNode} */
        i
      );
      if (o !== parseInt(d.substring(1))) {
        var c = jr();
        te(c), r.anchor = c, qe(!1), r.ensure(o, l), qe(!0);
        return;
      }
    }
    r.ensure(o, l);
  }
  Ji(() => {
    var o = !1;
    e((l, d = 0) => {
      o = !0, a(d, l);
    }), o || a(-1, null);
  }, s);
}
function Ac(t, e, n) {
  for (var i = [], r = e.length, s, a = e.length, o = 0; o < r; o++) {
    let h = e[o];
    Yt(
      h,
      () => {
        if (s) {
          if (s.pending.delete(h), s.done.add(h), s.pending.size === 0) {
            var p = (
              /** @type {Set<EachOutroGroup>} */
              t.outrogroups
            );
            ki(t, Jr(s.done)), p.delete(s), p.size === 0 && (t.outrogroups = null);
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
      var d = (
        /** @type {Element} */
        n
      ), c = (
        /** @type {Element} */
        d.parentNode
      );
      ja(c), c.append(d), t.items.clear();
    }
    ki(t, e, !l);
  } else
    s = {
      pending: new Set(e),
      done: /* @__PURE__ */ new Set()
    }, (t.outrogroups ?? (t.outrogroups = /* @__PURE__ */ new Set())).add(s);
}
function ki(t, e, n = !0) {
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
      s.f |= at;
      const a = document.createDocumentFragment();
      Xi(s, a);
    } else
      se(e[r], n);
  }
}
var Rs;
function Oc(t, e, n, i, r, s = null) {
  var a = t, o = /* @__PURE__ */ new Map();
  {
    var l = (
      /** @type {Element} */
      t
    );
    a = L ? te(/* @__PURE__ */ Oe(l)) : l.appendChild(Te());
  }
  L && Rn();
  var d = null, c = /* @__PURE__ */ nc(() => {
    var m = n();
    return da(m) ? m : m == null ? [] : Jr(m);
  }), h, p = /* @__PURE__ */ new Map(), y = !0;
  function g(m) {
    (v.effect.f & xe) === 0 && (v.pending.delete(m), v.fallback = d, Sc(v, h, a, e, i), d !== null && (h.length === 0 ? (d.f & at) === 0 ? Qi(d) : (d.f ^= at, Wn(d, null, a)) : Yt(d, () => {
      d = null;
    })));
  }
  function A(m) {
    v.pending.delete(m);
  }
  var f = Ji(() => {
    h = /** @type {V[]} */
    _(c);
    var m = h.length;
    let w = !1;
    if (L) {
      var N = pa(a) === Hi;
      N !== (m === 0) && (a = jr(), te(a), qe(!1), w = !0);
    }
    for (var O = /* @__PURE__ */ new Set(), R = (
      /** @type {Batch} */
      T
    ), H = Fa(), Y = 0; Y < m; Y += 1) {
      L && k.nodeType === Mn && /** @type {Comment} */
      k.data === ji && (a = /** @type {Comment} */
      k, w = !0, qe(!1));
      var ge = h[Y], It = i(ge, Y), de = y ? null : o.get(It);
      de ? (de.v && kn(de.v, ge), de.i && kn(de.i, Y), H && R.unskip_effect(de.e)) : (de = xc(
        o,
        y ? a : Rs ?? (Rs = Te()),
        ge,
        It,
        Y,
        r,
        e,
        n
      ), y || (de.e.f |= at), o.set(It, de)), O.add(It);
    }
    if (m === 0 && s && !d && (y ? d = Ae(() => s(a)) : (d = Ae(() => s(Rs ?? (Rs = Te()))), d.f |= at)), m > O.size && Nl(), L && m > 0 && te(jr()), !y)
      if (p.set(R, O), H) {
        for (const [mr, an] of o)
          O.has(mr) || R.skip_effect(an.e);
        R.oncommit(g), R.ondiscard(A);
      } else
        g(R);
    w && qe(!0), _(c);
  }), v = { effect: f, items: o, pending: p, outrogroups: null, fallback: d };
  y = !1, L && (a = k);
}
function Un(t) {
  for (; t !== null && (t.f & Ue) === 0; )
    t = t.next;
  return t;
}
function Sc(t, e, n, i, r) {
  var Y;
  var s = e.length, a = t.items, o = Un(t.effect.first), l, d = null, c = [], h = [], p, y, g, A;
  for (A = 0; A < s; A += 1) {
    if (p = e[A], y = r(p, A), g = /** @type {EachItem} */
    a.get(y).e, t.outrogroups !== null)
      for (const ge of t.outrogroups)
        ge.pending.delete(g), ge.done.delete(g);
    if ((g.f & ie) !== 0 && Qi(g), (g.f & at) !== 0)
      if (g.f ^= at, g === o)
        Wn(g, null, n);
      else {
        var f = d ? d.next : o;
        g === t.effect.last && (t.effect.last = g.prev), g.prev && (g.prev.next = g.next), g.next && (g.next.prev = g.prev), ht(t, d, g), ht(t, g, f), Wn(g, f, n), d = g, c = [], h = [], o = Un(d.next);
        continue;
      }
    if (g !== o) {
      if (l !== void 0 && l.has(g)) {
        if (c.length < h.length) {
          var v = h[0], m;
          d = v.prev;
          var w = c[0], N = c[c.length - 1];
          for (m = 0; m < c.length; m += 1)
            Wn(c[m], v, n);
          for (m = 0; m < h.length; m += 1)
            l.delete(h[m]);
          ht(t, w.prev, N.next), ht(t, d, w), ht(t, N, v), o = v, d = N, A -= 1, c = [], h = [];
        } else
          l.delete(g), Wn(g, o, n), ht(t, g.prev, g.next), ht(t, g, d === null ? t.effect.first : d.next), ht(t, d, g), d = g;
        continue;
      }
      for (c = [], h = []; o !== null && o !== g; )
        (l ?? (l = /* @__PURE__ */ new Set())).add(o), h.push(o), o = Un(o.next);
      if (o === null)
        continue;
    }
    (g.f & at) === 0 && c.push(g), d = g, o = Un(g.next);
  }
  if (t.outrogroups !== null) {
    for (const ge of t.outrogroups)
      ge.pending.size === 0 && (ki(t, Jr(ge.done)), (Y = t.outrogroups) == null || Y.delete(ge));
    t.outrogroups.size === 0 && (t.outrogroups = null);
  }
  if (o !== null || l !== void 0) {
    var O = [];
    if (l !== void 0)
      for (g of l)
        (g.f & ie) === 0 && O.push(g);
    for (; o !== null; )
      (o.f & ie) === 0 && o !== t.fallback && O.push(o), o = Un(o.next);
    var R = O.length;
    if (R > 0) {
      var H = s === 0 ? n : null;
      Ac(t, O, H);
    }
  }
}
function xc(t, e, n, i, r, s, a, o) {
  var l = (a & cl) !== 0 ? (a & ul) === 0 ? /* @__PURE__ */ La(n, !1, !1) : Zt(n) : null, d = (a & dl) !== 0 ? Zt(r) : null;
  return {
    v: l,
    i: d,
    e: Ae(() => (s(e, l ?? n, d ?? r, o), () => {
      t.delete(i);
    }))
  };
}
function Wn(t, e, n) {
  if (t.nodes)
    for (var i = t.nodes.start, r = t.nodes.end, s = e && (e.f & at) === 0 ? (
      /** @type {EffectNodes} */
      e.nodes.start
    ) : n; i !== null; ) {
      var a = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ ze(i)
      );
      if (s.before(i), i === r)
        return;
      i = a;
    }
}
function ht(t, e, n) {
  e === null ? t.effect.first = n : e.next = n, n === null ? t.effect.last = e : n.prev = e;
}
function Tc(t, e, n = !1, i = !1, r = !1, s = !1) {
  var a = t, o = "";
  if (n) {
    var l = (
      /** @type {Element} */
      t
    );
    L && (a = te(/* @__PURE__ */ Oe(l)));
  }
  et(() => {
    var d = (
      /** @type {Effect} */
      I
    );
    if (o === (o = e() ?? "")) {
      L && Rn();
      return;
    }
    if (n && !L) {
      d.nodes = null, l.innerHTML = /** @type {string} */
      o, o !== "" && ot(
        /** @type {TemplateNode} */
        /* @__PURE__ */ Oe(l),
        /** @type {TemplateNode} */
        l.lastChild
      );
      return;
    }
    if (d.nodes !== null && (Ba(
      d.nodes.start,
      /** @type {TemplateNode} */
      d.nodes.end
    ), d.nodes = null), o !== "") {
      if (L) {
        k.data;
        for (var c = Rn(), h = c; c !== null && (c.nodeType !== Mn || /** @type {Comment} */
        c.data !== ""); )
          h = c, c = /* @__PURE__ */ ze(c);
        if (c === null)
          throw fr(), Qt;
        ot(k, h), a = te(c);
        return;
      }
      var p = i ? pl : r ? _l : void 0, y = (
        /** @type {HTMLTemplateElement | SVGElement | MathMLElement} */
        ei(i ? "svg" : r ? "math" : "template", p)
      );
      y.innerHTML = /** @type {any} */
      o;
      var g = i || r ? y : (
        /** @type {HTMLTemplateElement} */
        y.content
      );
      if (ot(
        /** @type {TemplateNode} */
        /* @__PURE__ */ Oe(g),
        /** @type {TemplateNode} */
        g.lastChild
      ), i || r)
        for (; /* @__PURE__ */ Oe(g); )
          a.before(
            /** @type {TemplateNode} */
            /* @__PURE__ */ Oe(g)
          );
      else
        a.before(g);
    }
  });
}
function ao(t, e) {
  Ua(() => {
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
      const r = ei("style");
      r.id = e.hash, r.textContent = e.code, i.appendChild(r);
    }
  });
}
function Nc(t, e, n) {
  var i = t == null ? "" : "" + t;
  return e && (i = i ? i + " " + e : e), i === "" ? null : i;
}
function Cc(t, e) {
  return t == null ? null : String(t);
}
function ke(t, e, n, i, r, s) {
  var a = (
    /** @type {any} */
    t[wi]
  );
  if (L || a !== n || a === void 0) {
    var o = Nc(n, i);
    (!L || o !== t.getAttribute("class")) && (o == null ? t.removeAttribute("class") : t.className = o), t[wi] = n;
  }
  return s;
}
function vt(t, e, n, i) {
  var r = (
    /** @type {any} */
    t[Ei]
  );
  if (L || r !== e) {
    var s = Cc(e);
    (!L || s !== t.getAttribute("style")) && (s == null ? t.removeAttribute("style") : t.style.cssText = s), t[Ei] = e;
  }
  return i;
}
const Rc = Symbol("is custom element"), Ic = Symbol("is html"), kc = Sl ? "link" : "LINK";
function oo(t, e, n, i) {
  var r = Lc(t);
  L && (r[e] = t.getAttribute(e), e === "src" || e === "srcset" || e === "href" && t.nodeName === kc) || r[e] !== (r[e] = n) && (e === "loading" && (t[Ol] = n), n == null ? t.removeAttribute(e) : typeof n != "string" && lo(t).includes(e) ? t[e] = n : t.setAttribute(e, n));
}
function Is(t, e, n) {
  var i = D, r = I;
  let s = L;
  L && qe(!1), ce(null), Ce(null);
  try {
    // `style` should use `set_attribute` rather than the setter
    e !== "style" && // Don't compute setters for custom elements while they aren't registered yet,
    // because during their upgrade/instantiation they might add more setters.
    // Instead, fall back to a simple "an object, then set as property" heuristic.
    (Li.has(t.getAttribute("is") || t.nodeName) || // customElements may not be available in browser extension contexts
    !customElements || customElements.get(t.getAttribute("is") || t.nodeName.toLowerCase()) ? lo(t).includes(e) : n && typeof n == "object") ? t[e] = n : oo(t, e, n == null ? n : String(n));
  } finally {
    ce(i), Ce(r), s && qe(!0);
  }
}
function Lc(t) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    /** @type {any} */
    t[Ar] ?? (t[Ar] = {
      [Rc]: t.nodeName.includes("-"),
      [Ic]: t.namespaceURI === la
    })
  );
}
var Li = /* @__PURE__ */ new Map();
function lo(t) {
  var e = t.getAttribute("is") || t.nodeName, n = Li.get(e);
  if (n) return n;
  Li.set(e, n = []);
  for (var i, r = t, s = Element.prototype; s !== r; ) {
    i = gl(r);
    for (var a in i)
      i[a].set && // better safe than sorry, we don't want spread attributes to mess with HTML content
      a !== "innerHTML" && a !== "textContent" && a !== "innerText" && n.push(a);
    r = ua(r);
  }
  return n;
}
function hi(t, e) {
  return t === e || (t == null ? void 0 : t[$r]) === e;
}
function gt(t = {}, e, n, i) {
  var r = (
    /** @type {ComponentContext} */
    le.r
  ), s = (
    /** @type {Effect} */
    I
  );
  return Ua(() => {
    var a, o;
    return Yi(() => {
      a = o, o = [], Me(() => {
        hi(n(...o), t) || (e(t, ...o), a && hi(n(...a), t) && e(null, ...a));
      });
    }), () => {
      let l = s;
      for (; l !== r && l.parent !== null && l.parent.f & yi; )
        l = l.parent;
      const d = () => {
        o && hi(n(...o), t) && e(null, ...o);
      }, c = l.teardown;
      l.teardown = () => {
        d(), c == null || c();
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
    var p = (
      /** @type {V} */
      t[e]
    );
    return p === void 0 ? a() : (s = !0, p);
  };
  var d = !1, c = /* @__PURE__ */ Zr(() => (d = !1, l())), h = (
    /** @type {Effect} */
    I
  );
  return (
    /** @type {() => V} */
    (function(p, y) {
      if (arguments.length > 0) {
        const g = y ? _(c) : p;
        return x(c, g), d = !0, r !== void 0 && (r = g), p;
      }
      return ct && d || (h.f & xe) !== 0 ? c.v : _(c);
    })
  );
}
function Pc(t) {
  return new Dc(t);
}
var st, Ee;
class Dc {
  /**
   * @param {ComponentConstructorOptions & {
   *  component: any;
   * }} options
   */
  constructor(e) {
    /** @type {any} */
    C(this, st);
    /** @type {Record<string, any>} */
    C(this, Ee);
    var s;
    var n = /* @__PURE__ */ new Map(), i = (a, o) => {
      var l = /* @__PURE__ */ La(o, !1, !1);
      return n.set(a, l), l;
    };
    const r = new Proxy(
      { ...e.props || {}, $$events: {} },
      {
        get(a, o) {
          return _(n.get(o) ?? i(o, Reflect.get(a, o)));
        },
        has(a, o) {
          return o === Al ? !0 : (_(n.get(o) ?? i(o, Reflect.get(a, o))), Reflect.has(a, o));
        },
        set(a, o, l) {
          return x(n.get(o) ?? i(o, l), l), Reflect.set(a, o, l);
        }
      }
    );
    S(this, Ee, (e.hydrate ? wc : ro)(e.component, {
      target: e.target,
      anchor: e.anchor,
      props: r,
      context: e.context,
      intro: e.intro ?? !1,
      recover: e.recover,
      transformError: e.transformError
    })), (!((s = e == null ? void 0 : e.props) != null && s.$$host) || e.sync === !1) && $e(), S(this, st, r.$$events);
    for (const a of Object.keys(u(this, Ee)))
      a === "$set" || a === "$destroy" || a === "$on" || Dr(this, a, {
        get() {
          return u(this, Ee)[a];
        },
        /** @param {any} value */
        set(o) {
          u(this, Ee)[a] = o;
        },
        enumerable: !0
      });
    u(this, Ee).$set = /** @param {Record<string, any>} next */
    (a) => {
      Object.assign(r, a);
    }, u(this, Ee).$destroy = () => {
      Ec(u(this, Ee));
    };
  }
  /** @param {Record<string, any>} props */
  $set(e) {
    u(this, Ee).$set(e);
  }
  /**
   * @param {string} event
   * @param {(...args: any[]) => any} callback
   * @returns {any}
   */
  $on(e, n) {
    u(this, st)[e] = u(this, st)[e] || [];
    const i = (...r) => n.call(this, ...r);
    return u(this, st)[e].push(i), () => {
      u(this, st)[e] = u(this, st)[e].filter(
        /** @param {any} fn */
        (r) => r !== i
      );
    };
  }
  $destroy() {
    u(this, Ee).$destroy();
  }
}
st = new WeakMap(), Ee = new WeakMap();
let co;
typeof HTMLElement == "function" && (co = class extends HTMLElement {
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
        return (s) => {
          const a = ei("slot");
          r !== "default" && (a.name = r), be(s, a);
        };
      };
      if (await Promise.resolve(), !this.$$cn || this.$$c)
        return;
      const n = {}, i = Mc(this);
      for (const r of this.$$s)
        r in i && (r === "default" && !this.$$d.children ? (this.$$d.children = e(r), n.default = !0) : n[r] = e(r));
      for (const r of this.attributes) {
        const s = this.$$g_p(r.name);
        s in this.$$d || (this.$$d[s] = Cr(s, r.value, this.$$p_d, "toProp"));
      }
      for (const r in this.$$p_d)
        !(r in this.$$d) && this[r] !== void 0 && (this.$$d[r] = this[r], delete this[r]);
      this.$$c = Pc({
        component: this.$$ctor,
        target: this.$$shadowRoot || this,
        props: {
          ...this.$$d,
          $$slots: n,
          $$host: this
        }
      }), this.$$me = cc(() => {
        Yi(() => {
          var r;
          this.$$r = !0;
          for (const s of Pr(this.$$c)) {
            if (!((r = this.$$p_d[s]) != null && r.reflect)) continue;
            this.$$d[s] = this.$$c[s];
            const a = Cr(
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
    this.$$r || (e = this.$$g_p(e), this.$$d[e] = Cr(e, i, this.$$p_d, "toProp"), (r = this.$$c) == null || r.$set({ [e]: this.$$d[e] }));
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
    return Pr(this.$$p_d).find(
      (n) => this.$$p_d[n].attribute === e || !this.$$p_d[n].attribute && n.toLowerCase() === e
    ) || e;
  }
});
function Cr(t, e, n, i) {
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
function Mc(t) {
  const e = {};
  return t.childNodes.forEach((n) => {
    e[
      /** @type {Element} node */
      n.slot || "default"
    ] = !0;
  }), e;
}
function uo(t, e, n, i, r, s) {
  let a = class extends co {
    constructor() {
      super(t, n, r), this.$$p_d = e;
    }
    static get observedAttributes() {
      return Pr(e).map(
        (o) => (e[o].attribute || o).toLowerCase()
      );
    }
  };
  return Pr(e).forEach((o) => {
    Dr(a.prototype, o, {
      get() {
        return this.$$c && o in this.$$c ? this.$$c[o] : this.$$d[o];
      },
      set(l) {
        var h;
        l = Cr(o, l, e), this.$$d[o] = l;
        var d = this.$$c;
        if (d) {
          var c = (h = gn(d, o)) == null ? void 0 : h.get;
          c ? d[o] = l : d.$set({ [o]: l });
        }
      }
    });
  }), i.forEach((o) => {
    Dr(a.prototype, o, {
      get() {
        var l;
        return (l = this.$$c) == null ? void 0 : l[o];
      }
    });
  }), s && (a = s(a)), t.element = /** @type {any} */
  a, a;
}
class Zi extends Error {
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  constructor(e, ...n) {
    super(...n), Error.captureStackTrace && Error.captureStackTrace(this, Zi), this.name = "TimeoutError", this.timeout = e, this.message = `Timed out in ${e} ms.`;
  }
}
const Hc = (t, e) => {
  const n = new Promise((i, r) => {
    setTimeout(() => {
      r(new Zi(t));
    }, t);
  });
  return Promise.race([e, n]);
}, ho = (t) => {
  if (typeof t.getCardSize == "function")
    try {
      return Hc(500, t.getCardSize()).catch(
        () => 1
      );
    } catch {
      return 1;
    }
  return customElements.get(t.localName) ? 1 : customElements.whenDefined(t.localName).then(() => ho(t));
};
var jc = /* @__PURE__ */ dt('<span class="loading svelte-lv9s7p">Loading...</span>'), Fc = /* @__PURE__ */ dt("<div><!></div>");
const qc = {
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
function Pi(t, e) {
  Fi(e, !0), ao(t, qc);
  const n = Pe(e, "config"), i = Pe(e, "hass"), r = Pe(e, "preview"), s = Pe(e, "marginTop", 7, "0px"), a = Pe(e, "open"), o = Pe(e, "animation", 7, !0), l = Pe(e, "animationState"), d = Pe(e, "clearCardCss", 7, !1);
  let c = null, h = /* @__PURE__ */ F(null), p = /* @__PURE__ */ F(!0), y = /* @__PURE__ */ F(0);
  const g = Me(() => JSON.parse(JSON.stringify(n())));
  yn(() => {
    _(h) && (_(h).hass = i());
  }), yn(() => {
    _(h) && r() !== void 0 && (_(h).preview = r());
  }), yn(() => {
    var w;
    _(h) && (g.disabled = !a(), (w = _(h)._element) == null || w.dispatchEvent(new CustomEvent("card-visibility-changed", { detail: { value: a() }, bubbles: !0, composed: !1 })));
  }), so(async () => {
    const w = document.createElement("hui-card");
    w.hass = i(), w.preview = r(), g.disabled = !a(), w.config = g, w.load(), c == null || c.appendChild(w), x(h, w, !0), x(p, !1), _(h).addEventListener(
      "ll-upgrade",
      (N) => {
        var O;
        N.stopPropagation(), (O = _(h)) != null && O._element && i() && (_(h)._element.hass = i());
      },
      { capture: !0 }
    ), d() && (w.style.setProperty("--ha-card-background", "transparent"), w.style.setProperty("--ha-card-box-shadow", "none"), w.style.setProperty("--ha-card-border-color", "transparent"), w.style.setProperty("--ha-card-border-width", "0px"), w.style.setProperty("--ha-card-backdrop-filter", "none")), o() && (x(y, await ho(w) * 56), c && x(y, _(y) + (window.getComputedStyle(c).marginTop ? parseFloat(window.getComputedStyle(c).marginTop) : 0)), new ResizeObserver((O) => {
      for (const R of O)
        if (R.contentBoxSize) {
          const H = Array.isArray(R.contentBoxSize) ? R.contentBoxSize[0] : R.contentBoxSize;
          H.blockSize && (x(y, H.blockSize, !0), _(h) && x(y, _(y) + (window.getComputedStyle(_(h)).marginTop ? parseFloat(window.getComputedStyle(_(h)).marginTop) : 0)));
        } else R.contentRect && (x(y, R.contentRect.height, !0), _(h) && x(y, _(y) + (window.getComputedStyle(_(h)).marginTop ? parseFloat(window.getComputedStyle(_(h)).marginTop) : 0)));
    }).observe(w));
  });
  var A = {
    get config() {
      return n();
    },
    set config(w) {
      n(w), $e();
    },
    get hass() {
      return i();
    },
    set hass(w) {
      i(w), $e();
    },
    get preview() {
      return r();
    },
    set preview(w) {
      r(w), $e();
    },
    get marginTop() {
      return s();
    },
    set marginTop(w = "0px") {
      s(w), $e();
    },
    get open() {
      return a();
    },
    set open(w) {
      a(w), $e();
    },
    get animation() {
      return o();
    },
    set animation(w = !0) {
      o(w), $e();
    },
    get animationState() {
      return l();
    },
    set animationState(w) {
      l(w), $e();
    },
    get clearCardCss() {
      return d();
    },
    set clearCardCss(w = !1) {
      d(w), $e();
    }
  }, f = Fc(), v = pt(f);
  {
    var m = (w) => {
      var N = jc();
      be(w, N);
    };
    _t(v, (w) => {
      _(p) && w(m);
    });
  }
  return Ze(f), gt(f, (w) => c = w, () => c), et(() => {
    ke(f, 1, `outer-container${a() ? " open" : " close"}${o() ? " animation " + l() : ""}`, "svelte-lv9s7p"), vt(f, `--child-card-margin-top: ${(a() ? s() : "0px") ?? ""};${_(y) ? ` --expander-animation-height: -${_(y)}px;` : ""}`);
  }), be(t, f), qi(A);
}
customElements.define("expander-sub-card", uo(
  Pi,
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
const Gc = (t, e) => {
  var n;
  (n = t.dispatchEvent) == null || n.call(
    t,
    new CustomEvent(
      "haptic",
      { detail: e, bubbles: !0, composed: !0 }
    )
  );
};
var _r = function(t, e, n) {
  var i;
  n === void 0 && (n = {});
  var r = n.retries, s = r === void 0 ? 10 : r, a = n.delay, o = a === void 0 ? 10 : a, l = n.shouldReject, d = l === void 0 || l, c = (i = n.rejectMessage) !== null && i !== void 0 ? i : "Could not get the result after {{ retries }} retries";
  return new Promise((function(h, p) {
    var y = 0, g = function() {
      var A = t();
      e(A) ? h(A) : ++y < s ? setTimeout(g, o) : d ? p(new Error(c.replace(/\{\{\s*retries\s*\}\}/g, "".concat(s)))) : h(A);
    };
    g();
  }));
};
const fi = "[home-assistant-javascript-templates]", Uc = /^([a-z_]+)\.(\w+)$/;
var Gr, vn, He, mt;
(function(t) {
  t.UNKNOWN = "unknown", t.UNAVAILABLE = "unavailable";
})(Gr || (Gr = {})), (function(t) {
  t.AREA_ID = "area_id", t.NAME = "name";
})(vn || (vn = {})), (function(t) {
  t.PANEL_URL = "panel_url", t.LANG = "lang";
})(He || (He = {})), (function(t) {
  t.LOCATION_CHANGED = "location-changed", t.TRANSLATIONS_UPDATED = "translations-updated", t.POPSTATE = "popstate", t.SUBSCRIBE_EVENTS = "subscribe_events", t.STATE_CHANGE_EVENT = "state_changed";
})(mt || (mt = {}));
const zc = "refs", ks = (t) => t.reduce((e, n) => {
  const [i, r] = n;
  return e[i.replace(Uc, "$2")] = r, e;
}, {}), ft = (t) => t.includes("."), Rr = "ref", Dt = "value", Ls = "toJSON", Ps = (t) => `${Rr}.${t}`;
function Bc(t, e, n) {
  const i = () => Object.entries(t.hass.areas), r = () => Object.entries(t.hass.devices), s = () => Object.entries(t.hass.entities), a = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map(), l = (f, v) => {
    n && console.warn(`${f} ${v} used in a JavaScript template doesn't exist`);
  }, d = (f) => l("Entity", f), c = (f) => l("Domain", f), h = (f) => {
    const v = new SyntaxError(f);
    if (e) throw v;
    n && console.warn(v);
  }, p = (f) => {
    t.hass.states[f] ? a.add(f) : d(f);
  }, y = (f) => {
    a.add(f);
  }, g = (f, v) => {
    const { with_unit: m = !1, rounded: w = !1 } = v;
    if (f) {
      const N = f.state, O = f.attributes.unit_of_measurement, R = Number(w), H = w === !1 || isNaN(Number(N)) ? N : new Intl.NumberFormat(t.hass.language, { minimumFractionDigits: R, maximumFractionDigits: R }).format(Number(N));
      return m && O ? `${H} ${O}` : H;
    }
  }, A = (f) => new Proxy(f, { get: (v, m) => m === "state_with_unit" ? g(v, { rounded: !0, with_unit: !0 }) : v[m] });
  return { get hass() {
    return t.hass;
  }, states: new Proxy((f, v = {}) => {
    if (ft(f)) return p(f), g(t.hass.states[f], v);
    throw SyntaxError(`${fi}: states method cannot be used with a domain, use it as an object instead.`);
  }, { get(f, v) {
    if (ft(v)) return p(v), A(t.hass.states[v]);
    const m = Object.entries(t.hass.states).filter(([w]) => w.startsWith(v));
    return m.length || c(v), new Proxy(ks(m), { get: (w, N) => (p(`${v}.${N}`), A(w[N])) });
  } }), state_translated(f) {
    if (p(f), t.hass.states[f]) return t.hass.formatEntityState(t.hass.states[f]);
  }, is_state(f, v) {
    var m;
    return p(f), Array.isArray(v) ? v.some((w) => {
      var N;
      return ((N = t.hass.states[f]) === null || N === void 0 ? void 0 : N.state) === w;
    }) : ((m = t.hass.states[f]) === null || m === void 0 ? void 0 : m.state) === v;
  }, state_attr(f, v) {
    var m, w;
    return p(f), (w = (m = t.hass.states[f]) === null || m === void 0 ? void 0 : m.attributes) === null || w === void 0 ? void 0 : w[v];
  }, is_state_attr(f, v, m) {
    return this.state_attr(f, v) === m;
  }, has_value(f) {
    return this.states(f) ? !(this.is_state(f, Gr.UNKNOWN) || this.is_state(f, Gr.UNAVAILABLE)) : (d(f), !1);
  }, entities: new Proxy((f) => {
    if (f === void 0) return t.hass.entities;
    if (ft(f)) return p(f), t.hass.entities[f];
    const v = s().filter(([m]) => m.startsWith(f));
    return v.length || c(f), new Proxy(ks(v), { get: (m, w) => (p(`${f}.${w}`), m[w]) });
  }, { get: (f, v) => f(v) }), entity_prop(f, v) {
    var m;
    return p(f), (m = t.hass.entities[f]) === null || m === void 0 ? void 0 : m[v];
  }, is_entity_prop(f, v, m) {
    return this.entity_prop(f, v) === m;
  }, devices: new Proxy((f) => {
    if (f === void 0) return t.hass.devices;
    if (ft(f)) throw SyntaxError(`${fi}: devices method cannot be used with an entity id, you should use a device id instead.`);
    return t.hass.devices[f];
  }, { get(f, v) {
    if (ft(v)) throw SyntaxError(`${fi}: devices cannot be accesed using an entity id, you should use a device id instead.`);
    return t.hass.devices[v];
  } }), device_attr(f, v) {
    var m, w, N;
    if (ft(f)) {
      p(f);
      const O = (m = t.hass.entities[f]) === null || m === void 0 ? void 0 : m.device_id;
      return (w = t.hass.devices[O]) === null || w === void 0 ? void 0 : w[v];
    }
    return (N = t.hass.devices[f]) === null || N === void 0 ? void 0 : N[v];
  }, is_device_attr(f, v, m) {
    return this.device_attr(f, v) === m;
  }, device_id(f) {
    var v;
    if (ft(f)) return p(f), (v = t.hass.entities[f]) === null || v === void 0 ? void 0 : v.device_id;
    const m = r().find((w) => w[1].name === f);
    return m == null ? void 0 : m[0];
  }, device_name(f) {
    var v, m, w, N, O;
    if (ft(f)) {
      p(f);
      const R = (v = t.hass.entities[f]) === null || v === void 0 ? void 0 : v.device_id;
      return (w = (m = t.hass.devices[R]) === null || m === void 0 ? void 0 : m.name) !== null && w !== void 0 ? w : void 0;
    }
    return (O = (N = t.hass.devices[f]) === null || N === void 0 ? void 0 : N.name) !== null && O !== void 0 ? O : void 0;
  }, areas: () => i().map(([, f]) => f.area_id), area_id(f) {
    var v, m;
    if (f in t.hass.devices) return this.device_attr(f, vn.AREA_ID);
    const w = (v = t.hass.entities[f]) === null || v === void 0 ? void 0 : v.device_id;
    if (w) return this.device_attr(w, vn.AREA_ID);
    const N = i().find(([, O]) => O.name === f);
    return (m = N == null ? void 0 : N[1]) === null || m === void 0 ? void 0 : m.area_id;
  }, area_name(f) {
    var v, m;
    let w;
    f in t.hass.devices && (w = this.device_attr(f, vn.AREA_ID));
    const N = (v = t.hass.entities[f]) === null || v === void 0 ? void 0 : v.device_id;
    N && (w = this.device_attr(N, vn.AREA_ID));
    const O = i().find(([, R]) => R.area_id === f || R.area_id === w);
    return (m = O == null ? void 0 : O[1]) === null || m === void 0 ? void 0 : m.name;
  }, area_entities(f) {
    const v = i().find(([, m]) => m.area_id === f || m.name === f);
    return v ? s().filter(([, m]) => m.area_id === v[1].area_id).map(([m]) => m) : [];
  }, area_devices(f) {
    const v = i().find(([, m]) => m.area_id === f || m.name === f);
    return v ? r().filter(([, m]) => m.area_id === v[1].area_id).map(([, m]) => m.id) : [];
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
  }, ref(f, v, m = void 0) {
    const w = Ps(v);
    if (o.has(v)) return o.get(v);
    const N = new Proxy({ [Dt]: m, [Ls]() {
      return this[Dt];
    } }, { get(O, R, H) {
      if (R === Dt || R === Ls) return y(w), Reflect.get(O, R, H);
      h(`${R} is not a valid ${Rr} property. A ${Rr} only exposes a "${Dt}" property`);
    }, set(O, R, H) {
      if (R === Dt) {
        const Y = O[Dt];
        return O[Dt] = H, f({ event_type: mt.STATE_CHANGE_EVENT, data: { entity_id: w, old_state: { state: JSON.stringify(Y) }, new_state: { state: JSON.stringify(H) } } }), !0;
      }
      return h(`property "${R}" cannot be set in a ${Rr}`), !1;
    } });
    return o.set(v, N), N;
  }, unref(f, v) {
    const m = Ps(v);
    o.has(v) ? (o.delete(v), f(m)) : h(`${v} is not a ref or it has been unrefed already`);
  }, refs(f, v, m = {}) {
    const w = this.ref, N = this.unref, O = new Proxy(m, { get: (R, H) => w(f, H).value, set: (R, H, Y) => (w(f, H).value = Y, !0) });
    return Object.entries(m).forEach((R) => {
      const [H, Y] = R;
      o.has(H) && N(v, H), w(f, H, Y);
    }), O;
  }, cleanRefs(f) {
    Array.from(o.keys()).forEach((v) => {
      this.unref(f, v);
    });
  }, clientSideProxy: new Proxy({}, { get(f, v) {
    switch (Object.values(He).includes(v) && y(v), v) {
      case He.PANEL_URL:
        return window.location.pathname;
      case He.LANG:
        return t.hass.language;
    }
    n && console.warn(`clientSideProxy should only be used to access these variables: ${Object.values(He).join(", ")}`);
  } }) };
}
let Vc = class {
  constructor(e, n) {
    const { throwErrors: i = !1, throwWarnings: r = !0, variables: s = {}, refs: a = {}, refsVariableName: o = zc, autoReturn: l = !0 } = n;
    this._throwErrors = i, this._throwWarnings = r, this._variables = s, this._refsVariableName = o, this._autoReturn = l, this._subscriptions = /* @__PURE__ */ new Map(), this._clientSideEntitiesRegExp = new RegExp(`(^|[ \\?(+:\\{\\[><,])(${Object.values(He).join("|")})($|[ \\?)+:\\}\\]><.,])`, "gm"), this._scopped = Bc(e, i, r), this.refs = a, this._watchForPanelUrlChange(), this._watchForEntitiesChange(), this._watchForLanguageChange();
  }
  _executeRenderingFunctions(e) {
    this._subscriptions.get(e).forEach((n, i) => {
      n.forEach((r, s) => {
        this.trackTemplate(i, s, r);
      });
    });
  }
  _watchForPanelUrlChange() {
    window.addEventListener(mt.LOCATION_CHANGED, () => {
      this._panelUrlWatchCallback();
    }), window.addEventListener(mt.POPSTATE, () => {
      this._panelUrlWatchCallback();
    });
  }
  _panelUrlWatchCallback() {
    this._subscriptions.has(He.PANEL_URL) && this._executeRenderingFunctions(He.PANEL_URL);
  }
  _watchForEntitiesChange() {
    window.hassConnection.then((e) => {
      e.conn.subscribeMessage((n) => this._entityWatchCallback(n), { type: mt.SUBSCRIBE_EVENTS, event_type: mt.STATE_CHANGE_EVENT });
    });
  }
  _watchForLanguageChange() {
    window.addEventListener(mt.TRANSLATIONS_UPDATED, () => {
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
}, Wc = class {
  constructor(e, n = {}) {
    this._renderer = _r(() => e.hass, (i) => !!(i && i.areas && i.devices && i.entities && i.states && i.user), { retries: 100, delay: 50, rejectMessage: "The provided element doesn't contain a proper or initialised hass object" }).then(() => new Vc(e, n));
  }
  getRenderer() {
    return this._renderer;
  }
};
function Yc(t = {}, e = {}) {
  return new Wc(
    document.querySelector("home-assistant"),
    {
      autoReturn: !1,
      variables: t,
      refs: e,
      refsVariableName: "variables"
    }
  ).getRenderer();
}
function Ir(t) {
  return !t || typeof t != "string" ? !1 : String(t).trim().startsWith("[[[") && String(t).trim().endsWith("]]]");
}
function Ds(t, e, n, i = {}) {
  if (!Ir(n))
    throw new Error("Not a valid JS template");
  return n = String(n).trim().slice(3, -3), t.then((r) => r.trackTemplate(n, e, { variables: i }));
}
function Ms(t, e, n) {
  t.then((i) => {
    i.refs[e] = n;
  });
}
function Jc(t, e) {
  t.then((n) => {
    const i = e.detail;
    Object.keys(i).forEach((r) => {
      const s = i[r].property, a = i[r].value, o = `${r}_${s}`;
      n.refs[o] = a;
    });
  });
}
function Kc(t, e) {
  const n = Jc.bind(null, t);
  return document.addEventListener(e, n), () => {
    document.removeEventListener(e, n);
  };
}
var Ur = function() {
  return Ur = Object.assign || function(t) {
    for (var e, n = 1, i = arguments.length; n < i; n++) for (var r in e = arguments[n]) Object.prototype.hasOwnProperty.call(e, r) && (t[r] = e[r]);
    return t;
  }, Ur.apply(this, arguments);
};
function rn(t, e, n, i) {
  return new (n || (n = Promise))((function(r, s) {
    function a(d) {
      try {
        l(i.next(d));
      } catch (c) {
        s(c);
      }
    }
    function o(d) {
      try {
        l(i.throw(d));
      } catch (c) {
        s(c);
      }
    }
    function l(d) {
      var c;
      d.done ? r(d.value) : (c = d.value, c instanceof n ? c : new n((function(h) {
        h(c);
      }))).then(a, o);
    }
    l((i = i.apply(t, [])).next());
  }));
}
function sn(t, e) {
  var n, i, r, s = { label: 0, sent: function() {
    if (1 & r[0]) throw r[1];
    return r[1];
  }, trys: [], ops: [] }, a = Object.create((typeof Iterator == "function" ? Iterator : Object).prototype);
  return a.next = o(0), a.throw = o(1), a.return = o(2), typeof Symbol == "function" && (a[Symbol.iterator] = function() {
    return this;
  }), a;
  function o(l) {
    return function(d) {
      return (function(c) {
        if (n) throw new TypeError("Generator is already executing.");
        for (; a && (a = 0, c[0] && (s = 0)), s; ) try {
          if (n = 1, i && (r = 2 & c[0] ? i.return : c[0] ? i.throw || ((r = i.return) && r.call(i), 0) : i.next) && !(r = r.call(i, c[1])).done) return r;
          switch (i = 0, r && (c = [2 & c[0], r.value]), c[0]) {
            case 0:
            case 1:
              r = c;
              break;
            case 4:
              return s.label++, { value: c[1], done: !1 };
            case 5:
              s.label++, i = c[1], c = [0];
              continue;
            case 7:
              c = s.ops.pop(), s.trys.pop();
              continue;
            default:
              if (r = s.trys, !((r = r.length > 0 && r[r.length - 1]) || c[0] !== 6 && c[0] !== 2)) {
                s = 0;
                continue;
              }
              if (c[0] === 3 && (!r || c[1] > r[0] && c[1] < r[3])) {
                s.label = c[1];
                break;
              }
              if (c[0] === 6 && s.label < r[1]) {
                s.label = r[1], r = c;
                break;
              }
              if (r && s.label < r[2]) {
                s.label = r[2], s.ops.push(c);
                break;
              }
              r[2] && s.ops.pop(), s.trys.pop();
              continue;
          }
          c = e.call(t, s);
        } catch (h) {
          c = [6, h], i = 0;
        } finally {
          n = r = 0;
        }
        if (5 & c[0]) throw c[1];
        return { value: c[0] ? c[1] : void 0, done: !0 };
      })([l, d]);
    };
  }
}
var en = "$", fo = ":host", es = "invalid selector", Nt = 10, Ct = 10, ts = function(t) {
  var e, n = t[0], i = t[1];
  return (e = n) && (e instanceof Document || e instanceof Element || e instanceof ShadowRoot) && typeof i == "string";
};
function ns(t, e) {
  return (function(n) {
    return n.split(",").map((function(i) {
      return i.trim();
    }));
  })(t).map((function(n) {
    var i = (function(r) {
      return r.split(en).map((function(s) {
        return s.trim();
      }));
    })(n);
    return e(i);
  }));
}
function po(t, e) {
  var n = e ? " If you want to select a shadowRoot, use ".concat(e, " instead.") : "";
  return "".concat(t, " cannot be used with a selector ending in a shadowRoot (").concat(en, ").").concat(n);
}
function un(t) {
  return t instanceof Promise ? t : Promise.resolve(t);
}
function _o() {
  return "You can not select a shadowRoot (".concat(en, ") of the document.");
}
function vo() {
  return "You can not select a shadowRoot (".concat(en, ") of a shadowRoot.");
}
function rs(t, e) {
  for (var n, i, r = null, s = t.length, a = 0; a < s; a++) {
    if (a === 0) if (t[a].length) r = e.querySelector(t[a]);
    else {
      if (e instanceof Document) throw new SyntaxError(_o());
      if (e instanceof ShadowRoot) throw new SyntaxError(vo());
      r = ((n = e.shadowRoot) === null || n === void 0 ? void 0 : n.querySelector(t[++a])) || null;
    }
    else r = ((i = r.shadowRoot) === null || i === void 0 ? void 0 : i.querySelector("".concat(fo, " ").concat(t[a]))) || null;
    if (r === null) return null;
  }
  return r;
}
function Qc(t, e) {
  var n, i = (function(a, o, l) {
    for (var d, c = 0, h = o.length; c < h; c++) !d && c in o || (d || (d = Array.prototype.slice.call(o, 0, c)), d[c] = o[c]);
    return a.concat(d || Array.prototype.slice.call(o));
  })([], t), r = i.pop();
  if (!i.length) return e.querySelectorAll(r);
  var s = rs(i, e);
  return ((n = s == null ? void 0 : s.shadowRoot) === null || n === void 0 ? void 0 : n.querySelectorAll("".concat(fo, " ").concat(r))) || null;
}
function Xc(t, e) {
  if (t.length === 1 && !t[0].length) {
    if (e instanceof Document) throw new SyntaxError(_o());
    if (e instanceof ShadowRoot) throw new SyntaxError(vo());
    return e.shadowRoot;
  }
  var n = rs(t, e);
  return (n == null ? void 0 : n.shadowRoot) || null;
}
function Zc(t, e, n, i) {
  for (var r = ns(t, (function(l) {
    if (!l[l.length - 1].length) throw new SyntaxError(po(n, i));
    return l;
  })), s = r.length, a = 0; a < s; a++) {
    var o = rs(r[a], e);
    if (o) return o;
  }
  return null;
}
function ed(t, e, n) {
  for (var i = ns(t, (function(o) {
    if (!o[o.length - 1].length) throw new SyntaxError(po(n));
    return o;
  })), r = i.length, s = 0; s < r; s++) {
    var a = Qc(i[s], e);
    if (a != null && a.length) return a;
  }
  return document.querySelectorAll(es);
}
function td(t, e, n, i) {
  for (var r = ns(t, (function(l) {
    if (l.pop().length) throw new SyntaxError((function(d, c) {
      return "".concat(d, " must be used with a selector ending in a shadowRoot (").concat(en, "). If you don't want to select a shadowRoot, use ").concat(c, " instead.");
    })(n, i));
    return l;
  })), s = r.length, a = 0; a < s; a++) {
    var o = Xc(r[a], e);
    if (o) return o;
  }
  return null;
}
function Hs(t, e, n, i) {
  return rn(this, void 0, void 0, (function() {
    return sn(this, (function(r) {
      return [2, _r((function() {
        return Zc(t, e, "asyncQuerySelector", "asyncShadowRootQuerySelector");
      }), (function(s) {
        return !!s;
      }), { retries: n, delay: i, shouldReject: !1 })];
    }));
  }));
}
function js(t, e, n, i) {
  return rn(this, void 0, void 0, (function() {
    return sn(this, (function(r) {
      return [2, _r((function() {
        return ed(t, e, "asyncQuerySelectorAll");
      }), (function(s) {
        return !!s.length;
      }), { retries: n, delay: i, shouldReject: !1 })];
    }));
  }));
}
function Fs(t, e, n, i) {
  return rn(this, void 0, void 0, (function() {
    return sn(this, (function(r) {
      return [2, _r((function() {
        return td(t, e, "asyncShadowRootQuerySelector", "asyncQuerySelector");
      }), (function(s) {
        return !!s;
      }), { retries: n, delay: i, shouldReject: !1 })];
    }));
  }));
}
var Di = function(t, e) {
  var n = t.querySelectorAll(e);
  if (n.length) return n;
  if (t instanceof Element && t.shadowRoot) {
    var i = Di(t.shadowRoot, e);
    if (i.length) return i;
  }
  for (var r = 0, s = Array.from(t.querySelectorAll("*")); r < s.length; r++) {
    var a = s[r], o = Di(a, e);
    if (o.length) return o;
  }
  return document.querySelectorAll(es);
}, qs = function(t, e, n, i) {
  return _r((function() {
    return Di(t, e);
  }), (function(r) {
    return !!r.length;
  }), { retries: n, delay: i, shouldReject: !1 });
};
function Gs() {
  for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
  return rn(this, void 0, void 0, (function() {
    var n, i, r, s, a;
    return sn(this, (function(o) {
      switch (o.label) {
        case 0:
          return ts(t) ? (n = t[0], i = t[1], r = t[2], [4, Hs(i, n, (r == null ? void 0 : r.retries) || Nt, (r == null ? void 0 : r.delay) || Ct)]) : [3, 2];
        case 1:
        case 3:
          return [2, o.sent()];
        case 2:
          return s = t[0], a = t[1], [4, Hs(s, document, (a == null ? void 0 : a.retries) || Nt, (a == null ? void 0 : a.delay) || Ct)];
      }
    }));
  }));
}
function Us() {
  for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
  return rn(this, void 0, void 0, (function() {
    var n, i, r, s, a;
    return sn(this, (function(o) {
      switch (o.label) {
        case 0:
          return ts(t) ? (n = t[0], i = t[1], r = t[2], [4, js(i, n, (r == null ? void 0 : r.retries) || Nt, (r == null ? void 0 : r.delay) || Ct)]) : [3, 2];
        case 1:
          return [2, o.sent()];
        case 2:
          return s = t[0], a = t[1], [2, js(s, document, (a == null ? void 0 : a.retries) || Nt, (a == null ? void 0 : a.delay) || Ct)];
      }
    }));
  }));
}
function zs() {
  for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
  return rn(this, void 0, void 0, (function() {
    var n, i, r, s, a;
    return sn(this, (function(o) {
      switch (o.label) {
        case 0:
          return ts(t) ? (n = t[0], i = t[1], r = t[2], [4, Fs(i, n, (r == null ? void 0 : r.retries) || Nt, (r == null ? void 0 : r.delay) || Ct)]) : [3, 2];
        case 1:
          return [2, o.sent()];
        case 2:
          return s = t[0], a = t[1], [2, Fs(s, document, (a == null ? void 0 : a.retries) || Nt, (a == null ? void 0 : a.delay) || Ct)];
      }
    }));
  }));
}
var nd = (function() {
  function t(e, n) {
    e instanceof Node || e instanceof Promise ? (this._element = e, this._asyncParams = Ur({ retries: Nt, delay: Ct }, n || {})) : (this._element = document, this._asyncParams = Ur({ retries: Nt, delay: Ct }, e || {}));
  }
  return Object.defineProperty(t.prototype, "element", { get: function() {
    return un(this._element).then((function(e) {
      return e instanceof NodeList ? e[0] || null : e;
    }));
  }, enumerable: !1, configurable: !0 }), Object.defineProperty(t.prototype, "$", { get: function() {
    var e = this;
    return new t(un(this._element).then((function(n) {
      return n instanceof Document || n instanceof ShadowRoot || n === null || n instanceof NodeList && n.length === 0 ? null : n instanceof NodeList ? zs(n[0], en, e._asyncParams) : zs(n, en, e._asyncParams);
    })), this._asyncParams);
  }, enumerable: !1, configurable: !0 }), Object.defineProperty(t.prototype, "all", { get: function() {
    return un(this._element).then((function(e) {
      return e instanceof NodeList ? e : document.querySelectorAll(es);
    }));
  }, enumerable: !1, configurable: !0 }), Object.defineProperty(t.prototype, "asyncParams", { get: function() {
    return this._asyncParams;
  }, enumerable: !1, configurable: !0 }), t.prototype.eq = function(e) {
    return rn(this, void 0, void 0, (function() {
      return sn(this, (function(n) {
        return [2, un(this._element).then((function(i) {
          return i instanceof NodeList && i[e] || null;
        }))];
      }));
    }));
  }, t.prototype.query = function(e) {
    var n = this;
    return new t(un(this._element).then((function(i) {
      return i === null || i instanceof NodeList && i.length === 0 ? null : i instanceof NodeList ? Us(i[0], e, n._asyncParams) : Us(i, e, n._asyncParams);
    })), this._asyncParams);
  }, t.prototype.deepQuery = function(e) {
    var n = this;
    return new t(un(this._element).then((function(i) {
      return i === null || i instanceof NodeList && i.length === 0 ? null : i instanceof NodeList ? Promise.race(Array.from(i).map((function(r) {
        return qs(r, e, n._asyncParams.retries, n._asyncParams.delay);
      }))) : qs(i, e, n._asyncParams.retries, n._asyncParams.delay);
    })), this._asyncParams);
  }, t;
})();
const St = "$", rd = { retries: 100, delay: 50, eventThreshold: 450 };
var je, At, V, tt, G;
(function(t) {
  t.HOME_ASSISTANT = "HOME_ASSISTANT", t.HOME_ASSISTANT_MAIN = "HOME_ASSISTANT_MAIN", t.HA_DRAWER = "HA_DRAWER", t.HA_SIDEBAR = "HA_SIDEBAR", t.PARTIAL_PANEL_RESOLVER = "PARTIAL_PANEL_RESOLVER";
})(je || (je = {})), (function(t) {
  t.HA_PANEL_LOVELACE = "HA_PANEL_LOVELACE", t.HUI_ROOT = "HUI_ROOT", t.HEADER = "HEADER", t.HUI_VIEW = "HUI_VIEW";
})(At || (At = {})), (function(t) {
  t.HA_MORE_INFO_DIALOG = "HA_MORE_INFO_DIALOG", t.HA_DIALOG = "HA_DIALOG", t.HA_DIALOG_CONTENT = "HA_DIALOG_CONTENT", t.HA_MORE_INFO_DIALOG_INFO = "HA_MORE_INFO_DIALOG_INFO", t.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK = "HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK", t.HA_DIALOG_MORE_INFO_SETTINGS = "HA_DIALOG_MORE_INFO_SETTINGS";
})(V || (V = {})), (function(t) {
  t.ON_LISTEN = "onListen", t.ON_PANEL_LOAD = "onPanelLoad", t.ON_LOVELACE_PANEL_LOAD = "onLovelacePanelLoad", t.ON_MORE_INFO_DIALOG_OPEN = "onMoreInfoDialogOpen", t.ON_HISTORY_AND_LOGBOOK_DIALOG_OPEN = "onHistoryAndLogBookDialogOpen", t.ON_SETTINGS_DIALOG_OPEN = "onSettingsDialogOpen";
})(tt || (tt = {})), (function(t) {
  t.HOME_ASSISTANT = "home-assistant", t.HOME_ASSISTANT_MAIN = "home-assistant-main", t.HA_DRAWER = "ha-drawer", t.HA_SIDEBAR = "ha-sidebar", t.PARTIAL_PANEL_RESOLVER = "partial-panel-resolver", t.HA_PANEL_LOVELACE = "ha-panel-lovelace", t.HUI_ROOT = "hui-root", t.HEADER = ".header", t.HUI_VIEW = "hui-view", t.HA_MORE_INFO_DIALOG = "ha-more-info-dialog", t.HA_DIALOG = "ha-adaptive-dialog, ha-dialog", t.HA_DIALOG_CONTENT = ".content", t.HA_MORE_INFO_DIALOG_INFO = "ha-more-info-info", t.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK = "ha-more-info-history-and-logbook", t.HA_DIALOG_MORE_INFO_SETTINGS = "ha-more-info-settings";
})(G || (G = {}));
const id = { [je.HOME_ASSISTANT]: { selector: G.HOME_ASSISTANT, children: { shadowRoot: { selector: St, children: { [je.HOME_ASSISTANT_MAIN]: { selector: G.HOME_ASSISTANT_MAIN, children: { shadowRoot: { selector: St, children: { [je.HA_DRAWER]: { selector: G.HA_DRAWER, children: { [je.HA_SIDEBAR]: { selector: G.HA_SIDEBAR, children: { shadowRoot: { selector: St } } }, [je.PARTIAL_PANEL_RESOLVER]: { selector: G.PARTIAL_PANEL_RESOLVER } } } } } } } } } } } }, sd = { [At.HA_PANEL_LOVELACE]: { selector: G.HA_PANEL_LOVELACE, children: { shadowRoot: { selector: St, children: { [At.HUI_ROOT]: { selector: G.HUI_ROOT, children: { shadowRoot: { selector: St, children: { [At.HEADER]: { selector: G.HEADER }, [At.HUI_VIEW]: { selector: G.HUI_VIEW } } } } } } } } } }, ad = { shadowRoot: { selector: St, children: { [V.HA_MORE_INFO_DIALOG]: { selector: G.HA_MORE_INFO_DIALOG, children: { shadowRoot: { selector: St, children: { [V.HA_DIALOG]: { selector: G.HA_DIALOG, children: { [V.HA_DIALOG_CONTENT]: { selector: G.HA_DIALOG_CONTENT, children: { [V.HA_MORE_INFO_DIALOG_INFO]: { selector: G.HA_MORE_INFO_DIALOG_INFO }, [V.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK]: { selector: G.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK }, [V.HA_DIALOG_MORE_INFO_SETTINGS]: { selector: G.HA_DIALOG_MORE_INFO_SETTINGS } } } } } } } } } } } };
const Xn = (t, e, n, i = !1) => Object.entries(e || {}).reduce((r, s) => {
  const [a, o] = s;
  if (o.selector === St && n) return o.children ? Object.assign(Object.assign({}, r), Xn(t, o.children, n, !0)) : r;
  const l = n ? n.then((d) => {
    return d ? Gs(d, (c = o.selector, i ? "$ " + c : c), t) : null;
    var c;
  }) : Gs(o.selector, t);
  return r[a] = { element: l, children: Xn(t, o.children, l), selector: new nd(l, t) }, r;
}, {}), go = (t, e) => {
  const n = Object.entries(e);
  for (const i of n) {
    if (i[0] === t) return i[1];
    {
      const r = go(t, i[1].children);
      if (r) return r;
    }
  }
}, pi = (t, e) => Object.keys(t).reduce((n, i) => {
  const r = go(i, e);
  if (r) {
    const { children: s } = r, a = (function(o, l) {
      var d = {};
      for (var c in o) Object.prototype.hasOwnProperty.call(o, c) && l.indexOf(c) < 0 && (d[c] = o[c]);
      if (o != null && typeof Object.getOwnPropertySymbols == "function") {
        var h = 0;
        for (c = Object.getOwnPropertySymbols(o); h < c.length; h++) l.indexOf(c[h]) < 0 && Object.prototype.propertyIsEnumerable.call(o, c[h]) && (d[c[h]] = o[c[h]]);
      }
      return d;
    })(r, ["children"]);
    n[i] = Object.assign({}, a);
  }
  return n;
}, {});
let od = class {
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
}, ld = class extends od {
  constructor(e = {}) {
    super(), this._config = Object.assign(Object.assign({}, rd), e), this._timestaps = {};
  }
  _dispatchEvent(e, n) {
    const i = Date.now();
    this._timestaps[e] && i - this._timestaps[e] < this._config.eventThreshold || (this._timestaps[e] = i, this.dispatchEvent(new CustomEvent(e, { detail: n })));
  }
  _updateDialogElements(e = V.HA_MORE_INFO_DIALOG_INFO) {
    this._dialogTree = Xn(this._config, ad, this._haRootElements.HOME_ASSISTANT.element);
    const n = pi(V, this._dialogTree);
    n.HA_DIALOG_CONTENT.element.then((r) => {
      this._dialogsContentObserver.disconnect(), this._dialogsContentObserver.observe(r, { childList: !0 });
    }), this._haDialogElements = ((r, s) => [V.HA_MORE_INFO_DIALOG, V.HA_DIALOG, V.HA_DIALOG_CONTENT, s].reduce((a, o) => (a[o] = r[o], a), {}))(n, e);
    const i = { [V.HA_MORE_INFO_DIALOG_INFO]: tt.ON_MORE_INFO_DIALOG_OPEN, [V.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK]: tt.ON_HISTORY_AND_LOGBOOK_DIALOG_OPEN, [V.HA_DIALOG_MORE_INFO_SETTINGS]: tt.ON_SETTINGS_DIALOG_OPEN };
    this._dispatchEvent(i[e], this._haDialogElements);
  }
  _updateRootElements() {
    this._homeAssistantRootTree = Xn(this._config, id), this._haRootElements = pi(je, this._homeAssistantRootTree), this._haRootElements[je.HOME_ASSISTANT].selector.$.element.then((e) => {
      this._dialogsObserver.disconnect(), this._dialogsObserver.observe(e, { childList: !0 });
    }), this._haRootElements[je.PARTIAL_PANEL_RESOLVER].element.then((e) => {
      this._panelResolverObserver.disconnect(), e && this._panelResolverObserver.observe(e, { subtree: !0, childList: !0 });
    }), this._dispatchEvent(tt.ON_LISTEN, this._haRootElements), this._dispatchEvent(tt.ON_PANEL_LOAD, this._haRootElements);
  }
  _updateLovelaceElements() {
    this._homeAssistantResolverTree = Xn(this._config, sd, this._haRootElements[je.HA_DRAWER].element), this._haResolverElements = pi(At, this._homeAssistantResolverTree), this._haResolverElements[At.HA_PANEL_LOVELACE].element.then((e) => {
      this._lovelaceObserver.disconnect(), e && (this._lovelaceObserver.observe(e.shadowRoot, { childList: !0 }), this._dispatchEvent(tt.ON_LOVELACE_PANEL_LOAD, Object.assign(Object.assign({}, this._haRootElements), this._haResolverElements)));
    });
  }
  _watchDialogs(e) {
    e.forEach(({ addedNodes: n }) => {
      n.forEach((i) => {
        i instanceof Element && i.localName === G.HA_MORE_INFO_DIALOG && this._updateDialogElements();
      });
    });
  }
  _watchDialogsContent(e) {
    e.forEach(({ addedNodes: n }) => {
      n.forEach((i) => {
        const r = { [G.HA_MORE_INFO_DIALOG_INFO]: V.HA_MORE_INFO_DIALOG_INFO, [G.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK]: V.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK, [G.HA_DIALOG_MORE_INFO_SETTINGS]: V.HA_DIALOG_MORE_INFO_SETTINGS };
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
        this._dispatchEvent(tt.ON_PANEL_LOAD, this._haRootElements), i instanceof Element && i.localName === G.HA_PANEL_LOVELACE && this._updateLovelaceElements();
      });
    });
  }
  _watchLovelace(e) {
    e.forEach(({ addedNodes: n }) => {
      n.forEach((i) => {
        i instanceof Element && i.localName === G.HUI_ROOT && this._updateLovelaceElements();
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
const mo = new ld();
let kr = {};
mo.addEventListener("onLovelacePanelLoad", ({ detail: t }) => {
  t.HUI_ROOT.element.then((e) => {
    const n = e == null ? void 0 : e.lovelace;
    n != null && n.config && (kr = n.config["expander-card"] || {});
  }).catch(() => {
    kr = {};
  }).finally(() => {
    document.body.dispatchEvent(new CustomEvent("expander-card-raw-config-updated", {
      detail: { rawConfig: kr },
      bubbles: !0,
      composed: !0
    }));
  });
});
mo.listen();
const cd = () => kr, Bs = (t) => t ? typeof t == "string" ? t : Object.entries(t).map(([e, n]) => {
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
`) : null, Mi = {
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
var dd = /* @__PURE__ */ dt("<ha-ripple></ha-ripple>", 2), ud = /* @__PURE__ */ dt('<button aria-label="Toggle button"><ha-icon></ha-icon> <!></button>', 2), hd = /* @__PURE__ */ dt("<ha-ripple></ha-ripple>", 2), fd = /* @__PURE__ */ dt('<div id="id1"><div id="id2"><!></div> <!> <!></div>'), pd = /* @__PURE__ */ dt("<button><div> </div> <ha-icon></ha-icon> <ha-ripple></ha-ripple></button>", 2), _d = /* @__PURE__ */ dt("<div><div></div></div>"), vd = /* @__PURE__ */ dt("<ha-card><!> <!> <!></ha-card>", 2);
const gd = {
  hash: "svelte-1jqiztq",
  code: `.expander-card.svelte-1jqiztq {display:var(--expander-card-display,block);gap:var(--gap);padding:var(--padding);background:var(--card-background,#fff);-webkit-tap-highlight-color:transparent;}.expander-card.animation.svelte-1jqiztq {transition:gap 0.35s ease, background-color var(--background-animation-duration, 0) ease;}.children-wrapper.svelte-1jqiztq {display:flex;flex-direction:column;}.children-wrapper.animation.opening.svelte-1jqiztq,
    .children-wrapper.animation.closing.svelte-1jqiztq {overflow:hidden;}.children-container.animation.svelte-1jqiztq {transition:padding 0.35s ease, gap 0.35s ease;}.children-container.svelte-1jqiztq {padding:var(--child-padding);display:var(--expander-card-display,block);gap:var(--gap);}.clear.svelte-1jqiztq {background:none !important;background-color:transparent !important;border-style:none !important;box-shadow:none !important;}.title-card-header.svelte-1jqiztq {display:flex;align-items:center;justify-content:space-between;flex-direction:row;position:relative;}.title-card-header.clickable.svelte-1jqiztq {cursor:pointer;border-style:none;border-radius:var(--ha-card-border-radius, var(--ha-border-radius-lg));}.title-card-header-overlay.svelte-1jqiztq {display:block;}.title-card-container.svelte-1jqiztq {width:100%;padding:var(--title-padding);}.header.svelte-1jqiztq {display:flex;flex-direction:row;align-items:center;padding:0.85em 0.85em;background:var(--button-background);border-style:none;border-radius:var(--ha-card-border-radius, var(--ha-border-radius-lg));width:var(--header-width,auto);color:var(--header-color,#fff);cursor:pointer;position:relative;font-family:var(--ha-font-family-body);font-size:var(--ha-font-size-m);}.header-overlay.svelte-1jqiztq {position:absolute;top:0;right:0;margin:var(--overlay-margin);height:var(--expander-card-overlay-height, auto);z-index:1;}.title-card-header-overlay.clickable.svelte-1jqiztq  > .header-overlay:where(.svelte-1jqiztq) {width:calc(100% - var(--overlay-margin) * 2);justify-content:flex-end;}.title-card-header-overlay.clickable.svelte-1jqiztq > .title-card-container:where(.svelte-1jqiztq) {width:calc(100% - var(--overlay-margin) * 2);}.title.svelte-1jqiztq {width:100%;text-align:left;}.ico.animation.svelte-1jqiztq {transition-property:transform;transition-duration:0.35s;}.ico.svelte-1jqiztq {color:var(--arrow-color,var(--primary-text-color,#fff));}.flipped.svelte-1jqiztq {transform:rotate(var(--icon-rotate-degree,180deg));}`
};
function md(t, e) {
  Fi(e, !0), ao(t, gd);
  const n = Pe(e, "hass"), i = Pe(e, "preview"), r = Pe(e, "config", 7, Mi);
  let s = /* @__PURE__ */ F(!1), a = /* @__PURE__ */ F(null), o = /* @__PURE__ */ F(Je(!!Me(() => i()))), l = /* @__PURE__ */ F(Je(!!Me(() => i()))), d = /* @__PURE__ */ F(Je(Me(() => i() || (ii(r()["show-button-users"]) ?? !0)))), c = /* @__PURE__ */ F("idle"), h = /* @__PURE__ */ F(null), p = /* @__PURE__ */ F(0), y = /* @__PURE__ */ F(0), g = /* @__PURE__ */ F(null), A = /* @__PURE__ */ F(null), f = /* @__PURE__ */ F(null), v = /* @__PURE__ */ F(null);
  const m = {}, w = {}, N = {}, O = /* @__PURE__ */ F(Je({}));
  let R = /* @__PURE__ */ F(Je(cd()));
  const H = /* @__PURE__ */ Gn(() => {
    const b = _(O).style, E = r().style;
    let $ = null;
    return b !== void 0 ? $ = typeof b == "string" ? b : typeof b == "object" && b !== null ? Bs(b) : String(b) : E && ($ = Bs(E)), $ ? `<style>${$}</style>` : null;
  }), Y = /* @__PURE__ */ Gn(() => _(O).icon !== void 0 ? String(_(O).icon) : r().icon), ge = /* @__PURE__ */ Gn(() => _(O).title !== void 0 ? String(_(O).title) : r().title), It = /* @__PURE__ */ Gn(() => _(O)["arrow-color"] !== void 0 ? String(_(O)["arrow-color"]) : r()["arrow-color"]), de = Me(() => r()["storage-id"]), mr = "expander-open-" + de;
  yn(() => {
    if (_(O).expanded === void 0 || Me(() => i() && _(R)["preview-expanded"] !== !1))
      return;
    const b = !!_(O).expanded;
    queueMicrotask(() => {
      b !== _(o) && kt(b);
    });
  }), yn(() => {
    if (!(i() === _(l) || i() === void 0)) {
      if (x(l, i(), !0), _(l) && _(R)["preview-expanded"] !== !1) {
        Hn(!0), x(d, !0);
        return;
      }
      if (x(d, ii(r()["show-button-users"]) ?? !0, !0), an("expanded")) {
        const b = Me(() => _(O).expanded);
        b !== void 0 && kt(!!b);
        return;
      }
      cs();
    }
  });
  function an(b) {
    const E = r().templates && Array.isArray(r().templates) ? r().templates.find(($) => $.template === b) : void 0;
    if (E && Ir(E.value_template))
      return E;
  }
  function ri(b) {
    if (!r()["expander-card-id"])
      return;
    const E = {};
    E[r()["expander-card-id"]] = { property: "open", value: b }, document.dispatchEvent(new CustomEvent("expander-card", { detail: E, bubbles: !0, composed: !0 }));
  }
  function ii(b) {
    var E, $, K, Re;
    if (b !== void 0)
      return (($ = (E = n()) == null ? void 0 : E.user) == null ? void 0 : $.name) !== void 0 && b.includes((Re = (K = n()) == null ? void 0 : K.user) == null ? void 0 : Re.name);
  }
  function cs() {
    if (!an("expanded")) {
      if (ii(r()["start-expanded-users"])) {
        ut(!0);
        return;
      }
      if (de === void 0) {
        ds();
        return;
      }
      try {
        const b = localStorage.getItem(mr);
        if (b === null) {
          ds();
          return;
        }
        const E = b ? b === "true" : _(o);
        ut(E);
      } catch (b) {
        console.error(b), ut(!1);
      }
    }
  }
  function ds() {
    if (r().expanded !== void 0) {
      ut(r().expanded);
      return;
    }
    ut(!1);
  }
  function kt(b) {
    _(h) && (clearTimeout(_(h)), x(h, null));
    const E = b !== void 0 ? b : !_(o);
    if (!r().animation) {
      ut(E);
      return;
    }
    if (ri(E), x(c, E ? "opening" : "closing", !0), E) {
      Hn(!0), x(
        h,
        setTimeout(
          () => {
            x(c, "idle"), x(h, null);
          },
          350
        ),
        !0
      );
      return;
    }
    x(
      h,
      setTimeout(
        () => {
          Hn(!1), x(c, "idle"), x(h, null);
        },
        350
      ),
      !0
    );
  }
  function ut(b) {
    Hn(b), ri(b);
  }
  function Hn(b) {
    if (x(o, b, !0), !i() && de !== void 0)
      try {
        localStorage.setItem(mr, _(o) ? "true" : "false");
      } catch (E) {
        console.error(E);
      }
    _(o) && _(p) === 0 && x(p, 0.35);
  }
  function us(b) {
    var $;
    const E = ($ = b.detail) == null ? void 0 : $.rawConfig;
    E && JSON.stringify(E) !== JSON.stringify(_(R)) && x(R, E, !0);
  }
  function hs(b) {
    var $, K;
    const E = (K = ($ = b.detail) == null ? void 0 : $["expander-card"]) == null ? void 0 : K.data;
    if (E != null && E["expander-card-id"] && E["expander-card-id"] === r()["expander-card-id"]) {
      if (E.action === "open" && !_(o)) {
        kt(!0);
        return;
      }
      if (E.action === "close" && _(o)) {
        kt(!1);
        return;
      }
      E.action === "toggle" && kt();
    }
  }
  function Oo() {
    document.body.removeEventListener("ll-custom", hs), document.body.removeEventListener("expander-card-raw-config-updated", us), Object.entries(N).forEach(([b, E]) => {
      E.then(($) => {
        $(), delete N[b];
      }).catch(() => {
      });
    }), Object.entries(w).forEach(([b, E]) => {
      E.then(($) => {
        $(), delete w[b];
      }).catch(() => {
      });
    }), Object.entries(m).forEach(([b, E]) => {
      E(), delete m[b];
    });
  }
  const fs = (b) => {
    r().haptic && r().haptic !== "none" && Gc(b, r().haptic);
  };
  let jn, Fn = !1, ps = 0, _s = 0;
  const So = (b) => {
    _(v) && (_(v).disabled = !0), jn = b.target, ps = b.touches[0].clientX, _s = b.touches[0].clientY, Fn = !1;
  }, xo = (b) => {
    const E = b.touches[0].clientX, $ = b.touches[0].clientY;
    Fn = Math.abs(E - ps) > 10 || Math.abs($ - _s) > 10;
  }, To = () => {
    _(v) && (_(v).disabled = !1), jn = void 0, Fn = !1;
  }, No = () => {
    _(v) && (_(v).disabled = !1);
  }, Co = (b) => {
    !Fn && jn === b.target && r()["title-card-clickable"] && (fs(jn), kt(), x(s, !0), x(
      a,
      window.setTimeout(
        () => {
          x(s, !1), x(a, null);
        },
        100
      ),
      !0
    ), _(v) && (_(v).startPressAnimation(), _(v).endPressAnimation())), jn = void 0, Fn = !1;
  }, Ro = (b) => {
    for (const E of Object.values(r().variables ?? {}))
      Ir(E.value_template) ? w[E.variable] = Ds(
        b,
        ($) => {
          Ms(b, E.variable, $);
        },
        E.value_template,
        { config: r() }
      ) : Ms(b, E.variable, E.value_template);
  }, Io = (b) => {
    m["expander-card"] = Kc(b, "expander-card");
  }, ko = () => {
    if (!r().templates) return;
    const b = Object.values(r().variables || {}).reduce(
      ($, K) => ($[K.variable] = void 0, $),
      {}
    ), E = Yc({ config: r(), expanderCard: {} }, b);
    Ro(E), Io(E), Object.values(r().templates || {}).forEach(($) => {
      Ir($.value_template) ? N[$.template] = Ds(
        E,
        (K) => {
          _(O)[$.template] = K;
        },
        $.value_template,
        { config: r() }
      ) : _(O)[$.template] = $.value_template;
    });
  };
  function Lo() {
    if (an("expanded"))
      return;
    const b = r()["min-width-expanded"], E = r()["max-width-expanded"], $ = document.body.offsetWidth;
    if (b && E) {
      r().expanded = $ >= b && $ <= E;
      return;
    }
    if (b) {
      r().expanded = $ >= b;
      return;
    }
    E && (r().expanded = $ <= E);
  }
  function Po() {
    if (i() && _(R)["preview-expanded"] !== !1) {
      Hn(!0);
      return;
    }
    if (an("expanded")) {
      const b = Me(() => _(O).expanded);
      ut(b !== void 0 ? !!b : !1);
    } else
      cs();
  }
  function Do() {
    if (r()["title-card-clickable"] && !r()["title-card-button-overlay"] && _(A))
      return _(A);
    if (_(f))
      return _(f);
  }
  so(() => {
    ko(), ri(!1), Lo(), Po(), document.body.addEventListener("ll-custom", hs), document.body.addEventListener("expander-card-raw-config-updated", us);
    const b = Do();
    return b && (b.addEventListener("touchstart", So, { passive: !0, capture: !0 }), b.addEventListener("touchmove", xo, { passive: !0, capture: !0 }), b.addEventListener("touchcancel", To, { passive: !0, capture: !0 }), b.addEventListener("touchend", No, { passive: !0, capture: !0 }), b.addEventListener("touchend", Co, { passive: !1, capture: !1 })), r()["title-card-clickable"] && r()["title-card-button-overlay"] && _(A) && new ResizeObserver(() => {
      if (_(f) && _(A) && _(g)) {
        const $ = _(A).getBoundingClientRect();
        x(y, $.height - parseFloat(getComputedStyle(_(f)).marginTop) - parseFloat(getComputedStyle(_(f)).marginBottom) + parseFloat(getComputedStyle(_(g)).paddingTop) + parseFloat(getComputedStyle(_(g)).paddingBottom));
      }
    }).observe(_(A)), Oo;
  });
  const si = (b) => {
    if (!_(s)) {
      fs(b.currentTarget), kt();
      return;
    }
    return b.preventDefault(), b.stopImmediatePropagation(), x(s, !1), _(a) && (clearTimeout(_(a)), x(a, null)), !1;
  };
  var Mo = {
    get hass() {
      return n();
    },
    set hass(b) {
      n(b), $e();
    },
    get preview() {
      return i();
    },
    set preview(b) {
      i(b), $e();
    },
    get config() {
      return r();
    },
    set config(b = Mi) {
      r(b), $e();
    }
  }, on = vd(), vs = pt(on);
  {
    var Ho = (b) => {
      var E = fd(), $ = pt(E), K = pt($);
      Pi(K, {
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
      }), Ze($);
      var Re = Pt($, 2);
      {
        var Ie = (ee) => {
          var ne = ud(), Be = pt(ne);
          et(() => Is(Be, "icon", _(Y)));
          var Uo = Pt(Be, 2);
          {
            var zo = (Lt) => {
              var qn = dd();
              gt(qn, (Bo) => x(v, Bo), () => _(v)), be(Lt, qn);
            };
            _t(Uo, (Lt) => {
              (!r()["title-card-clickable"] || r()["title-card-button-overlay"]) && Lt(zo);
            });
          }
          Ze(ne), gt(ne, (Lt) => x(f, Lt), () => _(f)), et(() => {
            vt(ne, `--overlay-margin:${r()["overlay-margin"] ?? ""}; --button-background:${r()["button-background"] ?? ""}; --header-color:${r()["header-color"] ?? ""};`), ke(ne, 1, `header ${r()["title-card-button-overlay"] ? " header-overlay" : ""}${_(o) ? " open" : " close"}${r().animation ? " animation " + _(c) : ""}`, "svelte-1jqiztq"), vt(Be, `--arrow-color:${_(It) ?? ""}`), ke(Be, 1, `ico${_(o) && _(c) !== "closing" ? " flipped open" : " close"}${r().animation ? " animation " + _(c) : ""}`, "svelte-1jqiztq");
          }), di("click", ne, function(...Lt) {
            var qn;
            (qn = !r()["title-card-clickable"] || r()["title-card-button-overlay"] ? si : null) == null || qn.apply(this, Lt);
          }), be(ee, ne);
        };
        _t(Re, (ee) => {
          _(d) && ee(Ie);
        });
      }
      var ln = Pt(Re, 2);
      {
        var ai = (ee) => {
          var ne = hd();
          gt(ne, (Be) => x(v, Be), () => _(v)), be(ee, ne);
        };
        _t(ln, (ee) => {
          r()["title-card-clickable"] && !r()["title-card-button-overlay"] && ee(ai);
        });
      }
      Ze(E), gt(E, (ee) => x(A, ee), () => _(A)), et(() => {
        ke(E, 1, `title-card-header${r()["title-card-button-overlay"] ? "-overlay" : ""}${_(o) ? " open" : " close"}${r().animation ? " animation " + _(c) : ""}${r()["title-card-clickable"] ? " clickable" : ""}`, "svelte-1jqiztq"), oo(E, "role", r()["title-card-clickable"] && !r()["title-card-button-overlay"] ? "button" : void 0), ke($, 1, `title-card-container${_(o) ? " open" : " close"}${r().animation ? " animation " + _(c) : ""}`, "svelte-1jqiztq"), vt($, `--title-padding:${(r()["title-card-padding"] ? r()["title-card-padding"] : "0px") ?? ""};`);
      }), di("click", E, function(...ee) {
        var ne;
        (ne = r()["title-card-clickable"] && !r()["title-card-button-overlay"] ? si : null) == null || ne.apply(this, ee);
      }), be(b, E);
    }, jo = (b) => {
      var E = Cs(), $ = Os(E);
      {
        var K = (Re) => {
          var Ie = pd(), ln = pt(Ie), ai = pt(ln, !0);
          Ze(ln);
          var ee = Pt(ln, 2);
          et(() => Is(ee, "icon", _(Y)));
          var ne = Pt(ee, 2);
          gt(ne, (Be) => x(v, Be), () => _(v)), Ze(Ie), gt(Ie, (Be) => x(f, Be), () => _(f)), et(() => {
            ke(Ie, 1, `header${_(o) ? " open" : " close"}${r().animation ? " animation " + _(c) : ""}`, "svelte-1jqiztq"), vt(Ie, `--header-width:100%; --button-background:${r()["button-background"] ?? ""};--header-color:${r()["header-color"] ?? ""};`), ke(ln, 1, `primary title${_(o) ? " open" : " close"}`, "svelte-1jqiztq"), yc(ai, _(ge)), vt(ee, `--arrow-color:${_(It) ?? ""}`), ke(ee, 1, `ico${_(o) && _(c) !== "closing" ? " flipped open" : " close"}${r().animation ? " animation " + _(c) : ""}`, "svelte-1jqiztq");
          }), di("click", Ie, si), be(Re, Ie);
        };
        _t($, (Re) => {
          _(d) && Re(K);
        });
      }
      be(b, E);
    };
    _t(vs, (b) => {
      r()["title-card"] ? b(Ho) : b(jo, -1);
    });
  }
  var gs = Pt(vs, 2);
  {
    var Fo = (b) => {
      var E = _d(), $ = pt(E);
      Oc($, 20, () => r().cards, (K) => K, (K, Re) => {
        {
          let Ie = /* @__PURE__ */ Gn(() => _(o) && i());
          Pi(K, {
            get hass() {
              return n();
            },
            get preview() {
              return _(Ie);
            },
            get config() {
              return Re;
            },
            get marginTop() {
              return r()["child-margin-top"];
            },
            get open() {
              return _(o);
            },
            get animation() {
              return r().animation;
            },
            get animationState() {
              return _(c);
            },
            get clearCardCss() {
              return r()["clear-children"];
            }
          });
        }
      }), Ze($), Ze(E), et(() => {
        ke(E, 1, `children-wrapper ${r().animation ? "animation " + _(c) : ""}${_(o) ? " open" : " close"}`, "svelte-1jqiztq"), vt($, `--expander-card-display:${r()["expander-card-display"] ?? ""};
                --gap:${(_(o) && _(c) !== "closing" ? r()["expanded-gap"] : r().gap) ?? ""};
                --child-padding:${(_(o) && _(c) !== "closing" ? r()["child-padding"] : "0px") ?? ""};`), ke($, 1, `children-container${_(o) ? " open" : " close"}${r().animation ? " animation " + _(c) : ""}`, "svelte-1jqiztq");
      }), be(b, E);
    };
    _t(gs, (b) => {
      r().cards && b(Fo);
    });
  }
  var qo = Pt(gs, 2);
  {
    var Go = (b) => {
      var E = Cs(), $ = Os(E);
      Tc($, () => _(H)), be(b, E);
    };
    _t(qo, (b) => {
      _(H) && b(Go);
    });
  }
  return Ze(on), gt(on, (b) => x(g, b), () => _(g)), et(() => {
    ke(on, 1, `expander-card${r().clear ? " clear" : ""}${_(o) ? " open" : " close"} ${_(c)}${r().animation ? " animation " + _(c) : ""}`, "svelte-1jqiztq"), vt(on, `--expander-card-display:${r()["expander-card-display"] ?? ""};
     --gap:${(_(o) && _(c) !== "closing" ? r()["expanded-gap"] : r().gap) ?? ""}; --padding:${r().padding ?? ""};
     --expander-state:${_(o) ?? ""};
     --icon-rotate-degree:${r()["icon-rotate-degree"] ?? ""};
     --card-background:${(_(o) && _(c) !== "closing" && r()["expander-card-background-expanded"] ? r()["expander-card-background-expanded"] : r()["expander-card-background"]) ?? ""};
     --background-animation-duration:${_(p) ?? ""}s;
     --expander-card-overlay-height:${_(y) ? `${_(y)}px` : "auto"};
    `);
  }), be(t, on), qi(Mo);
}
_c(["click"]);
customElements.define("expander-card", uo(md, { hass: {}, preview: {}, config: {} }, [], [], { mode: "open" }, (t) => class extends t {
  constructor() {
    super(...arguments);
    // re-declare props used in customClass.
    j(this, "config");
  }
  static async getConfigElement() {
    return await ll(), document.createElement("expander-card-editor");
  }
  static getStubConfig() {
    return {
      type: "custom:expander-card",
      title: "Expander Card",
      cards: []
    };
  }
  setConfig(n = {}) {
    this.config = { ...Mi, ...n };
  }
}));
const bd = "7.1.2";
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Lr = globalThis, is = Lr.ShadowRoot && (Lr.ShadyCSS === void 0 || Lr.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, ss = Symbol(), Vs = /* @__PURE__ */ new WeakMap();
let bo = class {
  constructor(e, n, i) {
    if (this._$cssResult$ = !0, i !== ss) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = n;
  }
  get styleSheet() {
    let e = this.o;
    const n = this.t;
    if (is && e === void 0) {
      const i = n !== void 0 && n.length === 1;
      i && (e = Vs.get(n)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), i && Vs.set(n, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const yd = (t) => new bo(typeof t == "string" ? t : t + "", void 0, ss), as = (t, ...e) => {
  const n = t.length === 1 ? t[0] : e.reduce((i, r, s) => i + ((a) => {
    if (a._$cssResult$ === !0) return a.cssText;
    if (typeof a == "number") return a;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + t[s + 1], t[0]);
  return new bo(n, t, ss);
}, wd = (t, e) => {
  if (is) t.adoptedStyleSheets = e.map((n) => n instanceof CSSStyleSheet ? n : n.styleSheet);
  else for (const n of e) {
    const i = document.createElement("style"), r = Lr.litNonce;
    r !== void 0 && i.setAttribute("nonce", r), i.textContent = n.cssText, t.appendChild(i);
  }
}, Ws = is ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let n = "";
  for (const i of e.cssRules) n += i.cssText;
  return yd(n);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Ed, defineProperty: $d, getOwnPropertyDescriptor: Ad, getOwnPropertyNames: Od, getOwnPropertySymbols: Sd, getPrototypeOf: xd } = Object, xt = globalThis, Ys = xt.trustedTypes, Td = Ys ? Ys.emptyScript : "", _i = xt.reactiveElementPolyfillSupport, Zn = (t, e) => t, zr = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? Td : null;
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
} }, os = (t, e) => !Ed(t, e), Js = { attribute: !0, type: String, converter: zr, reflect: !1, useDefault: !1, hasChanged: os };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), xt.litPropertyMetadata ?? (xt.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let pn = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, n = Js) {
    if (n.state && (n.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((n = Object.create(n)).wrapped = !0), this.elementProperties.set(e, n), !n.noAccessor) {
      const i = Symbol(), r = this.getPropertyDescriptor(e, i, n);
      r !== void 0 && $d(this.prototype, e, r);
    }
  }
  static getPropertyDescriptor(e, n, i) {
    const { get: r, set: s } = Ad(this.prototype, e) ?? { get() {
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
    return this.elementProperties.get(e) ?? Js;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Zn("elementProperties"))) return;
    const e = xd(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Zn("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Zn("properties"))) {
      const n = this.properties, i = [...Od(n), ...Sd(n)];
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
      for (const r of i) n.unshift(Ws(r));
    } else e !== void 0 && n.push(Ws(e));
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
    return wd(e, this.constructor.elementStyles), e;
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
      const a = (((s = i.converter) == null ? void 0 : s.toAttribute) !== void 0 ? i.converter : zr).toAttribute(n, i.type);
      this._$Em = e, a == null ? this.removeAttribute(r) : this.setAttribute(r, a), this._$Em = null;
    }
  }
  _$AK(e, n) {
    var s, a;
    const i = this.constructor, r = i._$Eh.get(e);
    if (r !== void 0 && this._$Em !== r) {
      const o = i.getPropertyOptions(r), l = typeof o.converter == "function" ? { fromAttribute: o.converter } : ((s = o.converter) == null ? void 0 : s.fromAttribute) !== void 0 ? o.converter : zr;
      this._$Em = r;
      const d = l.fromAttribute(n, o.type);
      this[r] = d ?? ((a = this._$Ej) == null ? void 0 : a.get(r)) ?? d, this._$Em = null;
    }
  }
  requestUpdate(e, n, i, r = !1, s) {
    var a;
    if (e !== void 0) {
      const o = this.constructor;
      if (r === !1 && (s = this[e]), i ?? (i = o.getPropertyOptions(e)), !((i.hasChanged ?? os)(s, n) || i.useDefault && i.reflect && s === ((a = this._$Ej) == null ? void 0 : a.get(e)) && !this.hasAttribute(o._$Eu(e, i)))) return;
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
pn.elementStyles = [], pn.shadowRootOptions = { mode: "open" }, pn[Zn("elementProperties")] = /* @__PURE__ */ new Map(), pn[Zn("finalized")] = /* @__PURE__ */ new Map(), _i == null || _i({ ReactiveElement: pn }), (xt.reactiveElementVersions ?? (xt.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const er = globalThis, Ks = (t) => t, Br = er.trustedTypes, Qs = Br ? Br.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, yo = "$lit$", bt = `lit$${Math.random().toFixed(9).slice(2)}$`, wo = "?" + bt, Nd = `<${wo}>`, tn = document, rr = () => tn.createComment(""), ir = (t) => t === null || typeof t != "object" && typeof t != "function", ls = Array.isArray, Cd = (t) => ls(t) || typeof (t == null ? void 0 : t[Symbol.iterator]) == "function", vi = `[ 	
\f\r]`, zn = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Xs = /-->/g, Zs = />/g, Mt = RegExp(`>|${vi}(?:([^\\s"'>=/]+)(${vi}*=${vi}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), ea = /'/g, ta = /"/g, Eo = /^(?:script|style|textarea|title)$/i, Rd = (t) => (e, ...n) => ({ _$litType$: t, strings: e, values: n }), hn = Rd(1), Pn = Symbol.for("lit-noChange"), z = Symbol.for("lit-nothing"), na = /* @__PURE__ */ new WeakMap(), qt = tn.createTreeWalker(tn, 129);
function $o(t, e) {
  if (!ls(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Qs !== void 0 ? Qs.createHTML(e) : e;
}
const Id = (t, e) => {
  const n = t.length - 1, i = [];
  let r, s = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", a = zn;
  for (let o = 0; o < n; o++) {
    const l = t[o];
    let d, c, h = -1, p = 0;
    for (; p < l.length && (a.lastIndex = p, c = a.exec(l), c !== null); ) p = a.lastIndex, a === zn ? c[1] === "!--" ? a = Xs : c[1] !== void 0 ? a = Zs : c[2] !== void 0 ? (Eo.test(c[2]) && (r = RegExp("</" + c[2], "g")), a = Mt) : c[3] !== void 0 && (a = Mt) : a === Mt ? c[0] === ">" ? (a = r ?? zn, h = -1) : c[1] === void 0 ? h = -2 : (h = a.lastIndex - c[2].length, d = c[1], a = c[3] === void 0 ? Mt : c[3] === '"' ? ta : ea) : a === ta || a === ea ? a = Mt : a === Xs || a === Zs ? a = zn : (a = Mt, r = void 0);
    const y = a === Mt && t[o + 1].startsWith("/>") ? " " : "";
    s += a === zn ? l + Nd : h >= 0 ? (i.push(d), l.slice(0, h) + yo + l.slice(h) + bt + y) : l + bt + (h === -2 ? o : y);
  }
  return [$o(t, s + (t[n] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), i];
};
class sr {
  constructor({ strings: e, _$litType$: n }, i) {
    let r;
    this.parts = [];
    let s = 0, a = 0;
    const o = e.length - 1, l = this.parts, [d, c] = Id(e, n);
    if (this.el = sr.createElement(d, i), qt.currentNode = this.el.content, n === 2 || n === 3) {
      const h = this.el.content.firstChild;
      h.replaceWith(...h.childNodes);
    }
    for (; (r = qt.nextNode()) !== null && l.length < o; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const h of r.getAttributeNames()) if (h.endsWith(yo)) {
          const p = c[a++], y = r.getAttribute(h).split(bt), g = /([.?@])?(.*)/.exec(p);
          l.push({ type: 1, index: s, name: g[2], strings: y, ctor: g[1] === "." ? Ld : g[1] === "?" ? Pd : g[1] === "@" ? Dd : ti }), r.removeAttribute(h);
        } else h.startsWith(bt) && (l.push({ type: 6, index: s }), r.removeAttribute(h));
        if (Eo.test(r.tagName)) {
          const h = r.textContent.split(bt), p = h.length - 1;
          if (p > 0) {
            r.textContent = Br ? Br.emptyScript : "";
            for (let y = 0; y < p; y++) r.append(h[y], rr()), qt.nextNode(), l.push({ type: 2, index: ++s });
            r.append(h[p], rr());
          }
        }
      } else if (r.nodeType === 8) if (r.data === wo) l.push({ type: 2, index: s });
      else {
        let h = -1;
        for (; (h = r.data.indexOf(bt, h + 1)) !== -1; ) l.push({ type: 7, index: s }), h += bt.length - 1;
      }
      s++;
    }
  }
  static createElement(e, n) {
    const i = tn.createElement("template");
    return i.innerHTML = e, i;
  }
}
function Dn(t, e, n = t, i) {
  var a, o;
  if (e === Pn) return e;
  let r = i !== void 0 ? (a = n._$Co) == null ? void 0 : a[i] : n._$Cl;
  const s = ir(e) ? void 0 : e._$litDirective$;
  return (r == null ? void 0 : r.constructor) !== s && ((o = r == null ? void 0 : r._$AO) == null || o.call(r, !1), s === void 0 ? r = void 0 : (r = new s(t), r._$AT(t, n, i)), i !== void 0 ? (n._$Co ?? (n._$Co = []))[i] = r : n._$Cl = r), r !== void 0 && (e = Dn(t, r._$AS(t, e.values), r, i)), e;
}
class kd {
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
    qt.currentNode = r;
    let s = qt.nextNode(), a = 0, o = 0, l = i[0];
    for (; l !== void 0; ) {
      if (a === l.index) {
        let d;
        l.type === 2 ? d = new vr(s, s.nextSibling, this, e) : l.type === 1 ? d = new l.ctor(s, l.name, l.strings, this, e) : l.type === 6 && (d = new Md(s, this, e)), this._$AV.push(d), l = i[++o];
      }
      a !== (l == null ? void 0 : l.index) && (s = qt.nextNode(), a++);
    }
    return qt.currentNode = tn, r;
  }
  p(e) {
    let n = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(e, i, n), n += i.strings.length - 2) : i._$AI(e[n])), n++;
  }
}
class vr {
  get _$AU() {
    var e;
    return ((e = this._$AM) == null ? void 0 : e._$AU) ?? this._$Cv;
  }
  constructor(e, n, i, r) {
    this.type = 2, this._$AH = z, this._$AN = void 0, this._$AA = e, this._$AB = n, this._$AM = i, this.options = r, this._$Cv = (r == null ? void 0 : r.isConnected) ?? !0;
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
    e = Dn(this, e, n), ir(e) ? e === z || e == null || e === "" ? (this._$AH !== z && this._$AR(), this._$AH = z) : e !== this._$AH && e !== Pn && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : Cd(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== z && ir(this._$AH) ? this._$AA.nextSibling.data = e : this.T(tn.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    var s;
    const { values: n, _$litType$: i } = e, r = typeof i == "number" ? this._$AC(e) : (i.el === void 0 && (i.el = sr.createElement($o(i.h, i.h[0]), this.options)), i);
    if (((s = this._$AH) == null ? void 0 : s._$AD) === r) this._$AH.p(n);
    else {
      const a = new kd(r, this), o = a.u(this.options);
      a.p(n), this.T(o), this._$AH = a;
    }
  }
  _$AC(e) {
    let n = na.get(e.strings);
    return n === void 0 && na.set(e.strings, n = new sr(e)), n;
  }
  k(e) {
    ls(this._$AH) || (this._$AH = [], this._$AR());
    const n = this._$AH;
    let i, r = 0;
    for (const s of e) r === n.length ? n.push(i = new vr(this.O(rr()), this.O(rr()), this, this.options)) : i = n[r], i._$AI(s), r++;
    r < n.length && (this._$AR(i && i._$AB.nextSibling, r), n.length = r);
  }
  _$AR(e = this._$AA.nextSibling, n) {
    var i;
    for ((i = this._$AP) == null ? void 0 : i.call(this, !1, !0, n); e !== this._$AB; ) {
      const r = Ks(e).nextSibling;
      Ks(e).remove(), e = r;
    }
  }
  setConnected(e) {
    var n;
    this._$AM === void 0 && (this._$Cv = e, (n = this._$AP) == null || n.call(this, e));
  }
}
class ti {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, n, i, r, s) {
    this.type = 1, this._$AH = z, this._$AN = void 0, this.element = e, this.name = n, this._$AM = r, this.options = s, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = z;
  }
  _$AI(e, n = this, i, r) {
    const s = this.strings;
    let a = !1;
    if (s === void 0) e = Dn(this, e, n, 0), a = !ir(e) || e !== this._$AH && e !== Pn, a && (this._$AH = e);
    else {
      const o = e;
      let l, d;
      for (e = s[0], l = 0; l < s.length - 1; l++) d = Dn(this, o[i + l], n, l), d === Pn && (d = this._$AH[l]), a || (a = !ir(d) || d !== this._$AH[l]), d === z ? e = z : e !== z && (e += (d ?? "") + s[l + 1]), this._$AH[l] = d;
    }
    a && !r && this.j(e);
  }
  j(e) {
    e === z ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class Ld extends ti {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === z ? void 0 : e;
  }
}
class Pd extends ti {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== z);
  }
}
class Dd extends ti {
  constructor(e, n, i, r, s) {
    super(e, n, i, r, s), this.type = 5;
  }
  _$AI(e, n = this) {
    if ((e = Dn(this, e, n, 0) ?? z) === Pn) return;
    const i = this._$AH, r = e === z && i !== z || e.capture !== i.capture || e.once !== i.once || e.passive !== i.passive, s = e !== z && (i === z || r);
    r && this.element.removeEventListener(this.name, this, i), s && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    var n;
    typeof this._$AH == "function" ? this._$AH.call(((n = this.options) == null ? void 0 : n.host) ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class Md {
  constructor(e, n, i) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = n, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    Dn(this, e);
  }
}
const gi = er.litHtmlPolyfillSupport;
gi == null || gi(sr, vr), (er.litHtmlVersions ?? (er.litHtmlVersions = [])).push("3.3.3");
const Hd = (t, e, n) => {
  const i = (n == null ? void 0 : n.renderBefore) ?? e;
  let r = i._$litPart$;
  if (r === void 0) {
    const s = (n == null ? void 0 : n.renderBefore) ?? null;
    i._$litPart$ = r = new vr(e.insertBefore(rr(), s), s, void 0, n ?? {});
  }
  return r._$AI(t), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Kt = globalThis;
class tr extends pn {
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
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Hd(n, this.renderRoot, this.renderOptions);
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
    return Pn;
  }
}
var aa;
tr._$litElement$ = !0, tr.finalized = !0, (aa = Kt.litElementHydrateSupport) == null || aa.call(Kt, { LitElement: tr });
const mi = Kt.litElementPolyfillSupport;
mi == null || mi({ LitElement: tr });
(Kt.litElementVersions ?? (Kt.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const jd = (t) => (e, n) => {
  n !== void 0 ? n.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Fd = { attribute: !0, type: String, converter: zr, reflect: !1, hasChanged: os }, qd = (t = Fd, e, n) => {
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
function ni(t) {
  return (e, n) => typeof n == "object" ? qd(t, e, n) : ((i, r, s) => {
    const a = r.hasOwnProperty(s);
    return r.constructor.createProperty(s, i), a ? Object.getOwnPropertyDescriptor(r, s) : void 0;
  })(t, e, n);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function gr(t) {
  return ni({ ...t, state: !0, attribute: !1 });
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Gd = (t, e, n) => (n.configurable = !0, n.enumerable = !0, Reflect.decorate && typeof e != "object" && Object.defineProperty(t, e, n), n);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function Ud(t, e) {
  return (n, i, r) => {
    const s = (a) => {
      var o;
      return ((o = a.renderRoot) == null ? void 0 : o.querySelector(t)) ?? null;
    };
    return Gd(n, i, { get() {
      return s(this);
    } });
  };
}
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const zd = (t) => t ?? z, Bd = as`
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
`, Vd = as`
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
var Wd = Object.defineProperty, Yd = Object.getOwnPropertyDescriptor, Xe = (t, e, n, i) => {
  for (var r = i > 1 ? void 0 : i ? Yd(e, n) : e, s = t.length - 1, a; s >= 0; s--)
    (a = t[s]) && (r = (i ? a(e, n, r) : a(r)) || r);
  return i && r && Wd(e, n, r), r;
};
const Ao = "custom:", Jd = (t) => t.startsWith(Ao), Kd = (t) => {
  var e;
  return (e = window.customCards) == null ? void 0 : e.find((n) => n.type === t);
}, Qd = (t) => t.replace(Ao, "");
let ve = class extends tr {
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
      let i;
      Jd(this._config.type) ? (i = (n = Kd(
        Qd(this._config.type)
      )) == null ? void 0 : n.name, i != null && i.toLowerCase().endsWith(" card") && (i = i.substring(0, i.length - 5))) : i = this.hass.localize(
        `ui.panel.lovelace.editor.card.${this._config.type}.name`
      ), e = `${e} - ${this.hass.localize(
        "ui.panel.lovelace.editor.edit_card.typed_header",
        { type: i }
      )}`;
    }
    return hn`
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
                        disabled=${zd(t)}
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
      return z;
    const t = this.hass.localize(
      !this._cardEditorEl || this._cardGUIMode ? "ui.panel.lovelace.editor.edit_card.show_code_editor" : "ui.panel.lovelace.editor.edit_card.show_visual_editor"
    );
    return hn`
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
    const t = this._error ? "blur" : "", e = this._error ? hn` <ha-spinner aria-label="Can't update card"></ha-spinner> ` : "";
    return hn`
        ${this._config.type ? hn`
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
            ` : hn`
            <hui-card-picker
                .hass=${this.hass}
                .lovelace=${this.lovelace}
                @config-changed=${this._cardConfigChanged.bind(this)}
            ></hui-card-picker>
            `}
        `;
  }
};
ve.styles = [
  Bd,
  Vd,
  as`
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
Xe([
  ni({ attribute: !1 })
], ve.prototype, "hass", 2);
Xe([
  ni({ type: Boolean, reflect: !0 })
], ve.prototype, "large", 2);
Xe([
  ni({ attribute: !1 })
], ve.prototype, "lovelace", 2);
Xe([
  gr()
], ve.prototype, "_params", 2);
Xe([
  gr()
], ve.prototype, "_config", 2);
Xe([
  gr()
], ve.prototype, "_cardGUIMode", 2);
Xe([
  gr()
], ve.prototype, "_cardGUIModeAvailable", 2);
Xe([
  gr()
], ve.prototype, "_error", 2);
Xe([
  Ud("hui-card-element-editor")
], ve.prototype, "_cardEditorEl", 2);
ve = Xe([
  jd("expander-card-title-card-edit-form")
], ve);
console.info(
  `%c  Expander-Card 
%c Version ${bd}`,
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
customElements.get("expander-card-title-card-edit-form") || customElements.define("expander-card-title-card-edit-form", ve);
export {
  md as default
};
//# sourceMappingURL=expander-card.js.map
