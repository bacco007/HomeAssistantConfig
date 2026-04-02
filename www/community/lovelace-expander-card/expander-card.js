var Ro = Object.defineProperty;
var rs = (t) => {
  throw TypeError(t);
};
var Io = (t, e, n) => e in t ? Ro(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n;
var j = (t, e, n) => Io(t, typeof e != "symbol" ? e + "" : e, n), Jr = (t, e, n) => e.has(t) || rs("Cannot " + n);
var u = (t, e, n) => (Jr(t, e, "read from private field"), n ? n.call(t) : e.get(t)), N = (t, e, n) => e.has(t) ? rs("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, n), C = (t, e, n, i) => (Jr(t, e, "write to private field"), i ? i.call(t, n) : e.set(t, n), n), M = (t, e, n) => (Jr(t, e, "access private method"), n);
const Lo = "5";
var Us;
typeof window < "u" && ((Us = window.__svelte ?? (window.__svelte = {})).v ?? (Us.v = /* @__PURE__ */ new Set())).add(Lo);
const ko = {
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
}, Po = [
  "expanded",
  "icon",
  "arrow-color",
  "title",
  "style"
];
var hr = /* @__PURE__ */ ((t) => (t.CSS = "css", t.Object = "object", t))(hr || {});
const Do = { name: "style", label: "CSS text", selector: { text: { multiline: !0 } } }, Mo = { name: "style", label: "CSS structured object", selector: { object: {} } }, Ho = { icon: {} }, jo = { text: {} }, Fo = { boolean: {} }, qo = (t) => ({
  number: {
    unit_of_measurement: t
  }
}), Go = (t, e) => ({
  name: t,
  label: e,
  selector: Ho
}), K = (t, e) => ({
  name: t,
  label: e,
  selector: jo
}), dn = (t, e) => ({
  name: t,
  label: e,
  selector: Fo
}), is = (t, e, n) => ({
  name: t,
  label: e,
  selector: qo(n)
}), Uo = [
  {
    type: "expandable",
    label: "Expander Card Settings",
    icon: "mdi:arrow-down-bold-box-outline",
    schema: [
      {
        ...K("title", "Title")
      },
      {
        ...Go("icon", "Icon")
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
                ...dn("expanded", "Start expanded")
              },
              {
                ...dn("animation", "Enable animation")
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
                ...is("min-width-expanded", "Min width expanded", "px")
              },
              {
                ...is("max-width-expanded", "Max width expanded", "px")
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
                ...dn("clear", "Clear border and background")
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
                ...dn("clear-children", "Clear card border and background")
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
                ...dn("title-card-clickable", "Make title card clickable to expand/collapse")
              },
              {
                ...dn("title-card-button-overlay", "Overlay expand button on title card")
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
], zo = (t, e) => new Promise((n) => {
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
}), qn = window;
let fr = qn.cardHelpers;
const Bo = new Promise((t) => {
  fr && t(), qn.loadCardHelpers && qn.loadCardHelpers().then((e) => {
    fr = e, qn.cardHelpers = fr, t();
  });
});
async function Vo() {
  const t = document.querySelector("home-assistant"), e = t == null ? void 0 : t.hass;
  return e ? (await e.callWS({ type: "config/auth/list" })).filter((i) => !i.system_generated).map((i) => i.name) : void 0;
}
const Wo = async () => {
  const t = await Bo.then(() => fr.createCardElement({ type: "vertical-stack", cards: [] })), e = await customElements.whenDefined("hui-vertical-stack-card").then(() => t.constructor.getConfigElement()), n = await Vo();
  return class extends e.constructor {
    constructor() {
      super(), this.showDialogCallback = (r) => {
        var a, o, l, c;
        ((l = (o = (a = r.detail) == null ? void 0 : a.dialogParams) == null ? void 0 : o.schema) == null ? void 0 : l.find((d) => d.name === "expander_card_title_card_marker")) && (r.stopPropagation(), (c = r.detail) != null && c.dialogImport && r.detail.dialogImport().then(async () => {
          var f, m, b, _, $, h, v, g;
          const d = {
            title: "Title card",
            config: this._config["title-card"] || {},
            submit: (m = (f = r.detail) == null ? void 0 : f.dialogParams) == null ? void 0 : m.submit,
            cancel: (_ = (b = r.detail) == null ? void 0 : b.dialogParams) == null ? void 0 : _.cancel,
            submitText: (h = ($ = r.detail) == null ? void 0 : $.dialogParams) == null ? void 0 : h.submitText,
            cancelText: (g = (v = r.detail) == null ? void 0 : v.dialogParams) == null ? void 0 : g.cancelText,
            lovelace: this.lovelace
          };
          await zo(
            this,
            d
          );
        }));
      }, this._computeLabelCallback = (r) => r.label ?? r.name ?? "", this._valueChanged = (r) => {
        const s = r.detail.value, a = Object.entries(ko);
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
      const s = JSON.stringify(Uo), a = this._users.map((f) => f.replace(/\\/g, "\\\\").replace(/"/g, '\\"')).join('","');
      let o = s.replace(/\[\[users\]\]/g, a);
      o = o.replace(
        /\[\[templates\]\]/g,
        // NOSONAR es2019
        Po.filter((f) => {
          var m;
          return !((m = this._config.templates) != null && m.some((b) => b.template === f));
        }).join('","')
      );
      const c = (this._config.style && typeof this._config.style == "object" ? hr.Object : hr.CSS) === hr.CSS ? JSON.stringify(Do) : JSON.stringify(Mo);
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
}, Yo = async () => {
  for (; customElements.get("home-assistant") === void 0; )
    await new Promise((t) => qn.setTimeout(t, 100));
  if (!customElements.get("expander-card-editor")) {
    const t = await Wo();
    customElements.define("expander-card-editor", t);
  }
}, Jo = 1, Ko = 2, Xo = 16, Qo = 1, Zo = 2, Ws = "[", $i = "[!", ss = "[?", Ai = "]", Qt = {}, X = Symbol(), Ys = "http://www.w3.org/1999/xhtml", el = "http://www.w3.org/2000/svg", tl = "http://www.w3.org/1998/Math/MathML", nl = !1;
var Js = Array.isArray, rl = Array.prototype.indexOf, $n = Array.prototype.includes, Mr = Array.from, Sr = Object.keys, xr = Object.defineProperty, vn = Object.getOwnPropertyDescriptor, il = Object.getOwnPropertyDescriptors, sl = Object.prototype, al = Array.prototype, Ks = Object.getPrototypeOf, as = Object.isExtensible;
const ol = () => {
};
function ll(t) {
  for (var e = 0; e < t.length; e++)
    t[e]();
}
function Xs() {
  var t, e, n = new Promise((i, r) => {
    t = i, e = r;
  });
  return { promise: n, resolve: t, reject: e };
}
const Y = 2, An = 4, Hr = 8, Qs = 1 << 24, ct = 16, Fe = 32, Nt = 64, si = 128, Ae = 512, V = 1024, Z = 2048, Je = 4096, ae = 8192, _e = 16384, kt = 32768, ai = 1 << 25, On = 65536, oi = 1 << 17, cl = 1 << 18, rn = 1 << 19, dl = 1 << 20, ot = 1 << 25, Zt = 65536, li = 1 << 21, jr = 1 << 22, Ot = 1 << 23, pr = Symbol("$state"), ul = Symbol("legacy props"), hl = Symbol(""), tt = new class extends Error {
  constructor() {
    super(...arguments);
    j(this, "name", "StaleReactionError");
    j(this, "message", "The reaction that called `getAbortSignal()` was re-run or destroyed");
  }
}();
var zs;
const fl = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  !!((zs = globalThis.document) != null && zs.contentType) && /* @__PURE__ */ globalThis.document.contentType.includes("xml")
), Fr = 3, In = 8;
function pl(t) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function _l() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function vl(t, e, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function gl(t) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function ml() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function bl(t) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function yl() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function wl() {
  throw new Error("https://svelte.dev/e/hydration_failed");
}
function El() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function $l() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Al() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Ol() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
function sr(t) {
  console.warn("https://svelte.dev/e/hydration_mismatch");
}
function Sl() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
let P = !1;
function He(t) {
  P = t;
}
let L;
function te(t) {
  if (t === null)
    throw sr(), Qt;
  return L = t;
}
function Sn() {
  return te(/* @__PURE__ */ qe(L));
}
function Qe(t) {
  if (P) {
    if (/* @__PURE__ */ qe(L) !== null)
      throw sr(), Qt;
    L = t;
  }
}
function xl(t = 1) {
  if (P) {
    for (var e = t, n = L; e--; )
      n = /** @type {TemplateNode} */
      /* @__PURE__ */ qe(n);
    L = n;
  }
}
function Tr(t = !0) {
  for (var e = 0, n = L; ; ) {
    if (n.nodeType === In) {
      var i = (
        /** @type {Comment} */
        n.data
      );
      if (i === Ai) {
        if (e === 0) return n;
        e -= 1;
      } else (i === Ws || i === $i || // "[1", "[2", etc. for if blocks
      i[0] === "[" && !isNaN(Number(i.slice(1)))) && (e += 1);
    }
    var r = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ qe(n)
    );
    t && n.remove(), n = r;
  }
}
function Zs(t) {
  if (!t || t.nodeType !== In)
    throw sr(), Qt;
  return (
    /** @type {Comment} */
    t.data
  );
}
function ea(t) {
  return t === this.v;
}
function Tl(t, e) {
  return t != t ? e == e : t !== e || t !== null && typeof t == "object" || typeof t == "function";
}
function ta(t) {
  return !Tl(t, this.v);
}
let Nl = !1, oe = null;
function xn(t) {
  oe = t;
}
function Oi(t, e = !1, n) {
  oe = {
    p: oe,
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
function Si(t) {
  var e = (
    /** @type {ComponentContext} */
    oe
  ), n = e.e;
  if (n !== null) {
    e.e = null;
    for (var i of n)
      xa(i);
  }
  return t !== void 0 && (e.x = t), e.i = !0, oe = e.p, t ?? /** @type {T} */
  {};
}
function na() {
  return !0;
}
let qt = [];
function ra() {
  var t = qt;
  qt = [], ll(t);
}
function gn(t) {
  if (qt.length === 0 && !Gn) {
    var e = qt;
    queueMicrotask(() => {
      e === qt && ra();
    });
  }
  qt.push(t);
}
function Cl() {
  for (; qt.length > 0; )
    ra();
}
function ia(t) {
  var e = k;
  if (e === null)
    return I.f |= Ot, t;
  if ((e.f & kt) === 0 && (e.f & An) === 0)
    throw t;
  $t(t, e);
}
function $t(t, e) {
  for (; e !== null; ) {
    if ((e.f & si) !== 0) {
      if ((e.f & kt) === 0)
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
const Rl = -7169;
function U(t, e) {
  t.f = t.f & Rl | e;
}
function xi(t) {
  (t.f & Ae) !== 0 || t.deps === null ? U(t, V) : U(t, Je);
}
function sa(t) {
  if (t !== null)
    for (const e of t)
      (e.f & Y) === 0 || (e.f & Zt) === 0 || (e.f ^= Zt, sa(
        /** @type {Derived} */
        e.deps
      ));
}
function aa(t, e, n) {
  (t.f & Z) !== 0 ? e.add(t) : (t.f & Je) !== 0 && n.add(t), sa(t.deps), U(t, V);
}
const ht = /* @__PURE__ */ new Set();
let R = null, Q = null, ci = null, Gn = !1, Kr = !1, pn = null, _r = null;
var os = 0;
let Il = 1;
var bn, yn, nt, Ue, Qn, ue, Zn, wt, rt, ze, wn, Bt, z, vr, oa, gr, di, ui, la;
const kr = class kr {
  constructor() {
    N(this, z);
    j(this, "id", Il++);
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
     * When the batch is committed (and the DOM is updated), we need to remove old branches
     * and append new ones by calling the functions added inside (if/each/key/etc) blocks
     * @type {Set<(batch: Batch) => void>}
     */
    N(this, bn, /* @__PURE__ */ new Set());
    /**
     * If a fork is discarded, we need to destroy any effects that are no longer needed
     * @type {Set<(batch: Batch) => void>}
     */
    N(this, yn, /* @__PURE__ */ new Set());
    /**
     * Async effects that are currently in flight
     * @type {Map<Effect, number>}
     */
    N(this, nt, /* @__PURE__ */ new Map());
    /**
     * Async effects that are currently in flight, _not_ inside a pending boundary
     * @type {Map<Effect, number>}
     */
    N(this, Ue, /* @__PURE__ */ new Map());
    /**
     * A deferred that resolves when the batch is committed, used with `settled()`
     * TODO replace with Promise.withResolvers once supported widely enough
     * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
     */
    N(this, Qn, null);
    /**
     * The root effects that need to be flushed
     * @type {Effect[]}
     */
    N(this, ue, []);
    /**
     * Effects created while this batch was active.
     * @type {Effect[]}
     */
    N(this, Zn, []);
    /**
     * Deferred effects (which run after async work has completed) that are DIRTY
     * @type {Set<Effect>}
     */
    N(this, wt, /* @__PURE__ */ new Set());
    /**
     * Deferred effects that are MAYBE_DIRTY
     * @type {Set<Effect>}
     */
    N(this, rt, /* @__PURE__ */ new Set());
    /**
     * A map of branches that still exist, but will be destroyed when this batch
     * is committed — we skip over these during `process`.
     * The value contains child effects that were dirty/maybe_dirty before being reset,
     * so they can be rescheduled if the branch survives.
     * @type {Map<Effect, { d: Effect[], m: Effect[] }>}
     */
    N(this, ze, /* @__PURE__ */ new Map());
    j(this, "is_fork", !1);
    N(this, wn, !1);
    /** @type {Set<Batch>} */
    N(this, Bt, /* @__PURE__ */ new Set());
  }
  /**
   * Add an effect to the #skipped_branches map and reset its children
   * @param {Effect} effect
   */
  skip_effect(e) {
    u(this, ze).has(e) || u(this, ze).set(e, { d: [], m: [] });
  }
  /**
   * Remove an effect from the #skipped_branches map and reschedule
   * any tracked dirty/maybe_dirty child effects
   * @param {Effect} effect
   */
  unskip_effect(e) {
    var n = u(this, ze).get(e);
    if (n) {
      u(this, ze).delete(e);
      for (var i of n.d)
        U(i, Z), this.schedule(i);
      for (i of n.m)
        U(i, Je), this.schedule(i);
    }
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} old_value
   * @param {boolean} [is_derived]
   */
  capture(e, n, i = !1) {
    n !== X && !this.previous.has(e) && this.previous.set(e, n), (e.f & Ot) === 0 && (this.current.set(e, [e.v, i]), Q == null || Q.set(e, e.v));
  }
  activate() {
    R = this;
  }
  deactivate() {
    R = null, Q = null;
  }
  flush() {
    try {
      Kr = !0, R = this, M(this, z, gr).call(this);
    } finally {
      os = 0, ci = null, pn = null, _r = null, Kr = !1, R = null, Q = null, St.clear();
    }
  }
  discard() {
    for (const e of u(this, yn)) e(this);
    u(this, yn).clear(), ht.delete(this);
  }
  /**
   * @param {Effect} effect
   */
  register_created_effect(e) {
    u(this, Zn).push(e);
  }
  /**
   * @param {boolean} blocking
   * @param {Effect} effect
   */
  increment(e, n) {
    let i = u(this, nt).get(n) ?? 0;
    if (u(this, nt).set(n, i + 1), e) {
      let r = u(this, Ue).get(n) ?? 0;
      u(this, Ue).set(n, r + 1);
    }
  }
  /**
   * @param {boolean} blocking
   * @param {Effect} effect
   * @param {boolean} skip - whether to skip updates (because this is triggered by a stale reaction)
   */
  decrement(e, n, i) {
    let r = u(this, nt).get(n) ?? 0;
    if (r === 1 ? u(this, nt).delete(n) : u(this, nt).set(n, r - 1), e) {
      let s = u(this, Ue).get(n) ?? 0;
      s === 1 ? u(this, Ue).delete(n) : u(this, Ue).set(n, s - 1);
    }
    u(this, wn) || i || (C(this, wn, !0), gn(() => {
      C(this, wn, !1), this.flush();
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
      u(this, rt).add(i);
    e.clear(), n.clear();
  }
  /** @param {(batch: Batch) => void} fn */
  oncommit(e) {
    u(this, bn).add(e);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(e) {
    u(this, yn).add(e);
  }
  settled() {
    return (u(this, Qn) ?? C(this, Qn, Xs())).promise;
  }
  static ensure() {
    if (R === null) {
      const e = R = new kr();
      Kr || (ht.add(R), Gn || gn(() => {
        R === e && e.flush();
      }));
    }
    return R;
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
    var r;
    if (ci = e, (r = e.b) != null && r.is_pending && (e.f & (An | Hr | Qs)) !== 0 && (e.f & kt) === 0) {
      e.b.defer_effect(e);
      return;
    }
    for (var n = e; n.parent !== null; ) {
      n = n.parent;
      var i = n.f;
      if (pn !== null && n === k && (I === null || (I.f & Y) === 0))
        return;
      if ((i & (Nt | Fe)) !== 0) {
        if ((i & V) === 0)
          return;
        n.f ^= V;
      }
    }
    u(this, ue).push(n);
  }
};
bn = new WeakMap(), yn = new WeakMap(), nt = new WeakMap(), Ue = new WeakMap(), Qn = new WeakMap(), ue = new WeakMap(), Zn = new WeakMap(), wt = new WeakMap(), rt = new WeakMap(), ze = new WeakMap(), wn = new WeakMap(), Bt = new WeakMap(), z = new WeakSet(), vr = function() {
  return this.is_fork || u(this, Ue).size > 0;
}, oa = function() {
  for (const i of u(this, Bt))
    for (const r of u(i, Ue).keys()) {
      for (var e = !1, n = r; n.parent !== null; ) {
        if (u(this, ze).has(n)) {
          e = !0;
          break;
        }
        n = n.parent;
      }
      if (!e)
        return !0;
    }
  return !1;
}, gr = function() {
  var o, l;
  if (os++ > 1e3 && (ht.delete(this), Ll()), !M(this, z, vr).call(this)) {
    for (const c of u(this, wt))
      u(this, rt).delete(c), U(c, Z), this.schedule(c);
    for (const c of u(this, rt))
      U(c, Je), this.schedule(c);
  }
  const e = u(this, ue);
  C(this, ue, []), this.apply();
  var n = pn = [], i = [], r = _r = [];
  for (const c of e)
    try {
      M(this, z, di).call(this, c, n, i);
    } catch (d) {
      throw ua(c), d;
    }
  if (R = null, r.length > 0) {
    var s = kr.ensure();
    for (const c of r)
      s.schedule(c);
  }
  if (pn = null, _r = null, M(this, z, vr).call(this) || M(this, z, oa).call(this)) {
    M(this, z, ui).call(this, i), M(this, z, ui).call(this, n);
    for (const [c, d] of u(this, ze))
      da(c, d);
  } else {
    u(this, nt).size === 0 && ht.delete(this), u(this, wt).clear(), u(this, rt).clear();
    for (const c of u(this, bn)) c(this);
    u(this, bn).clear(), ls(i), ls(n), (o = u(this, Qn)) == null || o.resolve();
  }
  var a = (
    /** @type {Batch | null} */
    /** @type {unknown} */
    R
  );
  if (u(this, ue).length > 0) {
    const c = a ?? (a = this);
    u(c, ue).push(...u(this, ue).filter((d) => !u(c, ue).includes(d)));
  }
  a !== null && (ht.add(a), M(l = a, z, gr).call(l)), ht.has(this) || M(this, z, la).call(this);
}, /**
 * Traverse the effect tree, executing effects or stashing
 * them for later execution as appropriate
 * @param {Effect} root
 * @param {Effect[]} effects
 * @param {Effect[]} render_effects
 */
di = function(e, n, i) {
  e.f ^= V;
  for (var r = e.first; r !== null; ) {
    var s = r.f, a = (s & (Fe | Nt)) !== 0, o = a && (s & V) !== 0, l = o || (s & ae) !== 0 || u(this, ze).has(r);
    if (!l && r.fn !== null) {
      a ? r.f ^= V : (s & An) !== 0 ? n.push(r) : ar(r) && ((s & ct) !== 0 && u(this, rt).add(r), Nn(r));
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
ui = function(e) {
  for (var n = 0; n < e.length; n += 1)
    aa(e[n], u(this, wt), u(this, rt));
}, la = function() {
  var d, f, m;
  for (const b of ht) {
    var e = b.id < this.id, n = [];
    for (const [_, [$, h]] of this.current) {
      if (b.current.has(_)) {
        var i = (
          /** @type {[any, boolean]} */
          b.current.get(_)[0]
        );
        if (e && $ !== i)
          b.current.set(_, [$, h]);
        else
          continue;
      }
      n.push(_);
    }
    var r = [...b.current.keys()].filter((_) => !this.current.has(_));
    if (r.length === 0)
      e && b.discard();
    else if (n.length > 0) {
      b.activate();
      var s = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Map();
      for (var o of n)
        ca(o, r, s, a);
      a = /* @__PURE__ */ new Map();
      var l = [...b.current.keys()].filter(
        (_) => this.current.has(_) ? (
          /** @type {[any, boolean]} */
          this.current.get(_)[0] !== _
        ) : !0
      );
      for (const _ of u(this, Zn))
        (_.f & (_e | ae | oi)) === 0 && Ti(_, l, a) && ((_.f & (jr | ct)) !== 0 ? (U(_, Z), b.schedule(_)) : u(b, wt).add(_));
      if (u(b, ue).length > 0) {
        b.apply();
        for (var c of u(b, ue))
          M(d = b, z, di).call(d, c, [], []);
        C(b, ue, []);
      }
      b.deactivate();
    }
  }
  for (const b of ht)
    u(b, Bt).has(this) && (u(b, Bt).delete(this), u(b, Bt).size === 0 && !M(f = b, z, vr).call(f) && (b.activate(), M(m = b, z, gr).call(m)));
};
let Ct = kr;
function we(t) {
  var e = Gn;
  Gn = !0;
  try {
    for (var n; ; ) {
      if (Cl(), R === null)
        return (
          /** @type {T} */
          n
        );
      R.flush();
    }
  } finally {
    Gn = e;
  }
}
function Ll() {
  try {
    yl();
  } catch (t) {
    $t(t, ci);
  }
}
let Re = null;
function ls(t) {
  var e = t.length;
  if (e !== 0) {
    for (var n = 0; n < e; ) {
      var i = t[n++];
      if ((i.f & (_e | ae)) === 0 && ar(i) && (Re = /* @__PURE__ */ new Set(), Nn(i), i.deps === null && i.first === null && i.nodes === null && i.teardown === null && i.ac === null && Ra(i), (Re == null ? void 0 : Re.size) > 0)) {
        St.clear();
        for (const r of Re) {
          if ((r.f & (_e | ae)) !== 0) continue;
          const s = [r];
          let a = r.parent;
          for (; a !== null; )
            Re.has(a) && (Re.delete(a), s.push(a)), a = a.parent;
          for (let o = s.length - 1; o >= 0; o--) {
            const l = s[o];
            (l.f & (_e | ae)) === 0 && Nn(l);
          }
        }
        Re.clear();
      }
    }
    Re = null;
  }
}
function ca(t, e, n, i) {
  if (!n.has(t) && (n.add(t), t.reactions !== null))
    for (const r of t.reactions) {
      const s = r.f;
      (s & Y) !== 0 ? ca(
        /** @type {Derived} */
        r,
        e,
        n,
        i
      ) : (s & (jr | ct)) !== 0 && (s & Z) === 0 && Ti(r, e, i) && (U(r, Z), Ni(
        /** @type {Effect} */
        r
      ));
    }
}
function Ti(t, e, n) {
  const i = n.get(t);
  if (i !== void 0) return i;
  if (t.deps !== null)
    for (const r of t.deps) {
      if ($n.call(e, r))
        return !0;
      if ((r.f & Y) !== 0 && Ti(
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
function Ni(t) {
  R.schedule(t);
}
function da(t, e) {
  if (!((t.f & Fe) !== 0 && (t.f & V) !== 0)) {
    (t.f & Z) !== 0 ? e.d.push(t) : (t.f & Je) !== 0 && e.m.push(t), U(t, V);
    for (var n = t.first; n !== null; )
      da(n, e), n = n.next;
  }
}
function ua(t) {
  U(t, V);
  for (var e = t.first; e !== null; )
    ua(e), e = e.next;
}
function kl(t) {
  let e = 0, n = en(0), i;
  return () => {
    Ii() && (p(n), Li(() => (e === 0 && (i = Pe(() => t(() => Un(n)))), e += 1, () => {
      gn(() => {
        e -= 1, e === 0 && (i == null || i(), i = void 0, Un(n));
      });
    })));
  };
}
var Pl = On | rn;
function Dl(t, e, n, i) {
  new Ml(t, e, n, i);
}
var he, er, Be, Vt, ie, Ve, fe, Le, it, Wt, Et, En, tr, nr, st, Pr, q, ha, fa, pa, hi, mr, br, fi;
class Ml {
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(e, n, i, r) {
    N(this, q);
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
    N(this, he);
    /** @type {TemplateNode | null} */
    N(this, er, P ? L : null);
    /** @type {BoundaryProps} */
    N(this, Be);
    /** @type {((anchor: Node) => void)} */
    N(this, Vt);
    /** @type {Effect} */
    N(this, ie);
    /** @type {Effect | null} */
    N(this, Ve, null);
    /** @type {Effect | null} */
    N(this, fe, null);
    /** @type {Effect | null} */
    N(this, Le, null);
    /** @type {DocumentFragment | null} */
    N(this, it, null);
    N(this, Wt, 0);
    N(this, Et, 0);
    N(this, En, !1);
    /** @type {Set<Effect>} */
    N(this, tr, /* @__PURE__ */ new Set());
    /** @type {Set<Effect>} */
    N(this, nr, /* @__PURE__ */ new Set());
    /**
     * A source containing the number of pending async deriveds/expressions.
     * Only created if `$effect.pending()` is used inside the boundary,
     * otherwise updating the source results in needless `Batch.ensure()`
     * calls followed by no-op flushes
     * @type {Source<number> | null}
     */
    N(this, st, null);
    N(this, Pr, kl(() => (C(this, st, en(u(this, Wt))), () => {
      C(this, st, null);
    })));
    var s;
    C(this, he, e), C(this, Be, n), C(this, Vt, (a) => {
      var o = (
        /** @type {Effect} */
        k
      );
      o.b = this, o.f |= si, i(a);
    }), this.parent = /** @type {Effect} */
    k.b, this.transform_error = r ?? ((s = this.parent) == null ? void 0 : s.transform_error) ?? ((a) => a), C(this, ie, ki(() => {
      if (P) {
        const a = (
          /** @type {Comment} */
          u(this, er)
        );
        Sn();
        const o = a.data === $i;
        if (a.data.startsWith(ss)) {
          const c = JSON.parse(a.data.slice(ss.length));
          M(this, q, fa).call(this, c);
        } else o ? M(this, q, pa).call(this) : M(this, q, ha).call(this);
      } else
        M(this, q, hi).call(this);
    }, Pl)), P && C(this, he, L);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(e) {
    aa(e, u(this, tr), u(this, nr));
  }
  /**
   * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!u(this, Be).pending;
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   * @param {Batch} batch
   */
  update_pending_count(e, n) {
    M(this, q, fi).call(this, e, n), C(this, Wt, u(this, Wt) + e), !(!u(this, st) || u(this, En)) && (C(this, En, !0), gn(() => {
      C(this, En, !1), u(this, st) && Tn(u(this, st), u(this, Wt));
    }));
  }
  get_effect_pending() {
    return u(this, Pr).call(this), p(
      /** @type {Source<number>} */
      u(this, st)
    );
  }
  /** @param {unknown} error */
  error(e) {
    var n = u(this, Be).onerror;
    let i = u(this, Be).failed;
    if (!n && !i)
      throw e;
    u(this, Ve) && (re(u(this, Ve)), C(this, Ve, null)), u(this, fe) && (re(u(this, fe)), C(this, fe, null)), u(this, Le) && (re(u(this, Le)), C(this, Le, null)), P && (te(
      /** @type {TemplateNode} */
      u(this, er)
    ), xl(), te(Tr()));
    var r = !1, s = !1;
    const a = () => {
      if (r) {
        Sl();
        return;
      }
      r = !0, s && Ol(), u(this, Le) !== null && Jt(u(this, Le), () => {
        C(this, Le, null);
      }), M(this, q, br).call(this, () => {
        M(this, q, hi).call(this);
      });
    }, o = (l) => {
      try {
        s = !0, n == null || n(l, a), s = !1;
      } catch (c) {
        $t(c, u(this, ie) && u(this, ie).parent);
      }
      i && C(this, Le, M(this, q, br).call(this, () => {
        try {
          return Ee(() => {
            var c = (
              /** @type {Effect} */
              k
            );
            c.b = this, c.f |= si, i(
              u(this, he),
              () => l,
              () => a
            );
          });
        } catch (c) {
          return $t(
            c,
            /** @type {Effect} */
            u(this, ie).parent
          ), null;
        }
      }));
    };
    gn(() => {
      var l;
      try {
        l = this.transform_error(e);
      } catch (c) {
        $t(c, u(this, ie) && u(this, ie).parent);
        return;
      }
      l !== null && typeof l == "object" && typeof /** @type {any} */
      l.then == "function" ? l.then(
        o,
        /** @param {unknown} e */
        (c) => $t(c, u(this, ie) && u(this, ie).parent)
      ) : o(l);
    });
  }
}
he = new WeakMap(), er = new WeakMap(), Be = new WeakMap(), Vt = new WeakMap(), ie = new WeakMap(), Ve = new WeakMap(), fe = new WeakMap(), Le = new WeakMap(), it = new WeakMap(), Wt = new WeakMap(), Et = new WeakMap(), En = new WeakMap(), tr = new WeakMap(), nr = new WeakMap(), st = new WeakMap(), Pr = new WeakMap(), q = new WeakSet(), ha = function() {
  try {
    C(this, Ve, Ee(() => u(this, Vt).call(this, u(this, he))));
  } catch (e) {
    this.error(e);
  }
}, /**
 * @param {unknown} error The deserialized error from the server's hydration comment
 */
fa = function(e) {
  const n = u(this, Be).failed;
  n && C(this, Le, Ee(() => {
    n(
      u(this, he),
      () => e,
      () => () => {
      }
    );
  }));
}, pa = function() {
  const e = u(this, Be).pending;
  e && (this.is_pending = !0, C(this, fe, Ee(() => e(u(this, he)))), gn(() => {
    var n = C(this, it, document.createDocumentFragment()), i = Oe();
    n.append(i), C(this, Ve, M(this, q, br).call(this, () => Ee(() => u(this, Vt).call(this, i)))), u(this, Et) === 0 && (u(this, he).before(n), C(this, it, null), Jt(
      /** @type {Effect} */
      u(this, fe),
      () => {
        C(this, fe, null);
      }
    ), M(this, q, mr).call(
      this,
      /** @type {Batch} */
      R
    ));
  }));
}, hi = function() {
  try {
    if (this.is_pending = this.has_pending_snippet(), C(this, Et, 0), C(this, Wt, 0), C(this, Ve, Ee(() => {
      u(this, Vt).call(this, u(this, he));
    })), u(this, Et) > 0) {
      var e = C(this, it, document.createDocumentFragment());
      Mi(u(this, Ve), e);
      const n = (
        /** @type {(anchor: Node) => void} */
        u(this, Be).pending
      );
      C(this, fe, Ee(() => n(u(this, he))));
    } else
      M(this, q, mr).call(
        this,
        /** @type {Batch} */
        R
      );
  } catch (n) {
    this.error(n);
  }
}, /**
 * @param {Batch} batch
 */
mr = function(e) {
  this.is_pending = !1, e.transfer_effects(u(this, tr), u(this, nr));
}, /**
 * @template T
 * @param {() => T} fn
 */
br = function(e) {
  var n = k, i = I, r = oe;
  xe(u(this, ie)), le(u(this, ie)), xn(u(this, ie).ctx);
  try {
    return Ct.ensure(), e();
  } catch (s) {
    return ia(s), null;
  } finally {
    xe(n), le(i), xn(r);
  }
}, /**
 * Updates the pending count associated with the currently visible pending snippet,
 * if any, such that we can replace the snippet with content once work is done
 * @param {1 | -1} d
 * @param {Batch} batch
 */
fi = function(e, n) {
  var i;
  if (!this.has_pending_snippet()) {
    this.parent && M(i = this.parent, q, fi).call(i, e, n);
    return;
  }
  C(this, Et, u(this, Et) + e), u(this, Et) === 0 && (M(this, q, mr).call(this, n), u(this, fe) && Jt(u(this, fe), () => {
    C(this, fe, null);
  }), u(this, it) && (u(this, he).before(u(this, it)), C(this, it, null)));
};
function Hl(t, e, n, i) {
  const r = qr;
  var s = t.filter((m) => !m.settled);
  if (n.length === 0 && s.length === 0) {
    i(e.map(r));
    return;
  }
  var a = (
    /** @type {Effect} */
    k
  ), o = jl(), l = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((m) => m.promise)) : null;
  function c(m) {
    o();
    try {
      i(m);
    } catch (b) {
      (a.f & _e) === 0 && $t(b, a);
    }
    Nr();
  }
  if (n.length === 0) {
    l.then(() => c(e.map(r)));
    return;
  }
  var d = _a();
  function f() {
    Promise.all(n.map((m) => /* @__PURE__ */ Fl(m))).then((m) => c([...e.map(r), ...m])).catch((m) => $t(m, a)).finally(() => d());
  }
  l ? l.then(() => {
    o(), f(), Nr();
  }) : f();
}
function jl() {
  var t = (
    /** @type {Effect} */
    k
  ), e = I, n = oe, i = (
    /** @type {Batch} */
    R
  );
  return function(s = !0) {
    xe(t), le(e), xn(n), s && (t.f & _e) === 0 && (i == null || i.activate(), i == null || i.apply());
  };
}
function Nr(t = !0) {
  xe(null), le(null), xn(null), t && (R == null || R.deactivate());
}
function _a() {
  var t = (
    /** @type {Effect} */
    k
  ), e = (
    /** @type {Boundary} */
    t.b
  ), n = (
    /** @type {Batch} */
    R
  ), i = e.is_rendered();
  return e.update_pending_count(1, n), n.increment(i, t), (r = !1) => {
    e.update_pending_count(-1, n), n.decrement(i, t, r);
  };
}
// @__NO_SIDE_EFFECTS__
function qr(t) {
  var e = Y | Z, n = I !== null && (I.f & Y) !== 0 ? (
    /** @type {Derived} */
    I
  ) : null;
  return k !== null && (k.f |= rn), {
    ctx: oe,
    deps: null,
    effects: null,
    equals: ea,
    f: e,
    fn: t,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      X
    ),
    wv: 0,
    parent: n ?? k,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function Fl(t, e, n) {
  let i = (
    /** @type {Effect | null} */
    k
  );
  i === null && _l();
  var r = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = en(
    /** @type {V} */
    X
  ), a = !I, o = /* @__PURE__ */ new Map();
  return Xl(() => {
    var b;
    var l = (
      /** @type {Effect} */
      k
    ), c = Xs();
    r = c.promise;
    try {
      Promise.resolve(t()).then(c.resolve, c.reject).finally(Nr);
    } catch (_) {
      c.reject(_), Nr();
    }
    var d = (
      /** @type {Batch} */
      R
    );
    if (a) {
      if ((l.f & kt) !== 0)
        var f = _a();
      if (
        /** @type {Boundary} */
        i.b.is_rendered()
      )
        (b = o.get(d)) == null || b.reject(tt), o.delete(d);
      else {
        for (const _ of o.values())
          _.reject(tt);
        o.clear();
      }
      o.set(d, c);
    }
    const m = (_, $ = void 0) => {
      if (f) {
        var h = $ === tt;
        f(h);
      }
      if (!($ === tt || (l.f & _e) !== 0)) {
        if (d.activate(), $)
          s.f |= Ot, Tn(s, $);
        else {
          (s.f & Ot) !== 0 && (s.f ^= Ot), Tn(s, _);
          for (const [v, g] of o) {
            if (o.delete(v), v === d) break;
            g.reject(tt);
          }
        }
        d.deactivate();
      }
    };
    c.promise.then(m, (_) => m(null, _ || "unknown"));
  }), Yl(() => {
    for (const l of o.values())
      l.reject(tt);
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
function Mn(t) {
  const e = /* @__PURE__ */ qr(t);
  return ka(e), e;
}
// @__NO_SIDE_EFFECTS__
function ql(t) {
  const e = /* @__PURE__ */ qr(t);
  return e.equals = ta, e;
}
function Gl(t) {
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
function Ul(t) {
  for (var e = t.parent; e !== null; ) {
    if ((e.f & Y) === 0)
      return (e.f & _e) === 0 ? (
        /** @type {Effect} */
        e
      ) : null;
    e = e.parent;
  }
  return null;
}
function Ci(t) {
  var e, n = k;
  xe(Ul(t));
  try {
    t.f &= ~Zt, Gl(t), e = Ha(t);
  } finally {
    xe(n);
  }
  return e;
}
function va(t) {
  var e = t.v, n = Ci(t);
  if (!t.equals(n) && (t.wv = Da(), (!(R != null && R.is_fork) || t.deps === null) && (t.v = n, R == null || R.capture(t, e, !0), t.deps === null))) {
    U(t, V);
    return;
  }
  Rt || (Q !== null ? (Ii() || R != null && R.is_fork) && Q.set(t, n) : xi(t));
}
function zl(t) {
  var e, n;
  if (t.effects !== null)
    for (const i of t.effects)
      (i.teardown || i.ac) && ((e = i.teardown) == null || e.call(i), (n = i.ac) == null || n.abort(tt), i.teardown = ol, i.ac = null, Yn(i, 0), Pi(i));
}
function ga(t) {
  if (t.effects !== null)
    for (const e of t.effects)
      e.teardown && Nn(e);
}
let pi = /* @__PURE__ */ new Set();
const St = /* @__PURE__ */ new Map();
let ma = !1;
function en(t, e) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: t,
    reactions: null,
    equals: ea,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function H(t, e) {
  const n = en(t);
  return ka(n), n;
}
// @__NO_SIDE_EFFECTS__
function ba(t, e = !1, n = !0) {
  const i = en(t);
  return e || (i.equals = ta), i;
}
function S(t, e, n = !1) {
  I !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!je || (I.f & oi) !== 0) && na() && (I.f & (Y | ct | jr | oi)) !== 0 && (Se === null || !$n.call(Se, t)) && Al();
  let i = n ? Ye(e) : e;
  return Tn(t, i, _r);
}
function Tn(t, e, n = null) {
  if (!t.equals(e)) {
    var i = t.v;
    Rt ? St.set(t, e) : St.set(t, i), t.v = e;
    var r = Ct.ensure();
    if (r.capture(t, i), (t.f & Y) !== 0) {
      const s = (
        /** @type {Derived} */
        t
      );
      (t.f & Z) !== 0 && Ci(s), Q === null && xi(s);
    }
    t.wv = Da(), ya(t, Z, n), k !== null && (k.f & V) !== 0 && (k.f & (Fe | Nt)) === 0 && (me === null ? Zl([t]) : me.push(t)), !r.is_fork && pi.size > 0 && !ma && Bl();
  }
  return e;
}
function Bl() {
  ma = !1;
  for (const t of pi)
    (t.f & V) !== 0 && U(t, Je), ar(t) && Nn(t);
  pi.clear();
}
function Un(t) {
  S(t, t.v + 1);
}
function ya(t, e, n) {
  var i = t.reactions;
  if (i !== null)
    for (var r = i.length, s = 0; s < r; s++) {
      var a = i[s], o = a.f, l = (o & Z) === 0;
      if (l && U(a, e), (o & Y) !== 0) {
        var c = (
          /** @type {Derived} */
          a
        );
        Q == null || Q.delete(c), (o & Zt) === 0 && (o & Ae && (a.f |= Zt), ya(c, Je, n));
      } else if (l) {
        var d = (
          /** @type {Effect} */
          a
        );
        (o & ct) !== 0 && Re !== null && Re.add(d), n !== null ? n.push(d) : Ni(d);
      }
    }
}
function Ye(t) {
  if (typeof t != "object" || t === null || pr in t)
    return t;
  const e = Ks(t);
  if (e !== sl && e !== al)
    return t;
  var n = /* @__PURE__ */ new Map(), i = Js(t), r = /* @__PURE__ */ H(0), s = Kt, a = (o) => {
    if (Kt === s)
      return o();
    var l = I, c = Kt;
    le(null), hs(s);
    var d = o();
    return le(l), hs(c), d;
  };
  return i && n.set("length", /* @__PURE__ */ H(
    /** @type {any[]} */
    t.length
  )), new Proxy(
    /** @type {any} */
    t,
    {
      defineProperty(o, l, c) {
        (!("value" in c) || c.configurable === !1 || c.enumerable === !1 || c.writable === !1) && El();
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
            const d = a(() => /* @__PURE__ */ H(X));
            n.set(l, d), Un(r);
          }
        } else
          S(c, X), Un(r);
        return !0;
      },
      get(o, l, c) {
        var b;
        if (l === pr)
          return t;
        var d = n.get(l), f = l in o;
        if (d === void 0 && (!f || (b = vn(o, l)) != null && b.writable) && (d = a(() => {
          var _ = Ye(f ? o[l] : X), $ = /* @__PURE__ */ H(_);
          return $;
        }), n.set(l, d)), d !== void 0) {
          var m = p(d);
          return m === X ? void 0 : m;
        }
        return Reflect.get(o, l, c);
      },
      getOwnPropertyDescriptor(o, l) {
        var c = Reflect.getOwnPropertyDescriptor(o, l);
        if (c && "value" in c) {
          var d = n.get(l);
          d && (c.value = p(d));
        } else if (c === void 0) {
          var f = n.get(l), m = f == null ? void 0 : f.v;
          if (f !== void 0 && m !== X)
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
        if (l === pr)
          return !0;
        var c = n.get(l), d = c !== void 0 && c.v !== X || Reflect.has(o, l);
        if (c !== void 0 || k !== null && (!d || (m = vn(o, l)) != null && m.writable)) {
          c === void 0 && (c = a(() => {
            var b = d ? Ye(o[l]) : X, _ = /* @__PURE__ */ H(b);
            return _;
          }), n.set(l, c));
          var f = p(c);
          if (f === X)
            return !1;
        }
        return d;
      },
      set(o, l, c, d) {
        var w;
        var f = n.get(l), m = l in o;
        if (i && l === "length")
          for (var b = c; b < /** @type {Source<number>} */
          f.v; b += 1) {
            var _ = n.get(b + "");
            _ !== void 0 ? S(_, X) : b in o && (_ = a(() => /* @__PURE__ */ H(X)), n.set(b + "", _));
          }
        if (f === void 0)
          (!m || (w = vn(o, l)) != null && w.writable) && (f = a(() => /* @__PURE__ */ H(void 0)), S(f, Ye(c)), n.set(l, f));
        else {
          m = f.v !== X;
          var $ = a(() => Ye(c));
          S(f, $);
        }
        var h = Reflect.getOwnPropertyDescriptor(o, l);
        if (h != null && h.set && h.set.call(d, c), !m) {
          if (i && typeof l == "string") {
            var v = (
              /** @type {Source<number>} */
              n.get("length")
            ), g = Number(l);
            Number.isInteger(g) && g >= v.v && S(v, g + 1);
          }
          Un(r);
        }
        return !0;
      },
      ownKeys(o) {
        p(r);
        var l = Reflect.ownKeys(o).filter((f) => {
          var m = n.get(f);
          return m === void 0 || m.v !== X;
        });
        for (var [c, d] of n)
          d.v !== X && !(c in o) && l.push(c);
        return l;
      },
      setPrototypeOf() {
        $l();
      }
    }
  );
}
var cs, wa, Ea, $a;
function _i() {
  if (cs === void 0) {
    cs = window, wa = /Firefox/.test(navigator.userAgent);
    var t = Element.prototype, e = Node.prototype, n = Text.prototype;
    Ea = vn(e, "firstChild").get, $a = vn(e, "nextSibling").get, as(t) && (t.__click = void 0, t.__className = void 0, t.__attributes = null, t.__style = void 0, t.__e = void 0), as(n) && (n.__t = void 0);
  }
}
function Oe(t = "") {
  return document.createTextNode(t);
}
// @__NO_SIDE_EFFECTS__
function $e(t) {
  return (
    /** @type {TemplateNode | null} */
    Ea.call(t)
  );
}
// @__NO_SIDE_EFFECTS__
function qe(t) {
  return (
    /** @type {TemplateNode | null} */
    $a.call(t)
  );
}
function _t(t, e) {
  if (!P)
    return /* @__PURE__ */ $e(t);
  var n = /* @__PURE__ */ $e(L);
  if (n === null)
    n = L.appendChild(Oe());
  else if (e && n.nodeType !== Fr) {
    var i = Oe();
    return n == null || n.before(i), te(i), i;
  }
  return e && Ri(
    /** @type {Text} */
    n
  ), te(n), n;
}
function ds(t, e = !1) {
  if (!P) {
    var n = /* @__PURE__ */ $e(t);
    return n instanceof Comment && n.data === "" ? /* @__PURE__ */ qe(n) : n;
  }
  if (e) {
    if ((L == null ? void 0 : L.nodeType) !== Fr) {
      var i = Oe();
      return L == null || L.before(i), te(i), i;
    }
    Ri(
      /** @type {Text} */
      L
    );
  }
  return L;
}
function Ht(t, e = 1, n = !1) {
  let i = P ? L : t;
  for (var r; e--; )
    r = i, i = /** @type {TemplateNode} */
    /* @__PURE__ */ qe(i);
  if (!P)
    return i;
  if (n) {
    if ((i == null ? void 0 : i.nodeType) !== Fr) {
      var s = Oe();
      return i === null ? r == null || r.after(s) : i.before(s), te(s), s;
    }
    Ri(
      /** @type {Text} */
      i
    );
  }
  return te(i), i;
}
function Aa(t) {
  t.textContent = "";
}
function Oa() {
  return !1;
}
function Gr(t, e, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(e ?? Ys, t, void 0)
  );
}
function Ri(t) {
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
function Sa(t) {
  var e = I, n = k;
  le(null), xe(null);
  try {
    return t();
  } finally {
    le(e), xe(n);
  }
}
function Vl(t) {
  k === null && (I === null && bl(), ml()), Rt && gl();
}
function Wl(t, e) {
  var n = e.last;
  n === null ? e.last = e.first = t : (n.next = t, t.prev = n, e.last = t);
}
function Ke(t, e) {
  var n = k;
  n !== null && (n.f & ae) !== 0 && (t |= ae);
  var i = {
    ctx: oe,
    deps: null,
    nodes: null,
    f: t | Z | Ae,
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
  R == null || R.register_created_effect(i);
  var r = i;
  if ((t & An) !== 0)
    pn !== null ? pn.push(i) : Ct.ensure().schedule(i);
  else if (e !== null) {
    try {
      Nn(i);
    } catch (a) {
      throw re(i), a;
    }
    r.deps === null && r.teardown === null && r.nodes === null && r.first === r.last && // either `null`, or a singular child
    (r.f & rn) === 0 && (r = r.first, (t & ct) !== 0 && (t & On) !== 0 && r !== null && (r.f |= On));
  }
  if (r !== null && (r.parent = n, n !== null && Wl(r, n), I !== null && (I.f & Y) !== 0 && (t & Nt) === 0)) {
    var s = (
      /** @type {Derived} */
      I
    );
    (s.effects ?? (s.effects = [])).push(r);
  }
  return i;
}
function Ii() {
  return I !== null && !je;
}
function Yl(t) {
  const e = Ke(Hr, null);
  return U(e, V), e.teardown = t, e;
}
function mn(t) {
  Vl();
  var e = (
    /** @type {Effect} */
    k.f
  ), n = !I && (e & Fe) !== 0 && (e & kt) === 0;
  if (n) {
    var i = (
      /** @type {ComponentContext} */
      oe
    );
    (i.e ?? (i.e = [])).push(t);
  } else
    return xa(t);
}
function xa(t) {
  return Ke(An | dl, t);
}
function Jl(t) {
  Ct.ensure();
  const e = Ke(Nt | rn, t);
  return () => {
    re(e);
  };
}
function Kl(t) {
  Ct.ensure();
  const e = Ke(Nt | rn, t);
  return (n = {}) => new Promise((i) => {
    n.outro ? Jt(e, () => {
      re(e), i(void 0);
    }) : (re(e), i(void 0));
  });
}
function Ta(t) {
  return Ke(An, t);
}
function Xl(t) {
  return Ke(jr | rn, t);
}
function Li(t, e = 0) {
  return Ke(Hr | e, t);
}
function Ze(t, e = [], n = [], i = []) {
  Hl(i, e, n, (r) => {
    Ke(Hr, () => t(...r.map(p)));
  });
}
function ki(t, e = 0) {
  var n = Ke(ct | e, t);
  return n;
}
function Ee(t) {
  return Ke(Fe | rn, t);
}
function Na(t) {
  var e = t.teardown;
  if (e !== null) {
    const n = Rt, i = I;
    us(!0), le(null);
    try {
      e.call(null);
    } finally {
      us(n), le(i);
    }
  }
}
function Pi(t, e = !1) {
  var n = t.first;
  for (t.first = t.last = null; n !== null; ) {
    const r = n.ac;
    r !== null && Sa(() => {
      r.abort(tt);
    });
    var i = n.next;
    (n.f & Nt) !== 0 ? n.parent = null : re(n, e), n = i;
  }
}
function Ql(t) {
  for (var e = t.first; e !== null; ) {
    var n = e.next;
    (e.f & Fe) === 0 && re(e), e = n;
  }
}
function re(t, e = !0) {
  var n = !1;
  (e || (t.f & cl) !== 0) && t.nodes !== null && t.nodes.end !== null && (Ca(
    t.nodes.start,
    /** @type {TemplateNode} */
    t.nodes.end
  ), n = !0), U(t, ai), Pi(t, e && !n), Yn(t, 0);
  var i = t.nodes && t.nodes.t;
  if (i !== null)
    for (const s of i)
      s.stop();
  Na(t), t.f ^= ai, t.f |= _e;
  var r = t.parent;
  r !== null && r.first !== null && Ra(t), t.next = t.prev = t.teardown = t.ctx = t.deps = t.fn = t.nodes = t.ac = t.b = null;
}
function Ca(t, e) {
  for (; t !== null; ) {
    var n = t === e ? null : /* @__PURE__ */ qe(t);
    t.remove(), t = n;
  }
}
function Ra(t) {
  var e = t.parent, n = t.prev, i = t.next;
  n !== null && (n.next = i), i !== null && (i.prev = n), e !== null && (e.first === t && (e.first = i), e.last === t && (e.last = n));
}
function Jt(t, e, n = !0) {
  var i = [];
  Ia(t, i, !0);
  var r = () => {
    n && re(t), e && e();
  }, s = i.length;
  if (s > 0) {
    var a = () => --s || r();
    for (var o of i)
      o.out(a);
  } else
    r();
}
function Ia(t, e, n) {
  if ((t.f & ae) === 0) {
    t.f ^= ae;
    var i = t.nodes && t.nodes.t;
    if (i !== null)
      for (const o of i)
        (o.is_global || n) && e.push(o);
    for (var r = t.first; r !== null; ) {
      var s = r.next, a = (r.f & On) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (r.f & Fe) !== 0 && (t.f & ct) !== 0;
      Ia(r, e, a ? n : !1), r = s;
    }
  }
}
function Di(t) {
  La(t, !0);
}
function La(t, e) {
  if ((t.f & ae) !== 0) {
    t.f ^= ae, (t.f & V) === 0 && (U(t, Z), Ct.ensure().schedule(t));
    for (var n = t.first; n !== null; ) {
      var i = n.next, r = (n.f & On) !== 0 || (n.f & Fe) !== 0;
      La(n, r ? e : !1), n = i;
    }
    var s = t.nodes && t.nodes.t;
    if (s !== null)
      for (const a of s)
        (a.is_global || e) && a.in();
  }
}
function Mi(t, e) {
  if (t.nodes)
    for (var n = t.nodes.start, i = t.nodes.end; n !== null; ) {
      var r = n === i ? null : /* @__PURE__ */ qe(n);
      e.append(n), n = r;
    }
}
let yr = !1, Rt = !1;
function us(t) {
  Rt = t;
}
let I = null, je = !1;
function le(t) {
  I = t;
}
let k = null;
function xe(t) {
  k = t;
}
let Se = null;
function ka(t) {
  I !== null && (Se === null ? Se = [t] : Se.push(t));
}
let se = null, de = 0, me = null;
function Zl(t) {
  me = t;
}
let Pa = 1, Gt = 0, Kt = Gt;
function hs(t) {
  Kt = t;
}
function Da() {
  return ++Pa;
}
function ar(t) {
  var e = t.f;
  if ((e & Z) !== 0)
    return !0;
  if (e & Y && (t.f &= ~Zt), (e & Je) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      t.deps
    ), i = n.length, r = 0; r < i; r++) {
      var s = n[r];
      if (ar(
        /** @type {Derived} */
        s
      ) && va(
        /** @type {Derived} */
        s
      ), s.wv > t.wv)
        return !0;
    }
    (e & Ae) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    Q === null && U(t, V);
  }
  return !1;
}
function Ma(t, e, n = !0) {
  var i = t.reactions;
  if (i !== null && !(Se !== null && $n.call(Se, t)))
    for (var r = 0; r < i.length; r++) {
      var s = i[r];
      (s.f & Y) !== 0 ? Ma(
        /** @type {Derived} */
        s,
        e,
        !1
      ) : e === s && (n ? U(s, Z) : (s.f & V) !== 0 && U(s, Je), Ni(
        /** @type {Effect} */
        s
      ));
    }
}
function Ha(t) {
  var $;
  var e = se, n = de, i = me, r = I, s = Se, a = oe, o = je, l = Kt, c = t.f;
  se = /** @type {null | Value[]} */
  null, de = 0, me = null, I = (c & (Fe | Nt)) === 0 ? t : null, Se = null, xn(t.ctx), je = !1, Kt = ++Gt, t.ac !== null && (Sa(() => {
    t.ac.abort(tt);
  }), t.ac = null);
  try {
    t.f |= li;
    var d = (
      /** @type {Function} */
      t.fn
    ), f = d();
    t.f |= kt;
    var m = t.deps, b = R == null ? void 0 : R.is_fork;
    if (se !== null) {
      var _;
      if (b || Yn(t, de), m !== null && de > 0)
        for (m.length = de + se.length, _ = 0; _ < se.length; _++)
          m[de + _] = se[_];
      else
        t.deps = m = se;
      if (Ii() && (t.f & Ae) !== 0)
        for (_ = de; _ < m.length; _++)
          (($ = m[_]).reactions ?? ($.reactions = [])).push(t);
    } else !b && m !== null && de < m.length && (Yn(t, de), m.length = de);
    if (na() && me !== null && !je && m !== null && (t.f & (Y | Je | Z)) === 0)
      for (_ = 0; _ < /** @type {Source[]} */
      me.length; _++)
        Ma(
          me[_],
          /** @type {Effect} */
          t
        );
    if (r !== null && r !== t) {
      if (Gt++, r.deps !== null)
        for (let h = 0; h < n; h += 1)
          r.deps[h].rv = Gt;
      if (e !== null)
        for (const h of e)
          h.rv = Gt;
      me !== null && (i === null ? i = me : i.push(.../** @type {Source[]} */
      me));
    }
    return (t.f & Ot) !== 0 && (t.f ^= Ot), f;
  } catch (h) {
    return ia(h);
  } finally {
    t.f ^= li, se = e, de = n, me = i, I = r, Se = s, xn(a), je = o, Kt = l;
  }
}
function ec(t, e) {
  let n = e.reactions;
  if (n !== null) {
    var i = rl.call(n, t);
    if (i !== -1) {
      var r = n.length - 1;
      r === 0 ? n = e.reactions = null : (n[i] = n[r], n.pop());
    }
  }
  if (n === null && (e.f & Y) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (se === null || !$n.call(se, e))) {
    var s = (
      /** @type {Derived} */
      e
    );
    (s.f & Ae) !== 0 && (s.f ^= Ae, s.f &= ~Zt), xi(s), zl(s), Yn(s, 0);
  }
}
function Yn(t, e) {
  var n = t.deps;
  if (n !== null)
    for (var i = e; i < n.length; i++)
      ec(t, n[i]);
}
function Nn(t) {
  var e = t.f;
  if ((e & _e) === 0) {
    U(t, V);
    var n = k, i = yr;
    k = t, yr = !0;
    try {
      (e & (ct | Qs)) !== 0 ? Ql(t) : Pi(t), Na(t);
      var r = Ha(t);
      t.teardown = typeof r == "function" ? r : null, t.wv = Pa;
      var s;
      nl && Nl && (t.f & Z) !== 0 && t.deps;
    } finally {
      yr = i, k = n;
    }
  }
}
function p(t) {
  var e = t.f, n = (e & Y) !== 0;
  if (I !== null && !je) {
    var i = k !== null && (k.f & _e) !== 0;
    if (!i && (Se === null || !$n.call(Se, t))) {
      var r = I.deps;
      if ((I.f & li) !== 0)
        t.rv < Gt && (t.rv = Gt, se === null && r !== null && r[de] === t ? de++ : se === null ? se = [t] : se.push(t));
      else {
        (I.deps ?? (I.deps = [])).push(t);
        var s = t.reactions;
        s === null ? t.reactions = [I] : $n.call(s, I) || s.push(I);
      }
    }
  }
  if (Rt && St.has(t))
    return St.get(t);
  if (n) {
    var a = (
      /** @type {Derived} */
      t
    );
    if (Rt) {
      var o = a.v;
      return ((a.f & V) === 0 && a.reactions !== null || Fa(a)) && (o = Ci(a)), St.set(a, o), o;
    }
    var l = (a.f & Ae) === 0 && !je && I !== null && (yr || (I.f & Ae) !== 0), c = (a.f & kt) === 0;
    ar(a) && (l && (a.f |= Ae), va(a)), l && !c && (ga(a), ja(a));
  }
  if (Q != null && Q.has(t))
    return Q.get(t);
  if ((t.f & Ot) !== 0)
    throw t.v;
  return t.v;
}
function ja(t) {
  if (t.f |= Ae, t.deps !== null)
    for (const e of t.deps)
      (e.reactions ?? (e.reactions = [])).push(t), (e.f & Y) !== 0 && (e.f & Ae) === 0 && (ga(
        /** @type {Derived} */
        e
      ), ja(
        /** @type {Derived} */
        e
      ));
}
function Fa(t) {
  if (t.v === X) return !0;
  if (t.deps === null) return !1;
  for (const e of t.deps)
    if (St.has(e) || (e.f & Y) !== 0 && Fa(
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
const Ut = Symbol("events"), qa = /* @__PURE__ */ new Set(), vi = /* @__PURE__ */ new Set();
function Xr(t, e, n) {
  (e[Ut] ?? (e[Ut] = {}))[t] = n;
}
function tc(t) {
  for (var e = 0; e < t.length; e++)
    qa.add(t[e]);
  for (var n of vi)
    n(t);
}
let fs = null;
function ps(t) {
  var h, v;
  var e = this, n = (
    /** @type {Node} */
    e.ownerDocument
  ), i = t.type, r = ((h = t.composedPath) == null ? void 0 : h.call(t)) || [], s = (
    /** @type {null | Element} */
    r[0] || t.target
  );
  fs = t;
  var a = 0, o = fs === t && t[Ut];
  if (o) {
    var l = r.indexOf(o);
    if (l !== -1 && (e === document || e === /** @type {any} */
    window)) {
      t[Ut] = e;
      return;
    }
    var c = r.indexOf(e);
    if (c === -1)
      return;
    l <= c && (a = l);
  }
  if (s = /** @type {Element} */
  r[a] || t.target, s !== e) {
    xr(t, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var d = I, f = k;
    le(null), xe(null);
    try {
      for (var m, b = []; s !== null; ) {
        var _ = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var $ = (v = s[Ut]) == null ? void 0 : v[i];
          $ != null && (!/** @type {any} */
          s.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          t.target === s) && $.call(s, t);
        } catch (g) {
          m ? b.push(g) : m = g;
        }
        if (t.cancelBubble || _ === e || _ === null)
          break;
        s = _;
      }
      if (m) {
        for (let g of b)
          queueMicrotask(() => {
            throw g;
          });
        throw m;
      }
    } finally {
      t[Ut] = e, delete t.currentTarget, le(d), xe(f);
    }
  }
}
var Bs;
const Qr = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  ((Bs = globalThis == null ? void 0 : globalThis.window) == null ? void 0 : Bs.trustedTypes) && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (t) => t
  })
);
function nc(t) {
  return (
    /** @type {string} */
    (Qr == null ? void 0 : Qr.createHTML(t)) ?? t
  );
}
function rc(t) {
  var e = Gr("template");
  return e.innerHTML = nc(t.replaceAll("<!>", "<!---->")), e.content;
}
function lt(t, e) {
  var n = (
    /** @type {Effect} */
    k
  );
  n.nodes === null && (n.nodes = { start: t, end: e, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function dt(t, e) {
  var n = (e & Qo) !== 0, i = (e & Zo) !== 0, r, s = !t.startsWith("<!>");
  return () => {
    if (P)
      return lt(L, null), L;
    r === void 0 && (r = rc(s ? t : "<!>" + t), n || (r = /** @type {TemplateNode} */
    /* @__PURE__ */ $e(r)));
    var a = (
      /** @type {TemplateNode} */
      i || wa ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    if (n) {
      var o = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ $e(a)
      ), l = (
        /** @type {TemplateNode} */
        a.lastChild
      );
      lt(o, l);
    } else
      lt(a, a);
    return a;
  };
}
function _s() {
  if (P)
    return lt(L, null), L;
  var t = document.createDocumentFragment(), e = document.createComment(""), n = Oe();
  return t.append(e, n), lt(e, n), t;
}
function be(t, e) {
  if (P) {
    var n = (
      /** @type {Effect & { nodes: EffectNodes }} */
      k
    );
    ((n.f & kt) === 0 || n.nodes.end === null) && (n.nodes.end = L), Sn();
    return;
  }
  t !== null && t.before(
    /** @type {Node} */
    e
  );
}
const ic = ["touchstart", "touchmove"];
function sc(t) {
  return ic.includes(t);
}
function ac(t, e) {
  var n = e == null ? "" : typeof e == "object" ? `${e}` : e;
  n !== (t.__t ?? (t.__t = t.nodeValue)) && (t.__t = n, t.nodeValue = `${n}`);
}
function Ga(t, e) {
  return Ua(t, e);
}
function oc(t, e) {
  _i(), e.intro = e.intro ?? !1;
  const n = e.target, i = P, r = L;
  try {
    for (var s = /* @__PURE__ */ $e(n); s && (s.nodeType !== In || /** @type {Comment} */
    s.data !== Ws); )
      s = /* @__PURE__ */ qe(s);
    if (!s)
      throw Qt;
    He(!0), te(
      /** @type {Comment} */
      s
    );
    const a = Ua(t, { ...e, anchor: s });
    return He(!1), /**  @type {Exports} */
    a;
  } catch (a) {
    if (a instanceof Error && a.message.split(`
`).some((o) => o.startsWith("https://svelte.dev/e/")))
      throw a;
    return a !== Qt && console.warn("Failed to hydrate: ", a), e.recover === !1 && wl(), _i(), Aa(n), He(!1), Ga(t, e);
  } finally {
    He(i), te(r);
  }
}
const ur = /* @__PURE__ */ new Map();
function Ua(t, { target: e, anchor: n, props: i = {}, events: r, context: s, intro: a = !0, transformError: o }) {
  _i();
  var l = void 0, c = Kl(() => {
    var d = n ?? e.appendChild(Oe());
    Dl(
      /** @type {TemplateNode} */
      d,
      {
        pending: () => {
        }
      },
      (b) => {
        Oi({});
        var _ = (
          /** @type {ComponentContext} */
          oe
        );
        if (s && (_.c = s), r && (i.$$events = r), P && lt(
          /** @type {TemplateNode} */
          b,
          null
        ), l = t(b, i) || {}, P && (k.nodes.end = L, L === null || L.nodeType !== In || /** @type {Comment} */
        L.data !== Ai))
          throw sr(), Qt;
        Si();
      },
      o
    );
    var f = /* @__PURE__ */ new Set(), m = (b) => {
      for (var _ = 0; _ < b.length; _++) {
        var $ = b[_];
        if (!f.has($)) {
          f.add($);
          var h = sc($);
          for (const w of [e, document]) {
            var v = ur.get(w);
            v === void 0 && (v = /* @__PURE__ */ new Map(), ur.set(w, v));
            var g = v.get($);
            g === void 0 ? (w.addEventListener($, ps, { passive: h }), v.set($, 1)) : v.set($, g + 1);
          }
        }
      }
    };
    return m(Mr(qa)), vi.add(m), () => {
      var h;
      for (var b of f)
        for (const v of [e, document]) {
          var _ = (
            /** @type {Map<string, number>} */
            ur.get(v)
          ), $ = (
            /** @type {number} */
            _.get(b)
          );
          --$ == 0 ? (v.removeEventListener(b, ps), _.delete(b), _.size === 0 && ur.delete(v)) : _.set(b, $);
        }
      vi.delete(m), d !== n && ((h = d.parentNode) == null || h.removeChild(d));
    };
  });
  return gi.set(l, c), l;
}
let gi = /* @__PURE__ */ new WeakMap();
function lc(t, e) {
  const n = gi.get(t);
  return n ? (gi.delete(t), n(e)) : Promise.resolve();
}
var ke, We, pe, Yt, rr, ir, Dr;
class cc {
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(e, n = !0) {
    /** @type {TemplateNode} */
    j(this, "anchor");
    /** @type {Map<Batch, Key>} */
    N(this, ke, /* @__PURE__ */ new Map());
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
    N(this, pe, /* @__PURE__ */ new Map());
    /**
     * Keys of effects that are currently outroing
     * @type {Set<Key>}
     */
    N(this, Yt, /* @__PURE__ */ new Set());
    /**
     * Whether to pause (i.e. outro) on change, or destroy immediately.
     * This is necessary for `<svelte:element>`
     */
    N(this, rr, !0);
    /**
     * @param {Batch} batch
     */
    N(this, ir, (e) => {
      if (u(this, ke).has(e)) {
        var n = (
          /** @type {Key} */
          u(this, ke).get(e)
        ), i = u(this, We).get(n);
        if (i)
          Di(i), u(this, Yt).delete(n);
        else {
          var r = u(this, pe).get(n);
          r && (u(this, We).set(n, r.effect), u(this, pe).delete(n), r.fragment.lastChild.remove(), this.anchor.before(r.fragment), i = r.effect);
        }
        for (const [s, a] of u(this, ke)) {
          if (u(this, ke).delete(s), s === e)
            break;
          const o = u(this, pe).get(a);
          o && (re(o.effect), u(this, pe).delete(a));
        }
        for (const [s, a] of u(this, We)) {
          if (s === n || u(this, Yt).has(s)) continue;
          const o = () => {
            if (Array.from(u(this, ke).values()).includes(s)) {
              var c = document.createDocumentFragment();
              Mi(a, c), c.append(Oe()), u(this, pe).set(s, { effect: a, fragment: c });
            } else
              re(a);
            u(this, Yt).delete(s), u(this, We).delete(s);
          };
          u(this, rr) || !i ? (u(this, Yt).add(s), Jt(a, o, !1)) : o();
        }
      }
    });
    /**
     * @param {Batch} batch
     */
    N(this, Dr, (e) => {
      u(this, ke).delete(e);
      const n = Array.from(u(this, ke).values());
      for (const [i, r] of u(this, pe))
        n.includes(i) || (re(r.effect), u(this, pe).delete(i));
    });
    this.anchor = e, C(this, rr, n);
  }
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(e, n) {
    var i = (
      /** @type {Batch} */
      R
    ), r = Oa();
    if (n && !u(this, We).has(e) && !u(this, pe).has(e))
      if (r) {
        var s = document.createDocumentFragment(), a = Oe();
        s.append(a), u(this, pe).set(e, {
          effect: Ee(() => n(a)),
          fragment: s
        });
      } else
        u(this, We).set(
          e,
          Ee(() => n(this.anchor))
        );
    if (u(this, ke).set(i, e), r) {
      for (const [o, l] of u(this, We))
        o === e ? i.unskip_effect(l) : i.skip_effect(l);
      for (const [o, l] of u(this, pe))
        o === e ? i.unskip_effect(l.effect) : i.skip_effect(l.effect);
      i.oncommit(u(this, ir)), i.ondiscard(u(this, Dr));
    } else
      P && (this.anchor = L), u(this, ir).call(this, i);
  }
}
ke = new WeakMap(), We = new WeakMap(), pe = new WeakMap(), Yt = new WeakMap(), rr = new WeakMap(), ir = new WeakMap(), Dr = new WeakMap();
function za(t) {
  oe === null && pl(), mn(() => {
    const e = Pe(t);
    if (typeof e == "function") return (
      /** @type {() => void} */
      e
    );
  });
}
function vt(t, e, n = !1) {
  var i;
  P && (i = L, Sn());
  var r = new cc(t), s = n ? On : 0;
  function a(o, l) {
    if (P) {
      var c = Zs(
        /** @type {TemplateNode} */
        i
      );
      if (o !== parseInt(c.substring(1))) {
        var d = Tr();
        te(d), r.anchor = d, He(!1), r.ensure(o, l), He(!0);
        return;
      }
    }
    r.ensure(o, l);
  }
  ki(() => {
    var o = !1;
    e((l, c = 0) => {
      o = !0, a(c, l);
    }), o || a(-1, null);
  }, s);
}
function dc(t, e, n) {
  for (var i = [], r = e.length, s, a = e.length, o = 0; o < r; o++) {
    let f = e[o];
    Jt(
      f,
      () => {
        if (s) {
          if (s.pending.delete(f), s.done.add(f), s.pending.size === 0) {
            var m = (
              /** @type {Set<EachOutroGroup>} */
              t.outrogroups
            );
            mi(t, Mr(s.done)), m.delete(s), m.size === 0 && (t.outrogroups = null);
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
      Aa(d), d.append(c), t.items.clear();
    }
    mi(t, e, !l);
  } else
    s = {
      pending: new Set(e),
      done: /* @__PURE__ */ new Set()
    }, (t.outrogroups ?? (t.outrogroups = /* @__PURE__ */ new Set())).add(s);
}
function mi(t, e, n = !0) {
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
      s.f |= ot;
      const a = document.createDocumentFragment();
      Mi(s, a);
    } else
      re(e[r], n);
  }
}
var vs;
function uc(t, e, n, i, r, s = null) {
  var a = t, o = /* @__PURE__ */ new Map();
  {
    var l = (
      /** @type {Element} */
      t
    );
    a = P ? te(/* @__PURE__ */ $e(l)) : l.appendChild(Oe());
  }
  P && Sn();
  var c = null, d = /* @__PURE__ */ ql(() => {
    var g = n();
    return Js(g) ? g : g == null ? [] : Mr(g);
  }), f, m = /* @__PURE__ */ new Map(), b = !0;
  function _(g) {
    (v.effect.f & _e) === 0 && (v.pending.delete(g), v.fallback = c, hc(v, f, a, e, i), c !== null && (f.length === 0 ? (c.f & ot) === 0 ? Di(c) : (c.f ^= ot, Fn(c, null, a)) : Jt(c, () => {
      c = null;
    })));
  }
  function $(g) {
    v.pending.delete(g);
  }
  var h = ki(() => {
    f = /** @type {V[]} */
    p(d);
    var g = f.length;
    let w = !1;
    if (P) {
      var x = Zs(a) === $i;
      x !== (g === 0) && (a = Tr(), te(a), He(!1), w = !0);
    }
    for (var O = /* @__PURE__ */ new Set(), T = (
      /** @type {Batch} */
      R
    ), D = Oa(), W = 0; W < g; W += 1) {
      P && L.nodeType === In && /** @type {Comment} */
      L.data === Ai && (a = /** @type {Comment} */
      L, w = !0, He(!1));
      var ge = f[W], Pt = i(ge, W), ce = b ? null : o.get(Pt);
      ce ? (ce.v && Tn(ce.v, ge), ce.i && Tn(ce.i, W), D && T.unskip_effect(ce.e)) : (ce = fc(
        o,
        b ? a : vs ?? (vs = Oe()),
        ge,
        Pt,
        W,
        r,
        e,
        n
      ), b || (ce.e.f |= ot), o.set(Pt, ce)), O.add(Pt);
    }
    if (g === 0 && s && !c && (b ? c = Ee(() => s(a)) : (c = Ee(() => s(vs ?? (vs = Oe()))), c.f |= ot)), g > O.size && vl(), P && g > 0 && te(Tr()), !b)
      if (m.set(T, O), D) {
        for (const [dr, on] of o)
          O.has(dr) || T.skip_effect(on.e);
        T.oncommit(_), T.ondiscard($);
      } else
        _(T);
    w && He(!0), p(d);
  }), v = { effect: h, items: o, pending: m, outrogroups: null, fallback: c };
  b = !1, P && (a = L);
}
function Hn(t) {
  for (; t !== null && (t.f & Fe) === 0; )
    t = t.next;
  return t;
}
function hc(t, e, n, i, r) {
  var W;
  var s = e.length, a = t.items, o = Hn(t.effect.first), l, c = null, d = [], f = [], m, b, _, $;
  for ($ = 0; $ < s; $ += 1) {
    if (m = e[$], b = r(m, $), _ = /** @type {EachItem} */
    a.get(b).e, t.outrogroups !== null)
      for (const ge of t.outrogroups)
        ge.pending.delete(_), ge.done.delete(_);
    if ((_.f & ae) !== 0 && Di(_), (_.f & ot) !== 0)
      if (_.f ^= ot, _ === o)
        Fn(_, null, n);
      else {
        var h = c ? c.next : o;
        _ === t.effect.last && (t.effect.last = _.prev), _.prev && (_.prev.next = _.next), _.next && (_.next.prev = _.prev), ft(t, c, _), ft(t, _, h), Fn(_, h, n), c = _, d = [], f = [], o = Hn(c.next);
        continue;
      }
    if (_ !== o) {
      if (l !== void 0 && l.has(_)) {
        if (d.length < f.length) {
          var v = f[0], g;
          c = v.prev;
          var w = d[0], x = d[d.length - 1];
          for (g = 0; g < d.length; g += 1)
            Fn(d[g], v, n);
          for (g = 0; g < f.length; g += 1)
            l.delete(f[g]);
          ft(t, w.prev, x.next), ft(t, c, w), ft(t, x, v), o = v, c = x, $ -= 1, d = [], f = [];
        } else
          l.delete(_), Fn(_, o, n), ft(t, _.prev, _.next), ft(t, _, c === null ? t.effect.first : c.next), ft(t, c, _), c = _;
        continue;
      }
      for (d = [], f = []; o !== null && o !== _; )
        (l ?? (l = /* @__PURE__ */ new Set())).add(o), f.push(o), o = Hn(o.next);
      if (o === null)
        continue;
    }
    (_.f & ot) === 0 && d.push(_), c = _, o = Hn(_.next);
  }
  if (t.outrogroups !== null) {
    for (const ge of t.outrogroups)
      ge.pending.size === 0 && (mi(t, Mr(ge.done)), (W = t.outrogroups) == null || W.delete(ge));
    t.outrogroups.size === 0 && (t.outrogroups = null);
  }
  if (o !== null || l !== void 0) {
    var O = [];
    if (l !== void 0)
      for (_ of l)
        (_.f & ae) === 0 && O.push(_);
    for (; o !== null; )
      (o.f & ae) === 0 && o !== t.fallback && O.push(o), o = Hn(o.next);
    var T = O.length;
    if (T > 0) {
      var D = s === 0 ? n : null;
      dc(t, O, D);
    }
  }
}
function fc(t, e, n, i, r, s, a, o) {
  var l = (a & Jo) !== 0 ? (a & Xo) === 0 ? /* @__PURE__ */ ba(n, !1, !1) : en(n) : null, c = (a & Ko) !== 0 ? en(r) : null;
  return {
    v: l,
    i: c,
    e: Ee(() => (s(e, l ?? n, c ?? r, o), () => {
      t.delete(i);
    }))
  };
}
function Fn(t, e, n) {
  if (t.nodes)
    for (var i = t.nodes.start, r = t.nodes.end, s = e && (e.f & ot) === 0 ? (
      /** @type {EffectNodes} */
      e.nodes.start
    ) : n; i !== null; ) {
      var a = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ qe(i)
      );
      if (s.before(i), i === r)
        return;
      i = a;
    }
}
function ft(t, e, n) {
  e === null ? t.effect.first = n : e.next = n, n === null ? t.effect.last = e : n.prev = e;
}
function pc(t, e, n = !1, i = !1, r = !1, s = !1) {
  var a = t, o = "";
  if (n) {
    var l = (
      /** @type {Element} */
      t
    );
    P && (a = te(/* @__PURE__ */ $e(l)));
  }
  Ze(() => {
    var c = (
      /** @type {Effect} */
      k
    );
    if (o === (o = e() ?? "")) {
      P && Sn();
      return;
    }
    if (n && !P) {
      c.nodes = null, l.innerHTML = /** @type {string} */
      o, o !== "" && lt(
        /** @type {TemplateNode} */
        /* @__PURE__ */ $e(l),
        /** @type {TemplateNode} */
        l.lastChild
      );
      return;
    }
    if (c.nodes !== null && (Ca(
      c.nodes.start,
      /** @type {TemplateNode} */
      c.nodes.end
    ), c.nodes = null), o !== "") {
      if (P) {
        L.data;
        for (var d = Sn(), f = d; d !== null && (d.nodeType !== In || /** @type {Comment} */
        d.data !== ""); )
          f = d, d = /* @__PURE__ */ qe(d);
        if (d === null)
          throw sr(), Qt;
        lt(L, f), a = te(d);
        return;
      }
      var m = i ? el : r ? tl : void 0, b = (
        /** @type {HTMLTemplateElement | SVGElement | MathMLElement} */
        Gr(i ? "svg" : r ? "math" : "template", m)
      );
      b.innerHTML = /** @type {any} */
      o;
      var _ = i || r ? b : (
        /** @type {HTMLTemplateElement} */
        b.content
      );
      if (lt(
        /** @type {TemplateNode} */
        /* @__PURE__ */ $e(_),
        /** @type {TemplateNode} */
        _.lastChild
      ), i || r)
        for (; /* @__PURE__ */ $e(_); )
          a.before(
            /** @type {TemplateNode} */
            /* @__PURE__ */ $e(_)
          );
      else
        a.before(_);
    }
  });
}
function Ba(t, e) {
  Ta(() => {
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
      const r = Gr("style");
      r.id = e.hash, r.textContent = e.code, i.appendChild(r);
    }
  });
}
function _c(t, e, n) {
  var i = t == null ? "" : "" + t;
  return e && (i = i ? i + " " + e : e), i === "" ? null : i;
}
function vc(t, e) {
  return t == null ? null : String(t);
}
function Ce(t, e, n, i, r, s) {
  var a = t.__className;
  if (P || a !== n || a === void 0) {
    var o = _c(n, i);
    (!P || o !== t.getAttribute("class")) && (o == null ? t.removeAttribute("class") : t.className = o), t.__className = n;
  }
  return s;
}
function gt(t, e, n, i) {
  var r = t.__style;
  if (P || r !== e) {
    var s = vc(e);
    (!P || s !== t.getAttribute("style")) && (s == null ? t.removeAttribute("style") : t.style.cssText = s), t.__style = e;
  }
  return i;
}
const gc = Symbol("is custom element"), mc = Symbol("is html"), bc = fl ? "link" : "LINK";
function Va(t, e, n, i) {
  var r = yc(t);
  P && (r[e] = t.getAttribute(e), e === "src" || e === "srcset" || e === "href" && t.nodeName === bc) || r[e] !== (r[e] = n) && (e === "loading" && (t[hl] = n), n == null ? t.removeAttribute(e) : typeof n != "string" && Wa(t).includes(e) ? t[e] = n : t.setAttribute(e, n));
}
function gs(t, e, n) {
  var i = I, r = k;
  let s = P;
  P && He(!1), le(null), xe(null);
  try {
    // `style` should use `set_attribute` rather than the setter
    e !== "style" && // Don't compute setters for custom elements while they aren't registered yet,
    // because during their upgrade/instantiation they might add more setters.
    // Instead, fall back to a simple "an object, then set as property" heuristic.
    (bi.has(t.getAttribute("is") || t.nodeName) || // customElements may not be available in browser extension contexts
    !customElements || customElements.get(t.getAttribute("is") || t.nodeName.toLowerCase()) ? Wa(t).includes(e) : n && typeof n == "object") ? t[e] = n : Va(t, e, n == null ? n : String(n));
  } finally {
    le(i), xe(r), s && He(!0);
  }
}
function yc(t) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    t.__attributes ?? (t.__attributes = {
      [gc]: t.nodeName.includes("-"),
      [mc]: t.namespaceURI === Ys
    })
  );
}
var bi = /* @__PURE__ */ new Map();
function Wa(t) {
  var e = t.getAttribute("is") || t.nodeName, n = bi.get(e);
  if (n) return n;
  bi.set(e, n = []);
  for (var i, r = t, s = Element.prototype; s !== r; ) {
    i = il(r);
    for (var a in i)
      i[a].set && n.push(a);
    r = Ks(r);
  }
  return n;
}
function ms(t, e) {
  return t === e || (t == null ? void 0 : t[pr]) === e;
}
function mt(t = {}, e, n, i) {
  var r = (
    /** @type {ComponentContext} */
    oe.r
  ), s = (
    /** @type {Effect} */
    k
  );
  return Ta(() => {
    var a, o;
    return Li(() => {
      a = o, o = [], Pe(() => {
        t !== n(...o) && (e(t, ...o), a && ms(n(...a), t) && e(null, ...a));
      });
    }), () => {
      let l = s;
      for (; l !== r && l.parent !== null && l.parent.f & ai; )
        l = l.parent;
      const c = () => {
        o && ms(n(...o), t) && e(null, ...o);
      }, d = l.teardown;
      l.teardown = () => {
        c(), d == null || d();
      };
    };
  }), t;
}
function Ie(t, e, n, i) {
  var r = (
    /** @type {V} */
    i
  ), s = !0, a = () => (s && (s = !1, r = /** @type {V} */
  i), r), o;
  o = /** @type {V} */
  t[e], o === void 0 && i !== void 0 && (o = a());
  var l;
  l = () => {
    var m = (
      /** @type {V} */
      t[e]
    );
    return m === void 0 ? a() : (s = !0, m);
  };
  var c = !1, d = /* @__PURE__ */ qr(() => (c = !1, l())), f = (
    /** @type {Effect} */
    k
  );
  return (
    /** @type {() => V} */
    function(m, b) {
      if (arguments.length > 0) {
        const _ = b ? p(d) : m;
        return S(d, _), c = !0, r !== void 0 && (r = _), m;
      }
      return Rt && c || (f.f & _e) !== 0 ? d.v : p(d);
    }
  );
}
function wc(t) {
  return new Ec(t);
}
var at, ye;
class Ec {
  /**
   * @param {ComponentConstructorOptions & {
   *  component: any;
   * }} options
   */
  constructor(e) {
    /** @type {any} */
    N(this, at);
    /** @type {Record<string, any>} */
    N(this, ye);
    var s;
    var n = /* @__PURE__ */ new Map(), i = (a, o) => {
      var l = /* @__PURE__ */ ba(o, !1, !1);
      return n.set(a, l), l;
    };
    const r = new Proxy(
      { ...e.props || {}, $$events: {} },
      {
        get(a, o) {
          return p(n.get(o) ?? i(o, Reflect.get(a, o)));
        },
        has(a, o) {
          return o === ul ? !0 : (p(n.get(o) ?? i(o, Reflect.get(a, o))), Reflect.has(a, o));
        },
        set(a, o, l) {
          return S(n.get(o) ?? i(o, l), l), Reflect.set(a, o, l);
        }
      }
    );
    C(this, ye, (e.hydrate ? oc : Ga)(e.component, {
      target: e.target,
      anchor: e.anchor,
      props: r,
      context: e.context,
      intro: e.intro ?? !1,
      recover: e.recover,
      transformError: e.transformError
    })), (!((s = e == null ? void 0 : e.props) != null && s.$$host) || e.sync === !1) && we(), C(this, at, r.$$events);
    for (const a of Object.keys(u(this, ye)))
      a === "$set" || a === "$destroy" || a === "$on" || xr(this, a, {
        get() {
          return u(this, ye)[a];
        },
        /** @param {any} value */
        set(o) {
          u(this, ye)[a] = o;
        },
        enumerable: !0
      });
    u(this, ye).$set = /** @param {Record<string, any>} next */
    (a) => {
      Object.assign(r, a);
    }, u(this, ye).$destroy = () => {
      lc(u(this, ye));
    };
  }
  /** @param {Record<string, any>} props */
  $set(e) {
    u(this, ye).$set(e);
  }
  /**
   * @param {string} event
   * @param {(...args: any[]) => any} callback
   * @returns {any}
   */
  $on(e, n) {
    u(this, at)[e] = u(this, at)[e] || [];
    const i = (...r) => n.call(this, ...r);
    return u(this, at)[e].push(i), () => {
      u(this, at)[e] = u(this, at)[e].filter(
        /** @param {any} fn */
        (r) => r !== i
      );
    };
  }
  $destroy() {
    u(this, ye).$destroy();
  }
}
at = new WeakMap(), ye = new WeakMap();
let Ya;
typeof HTMLElement == "function" && (Ya = class extends HTMLElement {
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
          const a = Gr("slot");
          r !== "default" && (a.name = r), be(s, a);
        };
      };
      if (await Promise.resolve(), !this.$$cn || this.$$c)
        return;
      const n = {}, i = $c(this);
      for (const r of this.$$s)
        r in i && (r === "default" && !this.$$d.children ? (this.$$d.children = e(r), n.default = !0) : n[r] = e(r));
      for (const r of this.attributes) {
        const s = this.$$g_p(r.name);
        s in this.$$d || (this.$$d[s] = wr(s, r.value, this.$$p_d, "toProp"));
      }
      for (const r in this.$$p_d)
        !(r in this.$$d) && this[r] !== void 0 && (this.$$d[r] = this[r], delete this[r]);
      this.$$c = wc({
        component: this.$$ctor,
        target: this.$$shadowRoot || this,
        props: {
          ...this.$$d,
          $$slots: n,
          $$host: this
        }
      }), this.$$me = Jl(() => {
        Li(() => {
          var r;
          this.$$r = !0;
          for (const s of Sr(this.$$c)) {
            if (!((r = this.$$p_d[s]) != null && r.reflect)) continue;
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
    this.$$r || (e = this.$$g_p(e), this.$$d[e] = wr(e, i, this.$$p_d, "toProp"), (r = this.$$c) == null || r.$set({ [e]: this.$$d[e] }));
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
function wr(t, e, n, i) {
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
function $c(t) {
  const e = {};
  return t.childNodes.forEach((n) => {
    e[
      /** @type {Element} node */
      n.slot || "default"
    ] = !0;
  }), e;
}
function Ja(t, e, n, i, r, s) {
  let a = class extends Ya {
    constructor() {
      super(t, n, r), this.$$p_d = e;
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
        var c = this.$$c;
        if (c) {
          var d = (f = vn(c, o)) == null ? void 0 : f.get;
          d ? c[o] = l : c.$set({ [o]: l });
        }
      }
    });
  }), i.forEach((o) => {
    xr(a.prototype, o, {
      get() {
        var l;
        return (l = this.$$c) == null ? void 0 : l[o];
      }
    });
  }), s && (a = s(a)), t.element = /** @type {any} */
  a, a;
}
class Hi extends Error {
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  constructor(e, ...n) {
    super(...n), Error.captureStackTrace && Error.captureStackTrace(this, Hi), this.name = "TimeoutError", this.timeout = e, this.message = `Timed out in ${e} ms.`;
  }
}
const Ac = (t, e) => {
  const n = new Promise((i, r) => {
    setTimeout(() => {
      r(new Hi(t));
    }, t);
  });
  return Promise.race([e, n]);
}, Ka = (t) => {
  if (typeof t.getCardSize == "function")
    try {
      return Ac(500, t.getCardSize()).catch(
        () => 1
      );
    } catch {
      return 1;
    }
  return customElements.get(t.localName) ? 1 : customElements.whenDefined(t.localName).then(() => Ka(t));
};
var Oc = /* @__PURE__ */ dt('<span class="loading svelte-lv9s7p">Loading...</span>'), Sc = /* @__PURE__ */ dt("<div><!></div>");
const xc = {
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
function yi(t, e) {
  Oi(e, !0), Ba(t, xc);
  const n = Ie(e, "config"), i = Ie(e, "hass"), r = Ie(e, "preview"), s = Ie(e, "marginTop", 7, "0px"), a = Ie(e, "open"), o = Ie(e, "animation", 7, !0), l = Ie(e, "animationState"), c = Ie(e, "clearCardCss", 7, !1);
  let d = null, f = /* @__PURE__ */ H(null), m = /* @__PURE__ */ H(!0), b = /* @__PURE__ */ H(0);
  const _ = Pe(() => JSON.parse(JSON.stringify(n())));
  mn(() => {
    p(f) && (p(f).hass = i());
  }), mn(() => {
    p(f) && r() !== void 0 && (p(f).preview = r());
  }), mn(() => {
    var w;
    p(f) && (_.disabled = !a(), (w = p(f)._element) == null || w.dispatchEvent(new CustomEvent("card-visibility-changed", { detail: { value: a() }, bubbles: !0, composed: !1 })));
  }), za(async () => {
    const w = document.createElement("hui-card");
    w.hass = i(), w.preview = r(), _.disabled = !a(), w.config = _, w.load(), d == null || d.appendChild(w), S(f, w, !0), S(m, !1), p(f).addEventListener(
      "ll-upgrade",
      (x) => {
        var O;
        x.stopPropagation(), (O = p(f)) != null && O._element && i() && (p(f)._element.hass = i());
      },
      { capture: !0 }
    ), c() && (w.style.setProperty("--ha-card-background", "transparent"), w.style.setProperty("--ha-card-box-shadow", "none"), w.style.setProperty("--ha-card-border-color", "transparent"), w.style.setProperty("--ha-card-border-width", "0px"), w.style.setProperty("--ha-card-backdrop-filter", "none")), o() && (S(b, await Ka(w) * 56), d && S(b, p(b) + (window.getComputedStyle(d).marginTop ? parseFloat(window.getComputedStyle(d).marginTop) : 0)), new ResizeObserver((O) => {
      for (const T of O)
        if (T.contentBoxSize) {
          const D = Array.isArray(T.contentBoxSize) ? T.contentBoxSize[0] : T.contentBoxSize;
          D.blockSize && (S(b, D.blockSize, !0), p(f) && S(b, p(b) + (window.getComputedStyle(p(f)).marginTop ? parseFloat(window.getComputedStyle(p(f)).marginTop) : 0)));
        } else T.contentRect && (S(b, T.contentRect.height, !0), p(f) && S(b, p(b) + (window.getComputedStyle(p(f)).marginTop ? parseFloat(window.getComputedStyle(p(f)).marginTop) : 0)));
    }).observe(w));
  });
  var $ = {
    get config() {
      return n();
    },
    set config(w) {
      n(w), we();
    },
    get hass() {
      return i();
    },
    set hass(w) {
      i(w), we();
    },
    get preview() {
      return r();
    },
    set preview(w) {
      r(w), we();
    },
    get marginTop() {
      return s();
    },
    set marginTop(w = "0px") {
      s(w), we();
    },
    get open() {
      return a();
    },
    set open(w) {
      a(w), we();
    },
    get animation() {
      return o();
    },
    set animation(w = !0) {
      o(w), we();
    },
    get animationState() {
      return l();
    },
    set animationState(w) {
      l(w), we();
    },
    get clearCardCss() {
      return c();
    },
    set clearCardCss(w = !1) {
      c(w), we();
    }
  }, h = Sc(), v = _t(h);
  {
    var g = (w) => {
      var x = Oc();
      be(w, x);
    };
    vt(v, (w) => {
      p(m) && w(g);
    });
  }
  return Qe(h), mt(h, (w) => d = w, () => d), Ze(() => {
    Ce(h, 1, `outer-container${a() ? " open" : " close"}${o() ? " animation " + l() : ""}`, "svelte-lv9s7p"), gt(h, `--child-card-margin-top: ${(a() ? s() : "0px") ?? ""};${p(b) ? ` --expander-animation-height: -${p(b)}px;` : ""}`);
  }), be(t, h), Si($);
}
customElements.define("expander-sub-card", Ja(
  yi,
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
const Tc = (t, e) => {
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
  var i;
  n === void 0 && (n = {});
  var r = n.retries, s = r === void 0 ? 10 : r, a = n.delay, o = a === void 0 ? 10 : a, l = n.shouldReject, c = l === void 0 || l, d = (i = n.rejectMessage) !== null && i !== void 0 ? i : "Could not get the result after {{ retries }} retries";
  return new Promise(function(f, m) {
    var b = 0, _ = function() {
      var $ = t();
      e($) ? f($) : ++b < s ? setTimeout(_, o) : c ? m(new Error(d.replace(/\{\{\s*retries\s*\}\}/g, "".concat(s)))) : f($);
    };
    _();
  });
};
const Zr = "[home-assistant-javascript-templates]", Nc = /^([a-z_]+)\.(\w+)$/;
var Cr, _n, De, bt;
(function(t) {
  t.UNKNOWN = "unknown", t.UNAVAILABLE = "unavailable";
})(Cr || (Cr = {})), function(t) {
  t.AREA_ID = "area_id", t.NAME = "name";
}(_n || (_n = {})), function(t) {
  t.PANEL_URL = "panel_url", t.LANG = "lang";
}(De || (De = {})), function(t) {
  t.LOCATION_CHANGED = "location-changed", t.TRANSLATIONS_UPDATED = "translations-updated", t.POPSTATE = "popstate", t.SUBSCRIBE_EVENTS = "subscribe_events", t.STATE_CHANGE_EVENT = "state_changed";
}(bt || (bt = {}));
const Cc = "refs", bs = (t) => t.reduce((e, n) => {
  const [i, r] = n;
  return e[i.replace(Nc, "$2")] = r, e;
}, {}), pt = (t) => t.includes("."), Er = "ref", jt = "value", ys = "toJSON", ws = (t) => `${Er}.${t}`;
function Rc(t, e, n) {
  const i = () => Object.entries(t.hass.areas), r = () => Object.entries(t.hass.devices), s = () => Object.entries(t.hass.entities), a = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map(), l = (h, v) => {
    n && console.warn(`${h} ${v} used in a JavaScript template doesn't exist`);
  }, c = (h) => l("Entity", h), d = (h) => l("Domain", h), f = (h) => {
    const v = new SyntaxError(h);
    if (e) throw v;
    n && console.warn(v);
  }, m = (h) => {
    t.hass.states[h] ? a.add(h) : c(h);
  }, b = (h) => {
    a.add(h);
  }, _ = (h, v) => {
    const { with_unit: g = !1, rounded: w = !1 } = v;
    if (h) {
      const x = h.state, O = h.attributes.unit_of_measurement, T = Number(w), D = w === !1 || isNaN(Number(x)) ? x : new Intl.NumberFormat(t.hass.language, { minimumFractionDigits: T, maximumFractionDigits: T }).format(Number(x));
      return g && O ? `${D} ${O}` : D;
    }
  }, $ = (h) => new Proxy(h, { get: (v, g) => g === "state_with_unit" ? _(v, { rounded: !0, with_unit: !0 }) : v[g] });
  return { get hass() {
    return t.hass;
  }, states: new Proxy((h, v = {}) => {
    if (pt(h)) return m(h), _(t.hass.states[h], v);
    throw SyntaxError(`${Zr}: states method cannot be used with a domain, use it as an object instead.`);
  }, { get(h, v) {
    if (pt(v)) return m(v), $(t.hass.states[v]);
    const g = Object.entries(t.hass.states).filter(([w]) => w.startsWith(v));
    return g.length || d(v), new Proxy(bs(g), { get: (w, x) => (m(`${v}.${x}`), $(w[x])) });
  } }), state_translated(h) {
    if (m(h), t.hass.states[h]) return t.hass.formatEntityState(t.hass.states[h]);
  }, is_state(h, v) {
    var g;
    return m(h), Array.isArray(v) ? v.some((w) => {
      var x;
      return ((x = t.hass.states[h]) === null || x === void 0 ? void 0 : x.state) === w;
    }) : ((g = t.hass.states[h]) === null || g === void 0 ? void 0 : g.state) === v;
  }, state_attr(h, v) {
    var g, w;
    return m(h), (w = (g = t.hass.states[h]) === null || g === void 0 ? void 0 : g.attributes) === null || w === void 0 ? void 0 : w[v];
  }, is_state_attr(h, v, g) {
    return this.state_attr(h, v) === g;
  }, has_value(h) {
    return this.states(h) ? !(this.is_state(h, Cr.UNKNOWN) || this.is_state(h, Cr.UNAVAILABLE)) : (c(h), !1);
  }, entities: new Proxy((h) => {
    if (h === void 0) return t.hass.entities;
    if (pt(h)) return m(h), t.hass.entities[h];
    const v = s().filter(([g]) => g.startsWith(h));
    return v.length || d(h), new Proxy(bs(v), { get: (g, w) => (m(`${h}.${w}`), g[w]) });
  }, { get: (h, v) => h(v) }), entity_prop(h, v) {
    var g;
    return m(h), (g = t.hass.entities[h]) === null || g === void 0 ? void 0 : g[v];
  }, is_entity_prop(h, v, g) {
    return this.entity_prop(h, v) === g;
  }, devices: new Proxy((h) => {
    if (h === void 0) return t.hass.devices;
    if (pt(h)) throw SyntaxError(`${Zr}: devices method cannot be used with an entity id, you should use a device id instead.`);
    return t.hass.devices[h];
  }, { get(h, v) {
    if (pt(v)) throw SyntaxError(`${Zr}: devices cannot be accesed using an entity id, you should use a device id instead.`);
    return t.hass.devices[v];
  } }), device_attr(h, v) {
    var g, w, x;
    if (pt(h)) {
      m(h);
      const O = (g = t.hass.entities[h]) === null || g === void 0 ? void 0 : g.device_id;
      return (w = t.hass.devices[O]) === null || w === void 0 ? void 0 : w[v];
    }
    return (x = t.hass.devices[h]) === null || x === void 0 ? void 0 : x[v];
  }, is_device_attr(h, v, g) {
    return this.device_attr(h, v) === g;
  }, device_id(h) {
    var v;
    if (pt(h)) return m(h), (v = t.hass.entities[h]) === null || v === void 0 ? void 0 : v.device_id;
    const g = r().find((w) => w[1].name === h);
    return g == null ? void 0 : g[0];
  }, device_name(h) {
    var v, g, w, x, O;
    if (pt(h)) {
      m(h);
      const T = (v = t.hass.entities[h]) === null || v === void 0 ? void 0 : v.device_id;
      return (w = (g = t.hass.devices[T]) === null || g === void 0 ? void 0 : g.name) !== null && w !== void 0 ? w : void 0;
    }
    return (O = (x = t.hass.devices[h]) === null || x === void 0 ? void 0 : x.name) !== null && O !== void 0 ? O : void 0;
  }, areas: () => i().map(([, h]) => h.area_id), area_id(h) {
    var v, g;
    if (h in t.hass.devices) return this.device_attr(h, _n.AREA_ID);
    const w = (v = t.hass.entities[h]) === null || v === void 0 ? void 0 : v.device_id;
    if (w) return this.device_attr(w, _n.AREA_ID);
    const x = i().find(([, O]) => O.name === h);
    return (g = x == null ? void 0 : x[1]) === null || g === void 0 ? void 0 : g.area_id;
  }, area_name(h) {
    var v, g;
    let w;
    h in t.hass.devices && (w = this.device_attr(h, _n.AREA_ID));
    const x = (v = t.hass.entities[h]) === null || v === void 0 ? void 0 : v.device_id;
    x && (w = this.device_attr(x, _n.AREA_ID));
    const O = i().find(([, T]) => T.area_id === h || T.area_id === w);
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
    const w = ws(v);
    if (o.has(v)) return o.get(v);
    const x = new Proxy({ [jt]: g, [ys]() {
      return this[jt];
    } }, { get(O, T, D) {
      if (T === jt || T === ys) return b(w), Reflect.get(O, T, D);
      f(`${T} is not a valid ${Er} property. A ${Er} only exposes a "${jt}" property`);
    }, set(O, T, D) {
      if (T === jt) {
        const W = O[jt];
        return O[jt] = D, h({ event_type: bt.STATE_CHANGE_EVENT, data: { entity_id: w, old_state: { state: JSON.stringify(W) }, new_state: { state: JSON.stringify(D) } } }), !0;
      }
      return f(`property "${T}" cannot be set in a ${Er}`), !1;
    } });
    return o.set(v, x), x;
  }, unref(h, v) {
    const g = ws(v);
    o.has(v) ? (o.delete(v), h(g)) : f(`${v} is not a ref or it has been unrefed already`);
  }, refs(h, v, g = {}) {
    const w = this.ref, x = this.unref, O = new Proxy(g, { get: (T, D) => w(h, D).value, set: (T, D, W) => (w(h, D).value = W, !0) });
    return Object.entries(g).forEach((T) => {
      const [D, W] = T;
      o.has(D) && x(v, D), w(h, D, W);
    }), O;
  }, cleanRefs(h) {
    Array.from(o.keys()).forEach((v) => {
      this.unref(h, v);
    });
  }, clientSideProxy: new Proxy({}, { get(h, v) {
    switch (Object.values(De).includes(v) && b(v), v) {
      case De.PANEL_URL:
        return window.location.pathname;
      case De.LANG:
        return t.hass.language;
    }
    n && console.warn(`clientSideProxy should only be used to access these variables: ${Object.values(De).join(", ")}`);
  } }) };
}
let Ic = class {
  constructor(e, n) {
    const { throwErrors: i = !1, throwWarnings: r = !0, variables: s = {}, refs: a = {}, refsVariableName: o = Cc, autoReturn: l = !0 } = n;
    this._throwErrors = i, this._throwWarnings = r, this._variables = s, this._refsVariableName = o, this._autoReturn = l, this._subscriptions = /* @__PURE__ */ new Map(), this._clientSideEntitiesRegExp = new RegExp(`(^|[ \\?(+:\\{\\[><,])(${Object.values(De).join("|")})($|[ \\?)+:\\}\\]><.,])`, "gm"), this._scopped = Rc(e, i, r), this.refs = a, this._watchForPanelUrlChange(), this._watchForEntitiesChange(), this._watchForLanguageChange();
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
    this._subscriptions.has(De.PANEL_URL) && this._executeRenderingFunctions(De.PANEL_URL);
  }
  _watchForEntitiesChange() {
    window.hassConnection.then((e) => {
      e.conn.subscribeMessage((n) => this._entityWatchCallback(n), { type: bt.SUBSCRIBE_EVENTS, event_type: bt.STATE_CHANGE_EVENT });
    });
  }
  _watchForLanguageChange() {
    window.addEventListener(bt.TRANSLATIONS_UPDATED, () => {
      this._subscriptions.has(De.LANG) && this._executeRenderingFunctions(De.LANG);
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
}, Lc = class {
  constructor(e, n = {}) {
    this._renderer = or(() => e.hass, (i) => !!(i && i.areas && i.devices && i.entities && i.states && i.user), { retries: 100, delay: 50, rejectMessage: "The provided element doesn't contain a proper or initialised hass object" }).then(() => new Ic(e, n));
  }
  getRenderer() {
    return this._renderer;
  }
};
function kc(t = {}, e = {}) {
  return new Lc(
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
function Es(t, e, n, i = {}) {
  if (!$r(n))
    throw new Error("Not a valid JS template");
  return n = String(n).trim().slice(3, -3), t.then((r) => r.trackTemplate(n, e, { variables: i }));
}
function $s(t, e, n) {
  t.then((i) => {
    i.refs[e] = n;
  });
}
function Pc(t, e) {
  t.then((n) => {
    const i = e.detail;
    Object.keys(i).forEach((r) => {
      const s = i[r].property, a = i[r].value, o = `${r}_${s}`;
      n.refs[o] = a;
    });
  });
}
function Dc(t, e) {
  const n = Pc.bind(null, t);
  return document.addEventListener(e, n), () => {
    document.removeEventListener(e, n);
  };
}
var Rr = function() {
  return Rr = Object.assign || function(t) {
    for (var e, n = 1, i = arguments.length; n < i; n++) for (var r in e = arguments[n]) Object.prototype.hasOwnProperty.call(e, r) && (t[r] = e[r]);
    return t;
  }, Rr.apply(this, arguments);
};
function sn(t, e, n, i) {
  return new (n || (n = Promise))(function(r, s) {
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
      c.done ? r(c.value) : (d = c.value, d instanceof n ? d : new n(function(f) {
        f(d);
      })).then(a, o);
    }
    l((i = i.apply(t, [])).next());
  });
}
function an(t, e) {
  var n, i, r, s = { label: 0, sent: function() {
    if (1 & r[0]) throw r[1];
    return r[1];
  }, trys: [], ops: [] }, a = Object.create((typeof Iterator == "function" ? Iterator : Object).prototype);
  return a.next = o(0), a.throw = o(1), a.return = o(2), typeof Symbol == "function" && (a[Symbol.iterator] = function() {
    return this;
  }), a;
  function o(l) {
    return function(c) {
      return function(d) {
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
      }([l, c]);
    };
  }
}
var tn = "$", Xa = ":host", ji = "invalid selector", It = 10, Lt = 10, Fi = function(t) {
  var e, n = t[0], i = t[1];
  return (e = n) && (e instanceof Document || e instanceof Element || e instanceof ShadowRoot) && typeof i == "string";
};
function qi(t, e) {
  return function(n) {
    return n.split(",").map(function(i) {
      return i.trim();
    });
  }(t).map(function(n) {
    var i = function(r) {
      return r.split(tn).map(function(s) {
        return s.trim();
      });
    }(n);
    return e(i);
  });
}
function Qa(t, e) {
  var n = e ? " If you want to select a shadowRoot, use ".concat(e, " instead.") : "";
  return "".concat(t, " cannot be used with a selector ending in a shadowRoot (").concat(tn, ").").concat(n);
}
function un(t) {
  return t instanceof Promise ? t : Promise.resolve(t);
}
function Za() {
  return "You can not select a shadowRoot (".concat(tn, ") of the document.");
}
function eo() {
  return "You can not select a shadowRoot (".concat(tn, ") of a shadowRoot.");
}
function Gi(t, e) {
  for (var n, i, r = null, s = t.length, a = 0; a < s; a++) {
    if (a === 0) if (t[a].length) r = e.querySelector(t[a]);
    else {
      if (e instanceof Document) throw new SyntaxError(Za());
      if (e instanceof ShadowRoot) throw new SyntaxError(eo());
      r = ((n = e.shadowRoot) === null || n === void 0 ? void 0 : n.querySelector(t[++a])) || null;
    }
    else r = ((i = r.shadowRoot) === null || i === void 0 ? void 0 : i.querySelector("".concat(Xa, " ").concat(t[a]))) || null;
    if (r === null) return null;
  }
  return r;
}
function Mc(t, e) {
  var n, i = function(a, o, l) {
    for (var c, d = 0, f = o.length; d < f; d++) !c && d in o || (c || (c = Array.prototype.slice.call(o, 0, d)), c[d] = o[d]);
    return a.concat(c || Array.prototype.slice.call(o));
  }([], t), r = i.pop();
  if (!i.length) return e.querySelectorAll(r);
  var s = Gi(i, e);
  return ((n = s == null ? void 0 : s.shadowRoot) === null || n === void 0 ? void 0 : n.querySelectorAll("".concat(Xa, " ").concat(r))) || null;
}
function Hc(t, e) {
  if (t.length === 1 && !t[0].length) {
    if (e instanceof Document) throw new SyntaxError(Za());
    if (e instanceof ShadowRoot) throw new SyntaxError(eo());
    return e.shadowRoot;
  }
  var n = Gi(t, e);
  return (n == null ? void 0 : n.shadowRoot) || null;
}
function jc(t, e, n, i) {
  for (var r = qi(t, function(l) {
    if (!l[l.length - 1].length) throw new SyntaxError(Qa(n, i));
    return l;
  }), s = r.length, a = 0; a < s; a++) {
    var o = Gi(r[a], e);
    if (o) return o;
  }
  return null;
}
function Fc(t, e, n) {
  for (var i = qi(t, function(o) {
    if (!o[o.length - 1].length) throw new SyntaxError(Qa(n));
    return o;
  }), r = i.length, s = 0; s < r; s++) {
    var a = Mc(i[s], e);
    if (a != null && a.length) return a;
  }
  return document.querySelectorAll(ji);
}
function qc(t, e, n, i) {
  for (var r = qi(t, function(l) {
    if (l.pop().length) throw new SyntaxError(function(c, d) {
      return "".concat(c, " must be used with a selector ending in a shadowRoot (").concat(tn, "). If you don't want to select a shadowRoot, use ").concat(d, " instead.");
    }(n, i));
    return l;
  }), s = r.length, a = 0; a < s; a++) {
    var o = Hc(r[a], e);
    if (o) return o;
  }
  return null;
}
function As(t, e, n, i) {
  return sn(this, void 0, void 0, function() {
    return an(this, function(r) {
      return [2, or(function() {
        return jc(t, e, "asyncQuerySelector", "asyncShadowRootQuerySelector");
      }, function(s) {
        return !!s;
      }, { retries: n, delay: i, shouldReject: !1 })];
    });
  });
}
function Os(t, e, n, i) {
  return sn(this, void 0, void 0, function() {
    return an(this, function(r) {
      return [2, or(function() {
        return Fc(t, e, "asyncQuerySelectorAll");
      }, function(s) {
        return !!s.length;
      }, { retries: n, delay: i, shouldReject: !1 })];
    });
  });
}
function Ss(t, e, n, i) {
  return sn(this, void 0, void 0, function() {
    return an(this, function(r) {
      return [2, or(function() {
        return qc(t, e, "asyncShadowRootQuerySelector", "asyncQuerySelector");
      }, function(s) {
        return !!s;
      }, { retries: n, delay: i, shouldReject: !1 })];
    });
  });
}
var wi = function(t, e) {
  var n = t.querySelectorAll(e);
  if (n.length) return n;
  if (t instanceof Element && t.shadowRoot) {
    var i = wi(t.shadowRoot, e);
    if (i.length) return i;
  }
  for (var r = 0, s = Array.from(t.querySelectorAll("*")); r < s.length; r++) {
    var a = s[r], o = wi(a, e);
    if (o.length) return o;
  }
  return document.querySelectorAll(ji);
}, xs = function(t, e, n, i) {
  return or(function() {
    return wi(t, e);
  }, function(r) {
    return !!r.length;
  }, { retries: n, delay: i, shouldReject: !1 });
};
function Ts() {
  for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
  return sn(this, void 0, void 0, function() {
    var n, i, r, s, a;
    return an(this, function(o) {
      switch (o.label) {
        case 0:
          return Fi(t) ? (n = t[0], i = t[1], r = t[2], [4, As(i, n, (r == null ? void 0 : r.retries) || It, (r == null ? void 0 : r.delay) || Lt)]) : [3, 2];
        case 1:
        case 3:
          return [2, o.sent()];
        case 2:
          return s = t[0], a = t[1], [4, As(s, document, (a == null ? void 0 : a.retries) || It, (a == null ? void 0 : a.delay) || Lt)];
      }
    });
  });
}
function Ns() {
  for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
  return sn(this, void 0, void 0, function() {
    var n, i, r, s, a;
    return an(this, function(o) {
      switch (o.label) {
        case 0:
          return Fi(t) ? (n = t[0], i = t[1], r = t[2], [4, Os(i, n, (r == null ? void 0 : r.retries) || It, (r == null ? void 0 : r.delay) || Lt)]) : [3, 2];
        case 1:
          return [2, o.sent()];
        case 2:
          return s = t[0], a = t[1], [2, Os(s, document, (a == null ? void 0 : a.retries) || It, (a == null ? void 0 : a.delay) || Lt)];
      }
    });
  });
}
function Cs() {
  for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
  return sn(this, void 0, void 0, function() {
    var n, i, r, s, a;
    return an(this, function(o) {
      switch (o.label) {
        case 0:
          return Fi(t) ? (n = t[0], i = t[1], r = t[2], [4, Ss(i, n, (r == null ? void 0 : r.retries) || It, (r == null ? void 0 : r.delay) || Lt)]) : [3, 2];
        case 1:
          return [2, o.sent()];
        case 2:
          return s = t[0], a = t[1], [2, Ss(s, document, (a == null ? void 0 : a.retries) || It, (a == null ? void 0 : a.delay) || Lt)];
      }
    });
  });
}
var Gc = function() {
  function t(e, n) {
    e instanceof Node || e instanceof Promise ? (this._element = e, this._asyncParams = Rr({ retries: It, delay: Lt }, n || {})) : (this._element = document, this._asyncParams = Rr({ retries: It, delay: Lt }, e || {}));
  }
  return Object.defineProperty(t.prototype, "element", { get: function() {
    return un(this._element).then(function(e) {
      return e instanceof NodeList ? e[0] || null : e;
    });
  }, enumerable: !1, configurable: !0 }), Object.defineProperty(t.prototype, "$", { get: function() {
    var e = this;
    return new t(un(this._element).then(function(n) {
      return n instanceof Document || n instanceof ShadowRoot || n === null || n instanceof NodeList && n.length === 0 ? null : n instanceof NodeList ? Cs(n[0], tn, e._asyncParams) : Cs(n, tn, e._asyncParams);
    }), this._asyncParams);
  }, enumerable: !1, configurable: !0 }), Object.defineProperty(t.prototype, "all", { get: function() {
    return un(this._element).then(function(e) {
      return e instanceof NodeList ? e : document.querySelectorAll(ji);
    });
  }, enumerable: !1, configurable: !0 }), Object.defineProperty(t.prototype, "asyncParams", { get: function() {
    return this._asyncParams;
  }, enumerable: !1, configurable: !0 }), t.prototype.eq = function(e) {
    return sn(this, void 0, void 0, function() {
      return an(this, function(n) {
        return [2, un(this._element).then(function(i) {
          return i instanceof NodeList && i[e] || null;
        })];
      });
    });
  }, t.prototype.query = function(e) {
    var n = this;
    return new t(un(this._element).then(function(i) {
      return i === null || i instanceof NodeList && i.length === 0 ? null : i instanceof NodeList ? Ns(i[0], e, n._asyncParams) : Ns(i, e, n._asyncParams);
    }), this._asyncParams);
  }, t.prototype.deepQuery = function(e) {
    var n = this;
    return new t(un(this._element).then(function(i) {
      return i === null || i instanceof NodeList && i.length === 0 ? null : i instanceof NodeList ? Promise.race(Array.from(i).map(function(r) {
        return xs(r, e, n._asyncParams.retries, n._asyncParams.delay);
      })) : xs(i, e, n._asyncParams.retries, n._asyncParams.delay);
    }), this._asyncParams);
  }, t;
}();
const xt = "$", Uc = { retries: 100, delay: 50, eventThreshold: 450 };
var Me, At, B, et, F;
(function(t) {
  t.HOME_ASSISTANT = "HOME_ASSISTANT", t.HOME_ASSISTANT_MAIN = "HOME_ASSISTANT_MAIN", t.HA_DRAWER = "HA_DRAWER", t.HA_SIDEBAR = "HA_SIDEBAR", t.PARTIAL_PANEL_RESOLVER = "PARTIAL_PANEL_RESOLVER";
})(Me || (Me = {})), function(t) {
  t.HA_PANEL_LOVELACE = "HA_PANEL_LOVELACE", t.HUI_ROOT = "HUI_ROOT", t.HEADER = "HEADER", t.HUI_VIEW = "HUI_VIEW";
}(At || (At = {})), function(t) {
  t.HA_MORE_INFO_DIALOG = "HA_MORE_INFO_DIALOG", t.HA_DIALOG = "HA_DIALOG", t.HA_DIALOG_CONTENT = "HA_DIALOG_CONTENT", t.HA_MORE_INFO_DIALOG_INFO = "HA_MORE_INFO_DIALOG_INFO", t.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK = "HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK", t.HA_DIALOG_MORE_INFO_SETTINGS = "HA_DIALOG_MORE_INFO_SETTINGS";
}(B || (B = {})), function(t) {
  t.ON_LISTEN = "onListen", t.ON_PANEL_LOAD = "onPanelLoad", t.ON_LOVELACE_PANEL_LOAD = "onLovelacePanelLoad", t.ON_MORE_INFO_DIALOG_OPEN = "onMoreInfoDialogOpen", t.ON_HISTORY_AND_LOGBOOK_DIALOG_OPEN = "onHistoryAndLogBookDialogOpen", t.ON_SETTINGS_DIALOG_OPEN = "onSettingsDialogOpen";
}(et || (et = {})), function(t) {
  t.HOME_ASSISTANT = "home-assistant", t.HOME_ASSISTANT_MAIN = "home-assistant-main", t.HA_DRAWER = "ha-drawer", t.HA_SIDEBAR = "ha-sidebar", t.PARTIAL_PANEL_RESOLVER = "partial-panel-resolver", t.HA_PANEL_LOVELACE = "ha-panel-lovelace", t.HUI_ROOT = "hui-root", t.HEADER = ".header", t.HUI_VIEW = "hui-view", t.HA_MORE_INFO_DIALOG = "ha-more-info-dialog", t.HA_DIALOG = "ha-adaptive-dialog, ha-dialog", t.HA_DIALOG_CONTENT = ".content", t.HA_MORE_INFO_DIALOG_INFO = "ha-more-info-info", t.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK = "ha-more-info-history-and-logbook", t.HA_DIALOG_MORE_INFO_SETTINGS = "ha-more-info-settings";
}(F || (F = {}));
const zc = { [Me.HOME_ASSISTANT]: { selector: F.HOME_ASSISTANT, children: { shadowRoot: { selector: xt, children: { [Me.HOME_ASSISTANT_MAIN]: { selector: F.HOME_ASSISTANT_MAIN, children: { shadowRoot: { selector: xt, children: { [Me.HA_DRAWER]: { selector: F.HA_DRAWER, children: { [Me.HA_SIDEBAR]: { selector: F.HA_SIDEBAR, children: { shadowRoot: { selector: xt } } }, [Me.PARTIAL_PANEL_RESOLVER]: { selector: F.PARTIAL_PANEL_RESOLVER } } } } } } } } } } } }, Bc = { [At.HA_PANEL_LOVELACE]: { selector: F.HA_PANEL_LOVELACE, children: { shadowRoot: { selector: xt, children: { [At.HUI_ROOT]: { selector: F.HUI_ROOT, children: { shadowRoot: { selector: xt, children: { [At.HEADER]: { selector: F.HEADER }, [At.HUI_VIEW]: { selector: F.HUI_VIEW } } } } } } } } } }, Vc = { shadowRoot: { selector: xt, children: { [B.HA_MORE_INFO_DIALOG]: { selector: F.HA_MORE_INFO_DIALOG, children: { shadowRoot: { selector: xt, children: { [B.HA_DIALOG]: { selector: F.HA_DIALOG, children: { [B.HA_DIALOG_CONTENT]: { selector: F.HA_DIALOG_CONTENT, children: { [B.HA_MORE_INFO_DIALOG_INFO]: { selector: F.HA_MORE_INFO_DIALOG_INFO }, [B.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK]: { selector: F.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK }, [B.HA_DIALOG_MORE_INFO_SETTINGS]: { selector: F.HA_DIALOG_MORE_INFO_SETTINGS } } } } } } } } } } } };
const zn = (t, e, n, i = !1) => Object.entries(e || {}).reduce((r, s) => {
  const [a, o] = s;
  if (o.selector === xt && n) return o.children ? Object.assign(Object.assign({}, r), zn(t, o.children, n, !0)) : r;
  const l = n ? n.then((c) => {
    return c ? Ts(c, (d = o.selector, i ? "$ " + d : d), t) : null;
    var d;
  }) : Ts(o.selector, t);
  return r[a] = { element: l, children: zn(t, o.children, l), selector: new Gc(l, t) }, r;
}, {}), to = (t, e) => {
  const n = Object.entries(e);
  for (const i of n) {
    if (i[0] === t) return i[1];
    {
      const r = to(t, i[1].children);
      if (r) return r;
    }
  }
}, ei = (t, e) => Object.keys(t).reduce((n, i) => {
  const r = to(i, e);
  if (r) {
    const { children: s } = r, a = function(o, l) {
      var c = {};
      for (var d in o) Object.prototype.hasOwnProperty.call(o, d) && l.indexOf(d) < 0 && (c[d] = o[d]);
      if (o != null && typeof Object.getOwnPropertySymbols == "function") {
        var f = 0;
        for (d = Object.getOwnPropertySymbols(o); f < d.length; f++) l.indexOf(d[f]) < 0 && Object.prototype.propertyIsEnumerable.call(o, d[f]) && (c[d[f]] = o[d[f]]);
      }
      return c;
    }(r, ["children"]);
    n[i] = Object.assign({}, a);
  }
  return n;
}, {});
let Wc = class {
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
}, Yc = class extends Wc {
  constructor(e = {}) {
    super(), this._config = Object.assign(Object.assign({}, Uc), e), this._timestaps = {};
  }
  _dispatchEvent(e, n) {
    const i = Date.now();
    this._timestaps[e] && i - this._timestaps[e] < this._config.eventThreshold || (this._timestaps[e] = i, this.dispatchEvent(new CustomEvent(e, { detail: n })));
  }
  _updateDialogElements(e = B.HA_MORE_INFO_DIALOG_INFO) {
    this._dialogTree = zn(this._config, Vc, this._haRootElements.HOME_ASSISTANT.element);
    const n = ei(B, this._dialogTree);
    n.HA_DIALOG_CONTENT.element.then((r) => {
      this._dialogsContentObserver.disconnect(), this._dialogsContentObserver.observe(r, { childList: !0 });
    }), this._haDialogElements = ((r, s) => [B.HA_MORE_INFO_DIALOG, B.HA_DIALOG, B.HA_DIALOG_CONTENT, s].reduce((a, o) => (a[o] = r[o], a), {}))(n, e);
    const i = { [B.HA_MORE_INFO_DIALOG_INFO]: et.ON_MORE_INFO_DIALOG_OPEN, [B.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK]: et.ON_HISTORY_AND_LOGBOOK_DIALOG_OPEN, [B.HA_DIALOG_MORE_INFO_SETTINGS]: et.ON_SETTINGS_DIALOG_OPEN };
    this._dispatchEvent(i[e], this._haDialogElements);
  }
  _updateRootElements() {
    this._homeAssistantRootTree = zn(this._config, zc), this._haRootElements = ei(Me, this._homeAssistantRootTree), this._haRootElements[Me.HOME_ASSISTANT].selector.$.element.then((e) => {
      this._dialogsObserver.disconnect(), this._dialogsObserver.observe(e, { childList: !0 });
    }), this._haRootElements[Me.PARTIAL_PANEL_RESOLVER].element.then((e) => {
      this._panelResolverObserver.disconnect(), e && this._panelResolverObserver.observe(e, { subtree: !0, childList: !0 });
    }), this._dispatchEvent(et.ON_LISTEN, this._haRootElements), this._dispatchEvent(et.ON_PANEL_LOAD, this._haRootElements);
  }
  _updateLovelaceElements() {
    this._homeAssistantResolverTree = zn(this._config, Bc, this._haRootElements[Me.HA_DRAWER].element), this._haResolverElements = ei(At, this._homeAssistantResolverTree), this._haResolverElements[At.HA_PANEL_LOVELACE].element.then((e) => {
      this._lovelaceObserver.disconnect(), e && (this._lovelaceObserver.observe(e.shadowRoot, { childList: !0 }), this._dispatchEvent(et.ON_LOVELACE_PANEL_LOAD, Object.assign(Object.assign({}, this._haRootElements), this._haResolverElements)));
    });
  }
  _watchDialogs(e) {
    e.forEach(({ addedNodes: n }) => {
      n.forEach((i) => {
        i instanceof Element && i.localName === F.HA_MORE_INFO_DIALOG && this._updateDialogElements();
      });
    });
  }
  _watchDialogsContent(e) {
    e.forEach(({ addedNodes: n }) => {
      n.forEach((i) => {
        const r = { [F.HA_MORE_INFO_DIALOG_INFO]: B.HA_MORE_INFO_DIALOG_INFO, [F.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK]: B.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK, [F.HA_DIALOG_MORE_INFO_SETTINGS]: B.HA_DIALOG_MORE_INFO_SETTINGS };
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
        this._dispatchEvent(et.ON_PANEL_LOAD, this._haRootElements), i instanceof Element && i.localName === F.HA_PANEL_LOVELACE && this._updateLovelaceElements();
      });
    });
  }
  _watchLovelace(e) {
    e.forEach(({ addedNodes: n }) => {
      n.forEach((i) => {
        i instanceof Element && i.localName === F.HUI_ROOT && this._updateLovelaceElements();
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
const no = new Yc();
let Ar = {};
no.addEventListener("onLovelacePanelLoad", ({ detail: t }) => {
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
no.listen();
const Jc = () => Ar, Rs = (t) => t ? typeof t == "string" ? t : Object.entries(t).map(([e, n]) => {
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
`) : null, Ei = {
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
var Kc = /* @__PURE__ */ dt("<ha-ripple></ha-ripple>", 2), Xc = /* @__PURE__ */ dt('<button aria-label="Toggle button"><ha-icon></ha-icon> <!></button>', 2), Qc = /* @__PURE__ */ dt("<ha-ripple></ha-ripple>", 2), Zc = /* @__PURE__ */ dt('<div id="id1"><div id="id2"><!></div> <!> <!></div>'), ed = /* @__PURE__ */ dt("<button><div> </div> <ha-icon></ha-icon> <ha-ripple></ha-ripple></button>", 2), td = /* @__PURE__ */ dt("<div><div></div></div>"), nd = /* @__PURE__ */ dt("<ha-card><!> <!> <!></ha-card>", 2);
const rd = {
  hash: "svelte-1jqiztq",
  code: `.expander-card.svelte-1jqiztq {display:var(--expander-card-display,block);gap:var(--gap);padding:var(--padding);background:var(--card-background,#fff);-webkit-tap-highlight-color:transparent;}.expander-card.animation.svelte-1jqiztq {transition:gap 0.35s ease, background-color var(--background-animation-duration, 0) ease;}.children-wrapper.svelte-1jqiztq {display:flex;flex-direction:column;}.children-wrapper.animation.opening.svelte-1jqiztq,
    .children-wrapper.animation.closing.svelte-1jqiztq {overflow:hidden;}.children-container.animation.svelte-1jqiztq {transition:padding 0.35s ease, gap 0.35s ease;}.children-container.svelte-1jqiztq {padding:var(--child-padding);display:var(--expander-card-display,block);gap:var(--gap);}.clear.svelte-1jqiztq {background:none !important;background-color:transparent !important;border-style:none !important;box-shadow:none !important;}.title-card-header.svelte-1jqiztq {display:flex;align-items:center;justify-content:space-between;flex-direction:row;position:relative;}.title-card-header.clickable.svelte-1jqiztq {cursor:pointer;border-style:none;border-radius:var(--ha-card-border-radius, var(--ha-border-radius-lg));}.title-card-header-overlay.svelte-1jqiztq {display:block;}.title-card-container.svelte-1jqiztq {width:100%;padding:var(--title-padding);}.header.svelte-1jqiztq {display:flex;flex-direction:row;align-items:center;padding:0.85em 0.85em;background:var(--button-background);border-style:none;border-radius:var(--ha-card-border-radius, var(--ha-border-radius-lg));width:var(--header-width,auto);color:var(--header-color,#fff);cursor:pointer;position:relative;font-family:var(--ha-font-family-body);font-size:var(--ha-font-size-m);}.header-overlay.svelte-1jqiztq {position:absolute;top:0;right:0;margin:var(--overlay-margin);height:var(--expander-card-overlay-height, auto);z-index:1;}.title-card-header-overlay.clickable.svelte-1jqiztq  > .header-overlay:where(.svelte-1jqiztq) {width:calc(100% - var(--overlay-margin) * 2);justify-content:flex-end;}.title-card-header-overlay.clickable.svelte-1jqiztq > .title-card-container:where(.svelte-1jqiztq) {width:calc(100% - var(--overlay-margin) * 2);}.title.svelte-1jqiztq {width:100%;text-align:left;}.ico.animation.svelte-1jqiztq {transition-property:transform;transition-duration:0.35s;}.ico.svelte-1jqiztq {color:var(--arrow-color,var(--primary-text-color,#fff));}.flipped.svelte-1jqiztq {transform:rotate(var(--icon-rotate-degree,180deg));}`
};
function id(t, e) {
  Oi(e, !0), Ba(t, rd);
  const n = Ie(e, "hass"), i = Ie(e, "preview"), r = Ie(e, "config", 7, Ei);
  let s = /* @__PURE__ */ H(!1), a = /* @__PURE__ */ H(null), o = /* @__PURE__ */ H(Ye(!!Pe(() => i()))), l = /* @__PURE__ */ H(Ye(!!Pe(() => i()))), c = /* @__PURE__ */ H(Ye(Pe(() => i() || (Vr(r()["show-button-users"]) ?? !0)))), d = /* @__PURE__ */ H("idle"), f = /* @__PURE__ */ H(null), m = /* @__PURE__ */ H(0), b = /* @__PURE__ */ H(0), _ = /* @__PURE__ */ H(null), $ = /* @__PURE__ */ H(null), h = /* @__PURE__ */ H(null), v = /* @__PURE__ */ H(null);
  const g = {}, w = {}, x = {}, O = /* @__PURE__ */ H(Ye({}));
  let T = /* @__PURE__ */ H(Ye(Jc()));
  const D = /* @__PURE__ */ Mn(() => {
    const y = p(O).style, E = r().style;
    let A = null;
    return y !== void 0 ? A = typeof y == "string" ? y : typeof y == "object" && y !== null ? Rs(y) : String(y) : E && (A = Rs(E)), A ? `<style>${A}</style>` : null;
  }), W = /* @__PURE__ */ Mn(() => p(O).icon !== void 0 ? String(p(O).icon) : r().icon), ge = /* @__PURE__ */ Mn(() => p(O).title !== void 0 ? String(p(O).title) : r().title), Pt = /* @__PURE__ */ Mn(() => p(O)["arrow-color"] !== void 0 ? String(p(O)["arrow-color"]) : r()["arrow-color"]), ce = Pe(() => r()["storage-id"]), dr = "expander-open-" + ce;
  mn(() => {
    if (p(O).expanded === void 0 || Pe(() => i() && p(T)["preview-expanded"] !== !1))
      return;
    const y = !!p(O).expanded;
    queueMicrotask(() => {
      y !== p(o) && Dt(y);
    });
  }), mn(() => {
    if (!(i() === p(l) || i() === void 0)) {
      if (S(l, i(), !0), p(l) && p(T)["preview-expanded"] !== !1) {
        Ln(!0), S(c, !0);
        return;
      }
      if (S(c, Vr(r()["show-button-users"]) ?? !0, !0), on("expanded")) {
        const y = Pe(() => p(O).expanded);
        y !== void 0 && Dt(!!y);
        return;
      }
      Yi();
    }
  });
  function on(y) {
    const E = r().templates && Array.isArray(r().templates) ? r().templates.find((A) => A.template === y) : void 0;
    if (E && $r(E.value_template))
      return E;
  }
  function Br(y) {
    if (!r()["expander-card-id"])
      return;
    const E = {};
    E[r()["expander-card-id"]] = { property: "open", value: y }, document.dispatchEvent(new CustomEvent("expander-card", { detail: E, bubbles: !0, composed: !0 }));
  }
  function Vr(y) {
    var E, A, J, Te;
    if (y !== void 0)
      return ((A = (E = n()) == null ? void 0 : E.user) == null ? void 0 : A.name) !== void 0 && y.includes((Te = (J = n()) == null ? void 0 : J.user) == null ? void 0 : Te.name);
  }
  function Yi() {
    if (!on("expanded")) {
      if (Vr(r()["start-expanded-users"])) {
        ut(!0);
        return;
      }
      if (ce === void 0) {
        Ji();
        return;
      }
      try {
        const y = localStorage.getItem(dr);
        if (y === null) {
          Ji();
          return;
        }
        const E = y ? y === "true" : p(o);
        ut(E);
      } catch (y) {
        console.error(y), ut(!1);
      }
    }
  }
  function Ji() {
    if (r().expanded !== void 0) {
      ut(r().expanded);
      return;
    }
    ut(!1);
  }
  function Dt(y) {
    p(f) && (clearTimeout(p(f)), S(f, null));
    const E = y !== void 0 ? y : !p(o);
    if (!r().animation) {
      ut(E);
      return;
    }
    if (Br(E), S(d, E ? "opening" : "closing", !0), E) {
      Ln(!0), S(
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
          Ln(!1), S(d, "idle"), S(f, null);
        },
        350
      ),
      !0
    );
  }
  function ut(y) {
    Ln(y), Br(y);
  }
  function Ln(y) {
    if (S(o, y, !0), !i() && ce !== void 0)
      try {
        localStorage.setItem(dr, p(o) ? "true" : "false");
      } catch (E) {
        console.error(E);
      }
    p(o) && p(m) === 0 && S(m, 0.35);
  }
  function Ki(y) {
    var A;
    const E = (A = y.detail) == null ? void 0 : A.rawConfig;
    E && JSON.stringify(E) !== JSON.stringify(p(T)) && S(T, E, !0);
  }
  function Xi(y) {
    var A, J;
    const E = (J = (A = y.detail) == null ? void 0 : A["expander-card"]) == null ? void 0 : J.data;
    if (E != null && E["expander-card-id"] && E["expander-card-id"] === r()["expander-card-id"]) {
      if (E.action === "open" && !p(o)) {
        Dt(!0);
        return;
      }
      if (E.action === "close" && p(o)) {
        Dt(!1);
        return;
      }
      E.action === "toggle" && Dt();
    }
  }
  function co() {
    document.body.removeEventListener("ll-custom", Xi), document.body.removeEventListener("expander-card-raw-config-updated", Ki), Object.entries(x).forEach(([y, E]) => {
      E.then((A) => {
        A(), delete x[y];
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
  const Qi = (y) => {
    r().haptic && r().haptic !== "none" && Tc(y, r().haptic);
  };
  let kn, Pn = !1, Zi = 0, es = 0;
  const uo = (y) => {
    p(v) && (p(v).disabled = !0), kn = y.target, Zi = y.touches[0].clientX, es = y.touches[0].clientY, Pn = !1;
  }, ho = (y) => {
    const E = y.touches[0].clientX, A = y.touches[0].clientY;
    Pn = Math.abs(E - Zi) > 10 || Math.abs(A - es) > 10;
  }, fo = () => {
    p(v) && (p(v).disabled = !1), kn = void 0, Pn = !1;
  }, po = () => {
    p(v) && (p(v).disabled = !1);
  }, _o = (y) => {
    !Pn && kn === y.target && r()["title-card-clickable"] && (Qi(kn), Dt(), S(s, !0), S(
      a,
      window.setTimeout(
        () => {
          S(s, !1), S(a, null);
        },
        100
      ),
      !0
    ), p(v) && (p(v).startPressAnimation(), p(v).endPressAnimation())), kn = void 0, Pn = !1;
  }, vo = (y) => {
    for (const E of Object.values(r().variables ?? {}))
      $r(E.value_template) ? w[E.variable] = Es(
        y,
        (A) => {
          $s(y, E.variable, A);
        },
        E.value_template,
        { config: r() }
      ) : $s(y, E.variable, E.value_template);
  }, go = (y) => {
    g["expander-card"] = Dc(y, "expander-card");
  }, mo = () => {
    if (!r().templates) return;
    const y = Object.values(r().variables || {}).reduce(
      (A, J) => (A[J.variable] = void 0, A),
      {}
    ), E = kc({ config: r(), expanderCard: {} }, y);
    vo(E), go(E), Object.values(r().templates || {}).forEach((A) => {
      $r(A.value_template) ? x[A.template] = Es(
        E,
        (J) => {
          p(O)[A.template] = J;
        },
        A.value_template,
        { config: r() }
      ) : p(O)[A.template] = A.value_template;
    });
  };
  function bo() {
    if (on("expanded"))
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
  function yo() {
    if (i() && p(T)["preview-expanded"] !== !1) {
      Ln(!0);
      return;
    }
    if (on("expanded")) {
      const y = Pe(() => p(O).expanded);
      ut(y !== void 0 ? !!y : !1);
    } else
      Yi();
  }
  function wo() {
    if (r()["title-card-clickable"] && !r()["title-card-button-overlay"] && p($))
      return p($);
    if (p(h))
      return p(h);
  }
  za(() => {
    mo(), Br(!1), bo(), yo(), document.body.addEventListener("ll-custom", Xi), document.body.addEventListener("expander-card-raw-config-updated", Ki);
    const y = wo();
    return y && (y.addEventListener("touchstart", uo, { passive: !0, capture: !0 }), y.addEventListener("touchmove", ho, { passive: !0, capture: !0 }), y.addEventListener("touchcancel", fo, { passive: !0, capture: !0 }), y.addEventListener("touchend", po, { passive: !0, capture: !0 }), y.addEventListener("touchend", _o, { passive: !1, capture: !1 })), r()["title-card-clickable"] && r()["title-card-button-overlay"] && p($) && new ResizeObserver(() => {
      if (p(h) && p($) && p(_)) {
        const A = p($).getBoundingClientRect();
        S(b, A.height - parseFloat(getComputedStyle(p(h)).marginTop) - parseFloat(getComputedStyle(p(h)).marginBottom) + parseFloat(getComputedStyle(p(_)).paddingTop) + parseFloat(getComputedStyle(p(_)).paddingBottom));
      }
    }).observe(p($)), co;
  });
  const Wr = (y) => {
    if (!p(s)) {
      Qi(y.currentTarget), Dt();
      return;
    }
    return y.preventDefault(), y.stopImmediatePropagation(), S(s, !1), p(a) && (clearTimeout(p(a)), S(a, null)), !1;
  };
  var Eo = {
    get hass() {
      return n();
    },
    set hass(y) {
      n(y), we();
    },
    get preview() {
      return i();
    },
    set preview(y) {
      i(y), we();
    },
    get config() {
      return r();
    },
    set config(y = Ei) {
      r(y), we();
    }
  }, ln = nd(), ts = _t(ln);
  {
    var $o = (y) => {
      var E = Zc(), A = _t(E), J = _t(A);
      yi(J, {
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
      }), Qe(A);
      var Te = Ht(A, 2);
      {
        var Ne = (ee) => {
          var ne = Xc(), Ge = _t(ne);
          Ze(() => gs(Ge, "icon", p(W)));
          var To = Ht(Ge, 2);
          {
            var No = (Mt) => {
              var Dn = Kc();
              mt(Dn, (Co) => S(v, Co), () => p(v)), be(Mt, Dn);
            };
            vt(To, (Mt) => {
              (!r()["title-card-clickable"] || r()["title-card-button-overlay"]) && Mt(No);
            });
          }
          Qe(ne), mt(ne, (Mt) => S(h, Mt), () => p(h)), Ze(() => {
            gt(ne, `--overlay-margin:${r()["overlay-margin"] ?? ""}; --button-background:${r()["button-background"] ?? ""}; --header-color:${r()["header-color"] ?? ""};`), Ce(ne, 1, `header ${r()["title-card-button-overlay"] ? " header-overlay" : ""}${p(o) ? " open" : " close"}${r().animation ? " animation " + p(d) : ""}`, "svelte-1jqiztq"), gt(Ge, `--arrow-color:${p(Pt) ?? ""}`), Ce(Ge, 1, `ico${p(o) && p(d) !== "closing" ? " flipped open" : " close"}${r().animation ? " animation " + p(d) : ""}`, "svelte-1jqiztq");
          }), Xr("click", ne, function(...Mt) {
            var Dn;
            (Dn = !r()["title-card-clickable"] || r()["title-card-button-overlay"] ? Wr : null) == null || Dn.apply(this, Mt);
          }), be(ee, ne);
        };
        vt(Te, (ee) => {
          p(c) && ee(Ne);
        });
      }
      var cn = Ht(Te, 2);
      {
        var Yr = (ee) => {
          var ne = Qc();
          mt(ne, (Ge) => S(v, Ge), () => p(v)), be(ee, ne);
        };
        vt(cn, (ee) => {
          r()["title-card-clickable"] && !r()["title-card-button-overlay"] && ee(Yr);
        });
      }
      Qe(E), mt(E, (ee) => S($, ee), () => p($)), Ze(() => {
        Ce(E, 1, `title-card-header${r()["title-card-button-overlay"] ? "-overlay" : ""}${p(o) ? " open" : " close"}${r().animation ? " animation " + p(d) : ""}${r()["title-card-clickable"] ? " clickable" : ""}`, "svelte-1jqiztq"), Va(E, "role", r()["title-card-clickable"] && !r()["title-card-button-overlay"] ? "button" : void 0), Ce(A, 1, `title-card-container${p(o) ? " open" : " close"}${r().animation ? " animation " + p(d) : ""}`, "svelte-1jqiztq"), gt(A, `--title-padding:${(r()["title-card-padding"] ? r()["title-card-padding"] : "0px") ?? ""};`);
      }), Xr("click", E, function(...ee) {
        var ne;
        (ne = r()["title-card-clickable"] && !r()["title-card-button-overlay"] ? Wr : null) == null || ne.apply(this, ee);
      }), be(y, E);
    }, Ao = (y) => {
      var E = _s(), A = ds(E);
      {
        var J = (Te) => {
          var Ne = ed(), cn = _t(Ne), Yr = _t(cn, !0);
          Qe(cn);
          var ee = Ht(cn, 2);
          Ze(() => gs(ee, "icon", p(W)));
          var ne = Ht(ee, 2);
          mt(ne, (Ge) => S(v, Ge), () => p(v)), Qe(Ne), mt(Ne, (Ge) => S(h, Ge), () => p(h)), Ze(() => {
            Ce(Ne, 1, `header${p(o) ? " open" : " close"}${r().animation ? " animation " + p(d) : ""}`, "svelte-1jqiztq"), gt(Ne, `--header-width:100%; --button-background:${r()["button-background"] ?? ""};--header-color:${r()["header-color"] ?? ""};`), Ce(cn, 1, `primary title${p(o) ? " open" : " close"}`, "svelte-1jqiztq"), ac(Yr, p(ge)), gt(ee, `--arrow-color:${p(Pt) ?? ""}`), Ce(ee, 1, `ico${p(o) && p(d) !== "closing" ? " flipped open" : " close"}${r().animation ? " animation " + p(d) : ""}`, "svelte-1jqiztq");
          }), Xr("click", Ne, Wr), be(Te, Ne);
        };
        vt(A, (Te) => {
          p(c) && Te(J);
        });
      }
      be(y, E);
    };
    vt(ts, (y) => {
      r()["title-card"] ? y($o) : y(Ao, -1);
    });
  }
  var ns = Ht(ts, 2);
  {
    var Oo = (y) => {
      var E = td(), A = _t(E);
      uc(A, 20, () => r().cards, (J) => J, (J, Te) => {
        {
          let Ne = /* @__PURE__ */ Mn(() => p(o) && i());
          yi(J, {
            get hass() {
              return n();
            },
            get preview() {
              return p(Ne);
            },
            get config() {
              return Te;
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
      }), Qe(A), Qe(E), Ze(() => {
        Ce(E, 1, `children-wrapper ${r().animation ? "animation " + p(d) : ""}${p(o) ? " open" : " close"}`, "svelte-1jqiztq"), gt(A, `--expander-card-display:${r()["expander-card-display"] ?? ""};
                --gap:${(p(o) && p(d) !== "closing" ? r()["expanded-gap"] : r().gap) ?? ""};
                --child-padding:${(p(o) && p(d) !== "closing" ? r()["child-padding"] : "0px") ?? ""};`), Ce(A, 1, `children-container${p(o) ? " open" : " close"}${r().animation ? " animation " + p(d) : ""}`, "svelte-1jqiztq");
      }), be(y, E);
    };
    vt(ns, (y) => {
      r().cards && y(Oo);
    });
  }
  var So = Ht(ns, 2);
  {
    var xo = (y) => {
      var E = _s(), A = ds(E);
      pc(A, () => p(D)), be(y, E);
    };
    vt(So, (y) => {
      p(D) && y(xo);
    });
  }
  return Qe(ln), mt(ln, (y) => S(_, y), () => p(_)), Ze(() => {
    Ce(ln, 1, `expander-card${r().clear ? " clear" : ""}${p(o) ? " open" : " close"} ${p(d)}${r().animation ? " animation " + p(d) : ""}`, "svelte-1jqiztq"), gt(ln, `--expander-card-display:${r()["expander-card-display"] ?? ""};
     --gap:${(p(o) && p(d) !== "closing" ? r()["expanded-gap"] : r().gap) ?? ""}; --padding:${r().padding ?? ""};
     --expander-state:${p(o) ?? ""};
     --icon-rotate-degree:${r()["icon-rotate-degree"] ?? ""};
     --card-background:${(p(o) && p(d) !== "closing" && r()["expander-card-background-expanded"] ? r()["expander-card-background-expanded"] : r()["expander-card-background"]) ?? ""};
     --background-animation-duration:${p(m) ?? ""}s;
     --expander-card-overlay-height:${p(b) ? `${p(b)}px` : "auto"};
    `);
  }), be(t, ln), Si(Eo);
}
tc(["click"]);
customElements.define("expander-card", Ja(id, { hass: {}, preview: {}, config: {} }, [], [], { mode: "open" }, (t) => class extends t {
  constructor() {
    super(...arguments);
    // re-declare props used in customClass.
    j(this, "config");
  }
  static async getConfigElement() {
    return await Yo(), document.createElement("expander-card-editor");
  }
  static getStubConfig() {
    return {
      type: "custom:expander-card",
      title: "Expander Card",
      cards: []
    };
  }
  setConfig(n = {}) {
    this.config = { ...Ei, ...n };
  }
}));
const sd = "7.0.4";
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Or = globalThis, Ui = Or.ShadowRoot && (Or.ShadyCSS === void 0 || Or.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, zi = Symbol(), Is = /* @__PURE__ */ new WeakMap();
let ro = class {
  constructor(e, n, i) {
    if (this._$cssResult$ = !0, i !== zi) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = n;
  }
  get styleSheet() {
    let e = this.o;
    const n = this.t;
    if (Ui && e === void 0) {
      const i = n !== void 0 && n.length === 1;
      i && (e = Is.get(n)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), i && Is.set(n, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const ad = (t) => new ro(typeof t == "string" ? t : t + "", void 0, zi), Bi = (t, ...e) => {
  const n = t.length === 1 ? t[0] : e.reduce((i, r, s) => i + ((a) => {
    if (a._$cssResult$ === !0) return a.cssText;
    if (typeof a == "number") return a;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + t[s + 1], t[0]);
  return new ro(n, t, zi);
}, od = (t, e) => {
  if (Ui) t.adoptedStyleSheets = e.map((n) => n instanceof CSSStyleSheet ? n : n.styleSheet);
  else for (const n of e) {
    const i = document.createElement("style"), r = Or.litNonce;
    r !== void 0 && i.setAttribute("nonce", r), i.textContent = n.cssText, t.appendChild(i);
  }
}, Ls = Ui ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let n = "";
  for (const i of e.cssRules) n += i.cssText;
  return ad(n);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: ld, defineProperty: cd, getOwnPropertyDescriptor: dd, getOwnPropertyNames: ud, getOwnPropertySymbols: hd, getPrototypeOf: fd } = Object, Tt = globalThis, ks = Tt.trustedTypes, pd = ks ? ks.emptyScript : "", ti = Tt.reactiveElementPolyfillSupport, Bn = (t, e) => t, Ir = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? pd : null;
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
} }, Vi = (t, e) => !ld(t, e), Ps = { attribute: !0, type: String, converter: Ir, reflect: !1, useDefault: !1, hasChanged: Vi };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), Tt.litPropertyMetadata ?? (Tt.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let fn = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, n = Ps) {
    if (n.state && (n.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((n = Object.create(n)).wrapped = !0), this.elementProperties.set(e, n), !n.noAccessor) {
      const i = Symbol(), r = this.getPropertyDescriptor(e, i, n);
      r !== void 0 && cd(this.prototype, e, r);
    }
  }
  static getPropertyDescriptor(e, n, i) {
    const { get: r, set: s } = dd(this.prototype, e) ?? { get() {
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
    return this.elementProperties.get(e) ?? Ps;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Bn("elementProperties"))) return;
    const e = fd(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Bn("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Bn("properties"))) {
      const n = this.properties, i = [...ud(n), ...hd(n)];
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
      for (const r of i) n.unshift(Ls(r));
    } else e !== void 0 && n.push(Ls(e));
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
    return od(e, this.constructor.elementStyles), e;
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
      const a = (((s = i.converter) == null ? void 0 : s.toAttribute) !== void 0 ? i.converter : Ir).toAttribute(n, i.type);
      this._$Em = e, a == null ? this.removeAttribute(r) : this.setAttribute(r, a), this._$Em = null;
    }
  }
  _$AK(e, n) {
    var s, a;
    const i = this.constructor, r = i._$Eh.get(e);
    if (r !== void 0 && this._$Em !== r) {
      const o = i.getPropertyOptions(r), l = typeof o.converter == "function" ? { fromAttribute: o.converter } : ((s = o.converter) == null ? void 0 : s.fromAttribute) !== void 0 ? o.converter : Ir;
      this._$Em = r;
      const c = l.fromAttribute(n, o.type);
      this[r] = c ?? ((a = this._$Ej) == null ? void 0 : a.get(r)) ?? c, this._$Em = null;
    }
  }
  requestUpdate(e, n, i, r = !1, s) {
    var a;
    if (e !== void 0) {
      const o = this.constructor;
      if (r === !1 && (s = this[e]), i ?? (i = o.getPropertyOptions(e)), !((i.hasChanged ?? Vi)(s, n) || i.useDefault && i.reflect && s === ((a = this._$Ej) == null ? void 0 : a.get(e)) && !this.hasAttribute(o._$Eu(e, i)))) return;
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
fn.elementStyles = [], fn.shadowRootOptions = { mode: "open" }, fn[Bn("elementProperties")] = /* @__PURE__ */ new Map(), fn[Bn("finalized")] = /* @__PURE__ */ new Map(), ti == null || ti({ ReactiveElement: fn }), (Tt.reactiveElementVersions ?? (Tt.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Vn = globalThis, Ds = (t) => t, Lr = Vn.trustedTypes, Ms = Lr ? Lr.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, io = "$lit$", yt = `lit$${Math.random().toFixed(9).slice(2)}$`, so = "?" + yt, _d = `<${so}>`, nn = document, Jn = () => nn.createComment(""), Kn = (t) => t === null || typeof t != "object" && typeof t != "function", Wi = Array.isArray, vd = (t) => Wi(t) || typeof (t == null ? void 0 : t[Symbol.iterator]) == "function", ni = `[ 	
\f\r]`, jn = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Hs = /-->/g, js = />/g, Ft = RegExp(`>|${ni}(?:([^\\s"'>=/]+)(${ni}*=${ni}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Fs = /'/g, qs = /"/g, ao = /^(?:script|style|textarea|title)$/i, gd = (t) => (e, ...n) => ({ _$litType$: t, strings: e, values: n }), hn = gd(1), Cn = Symbol.for("lit-noChange"), G = Symbol.for("lit-nothing"), Gs = /* @__PURE__ */ new WeakMap(), zt = nn.createTreeWalker(nn, 129);
function oo(t, e) {
  if (!Wi(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Ms !== void 0 ? Ms.createHTML(e) : e;
}
const md = (t, e) => {
  const n = t.length - 1, i = [];
  let r, s = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", a = jn;
  for (let o = 0; o < n; o++) {
    const l = t[o];
    let c, d, f = -1, m = 0;
    for (; m < l.length && (a.lastIndex = m, d = a.exec(l), d !== null); ) m = a.lastIndex, a === jn ? d[1] === "!--" ? a = Hs : d[1] !== void 0 ? a = js : d[2] !== void 0 ? (ao.test(d[2]) && (r = RegExp("</" + d[2], "g")), a = Ft) : d[3] !== void 0 && (a = Ft) : a === Ft ? d[0] === ">" ? (a = r ?? jn, f = -1) : d[1] === void 0 ? f = -2 : (f = a.lastIndex - d[2].length, c = d[1], a = d[3] === void 0 ? Ft : d[3] === '"' ? qs : Fs) : a === qs || a === Fs ? a = Ft : a === Hs || a === js ? a = jn : (a = Ft, r = void 0);
    const b = a === Ft && t[o + 1].startsWith("/>") ? " " : "";
    s += a === jn ? l + _d : f >= 0 ? (i.push(c), l.slice(0, f) + io + l.slice(f) + yt + b) : l + yt + (f === -2 ? o : b);
  }
  return [oo(t, s + (t[n] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), i];
};
class Xn {
  constructor({ strings: e, _$litType$: n }, i) {
    let r;
    this.parts = [];
    let s = 0, a = 0;
    const o = e.length - 1, l = this.parts, [c, d] = md(e, n);
    if (this.el = Xn.createElement(c, i), zt.currentNode = this.el.content, n === 2 || n === 3) {
      const f = this.el.content.firstChild;
      f.replaceWith(...f.childNodes);
    }
    for (; (r = zt.nextNode()) !== null && l.length < o; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const f of r.getAttributeNames()) if (f.endsWith(io)) {
          const m = d[a++], b = r.getAttribute(f).split(yt), _ = /([.?@])?(.*)/.exec(m);
          l.push({ type: 1, index: s, name: _[2], strings: b, ctor: _[1] === "." ? yd : _[1] === "?" ? wd : _[1] === "@" ? Ed : Ur }), r.removeAttribute(f);
        } else f.startsWith(yt) && (l.push({ type: 6, index: s }), r.removeAttribute(f));
        if (ao.test(r.tagName)) {
          const f = r.textContent.split(yt), m = f.length - 1;
          if (m > 0) {
            r.textContent = Lr ? Lr.emptyScript : "";
            for (let b = 0; b < m; b++) r.append(f[b], Jn()), zt.nextNode(), l.push({ type: 2, index: ++s });
            r.append(f[m], Jn());
          }
        }
      } else if (r.nodeType === 8) if (r.data === so) l.push({ type: 2, index: s });
      else {
        let f = -1;
        for (; (f = r.data.indexOf(yt, f + 1)) !== -1; ) l.push({ type: 7, index: s }), f += yt.length - 1;
      }
      s++;
    }
  }
  static createElement(e, n) {
    const i = nn.createElement("template");
    return i.innerHTML = e, i;
  }
}
function Rn(t, e, n = t, i) {
  var a, o;
  if (e === Cn) return e;
  let r = i !== void 0 ? (a = n._$Co) == null ? void 0 : a[i] : n._$Cl;
  const s = Kn(e) ? void 0 : e._$litDirective$;
  return (r == null ? void 0 : r.constructor) !== s && ((o = r == null ? void 0 : r._$AO) == null || o.call(r, !1), s === void 0 ? r = void 0 : (r = new s(t), r._$AT(t, n, i)), i !== void 0 ? (n._$Co ?? (n._$Co = []))[i] = r : n._$Cl = r), r !== void 0 && (e = Rn(t, r._$AS(t, e.values), r, i)), e;
}
class bd {
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
    const { el: { content: n }, parts: i } = this._$AD, r = ((e == null ? void 0 : e.creationScope) ?? nn).importNode(n, !0);
    zt.currentNode = r;
    let s = zt.nextNode(), a = 0, o = 0, l = i[0];
    for (; l !== void 0; ) {
      if (a === l.index) {
        let c;
        l.type === 2 ? c = new lr(s, s.nextSibling, this, e) : l.type === 1 ? c = new l.ctor(s, l.name, l.strings, this, e) : l.type === 6 && (c = new $d(s, this, e)), this._$AV.push(c), l = i[++o];
      }
      a !== (l == null ? void 0 : l.index) && (s = zt.nextNode(), a++);
    }
    return zt.currentNode = nn, r;
  }
  p(e) {
    let n = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(e, i, n), n += i.strings.length - 2) : i._$AI(e[n])), n++;
  }
}
class lr {
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
    e = Rn(this, e, n), Kn(e) ? e === G || e == null || e === "" ? (this._$AH !== G && this._$AR(), this._$AH = G) : e !== this._$AH && e !== Cn && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : vd(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== G && Kn(this._$AH) ? this._$AA.nextSibling.data = e : this.T(nn.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    var s;
    const { values: n, _$litType$: i } = e, r = typeof i == "number" ? this._$AC(e) : (i.el === void 0 && (i.el = Xn.createElement(oo(i.h, i.h[0]), this.options)), i);
    if (((s = this._$AH) == null ? void 0 : s._$AD) === r) this._$AH.p(n);
    else {
      const a = new bd(r, this), o = a.u(this.options);
      a.p(n), this.T(o), this._$AH = a;
    }
  }
  _$AC(e) {
    let n = Gs.get(e.strings);
    return n === void 0 && Gs.set(e.strings, n = new Xn(e)), n;
  }
  k(e) {
    Wi(this._$AH) || (this._$AH = [], this._$AR());
    const n = this._$AH;
    let i, r = 0;
    for (const s of e) r === n.length ? n.push(i = new lr(this.O(Jn()), this.O(Jn()), this, this.options)) : i = n[r], i._$AI(s), r++;
    r < n.length && (this._$AR(i && i._$AB.nextSibling, r), n.length = r);
  }
  _$AR(e = this._$AA.nextSibling, n) {
    var i;
    for ((i = this._$AP) == null ? void 0 : i.call(this, !1, !0, n); e !== this._$AB; ) {
      const r = Ds(e).nextSibling;
      Ds(e).remove(), e = r;
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
  constructor(e, n, i, r, s) {
    this.type = 1, this._$AH = G, this._$AN = void 0, this.element = e, this.name = n, this._$AM = r, this.options = s, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = G;
  }
  _$AI(e, n = this, i, r) {
    const s = this.strings;
    let a = !1;
    if (s === void 0) e = Rn(this, e, n, 0), a = !Kn(e) || e !== this._$AH && e !== Cn, a && (this._$AH = e);
    else {
      const o = e;
      let l, c;
      for (e = s[0], l = 0; l < s.length - 1; l++) c = Rn(this, o[i + l], n, l), c === Cn && (c = this._$AH[l]), a || (a = !Kn(c) || c !== this._$AH[l]), c === G ? e = G : e !== G && (e += (c ?? "") + s[l + 1]), this._$AH[l] = c;
    }
    a && !r && this.j(e);
  }
  j(e) {
    e === G ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class yd extends Ur {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === G ? void 0 : e;
  }
}
class wd extends Ur {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== G);
  }
}
class Ed extends Ur {
  constructor(e, n, i, r, s) {
    super(e, n, i, r, s), this.type = 5;
  }
  _$AI(e, n = this) {
    if ((e = Rn(this, e, n, 0) ?? G) === Cn) return;
    const i = this._$AH, r = e === G && i !== G || e.capture !== i.capture || e.once !== i.once || e.passive !== i.passive, s = e !== G && (i === G || r);
    r && this.element.removeEventListener(this.name, this, i), s && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    var n;
    typeof this._$AH == "function" ? this._$AH.call(((n = this.options) == null ? void 0 : n.host) ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class $d {
  constructor(e, n, i) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = n, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    Rn(this, e);
  }
}
const ri = Vn.litHtmlPolyfillSupport;
ri == null || ri(Xn, lr), (Vn.litHtmlVersions ?? (Vn.litHtmlVersions = [])).push("3.3.2");
const Ad = (t, e, n) => {
  const i = (n == null ? void 0 : n.renderBefore) ?? e;
  let r = i._$litPart$;
  if (r === void 0) {
    const s = (n == null ? void 0 : n.renderBefore) ?? null;
    i._$litPart$ = r = new lr(e.insertBefore(Jn(), s), s, void 0, n ?? {});
  }
  return r._$AI(t), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Xt = globalThis;
class Wn extends fn {
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
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Ad(n, this.renderRoot, this.renderOptions);
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
var Vs;
Wn._$litElement$ = !0, Wn.finalized = !0, (Vs = Xt.litElementHydrateSupport) == null || Vs.call(Xt, { LitElement: Wn });
const ii = Xt.litElementPolyfillSupport;
ii == null || ii({ LitElement: Wn });
(Xt.litElementVersions ?? (Xt.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Od = (t) => (e, n) => {
  n !== void 0 ? n.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Sd = { attribute: !0, type: String, converter: Ir, reflect: !1, hasChanged: Vi }, xd = (t = Sd, e, n) => {
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
function zr(t) {
  return (e, n) => typeof n == "object" ? xd(t, e, n) : ((i, r, s) => {
    const a = r.hasOwnProperty(s);
    return r.constructor.createProperty(s, i), a ? Object.getOwnPropertyDescriptor(r, s) : void 0;
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
const Td = (t, e, n) => (n.configurable = !0, n.enumerable = !0, Reflect.decorate && typeof e != "object" && Object.defineProperty(t, e, n), n);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function Nd(t, e) {
  return (n, i, r) => {
    const s = (a) => {
      var o;
      return ((o = a.renderRoot) == null ? void 0 : o.querySelector(t)) ?? null;
    };
    return Td(n, i, { get() {
      return s(this);
    } });
  };
}
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Cd = (t) => t ?? G, Rd = Bi`
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
`, Id = Bi`
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
var Ld = Object.defineProperty, kd = Object.getOwnPropertyDescriptor, Xe = (t, e, n, i) => {
  for (var r = i > 1 ? void 0 : i ? kd(e, n) : e, s = t.length - 1, a; s >= 0; s--)
    (a = t[s]) && (r = (i ? a(e, n, r) : a(r)) || r);
  return i && r && Ld(e, n, r), r;
};
const lo = "custom:", Pd = (t) => t.startsWith(lo), Dd = (t) => {
  var e;
  return (e = window.customCards) == null ? void 0 : e.find((n) => n.type === t);
}, Md = (t) => t.replace(lo, "");
let ve = class extends Wn {
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
      Pd(this._config.type) ? (i = (n = Dd(
        Md(this._config.type)
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
                        disabled=${Cd(t)}
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
  Rd,
  Id,
  Bi`
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
  zr({ attribute: !1 })
], ve.prototype, "hass", 2);
Xe([
  zr({ type: Boolean, reflect: !0 })
], ve.prototype, "large", 2);
Xe([
  zr({ attribute: !1 })
], ve.prototype, "lovelace", 2);
Xe([
  cr()
], ve.prototype, "_params", 2);
Xe([
  cr()
], ve.prototype, "_config", 2);
Xe([
  cr()
], ve.prototype, "_cardGUIMode", 2);
Xe([
  cr()
], ve.prototype, "_cardGUIModeAvailable", 2);
Xe([
  cr()
], ve.prototype, "_error", 2);
Xe([
  Nd("hui-card-element-editor")
], ve.prototype, "_cardEditorEl", 2);
ve = Xe([
  Od("expander-card-title-card-edit-form")
], ve);
console.info(
  `%c  Expander-Card 
%c Version ${sd}`,
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
  id as default
};
//# sourceMappingURL=expander-card.js.map
