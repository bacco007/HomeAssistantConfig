var Po = Object.defineProperty;
var os = (t) => {
  throw TypeError(t);
};
var Do = (t, e, n) => e in t ? Po(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n;
var q = (t, e, n) => Do(t, typeof e != "symbol" ? e + "" : e, n), Yr = (t, e, n) => e.has(t) || os("Cannot " + n);
var h = (t, e, n) => (Yr(t, e, "read from private field"), n ? n.call(t) : e.get(t)), N = (t, e, n) => e.has(t) ? os("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, n), x = (t, e, n, r) => (Yr(t, e, "write to private field"), r ? r.call(t, n) : e.set(t, n), n), V = (t, e, n) => (Yr(t, e, "access private method"), n);
const Mo = "5";
var Ws;
typeof window < "u" && ((Ws = window.__svelte ?? (window.__svelte = {})).v ?? (Ws.v = /* @__PURE__ */ new Set())).add(Mo);
const Ho = {
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
}, jo = [
  "expanded",
  "icon",
  "arrow-color",
  "title",
  "style"
];
var vr = /* @__PURE__ */ ((t) => (t.CSS = "css", t.Object = "object", t))(vr || {});
const Fo = { name: "style", label: "CSS text", selector: { text: { multiline: !0 } } }, qo = { name: "style", label: "CSS structured object", selector: { object: {} } }, Go = { icon: {} }, Uo = { text: {} }, zo = { boolean: {} }, Bo = (t) => ({
  number: {
    unit_of_measurement: t
  }
}), Vo = (t, e) => ({
  name: t,
  label: e,
  selector: Go
}), J = (t, e) => ({
  name: t,
  label: e,
  selector: Uo
}), sn = (t, e) => ({
  name: t,
  label: e,
  selector: zo
}), ls = (t, e, n) => ({
  name: t,
  label: e,
  selector: Bo(n)
}), Wo = [
  {
    type: "expandable",
    label: "Expander Card Settings",
    icon: "mdi:arrow-down-bold-box-outline",
    schema: [
      {
        ...J("title", "Title")
      },
      {
        ...Vo("icon", "Icon")
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
                ...ls("min-width-expanded", "Min width expanded", "px")
              },
              {
                ...ls("max-width-expanded", "Max width expanded", "px")
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
], Yo = (t, e) => new Promise((n) => {
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
}), Fn = window;
let _r = Fn.cardHelpers;
const Jo = new Promise((t) => {
  _r && t(), Fn.loadCardHelpers && Fn.loadCardHelpers().then((e) => {
    _r = e, Fn.cardHelpers = _r, t();
  });
});
async function Ko() {
  const t = document.querySelector("home-assistant"), e = t == null ? void 0 : t.hass;
  return e ? (await e.callWS({ type: "config/auth/list" })).filter((r) => !r.system_generated).map((r) => r.name) : void 0;
}
const Xo = async () => {
  const t = await Jo.then(() => _r.createCardElement({ type: "vertical-stack", cards: [] })), e = await customElements.whenDefined("hui-vertical-stack-card").then(() => t.constructor.getConfigElement()), n = await Ko();
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
          await Yo(
            this,
            c
          );
        }));
      }, this._computeLabelCallback = (i) => i.label ?? i.name ?? "", this._valueChanged = (i) => {
        const s = i.detail.value, a = Object.entries(Ho);
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
      const s = JSON.stringify(Wo), a = this._users.map((f) => f.replace(/\\/g, "\\\\").replace(/"/g, '\\"')).join('","');
      let o = s.replace(/\[\[users\]\]/g, a);
      o = o.replace(
        /\[\[templates\]\]/g,
        // NOSONAR es2019
        jo.filter((f) => {
          var _;
          return !((_ = this._config.templates) != null && _.some((w) => w.template === f));
        }).join('","')
      );
      const u = (this._config.style && typeof this._config.style == "object" ? vr.Object : vr.CSS) === vr.CSS ? JSON.stringify(Fo) : JSON.stringify(qo);
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
}, Qo = async () => {
  for (; customElements.get("home-assistant") === void 0; )
    await new Promise((t) => Fn.setTimeout(t, 100));
  if (!customElements.get("expander-card-editor")) {
    const t = await Xo();
    customElements.define("expander-card-editor", t);
  }
}, Zo = 1, el = 2, tl = 16, nl = 1, rl = 2, Si = "[", Dr = "[!", xi = "]", Yt = {}, K = Symbol(), Ks = "http://www.w3.org/1999/xhtml", li = !1;
var Xs = Array.isArray, il = Array.prototype.indexOf, bn = Array.prototype.includes, Mr = Array.from, Sr = Object.keys, xr = Object.defineProperty, dn = Object.getOwnPropertyDescriptor, sl = Object.getOwnPropertyDescriptors, al = Object.prototype, ol = Array.prototype, Qs = Object.getPrototypeOf, cs = Object.isExtensible;
const ll = () => {
};
function cl(t) {
  for (var e = 0; e < t.length; e++)
    t[e]();
}
function Zs() {
  var t, e, n = new Promise((r, i) => {
    t = r, e = i;
  });
  return { promise: n, resolve: t, reject: e };
}
const Q = 2, Wn = 4, Hr = 8, ea = 1 << 24, at = 16, He = 32, Tt = 64, ta = 128, be = 512, W = 1024, Z = 2048, Me = 4096, de = 8192, it = 16384, Nn = 32768, wn = 65536, us = 1 << 17, na = 1 << 18, Qt = 1 << 19, ul = 1 << 20, mt = 1 << 25, Yn = 65536, ci = 1 << 21, Ti = 1 << 22, bt = 1 << 23, gr = Symbol("$state"), dl = Symbol("legacy props"), fl = Symbol(""), kt = new class extends Error {
  constructor() {
    super(...arguments);
    q(this, "name", "StaleReactionError");
    q(this, "message", "The reaction that called `getAbortSignal()` was re-run or destroyed");
  }
}();
var Ys;
const hl = ((Ys = globalThis.document) == null ? void 0 : /* @__PURE__ */ Ys.contentType.includes("xml")) ?? !1, jr = 3, Zt = 8;
function pl(t) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function vl() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function _l(t, e, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function gl(t) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function ml() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function yl(t) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function bl() {
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
function ir(t) {
  console.warn("https://svelte.dev/e/hydration_mismatch");
}
function Sl() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
let L = !1;
function Le(t) {
  L = t;
}
let I;
function ne(t) {
  if (t === null)
    throw ir(), Yt;
  return I = t;
}
function En() {
  return ne(/* @__PURE__ */ je(I));
}
function Ye(t) {
  if (L) {
    if (/* @__PURE__ */ je(I) !== null)
      throw ir(), Yt;
    I = t;
  }
}
function xl(t = 1) {
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
      if (r === xi) {
        if (e === 0) return n;
        e -= 1;
      } else (r === Si || r === Dr || // "[1", "[2", etc. for if blocks
      r[0] === "[" && !isNaN(Number(r.slice(1)))) && (e += 1);
    }
    var i = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ je(n)
    );
    t && n.remove(), n = i;
  }
}
function ra(t) {
  if (!t || t.nodeType !== Zt)
    throw ir(), Yt;
  return (
    /** @type {Comment} */
    t.data
  );
}
function ia(t) {
  return t === this.v;
}
function Tl(t, e) {
  return t != t ? e == e : t !== e || t !== null && typeof t == "object" || typeof t == "function";
}
function sa(t) {
  return !Tl(t, this.v);
}
let Nl = !1, fe = null;
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
    for (var r of n)
      Na(r);
  }
  return t !== void 0 && (e.x = t), e.i = !0, fe = e.p, t ?? /** @type {T} */
  {};
}
function aa() {
  return !0;
}
let Pt = [];
function oa() {
  var t = Pt;
  Pt = [], cl(t);
}
function zt(t) {
  if (Pt.length === 0 && !qn) {
    var e = Pt;
    queueMicrotask(() => {
      e === Pt && oa();
    });
  }
  Pt.push(t);
}
function Cl() {
  for (; Pt.length > 0; )
    oa();
}
function la(t) {
  var e = P;
  if (e === null)
    return R.f |= bt, t;
  if ((e.f & Nn) === 0 && (e.f & Wn) === 0)
    throw t;
  An(t, e);
}
function An(t, e) {
  for (; e !== null; ) {
    if ((e.f & ta) !== 0) {
      if ((e.f & Nn) === 0)
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
function Ri(t) {
  (t.f & be) !== 0 || t.deps === null ? U(t, W) : U(t, Me);
}
function ca(t) {
  if (t !== null)
    for (const e of t)
      (e.f & Q) === 0 || (e.f & Yn) === 0 || (e.f ^= Yn, ca(
        /** @type {Derived} */
        e.deps
      ));
}
function ua(t, e, n) {
  (t.f & Z) !== 0 ? e.add(t) : (t.f & Me) !== 0 && n.add(t), ca(t.deps), U(t, W);
}
const dr = /* @__PURE__ */ new Set();
let D = null, X = null, se = [], Fr = null, ui = !1, qn = !1;
var hn, pn, Ht, vn, Zn, er, jt, Xe, _n, Be, di, fi, da;
const Ki = class Ki {
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
    N(this, Ht, 0);
    /**
     * The number of async effects that are currently in flight, _not_ inside a pending boundary
     */
    N(this, vn, 0);
    /**
     * A deferred that resolves when the batch is committed, used with `settled()`
     * TODO replace with Promise.withResolvers once supported widely enough
     * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
     */
    N(this, Zn, null);
    /**
     * Deferred effects (which run after async work has completed) that are DIRTY
     * @type {Set<Effect>}
     */
    N(this, er, /* @__PURE__ */ new Set());
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
      V(this, Be, di).call(this, s, n, r);
    if (this.is_deferred()) {
      V(this, Be, fi).call(this, r), V(this, Be, fi).call(this, n);
      for (const [s, a] of h(this, Xe))
        va(s, a);
    } else {
      for (const s of h(this, hn)) s();
      h(this, hn).clear(), h(this, Ht) === 0 && V(this, Be, da).call(this), D = null, ds(r), ds(n), (i = h(this, Zn)) == null || i.resolve();
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
      if (fa(), D !== null && D !== this)
        return;
    } else h(this, Ht) === 0 && this.process([]);
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
    x(this, Ht, h(this, Ht) + 1), e && x(this, vn, h(this, vn) + 1);
  }
  /**
   *
   * @param {boolean} blocking
   */
  decrement(e) {
    x(this, Ht, h(this, Ht) - 1), e && x(this, vn, h(this, vn) - 1), !h(this, _n) && (x(this, _n, !0), zt(() => {
      x(this, _n, !1), this.is_deferred() ? se.length > 0 && this.flush() : this.revive();
    }));
  }
  revive() {
    for (const e of h(this, er))
      h(this, jt).delete(e), U(e, Z), ke(e);
    for (const e of h(this, jt))
      U(e, Me), ke(e);
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
    return (h(this, Zn) ?? x(this, Zn, Zs())).promise;
  }
  static ensure() {
    if (D === null) {
      const e = D = new Ki();
      dr.add(D), qn || zt(() => {
        D === e && e.flush();
      });
    }
    return D;
  }
  apply() {
  }
};
hn = new WeakMap(), pn = new WeakMap(), Ht = new WeakMap(), vn = new WeakMap(), Zn = new WeakMap(), er = new WeakMap(), jt = new WeakMap(), Xe = new WeakMap(), _n = new WeakMap(), Be = new WeakSet(), /**
 * Traverse the effect tree, executing effects or stashing
 * them for later execution as appropriate
 * @param {Effect} root
 * @param {Effect[]} effects
 * @param {Effect[]} render_effects
 */
di = function(e, n, r) {
  e.f ^= W;
  for (var i = e.first, s = null; i !== null; ) {
    var a = i.f, o = (a & (He | Tt)) !== 0, l = o && (a & W) !== 0, u = l || (a & de) !== 0 || h(this, Xe).has(i);
    if (!u && i.fn !== null) {
      o ? i.f ^= W : s !== null && (a & (Wn | Hr | ea)) !== 0 ? s.b.defer_effect(i) : (a & Wn) !== 0 ? n.push(i) : sr(i) && ((a & at) !== 0 && h(this, jt).add(i), Sn(i));
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
fi = function(e) {
  for (var n = 0; n < e.length; n += 1)
    ua(e[n], h(this, er), h(this, jt));
}, da = function() {
  var i;
  if (dr.size > 1) {
    this.previous.clear();
    var e = X, n = !0;
    for (const s of dr) {
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
          ha(c, o, l, u);
        if (se.length > 0) {
          D = s, s.apply();
          for (const c of se)
            V(i = s, Be, di).call(i, c, [], []);
          s.deactivate();
        }
        se = r;
      }
    }
    D = null, X = e;
  }
  this.committed = !0, dr.delete(this);
};
let st = Ki;
function me(t) {
  var e = qn;
  qn = !0;
  try {
    for (var n; ; ) {
      if (Cl(), se.length === 0 && (D == null || D.flush(), se.length === 0))
        return Fr = null, /** @type {T} */
        n;
      fa();
    }
  } finally {
    qn = e;
  }
}
function fa() {
  ui = !0;
  var t = null;
  try {
    for (var e = 0; se.length > 0; ) {
      var n = st.ensure();
      if (e++ > 1e3) {
        var r, i;
        Il();
      }
      n.process(se), wt.clear();
    }
  } finally {
    se = [], ui = !1, Fr = null;
  }
}
function Il() {
  try {
    bl();
  } catch (t) {
    An(t, Fr);
  }
}
let xe = null;
function ds(t) {
  var e = t.length;
  if (e !== 0) {
    for (var n = 0; n < e; ) {
      var r = t[n++];
      if ((r.f & (it | de)) === 0 && sr(r) && (xe = /* @__PURE__ */ new Set(), Sn(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && La(r), (xe == null ? void 0 : xe.size) > 0)) {
        wt.clear();
        for (const i of xe) {
          if ((i.f & (it | de)) !== 0) continue;
          const s = [i];
          let a = i.parent;
          for (; a !== null; )
            xe.has(a) && (xe.delete(a), s.push(a)), a = a.parent;
          for (let o = s.length - 1; o >= 0; o--) {
            const l = s[o];
            (l.f & (it | de)) === 0 && Sn(l);
          }
        }
        xe.clear();
      }
    }
    xe = null;
  }
}
function ha(t, e, n, r) {
  if (!n.has(t) && (n.add(t), t.reactions !== null))
    for (const i of t.reactions) {
      const s = i.f;
      (s & Q) !== 0 ? ha(
        /** @type {Derived} */
        i,
        e,
        n,
        r
      ) : (s & (Ti | at)) !== 0 && (s & Z) === 0 && pa(i, e, r) && (U(i, Z), ke(
        /** @type {Effect} */
        i
      ));
    }
}
function pa(t, e, n) {
  const r = n.get(t);
  if (r !== void 0) return r;
  if (t.deps !== null)
    for (const i of t.deps) {
      if (bn.call(e, i))
        return !0;
      if ((i.f & Q) !== 0 && pa(
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
    if (ui && e === P && (n & at) !== 0 && (n & na) === 0)
      return;
    if ((n & (Tt | He)) !== 0) {
      if ((n & W) === 0) return;
      e.f ^= W;
    }
  }
  se.push(e);
}
function va(t, e) {
  if (!((t.f & He) !== 0 && (t.f & W) !== 0)) {
    (t.f & Z) !== 0 ? e.d.push(t) : (t.f & Me) !== 0 && e.m.push(t), U(t, W);
    for (var n = t.first; n !== null; )
      va(n, e), n = n.next;
  }
}
function Ll(t) {
  let e = 0, n = Jt(0), r;
  return () => {
    Pi() && (p(n), Di(() => (e === 0 && (r = Ce(() => t(() => Gn(n)))), e += 1, () => {
      zt(() => {
        e -= 1, e === 0 && (r == null || r(), r = void 0, Gn(n));
      });
    })));
  };
}
var kl = wn | Qt | ta;
function Pl(t, e, n) {
  new Dl(t, e, n);
}
var ce, tr, qe, Ft, Ge, _e, ie, Ue, Qe, gt, qt, Ze, gn, Gt, mn, yn, et, kr, z, _a, ga, hi, mr, yr, pi;
class Dl {
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
    N(this, tr, L ? I : null);
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
    N(this, gn, !1);
    N(this, Gt, !1);
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
    N(this, kr, Ll(() => (x(this, et, Jt(h(this, qt))), () => {
      x(this, et, null);
    })));
    x(this, ce, e), x(this, qe, n), x(this, Ft, r), this.parent = /** @type {Effect} */
    P.b, this.is_pending = !!h(this, qe).pending, x(this, Ge, Mi(() => {
      if (P.b = this, L) {
        const s = h(this, tr);
        En(), /** @type {Comment} */
        s.nodeType === Zt && /** @type {Comment} */
        s.data === Dr ? V(this, z, ga).call(this) : (V(this, z, _a).call(this), h(this, Ze) === 0 && (this.is_pending = !1));
      } else {
        var i = V(this, z, hi).call(this);
        try {
          x(this, _e, ye(() => r(i)));
        } catch (s) {
          this.error(s);
        }
        h(this, Ze) > 0 ? V(this, z, yr).call(this) : this.is_pending = !1;
      }
      return () => {
        var s;
        (s = h(this, gt)) == null || s.remove();
      };
    }, kl)), L && x(this, ce, I);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(e) {
    ua(e, h(this, mn), h(this, yn));
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
    V(this, z, pi).call(this, e), x(this, qt, h(this, qt) + e), !(!h(this, et) || h(this, gn)) && (x(this, gn, !0), zt(() => {
      x(this, gn, !1), h(this, et) && On(h(this, et), h(this, qt));
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
      h(this, tr)
    ), xl(), ne(Tr()));
    var i = !1, s = !1;
    const a = () => {
      if (i) {
        Sl();
        return;
      }
      i = !0, s && Ol(), st.ensure(), x(this, qt, 0), h(this, Ue) !== null && Bt(h(this, Ue), () => {
        x(this, Ue, null);
      }), this.is_pending = this.has_pending_snippet(), x(this, _e, V(this, z, mr).call(this, () => (x(this, Gt, !1), ye(() => h(this, Ft).call(this, h(this, ce)))))), h(this, Ze) > 0 ? V(this, z, yr).call(this) : this.is_pending = !1;
    };
    zt(() => {
      try {
        s = !0, n == null || n(e, a), s = !1;
      } catch (o) {
        An(o, h(this, Ge) && h(this, Ge).parent);
      }
      r && x(this, Ue, V(this, z, mr).call(this, () => {
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
          return An(
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
ce = new WeakMap(), tr = new WeakMap(), qe = new WeakMap(), Ft = new WeakMap(), Ge = new WeakMap(), _e = new WeakMap(), ie = new WeakMap(), Ue = new WeakMap(), Qe = new WeakMap(), gt = new WeakMap(), qt = new WeakMap(), Ze = new WeakMap(), gn = new WeakMap(), Gt = new WeakMap(), mn = new WeakMap(), yn = new WeakMap(), et = new WeakMap(), kr = new WeakMap(), z = new WeakSet(), _a = function() {
  try {
    x(this, _e, ye(() => h(this, Ft).call(this, h(this, ce))));
  } catch (e) {
    this.error(e);
  }
}, ga = function() {
  const e = h(this, qe).pending;
  e && (x(this, ie, ye(() => e(h(this, ce)))), zt(() => {
    var n = V(this, z, hi).call(this);
    x(this, _e, V(this, z, mr).call(this, () => (st.ensure(), ye(() => h(this, Ft).call(this, n))))), h(this, Ze) > 0 ? V(this, z, yr).call(this) : (Bt(
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
mr = function(e) {
  var n = P, r = R, i = fe;
  $e(h(this, Ge)), oe(h(this, Ge)), $n(h(this, Ge).ctx);
  try {
    return e();
  } catch (s) {
    return la(s), null;
  } finally {
    $e(n), oe(r), $n(i);
  }
}, yr = function() {
  const e = (
    /** @type {(anchor: Node) => void} */
    h(this, qe).pending
  );
  h(this, _e) !== null && (x(this, Qe, document.createDocumentFragment()), h(this, Qe).append(
    /** @type {TemplateNode} */
    h(this, gt)
  ), Da(h(this, _e), h(this, Qe))), h(this, ie) === null && x(this, ie, ye(() => e(h(this, ce))));
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
    for (const r of h(this, mn))
      U(r, Z), ke(r);
    for (const r of h(this, yn))
      U(r, Me), ke(r);
    h(this, mn).clear(), h(this, yn).clear(), h(this, ie) && Bt(h(this, ie), () => {
      x(this, ie, null);
    }), h(this, Qe) && (h(this, ce).before(h(this, Qe)), x(this, Qe, null));
  }
};
function Ml(t, e, n, r) {
  const i = qr;
  var s = t.filter((_) => !_.settled);
  if (n.length === 0 && s.length === 0) {
    r(e.map(i));
    return;
  }
  var a = D, o = (
    /** @type {Effect} */
    P
  ), l = Hl(), u = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((_) => _.promise)) : null;
  function c(_) {
    l();
    try {
      r(_);
    } catch (w) {
      (o.f & it) === 0 && An(w, o);
    }
    a == null || a.deactivate(), vi();
  }
  if (n.length === 0) {
    u.then(() => c(e.map(i)));
    return;
  }
  function f() {
    l(), Promise.all(n.map((_) => /* @__PURE__ */ jl(_))).then((_) => c([...e.map(i), ..._])).catch((_) => An(_, o));
  }
  u ? u.then(f) : f();
}
function Hl() {
  var t = P, e = R, n = fe, r = D;
  return function(s = !0) {
    $e(t), oe(e), $n(n), s && (r == null || r.activate());
  };
}
function vi() {
  $e(null), oe(null), $n(null);
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
    equals: ia,
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
function jl(t, e, n) {
  let r = (
    /** @type {Effect | null} */
    P
  );
  r === null && vl();
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
  return Kl(() => {
    var w;
    var u = Zs();
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
      var f = i.is_rendered();
      i.update_pending_count(1), c.increment(f), (w = l.get(c)) == null || w.reject(kt), l.delete(c), l.set(c, u);
    }
    const _ = (g, A = void 0) => {
      if (c.activate(), A)
        A !== kt && (a.f |= bt, On(a, A));
      else {
        (a.f & bt) !== 0 && (a.f ^= bt), On(a, g);
        for (const [d, v] of l) {
          if (l.delete(d), d === c) break;
          v.reject(kt);
        }
      }
      o && (i.update_pending_count(-1), c.decrement(f));
    };
    u.promise.then(_, (g) => _(null, g || "unknown"));
  }), Wl(() => {
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
function Pn(t) {
  const e = /* @__PURE__ */ qr(t);
  return Ma(e), e;
}
// @__NO_SIDE_EFFECTS__
function Fl(t) {
  const e = /* @__PURE__ */ qr(t);
  return e.equals = sa, e;
}
function ql(t) {
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
function Gl(t) {
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
function Ii(t) {
  var e, n = P;
  $e(Gl(t));
  try {
    t.f &= ~Yn, ql(t), e = qa(t);
  } finally {
    $e(n);
  }
  return e;
}
function ma(t) {
  var e = Ii(t);
  if (!t.equals(e) && (t.wv = ja(), (!(D != null && D.is_fork) || t.deps === null) && (t.v = e, t.deps === null))) {
    U(t, W);
    return;
  }
  Ot || (X !== null ? (Pi() || D != null && D.is_fork) && X.set(t, e) : Ri(t));
}
function Ul(t) {
  var e, n;
  if (t.effects !== null)
    for (const r of t.effects)
      (r.teardown || r.ac) && ((e = r.teardown) == null || e.call(r), (n = r.ac) == null || n.abort(kt), r.teardown = ll, r.ac = null, Jn(r, 0), Hi(r));
}
function ya(t) {
  if (t.effects !== null)
    for (const e of t.effects)
      e.teardown && Sn(e);
}
let _i = /* @__PURE__ */ new Set();
const wt = /* @__PURE__ */ new Map();
let ba = !1;
function Jt(t, e) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: t,
    reactions: null,
    equals: ia,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function M(t, e) {
  const n = Jt(t);
  return Ma(n), n;
}
// @__NO_SIDE_EFFECTS__
function wa(t, e = !1, n = !0) {
  const r = Jt(t);
  return e || (r.equals = sa), r;
}
function O(t, e, n = !1) {
  R !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!De || (R.f & us) !== 0) && aa() && (R.f & (Q | at | Ti | us)) !== 0 && (Ee === null || !bn.call(Ee, t)) && Al();
  let r = n ? nt(e) : e;
  return On(t, r);
}
function On(t, e) {
  if (!t.equals(e)) {
    var n = t.v;
    Ot ? wt.set(t, e) : wt.set(t, n), t.v = e;
    var r = st.ensure();
    if (r.capture(t, n), (t.f & Q) !== 0) {
      const i = (
        /** @type {Derived} */
        t
      );
      (t.f & Z) !== 0 && Ii(i), Ri(i);
    }
    t.wv = ja(), Ea(t, Z), P !== null && (P.f & W) !== 0 && (P.f & (He | Tt)) === 0 && (pe === null ? Ql([t]) : pe.push(t)), !r.is_fork && _i.size > 0 && !ba && zl();
  }
  return e;
}
function zl() {
  ba = !1;
  for (const t of _i)
    (t.f & W) !== 0 && U(t, Me), sr(t) && Sn(t);
  _i.clear();
}
function Gn(t) {
  O(t, t.v + 1);
}
function Ea(t, e) {
  var n = t.reactions;
  if (n !== null)
    for (var r = n.length, i = 0; i < r; i++) {
      var s = n[i], a = s.f, o = (a & Z) === 0;
      if (o && U(s, e), (a & Q) !== 0) {
        var l = (
          /** @type {Derived} */
          s
        );
        X == null || X.delete(l), (a & Yn) === 0 && (a & be && (s.f |= Yn), Ea(l, Me));
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
  if (typeof t != "object" || t === null || gr in t)
    return t;
  const e = Qs(t);
  if (e !== al && e !== ol)
    return t;
  var n = /* @__PURE__ */ new Map(), r = Xs(t), i = /* @__PURE__ */ M(0), s = Vt, a = (o) => {
    if (Vt === s)
      return o();
    var l = R, u = Vt;
    oe(null), vs(s);
    var c = o();
    return oe(l), vs(u), c;
  };
  return r && n.set("length", /* @__PURE__ */ M(
    /** @type {any[]} */
    t.length
  )), new Proxy(
    /** @type {any} */
    t,
    {
      defineProperty(o, l, u) {
        (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && El();
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
            n.set(l, c), Gn(i);
          }
        } else
          O(u, K), Gn(i);
        return !0;
      },
      get(o, l, u) {
        var w;
        if (l === gr)
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
        if (l === gr)
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
        if (r && l === "length")
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
          if (r && typeof l == "string") {
            var v = (
              /** @type {Source<number>} */
              n.get("length")
            ), y = Number(l);
            Number.isInteger(y) && y >= v.v && O(v, y + 1);
          }
          Gn(i);
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
        $l();
      }
    }
  );
}
var fs, $a, Aa, Oa;
function gi() {
  if (fs === void 0) {
    fs = window, $a = /Firefox/.test(navigator.userAgent);
    var t = Element.prototype, e = Node.prototype, n = Text.prototype;
    Aa = dn(e, "firstChild").get, Oa = dn(e, "nextSibling").get, cs(t) && (t.__click = void 0, t.__className = void 0, t.__attributes = null, t.__style = void 0, t.__e = void 0), cs(n) && (n.__t = void 0);
  }
}
function we(t = "") {
  return document.createTextNode(t);
}
// @__NO_SIDE_EFFECTS__
function Pe(t) {
  return (
    /** @type {TemplateNode | null} */
    Aa.call(t)
  );
}
// @__NO_SIDE_EFFECTS__
function je(t) {
  return (
    /** @type {TemplateNode | null} */
    Oa.call(t)
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
  return e && ki(
    /** @type {Text} */
    n
  ), ne(n), n;
}
function hs(t, e = !1) {
  if (!L) {
    var n = /* @__PURE__ */ Pe(t);
    return n instanceof Comment && n.data === "" ? /* @__PURE__ */ je(n) : n;
  }
  if (e) {
    if ((I == null ? void 0 : I.nodeType) !== jr) {
      var r = we();
      return I == null || I.before(r), ne(r), r;
    }
    ki(
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
    ki(
      /** @type {Text} */
      r
    );
  }
  return ne(r), r;
}
function Sa(t) {
  t.textContent = "";
}
function xa() {
  return !1;
}
function Li(t, e, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(Ks, t, void 0)
  );
}
function ki(t) {
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
function Ta(t) {
  var e = R, n = P;
  oe(null), $e(null);
  try {
    return t();
  } finally {
    oe(e), $e(n);
  }
}
function Bl(t) {
  P === null && (R === null && yl(), ml()), Ot && gl();
}
function Vl(t, e) {
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
      Sn(i);
    } catch (o) {
      throw re(i), o;
    }
  else e !== null && ke(i);
  var s = i;
  if (n && s.deps === null && s.teardown === null && s.nodes === null && s.first === s.last && // either `null`, or a singular child
  (s.f & Qt) === 0 && (s = s.first, (t & at) !== 0 && (t & wn) !== 0 && s !== null && (s.f |= wn)), s !== null && (s.parent = r, r !== null && Vl(s, r), R !== null && (R.f & Q) !== 0 && (t & Tt) === 0)) {
    var a = (
      /** @type {Derived} */
      R
    );
    (a.effects ?? (a.effects = [])).push(s);
  }
  return i;
}
function Pi() {
  return R !== null && !De;
}
function Wl(t) {
  const e = Ve(Hr, null, !1);
  return U(e, W), e.teardown = t, e;
}
function fn(t) {
  Bl();
  var e = (
    /** @type {Effect} */
    P.f
  ), n = !R && (e & He) !== 0 && (e & Nn) === 0;
  if (n) {
    var r = (
      /** @type {ComponentContext} */
      fe
    );
    (r.e ?? (r.e = [])).push(t);
  } else
    return Na(t);
}
function Na(t) {
  return Ve(Wn | ul, t, !1);
}
function Yl(t) {
  st.ensure();
  const e = Ve(Tt | Qt, t, !0);
  return () => {
    re(e);
  };
}
function Jl(t) {
  st.ensure();
  const e = Ve(Tt | Qt, t, !0);
  return (n = {}) => new Promise((r) => {
    n.outro ? Bt(e, () => {
      re(e), r(void 0);
    }) : (re(e), r(void 0));
  });
}
function Ca(t) {
  return Ve(Wn, t, !1);
}
function Kl(t) {
  return Ve(Ti | Qt, t, !0);
}
function Di(t, e = 0) {
  return Ve(Hr | e, t, !0);
}
function Je(t, e = [], n = [], r = []) {
  Ml(r, e, n, (i) => {
    Ve(Hr, () => t(...i.map(p)), !0);
  });
}
function Mi(t, e = 0) {
  var n = Ve(at | e, t, !0);
  return n;
}
function ye(t) {
  return Ve(He | Qt, t, !0);
}
function Ra(t) {
  var e = t.teardown;
  if (e !== null) {
    const n = Ot, r = R;
    ps(!0), oe(null);
    try {
      e.call(null);
    } finally {
      ps(n), oe(r);
    }
  }
}
function Hi(t, e = !1) {
  var n = t.first;
  for (t.first = t.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && Ta(() => {
      i.abort(kt);
    });
    var r = n.next;
    (n.f & Tt) !== 0 ? n.parent = null : re(n, e), n = r;
  }
}
function Xl(t) {
  for (var e = t.first; e !== null; ) {
    var n = e.next;
    (e.f & He) === 0 && re(e), e = n;
  }
}
function re(t, e = !0) {
  var n = !1;
  (e || (t.f & na) !== 0) && t.nodes !== null && t.nodes.end !== null && (Ia(
    t.nodes.start,
    /** @type {TemplateNode} */
    t.nodes.end
  ), n = !0), Hi(t, e && !n), Jn(t, 0), U(t, it);
  var r = t.nodes && t.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Ra(t);
  var i = t.parent;
  i !== null && i.first !== null && La(t), t.next = t.prev = t.teardown = t.ctx = t.deps = t.fn = t.nodes = t.ac = null;
}
function Ia(t, e) {
  for (; t !== null; ) {
    var n = t === e ? null : /* @__PURE__ */ je(t);
    t.remove(), t = n;
  }
}
function La(t) {
  var e = t.parent, n = t.prev, r = t.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), e !== null && (e.first === t && (e.first = r), e.last === t && (e.last = n));
}
function Bt(t, e, n = !0) {
  var r = [];
  ka(t, r, !0);
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
function ka(t, e, n) {
  if ((t.f & de) === 0) {
    t.f ^= de;
    var r = t.nodes && t.nodes.t;
    if (r !== null)
      for (const o of r)
        (o.is_global || n) && e.push(o);
    for (var i = t.first; i !== null; ) {
      var s = i.next, a = (i.f & wn) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & He) !== 0 && (t.f & at) !== 0;
      ka(i, e, a ? n : !1), i = s;
    }
  }
}
function ji(t) {
  Pa(t, !0);
}
function Pa(t, e) {
  if ((t.f & de) !== 0) {
    t.f ^= de, (t.f & W) === 0 && (U(t, Z), ke(t));
    for (var n = t.first; n !== null; ) {
      var r = n.next, i = (n.f & wn) !== 0 || (n.f & He) !== 0;
      Pa(n, i ? e : !1), n = r;
    }
    var s = t.nodes && t.nodes.t;
    if (s !== null)
      for (const a of s)
        (a.is_global || e) && a.in();
  }
}
function Da(t, e) {
  if (t.nodes)
    for (var n = t.nodes.start, r = t.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ je(n);
      e.append(n), n = i;
    }
}
let br = !1, Ot = !1;
function ps(t) {
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
function Ma(t) {
  R !== null && (Ee === null ? Ee = [t] : Ee.push(t));
}
let ae = null, le = 0, pe = null;
function Ql(t) {
  pe = t;
}
let Ha = 1, Dt = 0, Vt = Dt;
function vs(t) {
  Vt = t;
}
function ja() {
  return ++Ha;
}
function sr(t) {
  var e = t.f;
  if ((e & Z) !== 0)
    return !0;
  if (e & Q && (t.f &= -65537), (e & Me) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      t.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (sr(
        /** @type {Derived} */
        s
      ) && ma(
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
function Fa(t, e, n = !0) {
  var r = t.reactions;
  if (r !== null && !(Ee !== null && bn.call(Ee, t)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & Q) !== 0 ? Fa(
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
function qa(t) {
  var A;
  var e = ae, n = le, r = pe, i = R, s = Ee, a = fe, o = De, l = Vt, u = t.f;
  ae = /** @type {null | Value[]} */
  null, le = 0, pe = null, R = (u & (He | Tt)) === 0 ? t : null, Ee = null, $n(t.ctx), De = !1, Vt = ++Dt, t.ac !== null && (Ta(() => {
    t.ac.abort(kt);
  }), t.ac = null);
  try {
    t.f |= ci;
    var c = (
      /** @type {Function} */
      t.fn
    ), f = c();
    t.f |= Nn;
    var _ = t.deps, w = D == null ? void 0 : D.is_fork;
    if (ae !== null) {
      var g;
      if (w || Jn(t, le), _ !== null && le > 0)
        for (_.length = le + ae.length, g = 0; g < ae.length; g++)
          _[le + g] = ae[g];
      else
        t.deps = _ = ae;
      if (Pi() && (t.f & be) !== 0)
        for (g = le; g < _.length; g++)
          ((A = _[g]).reactions ?? (A.reactions = [])).push(t);
    } else !w && _ !== null && le < _.length && (Jn(t, le), _.length = le);
    if (aa() && pe !== null && !De && _ !== null && (t.f & (Q | Me | Z)) === 0)
      for (g = 0; g < /** @type {Source[]} */
      pe.length; g++)
        Fa(
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
    return la(d);
  } finally {
    t.f ^= ci, ae = e, le = n, pe = r, R = i, Ee = s, $n(a), De = o, Vt = l;
  }
}
function Zl(t, e) {
  let n = e.reactions;
  if (n !== null) {
    var r = il.call(n, t);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = e.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (e.f & Q) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (ae === null || !bn.call(ae, e))) {
    var s = (
      /** @type {Derived} */
      e
    );
    (s.f & be) !== 0 && (s.f ^= be, s.f &= -65537), Ri(s), Ul(s), Jn(s, 0);
  }
}
function Jn(t, e) {
  var n = t.deps;
  if (n !== null)
    for (var r = e; r < n.length; r++)
      Zl(t, n[r]);
}
function Sn(t) {
  var e = t.f;
  if ((e & it) === 0) {
    U(t, W);
    var n = P, r = br;
    P = t, br = !0;
    try {
      (e & (at | ea)) !== 0 ? Xl(t) : Hi(t), Ra(t);
      var i = qa(t);
      t.teardown = typeof i == "function" ? i : null, t.wv = Ha;
      var s;
      li && Nl && (t.f & Z) !== 0 && t.deps;
    } finally {
      br = r, P = n;
    }
  }
}
function p(t) {
  var e = t.f, n = (e & Q) !== 0;
  if (R !== null && !De) {
    var r = P !== null && (P.f & it) !== 0;
    if (!r && (Ee === null || !bn.call(Ee, t))) {
      var i = R.deps;
      if ((R.f & ci) !== 0)
        t.rv < Dt && (t.rv = Dt, ae === null && i !== null && i[le] === t ? le++ : ae === null ? ae = [t] : ae.push(t));
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
      return ((a.f & W) === 0 && a.reactions !== null || Ua(a)) && (o = Ii(a)), wt.set(a, o), o;
    }
    var l = (a.f & be) === 0 && !De && R !== null && (br || (R.f & be) !== 0), u = (a.f & Nn) === 0;
    sr(a) && (l && (a.f |= be), ma(a)), l && !u && (ya(a), Ga(a));
  }
  if (X != null && X.has(t))
    return X.get(t);
  if ((t.f & bt) !== 0)
    throw t.v;
  return t.v;
}
function Ga(t) {
  if (t.f |= be, t.deps !== null)
    for (const e of t.deps)
      (e.reactions ?? (e.reactions = [])).push(t), (e.f & Q) !== 0 && (e.f & be) === 0 && (ya(
        /** @type {Derived} */
        e
      ), Ga(
        /** @type {Derived} */
        e
      ));
}
function Ua(t) {
  if (t.v === K) return !0;
  if (t.deps === null) return !1;
  for (const e of t.deps)
    if (wt.has(e) || (e.f & Q) !== 0 && Ua(
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
const za = /* @__PURE__ */ new Set(), mi = /* @__PURE__ */ new Set();
function ec(t) {
  for (var e = 0; e < t.length; e++)
    za.add(t[e]);
  for (var n of mi)
    n(t);
}
let _s = null;
function fr(t) {
  var d;
  var e = this, n = (
    /** @type {Node} */
    e.ownerDocument
  ), r = t.type, i = ((d = t.composedPath) == null ? void 0 : d.call(t)) || [], s = (
    /** @type {null | Element} */
    i[0] || t.target
  );
  _s = t;
  var a = 0, o = _s === t && t.__root;
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
          var A = s["__" + r];
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
function Ba(t) {
  var e = Li("template");
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
  var n = (e & nl) !== 0, r = (e & rl) !== 0, i, s = !t.startsWith("<!>");
  return () => {
    if (L)
      return Et(I, null), I;
    i === void 0 && (i = Ba(s ? t : "<!>" + t), n || (i = /** @type {TemplateNode} */
    /* @__PURE__ */ Pe(i)));
    var a = (
      /** @type {TemplateNode} */
      r || $a ? document.importNode(i, !0) : i.cloneNode(!0)
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
function gs() {
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
    ((n.f & Nn) === 0 || n.nodes.end === null) && (n.nodes.end = I), En();
    return;
  }
  t !== null && t.before(
    /** @type {Node} */
    e
  );
}
const tc = ["touchstart", "touchmove"];
function nc(t) {
  return tc.includes(t);
}
function rc(t, e) {
  var n = e == null ? "" : typeof e == "object" ? e + "" : e;
  n !== (t.__t ?? (t.__t = t.nodeValue)) && (t.__t = n, t.nodeValue = n + "");
}
function Va(t, e) {
  return Wa(t, e);
}
function ic(t, e) {
  gi(), e.intro = e.intro ?? !1;
  const n = e.target, r = L, i = I;
  try {
    for (var s = /* @__PURE__ */ Pe(n); s && (s.nodeType !== Zt || /** @type {Comment} */
    s.data !== Si); )
      s = /* @__PURE__ */ je(s);
    if (!s)
      throw Yt;
    Le(!0), ne(
      /** @type {Comment} */
      s
    );
    const a = Wa(t, { ...e, anchor: s });
    return Le(!1), /**  @type {Exports} */
    a;
  } catch (a) {
    if (a instanceof Error && a.message.split(`
`).some((o) => o.startsWith("https://svelte.dev/e/")))
      throw a;
    return a !== Yt && console.warn("Failed to hydrate: ", a), e.recover === !1 && wl(), gi(), Sa(n), Le(!1), Va(t, e);
  } finally {
    Le(r), ne(i);
  }
}
const an = /* @__PURE__ */ new Map();
function Wa(t, { target: e, anchor: n, props: r = {}, events: i, context: s, intro: a = !0 }) {
  gi();
  var o = /* @__PURE__ */ new Set(), l = (f) => {
    for (var _ = 0; _ < f.length; _++) {
      var w = f[_];
      if (!o.has(w)) {
        o.add(w);
        var g = nc(w);
        e.addEventListener(w, fr, { passive: g });
        var A = an.get(w);
        A === void 0 ? (document.addEventListener(w, fr, { passive: g }), an.set(w, 1)) : an.set(w, A + 1);
      }
    }
  };
  l(Mr(za)), mi.add(l);
  var u = void 0, c = Jl(() => {
    var f = n ?? e.appendChild(we());
    return Pl(
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
        if (s && (w.c = s), i && (r.$$events = i), L && Et(
          /** @type {TemplateNode} */
          _,
          null
        ), u = t(_, r) || {}, L && (P.nodes.end = I, I === null || I.nodeType !== Zt || /** @type {Comment} */
        I.data !== xi))
          throw ir(), Yt;
        Ci();
      }
    ), () => {
      var g;
      for (var _ of o) {
        e.removeEventListener(_, fr);
        var w = (
          /** @type {number} */
          an.get(_)
        );
        --w === 0 ? (document.removeEventListener(_, fr), an.delete(_)) : an.set(_, w);
      }
      mi.delete(l), f !== n && ((g = f.parentNode) == null || g.removeChild(f));
    };
  });
  return yi.set(u, c), u;
}
let yi = /* @__PURE__ */ new WeakMap();
function sc(t, e) {
  const n = yi.get(t);
  return n ? (yi.delete(t), n(e)) : Promise.resolve();
}
var Ne, ze, ue, Ut, nr, rr, Pr;
class ac {
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
    N(this, nr, !0);
    N(this, rr, () => {
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
          ji(r), h(this, Ut).delete(n);
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
              Da(a, u), u.append(we()), h(this, ue).set(s, { effect: a, fragment: u });
            } else
              re(a);
            h(this, Ut).delete(s), h(this, ze).delete(s);
          };
          h(this, nr) || !r ? (h(this, Ut).add(s), Bt(a, o, !1)) : o();
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
    this.anchor = e, x(this, nr, n);
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
    ), i = xa();
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
      r.oncommit(h(this, rr)), r.ondiscard(h(this, Pr));
    } else
      L && (this.anchor = I), h(this, rr).call(this);
  }
}
Ne = new WeakMap(), ze = new WeakMap(), ue = new WeakMap(), Ut = new WeakMap(), nr = new WeakMap(), rr = new WeakMap(), Pr = new WeakMap();
function Ya(t) {
  fe === null && pl(), fn(() => {
    const e = Ce(t);
    if (typeof e == "function") return (
      /** @type {() => void} */
      e
    );
  });
}
function ft(t, e, n = !1) {
  L && En();
  var r = new ac(t), i = n ? wn : 0;
  function s(a, o) {
    if (L) {
      const c = ra(t);
      var l;
      if (c === Si ? l = 0 : c === Dr ? l = !1 : l = parseInt(c.substring(1)), a !== l) {
        var u = Tr();
        ne(u), r.anchor = u, Le(!1), r.ensure(a, o), Le(!0);
        return;
      }
    }
    r.ensure(a, o);
  }
  Mi(() => {
    var a = !1;
    e((o, l = 0) => {
      a = !0, s(l, o);
    }), a || s(!1, null);
  }, i);
}
function oc(t, e, n) {
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
            bi(Mr(s.done)), _.delete(s), _.size === 0 && (t.outrogroups = null);
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
      Sa(c), c.append(u), t.items.clear();
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
var ms;
function lc(t, e, n, r, i, s = null) {
  var a = t, o = /* @__PURE__ */ new Map();
  {
    var l = (
      /** @type {Element} */
      t
    );
    a = L ? ne(/* @__PURE__ */ Pe(l)) : l.appendChild(we());
  }
  L && En();
  var u = null, c = /* @__PURE__ */ Fl(() => {
    var d = n();
    return Xs(d) ? d : d == null ? [] : Mr(d);
  }), f, _ = !0;
  function w() {
    A.fallback = u, cc(A, f, a, e, r), u !== null && (f.length === 0 ? (u.f & mt) === 0 ? ji(u) : (u.f ^= mt, jn(u, null, a)) : Bt(u, () => {
      u = null;
    }));
  }
  var g = Mi(() => {
    f = /** @type {V[]} */
    p(c);
    var d = f.length;
    let v = !1;
    if (L) {
      var y = ra(a) === Dr;
      y !== (d === 0) && (a = Tr(), ne(a), Le(!1), v = !0);
    }
    for (var b = /* @__PURE__ */ new Set(), S = (
      /** @type {Batch} */
      D
    ), T = xa(), C = 0; C < d; C += 1) {
      L && I.nodeType === Zt && /** @type {Comment} */
      I.data === xi && (a = /** @type {Comment} */
      I, v = !0, Le(!1));
      var k = f[C], F = r(k, C), H = _ ? null : o.get(F);
      H ? (H.v && On(H.v, k), H.i && On(H.i, C), T && S.unskip_effect(H.e)) : (H = uc(
        o,
        _ ? a : ms ?? (ms = we()),
        k,
        F,
        C,
        i,
        e,
        n
      ), _ || (H.e.f |= mt), o.set(F, H)), b.add(F);
    }
    if (d === 0 && s && !u && (_ ? u = ye(() => s(a)) : (u = ye(() => s(ms ?? (ms = we()))), u.f |= mt)), d > b.size && _l(), L && d > 0 && ne(Tr()), !_)
      if (T) {
        for (const [cr, Cn] of o)
          b.has(cr) || S.skip_effect(Cn.e);
        S.oncommit(w), S.ondiscard(() => {
        });
      } else
        w();
    v && Le(!0), p(c);
  }), A = { effect: g, items: o, outrogroups: null, fallback: u };
  _ = !1, L && (a = I);
}
function Dn(t) {
  for (; t !== null && (t.f & He) === 0; )
    t = t.next;
  return t;
}
function cc(t, e, n, r, i) {
  var F;
  var s = e.length, a = t.items, o = Dn(t.effect.first), l, u = null, c = [], f = [], _, w, g, A;
  for (A = 0; A < s; A += 1) {
    if (_ = e[A], w = i(_, A), g = /** @type {EachItem} */
    a.get(w).e, t.outrogroups !== null)
      for (const H of t.outrogroups)
        H.pending.delete(g), H.done.delete(g);
    if ((g.f & mt) !== 0)
      if (g.f ^= mt, g === o)
        jn(g, null, n);
      else {
        var d = u ? u.next : o;
        g === t.effect.last && (t.effect.last = g.prev), g.prev && (g.prev.next = g.next), g.next && (g.next.prev = g.prev), ct(t, u, g), ct(t, g, d), jn(g, d, n), u = g, c = [], f = [], o = Dn(u.next);
        continue;
      }
    if ((g.f & de) !== 0 && ji(g), g !== o) {
      if (l !== void 0 && l.has(g)) {
        if (c.length < f.length) {
          var v = f[0], y;
          u = v.prev;
          var b = c[0], S = c[c.length - 1];
          for (y = 0; y < c.length; y += 1)
            jn(c[y], v, n);
          for (y = 0; y < f.length; y += 1)
            l.delete(f[y]);
          ct(t, b.prev, S.next), ct(t, u, b), ct(t, S, v), o = v, u = S, A -= 1, c = [], f = [];
        } else
          l.delete(g), jn(g, o, n), ct(t, g.prev, g.next), ct(t, g, u === null ? t.effect.first : u.next), ct(t, u, g), u = g;
        continue;
      }
      for (c = [], f = []; o !== null && o !== g; )
        (l ?? (l = /* @__PURE__ */ new Set())).add(o), f.push(o), o = Dn(o.next);
      if (o === null)
        continue;
    }
    (g.f & mt) === 0 && c.push(g), u = g, o = Dn(g.next);
  }
  if (t.outrogroups !== null) {
    for (const H of t.outrogroups)
      H.pending.size === 0 && (bi(Mr(H.done)), (F = t.outrogroups) == null || F.delete(H));
    t.outrogroups.size === 0 && (t.outrogroups = null);
  }
  if (o !== null || l !== void 0) {
    var T = [];
    if (l !== void 0)
      for (g of l)
        (g.f & de) === 0 && T.push(g);
    for (; o !== null; )
      (o.f & de) === 0 && o !== t.fallback && T.push(o), o = Dn(o.next);
    var C = T.length;
    if (C > 0) {
      var k = s === 0 ? n : null;
      oc(t, T, k);
    }
  }
}
function uc(t, e, n, r, i, s, a, o) {
  var l = (a & Zo) !== 0 ? (a & tl) === 0 ? /* @__PURE__ */ wa(n, !1, !1) : Jt(n) : null, u = (a & el) !== 0 ? Jt(i) : null;
  return {
    v: l,
    i: u,
    e: ye(() => (s(e, l ?? n, u ?? i, o), () => {
      t.delete(r);
    }))
  };
}
function jn(t, e, n) {
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
function dc(t, e, n = !1, r = !1, i = !1) {
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
    if (o.nodes !== null && (Ia(
      o.nodes.start,
      /** @type {TemplateNode} */
      o.nodes.end
    ), o.nodes = null), a !== "") {
      if (L) {
        I.data;
        for (var l = En(), u = l; l !== null && (l.nodeType !== Zt || /** @type {Comment} */
        l.data !== ""); )
          u = l, l = /* @__PURE__ */ je(l);
        if (l === null)
          throw ir(), Yt;
        Et(I, u), s = ne(l);
        return;
      }
      var c = a + "";
      n ? c = `<svg>${c}</svg>` : r && (c = `<math>${c}</math>`);
      var f = Ba(c);
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
function Ja(t, e) {
  Ca(() => {
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
      const i = Li("style");
      i.id = e.hash, i.textContent = e.code, r.appendChild(i);
    }
  });
}
function fc(t, e, n) {
  var r = t == null ? "" : "" + t;
  return e && (r = r ? r + " " + e : e), r === "" ? null : r;
}
function hc(t, e) {
  return t == null ? null : String(t);
}
function Se(t, e, n, r, i, s) {
  var a = t.__className;
  if (L || a !== n || a === void 0) {
    var o = fc(n, r);
    (!L || o !== t.getAttribute("class")) && (o == null ? t.removeAttribute("class") : t.className = o), t.__className = n;
  }
  return s;
}
function ht(t, e, n, r) {
  var i = t.__style;
  if (L || i !== e) {
    var s = hc(e);
    (!L || s !== t.getAttribute("style")) && (s == null ? t.removeAttribute("style") : t.style.cssText = s), t.__style = e;
  }
  return r;
}
const pc = Symbol("is custom element"), vc = Symbol("is html"), _c = hl ? "link" : "LINK";
function Ka(t, e, n, r) {
  var i = gc(t);
  L && (i[e] = t.getAttribute(e), e === "src" || e === "srcset" || e === "href" && t.nodeName === _c) || i[e] !== (i[e] = n) && (e === "loading" && (t[fl] = n), n == null ? t.removeAttribute(e) : typeof n != "string" && Xa(t).includes(e) ? t[e] = n : t.setAttribute(e, n));
}
function ys(t, e, n) {
  var r = R, i = P;
  let s = L;
  L && Le(!1), oe(null), $e(null);
  try {
    // `style` should use `set_attribute` rather than the setter
    e !== "style" && // Don't compute setters for custom elements while they aren't registered yet,
    // because during their upgrade/instantiation they might add more setters.
    // Instead, fall back to a simple "an object, then set as property" heuristic.
    (wi.has(t.getAttribute("is") || t.nodeName) || // customElements may not be available in browser extension contexts
    !customElements || customElements.get(t.getAttribute("is") || t.nodeName.toLowerCase()) ? Xa(t).includes(e) : n && typeof n == "object") ? t[e] = n : Ka(t, e, n == null ? n : String(n));
  } finally {
    oe(r), $e(i), s && Le(!0);
  }
}
function gc(t) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    t.__attributes ?? (t.__attributes = {
      [pc]: t.nodeName.includes("-"),
      [vc]: t.namespaceURI === Ks
    })
  );
}
var wi = /* @__PURE__ */ new Map();
function Xa(t) {
  var e = t.getAttribute("is") || t.nodeName, n = wi.get(e);
  if (n) return n;
  wi.set(e, n = []);
  for (var r, i = t, s = Element.prototype; s !== i; ) {
    r = sl(i);
    for (var a in r)
      r[a].set && n.push(a);
    i = Qs(i);
  }
  return n;
}
function bs(t, e) {
  return t === e || (t == null ? void 0 : t[gr]) === e;
}
function pt(t = {}, e, n, r) {
  return Ca(() => {
    var i, s;
    return Di(() => {
      i = s, s = [], Ce(() => {
        t !== n(...s) && (e(t, ...s), i && bs(n(...i), t) && e(null, ...i));
      });
    }), () => {
      zt(() => {
        s && bs(n(...s), t) && e(null, ...s);
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
function mc(t) {
  return new yc(t);
}
var tt, ge;
class yc {
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
      var l = /* @__PURE__ */ wa(o, !1, !1);
      return n.set(a, l), l;
    };
    const i = new Proxy(
      { ...e.props || {}, $$events: {} },
      {
        get(a, o) {
          return p(n.get(o) ?? r(o, Reflect.get(a, o)));
        },
        has(a, o) {
          return o === dl ? !0 : (p(n.get(o) ?? r(o, Reflect.get(a, o))), Reflect.has(a, o));
        },
        set(a, o, l) {
          return O(n.get(o) ?? r(o, l), l), Reflect.set(a, o, l);
        }
      }
    );
    x(this, ge, (e.hydrate ? ic : Va)(e.component, {
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
      sc(h(this, ge));
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
let Qa;
typeof HTMLElement == "function" && (Qa = class extends HTMLElement {
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
          const a = Li("slot");
          i !== "default" && (a.name = i), ve(s, a);
        };
      };
      if (await Promise.resolve(), !this.$$cn || this.$$c)
        return;
      const n = {}, r = bc(this);
      for (const i of this.$$s)
        i in r && (i === "default" && !this.$$d.children ? (this.$$d.children = e(i), n.default = !0) : n[i] = e(i));
      for (const i of this.attributes) {
        const s = this.$$g_p(i.name);
        s in this.$$d || (this.$$d[s] = wr(s, i.value, this.$$p_d, "toProp"));
      }
      for (const i in this.$$p_d)
        !(i in this.$$d) && this[i] !== void 0 && (this.$$d[i] = this[i], delete this[i]);
      this.$$c = mc({
        component: this.$$ctor,
        target: this.$$shadowRoot || this,
        props: {
          ...this.$$d,
          $$slots: n,
          $$host: this
        }
      }), this.$$me = Yl(() => {
        Di(() => {
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
function bc(t) {
  const e = {};
  return t.childNodes.forEach((n) => {
    e[
      /** @type {Element} node */
      n.slot || "default"
    ] = !0;
  }), e;
}
function Za(t, e, n, r, i, s) {
  let a = class extends Qa {
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
          var c = (f = dn(u, o)) == null ? void 0 : f.get;
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
class Fi extends Error {
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  constructor(e, ...n) {
    super(...n), Error.captureStackTrace && Error.captureStackTrace(this, Fi), this.name = "TimeoutError", this.timeout = e, this.message = `Timed out in ${e} ms.`;
  }
}
const wc = (t, e) => {
  const n = new Promise((r, i) => {
    setTimeout(() => {
      i(new Fi(t));
    }, t);
  });
  return Promise.race([e, n]);
}, eo = (t) => {
  if (typeof t.getCardSize == "function")
    try {
      return wc(500, t.getCardSize()).catch(
        () => 1
      );
    } catch {
      return 1;
    }
  return customElements.get(t.localName) ? 1 : customElements.whenDefined(t.localName).then(() => eo(t));
};
var Ec = /* @__PURE__ */ ot('<span class="loading svelte-lv9s7p">Loading...</span>'), $c = /* @__PURE__ */ ot("<div><!></div>");
const Ac = {
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
  Ni(e, !0), Ja(t, Ac);
  const n = Te(e, "config"), r = Te(e, "hass"), i = Te(e, "preview"), s = Te(e, "marginTop", 7, "0px"), a = Te(e, "open"), o = Te(e, "animation", 7, !0), l = Te(e, "animationState"), u = Te(e, "clearCardCss", 7, !1);
  let c = null, f = /* @__PURE__ */ M(null), _ = /* @__PURE__ */ M(!0), w = /* @__PURE__ */ M(0);
  const g = Ce(() => JSON.parse(JSON.stringify(n())));
  fn(() => {
    p(f) && (p(f).hass = r());
  }), fn(() => {
    p(f) && i() !== void 0 && (p(f).preview = i());
  }), fn(() => {
    var b;
    p(f) && (g.disabled = !a(), (b = p(f)._element) == null || b.dispatchEvent(new CustomEvent("card-visibility-changed", { detail: { value: a() }, bubbles: !0, composed: !1 })));
  }), Ya(async () => {
    const b = document.createElement("hui-card");
    b.hass = r(), b.preview = i(), g.disabled = !a(), b.config = g, b.load(), c == null || c.appendChild(b), O(f, b, !0), O(_, !1), p(f).addEventListener(
      "ll-upgrade",
      (S) => {
        var T;
        S.stopPropagation(), (T = p(f)) != null && T._element && r() && (p(f)._element.hass = r());
      },
      { capture: !0 }
    ), u() && (b.style.setProperty("--ha-card-background", "transparent"), b.style.setProperty("--ha-card-box-shadow", "none"), b.style.setProperty("--ha-card-border-color", "transparent"), b.style.setProperty("--ha-card-border-width", "0px"), b.style.setProperty("--ha-card-backdrop-filter", "none")), o() && (O(w, await eo(b) * 56), c && O(w, p(w) + (window.getComputedStyle(c).marginTop ? parseFloat(window.getComputedStyle(c).marginTop) : 0)), new ResizeObserver((T) => {
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
  }, d = $c(), v = dt(d);
  {
    var y = (b) => {
      var S = Ec();
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
customElements.define("expander-sub-card", Za(
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
const Oc = (t, e) => {
  var n;
  (n = t.dispatchEvent) == null || n.call(
    t,
    new CustomEvent(
      "haptic",
      { detail: e, bubbles: !0, composed: !0 }
    )
  );
};
var ar = function(t, e, n) {
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
function Jr(t, e, n) {
  if (arguments.length === 2) for (var r, i = 0, s = e.length; i < s; i++) !r && i in e || (r || (r = Array.prototype.slice.call(e, 0, i)), r[i] = e[i]);
  return t.concat(r || Array.prototype.slice.call(e));
}
var Cr, un, Re, vt, Kr = "[home-assistant-javascript-templates]", Sc = /^([a-z_]+)\.(\w+)$/;
(function(t) {
  t.UNKNOWN = "unknown", t.UNAVAILABLE = "unavailable";
})(Cr || (Cr = {})), function(t) {
  t.AREA_ID = "area_id", t.NAME = "name";
}(un || (un = {})), function(t) {
  t.PANEL_URL = "panel_url", t.LANG = "lang";
}(Re || (Re = {})), function(t) {
  t.LOCATION_CHANGED = "location-changed", t.TRANSLATIONS_UPDATED = "translations-updated", t.POPSTATE = "popstate", t.SUBSCRIBE_EVENTS = "subscribe_events", t.STATE_CHANGE_EVENT = "state_changed";
}(vt || (vt = {}));
var ws = function(t) {
  return t.reduce(function(e, n) {
    var r = n[0], i = n[1];
    return e[r.replace(Sc, "$2")] = i, e;
  }, {});
}, ut = function(t) {
  return t.includes(".");
}, Er = "ref", It = "value", Es = "toJSON", $s = function(t) {
  return "".concat(Er, ".").concat(t);
};
function xc(t, e, n) {
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
    throw SyntaxError("".concat(Kr, ": states method cannot be used with a domain, use it as an object instead."));
  }, { get: function(d, v) {
    if (ut(v)) return _(v), A(t.hass.states[v]);
    var y = Object.entries(t.hass.states).filter(function(b) {
      return b[0].startsWith(v);
    });
    return y.length || c(v), new Proxy(ws(y), { get: function(b, S) {
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
    return v.length || c(d), new Proxy(ws(v), { get: function(y, b) {
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
    if (d in t.hass.devices) return this.device_attr(d, un.AREA_ID);
    var b = (v = t.hass.entities[d]) === null || v === void 0 ? void 0 : v.device_id;
    if (b) return this.device_attr(b, un.AREA_ID);
    var S = r().find(function(T) {
      return T[1].name === d;
    });
    return (y = S == null ? void 0 : S[1]) === null || y === void 0 ? void 0 : y.area_id;
  }, area_name: function(d) {
    var v, y, b;
    d in t.hass.devices && (b = this.device_attr(d, un.AREA_ID));
    var S = (v = t.hass.entities[d]) === null || v === void 0 ? void 0 : v.device_id;
    S && (b = this.device_attr(S, un.AREA_ID));
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
    var S = $s(v);
    if (o.has(v)) return o.get(v);
    var T = new Proxy(((b = {})[It] = y, b[Es] = function() {
      return this[It];
    }, b), { get: function(C, k, F) {
      if (k === It || k === Es) return w(S), Reflect.get(C, k, F);
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
    var y = $s(v);
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
var Tc = function() {
  function t(e, n) {
    var r = n.throwErrors, i = r !== void 0 && r, s = n.throwWarnings, a = s === void 0 || s, o = n.variables, l = o === void 0 ? {} : o, u = n.refs, c = u === void 0 ? {} : u, f = n.refsVariableName, _ = f === void 0 ? "refs" : f, w = n.autoReturn, g = w === void 0 || w;
    this._throwErrors = i, this._throwWarnings = a, this._variables = l, this._refsVariableName = _, this._autoReturn = g, this._subscriptions = /* @__PURE__ */ new Map(), this._clientSideEntitiesRegExp = new RegExp("(^|[ \\?(+:\\{\\[><,])(".concat(Object.values(Re).join("|"), ")($|[ \\?)+:\\}\\]><.,])"), "gm"), this._scopped = xc(e, i, a), this.refs = c, this._watchForPanelUrlChange(), this._watchForEntitiesChange(), this._watchForLanguageChange();
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
      return new (Function.bind.apply(Function, Jr(Jr([void 0, "hass", "states", "state_translated", "is_state", "state_attr", "is_state_attr", "has_value", "entities", "entity_prop", "is_entity_prop", "devices", "device_attr", "is_device_attr", "device_id", "device_name", "areas", "area_id", "area_name", "area_entities", "area_devices", "user_name", "user_is_admin", "user_is_owner", "user_agent", "clientSide", "ref", "unref", this._refsVariableName], Array.from(o.keys()), !1), ["".concat('"use strict";', " ").concat(u)], !1)))().apply(void 0, Jr([this._scopped.hass, this._scopped.states, this._scopped.state_translated.bind(this._scopped), this._scopped.is_state.bind(this._scopped), this._scopped.state_attr.bind(this._scopped), this._scopped.is_state_attr.bind(this._scopped), this._scopped.has_value.bind(this._scopped), this._scopped.entities, this._scopped.entity_prop, this._scopped.is_entity_prop.bind(this._scopped), this._scopped.devices, this._scopped.device_attr.bind(this._scopped), this._scopped.is_device_attr.bind(this._scopped), this._scopped.device_id.bind(this._scopped), this._scopped.device_name.bind(this._scopped), this._scopped.areas.bind(this._scopped), this._scopped.area_id.bind(this._scopped), this._scopped.area_name.bind(this._scopped), this._scopped.area_entities.bind(this._scopped), this._scopped.area_devices.bind(this._scopped), this._scopped.user_name, this._scopped.user_is_admin, this._scopped.user_is_owner, this._scopped.user_agent, this._scopped.clientSideProxy, this._scopped.ref.bind(this._scopped, this._entityWatchCallback.bind(this)), this._scopped.unref.bind(this._scopped, this.cleanTracked.bind(this)), this._scopped.refs(this._entityWatchCallback.bind(this), this.cleanTracked.bind(this), a)], Array.from(o.values()), !1));
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
}(), Nc = function() {
  function t(e, n) {
    n === void 0 && (n = {}), this._renderer = ar(function() {
      return e.hass;
    }, function(r) {
      return !!(r && r.areas && r.devices && r.entities && r.states && r.user);
    }, { retries: 100, delay: 50, rejectMessage: "The provided element doesn't contain a proper or initialised hass object" }).then(function() {
      return new Tc(e, n);
    });
  }
  return t.prototype.getRenderer = function() {
    return this._renderer;
  }, t;
}();
function Cc(t = {}, e = {}) {
  return new Nc(
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
function As(t, e, n, r = {}) {
  if (!$r(n))
    throw new Error("Not a valid JS template");
  return n = String(n).trim().slice(3, -3), t.then((i) => i.trackTemplate(n, e, { variables: r }));
}
function Os(t, e, n) {
  t.then((r) => {
    r.refs[e] = n;
  });
}
function Rc(t, e) {
  t.then((n) => {
    const r = e.detail;
    Object.keys(r).forEach((i) => {
      const s = r[i].property, a = r[i].value, o = `${i}_${s}`;
      n.refs[o] = a;
    });
  });
}
function Ic(t, e) {
  const n = Rc.bind(null, t);
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
var Kt = "$", to = ":host", qi = "invalid selector", St = 10, xt = 10, Gi = function(t) {
  var e, n = t[0], r = t[1];
  return (e = n) && (e instanceof Document || e instanceof Element || e instanceof ShadowRoot) && typeof r == "string";
};
function Ui(t, e) {
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
function no(t, e) {
  var n = e ? " If you want to select a shadowRoot, use ".concat(e, " instead.") : "";
  return "".concat(t, " cannot be used with a selector ending in a shadowRoot (").concat(Kt, ").").concat(n);
}
function on(t) {
  return t instanceof Promise ? t : Promise.resolve(t);
}
function ro() {
  return "You can not select a shadowRoot (".concat(Kt, ") of the document.");
}
function io() {
  return "You can not select a shadowRoot (".concat(Kt, ") of a shadowRoot.");
}
function zi(t, e) {
  for (var n, r, i = null, s = t.length, a = 0; a < s; a++) {
    if (a === 0) if (t[a].length) i = e.querySelector(t[a]);
    else {
      if (e instanceof Document) throw new SyntaxError(ro());
      if (e instanceof ShadowRoot) throw new SyntaxError(io());
      i = ((n = e.shadowRoot) === null || n === void 0 ? void 0 : n.querySelector(t[++a])) || null;
    }
    else i = ((r = i.shadowRoot) === null || r === void 0 ? void 0 : r.querySelector("".concat(to, " ").concat(t[a]))) || null;
    if (i === null) return null;
  }
  return i;
}
function Lc(t, e) {
  var n, r = function(a, o, l) {
    for (var u, c = 0, f = o.length; c < f; c++) !u && c in o || (u || (u = Array.prototype.slice.call(o, 0, c)), u[c] = o[c]);
    return a.concat(u || Array.prototype.slice.call(o));
  }([], t), i = r.pop();
  if (!r.length) return e.querySelectorAll(i);
  var s = zi(r, e);
  return ((n = s == null ? void 0 : s.shadowRoot) === null || n === void 0 ? void 0 : n.querySelectorAll("".concat(to, " ").concat(i))) || null;
}
function kc(t, e) {
  if (t.length === 1 && !t[0].length) {
    if (e instanceof Document) throw new SyntaxError(ro());
    if (e instanceof ShadowRoot) throw new SyntaxError(io());
    return e.shadowRoot;
  }
  var n = zi(t, e);
  return (n == null ? void 0 : n.shadowRoot) || null;
}
function Pc(t, e, n, r) {
  for (var i = Ui(t, function(l) {
    if (!l[l.length - 1].length) throw new SyntaxError(no(n, r));
    return l;
  }), s = i.length, a = 0; a < s; a++) {
    var o = zi(i[a], e);
    if (o) return o;
  }
  return null;
}
function Dc(t, e, n) {
  for (var r = Ui(t, function(o) {
    if (!o[o.length - 1].length) throw new SyntaxError(no(n));
    return o;
  }), i = r.length, s = 0; s < i; s++) {
    var a = Lc(r[s], e);
    if (a != null && a.length) return a;
  }
  return document.querySelectorAll(qi);
}
function Mc(t, e, n, r) {
  for (var i = Ui(t, function(l) {
    if (l.pop().length) throw new SyntaxError(function(u, c) {
      return "".concat(u, " must be used with a selector ending in a shadowRoot (").concat(Kt, "). If you don't want to select a shadowRoot, use ").concat(c, " instead.");
    }(n, r));
    return l;
  }), s = i.length, a = 0; a < s; a++) {
    var o = kc(i[a], e);
    if (o) return o;
  }
  return null;
}
function Ss(t, e, n, r) {
  return en(this, void 0, void 0, function() {
    return tn(this, function(i) {
      return [2, ar(function() {
        return Pc(t, e, "asyncQuerySelector", "asyncShadowRootQuerySelector");
      }, function(s) {
        return !!s;
      }, { retries: n, delay: r, shouldReject: !1 })];
    });
  });
}
function xs(t, e, n, r) {
  return en(this, void 0, void 0, function() {
    return tn(this, function(i) {
      return [2, ar(function() {
        return Dc(t, e, "asyncQuerySelectorAll");
      }, function(s) {
        return !!s.length;
      }, { retries: n, delay: r, shouldReject: !1 })];
    });
  });
}
function Ts(t, e, n, r) {
  return en(this, void 0, void 0, function() {
    return tn(this, function(i) {
      return [2, ar(function() {
        return Mc(t, e, "asyncShadowRootQuerySelector", "asyncQuerySelector");
      }, function(s) {
        return !!s;
      }, { retries: n, delay: r, shouldReject: !1 })];
    });
  });
}
var $i = function(t, e) {
  var n = t.querySelectorAll(e);
  if (n.length) return n;
  if (t instanceof Element && t.shadowRoot) {
    var r = $i(t.shadowRoot, e);
    if (r.length) return r;
  }
  for (var i = 0, s = Array.from(t.querySelectorAll("*")); i < s.length; i++) {
    var a = s[i], o = $i(a, e);
    if (o.length) return o;
  }
  return document.querySelectorAll(qi);
}, Ns = function(t, e, n, r) {
  return ar(function() {
    return $i(t, e);
  }, function(i) {
    return !!i.length;
  }, { retries: n, delay: r, shouldReject: !1 });
};
function Cs() {
  for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
  return en(this, void 0, void 0, function() {
    var n, r, i, s, a;
    return tn(this, function(o) {
      switch (o.label) {
        case 0:
          return Gi(t) ? (n = t[0], r = t[1], i = t[2], [4, Ss(r, n, (i == null ? void 0 : i.retries) || St, (i == null ? void 0 : i.delay) || xt)]) : [3, 2];
        case 1:
        case 3:
          return [2, o.sent()];
        case 2:
          return s = t[0], a = t[1], [4, Ss(s, document, (a == null ? void 0 : a.retries) || St, (a == null ? void 0 : a.delay) || xt)];
      }
    });
  });
}
function Rs() {
  for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
  return en(this, void 0, void 0, function() {
    var n, r, i, s, a;
    return tn(this, function(o) {
      switch (o.label) {
        case 0:
          return Gi(t) ? (n = t[0], r = t[1], i = t[2], [4, xs(r, n, (i == null ? void 0 : i.retries) || St, (i == null ? void 0 : i.delay) || xt)]) : [3, 2];
        case 1:
          return [2, o.sent()];
        case 2:
          return s = t[0], a = t[1], [2, xs(s, document, (a == null ? void 0 : a.retries) || St, (a == null ? void 0 : a.delay) || xt)];
      }
    });
  });
}
function Is() {
  for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
  return en(this, void 0, void 0, function() {
    var n, r, i, s, a;
    return tn(this, function(o) {
      switch (o.label) {
        case 0:
          return Gi(t) ? (n = t[0], r = t[1], i = t[2], [4, Ts(r, n, (i == null ? void 0 : i.retries) || St, (i == null ? void 0 : i.delay) || xt)]) : [3, 2];
        case 1:
          return [2, o.sent()];
        case 2:
          return s = t[0], a = t[1], [2, Ts(s, document, (a == null ? void 0 : a.retries) || St, (a == null ? void 0 : a.delay) || xt)];
      }
    });
  });
}
var Hc = function() {
  function t(e, n) {
    e instanceof Node || e instanceof Promise ? (this._element = e, this._asyncParams = Rr({ retries: St, delay: xt }, n || {})) : (this._element = document, this._asyncParams = Rr({ retries: St, delay: xt }, e || {}));
  }
  return Object.defineProperty(t.prototype, "element", { get: function() {
    return on(this._element).then(function(e) {
      return e instanceof NodeList ? e[0] || null : e;
    });
  }, enumerable: !1, configurable: !0 }), Object.defineProperty(t.prototype, "$", { get: function() {
    var e = this;
    return new t(on(this._element).then(function(n) {
      return n instanceof Document || n instanceof ShadowRoot || n === null || n instanceof NodeList && n.length === 0 ? null : n instanceof NodeList ? Is(n[0], Kt, e._asyncParams) : Is(n, Kt, e._asyncParams);
    }), this._asyncParams);
  }, enumerable: !1, configurable: !0 }), Object.defineProperty(t.prototype, "all", { get: function() {
    return on(this._element).then(function(e) {
      return e instanceof NodeList ? e : document.querySelectorAll(qi);
    });
  }, enumerable: !1, configurable: !0 }), Object.defineProperty(t.prototype, "asyncParams", { get: function() {
    return this._asyncParams;
  }, enumerable: !1, configurable: !0 }), t.prototype.eq = function(e) {
    return en(this, void 0, void 0, function() {
      return tn(this, function(n) {
        return [2, on(this._element).then(function(r) {
          return r instanceof NodeList && r[e] || null;
        })];
      });
    });
  }, t.prototype.query = function(e) {
    var n = this;
    return new t(on(this._element).then(function(r) {
      return r === null || r instanceof NodeList && r.length === 0 ? null : r instanceof NodeList ? Rs(r[0], e, n._asyncParams) : Rs(r, e, n._asyncParams);
    }), this._asyncParams);
  }, t.prototype.deepQuery = function(e) {
    var n = this;
    return new t(on(this._element).then(function(r) {
      return r === null || r instanceof NodeList && r.length === 0 ? null : r instanceof NodeList ? Promise.race(Array.from(r).map(function(i) {
        return Ns(i, e, n._asyncParams.retries, n._asyncParams.delay);
      })) : Ns(r, e, n._asyncParams.retries, n._asyncParams.delay);
    }), this._asyncParams);
  }, t;
}(), Ai = function(t, e) {
  return Ai = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(n, r) {
    n.__proto__ = r;
  } || function(n, r) {
    for (var i in r) Object.prototype.hasOwnProperty.call(r, i) && (n[i] = r[i]);
  }, Ai(t, e);
}, rt = function() {
  return rt = Object.assign || function(t) {
    for (var e, n = 1, r = arguments.length; n < r; n++) for (var i in e = arguments[n]) Object.prototype.hasOwnProperty.call(e, i) && (t[i] = e[i]);
    return t;
  }, rt.apply(this, arguments);
};
var Ie, yt, B, Ke, Ls, Xr, Qr, hr, ks, Zr, pr, ei, ti, ni, Mn, j, $t = "$", jc = { retries: 100, delay: 50, eventThreshold: 450 };
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
var Fc = ((Ls = {})[Ie.HOME_ASSISTANT] = { selector: j.HOME_ASSISTANT, children: { shadowRoot: { selector: $t, children: (Xr = {}, Xr[Ie.HOME_ASSISTANT_MAIN] = { selector: j.HOME_ASSISTANT_MAIN, children: { shadowRoot: { selector: $t, children: (Qr = {}, Qr[Ie.HA_DRAWER] = { selector: j.HA_DRAWER, children: (hr = {}, hr[Ie.HA_SIDEBAR] = { selector: j.HA_SIDEBAR, children: { shadowRoot: { selector: $t } } }, hr[Ie.PARTIAL_PANEL_RESOLVER] = { selector: j.PARTIAL_PANEL_RESOLVER }, hr) }, Qr) } } }, Xr) } } }, Ls), qc = ((ks = {})[yt.HA_PANEL_LOVELACE] = { selector: j.HA_PANEL_LOVELACE, children: { shadowRoot: { selector: $t, children: (Zr = {}, Zr[yt.HUI_ROOT] = { selector: j.HUI_ROOT, children: { shadowRoot: { selector: $t, children: (pr = {}, pr[yt.HEADER] = { selector: j.HEADER }, pr[yt.HUI_VIEW] = { selector: j.HUI_VIEW }, pr) } } }, Zr) } } }, ks), Gc = { shadowRoot: { selector: $t, children: (ei = {}, ei[B.HA_MORE_INFO_DIALOG] = { selector: j.HA_MORE_INFO_DIALOG, children: { shadowRoot: { selector: $t, children: (ti = {}, ti[B.HA_DIALOG] = { selector: j.HA_DIALOG, children: (ni = {}, ni[B.HA_DIALOG_CONTENT] = { selector: j.HA_DIALOG_CONTENT, children: (Mn = {}, Mn[B.HA_MORE_INFO_DIALOG_INFO] = { selector: j.HA_MORE_INFO_DIALOG_INFO }, Mn[B.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK] = { selector: j.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK }, Mn[B.HA_DIALOG_MORE_INFO_SETTINGS] = { selector: j.HA_DIALOG_MORE_INFO_SETTINGS }, Mn) }, ni) }, ti) } } }, ei) } }, Un = function(t, e, n, r) {
  return n === void 0 && (n = null), r === void 0 && (r = !1), Object.entries(e || {}).reduce(function(i, s) {
    var a = s[0], o = s[1];
    if (o.selector === $t && n) return o.children ? rt(rt({}, i), Un(t, o.children, n, !0)) : i;
    var l = n ? n.then(function(u) {
      return u ? Cs(u, (c = o.selector, r ? "$ " + c : c), t) : null;
      var c;
    }) : Cs(o.selector, t);
    return i[a] = { element: l, children: Un(t, o.children, l), selector: new Hc(l, t) }, i;
  }, {});
}, so = function(t, e) {
  for (var n = 0, r = Object.entries(e); n < r.length; n++) {
    var i = r[n];
    if (i[0] === t) return i[1];
    var s = so(t, i[1].children);
    if (s) return s;
  }
}, ri = function(t, e) {
  return Object.keys(t).reduce(function(n, r) {
    var i = so(r, e);
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
}, Uc = function() {
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
}(), zc = function(t) {
  function e(n) {
    n === void 0 && (n = {});
    var r = t.call(this) || this;
    return r._config = rt(rt({}, jc), n), r._timestaps = {}, r;
  }
  return function(n, r) {
    if (typeof r != "function" && r !== null) throw new TypeError("Class extends value " + String(r) + " is not a constructor or null");
    function i() {
      this.constructor = n;
    }
    Ai(n, r), n.prototype = r === null ? Object.create(r) : (i.prototype = r.prototype, new i());
  }(e, t), e.prototype._dispatchEvent = function(n, r) {
    var i = Date.now();
    i - this._timestaps[n] < this._config.eventThreshold || (this._timestaps[n] = i, this.dispatchEvent(new CustomEvent(n, { detail: r })));
  }, e.prototype._updateDialogElements = function(n) {
    var r, i = this;
    n === void 0 && (n = B.HA_MORE_INFO_DIALOG_INFO), this._dialogTree = Un(this._config, Gc, this._haRootElements.HOME_ASSISTANT.element);
    var s = ri(B, this._dialogTree);
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
    this._homeAssistantRootTree = Un(this._config, Fc), this._haRootElements = ri(Ie, this._homeAssistantRootTree), this._haRootElements[Ie.HOME_ASSISTANT].selector.$.element.then(function(r) {
      n._dialogsObserver.disconnect(), n._dialogsObserver.observe(r, { childList: !0 });
    }), this._haRootElements[Ie.PARTIAL_PANEL_RESOLVER].element.then(function(r) {
      n._panelResolverObserver.disconnect(), r && n._panelResolverObserver.observe(r, { subtree: !0, childList: !0 });
    }), this._dispatchEvent(Ke.ON_LISTEN, this._haRootElements), this._dispatchEvent(Ke.ON_PANEL_LOAD, this._haRootElements);
  }, e.prototype._updateLovelaceElements = function() {
    var n = this;
    this._homeAssistantResolverTree = Un(this._config, qc, this._haRootElements[Ie.HA_DRAWER].element), this._haResolverElements = ri(yt, this._homeAssistantResolverTree), this._haResolverElements[yt.HA_PANEL_LOVELACE].element.then(function(r) {
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
}(Uc);
const ao = new zc();
let Ar = {};
ao.addEventListener("onLovelacePanelLoad", ({ detail: t }) => {
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
ao.listen();
const Bc = () => Ar, Ps = (t) => t ? typeof t == "string" ? t : Object.entries(t).map(([e, n]) => {
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
var Vc = /* @__PURE__ */ ot("<ha-ripple></ha-ripple>", 2), Wc = /* @__PURE__ */ ot('<button aria-label="Toggle button"><ha-icon></ha-icon> <!></button>', 2), Yc = /* @__PURE__ */ ot("<ha-ripple></ha-ripple>", 2), Jc = /* @__PURE__ */ ot('<div id="id1"><div id="id2"><!></div> <!> <!></div>'), Kc = /* @__PURE__ */ ot("<button><div> </div> <ha-icon></ha-icon> <ha-ripple></ha-ripple></button>", 2), Xc = /* @__PURE__ */ ot("<div><div></div></div>"), Qc = /* @__PURE__ */ ot("<ha-card><!> <!> <!></ha-card>", 2);
const Zc = {
  hash: "svelte-1jqiztq",
  code: `.expander-card.svelte-1jqiztq {display:var(--expander-card-display,block);gap:var(--gap);padding:var(--padding);background:var(--card-background,#fff);-webkit-tap-highlight-color:transparent;}.expander-card.animation.svelte-1jqiztq {transition:gap 0.35s ease, background-color var(--background-animation-duration, 0) ease;}.children-wrapper.svelte-1jqiztq {display:flex;flex-direction:column;}.children-wrapper.animation.opening.svelte-1jqiztq,
    .children-wrapper.animation.closing.svelte-1jqiztq {overflow:hidden;}.children-container.animation.svelte-1jqiztq {transition:padding 0.35s ease, gap 0.35s ease;}.children-container.svelte-1jqiztq {padding:var(--child-padding);display:var(--expander-card-display,block);gap:var(--gap);}.clear.svelte-1jqiztq {background:none !important;background-color:transparent !important;border-style:none !important;box-shadow:none !important;}.title-card-header.svelte-1jqiztq {display:flex;align-items:center;justify-content:space-between;flex-direction:row;position:relative;}.title-card-header.clickable.svelte-1jqiztq {cursor:pointer;border-style:none;border-radius:var(--ha-card-border-radius, var(--ha-border-radius-lg));}.title-card-header-overlay.svelte-1jqiztq {display:block;}.title-card-container.svelte-1jqiztq {width:100%;padding:var(--title-padding);}.header.svelte-1jqiztq {display:flex;flex-direction:row;align-items:center;padding:0.85em 0.85em;background:var(--button-background);border-style:none;border-radius:var(--ha-card-border-radius, var(--ha-border-radius-lg));width:var(--header-width,auto);color:var(--header-color,#fff);cursor:pointer;position:relative;font-family:var(--ha-font-family-body);font-size:var(--ha-font-size-m);}.header-overlay.svelte-1jqiztq {position:absolute;top:0;right:0;margin:var(--overlay-margin);height:var(--expander-card-overlay-height, auto);z-index:1;}.title-card-header-overlay.clickable.svelte-1jqiztq  > .header-overlay:where(.svelte-1jqiztq) {width:calc(100% - var(--overlay-margin) * 2);justify-content:flex-end;}.title-card-header-overlay.clickable.svelte-1jqiztq > .title-card-container:where(.svelte-1jqiztq) {width:calc(100% - var(--overlay-margin) * 2);}.title.svelte-1jqiztq {width:100%;text-align:left;}.ico.animation.svelte-1jqiztq {transition-property:transform;transition-duration:0.35s;}.ico.svelte-1jqiztq {color:var(--arrow-color,var(--primary-text-color,#fff));}.flipped.svelte-1jqiztq {transform:rotate(var(--icon-rotate-degree,180deg));}`
};
function eu(t, e) {
  Ni(e, !0), Ja(t, Zc);
  const n = Te(e, "hass"), r = Te(e, "preview"), i = Te(e, "config", 7, Oi);
  let s = /* @__PURE__ */ M(!1), a = /* @__PURE__ */ M(null), o = /* @__PURE__ */ M(nt(!!Ce(() => r()))), l = /* @__PURE__ */ M(nt(!!Ce(() => r()))), u = /* @__PURE__ */ M(!0), c = /* @__PURE__ */ M("idle"), f = /* @__PURE__ */ M(null), _ = /* @__PURE__ */ M(0), w = /* @__PURE__ */ M(0), g = /* @__PURE__ */ M(null), A = /* @__PURE__ */ M(null), d = /* @__PURE__ */ M(null), v = /* @__PURE__ */ M(null);
  const y = {}, b = {}, S = {}, T = /* @__PURE__ */ M(nt({}));
  let C = /* @__PURE__ */ M(nt(Bc()));
  const k = /* @__PURE__ */ Pn(() => {
    const m = p(T).style, E = i().style;
    let $ = null;
    return m !== void 0 ? $ = typeof m == "string" ? m : typeof m == "object" && m !== null ? Ps(m) : String(m) : E && ($ = Ps(E)), $ ? `<style>${$}</style>` : null;
  }), F = /* @__PURE__ */ Pn(() => p(T).icon !== void 0 ? String(p(T).icon) : i().icon), H = /* @__PURE__ */ Pn(() => p(T).title !== void 0 ? String(p(T).title) : i().title), cr = /* @__PURE__ */ Pn(() => p(T)["arrow-color"] !== void 0 ? String(p(T)["arrow-color"]) : i()["arrow-color"]), Cn = Ce(() => i()["storage-id"]), Xi = "expander-open-" + Cn;
  O(u, Ce(() => r() || (Br(i()["show-button-users"]) ?? !0)), !0), fn(() => {
    if (p(T).expanded === void 0 || Ce(() => r() && p(C)["preview-expanded"] !== !1))
      return;
    const m = !!p(T).expanded;
    queueMicrotask(() => {
      m !== p(o) && Nt(m);
    });
  }), fn(() => {
    if (!(r() === p(l) || r() === void 0)) {
      if (O(l, r(), !0), p(l) && p(C)["preview-expanded"] !== !1) {
        Rn(!0), O(u, !0);
        return;
      }
      if (O(u, Br(i()["show-button-users"]) ?? !0, !0), ur("expanded")) {
        const m = Ce(() => p(T).expanded);
        m !== void 0 && Nt(!!m);
        return;
      }
      Qi();
    }
  });
  function ur(m) {
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
  function Qi() {
    if (!ur("expanded")) {
      if (Br(i()["start-expanded-users"])) {
        lt(!0);
        return;
      }
      if (Cn === void 0) {
        Zi();
        return;
      }
      try {
        const m = localStorage.getItem(Xi);
        if (m === null) {
          Zi();
          return;
        }
        const E = m ? m === "true" : p(o);
        lt(E);
      } catch (m) {
        console.error(m), lt(!1);
      }
    }
  }
  function Zi() {
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
      Rn(!0), O(
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
          Rn(!1), O(c, "idle"), O(f, null);
        },
        350
      ),
      !0
    );
  }
  function lt(m) {
    Rn(m), zr(m);
  }
  function Rn(m) {
    if (O(o, m, !0), !r() && Cn !== void 0)
      try {
        localStorage.setItem(Xi, p(o) ? "true" : "false");
      } catch (E) {
        console.error(E);
      }
    p(o) && p(_) === 0 && O(_, 0.35);
  }
  function es(m) {
    var $;
    const E = ($ = m.detail) == null ? void 0 : $.rawConfig;
    E && JSON.stringify(E) !== JSON.stringify(p(C)) && O(C, E, !0);
  }
  function ts(m) {
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
  function po() {
    document.body.removeEventListener("ll-custom", ts), document.body.removeEventListener("expander-card-raw-config-updated", es), Object.entries(S).forEach(([m, E]) => {
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
  const ns = (m) => {
    i().haptic && i().haptic !== "none" && Oc(m, i().haptic);
  };
  let In, Ln = !1, rs = 0, is = 0;
  const vo = (m) => {
    p(v) && (p(v).disabled = !0), In = m.target, rs = m.touches[0].clientX, is = m.touches[0].clientY, Ln = !1;
  }, _o = (m) => {
    const E = m.touches[0].clientX, $ = m.touches[0].clientY;
    Ln = Math.abs(E - rs) > 10 || Math.abs($ - is) > 10;
  }, go = () => {
    p(v) && (p(v).disabled = !1), In = void 0, Ln = !1;
  }, mo = () => {
    p(v) && (p(v).disabled = !1);
  }, yo = (m) => {
    !Ln && In === m.target && i()["title-card-clickable"] && (ns(In), Nt(), O(s, !0), O(
      a,
      window.setTimeout(
        () => {
          O(s, !1), O(a, null);
        },
        100
      ),
      !0
    ), p(v) && (p(v).startPressAnimation(), p(v).endPressAnimation())), In = void 0, Ln = !1;
  }, bo = (m) => {
    for (const E of Object.values(i().variables ?? {}))
      $r(E.value_template) ? b[E.variable] = As(
        m,
        ($) => {
          Os(m, E.variable, $);
        },
        E.value_template,
        { config: i() }
      ) : Os(m, E.variable, E.value_template);
  }, wo = (m) => {
    y["expander-card"] = Ic(m, "expander-card");
  }, Eo = () => {
    if (!i().templates) return;
    const m = Object.values(i().variables || {}).reduce(
      ($, Y) => ($[Y.variable] = void 0, $),
      {}
    ), E = Cc({ config: i(), expanderCard: {} }, m);
    bo(E), wo(E), Object.values(i().templates || {}).forEach(($) => {
      $r($.value_template) ? S[$.template] = As(
        E,
        (Y) => {
          p(T)[$.template] = Y;
        },
        $.value_template,
        { config: i() }
      ) : p(T)[$.template] = $.value_template;
    });
  };
  function $o() {
    if (ur("expanded"))
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
  function Ao() {
    if (r() && p(C)["preview-expanded"] !== !1) {
      Rn(!0);
      return;
    }
    if (ur("expanded")) {
      const m = Ce(() => p(T).expanded);
      lt(m !== void 0 ? !!m : !1);
    } else
      Qi();
  }
  function Oo() {
    if (i()["title-card-clickable"] && !i()["title-card-button-overlay"] && p(A))
      return p(A);
    if (p(d))
      return p(d);
  }
  Ya(() => {
    Eo(), zr(!1), $o(), Ao(), document.body.addEventListener("ll-custom", ts), document.body.addEventListener("expander-card-raw-config-updated", es);
    const m = Oo();
    return m && (m.addEventListener("touchstart", vo, { passive: !0, capture: !0 }), m.addEventListener("touchmove", _o, { passive: !0, capture: !0 }), m.addEventListener("touchcancel", go, { passive: !0, capture: !0 }), m.addEventListener("touchend", mo, { passive: !0, capture: !0 }), m.addEventListener("touchend", yo, { passive: !1, capture: !1 })), i()["title-card-clickable"] && i()["title-card-button-overlay"] && p(A) && new ResizeObserver(() => {
      if (p(d) && p(A) && p(g)) {
        const $ = p(A).getBoundingClientRect();
        O(w, $.height - parseFloat(getComputedStyle(p(d)).marginTop) - parseFloat(getComputedStyle(p(d)).marginBottom) + parseFloat(getComputedStyle(p(g)).paddingTop) + parseFloat(getComputedStyle(p(g)).paddingBottom));
      }
    }).observe(p(A)), po;
  });
  const Vr = (m) => {
    if (!p(s)) {
      ns(m.currentTarget), Nt();
      return;
    }
    return m.preventDefault(), m.stopImmediatePropagation(), O(s, !1), p(a) && (clearTimeout(p(a)), O(a, null)), !1;
  };
  var So = {
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
    set config(m = Oi) {
      i(m), me();
    }
  }, nn = Qc(), ss = dt(nn);
  {
    var xo = (m) => {
      var E = Jc();
      E.__click = function(...ee) {
        var te;
        (te = i()["title-card-clickable"] && !i()["title-card-button-overlay"] ? Vr : null) == null || te.apply(this, ee);
      };
      var $ = dt(E), Y = dt($);
      Ei(Y, {
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
          var te = Wc();
          te.__click = function(...Ct) {
            var kn;
            (kn = !i()["title-card-clickable"] || i()["title-card-button-overlay"] ? Vr : null) == null || kn.apply(this, Ct);
          };
          var Fe = dt(te);
          Je(() => ys(Fe, "icon", p(F)));
          var Io = Rt(Fe, 2);
          {
            var Lo = (Ct) => {
              var kn = Vc();
              pt(kn, (ko) => O(v, ko), () => p(v)), ve(Ct, kn);
            };
            ft(Io, (Ct) => {
              (!i()["title-card-clickable"] || i()["title-card-button-overlay"]) && Ct(Lo);
            });
          }
          Ye(te), pt(te, (Ct) => O(d, Ct), () => p(d)), Je(() => {
            ht(te, `--overlay-margin:${i()["overlay-margin"] ?? ""}; --button-background:${i()["button-background"] ?? ""}; --header-color:${i()["header-color"] ?? ""};`), Se(te, 1, `header ${i()["title-card-button-overlay"] ? " header-overlay" : ""}${p(o) ? " open" : " close"}${i().animation ? " animation " + p(c) : ""}`, "svelte-1jqiztq"), ht(Fe, `--arrow-color:${p(cr) ?? ""}`), Se(Fe, 1, `ico${p(o) && p(c) !== "closing" ? " flipped open" : " close"}${i().animation ? " animation " + p(c) : ""}`, "svelte-1jqiztq");
          }), ve(ee, te);
        };
        ft(Ae, (ee) => {
          p(u) && ee(Oe);
        });
      }
      var rn = Rt(Ae, 2);
      {
        var Wr = (ee) => {
          var te = Yc();
          pt(te, (Fe) => O(v, Fe), () => p(v)), ve(ee, te);
        };
        ft(rn, (ee) => {
          i()["title-card-clickable"] && !i()["title-card-button-overlay"] && ee(Wr);
        });
      }
      Ye(E), pt(E, (ee) => O(A, ee), () => p(A)), Je(() => {
        Se(E, 1, `title-card-header${i()["title-card-button-overlay"] ? "-overlay" : ""}${p(o) ? " open" : " close"}${i().animation ? " animation " + p(c) : ""}${i()["title-card-clickable"] ? " clickable" : ""}`, "svelte-1jqiztq"), Ka(E, "role", i()["title-card-clickable"] && !i()["title-card-button-overlay"] ? "button" : void 0), Se($, 1, `title-card-container${p(o) ? " open" : " close"}${i().animation ? " animation " + p(c) : ""}`, "svelte-1jqiztq"), ht($, `--title-padding:${(i()["title-card-padding"] ? i()["title-card-padding"] : "0px") ?? ""};`);
      }), ve(m, E);
    }, To = (m) => {
      var E = gs(), $ = hs(E);
      {
        var Y = (Ae) => {
          var Oe = Kc();
          Oe.__click = Vr;
          var rn = dt(Oe), Wr = dt(rn, !0);
          Ye(rn);
          var ee = Rt(rn, 2);
          Je(() => ys(ee, "icon", p(F)));
          var te = Rt(ee, 2);
          pt(te, (Fe) => O(v, Fe), () => p(v)), Ye(Oe), pt(Oe, (Fe) => O(d, Fe), () => p(d)), Je(() => {
            Se(Oe, 1, `header${p(o) ? " open" : " close"}${i().animation ? " animation " + p(c) : ""}`, "svelte-1jqiztq"), ht(Oe, `--header-width:100%; --button-background:${i()["button-background"] ?? ""};--header-color:${i()["header-color"] ?? ""};`), Se(rn, 1, `primary title${p(o) ? " open" : " close"}`, "svelte-1jqiztq"), rc(Wr, p(H)), ht(ee, `--arrow-color:${p(cr) ?? ""}`), Se(ee, 1, `ico${p(o) && p(c) !== "closing" ? " flipped open" : " close"}${i().animation ? " animation " + p(c) : ""}`, "svelte-1jqiztq");
          }), ve(Ae, Oe);
        };
        ft($, (Ae) => {
          p(u) && Ae(Y);
        });
      }
      ve(m, E);
    };
    ft(ss, (m) => {
      i()["title-card"] ? m(xo) : m(To, !1);
    });
  }
  var as = Rt(ss, 2);
  {
    var No = (m) => {
      var E = Xc(), $ = dt(E);
      lc($, 20, () => i().cards, (Y) => Y, (Y, Ae) => {
        {
          let Oe = /* @__PURE__ */ Pn(() => p(o) && r());
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
    ft(as, (m) => {
      i().cards && m(No);
    });
  }
  var Co = Rt(as, 2);
  {
    var Ro = (m) => {
      var E = gs(), $ = hs(E);
      dc($, () => p(k)), ve(m, E);
    };
    ft(Co, (m) => {
      p(k) && m(Ro);
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
  }), ve(t, nn), Ci(So);
}
ec(["click"]);
customElements.define("expander-card", Za(eu, { hass: {}, preview: {}, config: {} }, [], [], { mode: "open" }, (t) => class extends t {
  constructor() {
    super(...arguments);
    // re-declare props used in customClass.
    q(this, "config");
  }
  static async getConfigElement() {
    return await Qo(), document.createElement("expander-card-editor");
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
const tu = "6.0.1";
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Or = globalThis, Bi = Or.ShadowRoot && (Or.ShadyCSS === void 0 || Or.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Vi = Symbol(), Ds = /* @__PURE__ */ new WeakMap();
let oo = class {
  constructor(e, n, r) {
    if (this._$cssResult$ = !0, r !== Vi) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = n;
  }
  get styleSheet() {
    let e = this.o;
    const n = this.t;
    if (Bi && e === void 0) {
      const r = n !== void 0 && n.length === 1;
      r && (e = Ds.get(n)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), r && Ds.set(n, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const nu = (t) => new oo(typeof t == "string" ? t : t + "", void 0, Vi), Wi = (t, ...e) => {
  const n = t.length === 1 ? t[0] : e.reduce((r, i, s) => r + ((a) => {
    if (a._$cssResult$ === !0) return a.cssText;
    if (typeof a == "number") return a;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + t[s + 1], t[0]);
  return new oo(n, t, Vi);
}, ru = (t, e) => {
  if (Bi) t.adoptedStyleSheets = e.map((n) => n instanceof CSSStyleSheet ? n : n.styleSheet);
  else for (const n of e) {
    const r = document.createElement("style"), i = Or.litNonce;
    i !== void 0 && r.setAttribute("nonce", i), r.textContent = n.cssText, t.appendChild(r);
  }
}, Ms = Bi ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let n = "";
  for (const r of e.cssRules) n += r.cssText;
  return nu(n);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: iu, defineProperty: su, getOwnPropertyDescriptor: au, getOwnPropertyNames: ou, getOwnPropertySymbols: lu, getPrototypeOf: cu } = Object, At = globalThis, Hs = At.trustedTypes, uu = Hs ? Hs.emptyScript : "", ii = At.reactiveElementPolyfillSupport, zn = (t, e) => t, Ir = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? uu : null;
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
} }, Yi = (t, e) => !iu(t, e), js = { attribute: !0, type: String, converter: Ir, reflect: !1, useDefault: !1, hasChanged: Yi };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), At.litPropertyMetadata ?? (At.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let cn = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, n = js) {
    if (n.state && (n.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((n = Object.create(n)).wrapped = !0), this.elementProperties.set(e, n), !n.noAccessor) {
      const r = Symbol(), i = this.getPropertyDescriptor(e, r, n);
      i !== void 0 && su(this.prototype, e, i);
    }
  }
  static getPropertyDescriptor(e, n, r) {
    const { get: i, set: s } = au(this.prototype, e) ?? { get() {
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
    return this.elementProperties.get(e) ?? js;
  }
  static _$Ei() {
    if (this.hasOwnProperty(zn("elementProperties"))) return;
    const e = cu(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(zn("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(zn("properties"))) {
      const n = this.properties, r = [...ou(n), ...lu(n)];
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
      for (const i of r) n.unshift(Ms(i));
    } else e !== void 0 && n.push(Ms(e));
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
    return ru(e, this.constructor.elementStyles), e;
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
      if (i === !1 && (s = this[e]), r ?? (r = o.getPropertyOptions(e)), !((r.hasChanged ?? Yi)(s, n) || r.useDefault && r.reflect && s === ((a = this._$Ej) == null ? void 0 : a.get(e)) && !this.hasAttribute(o._$Eu(e, r)))) return;
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
cn.elementStyles = [], cn.shadowRootOptions = { mode: "open" }, cn[zn("elementProperties")] = /* @__PURE__ */ new Map(), cn[zn("finalized")] = /* @__PURE__ */ new Map(), ii == null || ii({ ReactiveElement: cn }), (At.reactiveElementVersions ?? (At.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Bn = globalThis, Fs = (t) => t, Lr = Bn.trustedTypes, qs = Lr ? Lr.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, lo = "$lit$", _t = `lit$${Math.random().toFixed(9).slice(2)}$`, co = "?" + _t, du = `<${co}>`, Xt = document, Kn = () => Xt.createComment(""), Xn = (t) => t === null || typeof t != "object" && typeof t != "function", Ji = Array.isArray, fu = (t) => Ji(t) || typeof (t == null ? void 0 : t[Symbol.iterator]) == "function", si = `[ 	
\f\r]`, Hn = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Gs = /-->/g, Us = />/g, Lt = RegExp(`>|${si}(?:([^\\s"'>=/]+)(${si}*=${si}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), zs = /'/g, Bs = /"/g, uo = /^(?:script|style|textarea|title)$/i, hu = (t) => (e, ...n) => ({ _$litType$: t, strings: e, values: n }), ln = hu(1), xn = Symbol.for("lit-noChange"), G = Symbol.for("lit-nothing"), Vs = /* @__PURE__ */ new WeakMap(), Mt = Xt.createTreeWalker(Xt, 129);
function fo(t, e) {
  if (!Ji(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return qs !== void 0 ? qs.createHTML(e) : e;
}
const pu = (t, e) => {
  const n = t.length - 1, r = [];
  let i, s = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", a = Hn;
  for (let o = 0; o < n; o++) {
    const l = t[o];
    let u, c, f = -1, _ = 0;
    for (; _ < l.length && (a.lastIndex = _, c = a.exec(l), c !== null); ) _ = a.lastIndex, a === Hn ? c[1] === "!--" ? a = Gs : c[1] !== void 0 ? a = Us : c[2] !== void 0 ? (uo.test(c[2]) && (i = RegExp("</" + c[2], "g")), a = Lt) : c[3] !== void 0 && (a = Lt) : a === Lt ? c[0] === ">" ? (a = i ?? Hn, f = -1) : c[1] === void 0 ? f = -2 : (f = a.lastIndex - c[2].length, u = c[1], a = c[3] === void 0 ? Lt : c[3] === '"' ? Bs : zs) : a === Bs || a === zs ? a = Lt : a === Gs || a === Us ? a = Hn : (a = Lt, i = void 0);
    const w = a === Lt && t[o + 1].startsWith("/>") ? " " : "";
    s += a === Hn ? l + du : f >= 0 ? (r.push(u), l.slice(0, f) + lo + l.slice(f) + _t + w) : l + _t + (f === -2 ? o : w);
  }
  return [fo(t, s + (t[n] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), r];
};
class Qn {
  constructor({ strings: e, _$litType$: n }, r) {
    let i;
    this.parts = [];
    let s = 0, a = 0;
    const o = e.length - 1, l = this.parts, [u, c] = pu(e, n);
    if (this.el = Qn.createElement(u, r), Mt.currentNode = this.el.content, n === 2 || n === 3) {
      const f = this.el.content.firstChild;
      f.replaceWith(...f.childNodes);
    }
    for (; (i = Mt.nextNode()) !== null && l.length < o; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const f of i.getAttributeNames()) if (f.endsWith(lo)) {
          const _ = c[a++], w = i.getAttribute(f).split(_t), g = /([.?@])?(.*)/.exec(_);
          l.push({ type: 1, index: s, name: g[2], strings: w, ctor: g[1] === "." ? _u : g[1] === "?" ? gu : g[1] === "@" ? mu : Gr }), i.removeAttribute(f);
        } else f.startsWith(_t) && (l.push({ type: 6, index: s }), i.removeAttribute(f));
        if (uo.test(i.tagName)) {
          const f = i.textContent.split(_t), _ = f.length - 1;
          if (_ > 0) {
            i.textContent = Lr ? Lr.emptyScript : "";
            for (let w = 0; w < _; w++) i.append(f[w], Kn()), Mt.nextNode(), l.push({ type: 2, index: ++s });
            i.append(f[_], Kn());
          }
        }
      } else if (i.nodeType === 8) if (i.data === co) l.push({ type: 2, index: s });
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
function Tn(t, e, n = t, r) {
  var a, o;
  if (e === xn) return e;
  let i = r !== void 0 ? (a = n._$Co) == null ? void 0 : a[r] : n._$Cl;
  const s = Xn(e) ? void 0 : e._$litDirective$;
  return (i == null ? void 0 : i.constructor) !== s && ((o = i == null ? void 0 : i._$AO) == null || o.call(i, !1), s === void 0 ? i = void 0 : (i = new s(t), i._$AT(t, n, r)), r !== void 0 ? (n._$Co ?? (n._$Co = []))[r] = i : n._$Cl = i), i !== void 0 && (e = Tn(t, i._$AS(t, e.values), i, r)), e;
}
class vu {
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
        l.type === 2 ? u = new or(s, s.nextSibling, this, e) : l.type === 1 ? u = new l.ctor(s, l.name, l.strings, this, e) : l.type === 6 && (u = new yu(s, this, e)), this._$AV.push(u), l = r[++o];
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
class or {
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
    e = Tn(this, e, n), Xn(e) ? e === G || e == null || e === "" ? (this._$AH !== G && this._$AR(), this._$AH = G) : e !== this._$AH && e !== xn && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : fu(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== G && Xn(this._$AH) ? this._$AA.nextSibling.data = e : this.T(Xt.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    var s;
    const { values: n, _$litType$: r } = e, i = typeof r == "number" ? this._$AC(e) : (r.el === void 0 && (r.el = Qn.createElement(fo(r.h, r.h[0]), this.options)), r);
    if (((s = this._$AH) == null ? void 0 : s._$AD) === i) this._$AH.p(n);
    else {
      const a = new vu(i, this), o = a.u(this.options);
      a.p(n), this.T(o), this._$AH = a;
    }
  }
  _$AC(e) {
    let n = Vs.get(e.strings);
    return n === void 0 && Vs.set(e.strings, n = new Qn(e)), n;
  }
  k(e) {
    Ji(this._$AH) || (this._$AH = [], this._$AR());
    const n = this._$AH;
    let r, i = 0;
    for (const s of e) i === n.length ? n.push(r = new or(this.O(Kn()), this.O(Kn()), this, this.options)) : r = n[i], r._$AI(s), i++;
    i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
  }
  _$AR(e = this._$AA.nextSibling, n) {
    var r;
    for ((r = this._$AP) == null ? void 0 : r.call(this, !1, !0, n); e !== this._$AB; ) {
      const i = Fs(e).nextSibling;
      Fs(e).remove(), e = i;
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
    if (s === void 0) e = Tn(this, e, n, 0), a = !Xn(e) || e !== this._$AH && e !== xn, a && (this._$AH = e);
    else {
      const o = e;
      let l, u;
      for (e = s[0], l = 0; l < s.length - 1; l++) u = Tn(this, o[r + l], n, l), u === xn && (u = this._$AH[l]), a || (a = !Xn(u) || u !== this._$AH[l]), u === G ? e = G : e !== G && (e += (u ?? "") + s[l + 1]), this._$AH[l] = u;
    }
    a && !i && this.j(e);
  }
  j(e) {
    e === G ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class _u extends Gr {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === G ? void 0 : e;
  }
}
class gu extends Gr {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== G);
  }
}
class mu extends Gr {
  constructor(e, n, r, i, s) {
    super(e, n, r, i, s), this.type = 5;
  }
  _$AI(e, n = this) {
    if ((e = Tn(this, e, n, 0) ?? G) === xn) return;
    const r = this._$AH, i = e === G && r !== G || e.capture !== r.capture || e.once !== r.once || e.passive !== r.passive, s = e !== G && (r === G || i);
    i && this.element.removeEventListener(this.name, this, r), s && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    var n;
    typeof this._$AH == "function" ? this._$AH.call(((n = this.options) == null ? void 0 : n.host) ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class yu {
  constructor(e, n, r) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = n, this.options = r;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    Tn(this, e);
  }
}
const ai = Bn.litHtmlPolyfillSupport;
ai == null || ai(Qn, or), (Bn.litHtmlVersions ?? (Bn.litHtmlVersions = [])).push("3.3.2");
const bu = (t, e, n) => {
  const r = (n == null ? void 0 : n.renderBefore) ?? e;
  let i = r._$litPart$;
  if (i === void 0) {
    const s = (n == null ? void 0 : n.renderBefore) ?? null;
    r._$litPart$ = i = new or(e.insertBefore(Kn(), s), s, void 0, n ?? {});
  }
  return i._$AI(t), i;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Wt = globalThis;
class Vn extends cn {
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
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = bu(n, this.renderRoot, this.renderOptions);
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
    return xn;
  }
}
var Js;
Vn._$litElement$ = !0, Vn.finalized = !0, (Js = Wt.litElementHydrateSupport) == null || Js.call(Wt, { LitElement: Vn });
const oi = Wt.litElementPolyfillSupport;
oi == null || oi({ LitElement: Vn });
(Wt.litElementVersions ?? (Wt.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const wu = (t) => (e, n) => {
  n !== void 0 ? n.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Eu = { attribute: !0, type: String, converter: Ir, reflect: !1, hasChanged: Yi }, $u = (t = Eu, e, n) => {
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
  return (e, n) => typeof n == "object" ? $u(t, e, n) : ((r, i, s) => {
    const a = i.hasOwnProperty(s);
    return i.constructor.createProperty(s, r), a ? Object.getOwnPropertyDescriptor(i, s) : void 0;
  })(t, e, n);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function lr(t) {
  return Ur({ ...t, state: !0, attribute: !1 });
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Au = (t, e, n) => (n.configurable = !0, n.enumerable = !0, Reflect.decorate && typeof e != "object" && Object.defineProperty(t, e, n), n);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function Ou(t, e) {
  return (n, r, i) => {
    const s = (a) => {
      var o;
      return ((o = a.renderRoot) == null ? void 0 : o.querySelector(t)) ?? null;
    };
    return Au(n, r, { get() {
      return s(this);
    } });
  };
}
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Su = (t) => t ?? G, xu = Wi`
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
`, Tu = Wi`
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
var Nu = Object.defineProperty, Cu = Object.getOwnPropertyDescriptor, We = (t, e, n, r) => {
  for (var i = r > 1 ? void 0 : r ? Cu(e, n) : e, s = t.length - 1, a; s >= 0; s--)
    (a = t[s]) && (i = (r ? a(e, n, i) : a(i)) || i);
  return r && i && Nu(e, n, i), i;
};
const ho = "custom:", Ru = (t) => t.startsWith(ho), Iu = (t) => {
  var e;
  return (e = window.customCards) == null ? void 0 : e.find((n) => n.type === t);
}, Lu = (t) => t.replace(ho, "");
let he = class extends Vn {
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
      Ru(this._config.type) ? (r = (n = Iu(
        Lu(this._config.type)
      )) == null ? void 0 : n.name, r != null && r.toLowerCase().endsWith(" card") && (r = r.substring(0, r.length - 5))) : r = this.hass.localize(
        `ui.panel.lovelace.editor.card.${this._config.type}.name`
      ), e = `${e} - ${this.hass.localize(
        "ui.panel.lovelace.editor.edit_card.typed_header",
        { type: r }
      )}`;
    }
    return ln`
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
                    disabled=${Su(t)}
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
    return ln`
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
    const t = this._error ? "blur" : "", e = this._error ? ln` <ha-spinner aria-label="Can't update card"></ha-spinner> ` : "";
    return ln`
        ${this._config.type ? ln`
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
            ` : ln`
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
  xu,
  Tu,
  Wi`
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
  lr()
], he.prototype, "_params", 2);
We([
  lr()
], he.prototype, "_config", 2);
We([
  lr()
], he.prototype, "_cardGUIMode", 2);
We([
  lr()
], he.prototype, "_cardGUIModeAvailable", 2);
We([
  lr()
], he.prototype, "_error", 2);
We([
  Ou("hui-card-element-editor")
], he.prototype, "_cardEditorEl", 2);
he = We([
  wu("expander-card-title-card-edit-form")
], he);
console.info(
  `%c  Expander-Card 
%c Version ${tu}`,
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
  eu as default
};
//# sourceMappingURL=expander-card.js.map
