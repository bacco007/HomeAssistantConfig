var Io = Object.defineProperty;
var ss = (t) => {
  throw TypeError(t);
};
var Lo = (t, e, n) => e in t ? Io(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n;
var q = (t, e, n) => Lo(t, typeof e != "symbol" ? e + "" : e, n), Yr = (t, e, n) => e.has(t) || ss("Cannot " + n);
var h = (t, e, n) => (Yr(t, e, "read from private field"), n ? n.call(t) : e.get(t)), N = (t, e, n) => e.has(t) ? ss("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, n), x = (t, e, n, i) => (Yr(t, e, "write to private field"), i ? i.call(t, n) : e.set(t, n), n), V = (t, e, n) => (Yr(t, e, "access private method"), n);
const ko = "5";
var Bs;
typeof window < "u" && ((Bs = window.__svelte ?? (window.__svelte = {})).v ?? (Bs.v = /* @__PURE__ */ new Set())).add(ko);
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
var fr = /* @__PURE__ */ ((t) => (t.CSS = "css", t.Object = "object", t))(fr || {});
const Mo = { name: "style", label: "CSS text", selector: { text: { multiline: !0 } } }, Ho = { name: "style", label: "CSS structured object", selector: { object: {} } }, jo = { icon: {} }, Fo = { text: {} }, qo = { boolean: {} }, Uo = (t) => ({
  number: {
    unit_of_measurement: t
  }
}), Go = (t, e) => ({
  name: t,
  label: e,
  selector: jo
}), J = (t, e) => ({
  name: t,
  label: e,
  selector: Fo
}), rn = (t, e) => ({
  name: t,
  label: e,
  selector: qo
}), as = (t, e, n) => ({
  name: t,
  label: e,
  selector: Uo(n)
}), zo = [
  {
    type: "expandable",
    label: "Expander Card Settings",
    icon: "mdi:arrow-down-bold-box-outline",
    schema: [
      {
        ...J("title", "Title")
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
                ...rn("expanded", "Start expanded")
              },
              {
                ...rn("animation", "Enable animation")
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
                ...as("min-width-expanded", "Min width expanded", "px")
              },
              {
                ...as("max-width-expanded", "Max width expanded", "px")
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
                ...rn("clear", "Clear border and background")
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
                ...rn("clear-children", "Clear card border and background")
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
                ...rn("title-card-clickable", "Make title card clickable to expand/collapse")
              },
              {
                ...rn("title-card-button-overlay", "Overlay expand button on title card")
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
}), Hn = window;
let hr = Hn.cardHelpers;
const Vo = new Promise((t) => {
  hr && t(), Hn.loadCardHelpers && Hn.loadCardHelpers().then((e) => {
    hr = e, Hn.cardHelpers = hr, t();
  });
});
async function Wo() {
  const t = document.querySelector("home-assistant"), e = t == null ? void 0 : t.hass;
  return e ? (await e.callWS({ type: "config/auth/list" })).filter((i) => !i.system_generated).map((i) => i.name) : void 0;
}
const Yo = async () => {
  const t = await Vo.then(() => hr.createCardElement({ type: "vertical-stack", cards: [] })), e = await customElements.whenDefined("hui-vertical-stack-card").then(() => t.constructor.getConfigElement()), n = await Wo();
  return class extends e.constructor {
    constructor() {
      super(), this.showDialogCallback = (r) => {
        var a, o, l, u;
        ((l = (o = (a = r.detail) == null ? void 0 : a.dialogParams) == null ? void 0 : o.schema) == null ? void 0 : l.find((c) => c.name === "expander_card_title_card_marker")) && (r.stopPropagation(), (u = r.detail) != null && u.dialogImport && r.detail.dialogImport().then(async () => {
          var f, _, w, g, A, d, v, y;
          const c = {
            title: "Title card",
            config: this._config["title-card"] || {},
            submit: (_ = (f = r.detail) == null ? void 0 : f.dialogParams) == null ? void 0 : _.submit,
            cancel: (g = (w = r.detail) == null ? void 0 : w.dialogParams) == null ? void 0 : g.cancel,
            submitText: (d = (A = r.detail) == null ? void 0 : A.dialogParams) == null ? void 0 : d.submitText,
            cancelText: (y = (v = r.detail) == null ? void 0 : v.dialogParams) == null ? void 0 : y.cancelText,
            lovelace: this.lovelace
          };
          await Bo(
            this,
            c
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
          var _;
          return !((_ = this._config.templates) != null && _.some((w) => w.template === f));
        }).join('","')
      );
      const u = (this._config.style && typeof this._config.style == "object" ? fr.Object : fr.CSS) === fr.CSS ? JSON.stringify(Mo) : JSON.stringify(Ho);
      return o = o.replace(/"\[\[style\]\]"/g, u), JSON.parse(o);
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
}, Jo = async () => {
  for (; customElements.get("home-assistant") === void 0; )
    await new Promise((t) => Hn.setTimeout(t, 100));
  if (!customElements.get("expander-card-editor")) {
    const t = await Yo();
    customElements.define("expander-card-editor", t);
  }
}, Ko = 1, Qo = 2, Xo = 16, Zo = 1, el = 2, Ws = "[", Pr = "[!", Si = "]", Wt = {}, K = Symbol(), tl = "http://www.w3.org/1999/xhtml", li = !1;
var Ys = Array.isArray, nl = Array.prototype.indexOf, bn = Array.prototype.includes, Dr = Array.from, $r = Object.keys, Ar = Object.defineProperty, dn = Object.getOwnPropertyDescriptor, rl = Object.getOwnPropertyDescriptors, il = Object.prototype, sl = Array.prototype, Js = Object.getPrototypeOf, os = Object.isExtensible;
function al(t) {
  for (var e = 0; e < t.length; e++)
    t[e]();
}
function Ks() {
  var t, e, n = new Promise((i, r) => {
    t = i, e = r;
  });
  return { promise: n, resolve: t, reject: e };
}
const X = 2, Or = 4, Mr = 8, Qs = 1 << 24, at = 16, He = 32, Tt = 64, xi = 128, be = 512, W = 1024, Z = 2048, Me = 4096, de = 8192, it = 16384, Hr = 32768, wn = 65536, ls = 1 << 17, Xs = 1 << 18, Qt = 1 << 19, ol = 1 << 20, mt = 1 << 25, Bn = 32768, ci = 1 << 21, Ti = 1 << 22, bt = 1 << 23, pr = Symbol("$state"), ll = Symbol("legacy props"), cl = Symbol(""), cn = new class extends Error {
  constructor() {
    super(...arguments);
    q(this, "name", "StaleReactionError");
    q(this, "message", "The reaction that called `getAbortSignal()` was re-run or destroyed");
  }
}(), jr = 3, Xt = 8;
function ul(t) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function dl() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function fl(t, e, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function hl(t) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function pl() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function vl(t) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function _l() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function gl() {
  throw new Error("https://svelte.dev/e/hydration_failed");
}
function ml() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function yl() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function bl() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function wl() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
function tr(t) {
  console.warn("https://svelte.dev/e/hydration_mismatch");
}
function El() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
let L = !1;
function Le(t) {
  L = t;
}
let I;
function ne(t) {
  if (t === null)
    throw tr(), Wt;
  return I = t;
}
function En() {
  return ne(/* @__PURE__ */ je(I));
}
function Ye(t) {
  if (L) {
    if (/* @__PURE__ */ je(I) !== null)
      throw tr(), Wt;
    I = t;
  }
}
function $l(t = 1) {
  if (L) {
    for (var e = t, n = I; e--; )
      n = /** @type {TemplateNode} */
      /* @__PURE__ */ je(n);
    I = n;
  }
}
function Sr(t = !0) {
  for (var e = 0, n = I; ; ) {
    if (n.nodeType === Xt) {
      var i = (
        /** @type {Comment} */
        n.data
      );
      if (i === Si) {
        if (e === 0) return n;
        e -= 1;
      } else (i === Ws || i === Pr) && (e += 1);
    }
    var r = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ je(n)
    );
    t && n.remove(), n = r;
  }
}
function Zs(t) {
  if (!t || t.nodeType !== Xt)
    throw tr(), Wt;
  return (
    /** @type {Comment} */
    t.data
  );
}
function ea(t) {
  return t === this.v;
}
function Al(t, e) {
  return t != t ? e == e : t !== e || t !== null && typeof t == "object" || typeof t == "function";
}
function ta(t) {
  return !Al(t, this.v);
}
let Ol = !1, fe = null;
function $n(t) {
  fe = t;
}
function Ni(t, e = !1, n) {
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
function Ci(t) {
  var e = (
    /** @type {ComponentContext} */
    fe
  ), n = e.e;
  if (n !== null) {
    e.e = null;
    for (var i of n)
      Oa(i);
  }
  return t !== void 0 && (e.x = t), e.i = !0, fe = e.p, t ?? /** @type {T} */
  {};
}
function na() {
  return !0;
}
let kt = [];
function ra() {
  var t = kt;
  kt = [], al(t);
}
function Gt(t) {
  if (kt.length === 0 && !jn) {
    var e = kt;
    queueMicrotask(() => {
      e === kt && ra();
    });
  }
  kt.push(t);
}
function Sl() {
  for (; kt.length > 0; )
    ra();
}
function ia(t) {
  var e = P;
  if (e === null)
    return R.f |= bt, t;
  if ((e.f & Hr) === 0) {
    if ((e.f & xi) === 0)
      throw t;
    e.b.error(t);
  } else
    An(t, e);
}
function An(t, e) {
  for (; e !== null; ) {
    if ((e.f & xi) !== 0)
      try {
        e.b.error(t);
        return;
      } catch (n) {
        t = n;
      }
    e = e.parent;
  }
  throw t;
}
const xl = -7169;
function G(t, e) {
  t.f = t.f & xl | e;
}
function Ri(t) {
  (t.f & be) !== 0 || t.deps === null ? G(t, W) : G(t, Me);
}
function sa(t) {
  if (t !== null)
    for (const e of t)
      (e.f & X) === 0 || (e.f & Bn) === 0 || (e.f ^= Bn, sa(
        /** @type {Derived} */
        e.deps
      ));
}
function aa(t, e, n) {
  (t.f & Z) !== 0 ? e.add(t) : (t.f & Me) !== 0 && n.add(t), sa(t.deps), G(t, W);
}
const lr = /* @__PURE__ */ new Set();
let D = null, Q = null, se = [], Fr = null, ui = !1, jn = !1;
var hn, pn, Mt, vn, Kn, Qn, Ht, Qe, _n, Be, di, fi, oa;
const Yi = class Yi {
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
    N(this, hn, /* @__PURE__ */ new Set());
    /**
     * If a fork is discarded, we need to destroy any effects that are no longer needed
     * @type {Set<(batch: Batch) => void>}
     */
    N(this, pn, /* @__PURE__ */ new Set());
    /**
     * The number of async effects that are currently in flight
     */
    N(this, Mt, 0);
    /**
     * The number of async effects that are currently in flight, _not_ inside a pending boundary
     */
    N(this, vn, 0);
    /**
     * A deferred that resolves when the batch is committed, used with `settled()`
     * TODO replace with Promise.withResolvers once supported widely enough
     * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
     */
    N(this, Kn, null);
    /**
     * Deferred effects (which run after async work has completed) that are DIRTY
     * @type {Set<Effect>}
     */
    N(this, Qn, /* @__PURE__ */ new Set());
    /**
     * Deferred effects that are MAYBE_DIRTY
     * @type {Set<Effect>}
     */
    N(this, Ht, /* @__PURE__ */ new Set());
    /**
     * A map of branches that still exist, but will be destroyed when this batch
     * is committed — we skip over these during `process`.
     * The value contains child effects that were dirty/maybe_dirty before being reset,
     * so they can be rescheduled if the branch survives.
     * @type {Map<Effect, { d: Effect[], m: Effect[] }>}
     */
    N(this, Qe, /* @__PURE__ */ new Map());
    q(this, "is_fork", !1);
    N(this, _n, !1);
  }
  is_deferred() {
    return this.is_fork || h(this, vn) > 0;
  }
  /**
   * Add an effect to the #skipped_branches map and reset its children
   * @param {Effect} effect
   */
  skip_effect(e) {
    h(this, Qe).has(e) || h(this, Qe).set(e, { d: [], m: [] });
  }
  /**
   * Remove an effect from the #skipped_branches map and reschedule
   * any tracked dirty/maybe_dirty child effects
   * @param {Effect} effect
   */
  unskip_effect(e) {
    var n = h(this, Qe).get(e);
    if (n) {
      h(this, Qe).delete(e);
      for (var i of n.d)
        G(i, Z), ke(i);
      for (i of n.m)
        G(i, Me), ke(i);
    }
  }
  /**
   *
   * @param {Effect[]} root_effects
   */
  process(e) {
    var r;
    se = [], this.apply();
    var n = [], i = [];
    for (const s of e)
      V(this, Be, di).call(this, s, n, i);
    if (this.is_deferred()) {
      V(this, Be, fi).call(this, i), V(this, Be, fi).call(this, n);
      for (const [s, a] of h(this, Qe))
        da(s, a);
    } else {
      for (const s of h(this, hn)) s();
      h(this, hn).clear(), h(this, Mt) === 0 && V(this, Be, oa).call(this), D = null, cs(i), cs(n), (r = h(this, Kn)) == null || r.resolve();
    }
    Q = null;
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} value
   */
  capture(e, n) {
    n !== K && !this.previous.has(e) && this.previous.set(e, n), (e.f & bt) === 0 && (this.current.set(e, e.v), Q == null || Q.set(e, e.v));
  }
  activate() {
    D = this, this.apply();
  }
  deactivate() {
    D === this && (D = null, Q = null);
  }
  flush() {
    if (this.activate(), se.length > 0) {
      if (la(), D !== null && D !== this)
        return;
    } else h(this, Mt) === 0 && this.process([]);
    this.deactivate();
  }
  discard() {
    for (const e of h(this, pn)) e(this);
    h(this, pn).clear();
  }
  /**
   *
   * @param {boolean} blocking
   */
  increment(e) {
    x(this, Mt, h(this, Mt) + 1), e && x(this, vn, h(this, vn) + 1);
  }
  /**
   *
   * @param {boolean} blocking
   */
  decrement(e) {
    x(this, Mt, h(this, Mt) - 1), e && x(this, vn, h(this, vn) - 1), !h(this, _n) && (x(this, _n, !0), Gt(() => {
      x(this, _n, !1), this.is_deferred() ? se.length > 0 && this.flush() : this.revive();
    }));
  }
  revive() {
    for (const e of h(this, Qn))
      h(this, Ht).delete(e), G(e, Z), ke(e);
    for (const e of h(this, Ht))
      G(e, Me), ke(e);
    this.flush();
  }
  /** @param {() => void} fn */
  oncommit(e) {
    h(this, hn).add(e);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(e) {
    h(this, pn).add(e);
  }
  settled() {
    return (h(this, Kn) ?? x(this, Kn, Ks())).promise;
  }
  static ensure() {
    if (D === null) {
      const e = D = new Yi();
      lr.add(D), jn || Gt(() => {
        D === e && e.flush();
      });
    }
    return D;
  }
  apply() {
  }
};
hn = new WeakMap(), pn = new WeakMap(), Mt = new WeakMap(), vn = new WeakMap(), Kn = new WeakMap(), Qn = new WeakMap(), Ht = new WeakMap(), Qe = new WeakMap(), _n = new WeakMap(), Be = new WeakSet(), /**
 * Traverse the effect tree, executing effects or stashing
 * them for later execution as appropriate
 * @param {Effect} root
 * @param {Effect[]} effects
 * @param {Effect[]} render_effects
 */
di = function(e, n, i) {
  e.f ^= W;
  for (var r = e.first, s = null; r !== null; ) {
    var a = r.f, o = (a & (He | Tt)) !== 0, l = o && (a & W) !== 0, u = l || (a & de) !== 0 || h(this, Qe).has(r);
    if (!u && r.fn !== null) {
      o ? r.f ^= W : s !== null && (a & (Or | Mr | Qs)) !== 0 ? s.b.defer_effect(r) : (a & Or) !== 0 ? n.push(r) : nr(r) && ((a & at) !== 0 && h(this, Ht).add(r), Vn(r));
      var c = r.first;
      if (c !== null) {
        r = c;
        continue;
      }
    }
    var f = r.parent;
    for (r = r.next; r === null && f !== null; )
      f === s && (s = null), r = f.next, f = f.parent;
  }
}, /**
 * @param {Effect[]} effects
 */
fi = function(e) {
  for (var n = 0; n < e.length; n += 1)
    aa(e[n], h(this, Qn), h(this, Ht));
}, oa = function() {
  var r;
  if (lr.size > 1) {
    this.previous.clear();
    var e = Q, n = !0;
    for (const s of lr) {
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
        var i = se;
        se = [];
        const l = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Map();
        for (const c of a)
          ca(c, o, l, u);
        if (se.length > 0) {
          D = s, s.apply();
          for (const c of se)
            V(r = s, Be, di).call(r, c, [], []);
          s.deactivate();
        }
        se = i;
      }
    }
    D = null, Q = e;
  }
  this.committed = !0, lr.delete(this);
};
let st = Yi;
function me(t) {
  var e = jn;
  jn = !0;
  try {
    for (var n; ; ) {
      if (Sl(), se.length === 0 && (D == null || D.flush(), se.length === 0))
        return Fr = null, /** @type {T} */
        n;
      la();
    }
  } finally {
    jn = e;
  }
}
function la() {
  ui = !0;
  var t = null;
  try {
    for (var e = 0; se.length > 0; ) {
      var n = st.ensure();
      if (e++ > 1e3) {
        var i, r;
        Tl();
      }
      n.process(se), wt.clear();
    }
  } finally {
    se = [], ui = !1, Fr = null;
  }
}
function Tl() {
  try {
    _l();
  } catch (t) {
    An(t, Fr);
  }
}
let xe = null;
function cs(t) {
  var e = t.length;
  if (e !== 0) {
    for (var n = 0; n < e; ) {
      var i = t[n++];
      if ((i.f & (it | de)) === 0 && nr(i) && (xe = /* @__PURE__ */ new Set(), Vn(i), i.deps === null && i.first === null && i.nodes === null && (i.teardown === null && i.ac === null ? Ca(i) : i.fn = null), (xe == null ? void 0 : xe.size) > 0)) {
        wt.clear();
        for (const r of xe) {
          if ((r.f & (it | de)) !== 0) continue;
          const s = [r];
          let a = r.parent;
          for (; a !== null; )
            xe.has(a) && (xe.delete(a), s.push(a)), a = a.parent;
          for (let o = s.length - 1; o >= 0; o--) {
            const l = s[o];
            (l.f & (it | de)) === 0 && Vn(l);
          }
        }
        xe.clear();
      }
    }
    xe = null;
  }
}
function ca(t, e, n, i) {
  if (!n.has(t) && (n.add(t), t.reactions !== null))
    for (const r of t.reactions) {
      const s = r.f;
      (s & X) !== 0 ? ca(
        /** @type {Derived} */
        r,
        e,
        n,
        i
      ) : (s & (Ti | at)) !== 0 && (s & Z) === 0 && ua(r, e, i) && (G(r, Z), ke(
        /** @type {Effect} */
        r
      ));
    }
}
function ua(t, e, n) {
  const i = n.get(t);
  if (i !== void 0) return i;
  if (t.deps !== null)
    for (const r of t.deps) {
      if (bn.call(e, r))
        return !0;
      if ((r.f & X) !== 0 && ua(
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
function ke(t) {
  for (var e = Fr = t; e.parent !== null; ) {
    e = e.parent;
    var n = e.f;
    if (ui && e === P && (n & at) !== 0 && (n & Xs) === 0)
      return;
    if ((n & (Tt | He)) !== 0) {
      if ((n & W) === 0) return;
      e.f ^= W;
    }
  }
  se.push(e);
}
function da(t, e) {
  if (!((t.f & He) !== 0 && (t.f & W) !== 0)) {
    (t.f & Z) !== 0 ? e.d.push(t) : (t.f & Me) !== 0 && e.m.push(t), G(t, W);
    for (var n = t.first; n !== null; )
      da(n, e), n = n.next;
  }
}
function Nl(t) {
  let e = 0, n = Yt(0), i;
  return () => {
    ki() && (p(n), Pi(() => (e === 0 && (i = Ce(() => t(() => Fn(n)))), e += 1, () => {
      Gt(() => {
        e -= 1, e === 0 && (i == null || i(), i = void 0, Fn(n));
      });
    })));
  };
}
var Cl = wn | Qt | xi;
function Rl(t, e, n) {
  new Il(t, e, n);
}
var ce, Xn, qe, jt, Ue, _e, ie, Ge, Xe, gt, Ft, Ze, gn, qt, mn, yn, et, Lr, z, fa, ha, hi, vr, _r, pi;
class Il {
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   */
  constructor(e, n, i) {
    N(this, z);
    /** @type {Boundary | null} */
    q(this, "parent");
    q(this, "is_pending", !1);
    /** @type {TemplateNode} */
    N(this, ce);
    /** @type {TemplateNode | null} */
    N(this, Xn, L ? I : null);
    /** @type {BoundaryProps} */
    N(this, qe);
    /** @type {((anchor: Node) => void)} */
    N(this, jt);
    /** @type {Effect} */
    N(this, Ue);
    /** @type {Effect | null} */
    N(this, _e, null);
    /** @type {Effect | null} */
    N(this, ie, null);
    /** @type {Effect | null} */
    N(this, Ge, null);
    /** @type {DocumentFragment | null} */
    N(this, Xe, null);
    /** @type {TemplateNode | null} */
    N(this, gt, null);
    N(this, Ft, 0);
    N(this, Ze, 0);
    N(this, gn, !1);
    N(this, qt, !1);
    /** @type {Set<Effect>} */
    N(this, mn, /* @__PURE__ */ new Set());
    /** @type {Set<Effect>} */
    N(this, yn, /* @__PURE__ */ new Set());
    /**
     * A source containing the number of pending async deriveds/expressions.
     * Only created if `$effect.pending()` is used inside the boundary,
     * otherwise updating the source results in needless `Batch.ensure()`
     * calls followed by no-op flushes
     * @type {Source<number> | null}
     */
    N(this, et, null);
    N(this, Lr, Nl(() => (x(this, et, Yt(h(this, Ft))), () => {
      x(this, et, null);
    })));
    x(this, ce, e), x(this, qe, n), x(this, jt, i), this.parent = /** @type {Effect} */
    P.b, this.is_pending = !!h(this, qe).pending, x(this, Ue, Di(() => {
      if (P.b = this, L) {
        const s = h(this, Xn);
        En(), /** @type {Comment} */
        s.nodeType === Xt && /** @type {Comment} */
        s.data === Pr ? V(this, z, ha).call(this) : (V(this, z, fa).call(this), h(this, Ze) === 0 && (this.is_pending = !1));
      } else {
        var r = V(this, z, hi).call(this);
        try {
          x(this, _e, ye(() => i(r)));
        } catch (s) {
          this.error(s);
        }
        h(this, Ze) > 0 ? V(this, z, _r).call(this) : this.is_pending = !1;
      }
      return () => {
        var s;
        (s = h(this, gt)) == null || s.remove();
      };
    }, Cl)), L && x(this, ce, I);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(e) {
    aa(e, h(this, mn), h(this, yn));
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
    V(this, z, pi).call(this, e), x(this, Ft, h(this, Ft) + e), !(!h(this, et) || h(this, gn)) && (x(this, gn, !0), Gt(() => {
      x(this, gn, !1), h(this, et) && On(h(this, et), h(this, Ft));
    }));
  }
  get_effect_pending() {
    return h(this, Lr).call(this), p(
      /** @type {Source<number>} */
      h(this, et)
    );
  }
  /** @param {unknown} error */
  error(e) {
    var n = h(this, qe).onerror;
    let i = h(this, qe).failed;
    if (h(this, qt) || !n && !i)
      throw e;
    h(this, _e) && (re(h(this, _e)), x(this, _e, null)), h(this, ie) && (re(h(this, ie)), x(this, ie, null)), h(this, Ge) && (re(h(this, Ge)), x(this, Ge, null)), L && (ne(
      /** @type {TemplateNode} */
      h(this, Xn)
    ), $l(), ne(Sr()));
    var r = !1, s = !1;
    const a = () => {
      if (r) {
        El();
        return;
      }
      r = !0, s && wl(), st.ensure(), x(this, Ft, 0), h(this, Ge) !== null && zt(h(this, Ge), () => {
        x(this, Ge, null);
      }), this.is_pending = this.has_pending_snippet(), x(this, _e, V(this, z, vr).call(this, () => (x(this, qt, !1), ye(() => h(this, jt).call(this, h(this, ce)))))), h(this, Ze) > 0 ? V(this, z, _r).call(this) : this.is_pending = !1;
    };
    Gt(() => {
      try {
        s = !0, n == null || n(e, a), s = !1;
      } catch (o) {
        An(o, h(this, Ue) && h(this, Ue).parent);
      }
      i && x(this, Ge, V(this, z, vr).call(this, () => {
        st.ensure(), x(this, qt, !0);
        try {
          return ye(() => {
            i(
              h(this, ce),
              () => e,
              () => a
            );
          });
        } catch (o) {
          return An(
            o,
            /** @type {Effect} */
            h(this, Ue).parent
          ), null;
        } finally {
          x(this, qt, !1);
        }
      }));
    });
  }
}
ce = new WeakMap(), Xn = new WeakMap(), qe = new WeakMap(), jt = new WeakMap(), Ue = new WeakMap(), _e = new WeakMap(), ie = new WeakMap(), Ge = new WeakMap(), Xe = new WeakMap(), gt = new WeakMap(), Ft = new WeakMap(), Ze = new WeakMap(), gn = new WeakMap(), qt = new WeakMap(), mn = new WeakMap(), yn = new WeakMap(), et = new WeakMap(), Lr = new WeakMap(), z = new WeakSet(), fa = function() {
  try {
    x(this, _e, ye(() => h(this, jt).call(this, h(this, ce))));
  } catch (e) {
    this.error(e);
  }
}, ha = function() {
  const e = h(this, qe).pending;
  e && (x(this, ie, ye(() => e(h(this, ce)))), Gt(() => {
    var n = V(this, z, hi).call(this);
    x(this, _e, V(this, z, vr).call(this, () => (st.ensure(), ye(() => h(this, jt).call(this, n))))), h(this, Ze) > 0 ? V(this, z, _r).call(this) : (zt(
      /** @type {Effect} */
      h(this, ie),
      () => {
        x(this, ie, null);
      }
    ), this.is_pending = !1);
  }));
}, hi = function() {
  var e = h(this, ce);
  return this.is_pending && (x(this, gt, we()), h(this, ce).before(h(this, gt)), e = h(this, gt)), e;
}, /**
 * @param {() => Effect | null} fn
 */
vr = function(e) {
  var n = P, i = R, r = fe;
  $e(h(this, Ue)), oe(h(this, Ue)), $n(h(this, Ue).ctx);
  try {
    return e();
  } catch (s) {
    return ia(s), null;
  } finally {
    $e(n), oe(i), $n(r);
  }
}, _r = function() {
  const e = (
    /** @type {(anchor: Node) => void} */
    h(this, qe).pending
  );
  h(this, _e) !== null && (x(this, Xe, document.createDocumentFragment()), h(this, Xe).append(
    /** @type {TemplateNode} */
    h(this, gt)
  ), La(h(this, _e), h(this, Xe))), h(this, ie) === null && x(this, ie, ye(() => e(h(this, ce))));
}, /**
 * Updates the pending count associated with the currently visible pending snippet,
 * if any, such that we can replace the snippet with content once work is done
 * @param {1 | -1} d
 */
pi = function(e) {
  var n;
  if (!this.has_pending_snippet()) {
    this.parent && V(n = this.parent, z, pi).call(n, e);
    return;
  }
  if (x(this, Ze, h(this, Ze) + e), h(this, Ze) === 0) {
    this.is_pending = !1;
    for (const i of h(this, mn))
      G(i, Z), ke(i);
    for (const i of h(this, yn))
      G(i, Me), ke(i);
    h(this, mn).clear(), h(this, yn).clear(), h(this, ie) && zt(h(this, ie), () => {
      x(this, ie, null);
    }), h(this, Xe) && (h(this, ce).before(h(this, Xe)), x(this, Xe, null));
  }
};
function Ll(t, e, n, i) {
  const r = qr;
  var s = t.filter((_) => !_.settled);
  if (n.length === 0 && s.length === 0) {
    i(e.map(r));
    return;
  }
  var a = D, o = (
    /** @type {Effect} */
    P
  ), l = kl(), u = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((_) => _.promise)) : null;
  function c(_) {
    l();
    try {
      i(_);
    } catch (w) {
      (o.f & it) === 0 && An(w, o);
    }
    a == null || a.deactivate(), vi();
  }
  if (n.length === 0) {
    u.then(() => c(e.map(r)));
    return;
  }
  function f() {
    l(), Promise.all(n.map((_) => /* @__PURE__ */ Pl(_))).then((_) => c([...e.map(r), ..._])).catch((_) => An(_, o));
  }
  u ? u.then(f) : f();
}
function kl() {
  var t = P, e = R, n = fe, i = D;
  return function(s = !0) {
    $e(t), oe(e), $n(n), s && (i == null || i.activate());
  };
}
function vi() {
  $e(null), oe(null), $n(null);
}
// @__NO_SIDE_EFFECTS__
function qr(t) {
  var e = X | Z, n = R !== null && (R.f & X) !== 0 ? (
    /** @type {Derived} */
    R
  ) : null;
  return P !== null && (P.f |= Qt), {
    ctx: fe,
    deps: null,
    effects: null,
    equals: ea,
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
function Pl(t, e, n) {
  let i = (
    /** @type {Effect | null} */
    P
  );
  i === null && dl();
  var r = (
    /** @type {Boundary} */
    i.b
  ), s = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), a = Yt(
    /** @type {V} */
    K
  ), o = !R, l = /* @__PURE__ */ new Map();
  return zl(() => {
    var w;
    var u = Ks();
    s = u.promise;
    try {
      Promise.resolve(t()).then(u.resolve, u.reject).then(() => {
        c === D && c.committed && c.deactivate(), vi();
      });
    } catch (g) {
      u.reject(g), vi();
    }
    var c = (
      /** @type {Batch} */
      D
    );
    if (o) {
      var f = r.is_rendered();
      r.update_pending_count(1), c.increment(f), (w = l.get(c)) == null || w.reject(cn), l.delete(c), l.set(c, u);
    }
    const _ = (g, A = void 0) => {
      if (c.activate(), A)
        A !== cn && (a.f |= bt, On(a, A));
      else {
        (a.f & bt) !== 0 && (a.f ^= bt), On(a, g);
        for (const [d, v] of l) {
          if (l.delete(d), d === c) break;
          v.reject(cn);
        }
      }
      o && (r.update_pending_count(-1), c.decrement(f));
    };
    u.promise.then(_, (g) => _(null, g || "unknown"));
  }), ql(() => {
    for (const u of l.values())
      u.reject(cn);
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
function Ln(t) {
  const e = /* @__PURE__ */ qr(t);
  return ka(e), e;
}
// @__NO_SIDE_EFFECTS__
function Dl(t) {
  const e = /* @__PURE__ */ qr(t);
  return e.equals = ta, e;
}
function pa(t) {
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
function Ml(t) {
  for (var e = t.parent; e !== null; ) {
    if ((e.f & X) === 0)
      return (e.f & it) === 0 ? (
        /** @type {Effect} */
        e
      ) : null;
    e = e.parent;
  }
  return null;
}
function Ii(t) {
  var e, n = P;
  $e(Ml(t));
  try {
    t.f &= ~Bn, pa(t), e = Ha(t);
  } finally {
    $e(n);
  }
  return e;
}
function va(t) {
  var e = Ii(t);
  if (!t.equals(e) && (t.wv = Da(), (!(D != null && D.is_fork) || t.deps === null) && (t.v = e, t.deps === null))) {
    G(t, W);
    return;
  }
  Ot || (Q !== null ? (ki() || D != null && D.is_fork) && Q.set(t, e) : Ri(t));
}
let _i = /* @__PURE__ */ new Set();
const wt = /* @__PURE__ */ new Map();
let _a = !1;
function Yt(t, e) {
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
function M(t, e) {
  const n = Yt(t);
  return ka(n), n;
}
// @__NO_SIDE_EFFECTS__
function ga(t, e = !1, n = !0) {
  const i = Yt(t);
  return e || (i.equals = ta), i;
}
function O(t, e, n = !1) {
  R !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!De || (R.f & ls) !== 0) && na() && (R.f & (X | at | Ti | ls)) !== 0 && (Ee === null || !bn.call(Ee, t)) && bl();
  let i = n ? nt(e) : e;
  return On(t, i);
}
function On(t, e) {
  if (!t.equals(e)) {
    var n = t.v;
    Ot ? wt.set(t, e) : wt.set(t, n), t.v = e;
    var i = st.ensure();
    if (i.capture(t, n), (t.f & X) !== 0) {
      const r = (
        /** @type {Derived} */
        t
      );
      (t.f & Z) !== 0 && Ii(r), Ri(r);
    }
    t.wv = Da(), ma(t, Z), P !== null && (P.f & W) !== 0 && (P.f & (He | Tt)) === 0 && (pe === null ? Vl([t]) : pe.push(t)), !i.is_fork && _i.size > 0 && !_a && Hl();
  }
  return e;
}
function Hl() {
  _a = !1;
  for (const t of _i)
    (t.f & W) !== 0 && G(t, Me), nr(t) && Vn(t);
  _i.clear();
}
function Fn(t) {
  O(t, t.v + 1);
}
function ma(t, e) {
  var n = t.reactions;
  if (n !== null)
    for (var i = n.length, r = 0; r < i; r++) {
      var s = n[r], a = s.f, o = (a & Z) === 0;
      if (o && G(s, e), (a & X) !== 0) {
        var l = (
          /** @type {Derived} */
          s
        );
        Q == null || Q.delete(l), (a & Bn) === 0 && (a & be && (s.f |= Bn), ma(l, Me));
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
  if (typeof t != "object" || t === null || pr in t)
    return t;
  const e = Js(t);
  if (e !== il && e !== sl)
    return t;
  var n = /* @__PURE__ */ new Map(), i = Ys(t), r = /* @__PURE__ */ M(0), s = Bt, a = (o) => {
    if (Bt === s)
      return o();
    var l = R, u = Bt;
    oe(null), hs(s);
    var c = o();
    return oe(l), hs(u), c;
  };
  return i && n.set("length", /* @__PURE__ */ M(
    /** @type {any[]} */
    t.length
  )), new Proxy(
    /** @type {any} */
    t,
    {
      defineProperty(o, l, u) {
        (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && ml();
        var c = n.get(l);
        return c === void 0 ? c = a(() => {
          var f = /* @__PURE__ */ M(u.value);
          return n.set(l, f), f;
        }) : O(c, u.value, !0), !0;
      },
      deleteProperty(o, l) {
        var u = n.get(l);
        if (u === void 0) {
          if (l in o) {
            const c = a(() => /* @__PURE__ */ M(K));
            n.set(l, c), Fn(r);
          }
        } else
          O(u, K), Fn(r);
        return !0;
      },
      get(o, l, u) {
        var w;
        if (l === pr)
          return t;
        var c = n.get(l), f = l in o;
        if (c === void 0 && (!f || (w = dn(o, l)) != null && w.writable) && (c = a(() => {
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
        if (l === pr)
          return !0;
        var u = n.get(l), c = u !== void 0 && u.v !== K || Reflect.has(o, l);
        if (u !== void 0 || P !== null && (!c || (_ = dn(o, l)) != null && _.writable)) {
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
        if (i && l === "length")
          for (var w = u; w < /** @type {Source<number>} */
          f.v; w += 1) {
            var g = n.get(w + "");
            g !== void 0 ? O(g, K) : w in o && (g = a(() => /* @__PURE__ */ M(K)), n.set(w + "", g));
          }
        if (f === void 0)
          (!_ || (b = dn(o, l)) != null && b.writable) && (f = a(() => /* @__PURE__ */ M(void 0)), O(f, nt(u)), n.set(l, f));
        else {
          _ = f.v !== K;
          var A = a(() => nt(u));
          O(f, A);
        }
        var d = Reflect.getOwnPropertyDescriptor(o, l);
        if (d != null && d.set && d.set.call(c, u), !_) {
          if (i && typeof l == "string") {
            var v = (
              /** @type {Source<number>} */
              n.get("length")
            ), y = Number(l);
            Number.isInteger(y) && y >= v.v && O(v, y + 1);
          }
          Fn(r);
        }
        return !0;
      },
      ownKeys(o) {
        p(r);
        var l = Reflect.ownKeys(o).filter((f) => {
          var _ = n.get(f);
          return _ === void 0 || _.v !== K;
        });
        for (var [u, c] of n)
          c.v !== K && !(u in o) && l.push(u);
        return l;
      },
      setPrototypeOf() {
        yl();
      }
    }
  );
}
var us, ya, ba, wa;
function gi() {
  if (us === void 0) {
    us = window, ya = /Firefox/.test(navigator.userAgent);
    var t = Element.prototype, e = Node.prototype, n = Text.prototype;
    ba = dn(e, "firstChild").get, wa = dn(e, "nextSibling").get, os(t) && (t.__click = void 0, t.__className = void 0, t.__attributes = null, t.__style = void 0, t.__e = void 0), os(n) && (n.__t = void 0);
  }
}
function we(t = "") {
  return document.createTextNode(t);
}
// @__NO_SIDE_EFFECTS__
function Pe(t) {
  return (
    /** @type {TemplateNode | null} */
    ba.call(t)
  );
}
// @__NO_SIDE_EFFECTS__
function je(t) {
  return (
    /** @type {TemplateNode | null} */
    wa.call(t)
  );
}
function dt(t, e) {
  if (!L)
    return /* @__PURE__ */ Pe(t);
  var n = /* @__PURE__ */ Pe(I);
  if (n === null)
    n = I.appendChild(we());
  else if (e && n.nodeType !== jr) {
    var i = we();
    return n == null || n.before(i), ne(i), i;
  }
  return e && Li(
    /** @type {Text} */
    n
  ), ne(n), n;
}
function ds(t, e = !1) {
  if (!L) {
    var n = /* @__PURE__ */ Pe(t);
    return n instanceof Comment && n.data === "" ? /* @__PURE__ */ je(n) : n;
  }
  if (e) {
    if ((I == null ? void 0 : I.nodeType) !== jr) {
      var i = we();
      return I == null || I.before(i), ne(i), i;
    }
    Li(
      /** @type {Text} */
      I
    );
  }
  return I;
}
function Rt(t, e = 1, n = !1) {
  let i = L ? I : t;
  for (var r; e--; )
    r = i, i = /** @type {TemplateNode} */
    /* @__PURE__ */ je(i);
  if (!L)
    return i;
  if (n) {
    if ((i == null ? void 0 : i.nodeType) !== jr) {
      var s = we();
      return i === null ? r == null || r.after(s) : i.before(s), ne(s), s;
    }
    Li(
      /** @type {Text} */
      i
    );
  }
  return ne(i), i;
}
function Ea(t) {
  t.textContent = "";
}
function $a() {
  return !1;
}
function Li(t) {
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
function Aa(t) {
  var e = R, n = P;
  oe(null), $e(null);
  try {
    return t();
  } finally {
    oe(e), $e(n);
  }
}
function jl(t) {
  P === null && (R === null && vl(), pl()), Ot && hl();
}
function Fl(t, e) {
  var n = e.last;
  n === null ? e.last = e.first = t : (n.next = t, t.prev = n, e.last = t);
}
function Ve(t, e, n) {
  var i = P;
  i !== null && (i.f & de) !== 0 && (t |= de);
  var r = {
    ctx: fe,
    deps: null,
    nodes: null,
    f: t | Z | be,
    first: null,
    fn: e,
    last: null,
    next: null,
    parent: i,
    b: i && i.b,
    prev: null,
    teardown: null,
    wv: 0,
    ac: null
  };
  if (n)
    try {
      Vn(r), r.f |= Hr;
    } catch (o) {
      throw re(r), o;
    }
  else e !== null && ke(r);
  var s = r;
  if (n && s.deps === null && s.teardown === null && s.nodes === null && s.first === s.last && // either `null`, or a singular child
  (s.f & Qt) === 0 && (s = s.first, (t & at) !== 0 && (t & wn) !== 0 && s !== null && (s.f |= wn)), s !== null && (s.parent = i, i !== null && Fl(s, i), R !== null && (R.f & X) !== 0 && (t & Tt) === 0)) {
    var a = (
      /** @type {Derived} */
      R
    );
    (a.effects ?? (a.effects = [])).push(s);
  }
  return r;
}
function ki() {
  return R !== null && !De;
}
function ql(t) {
  const e = Ve(Mr, null, !1);
  return G(e, W), e.teardown = t, e;
}
function fn(t) {
  jl();
  var e = (
    /** @type {Effect} */
    P.f
  ), n = !R && (e & He) !== 0 && (e & Hr) === 0;
  if (n) {
    var i = (
      /** @type {ComponentContext} */
      fe
    );
    (i.e ?? (i.e = [])).push(t);
  } else
    return Oa(t);
}
function Oa(t) {
  return Ve(Or | ol, t, !1);
}
function Ul(t) {
  st.ensure();
  const e = Ve(Tt | Qt, t, !0);
  return () => {
    re(e);
  };
}
function Gl(t) {
  st.ensure();
  const e = Ve(Tt | Qt, t, !0);
  return (n = {}) => new Promise((i) => {
    n.outro ? zt(e, () => {
      re(e), i(void 0);
    }) : (re(e), i(void 0));
  });
}
function Sa(t) {
  return Ve(Or, t, !1);
}
function zl(t) {
  return Ve(Ti | Qt, t, !0);
}
function Pi(t, e = 0) {
  return Ve(Mr | e, t, !0);
}
function Je(t, e = [], n = [], i = []) {
  Ll(i, e, n, (r) => {
    Ve(Mr, () => t(...r.map(p)), !0);
  });
}
function Di(t, e = 0) {
  var n = Ve(at | e, t, !0);
  return n;
}
function ye(t) {
  return Ve(He | Qt, t, !0);
}
function xa(t) {
  var e = t.teardown;
  if (e !== null) {
    const n = Ot, i = R;
    fs(!0), oe(null);
    try {
      e.call(null);
    } finally {
      fs(n), oe(i);
    }
  }
}
function Ta(t, e = !1) {
  var n = t.first;
  for (t.first = t.last = null; n !== null; ) {
    const r = n.ac;
    r !== null && Aa(() => {
      r.abort(cn);
    });
    var i = n.next;
    (n.f & Tt) !== 0 ? n.parent = null : re(n, e), n = i;
  }
}
function Bl(t) {
  for (var e = t.first; e !== null; ) {
    var n = e.next;
    (e.f & He) === 0 && re(e), e = n;
  }
}
function re(t, e = !0) {
  var n = !1;
  (e || (t.f & Xs) !== 0) && t.nodes !== null && t.nodes.end !== null && (Na(
    t.nodes.start,
    /** @type {TemplateNode} */
    t.nodes.end
  ), n = !0), Ta(t, e && !n), xr(t, 0), G(t, it);
  var i = t.nodes && t.nodes.t;
  if (i !== null)
    for (const s of i)
      s.stop();
  xa(t);
  var r = t.parent;
  r !== null && r.first !== null && Ca(t), t.next = t.prev = t.teardown = t.ctx = t.deps = t.fn = t.nodes = t.ac = null;
}
function Na(t, e) {
  for (; t !== null; ) {
    var n = t === e ? null : /* @__PURE__ */ je(t);
    t.remove(), t = n;
  }
}
function Ca(t) {
  var e = t.parent, n = t.prev, i = t.next;
  n !== null && (n.next = i), i !== null && (i.prev = n), e !== null && (e.first === t && (e.first = i), e.last === t && (e.last = n));
}
function zt(t, e, n = !0) {
  var i = [];
  Ra(t, i, !0);
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
function Ra(t, e, n) {
  if ((t.f & de) === 0) {
    t.f ^= de;
    var i = t.nodes && t.nodes.t;
    if (i !== null)
      for (const o of i)
        (o.is_global || n) && e.push(o);
    for (var r = t.first; r !== null; ) {
      var s = r.next, a = (r.f & wn) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (r.f & He) !== 0 && (t.f & at) !== 0;
      Ra(r, e, a ? n : !1), r = s;
    }
  }
}
function Mi(t) {
  Ia(t, !0);
}
function Ia(t, e) {
  if ((t.f & de) !== 0) {
    t.f ^= de, (t.f & W) === 0 && (G(t, Z), ke(t));
    for (var n = t.first; n !== null; ) {
      var i = n.next, r = (n.f & wn) !== 0 || (n.f & He) !== 0;
      Ia(n, r ? e : !1), n = i;
    }
    var s = t.nodes && t.nodes.t;
    if (s !== null)
      for (const a of s)
        (a.is_global || e) && a.in();
  }
}
function La(t, e) {
  if (t.nodes)
    for (var n = t.nodes.start, i = t.nodes.end; n !== null; ) {
      var r = n === i ? null : /* @__PURE__ */ je(n);
      e.append(n), n = r;
    }
}
let gr = !1, Ot = !1;
function fs(t) {
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
function ka(t) {
  R !== null && (Ee === null ? Ee = [t] : Ee.push(t));
}
let ae = null, le = 0, pe = null;
function Vl(t) {
  pe = t;
}
let Pa = 1, Pt = 0, Bt = Pt;
function hs(t) {
  Bt = t;
}
function Da() {
  return ++Pa;
}
function nr(t) {
  var e = t.f;
  if ((e & Z) !== 0)
    return !0;
  if (e & X && (t.f &= -32769), (e & Me) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      t.deps
    ), i = n.length, r = 0; r < i; r++) {
      var s = n[r];
      if (nr(
        /** @type {Derived} */
        s
      ) && va(
        /** @type {Derived} */
        s
      ), s.wv > t.wv)
        return !0;
    }
    (e & be) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    Q === null && G(t, W);
  }
  return !1;
}
function Ma(t, e, n = !0) {
  var i = t.reactions;
  if (i !== null && !(Ee !== null && bn.call(Ee, t)))
    for (var r = 0; r < i.length; r++) {
      var s = i[r];
      (s.f & X) !== 0 ? Ma(
        /** @type {Derived} */
        s,
        e,
        !1
      ) : e === s && (n ? G(s, Z) : (s.f & W) !== 0 && G(s, Me), ke(
        /** @type {Effect} */
        s
      ));
    }
}
function Ha(t) {
  var A;
  var e = ae, n = le, i = pe, r = R, s = Ee, a = fe, o = De, l = Bt, u = t.f;
  ae = /** @type {null | Value[]} */
  null, le = 0, pe = null, R = (u & (He | Tt)) === 0 ? t : null, Ee = null, $n(t.ctx), De = !1, Bt = ++Pt, t.ac !== null && (Aa(() => {
    t.ac.abort(cn);
  }), t.ac = null);
  try {
    t.f |= ci;
    var c = (
      /** @type {Function} */
      t.fn
    ), f = c(), _ = t.deps, w = D == null ? void 0 : D.is_fork;
    if (ae !== null) {
      var g;
      if (w || xr(t, le), _ !== null && le > 0)
        for (_.length = le + ae.length, g = 0; g < ae.length; g++)
          _[le + g] = ae[g];
      else
        t.deps = _ = ae;
      if (ki() && (t.f & be) !== 0)
        for (g = le; g < _.length; g++)
          ((A = _[g]).reactions ?? (A.reactions = [])).push(t);
    } else !w && _ !== null && le < _.length && (xr(t, le), _.length = le);
    if (na() && pe !== null && !De && _ !== null && (t.f & (X | Me | Z)) === 0)
      for (g = 0; g < /** @type {Source[]} */
      pe.length; g++)
        Ma(
          pe[g],
          /** @type {Effect} */
          t
        );
    if (r !== null && r !== t) {
      if (Pt++, r.deps !== null)
        for (let d = 0; d < n; d += 1)
          r.deps[d].rv = Pt;
      if (e !== null)
        for (const d of e)
          d.rv = Pt;
      pe !== null && (i === null ? i = pe : i.push(.../** @type {Source[]} */
      pe));
    }
    return (t.f & bt) !== 0 && (t.f ^= bt), f;
  } catch (d) {
    return ia(d);
  } finally {
    t.f ^= ci, ae = e, le = n, pe = i, R = r, Ee = s, $n(a), De = o, Bt = l;
  }
}
function Wl(t, e) {
  let n = e.reactions;
  if (n !== null) {
    var i = nl.call(n, t);
    if (i !== -1) {
      var r = n.length - 1;
      r === 0 ? n = e.reactions = null : (n[i] = n[r], n.pop());
    }
  }
  if (n === null && (e.f & X) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (ae === null || !bn.call(ae, e))) {
    var s = (
      /** @type {Derived} */
      e
    );
    (s.f & be) !== 0 && (s.f ^= be, s.f &= -32769), Ri(s), pa(s), xr(s, 0);
  }
}
function xr(t, e) {
  var n = t.deps;
  if (n !== null)
    for (var i = e; i < n.length; i++)
      Wl(t, n[i]);
}
function Vn(t) {
  var e = t.f;
  if ((e & it) === 0) {
    G(t, W);
    var n = P, i = gr;
    P = t, gr = !0;
    try {
      (e & (at | Qs)) !== 0 ? Bl(t) : Ta(t), xa(t);
      var r = Ha(t);
      t.teardown = typeof r == "function" ? r : null, t.wv = Pa;
      var s;
      li && Ol && (t.f & Z) !== 0 && t.deps;
    } finally {
      gr = i, P = n;
    }
  }
}
function p(t) {
  var e = t.f, n = (e & X) !== 0;
  if (R !== null && !De) {
    var i = P !== null && (P.f & it) !== 0;
    if (!i && (Ee === null || !bn.call(Ee, t))) {
      var r = R.deps;
      if ((R.f & ci) !== 0)
        t.rv < Pt && (t.rv = Pt, ae === null && r !== null && r[le] === t ? le++ : ae === null ? ae = [t] : ae.push(t));
      else {
        (R.deps ?? (R.deps = [])).push(t);
        var s = t.reactions;
        s === null ? t.reactions = [R] : bn.call(s, R) || s.push(R);
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
      return ((a.f & W) === 0 && a.reactions !== null || Fa(a)) && (o = Ii(a)), wt.set(a, o), o;
    }
    var l = (a.f & be) === 0 && !De && R !== null && (gr || (R.f & be) !== 0), u = a.deps === null;
    nr(a) && (l && (a.f |= be), va(a)), l && !u && ja(a);
  }
  if (Q != null && Q.has(t))
    return Q.get(t);
  if ((t.f & bt) !== 0)
    throw t.v;
  return t.v;
}
function ja(t) {
  if (t.deps !== null) {
    t.f |= be;
    for (const e of t.deps)
      (e.reactions ?? (e.reactions = [])).push(t), (e.f & X) !== 0 && (e.f & be) === 0 && ja(
        /** @type {Derived} */
        e
      );
  }
}
function Fa(t) {
  if (t.v === K) return !0;
  if (t.deps === null) return !1;
  for (const e of t.deps)
    if (wt.has(e) || (e.f & X) !== 0 && Fa(
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
const qa = /* @__PURE__ */ new Set(), mi = /* @__PURE__ */ new Set();
function Yl(t) {
  for (var e = 0; e < t.length; e++)
    qa.add(t[e]);
  for (var n of mi)
    n(t);
}
let ps = null;
function cr(t) {
  var d;
  var e = this, n = (
    /** @type {Node} */
    e.ownerDocument
  ), i = t.type, r = ((d = t.composedPath) == null ? void 0 : d.call(t)) || [], s = (
    /** @type {null | Element} */
    r[0] || t.target
  );
  ps = t;
  var a = 0, o = ps === t && t.__root;
  if (o) {
    var l = r.indexOf(o);
    if (l !== -1 && (e === document || e === /** @type {any} */
    window)) {
      t.__root = e;
      return;
    }
    var u = r.indexOf(e);
    if (u === -1)
      return;
    l <= u && (a = l);
  }
  if (s = /** @type {Element} */
  r[a] || t.target, s !== e) {
    Ar(t, "currentTarget", {
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
          var A = s["__" + i];
          A != null && (!/** @type {any} */
          s.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          t.target === s) && A.call(s, t);
        } catch (v) {
          _ ? w.push(v) : _ = v;
        }
        if (t.cancelBubble || g === e || g === null)
          break;
        s = g;
      }
      if (_) {
        for (let v of w)
          queueMicrotask(() => {
            throw v;
          });
        throw _;
      }
    } finally {
      t.__root = e, delete t.currentTarget, oe(c), $e(f);
    }
  }
}
function Ua(t) {
  var e = document.createElement("template");
  return e.innerHTML = t.replaceAll("<!>", "<!---->"), e.content;
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
  var n = (e & Zo) !== 0, i = (e & el) !== 0, r, s = !t.startsWith("<!>");
  return () => {
    if (L)
      return Et(I, null), I;
    r === void 0 && (r = Ua(s ? t : "<!>" + t), n || (r = /** @type {TemplateNode} */
    /* @__PURE__ */ Pe(r)));
    var a = (
      /** @type {TemplateNode} */
      i || ya ? document.importNode(r, !0) : r.cloneNode(!0)
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
function vs() {
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
    ((n.f & Hr) === 0 || n.nodes.end === null) && (n.nodes.end = I), En();
    return;
  }
  t !== null && t.before(
    /** @type {Node} */
    e
  );
}
const Jl = ["touchstart", "touchmove"];
function Kl(t) {
  return Jl.includes(t);
}
function Ql(t, e) {
  var n = e == null ? "" : typeof e == "object" ? e + "" : e;
  n !== (t.__t ?? (t.__t = t.nodeValue)) && (t.__t = n, t.nodeValue = n + "");
}
function Ga(t, e) {
  return za(t, e);
}
function Xl(t, e) {
  gi(), e.intro = e.intro ?? !1;
  const n = e.target, i = L, r = I;
  try {
    for (var s = /* @__PURE__ */ Pe(n); s && (s.nodeType !== Xt || /** @type {Comment} */
    s.data !== Ws); )
      s = /* @__PURE__ */ je(s);
    if (!s)
      throw Wt;
    Le(!0), ne(
      /** @type {Comment} */
      s
    );
    const a = za(t, { ...e, anchor: s });
    return Le(!1), /**  @type {Exports} */
    a;
  } catch (a) {
    if (a instanceof Error && a.message.split(`
`).some((o) => o.startsWith("https://svelte.dev/e/")))
      throw a;
    return a !== Wt && console.warn("Failed to hydrate: ", a), e.recover === !1 && gl(), gi(), Ea(n), Le(!1), Ga(t, e);
  } finally {
    Le(i), ne(r);
  }
}
const sn = /* @__PURE__ */ new Map();
function za(t, { target: e, anchor: n, props: i = {}, events: r, context: s, intro: a = !0 }) {
  gi();
  var o = /* @__PURE__ */ new Set(), l = (f) => {
    for (var _ = 0; _ < f.length; _++) {
      var w = f[_];
      if (!o.has(w)) {
        o.add(w);
        var g = Kl(w);
        e.addEventListener(w, cr, { passive: g });
        var A = sn.get(w);
        A === void 0 ? (document.addEventListener(w, cr, { passive: g }), sn.set(w, 1)) : sn.set(w, A + 1);
      }
    }
  };
  l(Dr(qa)), mi.add(l);
  var u = void 0, c = Gl(() => {
    var f = n ?? e.appendChild(we());
    return Rl(
      /** @type {TemplateNode} */
      f,
      {
        pending: () => {
        }
      },
      (_) => {
        Ni({});
        var w = (
          /** @type {ComponentContext} */
          fe
        );
        if (s && (w.c = s), r && (i.$$events = r), L && Et(
          /** @type {TemplateNode} */
          _,
          null
        ), u = t(_, i) || {}, L && (P.nodes.end = I, I === null || I.nodeType !== Xt || /** @type {Comment} */
        I.data !== Si))
          throw tr(), Wt;
        Ci();
      }
    ), () => {
      var g;
      for (var _ of o) {
        e.removeEventListener(_, cr);
        var w = (
          /** @type {number} */
          sn.get(_)
        );
        --w === 0 ? (document.removeEventListener(_, cr), sn.delete(_)) : sn.set(_, w);
      }
      mi.delete(l), f !== n && ((g = f.parentNode) == null || g.removeChild(f));
    };
  });
  return yi.set(u, c), u;
}
let yi = /* @__PURE__ */ new WeakMap();
function Zl(t, e) {
  const n = yi.get(t);
  return n ? (yi.delete(t), n(e)) : Promise.resolve();
}
var Ne, ze, ue, Ut, Zn, er, kr;
class ec {
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
    N(this, Zn, !0);
    N(this, er, () => {
      var e = (
        /** @type {Batch} */
        D
      );
      if (h(this, Ne).has(e)) {
        var n = (
          /** @type {Key} */
          h(this, Ne).get(e)
        ), i = h(this, ze).get(n);
        if (i)
          Mi(i), h(this, Ut).delete(n);
        else {
          var r = h(this, ue).get(n);
          r && (h(this, ze).set(n, r.effect), h(this, ue).delete(n), r.fragment.lastChild.remove(), this.anchor.before(r.fragment), i = r.effect);
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
              La(a, u), u.append(we()), h(this, ue).set(s, { effect: a, fragment: u });
            } else
              re(a);
            h(this, Ut).delete(s), h(this, ze).delete(s);
          };
          h(this, Zn) || !i ? (h(this, Ut).add(s), zt(a, o, !1)) : o();
        }
      }
    });
    /**
     * @param {Batch} batch
     */
    N(this, kr, (e) => {
      h(this, Ne).delete(e);
      const n = Array.from(h(this, Ne).values());
      for (const [i, r] of h(this, ue))
        n.includes(i) || (re(r.effect), h(this, ue).delete(i));
    });
    this.anchor = e, x(this, Zn, n);
  }
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(e, n) {
    var i = (
      /** @type {Batch} */
      D
    ), r = $a();
    if (n && !h(this, ze).has(e) && !h(this, ue).has(e))
      if (r) {
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
    if (h(this, Ne).set(i, e), r) {
      for (const [o, l] of h(this, ze))
        o === e ? i.unskip_effect(l) : i.skip_effect(l);
      for (const [o, l] of h(this, ue))
        o === e ? i.unskip_effect(l.effect) : i.skip_effect(l.effect);
      i.oncommit(h(this, er)), i.ondiscard(h(this, kr));
    } else
      L && (this.anchor = I), h(this, er).call(this);
  }
}
Ne = new WeakMap(), ze = new WeakMap(), ue = new WeakMap(), Ut = new WeakMap(), Zn = new WeakMap(), er = new WeakMap(), kr = new WeakMap();
function Ba(t) {
  fe === null && ul(), fn(() => {
    const e = Ce(t);
    if (typeof e == "function") return (
      /** @type {() => void} */
      e
    );
  });
}
function ft(t, e, n = !1) {
  L && En();
  var i = new ec(t), r = n ? wn : 0;
  function s(a, o) {
    if (L) {
      const u = Zs(t) === Pr;
      if (a === u) {
        var l = Sr();
        ne(l), i.anchor = l, Le(!1), i.ensure(a, o), Le(!0);
        return;
      }
    }
    i.ensure(a, o);
  }
  Di(() => {
    var a = !1;
    e((o, l = !0) => {
      a = !0, s(l, o);
    }), a || s(!1, null);
  }, r);
}
function tc(t, e, n) {
  for (var i = [], r = e.length, s, a = e.length, o = 0; o < r; o++) {
    let f = e[o];
    zt(
      f,
      () => {
        if (s) {
          if (s.pending.delete(f), s.done.add(f), s.pending.size === 0) {
            var _ = (
              /** @type {Set<EachOutroGroup>} */
              t.outrogroups
            );
            bi(Dr(s.done)), _.delete(s), _.size === 0 && (t.outrogroups = null);
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
      var u = (
        /** @type {Element} */
        n
      ), c = (
        /** @type {Element} */
        u.parentNode
      );
      Ea(c), c.append(u), t.items.clear();
    }
    bi(e, !l);
  } else
    s = {
      pending: new Set(e),
      done: /* @__PURE__ */ new Set()
    }, (t.outrogroups ?? (t.outrogroups = /* @__PURE__ */ new Set())).add(s);
}
function bi(t, e = !0) {
  for (var n = 0; n < t.length; n++)
    re(t[n], e);
}
var _s;
function nc(t, e, n, i, r, s = null) {
  var a = t, o = /* @__PURE__ */ new Map();
  {
    var l = (
      /** @type {Element} */
      t
    );
    a = L ? ne(/* @__PURE__ */ Pe(l)) : l.appendChild(we());
  }
  L && En();
  var u = null, c = /* @__PURE__ */ Dl(() => {
    var d = n();
    return Ys(d) ? d : d == null ? [] : Dr(d);
  }), f, _ = !0;
  function w() {
    A.fallback = u, rc(A, f, a, e, i), u !== null && (f.length === 0 ? (u.f & mt) === 0 ? Mi(u) : (u.f ^= mt, Mn(u, null, a)) : zt(u, () => {
      u = null;
    }));
  }
  var g = Di(() => {
    f = /** @type {V[]} */
    p(c);
    var d = f.length;
    let v = !1;
    if (L) {
      var y = Zs(a) === Pr;
      y !== (d === 0) && (a = Sr(), ne(a), Le(!1), v = !0);
    }
    for (var b = /* @__PURE__ */ new Set(), S = (
      /** @type {Batch} */
      D
    ), T = $a(), C = 0; C < d; C += 1) {
      L && I.nodeType === Xt && /** @type {Comment} */
      I.data === Si && (a = /** @type {Comment} */
      I, v = !0, Le(!1));
      var k = f[C], F = i(k, C), H = _ ? null : o.get(F);
      H ? (H.v && On(H.v, k), H.i && On(H.i, C), T && S.unskip_effect(H.e)) : (H = ic(
        o,
        _ ? a : _s ?? (_s = we()),
        k,
        F,
        C,
        r,
        e,
        n
      ), _ || (H.e.f |= mt), o.set(F, H)), b.add(F);
    }
    if (d === 0 && s && !u && (_ ? u = ye(() => s(a)) : (u = ye(() => s(_s ?? (_s = we()))), u.f |= mt)), d > b.size && fl(), L && d > 0 && ne(Sr()), !_)
      if (T) {
        for (const [ar, Tn] of o)
          b.has(ar) || S.skip_effect(Tn.e);
        S.oncommit(w), S.ondiscard(() => {
        });
      } else
        w();
    v && Le(!0), p(c);
  }), A = { effect: g, items: o, outrogroups: null, fallback: u };
  _ = !1, L && (a = I);
}
function kn(t) {
  for (; t !== null && (t.f & He) === 0; )
    t = t.next;
  return t;
}
function rc(t, e, n, i, r) {
  var F;
  var s = e.length, a = t.items, o = kn(t.effect.first), l, u = null, c = [], f = [], _, w, g, A;
  for (A = 0; A < s; A += 1) {
    if (_ = e[A], w = r(_, A), g = /** @type {EachItem} */
    a.get(w).e, t.outrogroups !== null)
      for (const H of t.outrogroups)
        H.pending.delete(g), H.done.delete(g);
    if ((g.f & mt) !== 0)
      if (g.f ^= mt, g === o)
        Mn(g, null, n);
      else {
        var d = u ? u.next : o;
        g === t.effect.last && (t.effect.last = g.prev), g.prev && (g.prev.next = g.next), g.next && (g.next.prev = g.prev), ct(t, u, g), ct(t, g, d), Mn(g, d, n), u = g, c = [], f = [], o = kn(u.next);
        continue;
      }
    if ((g.f & de) !== 0 && Mi(g), g !== o) {
      if (l !== void 0 && l.has(g)) {
        if (c.length < f.length) {
          var v = f[0], y;
          u = v.prev;
          var b = c[0], S = c[c.length - 1];
          for (y = 0; y < c.length; y += 1)
            Mn(c[y], v, n);
          for (y = 0; y < f.length; y += 1)
            l.delete(f[y]);
          ct(t, b.prev, S.next), ct(t, u, b), ct(t, S, v), o = v, u = S, A -= 1, c = [], f = [];
        } else
          l.delete(g), Mn(g, o, n), ct(t, g.prev, g.next), ct(t, g, u === null ? t.effect.first : u.next), ct(t, u, g), u = g;
        continue;
      }
      for (c = [], f = []; o !== null && o !== g; )
        (l ?? (l = /* @__PURE__ */ new Set())).add(o), f.push(o), o = kn(o.next);
      if (o === null)
        continue;
    }
    (g.f & mt) === 0 && c.push(g), u = g, o = kn(g.next);
  }
  if (t.outrogroups !== null) {
    for (const H of t.outrogroups)
      H.pending.size === 0 && (bi(Dr(H.done)), (F = t.outrogroups) == null || F.delete(H));
    t.outrogroups.size === 0 && (t.outrogroups = null);
  }
  if (o !== null || l !== void 0) {
    var T = [];
    if (l !== void 0)
      for (g of l)
        (g.f & de) === 0 && T.push(g);
    for (; o !== null; )
      (o.f & de) === 0 && o !== t.fallback && T.push(o), o = kn(o.next);
    var C = T.length;
    if (C > 0) {
      var k = s === 0 ? n : null;
      tc(t, T, k);
    }
  }
}
function ic(t, e, n, i, r, s, a, o) {
  var l = (a & Ko) !== 0 ? (a & Xo) === 0 ? /* @__PURE__ */ ga(n, !1, !1) : Yt(n) : null, u = (a & Qo) !== 0 ? Yt(r) : null;
  return {
    v: l,
    i: u,
    e: ye(() => (s(e, l ?? n, u ?? r, o), () => {
      t.delete(i);
    }))
  };
}
function Mn(t, e, n) {
  if (t.nodes)
    for (var i = t.nodes.start, r = t.nodes.end, s = e && (e.f & mt) === 0 ? (
      /** @type {EffectNodes} */
      e.nodes.start
    ) : n; i !== null; ) {
      var a = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ je(i)
      );
      if (s.before(i), i === r)
        return;
      i = a;
    }
}
function ct(t, e, n) {
  e === null ? t.effect.first = n : e.next = n, n === null ? t.effect.last = e : n.prev = e;
}
function sc(t, e, n = !1, i = !1, r = !1) {
  var s = t, a = "";
  Je(() => {
    var o = (
      /** @type {Effect} */
      P
    );
    if (a === (a = e() ?? "")) {
      L && En();
      return;
    }
    if (o.nodes !== null && (Na(
      o.nodes.start,
      /** @type {TemplateNode} */
      o.nodes.end
    ), o.nodes = null), a !== "") {
      if (L) {
        I.data;
        for (var l = En(), u = l; l !== null && (l.nodeType !== Xt || /** @type {Comment} */
        l.data !== ""); )
          u = l, l = /* @__PURE__ */ je(l);
        if (l === null)
          throw tr(), Wt;
        Et(I, u), s = ne(l);
        return;
      }
      var c = a + "";
      n ? c = `<svg>${c}</svg>` : i && (c = `<math>${c}</math>`);
      var f = Ua(c);
      if ((n || i) && (f = /** @type {Element} */
      /* @__PURE__ */ Pe(f)), Et(
        /** @type {TemplateNode} */
        /* @__PURE__ */ Pe(f),
        /** @type {TemplateNode} */
        f.lastChild
      ), n || i)
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
function Va(t, e) {
  Sa(() => {
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
      const r = document.createElement("style");
      r.id = e.hash, r.textContent = e.code, i.appendChild(r);
    }
  });
}
function ac(t, e, n) {
  var i = t == null ? "" : "" + t;
  return e && (i = i ? i + " " + e : e), i === "" ? null : i;
}
function oc(t, e) {
  return t == null ? null : String(t);
}
function Se(t, e, n, i, r, s) {
  var a = t.__className;
  if (L || a !== n || a === void 0) {
    var o = ac(n, i);
    (!L || o !== t.getAttribute("class")) && (o == null ? t.removeAttribute("class") : t.className = o), t.__className = n;
  }
  return s;
}
function ht(t, e, n, i) {
  var r = t.__style;
  if (L || r !== e) {
    var s = oc(e);
    (!L || s !== t.getAttribute("style")) && (s == null ? t.removeAttribute("style") : t.style.cssText = s), t.__style = e;
  }
  return i;
}
const lc = Symbol("is custom element"), cc = Symbol("is html");
function Wa(t, e, n, i) {
  var r = uc(t);
  L && (r[e] = t.getAttribute(e), e === "src" || e === "srcset" || e === "href" && t.nodeName === "LINK") || r[e] !== (r[e] = n) && (e === "loading" && (t[cl] = n), n == null ? t.removeAttribute(e) : typeof n != "string" && Ya(t).includes(e) ? t[e] = n : t.setAttribute(e, n));
}
function gs(t, e, n) {
  var i = R, r = P;
  let s = L;
  L && Le(!1), oe(null), $e(null);
  try {
    // `style` should use `set_attribute` rather than the setter
    e !== "style" && // Don't compute setters for custom elements while they aren't registered yet,
    // because during their upgrade/instantiation they might add more setters.
    // Instead, fall back to a simple "an object, then set as property" heuristic.
    (wi.has(t.getAttribute("is") || t.nodeName) || // customElements may not be available in browser extension contexts
    !customElements || customElements.get(t.getAttribute("is") || t.tagName.toLowerCase()) ? Ya(t).includes(e) : n && typeof n == "object") ? t[e] = n : Wa(t, e, n == null ? n : String(n));
  } finally {
    oe(i), $e(r), s && Le(!0);
  }
}
function uc(t) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    t.__attributes ?? (t.__attributes = {
      [lc]: t.nodeName.includes("-"),
      [cc]: t.namespaceURI === tl
    })
  );
}
var wi = /* @__PURE__ */ new Map();
function Ya(t) {
  var e = t.getAttribute("is") || t.nodeName, n = wi.get(e);
  if (n) return n;
  wi.set(e, n = []);
  for (var i, r = t, s = Element.prototype; s !== r; ) {
    i = rl(r);
    for (var a in i)
      i[a].set && n.push(a);
    r = Js(r);
  }
  return n;
}
function ms(t, e) {
  return t === e || (t == null ? void 0 : t[pr]) === e;
}
function pt(t = {}, e, n, i) {
  return Sa(() => {
    var r, s;
    return Pi(() => {
      r = s, s = [], Ce(() => {
        t !== n(...s) && (e(t, ...s), r && ms(n(...r), t) && e(null, ...r));
      });
    }), () => {
      Gt(() => {
        s && ms(n(...s), t) && e(null, ...s);
      });
    };
  }), t;
}
function Te(t, e, n, i) {
  var r = (
    /** @type {V} */
    i
  ), s = !0, a = () => (s && (s = !1, r = /** @type {V} */
  i), r), o;
  o = /** @type {V} */
  t[e], o === void 0 && i !== void 0 && (o = a());
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
        return O(c, g), u = !0, r !== void 0 && (r = g), _;
      }
      return Ot && u || (f.f & it) !== 0 ? c.v : p(c);
    }
  );
}
function dc(t) {
  return new fc(t);
}
var tt, ge;
class fc {
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
    var n = /* @__PURE__ */ new Map(), i = (a, o) => {
      var l = /* @__PURE__ */ ga(o, !1, !1);
      return n.set(a, l), l;
    };
    const r = new Proxy(
      { ...e.props || {}, $$events: {} },
      {
        get(a, o) {
          return p(n.get(o) ?? i(o, Reflect.get(a, o)));
        },
        has(a, o) {
          return o === ll ? !0 : (p(n.get(o) ?? i(o, Reflect.get(a, o))), Reflect.has(a, o));
        },
        set(a, o, l) {
          return O(n.get(o) ?? i(o, l), l), Reflect.set(a, o, l);
        }
      }
    );
    x(this, ge, (e.hydrate ? Xl : Ga)(e.component, {
      target: e.target,
      anchor: e.anchor,
      props: r,
      context: e.context,
      intro: e.intro ?? !1,
      recover: e.recover
    })), (!((s = e == null ? void 0 : e.props) != null && s.$$host) || e.sync === !1) && me(), x(this, tt, r.$$events);
    for (const a of Object.keys(h(this, ge)))
      a === "$set" || a === "$destroy" || a === "$on" || Ar(this, a, {
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
      Object.assign(r, a);
    }, h(this, ge).$destroy = () => {
      Zl(h(this, ge));
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
    const i = (...r) => n.call(this, ...r);
    return h(this, tt)[e].push(i), () => {
      h(this, tt)[e] = h(this, tt)[e].filter(
        /** @param {any} fn */
        (r) => r !== i
      );
    };
  }
  $destroy() {
    h(this, ge).$destroy();
  }
}
tt = new WeakMap(), ge = new WeakMap();
let Ja;
typeof HTMLElement == "function" && (Ja = class extends HTMLElement {
  /**
   * @param {*} $$componentCtor
   * @param {*} $$slots
   * @param {ShadowRootInit | undefined} shadow_root_init
   */
  constructor(e, n, i) {
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
          const a = document.createElement("slot");
          r !== "default" && (a.name = r), ve(s, a);
        };
      };
      if (await Promise.resolve(), !this.$$cn || this.$$c)
        return;
      const n = {}, i = hc(this);
      for (const r of this.$$s)
        r in i && (r === "default" && !this.$$d.children ? (this.$$d.children = e(r), n.default = !0) : n[r] = e(r));
      for (const r of this.attributes) {
        const s = this.$$g_p(r.name);
        s in this.$$d || (this.$$d[s] = mr(s, r.value, this.$$p_d, "toProp"));
      }
      for (const r in this.$$p_d)
        !(r in this.$$d) && this[r] !== void 0 && (this.$$d[r] = this[r], delete this[r]);
      this.$$c = dc({
        component: this.$$ctor,
        target: this.$$shadowRoot || this,
        props: {
          ...this.$$d,
          $$slots: n,
          $$host: this
        }
      }), this.$$me = Ul(() => {
        Pi(() => {
          var r;
          this.$$r = !0;
          for (const s of $r(this.$$c)) {
            if (!((r = this.$$p_d[s]) != null && r.reflect)) continue;
            this.$$d[s] = this.$$c[s];
            const a = mr(
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
    this.$$r || (e = this.$$g_p(e), this.$$d[e] = mr(e, i, this.$$p_d, "toProp"), (r = this.$$c) == null || r.$set({ [e]: this.$$d[e] }));
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
    return $r(this.$$p_d).find(
      (n) => this.$$p_d[n].attribute === e || !this.$$p_d[n].attribute && n.toLowerCase() === e
    ) || e;
  }
});
function mr(t, e, n, i) {
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
function hc(t) {
  const e = {};
  return t.childNodes.forEach((n) => {
    e[
      /** @type {Element} node */
      n.slot || "default"
    ] = !0;
  }), e;
}
function Ka(t, e, n, i, r, s) {
  let a = class extends Ja {
    constructor() {
      super(t, n, r), this.$$p_d = e;
    }
    static get observedAttributes() {
      return $r(e).map(
        (o) => (e[o].attribute || o).toLowerCase()
      );
    }
  };
  return $r(e).forEach((o) => {
    Ar(a.prototype, o, {
      get() {
        return this.$$c && o in this.$$c ? this.$$c[o] : this.$$d[o];
      },
      set(l) {
        var f;
        l = mr(o, l, e), this.$$d[o] = l;
        var u = this.$$c;
        if (u) {
          var c = (f = dn(u, o)) == null ? void 0 : f.get;
          c ? u[o] = l : u.$set({ [o]: l });
        }
      }
    });
  }), i.forEach((o) => {
    Ar(a.prototype, o, {
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
const pc = (t, e) => {
  const n = new Promise((i, r) => {
    setTimeout(() => {
      r(new Hi(t));
    }, t);
  });
  return Promise.race([e, n]);
}, Qa = (t) => {
  if (typeof t.getCardSize == "function")
    try {
      return pc(500, t.getCardSize()).catch(
        () => 1
      );
    } catch {
      return 1;
    }
  return customElements.get(t.localName) ? 1 : customElements.whenDefined(t.localName).then(() => Qa(t));
};
var vc = /* @__PURE__ */ ot('<span class="loading svelte-lv9s7p">Loading...</span>'), _c = /* @__PURE__ */ ot("<div><!></div>");
const gc = {
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
function Ei(t, e) {
  Ni(e, !0), Va(t, gc);
  const n = Te(e, "config"), i = Te(e, "hass"), r = Te(e, "preview"), s = Te(e, "marginTop", 7, "0px"), a = Te(e, "open"), o = Te(e, "animation", 7, !0), l = Te(e, "animationState"), u = Te(e, "clearCardCss", 7, !1);
  let c = null, f = /* @__PURE__ */ M(null), _ = /* @__PURE__ */ M(!0), w = /* @__PURE__ */ M(0);
  const g = Ce(() => JSON.parse(JSON.stringify(n())));
  fn(() => {
    p(f) && (p(f).hass = i());
  }), fn(() => {
    p(f) && r() !== void 0 && (p(f).preview = r());
  }), fn(() => {
    var b;
    p(f) && (g.disabled = !a(), (b = p(f)._element) == null || b.dispatchEvent(new CustomEvent("card-visibility-changed", { detail: { value: a() }, bubbles: !0, composed: !1 })));
  }), Ba(async () => {
    const b = document.createElement("hui-card");
    b.hass = i(), b.preview = r(), g.disabled = !a(), b.config = g, b.load(), c == null || c.appendChild(b), O(f, b, !0), O(_, !1), p(f).addEventListener(
      "ll-upgrade",
      (S) => {
        var T;
        S.stopPropagation(), (T = p(f)) != null && T._element && i() && (p(f)._element.hass = i());
      },
      { capture: !0 }
    ), u() && (b.style.setProperty("--ha-card-background", "transparent"), b.style.setProperty("--ha-card-box-shadow", "none"), b.style.setProperty("--ha-card-border-color", "transparent"), b.style.setProperty("--ha-card-border-width", "0px"), b.style.setProperty("--ha-card-backdrop-filter", "none")), o() && (O(w, await Qa(b) * 56), c && O(w, p(w) + (window.getComputedStyle(c).marginTop ? parseFloat(window.getComputedStyle(c).marginTop) : 0)), new ResizeObserver((T) => {
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
      return i();
    },
    set hass(b) {
      i(b), me();
    },
    get preview() {
      return r();
    },
    set preview(b) {
      r(b), me();
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
  }, d = _c(), v = dt(d);
  {
    var y = (b) => {
      var S = vc();
      ve(b, S);
    };
    ft(v, (b) => {
      p(_) && b(y);
    });
  }
  return Ye(d), pt(d, (b) => c = b, () => c), Je(() => {
    Se(d, 1, `outer-container${a() ? " open" : " close"}${o() ? " animation " + l() : ""}`, "svelte-lv9s7p"), ht(d, `--child-card-margin-top: ${(a() ? s() : "0px") ?? ""};${p(w) ? ` --expander-animation-height: -${p(w)}px;` : ""}`);
  }), ve(t, d), Ci(A);
}
customElements.define("expander-sub-card", Ka(
  Ei,
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
const mc = (t, e) => {
  var n;
  (n = t.dispatchEvent) == null || n.call(
    t,
    new CustomEvent(
      "haptic",
      { detail: e, bubbles: !0, composed: !0 }
    )
  );
};
var rr = function(t, e, n) {
  var i;
  n === void 0 && (n = {});
  var r = n.retries, s = r === void 0 ? 10 : r, a = n.delay, o = a === void 0 ? 10 : a, l = n.shouldReject, u = l === void 0 || l, c = (i = n.rejectMessage) !== null && i !== void 0 ? i : "Could not get the result after {{ retries }} retries";
  return new Promise(function(f, _) {
    var w = 0, g = function() {
      var A = t();
      e(A) ? f(A) : ++w < s ? setTimeout(g, o) : u ? _(new Error(c.replace(/\{\{\s*retries\s*\}\}/g, "".concat(s)))) : f(A);
    };
    g();
  });
}, Tr = function() {
  return Tr = Object.assign || function(t) {
    for (var e, n = 1, i = arguments.length; n < i; n++) for (var r in e = arguments[n]) Object.prototype.hasOwnProperty.call(e, r) && (t[r] = e[r]);
    return t;
  }, Tr.apply(this, arguments);
};
function Jr(t, e, n) {
  if (arguments.length === 2) for (var i, r = 0, s = e.length; r < s; r++) !i && r in e || (i || (i = Array.prototype.slice.call(e, 0, r)), i[r] = e[r]);
  return t.concat(i || Array.prototype.slice.call(e));
}
var Nr, un, Re, vt, Kr = "[home-assistant-javascript-templates]", yc = /^([a-z_]+)\.(\w+)$/;
(function(t) {
  t.UNKNOWN = "unknown", t.UNAVAILABLE = "unavailable";
})(Nr || (Nr = {})), function(t) {
  t.AREA_ID = "area_id", t.NAME = "name";
}(un || (un = {})), function(t) {
  t.PANEL_URL = "panel_url", t.LANG = "lang";
}(Re || (Re = {})), function(t) {
  t.LOCATION_CHANGED = "location-changed", t.TRANSLATIONS_UPDATED = "translations-updated", t.POPSTATE = "popstate", t.SUBSCRIBE_EVENTS = "subscribe_events", t.STATE_CHANGE_EVENT = "state_changed";
}(vt || (vt = {}));
var ys = function(t) {
  return t.reduce(function(e, n) {
    var i = n[0], r = n[1];
    return e[i.replace(yc, "$2")] = r, e;
  }, {});
}, ut = function(t) {
  return t.includes(".");
}, yr = "ref", It = "value", bs = "toJSON", ws = function(t) {
  return "".concat(yr, ".").concat(t);
};
function bc(t, e, n) {
  var i = function() {
    return Object.entries(t.hass.areas);
  }, r = function() {
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
    throw SyntaxError("".concat(Kr, ": states method cannot be used with a domain, use it as an object instead."));
  }, { get: function(d, v) {
    if (ut(v)) return _(v), A(t.hass.states[v]);
    var y = Object.entries(t.hass.states).filter(function(b) {
      return b[0].startsWith(v);
    });
    return y.length || c(v), new Proxy(ys(y), { get: function(b, S) {
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
    return this.states(d) ? !(this.is_state(d, Nr.UNKNOWN) || this.is_state(d, Nr.UNAVAILABLE)) : (u(d), !1);
  }, entities: new Proxy(function(d) {
    if (d === void 0) return t.hass.entities;
    if (ut(d)) return _(d), t.hass.entities[d];
    var v = s().filter(function(y) {
      return y[0].startsWith(d);
    });
    return v.length || c(d), new Proxy(ys(v), { get: function(y, b) {
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
    if (ut(d)) throw SyntaxError("".concat(Kr, ": devices method cannot be used with an entity id, you should use a device id instead."));
    return t.hass.devices[d];
  }, { get: function(d, v) {
    if (ut(v)) throw SyntaxError("".concat(Kr, ": devices cannot be accesed using an entity id, you should use a device id instead."));
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
    var y = r().find(function(b) {
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
    return i().map(function(d) {
      return d[1].area_id;
    });
  }, area_id: function(d) {
    var v, y;
    if (d in t.hass.devices) return this.device_attr(d, un.AREA_ID);
    var b = (v = t.hass.entities[d]) === null || v === void 0 ? void 0 : v.device_id;
    if (b) return this.device_attr(b, un.AREA_ID);
    var S = i().find(function(T) {
      return T[1].name === d;
    });
    return (y = S == null ? void 0 : S[1]) === null || y === void 0 ? void 0 : y.area_id;
  }, area_name: function(d) {
    var v, y, b;
    d in t.hass.devices && (b = this.device_attr(d, un.AREA_ID));
    var S = (v = t.hass.entities[d]) === null || v === void 0 ? void 0 : v.device_id;
    S && (b = this.device_attr(S, un.AREA_ID));
    var T = i().find(function(C) {
      var k = C[1];
      return k.area_id === d || k.area_id === b;
    });
    return (y = T == null ? void 0 : T[1]) === null || y === void 0 ? void 0 : y.name;
  }, area_entities: function(d) {
    var v = i().find(function(y) {
      var b = y[1];
      return b.area_id === d || b.name === d;
    });
    return v ? s().filter(function(y) {
      return y[1].area_id === v[1].area_id;
    }).map(function(y) {
      return y[0];
    }) : [];
  }, area_devices: function(d) {
    var v = i().find(function(y) {
      var b = y[1];
      return b.area_id === d || b.name === d;
    });
    return v ? r().filter(function(y) {
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
    var S = ws(v);
    if (o.has(v)) return o.get(v);
    var T = new Proxy(((b = {})[It] = y, b[bs] = function() {
      return this[It];
    }, b), { get: function(C, k, F) {
      if (k === It || k === bs) return w(S), Reflect.get(C, k, F);
      f("".concat(k, " is not a valid ").concat(yr, " property. A ").concat(yr, ' only exposes a "').concat(It, '" property'));
    }, set: function(C, k, F) {
      if (k === It) {
        var H = C[It];
        return C[It] = F, d({ event_type: vt.STATE_CHANGE_EVENT, data: { entity_id: S, old_state: { state: JSON.stringify(H) }, new_state: { state: JSON.stringify(F) } } }), !0;
      }
      return f('property "'.concat(k, '" cannot be set in a ').concat(yr)), !1;
    } });
    return o.set(v, T), T;
  }, unref: function(d, v) {
    var y = ws(v);
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
var wc = function() {
  function t(e, n) {
    var i = n.throwErrors, r = i !== void 0 && i, s = n.throwWarnings, a = s === void 0 || s, o = n.variables, l = o === void 0 ? {} : o, u = n.refs, c = u === void 0 ? {} : u, f = n.refsVariableName, _ = f === void 0 ? "refs" : f, w = n.autoReturn, g = w === void 0 || w;
    this._throwErrors = r, this._throwWarnings = a, this._variables = l, this._refsVariableName = _, this._autoReturn = g, this._subscriptions = /* @__PURE__ */ new Map(), this._clientSideEntitiesRegExp = new RegExp("(^|[ \\?(+:\\{\\[><,])(".concat(Object.values(Re).join("|"), ")($|[ \\?)+:\\}\\]><.,])"), "gm"), this._scopped = bc(e, r, a), this.refs = c, this._watchForPanelUrlChange(), this._watchForEntitiesChange(), this._watchForLanguageChange();
  }
  return t.prototype._executeRenderingFunctions = function(e) {
    var n = this;
    this._subscriptions.get(e).forEach(function(i, r) {
      i.forEach(function(s, a) {
        n.trackTemplate(r, a, s);
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
      n.conn.subscribeMessage(function(i) {
        return e._entityWatchCallback(i);
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
  }, t.prototype._storeTracked = function(e, n, i) {
    var r = this;
    this._scopped.tracked.forEach(function(s) {
      var a = [n, i];
      if (r._subscriptions.has(s)) {
        var o = r._subscriptions.get(s);
        if (o.has(e)) {
          var l = o.get(e);
          l.has(n) || l.set.apply(l, a);
        } else o.set(e, new Map([a]));
      } else r._subscriptions.set(s, /* @__PURE__ */ new Map([[e, new Map([a])]]));
    });
  }, t.prototype._untrackTemplate = function(e, n) {
    var i = this;
    this._subscriptions.forEach(function(r, s) {
      if (r.has(e)) {
        var a = r.get(e);
        a.delete(n), a.size === 0 && (r.delete(e), r.size === 0 && i._subscriptions.delete(s));
      }
    });
  }, t.prototype.renderTemplate = function(e, n) {
    n === void 0 && (n = {});
    try {
      var i = n.variables, r = i === void 0 ? {} : i, s = n.refs, a = s === void 0 ? {} : s, o = new Map(Object.entries(Tr(Tr({}, this._variables), r))), l = e.trim().replace(this._clientSideEntitiesRegExp, "$1clientSide.$2$3"), u = l.includes("return") || !this._autoReturn ? l : "return ".concat(l);
      return new (Function.bind.apply(Function, Jr(Jr([void 0, "hass", "states", "state_translated", "is_state", "state_attr", "is_state_attr", "has_value", "entities", "entity_prop", "is_entity_prop", "devices", "device_attr", "is_device_attr", "device_id", "device_name", "areas", "area_id", "area_name", "area_entities", "area_devices", "user_name", "user_is_admin", "user_is_owner", "user_agent", "clientSide", "ref", "unref", this._refsVariableName], Array.from(o.keys()), !1), ["".concat('"use strict";', " ").concat(u)], !1)))().apply(void 0, Jr([this._scopped.hass, this._scopped.states, this._scopped.state_translated.bind(this._scopped), this._scopped.is_state.bind(this._scopped), this._scopped.state_attr.bind(this._scopped), this._scopped.is_state_attr.bind(this._scopped), this._scopped.has_value.bind(this._scopped), this._scopped.entities, this._scopped.entity_prop, this._scopped.is_entity_prop.bind(this._scopped), this._scopped.devices, this._scopped.device_attr.bind(this._scopped), this._scopped.is_device_attr.bind(this._scopped), this._scopped.device_id.bind(this._scopped), this._scopped.device_name.bind(this._scopped), this._scopped.areas.bind(this._scopped), this._scopped.area_id.bind(this._scopped), this._scopped.area_name.bind(this._scopped), this._scopped.area_entities.bind(this._scopped), this._scopped.area_devices.bind(this._scopped), this._scopped.user_name, this._scopped.user_is_admin, this._scopped.user_is_owner, this._scopped.user_agent, this._scopped.clientSideProxy, this._scopped.ref.bind(this._scopped, this._entityWatchCallback.bind(this)), this._scopped.unref.bind(this._scopped, this.cleanTracked.bind(this)), this._scopped.refs(this._entityWatchCallback.bind(this), this.cleanTracked.bind(this), a)], Array.from(o.values()), !1));
    } catch (c) {
      if (this._throwErrors) throw c;
      return void (this._throwWarnings && console.warn(c));
    }
  }, t.prototype.trackTemplate = function(e, n, i) {
    var r = this;
    i === void 0 && (i = {}), this._scopped.cleanTracked();
    var s = this.renderTemplate(e, i);
    return this._storeTracked(e, n, i), n(s), function() {
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
}(), Ec = function() {
  function t(e, n) {
    n === void 0 && (n = {}), this._renderer = rr(function() {
      return e.hass;
    }, function(i) {
      return !!(i && i.areas && i.devices && i.entities && i.states && i.user);
    }, { retries: 100, delay: 50, rejectMessage: "The provided element doesn't contain a proper or initialised hass object" }).then(function() {
      return new wc(e, n);
    });
  }
  return t.prototype.getRenderer = function() {
    return this._renderer;
  }, t;
}();
function $c(t = {}, e = {}) {
  return new Ec(
    document.querySelector("home-assistant"),
    {
      autoReturn: !1,
      variables: t,
      refs: e,
      refsVariableName: "variables"
    }
  ).getRenderer();
}
function br(t) {
  return !t || typeof t != "string" ? !1 : String(t).trim().startsWith("[[[") && String(t).trim().endsWith("]]]");
}
function Es(t, e, n, i = {}) {
  if (!br(n))
    throw new Error("Not a valid JS template");
  return n = String(n).trim().slice(3, -3), t.then((r) => r.trackTemplate(n, e, { variables: i }));
}
function $s(t, e, n) {
  t.then((i) => {
    i.refs[e] = n;
  });
}
function Ac(t, e) {
  t.then((n) => {
    const i = e.detail;
    Object.keys(i).forEach((r) => {
      const s = i[r].property, a = i[r].value, o = `${r}_${s}`;
      n.refs[o] = a;
    });
  });
}
function Oc(t, e) {
  const n = Ac.bind(null, t);
  return document.addEventListener(e, n), () => {
    document.removeEventListener(e, n);
  };
}
var Cr = function() {
  return Cr = Object.assign || function(t) {
    for (var e, n = 1, i = arguments.length; n < i; n++) for (var r in e = arguments[n]) Object.prototype.hasOwnProperty.call(e, r) && (t[r] = e[r]);
    return t;
  }, Cr.apply(this, arguments);
};
function Zt(t, e, n, i) {
  return new (n || (n = Promise))(function(r, s) {
    function a(u) {
      try {
        l(i.next(u));
      } catch (c) {
        s(c);
      }
    }
    function o(u) {
      try {
        l(i.throw(u));
      } catch (c) {
        s(c);
      }
    }
    function l(u) {
      var c;
      u.done ? r(u.value) : (c = u.value, c instanceof n ? c : new n(function(f) {
        f(c);
      })).then(a, o);
    }
    l((i = i.apply(t, [])).next());
  });
}
function en(t, e) {
  var n, i, r, s = { label: 0, sent: function() {
    if (1 & r[0]) throw r[1];
    return r[1];
  }, trys: [], ops: [] }, a = Object.create((typeof Iterator == "function" ? Iterator : Object).prototype);
  return a.next = o(0), a.throw = o(1), a.return = o(2), typeof Symbol == "function" && (a[Symbol.iterator] = function() {
    return this;
  }), a;
  function o(l) {
    return function(u) {
      return function(c) {
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
        } catch (f) {
          c = [6, f], i = 0;
        } finally {
          n = r = 0;
        }
        if (5 & c[0]) throw c[1];
        return { value: c[0] ? c[1] : void 0, done: !0 };
      }([l, u]);
    };
  }
}
var Jt = "$", Xa = ":host", ji = "invalid selector", St = 10, xt = 10, Fi = function(t) {
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
      return r.split(Jt).map(function(s) {
        return s.trim();
      });
    }(n);
    return e(i);
  });
}
function Za(t, e) {
  var n = e ? " If you want to select a shadowRoot, use ".concat(e, " instead.") : "";
  return "".concat(t, " cannot be used with a selector ending in a shadowRoot (").concat(Jt, ").").concat(n);
}
function an(t) {
  return t instanceof Promise ? t : Promise.resolve(t);
}
function eo() {
  return "You can not select a shadowRoot (".concat(Jt, ") of the document.");
}
function to() {
  return "You can not select a shadowRoot (".concat(Jt, ") of a shadowRoot.");
}
function Ui(t, e) {
  for (var n, i, r = null, s = t.length, a = 0; a < s; a++) {
    if (a === 0) if (t[a].length) r = e.querySelector(t[a]);
    else {
      if (e instanceof Document) throw new SyntaxError(eo());
      if (e instanceof ShadowRoot) throw new SyntaxError(to());
      r = ((n = e.shadowRoot) === null || n === void 0 ? void 0 : n.querySelector(t[++a])) || null;
    }
    else r = ((i = r.shadowRoot) === null || i === void 0 ? void 0 : i.querySelector("".concat(Xa, " ").concat(t[a]))) || null;
    if (r === null) return null;
  }
  return r;
}
function Sc(t, e) {
  var n, i = function(a, o, l) {
    for (var u, c = 0, f = o.length; c < f; c++) !u && c in o || (u || (u = Array.prototype.slice.call(o, 0, c)), u[c] = o[c]);
    return a.concat(u || Array.prototype.slice.call(o));
  }([], t), r = i.pop();
  if (!i.length) return e.querySelectorAll(r);
  var s = Ui(i, e);
  return ((n = s == null ? void 0 : s.shadowRoot) === null || n === void 0 ? void 0 : n.querySelectorAll("".concat(Xa, " ").concat(r))) || null;
}
function xc(t, e) {
  if (t.length === 1 && !t[0].length) {
    if (e instanceof Document) throw new SyntaxError(eo());
    if (e instanceof ShadowRoot) throw new SyntaxError(to());
    return e.shadowRoot;
  }
  var n = Ui(t, e);
  return (n == null ? void 0 : n.shadowRoot) || null;
}
function Tc(t, e, n, i) {
  for (var r = qi(t, function(l) {
    if (!l[l.length - 1].length) throw new SyntaxError(Za(n, i));
    return l;
  }), s = r.length, a = 0; a < s; a++) {
    var o = Ui(r[a], e);
    if (o) return o;
  }
  return null;
}
function Nc(t, e, n) {
  for (var i = qi(t, function(o) {
    if (!o[o.length - 1].length) throw new SyntaxError(Za(n));
    return o;
  }), r = i.length, s = 0; s < r; s++) {
    var a = Sc(i[s], e);
    if (a != null && a.length) return a;
  }
  return document.querySelectorAll(ji);
}
function Cc(t, e, n, i) {
  for (var r = qi(t, function(l) {
    if (l.pop().length) throw new SyntaxError(function(u, c) {
      return "".concat(u, " must be used with a selector ending in a shadowRoot (").concat(Jt, "). If you don't want to select a shadowRoot, use ").concat(c, " instead.");
    }(n, i));
    return l;
  }), s = r.length, a = 0; a < s; a++) {
    var o = xc(r[a], e);
    if (o) return o;
  }
  return null;
}
function As(t, e, n, i) {
  return Zt(this, void 0, void 0, function() {
    return en(this, function(r) {
      return [2, rr(function() {
        return Tc(t, e, "asyncQuerySelector", "asyncShadowRootQuerySelector");
      }, function(s) {
        return !!s;
      }, { retries: n, delay: i, shouldReject: !1 })];
    });
  });
}
function Os(t, e, n, i) {
  return Zt(this, void 0, void 0, function() {
    return en(this, function(r) {
      return [2, rr(function() {
        return Nc(t, e, "asyncQuerySelectorAll");
      }, function(s) {
        return !!s.length;
      }, { retries: n, delay: i, shouldReject: !1 })];
    });
  });
}
function Ss(t, e, n, i) {
  return Zt(this, void 0, void 0, function() {
    return en(this, function(r) {
      return [2, rr(function() {
        return Cc(t, e, "asyncShadowRootQuerySelector", "asyncQuerySelector");
      }, function(s) {
        return !!s;
      }, { retries: n, delay: i, shouldReject: !1 })];
    });
  });
}
var $i = function(t, e) {
  var n = t.querySelectorAll(e);
  if (n.length) return n;
  if (t instanceof Element && t.shadowRoot) {
    var i = $i(t.shadowRoot, e);
    if (i.length) return i;
  }
  for (var r = 0, s = Array.from(t.querySelectorAll("*")); r < s.length; r++) {
    var a = s[r], o = $i(a, e);
    if (o.length) return o;
  }
  return document.querySelectorAll(ji);
}, xs = function(t, e, n, i) {
  return rr(function() {
    return $i(t, e);
  }, function(r) {
    return !!r.length;
  }, { retries: n, delay: i, shouldReject: !1 });
};
function Ts() {
  for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
  return Zt(this, void 0, void 0, function() {
    var n, i, r, s, a;
    return en(this, function(o) {
      switch (o.label) {
        case 0:
          return Fi(t) ? (n = t[0], i = t[1], r = t[2], [4, As(i, n, (r == null ? void 0 : r.retries) || St, (r == null ? void 0 : r.delay) || xt)]) : [3, 2];
        case 1:
        case 3:
          return [2, o.sent()];
        case 2:
          return s = t[0], a = t[1], [4, As(s, document, (a == null ? void 0 : a.retries) || St, (a == null ? void 0 : a.delay) || xt)];
      }
    });
  });
}
function Ns() {
  for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
  return Zt(this, void 0, void 0, function() {
    var n, i, r, s, a;
    return en(this, function(o) {
      switch (o.label) {
        case 0:
          return Fi(t) ? (n = t[0], i = t[1], r = t[2], [4, Os(i, n, (r == null ? void 0 : r.retries) || St, (r == null ? void 0 : r.delay) || xt)]) : [3, 2];
        case 1:
          return [2, o.sent()];
        case 2:
          return s = t[0], a = t[1], [2, Os(s, document, (a == null ? void 0 : a.retries) || St, (a == null ? void 0 : a.delay) || xt)];
      }
    });
  });
}
function Cs() {
  for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
  return Zt(this, void 0, void 0, function() {
    var n, i, r, s, a;
    return en(this, function(o) {
      switch (o.label) {
        case 0:
          return Fi(t) ? (n = t[0], i = t[1], r = t[2], [4, Ss(i, n, (r == null ? void 0 : r.retries) || St, (r == null ? void 0 : r.delay) || xt)]) : [3, 2];
        case 1:
          return [2, o.sent()];
        case 2:
          return s = t[0], a = t[1], [2, Ss(s, document, (a == null ? void 0 : a.retries) || St, (a == null ? void 0 : a.delay) || xt)];
      }
    });
  });
}
var Rc = function() {
  function t(e, n) {
    e instanceof Node || e instanceof Promise ? (this._element = e, this._asyncParams = Cr({ retries: St, delay: xt }, n || {})) : (this._element = document, this._asyncParams = Cr({ retries: St, delay: xt }, e || {}));
  }
  return Object.defineProperty(t.prototype, "element", { get: function() {
    return an(this._element).then(function(e) {
      return e instanceof NodeList ? e[0] || null : e;
    });
  }, enumerable: !1, configurable: !0 }), Object.defineProperty(t.prototype, "$", { get: function() {
    var e = this;
    return new t(an(this._element).then(function(n) {
      return n instanceof Document || n instanceof ShadowRoot || n === null || n instanceof NodeList && n.length === 0 ? null : n instanceof NodeList ? Cs(n[0], Jt, e._asyncParams) : Cs(n, Jt, e._asyncParams);
    }), this._asyncParams);
  }, enumerable: !1, configurable: !0 }), Object.defineProperty(t.prototype, "all", { get: function() {
    return an(this._element).then(function(e) {
      return e instanceof NodeList ? e : document.querySelectorAll(ji);
    });
  }, enumerable: !1, configurable: !0 }), Object.defineProperty(t.prototype, "asyncParams", { get: function() {
    return this._asyncParams;
  }, enumerable: !1, configurable: !0 }), t.prototype.eq = function(e) {
    return Zt(this, void 0, void 0, function() {
      return en(this, function(n) {
        return [2, an(this._element).then(function(i) {
          return i instanceof NodeList && i[e] || null;
        })];
      });
    });
  }, t.prototype.query = function(e) {
    var n = this;
    return new t(an(this._element).then(function(i) {
      return i === null || i instanceof NodeList && i.length === 0 ? null : i instanceof NodeList ? Ns(i[0], e, n._asyncParams) : Ns(i, e, n._asyncParams);
    }), this._asyncParams);
  }, t.prototype.deepQuery = function(e) {
    var n = this;
    return new t(an(this._element).then(function(i) {
      return i === null || i instanceof NodeList && i.length === 0 ? null : i instanceof NodeList ? Promise.race(Array.from(i).map(function(r) {
        return xs(r, e, n._asyncParams.retries, n._asyncParams.delay);
      })) : xs(i, e, n._asyncParams.retries, n._asyncParams.delay);
    }), this._asyncParams);
  }, t;
}(), Ai = function(t, e) {
  return Ai = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(n, i) {
    n.__proto__ = i;
  } || function(n, i) {
    for (var r in i) Object.prototype.hasOwnProperty.call(i, r) && (n[r] = i[r]);
  }, Ai(t, e);
}, rt = function() {
  return rt = Object.assign || function(t) {
    for (var e, n = 1, i = arguments.length; n < i; n++) for (var r in e = arguments[n]) Object.prototype.hasOwnProperty.call(e, r) && (t[r] = e[r]);
    return t;
  }, rt.apply(this, arguments);
};
var Ie, yt, B, Ke, Rs, Qr, Xr, ur, Is, Zr, dr, ei, ti, ni, Pn, j, $t = "$", Ic = { retries: 100, delay: 50, eventThreshold: 450 };
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
var Lc = ((Rs = {})[Ie.HOME_ASSISTANT] = { selector: j.HOME_ASSISTANT, children: { shadowRoot: { selector: $t, children: (Qr = {}, Qr[Ie.HOME_ASSISTANT_MAIN] = { selector: j.HOME_ASSISTANT_MAIN, children: { shadowRoot: { selector: $t, children: (Xr = {}, Xr[Ie.HA_DRAWER] = { selector: j.HA_DRAWER, children: (ur = {}, ur[Ie.HA_SIDEBAR] = { selector: j.HA_SIDEBAR, children: { shadowRoot: { selector: $t } } }, ur[Ie.PARTIAL_PANEL_RESOLVER] = { selector: j.PARTIAL_PANEL_RESOLVER }, ur) }, Xr) } } }, Qr) } } }, Rs), kc = ((Is = {})[yt.HA_PANEL_LOVELACE] = { selector: j.HA_PANEL_LOVELACE, children: { shadowRoot: { selector: $t, children: (Zr = {}, Zr[yt.HUI_ROOT] = { selector: j.HUI_ROOT, children: { shadowRoot: { selector: $t, children: (dr = {}, dr[yt.HEADER] = { selector: j.HEADER }, dr[yt.HUI_VIEW] = { selector: j.HUI_VIEW }, dr) } } }, Zr) } } }, Is), Pc = { shadowRoot: { selector: $t, children: (ei = {}, ei[B.HA_MORE_INFO_DIALOG] = { selector: j.HA_MORE_INFO_DIALOG, children: { shadowRoot: { selector: $t, children: (ti = {}, ti[B.HA_DIALOG] = { selector: j.HA_DIALOG, children: (ni = {}, ni[B.HA_DIALOG_CONTENT] = { selector: j.HA_DIALOG_CONTENT, children: (Pn = {}, Pn[B.HA_MORE_INFO_DIALOG_INFO] = { selector: j.HA_MORE_INFO_DIALOG_INFO }, Pn[B.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK] = { selector: j.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK }, Pn[B.HA_DIALOG_MORE_INFO_SETTINGS] = { selector: j.HA_DIALOG_MORE_INFO_SETTINGS }, Pn) }, ni) }, ti) } } }, ei) } }, qn = function(t, e, n, i) {
  return n === void 0 && (n = null), i === void 0 && (i = !1), Object.entries(e || {}).reduce(function(r, s) {
    var a = s[0], o = s[1];
    if (o.selector === $t && n) return o.children ? rt(rt({}, r), qn(t, o.children, n, !0)) : r;
    var l = n ? n.then(function(u) {
      return u ? Ts(u, (c = o.selector, i ? "$ " + c : c), t) : null;
      var c;
    }) : Ts(o.selector, t);
    return r[a] = { element: l, children: qn(t, o.children, l), selector: new Rc(l, t) }, r;
  }, {});
}, no = function(t, e) {
  for (var n = 0, i = Object.entries(e); n < i.length; n++) {
    var r = i[n];
    if (r[0] === t) return r[1];
    var s = no(t, r[1].children);
    if (s) return s;
  }
}, ri = function(t, e) {
  return Object.keys(t).reduce(function(n, i) {
    var r = no(i, e);
    r.children;
    var s = function(a, o) {
      var l = {};
      for (var u in a) Object.prototype.hasOwnProperty.call(a, u) && o.indexOf(u) < 0 && (l[u] = a[u]);
      if (a != null && typeof Object.getOwnPropertySymbols == "function") {
        var c = 0;
        for (u = Object.getOwnPropertySymbols(a); c < u.length; c++) o.indexOf(u[c]) < 0 && Object.prototype.propertyIsEnumerable.call(a, u[c]) && (l[u[c]] = a[u[c]]);
      }
      return l;
    }(r, ["children"]);
    return n[i] = rt({}, s), n;
  }, {});
}, Dc = function() {
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
}(), Mc = function(t) {
  function e(n) {
    n === void 0 && (n = {});
    var i = t.call(this) || this;
    return i._config = rt(rt({}, Ic), n), i._timestaps = {}, i;
  }
  return function(n, i) {
    if (typeof i != "function" && i !== null) throw new TypeError("Class extends value " + String(i) + " is not a constructor or null");
    function r() {
      this.constructor = n;
    }
    Ai(n, i), n.prototype = i === null ? Object.create(i) : (r.prototype = i.prototype, new r());
  }(e, t), e.prototype._dispatchEvent = function(n, i) {
    var r = Date.now();
    r - this._timestaps[n] < this._config.eventThreshold || (this._timestaps[n] = r, this.dispatchEvent(new CustomEvent(n, { detail: i })));
  }, e.prototype._updateDialogElements = function(n) {
    var i, r = this;
    n === void 0 && (n = B.HA_MORE_INFO_DIALOG_INFO), this._dialogTree = qn(this._config, Pc, this._haRootElements.HOME_ASSISTANT.element);
    var s = ri(B, this._dialogTree);
    s.HA_DIALOG_CONTENT.element.then(function(o) {
      r._dialogsContentObserver.disconnect(), r._dialogsContentObserver.observe(o, { childList: !0 });
    }), this._haDialogElements = function(o, l) {
      return [B.HA_MORE_INFO_DIALOG, B.HA_DIALOG, B.HA_DIALOG_CONTENT, l].reduce(function(u, c) {
        return u[c] = o[c], u;
      }, {});
    }(s, n);
    var a = ((i = {})[B.HA_MORE_INFO_DIALOG_INFO] = Ke.ON_MORE_INFO_DIALOG_OPEN, i[B.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK] = Ke.ON_HISTORY_AND_LOGBOOK_DIALOG_OPEN, i[B.HA_DIALOG_MORE_INFO_SETTINGS] = Ke.ON_SETTINGS_DIALOG_OPEN, i);
    this._dispatchEvent(a[n], this._haDialogElements);
  }, e.prototype._updateRootElements = function() {
    var n = this;
    this._homeAssistantRootTree = qn(this._config, Lc), this._haRootElements = ri(Ie, this._homeAssistantRootTree), this._haRootElements[Ie.HOME_ASSISTANT].selector.$.element.then(function(i) {
      n._dialogsObserver.disconnect(), n._dialogsObserver.observe(i, { childList: !0 });
    }), this._haRootElements[Ie.PARTIAL_PANEL_RESOLVER].element.then(function(i) {
      n._panelResolverObserver.disconnect(), i && n._panelResolverObserver.observe(i, { subtree: !0, childList: !0 });
    }), this._dispatchEvent(Ke.ON_LISTEN, this._haRootElements), this._dispatchEvent(Ke.ON_PANEL_LOAD, this._haRootElements);
  }, e.prototype._updateLovelaceElements = function() {
    var n = this;
    this._homeAssistantResolverTree = qn(this._config, kc, this._haRootElements[Ie.HA_DRAWER].element), this._haResolverElements = ri(yt, this._homeAssistantResolverTree), this._haResolverElements[yt.HA_PANEL_LOVELACE].element.then(function(i) {
      n._lovelaceObserver.disconnect(), i && (n._lovelaceObserver.observe(i.shadowRoot, { childList: !0 }), n._dispatchEvent(Ke.ON_LOVELACE_PANEL_LOAD, rt(rt({}, n._haRootElements), n._haResolverElements)));
    });
  }, e.prototype._watchDialogs = function(n) {
    var i = this;
    n.forEach(function(r) {
      r.addedNodes.forEach(function(s) {
        s.localName === j.HA_MORE_INFO_DIALOG && i._updateDialogElements();
      });
    });
  }, e.prototype._watchDialogsContent = function(n) {
    var i = this;
    n.forEach(function(r) {
      r.addedNodes.forEach(function(s) {
        var a, o = ((a = {})[j.HA_MORE_INFO_DIALOG_INFO] = B.HA_MORE_INFO_DIALOG_INFO, a[j.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK] = B.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK, a[j.HA_DIALOG_MORE_INFO_SETTINGS] = B.HA_DIALOG_MORE_INFO_SETTINGS, a);
        if (s.localName && s.localName in o) {
          var l = s.localName;
          i._updateDialogElements(o[l]);
        }
      });
    });
  }, e.prototype._watchDashboards = function(n) {
    var i = this;
    n.forEach(function(r) {
      r.addedNodes.forEach(function(s) {
        i._dispatchEvent(Ke.ON_PANEL_LOAD, i._haRootElements), s.localName === j.HA_PANEL_LOVELACE && i._updateLovelaceElements();
      });
    });
  }, e.prototype._watchLovelace = function(n) {
    var i = this;
    n.forEach(function(r) {
      r.addedNodes.forEach(function(s) {
        s.localName === j.HUI_ROOT && i._updateLovelaceElements();
      });
    });
  }, e.prototype.listen = function() {
    this._watchDialogsBinded = this._watchDialogs.bind(this), this._watchDialogsContentBinded = this._watchDialogsContent.bind(this), this._watchDashboardsBinded = this._watchDashboards.bind(this), this._watchLovelaceBinded = this._watchLovelace.bind(this), this._dialogsObserver = new MutationObserver(this._watchDialogsBinded), this._dialogsContentObserver = new MutationObserver(this._watchDialogsContentBinded), this._panelResolverObserver = new MutationObserver(this._watchDashboardsBinded), this._lovelaceObserver = new MutationObserver(this._watchLovelaceBinded), this._updateRootElements(), this._updateLovelaceElements();
  }, e.prototype.addEventListener = function(n, i, r) {
    t.prototype.addEventListener.call(this, n, i, r);
  }, e;
}(Dc);
const ro = new Mc();
let wr = {};
ro.addEventListener("onLovelacePanelLoad", ({ detail: t }) => {
  t.HUI_ROOT.element.then((e) => {
    const n = e == null ? void 0 : e.lovelace;
    n != null && n.config && (wr = n.config["expander-card"] || {});
  }).catch(() => {
    wr = {};
  }).finally(() => {
    document.body.dispatchEvent(new CustomEvent("expander-card-raw-config-updated", {
      detail: { rawConfig: wr },
      bubbles: !0,
      composed: !0
    }));
  });
});
ro.listen();
const Hc = () => wr, Ls = (t) => t ? typeof t == "string" ? t : Object.entries(t).map(([e, n]) => {
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
var jc = /* @__PURE__ */ ot("<ha-ripple></ha-ripple>", 2), Fc = /* @__PURE__ */ ot('<button aria-label="Toggle button"><ha-icon></ha-icon> <!></button>', 2), qc = /* @__PURE__ */ ot("<ha-ripple></ha-ripple>", 2), Uc = /* @__PURE__ */ ot('<div id="id1"><div id="id2"><!></div> <!> <!></div>'), Gc = /* @__PURE__ */ ot("<button><div> </div> <ha-icon></ha-icon> <ha-ripple></ha-ripple></button>", 2), zc = /* @__PURE__ */ ot("<div><div></div></div>"), Bc = /* @__PURE__ */ ot("<ha-card><!> <!> <!></ha-card>", 2);
const Vc = {
  hash: "svelte-1jqiztq",
  code: `.expander-card.svelte-1jqiztq {display:var(--expander-card-display,block);gap:var(--gap);padding:var(--padding);background:var(--card-background,#fff);-webkit-tap-highlight-color:transparent;}.expander-card.animation.svelte-1jqiztq {transition:gap 0.35s ease, background-color var(--background-animation-duration, 0) ease;}.children-wrapper.svelte-1jqiztq {display:flex;flex-direction:column;}.children-wrapper.animation.opening.svelte-1jqiztq,
    .children-wrapper.animation.closing.svelte-1jqiztq {overflow:hidden;}.children-container.animation.svelte-1jqiztq {transition:padding 0.35s ease, gap 0.35s ease;}.children-container.svelte-1jqiztq {padding:var(--child-padding);display:var(--expander-card-display,block);gap:var(--gap);}.clear.svelte-1jqiztq {background:none !important;background-color:transparent !important;border-style:none !important;box-shadow:none !important;}.title-card-header.svelte-1jqiztq {display:flex;align-items:center;justify-content:space-between;flex-direction:row;position:relative;}.title-card-header.clickable.svelte-1jqiztq {cursor:pointer;border-style:none;border-radius:var(--ha-card-border-radius, var(--ha-border-radius-lg));}.title-card-header-overlay.svelte-1jqiztq {display:block;}.title-card-container.svelte-1jqiztq {width:100%;padding:var(--title-padding);}.header.svelte-1jqiztq {display:flex;flex-direction:row;align-items:center;padding:0.85em 0.85em;background:var(--button-background);border-style:none;border-radius:var(--ha-card-border-radius, var(--ha-border-radius-lg));width:var(--header-width,auto);color:var(--header-color,#fff);cursor:pointer;position:relative;font-family:var(--ha-font-family-body);font-size:var(--ha-font-size-m);}.header-overlay.svelte-1jqiztq {position:absolute;top:0;right:0;margin:var(--overlay-margin);height:var(--expander-card-overlay-height, auto);z-index:1;}.title-card-header-overlay.clickable.svelte-1jqiztq  > .header-overlay:where(.svelte-1jqiztq) {width:calc(100% - var(--overlay-margin) * 2);justify-content:flex-end;}.title-card-header-overlay.clickable.svelte-1jqiztq > .title-card-container:where(.svelte-1jqiztq) {width:calc(100% - var(--overlay-margin) * 2);}.title.svelte-1jqiztq {width:100%;text-align:left;}.ico.animation.svelte-1jqiztq {transition-property:transform;transition-duration:0.35s;}.ico.svelte-1jqiztq {color:var(--arrow-color,var(--primary-text-color,#fff));}.flipped.svelte-1jqiztq {transform:rotate(var(--icon-rotate-degree,180deg));}`
};
function Wc(t, e) {
  Ni(e, !0), Va(t, Vc);
  const n = Te(e, "hass"), i = Te(e, "preview"), r = Te(e, "config", 7, Oi);
  let s = /* @__PURE__ */ M(!1), a = /* @__PURE__ */ M(null), o = /* @__PURE__ */ M(nt(!!Ce(() => i()))), l = /* @__PURE__ */ M(nt(!!Ce(() => i()))), u = /* @__PURE__ */ M(!0), c = /* @__PURE__ */ M("idle"), f = /* @__PURE__ */ M(null), _ = /* @__PURE__ */ M(0), w = /* @__PURE__ */ M(0), g = /* @__PURE__ */ M(null), A = /* @__PURE__ */ M(null), d = /* @__PURE__ */ M(null), v = /* @__PURE__ */ M(null);
  const y = {}, b = {}, S = {}, T = /* @__PURE__ */ M(nt({}));
  let C = /* @__PURE__ */ M(nt(Hc()));
  const k = /* @__PURE__ */ Ln(() => {
    const m = p(T).style, E = r().style;
    let $ = null;
    return m !== void 0 ? $ = typeof m == "string" ? m : typeof m == "object" && m !== null ? Ls(m) : String(m) : E && ($ = Ls(E)), $ ? `<style>${$}</style>` : null;
  }), F = /* @__PURE__ */ Ln(() => p(T).icon !== void 0 ? String(p(T).icon) : r().icon), H = /* @__PURE__ */ Ln(() => p(T).title !== void 0 ? String(p(T).title) : r().title), ar = /* @__PURE__ */ Ln(() => p(T)["arrow-color"] !== void 0 ? String(p(T)["arrow-color"]) : r()["arrow-color"]), Tn = Ce(() => r()["storage-id"]), Ji = "expander-open-" + Tn;
  O(u, Ce(() => i() || (Br(r()["show-button-users"]) ?? !0)), !0), fn(() => {
    if (p(T).expanded === void 0 || Ce(() => i() && p(C)["preview-expanded"] !== !1))
      return;
    const m = !!p(T).expanded;
    queueMicrotask(() => {
      m !== p(o) && Nt(m);
    });
  }), fn(() => {
    if (!(i() === p(l) || i() === void 0)) {
      if (O(l, i(), !0), p(l) && p(C)["preview-expanded"] !== !1) {
        Nn(!0), O(u, !0);
        return;
      }
      if (O(u, Br(r()["show-button-users"]) ?? !0, !0), or("expanded")) {
        const m = Ce(() => p(T).expanded);
        m !== void 0 && Nt(!!m);
        return;
      }
      Ki();
    }
  });
  function or(m) {
    const E = r().templates && Array.isArray(r().templates) ? r().templates.find(($) => $.template === m) : void 0;
    if (E && br(E.value_template))
      return E;
  }
  function zr(m) {
    if (!r()["expander-card-id"])
      return;
    const E = {};
    E[r()["expander-card-id"]] = { property: "open", value: m }, document.dispatchEvent(new CustomEvent("expander-card", { detail: E, bubbles: !0, composed: !0 }));
  }
  function Br(m) {
    var E, $, Y, Ae;
    if (m !== void 0)
      return (($ = (E = n()) == null ? void 0 : E.user) == null ? void 0 : $.name) !== void 0 && m.includes((Ae = (Y = n()) == null ? void 0 : Y.user) == null ? void 0 : Ae.name);
  }
  function Ki() {
    if (!or("expanded")) {
      if (Br(r()["start-expanded-users"])) {
        lt(!0);
        return;
      }
      if (Tn === void 0) {
        Qi();
        return;
      }
      try {
        const m = localStorage.getItem(Ji);
        if (m === null) {
          Qi();
          return;
        }
        const E = m ? m === "true" : p(o);
        lt(E);
      } catch (m) {
        console.error(m), lt(!1);
      }
    }
  }
  function Qi() {
    if (r().expanded !== void 0) {
      lt(r().expanded);
      return;
    }
    lt(!1);
  }
  function Nt(m) {
    p(f) && (clearTimeout(p(f)), O(f, null));
    const E = m !== void 0 ? m : !p(o);
    if (!r().animation) {
      lt(E);
      return;
    }
    if (zr(E), O(c, E ? "opening" : "closing", !0), E) {
      Nn(!0), O(
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
          Nn(!1), O(c, "idle"), O(f, null);
        },
        350
      ),
      !0
    );
  }
  function lt(m) {
    Nn(m), zr(m);
  }
  function Nn(m) {
    if (O(o, m, !0), !i() && Tn !== void 0)
      try {
        localStorage.setItem(Ji, p(o) ? "true" : "false");
      } catch (E) {
        console.error(E);
      }
    p(o) && p(_) === 0 && O(_, 0.35);
  }
  function Xi(m) {
    var $;
    const E = ($ = m.detail) == null ? void 0 : $.rawConfig;
    E && JSON.stringify(E) !== JSON.stringify(p(C)) && O(C, E, !0);
  }
  function Zi(m) {
    var $, Y;
    const E = (Y = ($ = m.detail) == null ? void 0 : $["expander-card"]) == null ? void 0 : Y.data;
    if (E != null && E["expander-card-id"] && E["expander-card-id"] === r()["expander-card-id"]) {
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
  function uo() {
    document.body.removeEventListener("ll-custom", Zi), document.body.removeEventListener("expander-card-raw-config-updated", Xi), Object.entries(S).forEach(([m, E]) => {
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
  const es = (m) => {
    r().haptic && r().haptic !== "none" && mc(m, r().haptic);
  };
  let Cn, Rn = !1, ts = 0, ns = 0;
  const fo = (m) => {
    p(v) && (p(v).disabled = !0), Cn = m.target, ts = m.touches[0].clientX, ns = m.touches[0].clientY, Rn = !1;
  }, ho = (m) => {
    const E = m.touches[0].clientX, $ = m.touches[0].clientY;
    Rn = Math.abs(E - ts) > 10 || Math.abs($ - ns) > 10;
  }, po = () => {
    p(v) && (p(v).disabled = !1), Cn = void 0, Rn = !1;
  }, vo = () => {
    p(v) && (p(v).disabled = !1);
  }, _o = (m) => {
    !Rn && Cn === m.target && r()["title-card-clickable"] && (es(Cn), Nt(), O(s, !0), O(
      a,
      window.setTimeout(
        () => {
          O(s, !1), O(a, null);
        },
        100
      ),
      !0
    ), p(v) && (p(v).startPressAnimation(), p(v).endPressAnimation())), Cn = void 0, Rn = !1;
  }, go = (m) => {
    for (const E of Object.values(r().variables ?? {}))
      br(E.value_template) ? b[E.variable] = Es(
        m,
        ($) => {
          $s(m, E.variable, $);
        },
        E.value_template,
        { config: r() }
      ) : $s(m, E.variable, E.value_template);
  }, mo = (m) => {
    y["expander-card"] = Oc(m, "expander-card");
  }, yo = () => {
    if (!r().templates) return;
    const m = Object.values(r().variables || {}).reduce(
      ($, Y) => ($[Y.variable] = void 0, $),
      {}
    ), E = $c({ config: r(), expanderCard: {} }, m);
    go(E), mo(E), Object.values(r().templates || {}).forEach(($) => {
      br($.value_template) ? S[$.template] = Es(
        E,
        (Y) => {
          p(T)[$.template] = Y;
        },
        $.value_template,
        { config: r() }
      ) : p(T)[$.template] = $.value_template;
    });
  };
  function bo() {
    if (or("expanded"))
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
  function wo() {
    if (i() && p(C)["preview-expanded"] !== !1) {
      Nn(!0);
      return;
    }
    if (or("expanded")) {
      const m = Ce(() => p(T).expanded);
      lt(m !== void 0 ? !!m : !1);
    } else
      Ki();
  }
  function Eo() {
    if (r()["title-card-clickable"] && !r()["title-card-button-overlay"] && p(A))
      return p(A);
    if (p(d))
      return p(d);
  }
  Ba(() => {
    yo(), zr(!1), bo(), wo(), document.body.addEventListener("ll-custom", Zi), document.body.addEventListener("expander-card-raw-config-updated", Xi);
    const m = Eo();
    return m && (m.addEventListener("touchstart", fo, { passive: !0, capture: !0 }), m.addEventListener("touchmove", ho, { passive: !0, capture: !0 }), m.addEventListener("touchcancel", po, { passive: !0, capture: !0 }), m.addEventListener("touchend", vo, { passive: !0, capture: !0 }), m.addEventListener("touchend", _o, { passive: !1, capture: !1 })), r()["title-card-clickable"] && r()["title-card-button-overlay"] && p(A) && new ResizeObserver(() => {
      if (p(d) && p(A) && p(g)) {
        const $ = p(A).getBoundingClientRect();
        O(w, $.height - parseFloat(getComputedStyle(p(d)).marginTop) - parseFloat(getComputedStyle(p(d)).marginBottom) + parseFloat(getComputedStyle(p(g)).paddingTop) + parseFloat(getComputedStyle(p(g)).paddingBottom));
      }
    }).observe(p(A)), uo;
  });
  const Vr = (m) => {
    if (!p(s)) {
      es(m.currentTarget), Nt();
      return;
    }
    return m.preventDefault(), m.stopImmediatePropagation(), O(s, !1), p(a) && (clearTimeout(p(a)), O(a, null)), !1;
  };
  var $o = {
    get hass() {
      return n();
    },
    set hass(m) {
      n(m), me();
    },
    get preview() {
      return i();
    },
    set preview(m) {
      i(m), me();
    },
    get config() {
      return r();
    },
    set config(m = Oi) {
      r(m), me();
    }
  }, tn = Bc(), rs = dt(tn);
  {
    var Ao = (m) => {
      var E = Uc();
      E.__click = function(...ee) {
        var te;
        (te = r()["title-card-clickable"] && !r()["title-card-button-overlay"] ? Vr : null) == null || te.apply(this, ee);
      };
      var $ = dt(E), Y = dt($);
      Ei(Y, {
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
      }), Ye($);
      var Ae = Rt($, 2);
      {
        var Oe = (ee) => {
          var te = Fc();
          te.__click = function(...Ct) {
            var In;
            (In = !r()["title-card-clickable"] || r()["title-card-button-overlay"] ? Vr : null) == null || In.apply(this, Ct);
          };
          var Fe = dt(te);
          Je(() => gs(Fe, "icon", p(F)));
          var No = Rt(Fe, 2);
          {
            var Co = (Ct) => {
              var In = jc();
              pt(In, (Ro) => O(v, Ro), () => p(v)), ve(Ct, In);
            };
            ft(No, (Ct) => {
              (!r()["title-card-clickable"] || r()["title-card-button-overlay"]) && Ct(Co);
            });
          }
          Ye(te), pt(te, (Ct) => O(d, Ct), () => p(d)), Je(() => {
            ht(te, `--overlay-margin:${r()["overlay-margin"] ?? ""}; --button-background:${r()["button-background"] ?? ""}; --header-color:${r()["header-color"] ?? ""};`), Se(te, 1, `header ${r()["title-card-button-overlay"] ? " header-overlay" : ""}${p(o) ? " open" : " close"}${r().animation ? " animation " + p(c) : ""}`, "svelte-1jqiztq"), ht(Fe, `--arrow-color:${p(ar) ?? ""}`), Se(Fe, 1, `ico${p(o) && p(c) !== "closing" ? " flipped open" : " close"}${r().animation ? " animation " + p(c) : ""}`, "svelte-1jqiztq");
          }), ve(ee, te);
        };
        ft(Ae, (ee) => {
          p(u) && ee(Oe);
        });
      }
      var nn = Rt(Ae, 2);
      {
        var Wr = (ee) => {
          var te = qc();
          pt(te, (Fe) => O(v, Fe), () => p(v)), ve(ee, te);
        };
        ft(nn, (ee) => {
          r()["title-card-clickable"] && !r()["title-card-button-overlay"] && ee(Wr);
        });
      }
      Ye(E), pt(E, (ee) => O(A, ee), () => p(A)), Je(() => {
        Se(E, 1, `title-card-header${r()["title-card-button-overlay"] ? "-overlay" : ""}${p(o) ? " open" : " close"}${r().animation ? " animation " + p(c) : ""}${r()["title-card-clickable"] ? " clickable" : ""}`, "svelte-1jqiztq"), Wa(E, "role", r()["title-card-clickable"] && !r()["title-card-button-overlay"] ? "button" : void 0), Se($, 1, `title-card-container${p(o) ? " open" : " close"}${r().animation ? " animation " + p(c) : ""}`, "svelte-1jqiztq"), ht($, `--title-padding:${(r()["title-card-padding"] ? r()["title-card-padding"] : "0px") ?? ""};`);
      }), ve(m, E);
    }, Oo = (m) => {
      var E = vs(), $ = ds(E);
      {
        var Y = (Ae) => {
          var Oe = Gc();
          Oe.__click = Vr;
          var nn = dt(Oe), Wr = dt(nn, !0);
          Ye(nn);
          var ee = Rt(nn, 2);
          Je(() => gs(ee, "icon", p(F)));
          var te = Rt(ee, 2);
          pt(te, (Fe) => O(v, Fe), () => p(v)), Ye(Oe), pt(Oe, (Fe) => O(d, Fe), () => p(d)), Je(() => {
            Se(Oe, 1, `header${p(o) ? " open" : " close"}${r().animation ? " animation " + p(c) : ""}`, "svelte-1jqiztq"), ht(Oe, `--header-width:100%; --button-background:${r()["button-background"] ?? ""};--header-color:${r()["header-color"] ?? ""};`), Se(nn, 1, `primary title${p(o) ? " open" : " close"}`, "svelte-1jqiztq"), Ql(Wr, p(H)), ht(ee, `--arrow-color:${p(ar) ?? ""}`), Se(ee, 1, `ico${p(o) && p(c) !== "closing" ? " flipped open" : " close"}${r().animation ? " animation " + p(c) : ""}`, "svelte-1jqiztq");
          }), ve(Ae, Oe);
        };
        ft($, (Ae) => {
          p(u) && Ae(Y);
        });
      }
      ve(m, E);
    };
    ft(rs, (m) => {
      r()["title-card"] ? m(Ao) : m(Oo, !1);
    });
  }
  var is = Rt(rs, 2);
  {
    var So = (m) => {
      var E = zc(), $ = dt(E);
      nc($, 20, () => r().cards, (Y) => Y, (Y, Ae) => {
        {
          let Oe = /* @__PURE__ */ Ln(() => p(o) && i());
          Ei(Y, {
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
              return r()["child-margin-top"];
            },
            get open() {
              return p(o);
            },
            get animation() {
              return r().animation;
            },
            get animationState() {
              return p(c);
            },
            get clearCardCss() {
              return r()["clear-children"];
            }
          });
        }
      }), Ye($), Ye(E), Je(() => {
        Se(E, 1, `children-wrapper ${r().animation ? "animation " + p(c) : ""}${p(o) ? " open" : " close"}`, "svelte-1jqiztq"), ht($, `--expander-card-display:${r()["expander-card-display"] ?? ""};
                --gap:${(p(o) && p(c) !== "closing" ? r()["expanded-gap"] : r().gap) ?? ""};
                --child-padding:${(p(o) && p(c) !== "closing" ? r()["child-padding"] : "0px") ?? ""};`), Se($, 1, `children-container${p(o) ? " open" : " close"}${r().animation ? " animation " + p(c) : ""}`, "svelte-1jqiztq");
      }), ve(m, E);
    };
    ft(is, (m) => {
      r().cards && m(So);
    });
  }
  var xo = Rt(is, 2);
  {
    var To = (m) => {
      var E = vs(), $ = ds(E);
      sc($, () => p(k)), ve(m, E);
    };
    ft(xo, (m) => {
      p(k) && m(To);
    });
  }
  return Ye(tn), pt(tn, (m) => O(g, m), () => p(g)), Je(() => {
    Se(tn, 1, `expander-card${r().clear ? " clear" : ""}${p(o) ? " open" : " close"} ${p(c)}${r().animation ? " animation " + p(c) : ""}`, "svelte-1jqiztq"), ht(tn, `--expander-card-display:${r()["expander-card-display"] ?? ""};
     --gap:${(p(o) && p(c) !== "closing" ? r()["expanded-gap"] : r().gap) ?? ""}; --padding:${r().padding ?? ""};
     --expander-state:${p(o) ?? ""};
     --icon-rotate-degree:${r()["icon-rotate-degree"] ?? ""};
     --card-background:${(p(o) && p(c) !== "closing" && r()["expander-card-background-expanded"] ? r()["expander-card-background-expanded"] : r()["expander-card-background"]) ?? ""};
     --background-animation-duration:${p(_) ?? ""}s;
     --expander-card-overlay-height:${p(w) ? `${p(w)}px` : "auto"};
    `);
  }), ve(t, tn), Ci($o);
}
Yl(["click"]);
customElements.define("expander-card", Ka(Wc, { hass: {}, preview: {}, config: {} }, [], [], { mode: "open" }, (t) => class extends t {
  constructor() {
    super(...arguments);
    // re-declare props used in customClass.
    q(this, "config");
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
const Yc = "6.0.0";
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Er = globalThis, Gi = Er.ShadowRoot && (Er.ShadyCSS === void 0 || Er.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, zi = Symbol(), ks = /* @__PURE__ */ new WeakMap();
let io = class {
  constructor(e, n, i) {
    if (this._$cssResult$ = !0, i !== zi) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = n;
  }
  get styleSheet() {
    let e = this.o;
    const n = this.t;
    if (Gi && e === void 0) {
      const i = n !== void 0 && n.length === 1;
      i && (e = ks.get(n)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), i && ks.set(n, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const Jc = (t) => new io(typeof t == "string" ? t : t + "", void 0, zi), Bi = (t, ...e) => {
  const n = t.length === 1 ? t[0] : e.reduce((i, r, s) => i + ((a) => {
    if (a._$cssResult$ === !0) return a.cssText;
    if (typeof a == "number") return a;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + t[s + 1], t[0]);
  return new io(n, t, zi);
}, Kc = (t, e) => {
  if (Gi) t.adoptedStyleSheets = e.map((n) => n instanceof CSSStyleSheet ? n : n.styleSheet);
  else for (const n of e) {
    const i = document.createElement("style"), r = Er.litNonce;
    r !== void 0 && i.setAttribute("nonce", r), i.textContent = n.cssText, t.appendChild(i);
  }
}, Ps = Gi ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let n = "";
  for (const i of e.cssRules) n += i.cssText;
  return Jc(n);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Qc, defineProperty: Xc, getOwnPropertyDescriptor: Zc, getOwnPropertyNames: eu, getOwnPropertySymbols: tu, getPrototypeOf: nu } = Object, At = globalThis, Ds = At.trustedTypes, ru = Ds ? Ds.emptyScript : "", ii = At.reactiveElementPolyfillSupport, Un = (t, e) => t, Rr = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? ru : null;
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
} }, Vi = (t, e) => !Qc(t, e), Ms = { attribute: !0, type: String, converter: Rr, reflect: !1, useDefault: !1, hasChanged: Vi };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), At.litPropertyMetadata ?? (At.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let ln = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, n = Ms) {
    if (n.state && (n.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((n = Object.create(n)).wrapped = !0), this.elementProperties.set(e, n), !n.noAccessor) {
      const i = Symbol(), r = this.getPropertyDescriptor(e, i, n);
      r !== void 0 && Xc(this.prototype, e, r);
    }
  }
  static getPropertyDescriptor(e, n, i) {
    const { get: r, set: s } = Zc(this.prototype, e) ?? { get() {
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
    return this.elementProperties.get(e) ?? Ms;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Un("elementProperties"))) return;
    const e = nu(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Un("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Un("properties"))) {
      const n = this.properties, i = [...eu(n), ...tu(n)];
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
      for (const r of i) n.unshift(Ps(r));
    } else e !== void 0 && n.push(Ps(e));
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
    return Kc(e, this.constructor.elementStyles), e;
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
      const a = (((s = i.converter) == null ? void 0 : s.toAttribute) !== void 0 ? i.converter : Rr).toAttribute(n, i.type);
      this._$Em = e, a == null ? this.removeAttribute(r) : this.setAttribute(r, a), this._$Em = null;
    }
  }
  _$AK(e, n) {
    var s, a;
    const i = this.constructor, r = i._$Eh.get(e);
    if (r !== void 0 && this._$Em !== r) {
      const o = i.getPropertyOptions(r), l = typeof o.converter == "function" ? { fromAttribute: o.converter } : ((s = o.converter) == null ? void 0 : s.fromAttribute) !== void 0 ? o.converter : Rr;
      this._$Em = r;
      const u = l.fromAttribute(n, o.type);
      this[r] = u ?? ((a = this._$Ej) == null ? void 0 : a.get(r)) ?? u, this._$Em = null;
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
ln.elementStyles = [], ln.shadowRootOptions = { mode: "open" }, ln[Un("elementProperties")] = /* @__PURE__ */ new Map(), ln[Un("finalized")] = /* @__PURE__ */ new Map(), ii == null || ii({ ReactiveElement: ln }), (At.reactiveElementVersions ?? (At.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Gn = globalThis, Hs = (t) => t, Ir = Gn.trustedTypes, js = Ir ? Ir.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, so = "$lit$", _t = `lit$${Math.random().toFixed(9).slice(2)}$`, ao = "?" + _t, iu = `<${ao}>`, Kt = document, Wn = () => Kt.createComment(""), Yn = (t) => t === null || typeof t != "object" && typeof t != "function", Wi = Array.isArray, su = (t) => Wi(t) || typeof (t == null ? void 0 : t[Symbol.iterator]) == "function", si = `[ 	
\f\r]`, Dn = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Fs = /-->/g, qs = />/g, Lt = RegExp(`>|${si}(?:([^\\s"'>=/]+)(${si}*=${si}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Us = /'/g, Gs = /"/g, oo = /^(?:script|style|textarea|title)$/i, au = (t) => (e, ...n) => ({ _$litType$: t, strings: e, values: n }), on = au(1), Sn = Symbol.for("lit-noChange"), U = Symbol.for("lit-nothing"), zs = /* @__PURE__ */ new WeakMap(), Dt = Kt.createTreeWalker(Kt, 129);
function lo(t, e) {
  if (!Wi(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return js !== void 0 ? js.createHTML(e) : e;
}
const ou = (t, e) => {
  const n = t.length - 1, i = [];
  let r, s = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", a = Dn;
  for (let o = 0; o < n; o++) {
    const l = t[o];
    let u, c, f = -1, _ = 0;
    for (; _ < l.length && (a.lastIndex = _, c = a.exec(l), c !== null); ) _ = a.lastIndex, a === Dn ? c[1] === "!--" ? a = Fs : c[1] !== void 0 ? a = qs : c[2] !== void 0 ? (oo.test(c[2]) && (r = RegExp("</" + c[2], "g")), a = Lt) : c[3] !== void 0 && (a = Lt) : a === Lt ? c[0] === ">" ? (a = r ?? Dn, f = -1) : c[1] === void 0 ? f = -2 : (f = a.lastIndex - c[2].length, u = c[1], a = c[3] === void 0 ? Lt : c[3] === '"' ? Gs : Us) : a === Gs || a === Us ? a = Lt : a === Fs || a === qs ? a = Dn : (a = Lt, r = void 0);
    const w = a === Lt && t[o + 1].startsWith("/>") ? " " : "";
    s += a === Dn ? l + iu : f >= 0 ? (i.push(u), l.slice(0, f) + so + l.slice(f) + _t + w) : l + _t + (f === -2 ? o : w);
  }
  return [lo(t, s + (t[n] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), i];
};
class Jn {
  constructor({ strings: e, _$litType$: n }, i) {
    let r;
    this.parts = [];
    let s = 0, a = 0;
    const o = e.length - 1, l = this.parts, [u, c] = ou(e, n);
    if (this.el = Jn.createElement(u, i), Dt.currentNode = this.el.content, n === 2 || n === 3) {
      const f = this.el.content.firstChild;
      f.replaceWith(...f.childNodes);
    }
    for (; (r = Dt.nextNode()) !== null && l.length < o; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const f of r.getAttributeNames()) if (f.endsWith(so)) {
          const _ = c[a++], w = r.getAttribute(f).split(_t), g = /([.?@])?(.*)/.exec(_);
          l.push({ type: 1, index: s, name: g[2], strings: w, ctor: g[1] === "." ? cu : g[1] === "?" ? uu : g[1] === "@" ? du : Ur }), r.removeAttribute(f);
        } else f.startsWith(_t) && (l.push({ type: 6, index: s }), r.removeAttribute(f));
        if (oo.test(r.tagName)) {
          const f = r.textContent.split(_t), _ = f.length - 1;
          if (_ > 0) {
            r.textContent = Ir ? Ir.emptyScript : "";
            for (let w = 0; w < _; w++) r.append(f[w], Wn()), Dt.nextNode(), l.push({ type: 2, index: ++s });
            r.append(f[_], Wn());
          }
        }
      } else if (r.nodeType === 8) if (r.data === ao) l.push({ type: 2, index: s });
      else {
        let f = -1;
        for (; (f = r.data.indexOf(_t, f + 1)) !== -1; ) l.push({ type: 7, index: s }), f += _t.length - 1;
      }
      s++;
    }
  }
  static createElement(e, n) {
    const i = Kt.createElement("template");
    return i.innerHTML = e, i;
  }
}
function xn(t, e, n = t, i) {
  var a, o;
  if (e === Sn) return e;
  let r = i !== void 0 ? (a = n._$Co) == null ? void 0 : a[i] : n._$Cl;
  const s = Yn(e) ? void 0 : e._$litDirective$;
  return (r == null ? void 0 : r.constructor) !== s && ((o = r == null ? void 0 : r._$AO) == null || o.call(r, !1), s === void 0 ? r = void 0 : (r = new s(t), r._$AT(t, n, i)), i !== void 0 ? (n._$Co ?? (n._$Co = []))[i] = r : n._$Cl = r), r !== void 0 && (e = xn(t, r._$AS(t, e.values), r, i)), e;
}
class lu {
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
    const { el: { content: n }, parts: i } = this._$AD, r = ((e == null ? void 0 : e.creationScope) ?? Kt).importNode(n, !0);
    Dt.currentNode = r;
    let s = Dt.nextNode(), a = 0, o = 0, l = i[0];
    for (; l !== void 0; ) {
      if (a === l.index) {
        let u;
        l.type === 2 ? u = new ir(s, s.nextSibling, this, e) : l.type === 1 ? u = new l.ctor(s, l.name, l.strings, this, e) : l.type === 6 && (u = new fu(s, this, e)), this._$AV.push(u), l = i[++o];
      }
      a !== (l == null ? void 0 : l.index) && (s = Dt.nextNode(), a++);
    }
    return Dt.currentNode = Kt, r;
  }
  p(e) {
    let n = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(e, i, n), n += i.strings.length - 2) : i._$AI(e[n])), n++;
  }
}
class ir {
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
    e = xn(this, e, n), Yn(e) ? e === U || e == null || e === "" ? (this._$AH !== U && this._$AR(), this._$AH = U) : e !== this._$AH && e !== Sn && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : su(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== U && Yn(this._$AH) ? this._$AA.nextSibling.data = e : this.T(Kt.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    var s;
    const { values: n, _$litType$: i } = e, r = typeof i == "number" ? this._$AC(e) : (i.el === void 0 && (i.el = Jn.createElement(lo(i.h, i.h[0]), this.options)), i);
    if (((s = this._$AH) == null ? void 0 : s._$AD) === r) this._$AH.p(n);
    else {
      const a = new lu(r, this), o = a.u(this.options);
      a.p(n), this.T(o), this._$AH = a;
    }
  }
  _$AC(e) {
    let n = zs.get(e.strings);
    return n === void 0 && zs.set(e.strings, n = new Jn(e)), n;
  }
  k(e) {
    Wi(this._$AH) || (this._$AH = [], this._$AR());
    const n = this._$AH;
    let i, r = 0;
    for (const s of e) r === n.length ? n.push(i = new ir(this.O(Wn()), this.O(Wn()), this, this.options)) : i = n[r], i._$AI(s), r++;
    r < n.length && (this._$AR(i && i._$AB.nextSibling, r), n.length = r);
  }
  _$AR(e = this._$AA.nextSibling, n) {
    var i;
    for ((i = this._$AP) == null ? void 0 : i.call(this, !1, !0, n); e !== this._$AB; ) {
      const r = Hs(e).nextSibling;
      Hs(e).remove(), e = r;
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
    this.type = 1, this._$AH = U, this._$AN = void 0, this.element = e, this.name = n, this._$AM = r, this.options = s, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = U;
  }
  _$AI(e, n = this, i, r) {
    const s = this.strings;
    let a = !1;
    if (s === void 0) e = xn(this, e, n, 0), a = !Yn(e) || e !== this._$AH && e !== Sn, a && (this._$AH = e);
    else {
      const o = e;
      let l, u;
      for (e = s[0], l = 0; l < s.length - 1; l++) u = xn(this, o[i + l], n, l), u === Sn && (u = this._$AH[l]), a || (a = !Yn(u) || u !== this._$AH[l]), u === U ? e = U : e !== U && (e += (u ?? "") + s[l + 1]), this._$AH[l] = u;
    }
    a && !r && this.j(e);
  }
  j(e) {
    e === U ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class cu extends Ur {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === U ? void 0 : e;
  }
}
class uu extends Ur {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== U);
  }
}
class du extends Ur {
  constructor(e, n, i, r, s) {
    super(e, n, i, r, s), this.type = 5;
  }
  _$AI(e, n = this) {
    if ((e = xn(this, e, n, 0) ?? U) === Sn) return;
    const i = this._$AH, r = e === U && i !== U || e.capture !== i.capture || e.once !== i.once || e.passive !== i.passive, s = e !== U && (i === U || r);
    r && this.element.removeEventListener(this.name, this, i), s && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    var n;
    typeof this._$AH == "function" ? this._$AH.call(((n = this.options) == null ? void 0 : n.host) ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class fu {
  constructor(e, n, i) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = n, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    xn(this, e);
  }
}
const ai = Gn.litHtmlPolyfillSupport;
ai == null || ai(Jn, ir), (Gn.litHtmlVersions ?? (Gn.litHtmlVersions = [])).push("3.3.2");
const hu = (t, e, n) => {
  const i = (n == null ? void 0 : n.renderBefore) ?? e;
  let r = i._$litPart$;
  if (r === void 0) {
    const s = (n == null ? void 0 : n.renderBefore) ?? null;
    i._$litPart$ = r = new ir(e.insertBefore(Wn(), s), s, void 0, n ?? {});
  }
  return r._$AI(t), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Vt = globalThis;
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
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = hu(n, this.renderRoot, this.renderOptions);
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
var Vs;
zn._$litElement$ = !0, zn.finalized = !0, (Vs = Vt.litElementHydrateSupport) == null || Vs.call(Vt, { LitElement: zn });
const oi = Vt.litElementPolyfillSupport;
oi == null || oi({ LitElement: zn });
(Vt.litElementVersions ?? (Vt.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const pu = (t) => (e, n) => {
  n !== void 0 ? n.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const vu = { attribute: !0, type: String, converter: Rr, reflect: !1, hasChanged: Vi }, _u = (t = vu, e, n) => {
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
function Gr(t) {
  return (e, n) => typeof n == "object" ? _u(t, e, n) : ((i, r, s) => {
    const a = r.hasOwnProperty(s);
    return r.constructor.createProperty(s, i), a ? Object.getOwnPropertyDescriptor(r, s) : void 0;
  })(t, e, n);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function sr(t) {
  return Gr({ ...t, state: !0, attribute: !1 });
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const gu = (t, e, n) => (n.configurable = !0, n.enumerable = !0, Reflect.decorate && typeof e != "object" && Object.defineProperty(t, e, n), n);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function mu(t, e) {
  return (n, i, r) => {
    const s = (a) => {
      var o;
      return ((o = a.renderRoot) == null ? void 0 : o.querySelector(t)) ?? null;
    };
    return gu(n, i, { get() {
      return s(this);
    } });
  };
}
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const yu = (t) => t ?? U, bu = Bi`
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
`, wu = Bi`
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
var Eu = Object.defineProperty, $u = Object.getOwnPropertyDescriptor, We = (t, e, n, i) => {
  for (var r = i > 1 ? void 0 : i ? $u(e, n) : e, s = t.length - 1, a; s >= 0; s--)
    (a = t[s]) && (r = (i ? a(e, n, r) : a(r)) || r);
  return i && r && Eu(e, n, r), r;
};
const co = "custom:", Au = (t) => t.startsWith(co), Ou = (t) => {
  var e;
  return (e = window.customCards) == null ? void 0 : e.find((n) => n.type === t);
}, Su = (t) => t.replace(co, "");
let he = class extends zn {
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
      Au(this._config.type) ? (i = (n = Ou(
        Su(this._config.type)
      )) == null ? void 0 : n.name, i != null && i.toLowerCase().endsWith(" card") && (i = i.substring(0, i.length - 5))) : i = this.hass.localize(
        `ui.panel.lovelace.editor.card.${this._config.type}.name`
      ), e = `${e} - ${this.hass.localize(
        "ui.panel.lovelace.editor.edit_card.typed_header",
        { type: i }
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
                    disabled=${yu(t)}
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
      return U;
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
  bu,
  wu,
  Bi`
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
], he.prototype, "hass", 2);
We([
  Gr({ type: Boolean, reflect: !0 })
], he.prototype, "large", 2);
We([
  Gr({ attribute: !1 })
], he.prototype, "lovelace", 2);
We([
  sr()
], he.prototype, "_params", 2);
We([
  sr()
], he.prototype, "_config", 2);
We([
  sr()
], he.prototype, "_cardGUIMode", 2);
We([
  sr()
], he.prototype, "_cardGUIModeAvailable", 2);
We([
  sr()
], he.prototype, "_error", 2);
We([
  mu("hui-card-element-editor")
], he.prototype, "_cardEditorEl", 2);
he = We([
  pu("expander-card-title-card-edit-form")
], he);
console.info(
  `%c  Expander-Card 
%c Version ${Yc}`,
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
  Wc as default
};
//# sourceMappingURL=expander-card.js.map
