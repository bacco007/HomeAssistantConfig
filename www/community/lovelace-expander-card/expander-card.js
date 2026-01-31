var xo = Object.defineProperty;
var es = (t) => {
  throw TypeError(t);
};
var To = (t, e, n) => e in t ? xo(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n;
var q = (t, e, n) => To(t, typeof e != "symbol" ? e + "" : e, n), Br = (t, e, n) => e.has(t) || es("Cannot " + n);
var p = (t, e, n) => (Br(t, e, "read from private field"), n ? n.call(t) : e.get(t)), R = (t, e, n) => e.has(t) ? es("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, n), T = (t, e, n, i) => (Br(t, e, "write to private field"), i ? i.call(t, n) : e.set(t, n), n), z = (t, e, n) => (Br(t, e, "access private method"), n);
var Fs;
typeof window < "u" && ((Fs = window.__svelte ?? (window.__svelte = {})).v ?? (Fs.v = /* @__PURE__ */ new Set())).add("5");
const No = {
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
}, Co = [
  "expanded",
  "icon",
  "arrow-color",
  "title",
  "style"
];
var or = /* @__PURE__ */ ((t) => (t.CSS = "css", t.Object = "object", t))(or || {});
const Ro = { name: "style", label: "CSS text", selector: { text: { multiline: !0 } } }, Io = { name: "style", label: "CSS structured object", selector: { object: {} } }, Lo = { icon: {} }, ko = { text: {} }, Po = { boolean: {} }, Do = (t) => ({
  number: {
    unit_of_measurement: t
  }
}), Mo = (t, e) => ({
  name: t,
  label: e,
  selector: Lo
}), Y = (t, e) => ({
  name: t,
  label: e,
  selector: ko
}), nn = (t, e) => ({
  name: t,
  label: e,
  selector: Po
}), ts = (t, e, n) => ({
  name: t,
  label: e,
  selector: Do(n)
}), Ho = [
  {
    type: "expandable",
    label: "Expander Card Settings",
    icon: "mdi:arrow-down-bold-box-outline",
    schema: [
      {
        ...Y("title", "Title")
      },
      {
        ...Mo("icon", "Icon")
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
                ...nn("expanded", "Start expanded")
              },
              {
                ...nn("animation", "Enable animation")
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
                ...ts("min-width-expanded", "Min width expanded", "px")
              },
              {
                ...ts("max-width-expanded", "Max width expanded", "px")
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
                ...nn("clear", "Clear border and background")
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
                ...nn("clear-children", "Clear card border and background")
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
                ...nn("title-card-clickable", "Make title card clickable to expand/collapse")
              },
              {
                ...nn("title-card-button-overlay", "Overlay expand button on title card")
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
], jo = (t, e) => new Promise((n) => {
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
}), kn = window;
let lr = kn.cardHelpers;
const Fo = new Promise((t) => {
  lr && t(), kn.loadCardHelpers && kn.loadCardHelpers().then((e) => {
    lr = e, kn.cardHelpers = lr, t();
  });
});
async function qo() {
  const t = document.querySelector("home-assistant"), e = t == null ? void 0 : t.hass;
  return e ? (await e.callWS({ type: "config/auth/list" })).filter((i) => !i.system_generated).map((i) => i.name) : void 0;
}
const Uo = async () => {
  const t = await Fo.then(() => lr.createCardElement({ type: "vertical-stack", cards: [] })), e = await customElements.whenDefined("hui-vertical-stack-card").then(() => t.constructor.getConfigElement()), n = await qo();
  return class extends e.constructor {
    constructor() {
      super(), this.showDialogCallback = (r) => {
        var a, o, l, u;
        ((l = (o = (a = r.detail) == null ? void 0 : a.dialogParams) == null ? void 0 : o.schema) == null ? void 0 : l.find((c) => c.name === "expander_card_title_card_marker")) && (r.stopPropagation(), (u = r.detail) != null && u.dialogImport && r.detail.dialogImport().then(async () => {
          var f, _, w, b, A, d, v, m;
          const c = {
            title: "Title card",
            config: this._config["title-card"] || {},
            submit: (_ = (f = r.detail) == null ? void 0 : f.dialogParams) == null ? void 0 : _.submit,
            cancel: (b = (w = r.detail) == null ? void 0 : w.dialogParams) == null ? void 0 : b.cancel,
            submitText: (d = (A = r.detail) == null ? void 0 : A.dialogParams) == null ? void 0 : d.submitText,
            cancelText: (m = (v = r.detail) == null ? void 0 : v.dialogParams) == null ? void 0 : m.cancelText,
            lovelace: this.lovelace
          };
          await jo(
            this,
            c
          );
        }));
      }, this._computeLabelCallback = (r) => r.label ?? r.name ?? "", this._valueChanged = (r) => {
        const s = r.detail.value, a = Object.entries(No);
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
      const s = JSON.stringify(Ho), a = this._users.map((f) => f.replace(/\\/g, "\\\\").replace(/"/g, '\\"')).join('","');
      let o = s.replace(/\[\[users\]\]/g, a);
      o = o.replace(
        /\[\[templates\]\]/g,
        // NOSONAR es2019
        Co.filter((f) => {
          var _;
          return !((_ = this._config.templates) != null && _.some((w) => w.template === f));
        }).join('","')
      );
      const u = (this._config.style && typeof this._config.style == "object" ? or.Object : or.CSS) === or.CSS ? JSON.stringify(Ro) : JSON.stringify(Io);
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
}, Go = (async () => {
  for (; customElements.get("home-assistant") === void 0; )
    await new Promise((t) => kn.setTimeout(t, 100));
  if (!customElements.get("expander-card-editor")) {
    const t = await Uo();
    customElements.define("expander-card-editor", t);
  }
}), zo = 1, Bo = 2, Vo = 16, Wo = 1, Yo = 2, Us = "[", Ir = "[!", Ei = "]", Bt = {}, J = Symbol(), Jo = "http://www.w3.org/1999/xhtml", si = !1;
var Gs = Array.isArray, Ko = Array.prototype.indexOf, Lr = Array.from, gr = Object.keys, mr = Object.defineProperty, un = Object.getOwnPropertyDescriptor, Qo = Object.getOwnPropertyDescriptors, Xo = Object.prototype, Zo = Array.prototype, zs = Object.getPrototypeOf, ns = Object.isExtensible;
function el(t) {
  for (var e = 0; e < t.length; e++)
    t[e]();
}
function Bs() {
  var t, e, n = new Promise((i, r) => {
    t = i, e = r;
  });
  return { promise: n, resolve: t, reject: e };
}
const Q = 2, yr = 4, kr = 8, Vs = 1 << 24, nt = 16, rt = 32, xt = 64, $i = 128, we = 512, ee = 1024, ae = 2048, it = 4096, de = 8192, et = 16384, Pr = 32768, mn = 65536, rs = 1 << 17, Ws = 1 << 18, Kt = 1 << 19, tl = 1 << 20, gt = 1 << 25, Vt = 32768, ai = 1 << 21, Ai = 1 << 22, yt = 1 << 23, cr = Symbol("$state"), nl = Symbol("legacy props"), rl = Symbol(""), ln = new class extends Error {
  constructor() {
    super(...arguments);
    q(this, "name", "StaleReactionError");
    q(this, "message", "The reaction that called `getAbortSignal()` was re-run or destroyed");
  }
}(), Oi = 3, Qt = 8;
function il(t) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function sl() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function al(t) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function ol() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function ll(t) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function cl() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function ul() {
  throw new Error("https://svelte.dev/e/hydration_failed");
}
function dl() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function fl() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function hl() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function pl() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
function Kn(t) {
  console.warn("https://svelte.dev/e/hydration_mismatch");
}
function vl() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
let L = !1;
function ke(t) {
  L = t;
}
let I;
function re(t) {
  if (t === null)
    throw Kn(), Bt;
  return I = t;
}
function yn() {
  return re(/* @__PURE__ */ Me(I));
}
function Ve(t) {
  if (L) {
    if (/* @__PURE__ */ Me(I) !== null)
      throw Kn(), Bt;
    I = t;
  }
}
function _l(t = 1) {
  if (L) {
    for (var e = t, n = I; e--; )
      n = /** @type {TemplateNode} */
      /* @__PURE__ */ Me(n);
    I = n;
  }
}
function br(t = !0) {
  for (var e = 0, n = I; ; ) {
    if (n.nodeType === Qt) {
      var i = (
        /** @type {Comment} */
        n.data
      );
      if (i === Ei) {
        if (e === 0) return n;
        e -= 1;
      } else (i === Us || i === Ir) && (e += 1);
    }
    var r = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Me(n)
    );
    t && n.remove(), n = r;
  }
}
function Ys(t) {
  if (!t || t.nodeType !== Qt)
    throw Kn(), Bt;
  return (
    /** @type {Comment} */
    t.data
  );
}
function Js(t) {
  return t === this.v;
}
function gl(t, e) {
  return t != t ? e == e : t !== e || t !== null && typeof t == "object" || typeof t == "function";
}
function Ks(t) {
  return !gl(t, this.v);
}
let ml = !1, fe = null;
function bn(t) {
  fe = t;
}
function Si(t, e = !1, n) {
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
function xi(t) {
  var e = (
    /** @type {ComponentContext} */
    fe
  ), n = e.e;
  if (n !== null) {
    e.e = null;
    for (var i of n)
      ba(i);
  }
  return t !== void 0 && (e.x = t), e.i = !0, fe = e.p, t ?? /** @type {T} */
  {};
}
function Qs() {
  return !0;
}
let Lt = [];
function Xs() {
  var t = Lt;
  Lt = [], el(t);
}
function Dr(t) {
  if (Lt.length === 0 && !Pn) {
    var e = Lt;
    queueMicrotask(() => {
      e === Lt && Xs();
    });
  }
  Lt.push(t);
}
function yl() {
  for (; Lt.length > 0; )
    Xs();
}
function Zs(t) {
  var e = P;
  if (e === null)
    return N.f |= yt, t;
  if ((e.f & Pr) === 0) {
    if ((e.f & $i) === 0)
      throw t;
    e.b.error(t);
  } else
    wn(t, e);
}
function wn(t, e) {
  for (; e !== null; ) {
    if ((e.f & $i) !== 0)
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
const bl = -7169;
function V(t, e) {
  t.f = t.f & bl | e;
}
function Ti(t) {
  (t.f & we) !== 0 || t.deps === null ? V(t, ee) : V(t, it);
}
function ea(t) {
  if (t !== null)
    for (const e of t)
      (e.f & Q) === 0 || (e.f & Vt) === 0 || (e.f ^= Vt, ea(
        /** @type {Derived} */
        e.deps
      ));
}
function ta(t, e, n) {
  (t.f & ae) !== 0 ? e.add(t) : (t.f & it) !== 0 && n.add(t), ea(t.deps), V(t, ee);
}
const rr = /* @__PURE__ */ new Set();
let D = null, K = null, ye = [], Mr = null, oi = !1, Pn = !1;
var fn, hn, Pt, Dt, Vn, pn, vn, Ae, li, ci, na, ra;
const Nr = class Nr {
  constructor() {
    R(this, Ae);
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
    R(this, fn, /* @__PURE__ */ new Set());
    /**
     * If a fork is discarded, we need to destroy any effects that are no longer needed
     * @type {Set<(batch: Batch) => void>}
     */
    R(this, hn, /* @__PURE__ */ new Set());
    /**
     * The number of async effects that are currently in flight
     */
    R(this, Pt, 0);
    /**
     * The number of async effects that are currently in flight, _not_ inside a pending boundary
     */
    R(this, Dt, 0);
    /**
     * A deferred that resolves when the batch is committed, used with `settled()`
     * TODO replace with Promise.withResolvers once supported widely enough
     * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
     */
    R(this, Vn, null);
    /**
     * Deferred effects (which run after async work has completed) that are DIRTY
     * @type {Set<Effect>}
     */
    R(this, pn, /* @__PURE__ */ new Set());
    /**
     * Deferred effects that are MAYBE_DIRTY
     * @type {Set<Effect>}
     */
    R(this, vn, /* @__PURE__ */ new Set());
    /**
     * A set of branches that still exist, but will be destroyed when this batch
     * is committed — we skip over these during `process`
     * @type {Set<Effect>}
     */
    q(this, "skipped_effects", /* @__PURE__ */ new Set());
    q(this, "is_fork", !1);
  }
  is_deferred() {
    return this.is_fork || p(this, Dt) > 0;
  }
  /**
   *
   * @param {Effect[]} root_effects
   */
  process(e) {
    var r;
    ye = [], this.apply();
    var n = [], i = [];
    for (const s of e)
      z(this, Ae, li).call(this, s, n, i);
    this.is_fork || z(this, Ae, na).call(this), this.is_deferred() ? (z(this, Ae, ci).call(this, i), z(this, Ae, ci).call(this, n)) : (D = null, is(i), is(n), (r = p(this, Vn)) == null || r.resolve()), K = null;
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} value
   */
  capture(e, n) {
    n !== J && !this.previous.has(e) && this.previous.set(e, n), (e.f & yt) === 0 && (this.current.set(e, e.v), K == null || K.set(e, e.v));
  }
  activate() {
    D = this, this.apply();
  }
  deactivate() {
    D === this && (D = null, K = null);
  }
  flush() {
    if (this.activate(), ye.length > 0) {
      if (ia(), D !== null && D !== this)
        return;
    } else p(this, Pt) === 0 && this.process([]);
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
    T(this, Pt, p(this, Pt) + 1), e && T(this, Dt, p(this, Dt) + 1);
  }
  /**
   *
   * @param {boolean} blocking
   */
  decrement(e) {
    T(this, Pt, p(this, Pt) - 1), e && T(this, Dt, p(this, Dt) - 1), this.revive();
  }
  revive() {
    for (const e of p(this, pn))
      p(this, vn).delete(e), V(e, ae), tt(e);
    for (const e of p(this, vn))
      V(e, it), tt(e);
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
    return (p(this, Vn) ?? T(this, Vn, Bs())).promise;
  }
  static ensure() {
    if (D === null) {
      const e = D = new Nr();
      rr.add(D), Pn || Nr.enqueue(() => {
        D === e && e.flush();
      });
    }
    return D;
  }
  /** @param {() => void} task */
  static enqueue(e) {
    Dr(e);
  }
  apply() {
  }
};
fn = new WeakMap(), hn = new WeakMap(), Pt = new WeakMap(), Dt = new WeakMap(), Vn = new WeakMap(), pn = new WeakMap(), vn = new WeakMap(), Ae = new WeakSet(), /**
 * Traverse the effect tree, executing effects or stashing
 * them for later execution as appropriate
 * @param {Effect} root
 * @param {Effect[]} effects
 * @param {Effect[]} render_effects
 */
li = function(e, n, i) {
  e.f ^= ee;
  for (var r = e.first, s = null; r !== null; ) {
    var a = r.f, o = (a & (rt | xt)) !== 0, l = o && (a & ee) !== 0, u = l || (a & de) !== 0 || this.skipped_effects.has(r);
    if (!u && r.fn !== null) {
      o ? r.f ^= ee : s !== null && (a & (yr | kr | Vs)) !== 0 ? s.b.defer_effect(r) : (a & yr) !== 0 ? n.push(r) : Qn(r) && ((a & nt) !== 0 && p(this, pn).add(r), Un(r));
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
ci = function(e) {
  for (var n = 0; n < e.length; n += 1)
    ta(e[n], p(this, pn), p(this, vn));
}, na = function() {
  if (p(this, Dt) === 0) {
    for (const e of p(this, fn)) e();
    p(this, fn).clear();
  }
  p(this, Pt) === 0 && z(this, Ae, ra).call(this);
}, ra = function() {
  var r;
  if (rr.size > 1) {
    this.previous.clear();
    var e = K, n = !0;
    for (const s of rr) {
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
        var i = ye;
        ye = [];
        const l = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Map();
        for (const c of a)
          sa(c, o, l, u);
        if (ye.length > 0) {
          D = s, s.apply();
          for (const c of ye)
            z(r = s, Ae, li).call(r, c, [], []);
          s.deactivate();
        }
        ye = i;
      }
    }
    D = null, K = e;
  }
  this.committed = !0, rr.delete(this);
};
let Ge = Nr;
function me(t) {
  var e = Pn;
  Pn = !0;
  try {
    for (var n; ; ) {
      if (yl(), ye.length === 0 && (D == null || D.flush(), ye.length === 0))
        return Mr = null, /** @type {T} */
        n;
      ia();
    }
  } finally {
    Pn = e;
  }
}
function ia() {
  var t = Ut;
  oi = !0;
  var e = null;
  try {
    var n = 0;
    for (Er(!0); ye.length > 0; ) {
      var i = Ge.ensure();
      if (n++ > 1e3) {
        var r, s;
        wl();
      }
      i.process(ye), bt.clear();
    }
  } finally {
    oi = !1, Er(t), Mr = null;
  }
}
function wl() {
  try {
    cl();
  } catch (t) {
    wn(t, Mr);
  }
}
let Te = null;
function is(t) {
  var e = t.length;
  if (e !== 0) {
    for (var n = 0; n < e; ) {
      var i = t[n++];
      if ((i.f & (et | de)) === 0 && Qn(i) && (Te = /* @__PURE__ */ new Set(), Un(i), i.deps === null && i.first === null && i.nodes === null && (i.teardown === null && i.ac === null ? Oa(i) : i.fn = null), (Te == null ? void 0 : Te.size) > 0)) {
        bt.clear();
        for (const r of Te) {
          if ((r.f & (et | de)) !== 0) continue;
          const s = [r];
          let a = r.parent;
          for (; a !== null; )
            Te.has(a) && (Te.delete(a), s.push(a)), a = a.parent;
          for (let o = s.length - 1; o >= 0; o--) {
            const l = s[o];
            (l.f & (et | de)) === 0 && Un(l);
          }
        }
        Te.clear();
      }
    }
    Te = null;
  }
}
function sa(t, e, n, i) {
  if (!n.has(t) && (n.add(t), t.reactions !== null))
    for (const r of t.reactions) {
      const s = r.f;
      (s & Q) !== 0 ? sa(
        /** @type {Derived} */
        r,
        e,
        n,
        i
      ) : (s & (Ai | nt)) !== 0 && (s & ae) === 0 && aa(r, e, i) && (V(r, ae), tt(
        /** @type {Effect} */
        r
      ));
    }
}
function aa(t, e, n) {
  const i = n.get(t);
  if (i !== void 0) return i;
  if (t.deps !== null)
    for (const r of t.deps) {
      if (e.includes(r))
        return !0;
      if ((r.f & Q) !== 0 && aa(
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
function tt(t) {
  for (var e = Mr = t; e.parent !== null; ) {
    e = e.parent;
    var n = e.f;
    if (oi && e === P && (n & nt) !== 0 && (n & Ws) === 0)
      return;
    if ((n & (xt | rt)) !== 0) {
      if ((n & ee) === 0) return;
      e.f ^= ee;
    }
  }
  ye.push(e);
}
function El(t) {
  let e = 0, n = Wt(0), i;
  return () => {
    Ci() && (h(n), Ri(() => (e === 0 && (i = Re(() => t(() => Dn(n)))), e += 1, () => {
      Dr(() => {
        e -= 1, e === 0 && (i == null || i(), i = void 0, Dn(n));
      });
    })));
  };
}
var $l = mn | Kt | $i;
function Al(t, e, n) {
  new Ol(t, e, n);
}
var ce, Wn, je, Mt, Fe, _e, oe, qe, Je, vt, Ht, Ke, jt, _n, gn, _t, Cr, G, oa, la, ui, ur, dr, di;
class Ol {
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   */
  constructor(e, n, i) {
    R(this, G);
    /** @type {Boundary | null} */
    q(this, "parent");
    q(this, "is_pending", !1);
    /** @type {TemplateNode} */
    R(this, ce);
    /** @type {TemplateNode | null} */
    R(this, Wn, L ? I : null);
    /** @type {BoundaryProps} */
    R(this, je);
    /** @type {((anchor: Node) => void)} */
    R(this, Mt);
    /** @type {Effect} */
    R(this, Fe);
    /** @type {Effect | null} */
    R(this, _e, null);
    /** @type {Effect | null} */
    R(this, oe, null);
    /** @type {Effect | null} */
    R(this, qe, null);
    /** @type {DocumentFragment | null} */
    R(this, Je, null);
    /** @type {TemplateNode | null} */
    R(this, vt, null);
    R(this, Ht, 0);
    R(this, Ke, 0);
    R(this, jt, !1);
    /** @type {Set<Effect>} */
    R(this, _n, /* @__PURE__ */ new Set());
    /** @type {Set<Effect>} */
    R(this, gn, /* @__PURE__ */ new Set());
    /**
     * A source containing the number of pending async deriveds/expressions.
     * Only created if `$effect.pending()` is used inside the boundary,
     * otherwise updating the source results in needless `Batch.ensure()`
     * calls followed by no-op flushes
     * @type {Source<number> | null}
     */
    R(this, _t, null);
    R(this, Cr, El(() => (T(this, _t, Wt(p(this, Ht))), () => {
      T(this, _t, null);
    })));
    T(this, ce, e), T(this, je, n), T(this, Mt, i), this.parent = /** @type {Effect} */
    P.b, this.is_pending = !!p(this, je).pending, T(this, Fe, Ii(() => {
      if (P.b = this, L) {
        const s = p(this, Wn);
        yn(), /** @type {Comment} */
        s.nodeType === Qt && /** @type {Comment} */
        s.data === Ir ? z(this, G, la).call(this) : (z(this, G, oa).call(this), p(this, Ke) === 0 && (this.is_pending = !1));
      } else {
        var r = z(this, G, ui).call(this);
        try {
          T(this, _e, be(() => i(r)));
        } catch (s) {
          this.error(s);
        }
        p(this, Ke) > 0 ? z(this, G, dr).call(this) : this.is_pending = !1;
      }
      return () => {
        var s;
        (s = p(this, vt)) == null || s.remove();
      };
    }, $l)), L && T(this, ce, I);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(e) {
    ta(e, p(this, _n), p(this, gn));
  }
  /**
   * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!p(this, je).pending;
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   */
  update_pending_count(e) {
    z(this, G, di).call(this, e), T(this, Ht, p(this, Ht) + e), p(this, _t) && En(p(this, _t), p(this, Ht));
  }
  get_effect_pending() {
    return p(this, Cr).call(this), h(
      /** @type {Source<number>} */
      p(this, _t)
    );
  }
  /** @param {unknown} error */
  error(e) {
    var n = p(this, je).onerror;
    let i = p(this, je).failed;
    if (p(this, jt) || !n && !i)
      throw e;
    p(this, _e) && (ie(p(this, _e)), T(this, _e, null)), p(this, oe) && (ie(p(this, oe)), T(this, oe, null)), p(this, qe) && (ie(p(this, qe)), T(this, qe, null)), L && (re(
      /** @type {TemplateNode} */
      p(this, Wn)
    ), _l(), re(br()));
    var r = !1, s = !1;
    const a = () => {
      if (r) {
        vl();
        return;
      }
      r = !0, s && pl(), Ge.ensure(), T(this, Ht, 0), p(this, qe) !== null && qt(p(this, qe), () => {
        T(this, qe, null);
      }), this.is_pending = this.has_pending_snippet(), T(this, _e, z(this, G, ur).call(this, () => (T(this, jt, !1), be(() => p(this, Mt).call(this, p(this, ce)))))), p(this, Ke) > 0 ? z(this, G, dr).call(this) : this.is_pending = !1;
    };
    var o = N;
    try {
      Z(null), s = !0, n == null || n(e, a), s = !1;
    } catch (l) {
      wn(l, p(this, Fe) && p(this, Fe).parent);
    } finally {
      Z(o);
    }
    i && Dr(() => {
      T(this, qe, z(this, G, ur).call(this, () => {
        Ge.ensure(), T(this, jt, !0);
        try {
          return be(() => {
            i(
              p(this, ce),
              () => e,
              () => a
            );
          });
        } catch (l) {
          return wn(
            l,
            /** @type {Effect} */
            p(this, Fe).parent
          ), null;
        } finally {
          T(this, jt, !1);
        }
      }));
    });
  }
}
ce = new WeakMap(), Wn = new WeakMap(), je = new WeakMap(), Mt = new WeakMap(), Fe = new WeakMap(), _e = new WeakMap(), oe = new WeakMap(), qe = new WeakMap(), Je = new WeakMap(), vt = new WeakMap(), Ht = new WeakMap(), Ke = new WeakMap(), jt = new WeakMap(), _n = new WeakMap(), gn = new WeakMap(), _t = new WeakMap(), Cr = new WeakMap(), G = new WeakSet(), oa = function() {
  try {
    T(this, _e, be(() => p(this, Mt).call(this, p(this, ce))));
  } catch (e) {
    this.error(e);
  }
}, la = function() {
  const e = p(this, je).pending;
  e && (T(this, oe, be(() => e(p(this, ce)))), Ge.enqueue(() => {
    var n = z(this, G, ui).call(this);
    T(this, _e, z(this, G, ur).call(this, () => (Ge.ensure(), be(() => p(this, Mt).call(this, n))))), p(this, Ke) > 0 ? z(this, G, dr).call(this) : (qt(
      /** @type {Effect} */
      p(this, oe),
      () => {
        T(this, oe, null);
      }
    ), this.is_pending = !1);
  }));
}, ui = function() {
  var e = p(this, ce);
  return this.is_pending && (T(this, vt, Ee()), p(this, ce).before(p(this, vt)), e = p(this, vt)), e;
}, /**
 * @param {() => Effect | null} fn
 */
ur = function(e) {
  var n = P, i = N, r = fe;
  $e(p(this, Fe)), Z(p(this, Fe)), bn(p(this, Fe).ctx);
  try {
    return e();
  } catch (s) {
    return Zs(s), null;
  } finally {
    $e(n), Z(i), bn(r);
  }
}, dr = function() {
  const e = (
    /** @type {(anchor: Node) => void} */
    p(this, je).pending
  );
  p(this, _e) !== null && (T(this, Je, document.createDocumentFragment()), p(this, Je).append(
    /** @type {TemplateNode} */
    p(this, vt)
  ), Ta(p(this, _e), p(this, Je))), p(this, oe) === null && T(this, oe, be(() => e(p(this, ce))));
}, /**
 * Updates the pending count associated with the currently visible pending snippet,
 * if any, such that we can replace the snippet with content once work is done
 * @param {1 | -1} d
 */
di = function(e) {
  var n;
  if (!this.has_pending_snippet()) {
    this.parent && z(n = this.parent, G, di).call(n, e);
    return;
  }
  if (T(this, Ke, p(this, Ke) + e), p(this, Ke) === 0) {
    this.is_pending = !1;
    for (const i of p(this, _n))
      V(i, ae), tt(i);
    for (const i of p(this, gn))
      V(i, it), tt(i);
    p(this, _n).clear(), p(this, gn).clear(), p(this, oe) && qt(p(this, oe), () => {
      T(this, oe, null);
    }), p(this, Je) && (p(this, ce).before(p(this, Je)), T(this, Je, null));
  }
};
function Sl(t, e, n, i) {
  const r = Hr;
  if (n.length === 0 && t.length === 0) {
    i(e.map(r));
    return;
  }
  var s = D, a = (
    /** @type {Effect} */
    P
  ), o = xl();
  function l() {
    Promise.all(n.map((u) => /* @__PURE__ */ Tl(u))).then((u) => {
      o();
      try {
        i([...e.map(r), ...u]);
      } catch (c) {
        (a.f & et) === 0 && wn(c, a);
      }
      s == null || s.deactivate(), wr();
    }).catch((u) => {
      wn(u, a);
    });
  }
  t.length > 0 ? Promise.all(t).then(() => {
    o();
    try {
      return l();
    } finally {
      s == null || s.deactivate(), wr();
    }
  }) : l();
}
function xl() {
  var t = P, e = N, n = fe, i = D;
  return function(s = !0) {
    $e(t), Z(e), bn(n), s && (i == null || i.activate());
  };
}
function wr() {
  $e(null), Z(null), bn(null);
}
// @__NO_SIDE_EFFECTS__
function Hr(t) {
  var e = Q | ae, n = N !== null && (N.f & Q) !== 0 ? (
    /** @type {Derived} */
    N
  ) : null;
  return P !== null && (P.f |= Kt), {
    ctx: fe,
    deps: null,
    effects: null,
    equals: Js,
    f: e,
    fn: t,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      J
    ),
    wv: 0,
    parent: n ?? P,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function Tl(t, e, n) {
  let i = (
    /** @type {Effect | null} */
    P
  );
  i === null && sl();
  var r = (
    /** @type {Boundary} */
    i.b
  ), s = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), a = Wt(
    /** @type {V} */
    J
  ), o = !N, l = /* @__PURE__ */ new Map();
  return Ml(() => {
    var w;
    var u = Bs();
    s = u.promise;
    try {
      Promise.resolve(t()).then(u.resolve, u.reject).then(() => {
        c === D && c.committed && c.deactivate(), wr();
      });
    } catch (b) {
      u.reject(b), wr();
    }
    var c = (
      /** @type {Batch} */
      D
    );
    if (o) {
      var f = r.is_rendered();
      r.update_pending_count(1), c.increment(f), (w = l.get(c)) == null || w.reject(ln), l.delete(c), l.set(c, u);
    }
    const _ = (b, A = void 0) => {
      if (c.activate(), A)
        A !== ln && (a.f |= yt, En(a, A));
      else {
        (a.f & yt) !== 0 && (a.f ^= yt), En(a, b);
        for (const [d, v] of l) {
          if (l.delete(d), d === c) break;
          v.reject(ln);
        }
      }
      o && (r.update_pending_count(-1), c.decrement(f));
    };
    u.promise.then(_, (b) => _(null, b || "unknown"));
  }), kl(() => {
    for (const u of l.values())
      u.reject(ln);
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
function Cn(t) {
  const e = /* @__PURE__ */ Hr(t);
  return Na(e), e;
}
// @__NO_SIDE_EFFECTS__
function Nl(t) {
  const e = /* @__PURE__ */ Hr(t);
  return e.equals = Ks, e;
}
function ca(t) {
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
function Cl(t) {
  for (var e = t.parent; e !== null; ) {
    if ((e.f & Q) === 0)
      return (e.f & et) === 0 ? (
        /** @type {Effect} */
        e
      ) : null;
    e = e.parent;
  }
  return null;
}
function Ni(t) {
  var e, n = P;
  $e(Cl(t));
  try {
    t.f &= ~Vt, ca(t), e = La(t);
  } finally {
    $e(n);
  }
  return e;
}
function ua(t) {
  var e = Ni(t);
  if (!t.equals(e) && (t.wv = Ra(), (!(D != null && D.is_fork) || t.deps === null) && (t.v = e, t.deps === null))) {
    V(t, ee);
    return;
  }
  At || (K !== null ? (Ci() || D != null && D.is_fork) && K.set(t, e) : Ti(t));
}
let fi = /* @__PURE__ */ new Set();
const bt = /* @__PURE__ */ new Map();
let da = !1;
function Wt(t, e) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: t,
    reactions: null,
    equals: Js,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function M(t, e) {
  const n = Wt(t);
  return Na(n), n;
}
// @__NO_SIDE_EFFECTS__
function fa(t, e = !1, n = !0) {
  const i = Wt(t);
  return e || (i.equals = Ks), i;
}
function O(t, e, n = !1) {
  N !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!De || (N.f & rs) !== 0) && Qs() && (N.f & (Q | nt | Ai | rs)) !== 0 && !(se != null && se.includes(t)) && hl();
  let i = n ? Xe(e) : e;
  return En(t, i);
}
function En(t, e) {
  if (!t.equals(e)) {
    var n = t.v;
    At ? bt.set(t, e) : bt.set(t, n), t.v = e;
    var i = Ge.ensure();
    if (i.capture(t, n), (t.f & Q) !== 0) {
      const r = (
        /** @type {Derived} */
        t
      );
      (t.f & ae) !== 0 && Ni(r), Ti(r);
    }
    t.wv = Ra(), ha(t, ae), P !== null && (P.f & ee) !== 0 && (P.f & (rt | xt)) === 0 && (pe === null ? jl([t]) : pe.push(t)), !i.is_fork && fi.size > 0 && !da && Rl();
  }
  return e;
}
function Rl() {
  da = !1;
  var t = Ut;
  Er(!0);
  const e = Array.from(fi);
  try {
    for (const n of e)
      (n.f & ee) !== 0 && V(n, it), Qn(n) && Un(n);
  } finally {
    Er(t);
  }
  fi.clear();
}
function Dn(t) {
  O(t, t.v + 1);
}
function ha(t, e) {
  var n = t.reactions;
  if (n !== null)
    for (var i = n.length, r = 0; r < i; r++) {
      var s = n[r], a = s.f, o = (a & ae) === 0;
      if (o && V(s, e), (a & Q) !== 0) {
        var l = (
          /** @type {Derived} */
          s
        );
        K == null || K.delete(l), (a & Vt) === 0 && (a & we && (s.f |= Vt), ha(l, it));
      } else o && ((a & nt) !== 0 && Te !== null && Te.add(
        /** @type {Effect} */
        s
      ), tt(
        /** @type {Effect} */
        s
      ));
    }
}
function Xe(t) {
  if (typeof t != "object" || t === null || cr in t)
    return t;
  const e = zs(t);
  if (e !== Xo && e !== Zo)
    return t;
  var n = /* @__PURE__ */ new Map(), i = Gs(t), r = /* @__PURE__ */ M(0), s = Gt, a = (o) => {
    if (Gt === s)
      return o();
    var l = N, u = Gt;
    Z(null), ls(s);
    var c = o();
    return Z(l), ls(u), c;
  };
  return i && n.set("length", /* @__PURE__ */ M(
    /** @type {any[]} */
    t.length
  )), new Proxy(
    /** @type {any} */
    t,
    {
      defineProperty(o, l, u) {
        (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && dl();
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
            const c = a(() => /* @__PURE__ */ M(J));
            n.set(l, c), Dn(r);
          }
        } else
          O(u, J), Dn(r);
        return !0;
      },
      get(o, l, u) {
        var w;
        if (l === cr)
          return t;
        var c = n.get(l), f = l in o;
        if (c === void 0 && (!f || (w = un(o, l)) != null && w.writable) && (c = a(() => {
          var b = Xe(f ? o[l] : J), A = /* @__PURE__ */ M(b);
          return A;
        }), n.set(l, c)), c !== void 0) {
          var _ = h(c);
          return _ === J ? void 0 : _;
        }
        return Reflect.get(o, l, u);
      },
      getOwnPropertyDescriptor(o, l) {
        var u = Reflect.getOwnPropertyDescriptor(o, l);
        if (u && "value" in u) {
          var c = n.get(l);
          c && (u.value = h(c));
        } else if (u === void 0) {
          var f = n.get(l), _ = f == null ? void 0 : f.v;
          if (f !== void 0 && _ !== J)
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
        if (l === cr)
          return !0;
        var u = n.get(l), c = u !== void 0 && u.v !== J || Reflect.has(o, l);
        if (u !== void 0 || P !== null && (!c || (_ = un(o, l)) != null && _.writable)) {
          u === void 0 && (u = a(() => {
            var w = c ? Xe(o[l]) : J, b = /* @__PURE__ */ M(w);
            return b;
          }), n.set(l, u));
          var f = h(u);
          if (f === J)
            return !1;
        }
        return c;
      },
      set(o, l, u, c) {
        var y;
        var f = n.get(l), _ = l in o;
        if (i && l === "length")
          for (var w = u; w < /** @type {Source<number>} */
          f.v; w += 1) {
            var b = n.get(w + "");
            b !== void 0 ? O(b, J) : w in o && (b = a(() => /* @__PURE__ */ M(J)), n.set(w + "", b));
          }
        if (f === void 0)
          (!_ || (y = un(o, l)) != null && y.writable) && (f = a(() => /* @__PURE__ */ M(void 0)), O(f, Xe(u)), n.set(l, f));
        else {
          _ = f.v !== J;
          var A = a(() => Xe(u));
          O(f, A);
        }
        var d = Reflect.getOwnPropertyDescriptor(o, l);
        if (d != null && d.set && d.set.call(c, u), !_) {
          if (i && typeof l == "string") {
            var v = (
              /** @type {Source<number>} */
              n.get("length")
            ), m = Number(l);
            Number.isInteger(m) && m >= v.v && O(v, m + 1);
          }
          Dn(r);
        }
        return !0;
      },
      ownKeys(o) {
        h(r);
        var l = Reflect.ownKeys(o).filter((f) => {
          var _ = n.get(f);
          return _ === void 0 || _.v !== J;
        });
        for (var [u, c] of n)
          c.v !== J && !(u in o) && l.push(u);
        return l;
      },
      setPrototypeOf() {
        fl();
      }
    }
  );
}
var ss, pa, va, _a;
function hi() {
  if (ss === void 0) {
    ss = window, pa = /Firefox/.test(navigator.userAgent);
    var t = Element.prototype, e = Node.prototype, n = Text.prototype;
    va = un(e, "firstChild").get, _a = un(e, "nextSibling").get, ns(t) && (t.__click = void 0, t.__className = void 0, t.__attributes = null, t.__style = void 0, t.__e = void 0), ns(n) && (n.__t = void 0);
  }
}
function Ee(t = "") {
  return document.createTextNode(t);
}
// @__NO_SIDE_EFFECTS__
function Pe(t) {
  return (
    /** @type {TemplateNode | null} */
    va.call(t)
  );
}
// @__NO_SIDE_EFFECTS__
function Me(t) {
  return (
    /** @type {TemplateNode | null} */
    _a.call(t)
  );
}
function ct(t, e) {
  if (!L)
    return /* @__PURE__ */ Pe(t);
  var n = /* @__PURE__ */ Pe(I);
  if (n === null)
    n = I.appendChild(Ee());
  else if (e && n.nodeType !== Oi) {
    var i = Ee();
    return n == null || n.before(i), re(i), i;
  }
  return re(n), n;
}
function as(t, e = !1) {
  if (!L) {
    var n = /* @__PURE__ */ Pe(t);
    return n instanceof Comment && n.data === "" ? /* @__PURE__ */ Me(n) : n;
  }
  if (e && (I == null ? void 0 : I.nodeType) !== Oi) {
    var i = Ee();
    return I == null || I.before(i), re(i), i;
  }
  return I;
}
function Ct(t, e = 1, n = !1) {
  let i = L ? I : t;
  for (var r; e--; )
    r = i, i = /** @type {TemplateNode} */
    /* @__PURE__ */ Me(i);
  if (!L)
    return i;
  if (n && (i == null ? void 0 : i.nodeType) !== Oi) {
    var s = Ee();
    return i === null ? r == null || r.after(s) : i.before(s), re(s), s;
  }
  return re(i), i;
}
function ga(t) {
  t.textContent = "";
}
function ma() {
  return !1;
}
function ya(t) {
  var e = N, n = P;
  Z(null), $e(null);
  try {
    return t();
  } finally {
    Z(e), $e(n);
  }
}
function Il(t) {
  P === null && (N === null && ll(), ol()), At && al();
}
function Ll(t, e) {
  var n = e.last;
  n === null ? e.last = e.first = t : (n.next = t, t.prev = n, e.last = t);
}
function ze(t, e, n) {
  var i = P;
  i !== null && (i.f & de) !== 0 && (t |= de);
  var r = {
    ctx: fe,
    deps: null,
    nodes: null,
    f: t | ae | we,
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
      Un(r), r.f |= Pr;
    } catch (o) {
      throw ie(r), o;
    }
  else e !== null && tt(r);
  var s = r;
  if (n && s.deps === null && s.teardown === null && s.nodes === null && s.first === s.last && // either `null`, or a singular child
  (s.f & Kt) === 0 && (s = s.first, (t & nt) !== 0 && (t & mn) !== 0 && s !== null && (s.f |= mn)), s !== null && (s.parent = i, i !== null && Ll(s, i), N !== null && (N.f & Q) !== 0 && (t & xt) === 0)) {
    var a = (
      /** @type {Derived} */
      N
    );
    (a.effects ?? (a.effects = [])).push(s);
  }
  return r;
}
function Ci() {
  return N !== null && !De;
}
function kl(t) {
  const e = ze(kr, null, !1);
  return V(e, ee), e.teardown = t, e;
}
function dn(t) {
  Il();
  var e = (
    /** @type {Effect} */
    P.f
  ), n = !N && (e & rt) !== 0 && (e & Pr) === 0;
  if (n) {
    var i = (
      /** @type {ComponentContext} */
      fe
    );
    (i.e ?? (i.e = [])).push(t);
  } else
    return ba(t);
}
function ba(t) {
  return ze(yr | tl, t, !1);
}
function Pl(t) {
  Ge.ensure();
  const e = ze(xt | Kt, t, !0);
  return () => {
    ie(e);
  };
}
function Dl(t) {
  Ge.ensure();
  const e = ze(xt | Kt, t, !0);
  return (n = {}) => new Promise((i) => {
    n.outro ? qt(e, () => {
      ie(e), i(void 0);
    }) : (ie(e), i(void 0));
  });
}
function wa(t) {
  return ze(yr, t, !1);
}
function Ml(t) {
  return ze(Ai | Kt, t, !0);
}
function Ri(t, e = 0) {
  return ze(kr | e, t, !0);
}
function We(t, e = [], n = [], i = []) {
  Sl(i, e, n, (r) => {
    ze(kr, () => t(...r.map(h)), !0);
  });
}
function Ii(t, e = 0) {
  var n = ze(nt | e, t, !0);
  return n;
}
function be(t) {
  return ze(rt | Kt, t, !0);
}
function Ea(t) {
  var e = t.teardown;
  if (e !== null) {
    const n = At, i = N;
    os(!0), Z(null);
    try {
      e.call(null);
    } finally {
      os(n), Z(i);
    }
  }
}
function $a(t, e = !1) {
  var n = t.first;
  for (t.first = t.last = null; n !== null; ) {
    const r = n.ac;
    r !== null && ya(() => {
      r.abort(ln);
    });
    var i = n.next;
    (n.f & xt) !== 0 ? n.parent = null : ie(n, e), n = i;
  }
}
function Hl(t) {
  for (var e = t.first; e !== null; ) {
    var n = e.next;
    (e.f & rt) === 0 && ie(e), e = n;
  }
}
function ie(t, e = !0) {
  var n = !1;
  (e || (t.f & Ws) !== 0) && t.nodes !== null && t.nodes.end !== null && (Aa(
    t.nodes.start,
    /** @type {TemplateNode} */
    t.nodes.end
  ), n = !0), $a(t, e && !n), $r(t, 0), V(t, et);
  var i = t.nodes && t.nodes.t;
  if (i !== null)
    for (const s of i)
      s.stop();
  Ea(t);
  var r = t.parent;
  r !== null && r.first !== null && Oa(t), t.next = t.prev = t.teardown = t.ctx = t.deps = t.fn = t.nodes = t.ac = null;
}
function Aa(t, e) {
  for (; t !== null; ) {
    var n = t === e ? null : /* @__PURE__ */ Me(t);
    t.remove(), t = n;
  }
}
function Oa(t) {
  var e = t.parent, n = t.prev, i = t.next;
  n !== null && (n.next = i), i !== null && (i.prev = n), e !== null && (e.first === t && (e.first = i), e.last === t && (e.last = n));
}
function qt(t, e, n = !0) {
  var i = [];
  Sa(t, i, !0);
  var r = () => {
    n && ie(t), e && e();
  }, s = i.length;
  if (s > 0) {
    var a = () => --s || r();
    for (var o of i)
      o.out(a);
  } else
    r();
}
function Sa(t, e, n) {
  if ((t.f & de) === 0) {
    t.f ^= de;
    var i = t.nodes && t.nodes.t;
    if (i !== null)
      for (const o of i)
        (o.is_global || n) && e.push(o);
    for (var r = t.first; r !== null; ) {
      var s = r.next, a = (r.f & mn) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (r.f & rt) !== 0 && (t.f & nt) !== 0;
      Sa(r, e, a ? n : !1), r = s;
    }
  }
}
function Li(t) {
  xa(t, !0);
}
function xa(t, e) {
  if ((t.f & de) !== 0) {
    t.f ^= de, (t.f & ee) === 0 && (V(t, ae), tt(t));
    for (var n = t.first; n !== null; ) {
      var i = n.next, r = (n.f & mn) !== 0 || (n.f & rt) !== 0;
      xa(n, r ? e : !1), n = i;
    }
    var s = t.nodes && t.nodes.t;
    if (s !== null)
      for (const a of s)
        (a.is_global || e) && a.in();
  }
}
function Ta(t, e) {
  if (t.nodes)
    for (var n = t.nodes.start, i = t.nodes.end; n !== null; ) {
      var r = n === i ? null : /* @__PURE__ */ Me(n);
      e.append(n), n = r;
    }
}
let Ut = !1;
function Er(t) {
  Ut = t;
}
let At = !1;
function os(t) {
  At = t;
}
let N = null, De = !1;
function Z(t) {
  N = t;
}
let P = null;
function $e(t) {
  P = t;
}
let se = null;
function Na(t) {
  N !== null && (se === null ? se = [t] : se.push(t));
}
let ne = null, le = 0, pe = null;
function jl(t) {
  pe = t;
}
let Ca = 1, qn = 0, Gt = qn;
function ls(t) {
  Gt = t;
}
function Ra() {
  return ++Ca;
}
function Qn(t) {
  var e = t.f;
  if ((e & ae) !== 0)
    return !0;
  if (e & Q && (t.f &= ~Vt), (e & it) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      t.deps
    ), i = n.length, r = 0; r < i; r++) {
      var s = n[r];
      if (Qn(
        /** @type {Derived} */
        s
      ) && ua(
        /** @type {Derived} */
        s
      ), s.wv > t.wv)
        return !0;
    }
    (e & we) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    K === null && V(t, ee);
  }
  return !1;
}
function Ia(t, e, n = !0) {
  var i = t.reactions;
  if (i !== null && !(se != null && se.includes(t)))
    for (var r = 0; r < i.length; r++) {
      var s = i[r];
      (s.f & Q) !== 0 ? Ia(
        /** @type {Derived} */
        s,
        e,
        !1
      ) : e === s && (n ? V(s, ae) : (s.f & ee) !== 0 && V(s, it), tt(
        /** @type {Effect} */
        s
      ));
    }
}
function La(t) {
  var b;
  var e = ne, n = le, i = pe, r = N, s = se, a = fe, o = De, l = Gt, u = t.f;
  ne = /** @type {null | Value[]} */
  null, le = 0, pe = null, N = (u & (rt | xt)) === 0 ? t : null, se = null, bn(t.ctx), De = !1, Gt = ++qn, t.ac !== null && (ya(() => {
    t.ac.abort(ln);
  }), t.ac = null);
  try {
    t.f |= ai;
    var c = (
      /** @type {Function} */
      t.fn
    ), f = c(), _ = t.deps;
    if (ne !== null) {
      var w;
      if ($r(t, le), _ !== null && le > 0)
        for (_.length = le + ne.length, w = 0; w < ne.length; w++)
          _[le + w] = ne[w];
      else
        t.deps = _ = ne;
      if (Ci() && (t.f & we) !== 0)
        for (w = le; w < _.length; w++)
          ((b = _[w]).reactions ?? (b.reactions = [])).push(t);
    } else _ !== null && le < _.length && ($r(t, le), _.length = le);
    if (Qs() && pe !== null && !De && _ !== null && (t.f & (Q | it | ae)) === 0)
      for (w = 0; w < /** @type {Source[]} */
      pe.length; w++)
        Ia(
          pe[w],
          /** @type {Effect} */
          t
        );
    return r !== null && r !== t && (qn++, pe !== null && (i === null ? i = pe : i.push(.../** @type {Source[]} */
    pe))), (t.f & yt) !== 0 && (t.f ^= yt), f;
  } catch (A) {
    return Zs(A);
  } finally {
    t.f ^= ai, ne = e, le = n, pe = i, N = r, se = s, bn(a), De = o, Gt = l;
  }
}
function Fl(t, e) {
  let n = e.reactions;
  if (n !== null) {
    var i = Ko.call(n, t);
    if (i !== -1) {
      var r = n.length - 1;
      r === 0 ? n = e.reactions = null : (n[i] = n[r], n.pop());
    }
  }
  if (n === null && (e.f & Q) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (ne === null || !ne.includes(e))) {
    var s = (
      /** @type {Derived} */
      e
    );
    (s.f & we) !== 0 && (s.f ^= we, s.f &= ~Vt), Ti(s), ca(s), $r(s, 0);
  }
}
function $r(t, e) {
  var n = t.deps;
  if (n !== null)
    for (var i = e; i < n.length; i++)
      Fl(t, n[i]);
}
function Un(t) {
  var e = t.f;
  if ((e & et) === 0) {
    V(t, ee);
    var n = P, i = Ut;
    P = t, Ut = !0;
    try {
      (e & (nt | Vs)) !== 0 ? Hl(t) : $a(t), Ea(t);
      var r = La(t);
      t.teardown = typeof r == "function" ? r : null, t.wv = Ca;
      var s;
      si && ml && (t.f & ae) !== 0 && t.deps;
    } finally {
      Ut = i, P = n;
    }
  }
}
function h(t) {
  var e = t.f, n = (e & Q) !== 0;
  if (N !== null && !De) {
    var i = P !== null && (P.f & et) !== 0;
    if (!i && !(se != null && se.includes(t))) {
      var r = N.deps;
      if ((N.f & ai) !== 0)
        t.rv < qn && (t.rv = qn, ne === null && r !== null && r[le] === t ? le++ : ne === null ? ne = [t] : ne.includes(t) || ne.push(t));
      else {
        (N.deps ?? (N.deps = [])).push(t);
        var s = t.reactions;
        s === null ? t.reactions = [N] : s.includes(N) || s.push(N);
      }
    }
  }
  if (At && bt.has(t))
    return bt.get(t);
  if (n) {
    var a = (
      /** @type {Derived} */
      t
    );
    if (At) {
      var o = a.v;
      return ((a.f & ee) === 0 && a.reactions !== null || Pa(a)) && (o = Ni(a)), bt.set(a, o), o;
    }
    var l = (a.f & we) === 0 && !De && N !== null && (Ut || (N.f & we) !== 0), u = a.deps === null;
    Qn(a) && (l && (a.f |= we), ua(a)), l && !u && ka(a);
  }
  if (K != null && K.has(t))
    return K.get(t);
  if ((t.f & yt) !== 0)
    throw t.v;
  return t.v;
}
function ka(t) {
  if (t.deps !== null) {
    t.f |= we;
    for (const e of t.deps)
      (e.reactions ?? (e.reactions = [])).push(t), (e.f & Q) !== 0 && (e.f & we) === 0 && ka(
        /** @type {Derived} */
        e
      );
  }
}
function Pa(t) {
  if (t.v === J) return !0;
  if (t.deps === null) return !1;
  for (const e of t.deps)
    if (bt.has(e) || (e.f & Q) !== 0 && Pa(
      /** @type {Derived} */
      e
    ))
      return !0;
  return !1;
}
function Re(t) {
  var e = De;
  try {
    return De = !0, t();
  } finally {
    De = e;
  }
}
const Da = /* @__PURE__ */ new Set(), pi = /* @__PURE__ */ new Set();
function ql(t) {
  for (var e = 0; e < t.length; e++)
    Da.add(t[e]);
  for (var n of pi)
    n(t);
}
let cs = null;
function ir(t) {
  var d;
  var e = this, n = (
    /** @type {Node} */
    e.ownerDocument
  ), i = t.type, r = ((d = t.composedPath) == null ? void 0 : d.call(t)) || [], s = (
    /** @type {null | Element} */
    r[0] || t.target
  );
  cs = t;
  var a = 0, o = cs === t && t.__root;
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
    mr(t, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var c = N, f = P;
    Z(null), $e(null);
    try {
      for (var _, w = []; s !== null; ) {
        var b = s.assignedSlot || s.parentNode || /** @type {any} */
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
        if (t.cancelBubble || b === e || b === null)
          break;
        s = b;
      }
      if (_) {
        for (let v of w)
          queueMicrotask(() => {
            throw v;
          });
        throw _;
      }
    } finally {
      t.__root = e, delete t.currentTarget, Z(c), $e(f);
    }
  }
}
function Ma(t) {
  var e = document.createElement("template");
  return e.innerHTML = t.replaceAll("<!>", "<!---->"), e.content;
}
function wt(t, e) {
  var n = (
    /** @type {Effect} */
    P
  );
  n.nodes === null && (n.nodes = { start: t, end: e, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function st(t, e) {
  var n = (e & Wo) !== 0, i = (e & Yo) !== 0, r, s = !t.startsWith("<!>");
  return () => {
    if (L)
      return wt(I, null), I;
    r === void 0 && (r = Ma(s ? t : "<!>" + t), n || (r = /** @type {TemplateNode} */
    /* @__PURE__ */ Pe(r)));
    var a = (
      /** @type {TemplateNode} */
      i || pa ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    if (n) {
      var o = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Pe(a)
      ), l = (
        /** @type {TemplateNode} */
        a.lastChild
      );
      wt(o, l);
    } else
      wt(a, a);
    return a;
  };
}
function us() {
  if (L)
    return wt(I, null), I;
  var t = document.createDocumentFragment(), e = document.createComment(""), n = Ee();
  return t.append(e, n), wt(e, n), t;
}
function ve(t, e) {
  if (L) {
    var n = (
      /** @type {Effect & { nodes: EffectNodes }} */
      P
    );
    ((n.f & Pr) === 0 || n.nodes.end === null) && (n.nodes.end = I), yn();
    return;
  }
  t !== null && t.before(
    /** @type {Node} */
    e
  );
}
const Ul = ["touchstart", "touchmove"];
function Gl(t) {
  return Ul.includes(t);
}
function zl(t, e) {
  var n = e == null ? "" : typeof e == "object" ? e + "" : e;
  n !== (t.__t ?? (t.__t = t.nodeValue)) && (t.__t = n, t.nodeValue = n + "");
}
function Ha(t, e) {
  return ja(t, e);
}
function Bl(t, e) {
  hi(), e.intro = e.intro ?? !1;
  const n = e.target, i = L, r = I;
  try {
    for (var s = /* @__PURE__ */ Pe(n); s && (s.nodeType !== Qt || /** @type {Comment} */
    s.data !== Us); )
      s = /* @__PURE__ */ Me(s);
    if (!s)
      throw Bt;
    ke(!0), re(
      /** @type {Comment} */
      s
    );
    const a = ja(t, { ...e, anchor: s });
    return ke(!1), /**  @type {Exports} */
    a;
  } catch (a) {
    if (a instanceof Error && a.message.split(`
`).some((o) => o.startsWith("https://svelte.dev/e/")))
      throw a;
    return a !== Bt && console.warn("Failed to hydrate: ", a), e.recover === !1 && ul(), hi(), ga(n), ke(!1), Ha(t, e);
  } finally {
    ke(i), re(r);
  }
}
const rn = /* @__PURE__ */ new Map();
function ja(t, { target: e, anchor: n, props: i = {}, events: r, context: s, intro: a = !0 }) {
  hi();
  var o = /* @__PURE__ */ new Set(), l = (f) => {
    for (var _ = 0; _ < f.length; _++) {
      var w = f[_];
      if (!o.has(w)) {
        o.add(w);
        var b = Gl(w);
        e.addEventListener(w, ir, { passive: b });
        var A = rn.get(w);
        A === void 0 ? (document.addEventListener(w, ir, { passive: b }), rn.set(w, 1)) : rn.set(w, A + 1);
      }
    }
  };
  l(Lr(Da)), pi.add(l);
  var u = void 0, c = Dl(() => {
    var f = n ?? e.appendChild(Ee());
    return Al(
      /** @type {TemplateNode} */
      f,
      {
        pending: () => {
        }
      },
      (_) => {
        if (s) {
          Si({});
          var w = (
            /** @type {ComponentContext} */
            fe
          );
          w.c = s;
        }
        if (r && (i.$$events = r), L && wt(
          /** @type {TemplateNode} */
          _,
          null
        ), u = t(_, i) || {}, L && (P.nodes.end = I, I === null || I.nodeType !== Qt || /** @type {Comment} */
        I.data !== Ei))
          throw Kn(), Bt;
        s && xi();
      }
    ), () => {
      var b;
      for (var _ of o) {
        e.removeEventListener(_, ir);
        var w = (
          /** @type {number} */
          rn.get(_)
        );
        --w === 0 ? (document.removeEventListener(_, ir), rn.delete(_)) : rn.set(_, w);
      }
      pi.delete(l), f !== n && ((b = f.parentNode) == null || b.removeChild(f));
    };
  });
  return vi.set(u, c), u;
}
let vi = /* @__PURE__ */ new WeakMap();
function Vl(t, e) {
  const n = vi.get(t);
  return n ? (vi.delete(t), n(e)) : Promise.resolve();
}
var Ce, Ue, ue, Ft, Yn, Jn, Rr;
class Wl {
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(e, n = !0) {
    /** @type {TemplateNode} */
    q(this, "anchor");
    /** @type {Map<Batch, Key>} */
    R(this, Ce, /* @__PURE__ */ new Map());
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
    R(this, Ue, /* @__PURE__ */ new Map());
    /**
     * Similar to #onscreen with respect to the keys, but contains branches that are not yet
     * in the DOM, because their insertion is deferred.
     * @type {Map<Key, Branch>}
     */
    R(this, ue, /* @__PURE__ */ new Map());
    /**
     * Keys of effects that are currently outroing
     * @type {Set<Key>}
     */
    R(this, Ft, /* @__PURE__ */ new Set());
    /**
     * Whether to pause (i.e. outro) on change, or destroy immediately.
     * This is necessary for `<svelte:element>`
     */
    R(this, Yn, !0);
    R(this, Jn, () => {
      var e = (
        /** @type {Batch} */
        D
      );
      if (p(this, Ce).has(e)) {
        var n = (
          /** @type {Key} */
          p(this, Ce).get(e)
        ), i = p(this, Ue).get(n);
        if (i)
          Li(i), p(this, Ft).delete(n);
        else {
          var r = p(this, ue).get(n);
          r && (p(this, Ue).set(n, r.effect), p(this, ue).delete(n), r.fragment.lastChild.remove(), this.anchor.before(r.fragment), i = r.effect);
        }
        for (const [s, a] of p(this, Ce)) {
          if (p(this, Ce).delete(s), s === e)
            break;
          const o = p(this, ue).get(a);
          o && (ie(o.effect), p(this, ue).delete(a));
        }
        for (const [s, a] of p(this, Ue)) {
          if (s === n || p(this, Ft).has(s)) continue;
          const o = () => {
            if (Array.from(p(this, Ce).values()).includes(s)) {
              var u = document.createDocumentFragment();
              Ta(a, u), u.append(Ee()), p(this, ue).set(s, { effect: a, fragment: u });
            } else
              ie(a);
            p(this, Ft).delete(s), p(this, Ue).delete(s);
          };
          p(this, Yn) || !i ? (p(this, Ft).add(s), qt(a, o, !1)) : o();
        }
      }
    });
    /**
     * @param {Batch} batch
     */
    R(this, Rr, (e) => {
      p(this, Ce).delete(e);
      const n = Array.from(p(this, Ce).values());
      for (const [i, r] of p(this, ue))
        n.includes(i) || (ie(r.effect), p(this, ue).delete(i));
    });
    this.anchor = e, T(this, Yn, n);
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
    ), r = ma();
    if (n && !p(this, Ue).has(e) && !p(this, ue).has(e))
      if (r) {
        var s = document.createDocumentFragment(), a = Ee();
        s.append(a), p(this, ue).set(e, {
          effect: be(() => n(a)),
          fragment: s
        });
      } else
        p(this, Ue).set(
          e,
          be(() => n(this.anchor))
        );
    if (p(this, Ce).set(i, e), r) {
      for (const [o, l] of p(this, Ue))
        o === e ? i.skipped_effects.delete(l) : i.skipped_effects.add(l);
      for (const [o, l] of p(this, ue))
        o === e ? i.skipped_effects.delete(l.effect) : i.skipped_effects.add(l.effect);
      i.oncommit(p(this, Jn)), i.ondiscard(p(this, Rr));
    } else
      L && (this.anchor = I), p(this, Jn).call(this);
  }
}
Ce = new WeakMap(), Ue = new WeakMap(), ue = new WeakMap(), Ft = new WeakMap(), Yn = new WeakMap(), Jn = new WeakMap(), Rr = new WeakMap();
function Fa(t) {
  fe === null && il(), dn(() => {
    const e = Re(t);
    if (typeof e == "function") return (
      /** @type {() => void} */
      e
    );
  });
}
function ut(t, e, n = !1) {
  L && yn();
  var i = new Wl(t), r = n ? mn : 0;
  function s(a, o) {
    if (L) {
      const u = Ys(t) === Ir;
      if (a === u) {
        var l = br();
        re(l), i.anchor = l, ke(!1), i.ensure(a, o), ke(!0);
        return;
      }
    }
    i.ensure(a, o);
  }
  Ii(() => {
    var a = !1;
    e((o, l = !0) => {
      a = !0, s(l, o);
    }), a || s(!1, null);
  }, r);
}
function Yl(t, e, n) {
  for (var i = [], r = e.length, s, a = e.length, o = 0; o < r; o++) {
    let f = e[o];
    qt(
      f,
      () => {
        if (s) {
          if (s.pending.delete(f), s.done.add(f), s.pending.size === 0) {
            var _ = (
              /** @type {Set<EachOutroGroup>} */
              t.outrogroups
            );
            _i(Lr(s.done)), _.delete(s), _.size === 0 && (t.outrogroups = null);
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
      ga(c), c.append(u), t.items.clear();
    }
    _i(e, !l);
  } else
    s = {
      pending: new Set(e),
      done: /* @__PURE__ */ new Set()
    }, (t.outrogroups ?? (t.outrogroups = /* @__PURE__ */ new Set())).add(s);
}
function _i(t, e = !0) {
  for (var n = 0; n < t.length; n++)
    ie(t[n], e);
}
var ds;
function Jl(t, e, n, i, r, s = null) {
  var a = t, o = /* @__PURE__ */ new Map();
  {
    var l = (
      /** @type {Element} */
      t
    );
    a = L ? re(/* @__PURE__ */ Pe(l)) : l.appendChild(Ee());
  }
  L && yn();
  var u = null, c = /* @__PURE__ */ Nl(() => {
    var d = n();
    return Gs(d) ? d : d == null ? [] : Lr(d);
  }), f, _ = !0;
  function w() {
    A.fallback = u, Kl(A, f, a, e, i), u !== null && (f.length === 0 ? (u.f & gt) === 0 ? Li(u) : (u.f ^= gt, Ln(u, null, a)) : qt(u, () => {
      u = null;
    }));
  }
  var b = Ii(() => {
    f = /** @type {V[]} */
    h(c);
    var d = f.length;
    let v = !1;
    if (L) {
      var m = Ys(a) === Ir;
      m !== (d === 0) && (a = br(), re(a), ke(!1), v = !0);
    }
    for (var y = /* @__PURE__ */ new Set(), S = (
      /** @type {Batch} */
      D
    ), x = ma(), C = 0; C < d; C += 1) {
      L && I.nodeType === Qt && /** @type {Comment} */
      I.data === Ei && (a = /** @type {Comment} */
      I, v = !0, ke(!1));
      var k = f[C], F = i(k, C), H = _ ? null : o.get(F);
      H ? (H.v && En(H.v, k), H.i && En(H.i, C), x && S.skipped_effects.delete(H.e)) : (H = Ql(
        o,
        _ ? a : ds ?? (ds = Ee()),
        k,
        F,
        C,
        r,
        e,
        n
      ), _ || (H.e.f |= gt), o.set(F, H)), y.add(F);
    }
    if (d === 0 && s && !u && (_ ? u = be(() => s(a)) : (u = be(() => s(ds ?? (ds = Ee()))), u.f |= gt)), L && d > 0 && re(br()), !_)
      if (x) {
        for (const [tr, On] of o)
          y.has(tr) || S.skipped_effects.add(On.e);
        S.oncommit(w), S.ondiscard(() => {
        });
      } else
        w();
    v && ke(!0), h(c);
  }), A = { effect: b, items: o, outrogroups: null, fallback: u };
  _ = !1, L && (a = I);
}
function Kl(t, e, n, i, r) {
  var F;
  var s = e.length, a = t.items, o = t.effect.first, l, u = null, c = [], f = [], _, w, b, A;
  for (A = 0; A < s; A += 1) {
    if (_ = e[A], w = r(_, A), b = /** @type {EachItem} */
    a.get(w).e, t.outrogroups !== null)
      for (const H of t.outrogroups)
        H.pending.delete(b), H.done.delete(b);
    if ((b.f & gt) !== 0)
      if (b.f ^= gt, b === o)
        Ln(b, null, n);
      else {
        var d = u ? u.next : o;
        b === t.effect.last && (t.effect.last = b.prev), b.prev && (b.prev.next = b.next), b.next && (b.next.prev = b.prev), ot(t, u, b), ot(t, b, d), Ln(b, d, n), u = b, c = [], f = [], o = u.next;
        continue;
      }
    if ((b.f & de) !== 0 && Li(b), b !== o) {
      if (l !== void 0 && l.has(b)) {
        if (c.length < f.length) {
          var v = f[0], m;
          u = v.prev;
          var y = c[0], S = c[c.length - 1];
          for (m = 0; m < c.length; m += 1)
            Ln(c[m], v, n);
          for (m = 0; m < f.length; m += 1)
            l.delete(f[m]);
          ot(t, y.prev, S.next), ot(t, u, y), ot(t, S, v), o = v, u = S, A -= 1, c = [], f = [];
        } else
          l.delete(b), Ln(b, o, n), ot(t, b.prev, b.next), ot(t, b, u === null ? t.effect.first : u.next), ot(t, u, b), u = b;
        continue;
      }
      for (c = [], f = []; o !== null && o !== b; )
        (l ?? (l = /* @__PURE__ */ new Set())).add(o), f.push(o), o = o.next;
      if (o === null)
        continue;
    }
    (b.f & gt) === 0 && c.push(b), u = b, o = b.next;
  }
  if (t.outrogroups !== null) {
    for (const H of t.outrogroups)
      H.pending.size === 0 && (_i(Lr(H.done)), (F = t.outrogroups) == null || F.delete(H));
    t.outrogroups.size === 0 && (t.outrogroups = null);
  }
  if (o !== null || l !== void 0) {
    var x = [];
    if (l !== void 0)
      for (b of l)
        (b.f & de) === 0 && x.push(b);
    for (; o !== null; )
      (o.f & de) === 0 && o !== t.fallback && x.push(o), o = o.next;
    var C = x.length;
    if (C > 0) {
      var k = s === 0 ? n : null;
      Yl(t, x, k);
    }
  }
}
function Ql(t, e, n, i, r, s, a, o) {
  var l = (a & zo) !== 0 ? (a & Vo) === 0 ? /* @__PURE__ */ fa(n, !1, !1) : Wt(n) : null, u = (a & Bo) !== 0 ? Wt(r) : null;
  return {
    v: l,
    i: u,
    e: be(() => (s(e, l ?? n, u ?? r, o), () => {
      t.delete(i);
    }))
  };
}
function Ln(t, e, n) {
  if (t.nodes)
    for (var i = t.nodes.start, r = t.nodes.end, s = e && (e.f & gt) === 0 ? (
      /** @type {EffectNodes} */
      e.nodes.start
    ) : n; i !== null; ) {
      var a = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Me(i)
      );
      if (s.before(i), i === r)
        return;
      i = a;
    }
}
function ot(t, e, n) {
  e === null ? t.effect.first = n : e.next = n, n === null ? t.effect.last = e : n.prev = e;
}
function Xl(t, e, n = !1, i = !1, r = !1) {
  var s = t, a = "";
  We(() => {
    var o = (
      /** @type {Effect} */
      P
    );
    if (a === (a = e() ?? "")) {
      L && yn();
      return;
    }
    if (o.nodes !== null && (Aa(
      o.nodes.start,
      /** @type {TemplateNode} */
      o.nodes.end
    ), o.nodes = null), a !== "") {
      if (L) {
        I.data;
        for (var l = yn(), u = l; l !== null && (l.nodeType !== Qt || /** @type {Comment} */
        l.data !== ""); )
          u = l, l = /* @__PURE__ */ Me(l);
        if (l === null)
          throw Kn(), Bt;
        wt(I, u), s = re(l);
        return;
      }
      var c = a + "";
      n ? c = `<svg>${c}</svg>` : i && (c = `<math>${c}</math>`);
      var f = Ma(c);
      if ((n || i) && (f = /** @type {Element} */
      /* @__PURE__ */ Pe(f)), wt(
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
function qa(t, e) {
  wa(() => {
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
function Zl(t, e, n) {
  var i = t == null ? "" : "" + t;
  return e && (i = i ? i + " " + e : e), i === "" ? null : i;
}
function ec(t, e) {
  return t == null ? null : String(t);
}
function xe(t, e, n, i, r, s) {
  var a = t.__className;
  if (L || a !== n || a === void 0) {
    var o = Zl(n, i);
    (!L || o !== t.getAttribute("class")) && (o == null ? t.removeAttribute("class") : t.className = o), t.__className = n;
  }
  return s;
}
function dt(t, e, n, i) {
  var r = t.__style;
  if (L || r !== e) {
    var s = ec(e);
    (!L || s !== t.getAttribute("style")) && (s == null ? t.removeAttribute("style") : t.style.cssText = s), t.__style = e;
  }
  return i;
}
const tc = Symbol("is custom element"), nc = Symbol("is html");
function Ua(t, e, n, i) {
  var r = rc(t);
  L && (r[e] = t.getAttribute(e), e === "src" || e === "srcset" || e === "href" && t.nodeName === "LINK") || r[e] !== (r[e] = n) && (e === "loading" && (t[rl] = n), n == null ? t.removeAttribute(e) : typeof n != "string" && Ga(t).includes(e) ? t[e] = n : t.setAttribute(e, n));
}
function fs(t, e, n) {
  var i = N, r = P;
  let s = L;
  L && ke(!1), Z(null), $e(null);
  try {
    // `style` should use `set_attribute` rather than the setter
    e !== "style" && // Don't compute setters for custom elements while they aren't registered yet,
    // because during their upgrade/instantiation they might add more setters.
    // Instead, fall back to a simple "an object, then set as property" heuristic.
    (gi.has(t.getAttribute("is") || t.nodeName) || // customElements may not be available in browser extension contexts
    !customElements || customElements.get(t.getAttribute("is") || t.tagName.toLowerCase()) ? Ga(t).includes(e) : n && typeof n == "object") ? t[e] = n : Ua(t, e, n == null ? n : String(n));
  } finally {
    Z(i), $e(r), s && ke(!0);
  }
}
function rc(t) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    t.__attributes ?? (t.__attributes = {
      [tc]: t.nodeName.includes("-"),
      [nc]: t.namespaceURI === Jo
    })
  );
}
var gi = /* @__PURE__ */ new Map();
function Ga(t) {
  var e = t.getAttribute("is") || t.nodeName, n = gi.get(e);
  if (n) return n;
  gi.set(e, n = []);
  for (var i, r = t, s = Element.prototype; s !== r; ) {
    i = Qo(r);
    for (var a in i)
      i[a].set && n.push(a);
    r = zs(r);
  }
  return n;
}
function hs(t, e) {
  return t === e || (t == null ? void 0 : t[cr]) === e;
}
function ft(t = {}, e, n, i) {
  return wa(() => {
    var r, s;
    return Ri(() => {
      r = s, s = [], Re(() => {
        t !== n(...s) && (e(t, ...s), r && hs(n(...r), t) && e(null, ...r));
      });
    }), () => {
      Dr(() => {
        s && hs(n(...s), t) && e(null, ...s);
      });
    };
  }), t;
}
function Ne(t, e, n, i) {
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
  var u = !1, c = /* @__PURE__ */ Hr(() => (u = !1, l())), f = (
    /** @type {Effect} */
    P
  );
  return (
    /** @type {() => V} */
    (function(_, w) {
      if (arguments.length > 0) {
        const b = w ? h(c) : _;
        return O(c, b), u = !0, r !== void 0 && (r = b), _;
      }
      return At && u || (f.f & et) !== 0 ? c.v : h(c);
    })
  );
}
function ic(t) {
  return new sc(t);
}
var Qe, ge;
class sc {
  /**
   * @param {ComponentConstructorOptions & {
   *  component: any;
   * }} options
   */
  constructor(e) {
    /** @type {any} */
    R(this, Qe);
    /** @type {Record<string, any>} */
    R(this, ge);
    var s;
    var n = /* @__PURE__ */ new Map(), i = (a, o) => {
      var l = /* @__PURE__ */ fa(o, !1, !1);
      return n.set(a, l), l;
    };
    const r = new Proxy(
      { ...e.props || {}, $$events: {} },
      {
        get(a, o) {
          return h(n.get(o) ?? i(o, Reflect.get(a, o)));
        },
        has(a, o) {
          return o === nl ? !0 : (h(n.get(o) ?? i(o, Reflect.get(a, o))), Reflect.has(a, o));
        },
        set(a, o, l) {
          return O(n.get(o) ?? i(o, l), l), Reflect.set(a, o, l);
        }
      }
    );
    T(this, ge, (e.hydrate ? Bl : Ha)(e.component, {
      target: e.target,
      anchor: e.anchor,
      props: r,
      context: e.context,
      intro: e.intro ?? !1,
      recover: e.recover
    })), (!((s = e == null ? void 0 : e.props) != null && s.$$host) || e.sync === !1) && me(), T(this, Qe, r.$$events);
    for (const a of Object.keys(p(this, ge)))
      a === "$set" || a === "$destroy" || a === "$on" || mr(this, a, {
        get() {
          return p(this, ge)[a];
        },
        /** @param {any} value */
        set(o) {
          p(this, ge)[a] = o;
        },
        enumerable: !0
      });
    p(this, ge).$set = /** @param {Record<string, any>} next */
    (a) => {
      Object.assign(r, a);
    }, p(this, ge).$destroy = () => {
      Vl(p(this, ge));
    };
  }
  /** @param {Record<string, any>} props */
  $set(e) {
    p(this, ge).$set(e);
  }
  /**
   * @param {string} event
   * @param {(...args: any[]) => any} callback
   * @returns {any}
   */
  $on(e, n) {
    p(this, Qe)[e] = p(this, Qe)[e] || [];
    const i = (...r) => n.call(this, ...r);
    return p(this, Qe)[e].push(i), () => {
      p(this, Qe)[e] = p(this, Qe)[e].filter(
        /** @param {any} fn */
        (r) => r !== i
      );
    };
  }
  $destroy() {
    p(this, ge).$destroy();
  }
}
Qe = new WeakMap(), ge = new WeakMap();
let za;
typeof HTMLElement == "function" && (za = class extends HTMLElement {
  /**
   * @param {*} $$componentCtor
   * @param {*} $$slots
   * @param {*} use_shadow_dom
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
    this.$$ctor = e, this.$$s = n, i && this.attachShadow({ mode: "open" });
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
      const n = {}, i = ac(this);
      for (const r of this.$$s)
        r in i && (r === "default" && !this.$$d.children ? (this.$$d.children = e(r), n.default = !0) : n[r] = e(r));
      for (const r of this.attributes) {
        const s = this.$$g_p(r.name);
        s in this.$$d || (this.$$d[s] = fr(s, r.value, this.$$p_d, "toProp"));
      }
      for (const r in this.$$p_d)
        !(r in this.$$d) && this[r] !== void 0 && (this.$$d[r] = this[r], delete this[r]);
      this.$$c = ic({
        component: this.$$ctor,
        target: this.shadowRoot || this,
        props: {
          ...this.$$d,
          $$slots: n,
          $$host: this
        }
      }), this.$$me = Pl(() => {
        Ri(() => {
          var r;
          this.$$r = !0;
          for (const s of gr(this.$$c)) {
            if (!((r = this.$$p_d[s]) != null && r.reflect)) continue;
            this.$$d[s] = this.$$c[s];
            const a = fr(
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
    this.$$r || (e = this.$$g_p(e), this.$$d[e] = fr(e, i, this.$$p_d, "toProp"), (r = this.$$c) == null || r.$set({ [e]: this.$$d[e] }));
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
    return gr(this.$$p_d).find(
      (n) => this.$$p_d[n].attribute === e || !this.$$p_d[n].attribute && n.toLowerCase() === e
    ) || e;
  }
});
function fr(t, e, n, i) {
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
function ac(t) {
  const e = {};
  return t.childNodes.forEach((n) => {
    e[
      /** @type {Element} node */
      n.slot || "default"
    ] = !0;
  }), e;
}
function Ba(t, e, n, i, r, s) {
  let a = class extends za {
    constructor() {
      super(t, n, r), this.$$p_d = e;
    }
    static get observedAttributes() {
      return gr(e).map(
        (o) => (e[o].attribute || o).toLowerCase()
      );
    }
  };
  return gr(e).forEach((o) => {
    mr(a.prototype, o, {
      get() {
        return this.$$c && o in this.$$c ? this.$$c[o] : this.$$d[o];
      },
      set(l) {
        var f;
        l = fr(o, l, e), this.$$d[o] = l;
        var u = this.$$c;
        if (u) {
          var c = (f = un(u, o)) == null ? void 0 : f.get;
          c ? u[o] = l : u.$set({ [o]: l });
        }
      }
    });
  }), i.forEach((o) => {
    mr(a.prototype, o, {
      get() {
        var l;
        return (l = this.$$c) == null ? void 0 : l[o];
      }
    });
  }), s && (a = s(a)), t.element = /** @type {any} */
  a, a;
}
class ki extends Error {
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  constructor(e, ...n) {
    super(...n), Error.captureStackTrace && Error.captureStackTrace(this, ki), this.name = "TimeoutError", this.timeout = e, this.message = `Timed out in ${e} ms.`;
  }
}
const oc = (t, e) => {
  const n = new Promise((i, r) => {
    setTimeout(() => {
      r(new ki(t));
    }, t);
  });
  return Promise.race([e, n]);
}, Va = (t) => {
  if (typeof t.getCardSize == "function")
    try {
      return oc(500, t.getCardSize()).catch(
        () => 1
      );
    } catch {
      return 1;
    }
  return customElements.get(t.localName) ? 1 : customElements.whenDefined(t.localName).then(() => Va(t));
};
var lc = /* @__PURE__ */ st('<span class="loading svelte-lv9s7p">Loading...</span>'), cc = /* @__PURE__ */ st("<div><!></div>");
const uc = {
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
function mi(t, e) {
  Si(e, !0), qa(t, uc);
  const n = Ne(e, "config"), i = Ne(e, "hass"), r = Ne(e, "preview"), s = Ne(e, "marginTop", 7, "0px"), a = Ne(e, "open"), o = Ne(e, "animation", 7, !0), l = Ne(e, "animationState"), u = Ne(e, "clearCardCss", 7, !1);
  let c = null, f = /* @__PURE__ */ M(null), _ = /* @__PURE__ */ M(!0), w = /* @__PURE__ */ M(0);
  const b = Re(() => JSON.parse(JSON.stringify(n())));
  dn(() => {
    h(f) && (h(f).hass = i());
  }), dn(() => {
    h(f) && r() !== void 0 && (h(f).preview = r());
  }), dn(() => {
    var y;
    h(f) && (b.disabled = !a(), (y = h(f)._element) == null || y.dispatchEvent(new CustomEvent("card-visibility-changed", { detail: { value: a() }, bubbles: !0, composed: !1 })));
  }), Fa(async () => {
    const y = document.createElement("hui-card");
    y.hass = i(), y.preview = r(), b.disabled = !a(), y.config = b, y.load(), c == null || c.appendChild(y), O(f, y, !0), O(_, !1), h(f).addEventListener(
      "ll-upgrade",
      (S) => {
        var x;
        S.stopPropagation(), (x = h(f)) != null && x._element && i() && (h(f)._element.hass = i());
      },
      { capture: !0 }
    ), u() && (y.style.setProperty("--ha-card-background", "transparent"), y.style.setProperty("--ha-card-box-shadow", "none"), y.style.setProperty("--ha-card-border-color", "transparent"), y.style.setProperty("--ha-card-border-width", "0px"), y.style.setProperty("--ha-card-border-radius", "0px"), y.style.setProperty("--ha-card-backdrop-filter", "none")), o() && (O(w, await Va(y) * 56), c && O(w, h(w) + (window.getComputedStyle(c).marginTop ? parseFloat(window.getComputedStyle(c).marginTop) : 0)), new ResizeObserver((x) => {
      for (const C of x)
        if (C.contentBoxSize) {
          const k = Array.isArray(C.contentBoxSize) ? C.contentBoxSize[0] : C.contentBoxSize;
          k.blockSize && (O(w, k.blockSize, !0), h(f) && O(w, h(w) + (window.getComputedStyle(h(f)).marginTop ? parseFloat(window.getComputedStyle(h(f)).marginTop) : 0)));
        } else C.contentRect && (O(w, C.contentRect.height, !0), h(f) && O(w, h(w) + (window.getComputedStyle(h(f)).marginTop ? parseFloat(window.getComputedStyle(h(f)).marginTop) : 0)));
    }).observe(y));
  });
  var A = {
    get config() {
      return n();
    },
    set config(y) {
      n(y), me();
    },
    get hass() {
      return i();
    },
    set hass(y) {
      i(y), me();
    },
    get preview() {
      return r();
    },
    set preview(y) {
      r(y), me();
    },
    get marginTop() {
      return s();
    },
    set marginTop(y = "0px") {
      s(y), me();
    },
    get open() {
      return a();
    },
    set open(y) {
      a(y), me();
    },
    get animation() {
      return o();
    },
    set animation(y = !0) {
      o(y), me();
    },
    get animationState() {
      return l();
    },
    set animationState(y) {
      l(y), me();
    },
    get clearCardCss() {
      return u();
    },
    set clearCardCss(y = !1) {
      u(y), me();
    }
  }, d = cc(), v = ct(d);
  {
    var m = (y) => {
      var S = lc();
      ve(y, S);
    };
    ut(v, (y) => {
      h(_) && y(m);
    });
  }
  return Ve(d), ft(d, (y) => c = y, () => c), We(() => {
    xe(d, 1, `outer-container${a() ? " open" : " close"}${o() ? " animation " + l() : ""}`, "svelte-lv9s7p"), dt(d, `--child-card-margin-top: ${(a() ? s() : "0px") ?? ""};${h(w) ? ` --expander-animation-height: -${h(w)}px;` : ""}`);
  }), ve(t, d), xi(A);
}
customElements.define("expander-sub-card", Ba(
  mi,
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
  !0
));
const dc = (t, e) => {
  var n;
  (n = t.dispatchEvent) == null || n.call(
    t,
    new CustomEvent(
      "haptic",
      { detail: e, bubbles: !0, composed: !0 }
    )
  );
};
var Xn = function(t, e, n) {
  var i;
  n === void 0 && (n = {});
  var r = n.retries, s = r === void 0 ? 10 : r, a = n.delay, o = a === void 0 ? 10 : a, l = n.shouldReject, u = l === void 0 || l, c = (i = n.rejectMessage) !== null && i !== void 0 ? i : "Could not get the result after {{ retries }} retries";
  return new Promise((function(f, _) {
    var w = 0, b = function() {
      var A = t();
      e(A) ? f(A) : ++w < s ? setTimeout(b, o) : u ? _(new Error(c.replace(/\{\{\s*retries\s*\}\}/g, "".concat(s)))) : f(A);
    };
    b();
  }));
}, Ar = function() {
  return Ar = Object.assign || function(t) {
    for (var e, n = 1, i = arguments.length; n < i; n++) for (var r in e = arguments[n]) Object.prototype.hasOwnProperty.call(e, r) && (t[r] = e[r]);
    return t;
  }, Ar.apply(this, arguments);
};
function Vr(t, e, n) {
  if (arguments.length === 2) for (var i, r = 0, s = e.length; r < s; r++) !i && r in e || (i || (i = Array.prototype.slice.call(e, 0, r)), i[r] = e[r]);
  return t.concat(i || Array.prototype.slice.call(e));
}
var Or, cn, Ie, ht, Wr = "[home-assistant-javascript-templates]", fc = /^([a-z_]+)\.(\w+)$/;
(function(t) {
  t.UNKNOWN = "unknown", t.UNAVAILABLE = "unavailable";
})(Or || (Or = {})), (function(t) {
  t.AREA_ID = "area_id", t.NAME = "name";
})(cn || (cn = {})), (function(t) {
  t.PANEL_URL = "panel_url", t.LANG = "lang";
})(Ie || (Ie = {})), (function(t) {
  t.LOCATION_CHANGED = "location-changed", t.TRANSLATIONS_UPDATED = "translations-updated", t.POPSTATE = "popstate", t.SUBSCRIBE_EVENTS = "subscribe_events", t.STATE_CHANGE_EVENT = "state_changed";
})(ht || (ht = {}));
var ps = function(t) {
  return t.reduce((function(e, n) {
    var i = n[0], r = n[1];
    return e[i.replace(fc, "$2")] = r, e;
  }), {});
}, lt = function(t) {
  return t.includes(".");
}, hr = "ref", Rt = "value", vs = "toJSON", _s = function(t) {
  return "".concat(hr, ".").concat(t);
};
function hc(t, e, n) {
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
  }, b = function(d, v) {
    var m = v.with_unit, y = m !== void 0 && m, S = v.rounded, x = S !== void 0 && S;
    if (d) {
      var C = d.state, k = d.attributes.unit_of_measurement, F = Number(x), H = x === !1 || isNaN(Number(C)) ? C : new Intl.NumberFormat(t.hass.language, { minimumFractionDigits: F, maximumFractionDigits: F }).format(Number(C));
      return y && k ? "".concat(H, " ").concat(k) : H;
    }
  }, A = function(d) {
    return new Proxy(d, { get: function(v, m) {
      return m === "state_with_unit" ? b(v, { rounded: !0, with_unit: !0 }) : v[m];
    } });
  };
  return { get hass() {
    return t.hass;
  }, states: new Proxy((function(d, v) {
    if (v === void 0 && (v = {}), lt(d)) return _(d), b(t.hass.states[d], v);
    throw SyntaxError("".concat(Wr, ": states method cannot be used with a domain, use it as an object instead."));
  }), { get: function(d, v) {
    if (lt(v)) return _(v), A(t.hass.states[v]);
    var m = Object.entries(t.hass.states).filter((function(y) {
      return y[0].startsWith(v);
    }));
    return m.length || c(v), new Proxy(ps(m), { get: function(y, S) {
      return _("".concat(v, ".").concat(S)), A(y[S]);
    } });
  } }), state_translated: function(d) {
    if (_(d), t.hass.states[d]) return t.hass.formatEntityState(t.hass.states[d]);
  }, is_state: function(d, v) {
    var m;
    return _(d), Array.isArray(v) ? v.some((function(y) {
      var S;
      return ((S = t.hass.states[d]) === null || S === void 0 ? void 0 : S.state) === y;
    })) : ((m = t.hass.states[d]) === null || m === void 0 ? void 0 : m.state) === v;
  }, state_attr: function(d, v) {
    var m, y;
    return _(d), (y = (m = t.hass.states[d]) === null || m === void 0 ? void 0 : m.attributes) === null || y === void 0 ? void 0 : y[v];
  }, is_state_attr: function(d, v, m) {
    return this.state_attr(d, v) === m;
  }, has_value: function(d) {
    return this.states(d) ? !(this.is_state(d, Or.UNKNOWN) || this.is_state(d, Or.UNAVAILABLE)) : (u(d), !1);
  }, entities: new Proxy((function(d) {
    if (d === void 0) return t.hass.entities;
    if (lt(d)) return _(d), t.hass.entities[d];
    var v = s().filter((function(m) {
      return m[0].startsWith(d);
    }));
    return v.length || c(d), new Proxy(ps(v), { get: function(m, y) {
      return _("".concat(d, ".").concat(y)), m[y];
    } });
  }), { get: function(d, v) {
    return d(v);
  } }), entity_prop: function(d, v) {
    var m;
    return _(d), (m = t.hass.entities[d]) === null || m === void 0 ? void 0 : m[v];
  }, is_entity_prop: function(d, v, m) {
    return this.entity_prop(d, v) === m;
  }, devices: new Proxy((function(d) {
    if (d === void 0) return t.hass.devices;
    if (lt(d)) throw SyntaxError("".concat(Wr, ": devices method cannot be used with an entity id, you should use a device id instead."));
    return t.hass.devices[d];
  }), { get: function(d, v) {
    if (lt(v)) throw SyntaxError("".concat(Wr, ": devices cannot be accesed using an entity id, you should use a device id instead."));
    return t.hass.devices[v];
  } }), device_attr: function(d, v) {
    var m, y, S;
    if (lt(d)) {
      _(d);
      var x = (m = t.hass.entities[d]) === null || m === void 0 ? void 0 : m.device_id;
      return (y = t.hass.devices[x]) === null || y === void 0 ? void 0 : y[v];
    }
    return (S = t.hass.devices[d]) === null || S === void 0 ? void 0 : S[v];
  }, is_device_attr: function(d, v, m) {
    return this.device_attr(d, v) === m;
  }, device_id: function(d) {
    var v;
    if (lt(d)) return _(d), (v = t.hass.entities[d]) === null || v === void 0 ? void 0 : v.device_id;
    var m = r().find((function(y) {
      return y[1].name === d;
    }));
    return m == null ? void 0 : m[0];
  }, device_name: function(d) {
    var v, m, y;
    if (lt(d)) {
      _(d);
      var S = (v = t.hass.entities[d]) === null || v === void 0 ? void 0 : v.device_id;
      return (m = t.hass.devices[S]) === null || m === void 0 ? void 0 : m.name;
    }
    return (y = t.hass.devices[d]) === null || y === void 0 ? void 0 : y.name;
  }, areas: function() {
    return i().map((function(d) {
      return d[1].area_id;
    }));
  }, area_id: function(d) {
    var v, m;
    if (d in t.hass.devices) return this.device_attr(d, cn.AREA_ID);
    var y = (v = t.hass.entities[d]) === null || v === void 0 ? void 0 : v.device_id;
    if (y) return this.device_attr(y, cn.AREA_ID);
    var S = i().find((function(x) {
      return x[1].name === d;
    }));
    return (m = S == null ? void 0 : S[1]) === null || m === void 0 ? void 0 : m.area_id;
  }, area_name: function(d) {
    var v, m, y;
    d in t.hass.devices && (y = this.device_attr(d, cn.AREA_ID));
    var S = (v = t.hass.entities[d]) === null || v === void 0 ? void 0 : v.device_id;
    S && (y = this.device_attr(S, cn.AREA_ID));
    var x = i().find((function(C) {
      var k = C[1];
      return k.area_id === d || k.area_id === y;
    }));
    return (m = x == null ? void 0 : x[1]) === null || m === void 0 ? void 0 : m.name;
  }, area_entities: function(d) {
    var v = i().find((function(m) {
      var y = m[1];
      return y.area_id === d || y.name === d;
    }));
    return v ? s().filter((function(m) {
      return m[1].area_id === v[1].area_id;
    })).map((function(m) {
      return m[0];
    })) : [];
  }, area_devices: function(d) {
    var v = i().find((function(m) {
      var y = m[1];
      return y.area_id === d || y.name === d;
    }));
    return v ? r().filter((function(m) {
      return m[1].area_id === v[1].area_id;
    })).map((function(m) {
      return m[1].id;
    })) : [];
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
  }, ref: function(d, v, m) {
    var y;
    m === void 0 && (m = void 0);
    var S = _s(v);
    if (o.has(v)) return o.get(v);
    var x = new Proxy(((y = {})[Rt] = m, y[vs] = function() {
      return this[Rt];
    }, y), { get: function(C, k, F) {
      if (k === Rt || k === vs) return w(S), Reflect.get(C, k, F);
      f("".concat(k, " is not a valid ").concat(hr, " property. A ").concat(hr, ' only exposes a "').concat(Rt, '" property'));
    }, set: function(C, k, F) {
      if (k === Rt) {
        var H = C[Rt];
        return C[Rt] = F, d({ event_type: ht.STATE_CHANGE_EVENT, data: { entity_id: S, old_state: { state: JSON.stringify(H) }, new_state: { state: JSON.stringify(F) } } }), !0;
      }
      return f('property "'.concat(k, '" cannot be set in a ').concat(hr)), !1;
    } });
    return o.set(v, x), x;
  }, unref: function(d, v) {
    var m = _s(v);
    o.has(v) ? (o.delete(v), d(m)) : f("".concat(v, " is not a ref or it has been unrefed already"));
  }, refs: function(d, v, m) {
    m === void 0 && (m = {});
    var y = this.ref, S = this.unref, x = new Proxy(m, { get: function(C, k) {
      return y(d, k).value;
    }, set: function(C, k, F) {
      return y(d, k).value = F, !0;
    } });
    return Object.entries(m).forEach((function(C) {
      var k = C[0], F = C[1];
      o.has(k) && S(v, k), y(d, k, F);
    })), x;
  }, cleanRefs: function(d) {
    var v = this;
    Array.from(o.keys()).forEach((function(m) {
      v.unref(d, m);
    }));
  }, clientSideProxy: new Proxy({}, { get: function(d, v) {
    switch (Object.values(Ie).includes(v) && w(v), v) {
      case Ie.PANEL_URL:
        return location.pathname;
      case Ie.LANG:
        return t.hass.language;
    }
    n && console.warn("clientSideProxy should only be used to access these variables: ".concat(Object.values(Ie).join(", ")));
  } }) };
}
var pc = (function() {
  function t(e, n) {
    var i = n.throwErrors, r = i !== void 0 && i, s = n.throwWarnings, a = s === void 0 || s, o = n.variables, l = o === void 0 ? {} : o, u = n.refs, c = u === void 0 ? {} : u, f = n.refsVariableName, _ = f === void 0 ? "refs" : f, w = n.autoReturn, b = w === void 0 || w;
    this._throwErrors = r, this._throwWarnings = a, this._variables = l, this._refsVariableName = _, this._autoReturn = b, this._subscriptions = /* @__PURE__ */ new Map(), this._clientSideEntitiesRegExp = new RegExp("(^|[ \\?(+:\\{\\[><,])(".concat(Object.values(Ie).join("|"), ")($|[ \\?)+:\\}\\]><.,])"), "gm"), this._scopped = hc(e, r, a), this.refs = c, this._watchForPanelUrlChange(), this._watchForEntitiesChange(), this._watchForLanguageChange();
  }
  return t.prototype._executeRenderingFunctions = function(e) {
    var n = this;
    this._subscriptions.get(e).forEach((function(i, r) {
      i.forEach((function(s, a) {
        n.trackTemplate(r, a, s);
      }));
    }));
  }, t.prototype._watchForPanelUrlChange = function() {
    var e = this;
    window.addEventListener(ht.LOCATION_CHANGED, (function() {
      e._panelUrlWatchCallback();
    })), window.addEventListener(ht.POPSTATE, (function() {
      e._panelUrlWatchCallback();
    }));
  }, t.prototype._panelUrlWatchCallback = function() {
    this._subscriptions.has(Ie.PANEL_URL) && this._executeRenderingFunctions(Ie.PANEL_URL);
  }, t.prototype._watchForEntitiesChange = function() {
    var e = this;
    window.hassConnection.then((function(n) {
      n.conn.subscribeMessage((function(i) {
        return e._entityWatchCallback(i);
      }), { type: ht.SUBSCRIBE_EVENTS, event_type: ht.STATE_CHANGE_EVENT });
    }));
  }, t.prototype._watchForLanguageChange = function() {
    var e = this;
    window.addEventListener(ht.TRANSLATIONS_UPDATED, (function() {
      e._subscriptions.has(Ie.LANG) && e._executeRenderingFunctions(Ie.LANG);
    }));
  }, t.prototype._entityWatchCallback = function(e) {
    if (this._subscriptions.size) {
      var n = e.data.entity_id;
      this._subscriptions.has(n) && this._executeRenderingFunctions(n);
    }
  }, t.prototype._storeTracked = function(e, n, i) {
    var r = this;
    this._scopped.tracked.forEach((function(s) {
      var a = [n, i];
      if (r._subscriptions.has(s)) {
        var o = r._subscriptions.get(s);
        if (o.has(e)) {
          var l = o.get(e);
          l.has(n) || l.set.apply(l, a);
        } else o.set(e, new Map([a]));
      } else r._subscriptions.set(s, /* @__PURE__ */ new Map([[e, new Map([a])]]));
    }));
  }, t.prototype._untrackTemplate = function(e, n) {
    var i = this;
    this._subscriptions.forEach((function(r, s) {
      if (r.has(e)) {
        var a = r.get(e);
        a.delete(n), a.size === 0 && (r.delete(e), r.size === 0 && i._subscriptions.delete(s));
      }
    }));
  }, t.prototype.renderTemplate = function(e, n) {
    n === void 0 && (n = {});
    try {
      var i = n.variables, r = i === void 0 ? {} : i, s = n.refs, a = s === void 0 ? {} : s, o = new Map(Object.entries(Ar(Ar({}, this._variables), r))), l = e.trim().replace(this._clientSideEntitiesRegExp, "$1clientSide.$2$3"), u = l.includes("return") || !this._autoReturn ? l : "return ".concat(l);
      return new (Function.bind.apply(Function, Vr(Vr([void 0, "hass", "states", "state_translated", "is_state", "state_attr", "is_state_attr", "has_value", "entities", "entity_prop", "is_entity_prop", "devices", "device_attr", "is_device_attr", "device_id", "device_name", "areas", "area_id", "area_name", "area_entities", "area_devices", "user_name", "user_is_admin", "user_is_owner", "user_agent", "clientSide", "ref", "unref", this._refsVariableName], Array.from(o.keys()), !1), ["".concat('"use strict";', " ").concat(u)], !1)))().apply(void 0, Vr([this._scopped.hass, this._scopped.states, this._scopped.state_translated.bind(this._scopped), this._scopped.is_state.bind(this._scopped), this._scopped.state_attr.bind(this._scopped), this._scopped.is_state_attr.bind(this._scopped), this._scopped.has_value.bind(this._scopped), this._scopped.entities, this._scopped.entity_prop, this._scopped.is_entity_prop.bind(this._scopped), this._scopped.devices, this._scopped.device_attr.bind(this._scopped), this._scopped.is_device_attr.bind(this._scopped), this._scopped.device_id.bind(this._scopped), this._scopped.device_name.bind(this._scopped), this._scopped.areas.bind(this._scopped), this._scopped.area_id.bind(this._scopped), this._scopped.area_name.bind(this._scopped), this._scopped.area_entities.bind(this._scopped), this._scopped.area_devices.bind(this._scopped), this._scopped.user_name, this._scopped.user_is_admin, this._scopped.user_is_owner, this._scopped.user_agent, this._scopped.clientSideProxy, this._scopped.ref.bind(this._scopped, this._entityWatchCallback.bind(this)), this._scopped.unref.bind(this._scopped, this.cleanTracked.bind(this)), this._scopped.refs(this._entityWatchCallback.bind(this), this.cleanTracked.bind(this), a)], Array.from(o.values()), !1));
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
})(), vc = (function() {
  function t(e, n) {
    n === void 0 && (n = {}), this._renderer = Xn((function() {
      return e.hass;
    }), (function(i) {
      return !!(i && i.areas && i.devices && i.entities && i.states && i.user);
    }), { retries: 100, delay: 50, rejectMessage: "The provided element doesn't contain a proper or initialised hass object" }).then((function() {
      return new pc(e, n);
    }));
  }
  return t.prototype.getRenderer = function() {
    return this._renderer;
  }, t;
})();
function _c(t = {}, e = {}) {
  return new vc(
    document.querySelector("home-assistant"),
    {
      autoReturn: !1,
      variables: t,
      refs: e,
      refsVariableName: "variables"
    }
  ).getRenderer();
}
function pr(t) {
  return !t || typeof t != "string" ? !1 : String(t).trim().startsWith("[[[") && String(t).trim().endsWith("]]]");
}
function gs(t, e, n, i = {}) {
  if (!pr(n))
    throw new Error("Not a valid JS template");
  return n = String(n).trim().slice(3, -3), t.then((r) => r.trackTemplate(n, e, { variables: i }));
}
function ms(t, e, n) {
  t.then((i) => {
    i.refs[e] = n;
  });
}
function gc(t, e) {
  t.then((n) => {
    const i = e.detail;
    Object.keys(i).forEach((r) => {
      const s = i[r].property, a = i[r].value, o = `${r}_${s}`;
      n.refs[o] = a;
    });
  });
}
function mc(t, e) {
  const n = gc.bind(null, t);
  return document.addEventListener(e, n), () => {
    document.removeEventListener(e, n);
  };
}
var Sr = function() {
  return Sr = Object.assign || function(t) {
    for (var e, n = 1, i = arguments.length; n < i; n++) for (var r in e = arguments[n]) Object.prototype.hasOwnProperty.call(e, r) && (t[r] = e[r]);
    return t;
  }, Sr.apply(this, arguments);
};
function Xt(t, e, n, i) {
  return new (n || (n = Promise))((function(r, s) {
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
      u.done ? r(u.value) : (c = u.value, c instanceof n ? c : new n((function(f) {
        f(c);
      }))).then(a, o);
    }
    l((i = i.apply(t, [])).next());
  }));
}
function Zt(t, e) {
  var n, i, r, s = { label: 0, sent: function() {
    if (1 & r[0]) throw r[1];
    return r[1];
  }, trys: [], ops: [] }, a = Object.create((typeof Iterator == "function" ? Iterator : Object).prototype);
  return a.next = o(0), a.throw = o(1), a.return = o(2), typeof Symbol == "function" && (a[Symbol.iterator] = function() {
    return this;
  }), a;
  function o(l) {
    return function(u) {
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
        } catch (f) {
          c = [6, f], i = 0;
        } finally {
          n = r = 0;
        }
        if (5 & c[0]) throw c[1];
        return { value: c[0] ? c[1] : void 0, done: !0 };
      })([l, u]);
    };
  }
}
var Yt = "$", Wa = ":host", Pi = "invalid selector", Ot = 10, St = 10, Di = function(t) {
  var e, n = t[0], i = t[1];
  return (e = n) && (e instanceof Document || e instanceof Element || e instanceof ShadowRoot) && typeof i == "string";
};
function Mi(t, e) {
  return (function(n) {
    return n.split(",").map((function(i) {
      return i.trim();
    }));
  })(t).map((function(n) {
    var i = (function(r) {
      return r.split(Yt).map((function(s) {
        return s.trim();
      }));
    })(n);
    return e(i);
  }));
}
function Ya(t, e) {
  var n = e ? " If you want to select a shadowRoot, use ".concat(e, " instead.") : "";
  return "".concat(t, " cannot be used with a selector ending in a shadowRoot (").concat(Yt, ").").concat(n);
}
function sn(t) {
  return t instanceof Promise ? t : Promise.resolve(t);
}
function Ja() {
  return "You can not select a shadowRoot (".concat(Yt, ") of the document.");
}
function Ka() {
  return "You can not select a shadowRoot (".concat(Yt, ") of a shadowRoot.");
}
function Hi(t, e) {
  for (var n, i, r = null, s = t.length, a = 0; a < s; a++) {
    if (a === 0) if (t[a].length) r = e.querySelector(t[a]);
    else {
      if (e instanceof Document) throw new SyntaxError(Ja());
      if (e instanceof ShadowRoot) throw new SyntaxError(Ka());
      r = ((n = e.shadowRoot) === null || n === void 0 ? void 0 : n.querySelector(t[++a])) || null;
    }
    else r = ((i = r.shadowRoot) === null || i === void 0 ? void 0 : i.querySelector("".concat(Wa, " ").concat(t[a]))) || null;
    if (r === null) return null;
  }
  return r;
}
function yc(t, e) {
  var n, i = (function(a, o, l) {
    for (var u, c = 0, f = o.length; c < f; c++) !u && c in o || (u || (u = Array.prototype.slice.call(o, 0, c)), u[c] = o[c]);
    return a.concat(u || Array.prototype.slice.call(o));
  })([], t), r = i.pop();
  if (!i.length) return e.querySelectorAll(r);
  var s = Hi(i, e);
  return ((n = s == null ? void 0 : s.shadowRoot) === null || n === void 0 ? void 0 : n.querySelectorAll("".concat(Wa, " ").concat(r))) || null;
}
function bc(t, e) {
  if (t.length === 1 && !t[0].length) {
    if (e instanceof Document) throw new SyntaxError(Ja());
    if (e instanceof ShadowRoot) throw new SyntaxError(Ka());
    return e.shadowRoot;
  }
  var n = Hi(t, e);
  return (n == null ? void 0 : n.shadowRoot) || null;
}
function wc(t, e, n, i) {
  for (var r = Mi(t, (function(l) {
    if (!l[l.length - 1].length) throw new SyntaxError(Ya(n, i));
    return l;
  })), s = r.length, a = 0; a < s; a++) {
    var o = Hi(r[a], e);
    if (o) return o;
  }
  return null;
}
function Ec(t, e, n) {
  for (var i = Mi(t, (function(o) {
    if (!o[o.length - 1].length) throw new SyntaxError(Ya(n));
    return o;
  })), r = i.length, s = 0; s < r; s++) {
    var a = yc(i[s], e);
    if (a != null && a.length) return a;
  }
  return document.querySelectorAll(Pi);
}
function $c(t, e, n, i) {
  for (var r = Mi(t, (function(l) {
    if (l.pop().length) throw new SyntaxError((function(u, c) {
      return "".concat(u, " must be used with a selector ending in a shadowRoot (").concat(Yt, "). If you don't want to select a shadowRoot, use ").concat(c, " instead.");
    })(n, i));
    return l;
  })), s = r.length, a = 0; a < s; a++) {
    var o = bc(r[a], e);
    if (o) return o;
  }
  return null;
}
function ys(t, e, n, i) {
  return Xt(this, void 0, void 0, (function() {
    return Zt(this, (function(r) {
      return [2, Xn((function() {
        return wc(t, e, "asyncQuerySelector", "asyncShadowRootQuerySelector");
      }), (function(s) {
        return !!s;
      }), { retries: n, delay: i, shouldReject: !1 })];
    }));
  }));
}
function bs(t, e, n, i) {
  return Xt(this, void 0, void 0, (function() {
    return Zt(this, (function(r) {
      return [2, Xn((function() {
        return Ec(t, e, "asyncQuerySelectorAll");
      }), (function(s) {
        return !!s.length;
      }), { retries: n, delay: i, shouldReject: !1 })];
    }));
  }));
}
function ws(t, e, n, i) {
  return Xt(this, void 0, void 0, (function() {
    return Zt(this, (function(r) {
      return [2, Xn((function() {
        return $c(t, e, "asyncShadowRootQuerySelector", "asyncQuerySelector");
      }), (function(s) {
        return !!s;
      }), { retries: n, delay: i, shouldReject: !1 })];
    }));
  }));
}
var yi = function(t, e) {
  var n = t.querySelectorAll(e);
  if (n.length) return n;
  if (t instanceof Element && t.shadowRoot) {
    var i = yi(t.shadowRoot, e);
    if (i.length) return i;
  }
  for (var r = 0, s = Array.from(t.querySelectorAll("*")); r < s.length; r++) {
    var a = s[r], o = yi(a, e);
    if (o.length) return o;
  }
  return document.querySelectorAll(Pi);
}, Es = function(t, e, n, i) {
  return Xn((function() {
    return yi(t, e);
  }), (function(r) {
    return !!r.length;
  }), { retries: n, delay: i, shouldReject: !1 });
};
function $s() {
  for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
  return Xt(this, void 0, void 0, (function() {
    var n, i, r, s, a;
    return Zt(this, (function(o) {
      switch (o.label) {
        case 0:
          return Di(t) ? (n = t[0], i = t[1], r = t[2], [4, ys(i, n, (r == null ? void 0 : r.retries) || Ot, (r == null ? void 0 : r.delay) || St)]) : [3, 2];
        case 1:
        case 3:
          return [2, o.sent()];
        case 2:
          return s = t[0], a = t[1], [4, ys(s, document, (a == null ? void 0 : a.retries) || Ot, (a == null ? void 0 : a.delay) || St)];
      }
    }));
  }));
}
function As() {
  for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
  return Xt(this, void 0, void 0, (function() {
    var n, i, r, s, a;
    return Zt(this, (function(o) {
      switch (o.label) {
        case 0:
          return Di(t) ? (n = t[0], i = t[1], r = t[2], [4, bs(i, n, (r == null ? void 0 : r.retries) || Ot, (r == null ? void 0 : r.delay) || St)]) : [3, 2];
        case 1:
          return [2, o.sent()];
        case 2:
          return s = t[0], a = t[1], [2, bs(s, document, (a == null ? void 0 : a.retries) || Ot, (a == null ? void 0 : a.delay) || St)];
      }
    }));
  }));
}
function Os() {
  for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
  return Xt(this, void 0, void 0, (function() {
    var n, i, r, s, a;
    return Zt(this, (function(o) {
      switch (o.label) {
        case 0:
          return Di(t) ? (n = t[0], i = t[1], r = t[2], [4, ws(i, n, (r == null ? void 0 : r.retries) || Ot, (r == null ? void 0 : r.delay) || St)]) : [3, 2];
        case 1:
          return [2, o.sent()];
        case 2:
          return s = t[0], a = t[1], [2, ws(s, document, (a == null ? void 0 : a.retries) || Ot, (a == null ? void 0 : a.delay) || St)];
      }
    }));
  }));
}
var Ac = (function() {
  function t(e, n) {
    e instanceof Node || e instanceof Promise ? (this._element = e, this._asyncParams = Sr({ retries: Ot, delay: St }, n || {})) : (this._element = document, this._asyncParams = Sr({ retries: Ot, delay: St }, e || {}));
  }
  return Object.defineProperty(t.prototype, "element", { get: function() {
    return sn(this._element).then((function(e) {
      return e instanceof NodeList ? e[0] || null : e;
    }));
  }, enumerable: !1, configurable: !0 }), Object.defineProperty(t.prototype, "$", { get: function() {
    var e = this;
    return new t(sn(this._element).then((function(n) {
      return n instanceof Document || n instanceof ShadowRoot || n === null || n instanceof NodeList && n.length === 0 ? null : n instanceof NodeList ? Os(n[0], Yt, e._asyncParams) : Os(n, Yt, e._asyncParams);
    })), this._asyncParams);
  }, enumerable: !1, configurable: !0 }), Object.defineProperty(t.prototype, "all", { get: function() {
    return sn(this._element).then((function(e) {
      return e instanceof NodeList ? e : document.querySelectorAll(Pi);
    }));
  }, enumerable: !1, configurable: !0 }), Object.defineProperty(t.prototype, "asyncParams", { get: function() {
    return this._asyncParams;
  }, enumerable: !1, configurable: !0 }), t.prototype.eq = function(e) {
    return Xt(this, void 0, void 0, (function() {
      return Zt(this, (function(n) {
        return [2, sn(this._element).then((function(i) {
          return i instanceof NodeList && i[e] || null;
        }))];
      }));
    }));
  }, t.prototype.query = function(e) {
    var n = this;
    return new t(sn(this._element).then((function(i) {
      return i === null || i instanceof NodeList && i.length === 0 ? null : i instanceof NodeList ? As(i[0], e, n._asyncParams) : As(i, e, n._asyncParams);
    })), this._asyncParams);
  }, t.prototype.deepQuery = function(e) {
    var n = this;
    return new t(sn(this._element).then((function(i) {
      return i === null || i instanceof NodeList && i.length === 0 ? null : i instanceof NodeList ? Promise.race(Array.from(i).map((function(r) {
        return Es(r, e, n._asyncParams.retries, n._asyncParams.delay);
      }))) : Es(i, e, n._asyncParams.retries, n._asyncParams.delay);
    })), this._asyncParams);
  }, t;
})(), bi = function(t, e) {
  return bi = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(n, i) {
    n.__proto__ = i;
  } || function(n, i) {
    for (var r in i) Object.prototype.hasOwnProperty.call(i, r) && (n[r] = i[r]);
  }, bi(t, e);
}, Ze = function() {
  return Ze = Object.assign || function(t) {
    for (var e, n = 1, i = arguments.length; n < i; n++) for (var r in e = arguments[n]) Object.prototype.hasOwnProperty.call(e, r) && (t[r] = e[r]);
    return t;
  }, Ze.apply(this, arguments);
};
var Le, mt, B, Ye, Ss, Yr, Jr, sr, xs, Kr, ar, Qr, Xr, Zr, Rn, j, Et = "$", Oc = { retries: 100, delay: 50, eventThreshold: 450 };
(function(t) {
  t.HOME_ASSISTANT = "HOME_ASSISTANT", t.HOME_ASSISTANT_MAIN = "HOME_ASSISTANT_MAIN", t.HA_DRAWER = "HA_DRAWER", t.HA_SIDEBAR = "HA_SIDEBAR", t.PARTIAL_PANEL_RESOLVER = "PARTIAL_PANEL_RESOLVER";
})(Le || (Le = {})), (function(t) {
  t.HA_PANEL_LOVELACE = "HA_PANEL_LOVELACE", t.HUI_ROOT = "HUI_ROOT", t.HEADER = "HEADER", t.HUI_VIEW = "HUI_VIEW";
})(mt || (mt = {})), (function(t) {
  t.HA_MORE_INFO_DIALOG = "HA_MORE_INFO_DIALOG", t.HA_DIALOG = "HA_DIALOG", t.HA_DIALOG_CONTENT = "HA_DIALOG_CONTENT", t.HA_MORE_INFO_DIALOG_INFO = "HA_MORE_INFO_DIALOG_INFO", t.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK = "HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK", t.HA_DIALOG_MORE_INFO_SETTINGS = "HA_DIALOG_MORE_INFO_SETTINGS";
})(B || (B = {})), (function(t) {
  t.ON_LISTEN = "onListen", t.ON_PANEL_LOAD = "onPanelLoad", t.ON_LOVELACE_PANEL_LOAD = "onLovelacePanelLoad", t.ON_MORE_INFO_DIALOG_OPEN = "onMoreInfoDialogOpen", t.ON_HISTORY_AND_LOGBOOK_DIALOG_OPEN = "onHistoryAndLogBookDialogOpen", t.ON_SETTINGS_DIALOG_OPEN = "onSettingsDialogOpen";
})(Ye || (Ye = {})), (function(t) {
  t.HOME_ASSISTANT = "home-assistant", t.HOME_ASSISTANT_MAIN = "home-assistant-main", t.HA_DRAWER = "ha-drawer", t.HA_SIDEBAR = "ha-sidebar", t.PARTIAL_PANEL_RESOLVER = "partial-panel-resolver", t.HA_PANEL_LOVELACE = "ha-panel-lovelace", t.HUI_ROOT = "hui-root", t.HEADER = ".header", t.HUI_VIEW = "hui-view", t.HA_MORE_INFO_DIALOG = "ha-more-info-dialog", t.HA_DIALOG = "ha-dialog", t.HA_DIALOG_CONTENT = ".content", t.HA_MORE_INFO_DIALOG_INFO = "ha-more-info-info", t.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK = "ha-more-info-history-and-logbook", t.HA_DIALOG_MORE_INFO_SETTINGS = "ha-more-info-settings";
})(j || (j = {}));
var Sc = ((Ss = {})[Le.HOME_ASSISTANT] = { selector: j.HOME_ASSISTANT, children: { shadowRoot: { selector: Et, children: (Yr = {}, Yr[Le.HOME_ASSISTANT_MAIN] = { selector: j.HOME_ASSISTANT_MAIN, children: { shadowRoot: { selector: Et, children: (Jr = {}, Jr[Le.HA_DRAWER] = { selector: j.HA_DRAWER, children: (sr = {}, sr[Le.HA_SIDEBAR] = { selector: j.HA_SIDEBAR, children: { shadowRoot: { selector: Et } } }, sr[Le.PARTIAL_PANEL_RESOLVER] = { selector: j.PARTIAL_PANEL_RESOLVER }, sr) }, Jr) } } }, Yr) } } }, Ss), xc = ((xs = {})[mt.HA_PANEL_LOVELACE] = { selector: j.HA_PANEL_LOVELACE, children: { shadowRoot: { selector: Et, children: (Kr = {}, Kr[mt.HUI_ROOT] = { selector: j.HUI_ROOT, children: { shadowRoot: { selector: Et, children: (ar = {}, ar[mt.HEADER] = { selector: j.HEADER }, ar[mt.HUI_VIEW] = { selector: j.HUI_VIEW }, ar) } } }, Kr) } } }, xs), Tc = { shadowRoot: { selector: Et, children: (Qr = {}, Qr[B.HA_MORE_INFO_DIALOG] = { selector: j.HA_MORE_INFO_DIALOG, children: { shadowRoot: { selector: Et, children: (Xr = {}, Xr[B.HA_DIALOG] = { selector: j.HA_DIALOG, children: (Zr = {}, Zr[B.HA_DIALOG_CONTENT] = { selector: j.HA_DIALOG_CONTENT, children: (Rn = {}, Rn[B.HA_MORE_INFO_DIALOG_INFO] = { selector: j.HA_MORE_INFO_DIALOG_INFO }, Rn[B.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK] = { selector: j.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK }, Rn[B.HA_DIALOG_MORE_INFO_SETTINGS] = { selector: j.HA_DIALOG_MORE_INFO_SETTINGS }, Rn) }, Zr) }, Xr) } } }, Qr) } }, Mn = function(t, e, n, i) {
  return n === void 0 && (n = null), i === void 0 && (i = !1), Object.entries(e || {}).reduce((function(r, s) {
    var a = s[0], o = s[1];
    if (o.selector === Et && n) return o.children ? Ze(Ze({}, r), Mn(t, o.children, n, !0)) : r;
    var l = n ? n.then((function(u) {
      return u ? $s(u, (c = o.selector, i ? "$ " + c : c), t) : null;
      var c;
    })) : $s(o.selector, t);
    return r[a] = { element: l, children: Mn(t, o.children, l), selector: new Ac(l, t) }, r;
  }), {});
}, Qa = function(t, e) {
  for (var n = 0, i = Object.entries(e); n < i.length; n++) {
    var r = i[n];
    if (r[0] === t) return r[1];
    var s = Qa(t, r[1].children);
    if (s) return s;
  }
}, ei = function(t, e) {
  return Object.keys(t).reduce((function(n, i) {
    var r = Qa(i, e);
    r.children;
    var s = (function(a, o) {
      var l = {};
      for (var u in a) Object.prototype.hasOwnProperty.call(a, u) && o.indexOf(u) < 0 && (l[u] = a[u]);
      if (a != null && typeof Object.getOwnPropertySymbols == "function") {
        var c = 0;
        for (u = Object.getOwnPropertySymbols(a); c < u.length; c++) o.indexOf(u[c]) < 0 && Object.prototype.propertyIsEnumerable.call(a, u[c]) && (l[u[c]] = a[u[c]]);
      }
      return l;
    })(r, ["children"]);
    return n[i] = Ze({}, s), n;
  }), {});
}, Nc = (function() {
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
})(), Cc = (function(t) {
  function e(n) {
    n === void 0 && (n = {});
    var i = t.call(this) || this;
    return i._config = Ze(Ze({}, Oc), n), i._timestaps = {}, i;
  }
  return (function(n, i) {
    if (typeof i != "function" && i !== null) throw new TypeError("Class extends value " + String(i) + " is not a constructor or null");
    function r() {
      this.constructor = n;
    }
    bi(n, i), n.prototype = i === null ? Object.create(i) : (r.prototype = i.prototype, new r());
  })(e, t), e.prototype._dispatchEvent = function(n, i) {
    var r = Date.now();
    r - this._timestaps[n] < this._config.eventThreshold || (this._timestaps[n] = r, this.dispatchEvent(new CustomEvent(n, { detail: i })));
  }, e.prototype._updateDialogElements = function(n) {
    var i, r = this;
    n === void 0 && (n = B.HA_MORE_INFO_DIALOG_INFO), this._dialogTree = Mn(this._config, Tc, this._haRootElements.HOME_ASSISTANT.element);
    var s = ei(B, this._dialogTree);
    s.HA_DIALOG_CONTENT.element.then((function(o) {
      r._dialogsContentObserver.disconnect(), r._dialogsContentObserver.observe(o, { childList: !0 });
    })), this._haDialogElements = (function(o, l) {
      return [B.HA_MORE_INFO_DIALOG, B.HA_DIALOG, B.HA_DIALOG_CONTENT, l].reduce((function(u, c) {
        return u[c] = o[c], u;
      }), {});
    })(s, n);
    var a = ((i = {})[B.HA_MORE_INFO_DIALOG_INFO] = Ye.ON_MORE_INFO_DIALOG_OPEN, i[B.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK] = Ye.ON_HISTORY_AND_LOGBOOK_DIALOG_OPEN, i[B.HA_DIALOG_MORE_INFO_SETTINGS] = Ye.ON_SETTINGS_DIALOG_OPEN, i);
    this._dispatchEvent(a[n], this._haDialogElements);
  }, e.prototype._updateRootElements = function() {
    var n = this;
    this._homeAssistantRootTree = Mn(this._config, Sc), this._haRootElements = ei(Le, this._homeAssistantRootTree), this._haRootElements[Le.HOME_ASSISTANT].selector.$.element.then((function(i) {
      n._dialogsObserver.disconnect(), n._dialogsObserver.observe(i, { childList: !0 });
    })), this._haRootElements[Le.PARTIAL_PANEL_RESOLVER].element.then((function(i) {
      n._panelResolverObserver.disconnect(), i && n._panelResolverObserver.observe(i, { subtree: !0, childList: !0 });
    })), this._dispatchEvent(Ye.ON_LISTEN, this._haRootElements), this._dispatchEvent(Ye.ON_PANEL_LOAD, this._haRootElements);
  }, e.prototype._updateLovelaceElements = function() {
    var n = this;
    this._homeAssistantResolverTree = Mn(this._config, xc, this._haRootElements[Le.HA_DRAWER].element), this._haResolverElements = ei(mt, this._homeAssistantResolverTree), this._haResolverElements[mt.HA_PANEL_LOVELACE].element.then((function(i) {
      n._lovelaceObserver.disconnect(), i && (n._lovelaceObserver.observe(i.shadowRoot, { childList: !0 }), n._dispatchEvent(Ye.ON_LOVELACE_PANEL_LOAD, Ze(Ze({}, n._haRootElements), n._haResolverElements)));
    }));
  }, e.prototype._watchDialogs = function(n) {
    var i = this;
    n.forEach((function(r) {
      r.addedNodes.forEach((function(s) {
        s.localName === j.HA_MORE_INFO_DIALOG && i._updateDialogElements();
      }));
    }));
  }, e.prototype._watchDialogsContent = function(n) {
    var i = this;
    n.forEach((function(r) {
      r.addedNodes.forEach((function(s) {
        var a, o = ((a = {})[j.HA_MORE_INFO_DIALOG_INFO] = B.HA_MORE_INFO_DIALOG_INFO, a[j.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK] = B.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK, a[j.HA_DIALOG_MORE_INFO_SETTINGS] = B.HA_DIALOG_MORE_INFO_SETTINGS, a);
        if (s.localName && s.localName in o) {
          var l = s.localName;
          i._updateDialogElements(o[l]);
        }
      }));
    }));
  }, e.prototype._watchDashboards = function(n) {
    var i = this;
    n.forEach((function(r) {
      r.addedNodes.forEach((function(s) {
        i._dispatchEvent(Ye.ON_PANEL_LOAD, i._haRootElements), s.localName === j.HA_PANEL_LOVELACE && i._updateLovelaceElements();
      }));
    }));
  }, e.prototype._watchLovelace = function(n) {
    var i = this;
    n.forEach((function(r) {
      r.addedNodes.forEach((function(s) {
        s.localName === j.HUI_ROOT && i._updateLovelaceElements();
      }));
    }));
  }, e.prototype.listen = function() {
    this._watchDialogsBinded = this._watchDialogs.bind(this), this._watchDialogsContentBinded = this._watchDialogsContent.bind(this), this._watchDashboardsBinded = this._watchDashboards.bind(this), this._watchLovelaceBinded = this._watchLovelace.bind(this), this._dialogsObserver = new MutationObserver(this._watchDialogsBinded), this._dialogsContentObserver = new MutationObserver(this._watchDialogsContentBinded), this._panelResolverObserver = new MutationObserver(this._watchDashboardsBinded), this._lovelaceObserver = new MutationObserver(this._watchLovelaceBinded), this._updateRootElements(), this._updateLovelaceElements();
  }, e.prototype.addEventListener = function(n, i, r) {
    t.prototype.addEventListener.call(this, n, i, r);
  }, e;
})(Nc);
const Xa = new Cc();
let vr = {};
Xa.addEventListener("onLovelacePanelLoad", ({ detail: t }) => {
  t.HUI_ROOT.element.then((e) => {
    const n = e == null ? void 0 : e.lovelace;
    n != null && n.config && (vr = n.config["expander-card"] || {});
  }).catch(() => {
    vr = {};
  }).finally(() => {
    document.body.dispatchEvent(new CustomEvent("expander-card-raw-config-updated", {
      detail: { rawConfig: vr },
      bubbles: !0,
      composed: !0
    }));
  });
});
Xa.listen();
const Rc = () => vr, Ts = (t) => t ? typeof t == "string" ? t : Object.entries(t).map(([e, n]) => {
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
`) : null, wi = {
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
var Ic = /* @__PURE__ */ st("<ha-ripple></ha-ripple>", 2), Lc = /* @__PURE__ */ st('<button aria-label="Toggle button"><ha-icon></ha-icon> <!></button>', 2), kc = /* @__PURE__ */ st("<ha-ripple></ha-ripple>", 2), Pc = /* @__PURE__ */ st('<div id="id1"><div id="id2"><!></div> <!> <!></div>'), Dc = /* @__PURE__ */ st("<button><div> </div> <ha-icon></ha-icon> <ha-ripple></ha-ripple></button>", 2), Mc = /* @__PURE__ */ st("<div><div></div></div>"), Hc = /* @__PURE__ */ st("<ha-card><!> <!> <!></ha-card>", 2);
const jc = {
  hash: "svelte-1jqiztq",
  code: `.expander-card.svelte-1jqiztq {display:var(--expander-card-display,block);gap:var(--gap);padding:var(--padding);background:var(--card-background,#fff);-webkit-tap-highlight-color:transparent;}.expander-card.animation.svelte-1jqiztq {transition:gap 0.35s ease, background-color var(--background-animation-duration, 0) ease;}.children-wrapper.svelte-1jqiztq {display:flex;flex-direction:column;}.children-wrapper.animation.opening.svelte-1jqiztq,
    .children-wrapper.animation.closing.svelte-1jqiztq {overflow:hidden;}.children-container.animation.svelte-1jqiztq {transition:padding 0.35s ease, gap 0.35s ease;}.children-container.svelte-1jqiztq {padding:var(--child-padding);display:var(--expander-card-display,block);gap:var(--gap);}.clear.svelte-1jqiztq {background:none !important;background-color:transparent !important;border-style:none !important;box-shadow:none !important;}.title-card-header.svelte-1jqiztq {display:flex;align-items:center;justify-content:space-between;flex-direction:row;position:relative;}.title-card-header.clickable.svelte-1jqiztq {cursor:pointer;border-style:none;border-radius:var(--ha-card-border-radius, var(--ha-border-radius-lg));}.title-card-header-overlay.svelte-1jqiztq {display:block;}.title-card-container.svelte-1jqiztq {width:100%;padding:var(--title-padding);}.header.svelte-1jqiztq {display:flex;flex-direction:row;align-items:center;padding:0.85em 0.85em;background:var(--button-background);border-style:none;border-radius:var(--ha-card-border-radius, var(--ha-border-radius-lg));width:var(--header-width,auto);color:var(--header-color,#fff);cursor:pointer;position:relative;font-family:var(--ha-font-family-body);font-size:var(--ha-font-size-m);}.header-overlay.svelte-1jqiztq {position:absolute;top:0;right:0;margin:var(--overlay-margin);height:var(--expander-card-overlay-height, auto);z-index:1;}.title-card-header-overlay.clickable.svelte-1jqiztq  > .header-overlay:where(.svelte-1jqiztq) {width:calc(100% - var(--overlay-margin) * 2);justify-content:flex-end;}.title-card-header-overlay.clickable.svelte-1jqiztq > .title-card-container:where(.svelte-1jqiztq) {width:calc(100% - var(--overlay-margin) * 2);}.title.svelte-1jqiztq {width:100%;text-align:left;}.ico.animation.svelte-1jqiztq {transition-property:transform;transition-duration:0.35s;}.ico.svelte-1jqiztq {color:var(--arrow-color,var(--primary-text-color,#fff));}.flipped.svelte-1jqiztq {transform:rotate(var(--icon-rotate-degree,180deg));}`
};
function Fc(t, e) {
  Si(e, !0), qa(t, jc);
  const n = Ne(e, "hass"), i = Ne(e, "preview"), r = Ne(e, "config", 7, wi);
  let s = /* @__PURE__ */ M(!1), a = /* @__PURE__ */ M(null), o = /* @__PURE__ */ M(Xe(!!Re(() => i()))), l = /* @__PURE__ */ M(Xe(!!Re(() => i()))), u = /* @__PURE__ */ M(!0), c = /* @__PURE__ */ M("idle"), f = /* @__PURE__ */ M(null), _ = /* @__PURE__ */ M(0), w = /* @__PURE__ */ M(0), b = /* @__PURE__ */ M(null), A = /* @__PURE__ */ M(null), d = /* @__PURE__ */ M(null), v = /* @__PURE__ */ M(null);
  const m = {}, y = {}, S = {}, x = /* @__PURE__ */ M(Xe({}));
  let C = /* @__PURE__ */ M(Xe(Rc()));
  const k = /* @__PURE__ */ Cn(() => {
    const g = h(x).style, E = r().style;
    let $ = null;
    return g !== void 0 ? $ = typeof g == "string" ? g : typeof g == "object" && g !== null ? Ts(g) : String(g) : E && ($ = Ts(E)), $ ? `<style>${$}</style>` : null;
  }), F = /* @__PURE__ */ Cn(() => h(x).icon !== void 0 ? String(h(x).icon) : r().icon), H = /* @__PURE__ */ Cn(() => h(x).title !== void 0 ? String(h(x).title) : r().title), tr = /* @__PURE__ */ Cn(() => h(x)["arrow-color"] !== void 0 ? String(h(x)["arrow-color"]) : r()["arrow-color"]), On = Re(() => r()["storage-id"]), zi = "expander-open-" + On;
  O(u, Re(() => i() || (Ur(r()["show-button-users"]) ?? !0)), !0), dn(() => {
    if (h(x).expanded === void 0 || Re(() => i() && h(C)["preview-expanded"] !== !1))
      return;
    const g = !!h(x).expanded;
    queueMicrotask(() => {
      g !== h(o) && Tt(g);
    });
  }), dn(() => {
    if (!(i() === h(l) || i() === void 0)) {
      if (O(l, i(), !0), h(l) && h(C)["preview-expanded"] !== !1) {
        Sn(!0), O(u, !0);
        return;
      }
      if (O(u, Ur(r()["show-button-users"]) ?? !0, !0), nr("expanded")) {
        const g = Re(() => h(x).expanded);
        g !== void 0 && Tt(!!g);
        return;
      }
      Bi();
    }
  });
  function nr(g) {
    const E = r().templates && Array.isArray(r().templates) ? r().templates.find(($) => $.template === g) : void 0;
    if (E && pr(E.value_template))
      return E;
  }
  function qr(g) {
    if (!r()["expander-card-id"])
      return;
    const E = {};
    E[r()["expander-card-id"]] = { property: "open", value: g }, document.dispatchEvent(new CustomEvent("expander-card", { detail: E, bubbles: !0, composed: !0 }));
  }
  function Ur(g) {
    var E, $, W, Oe;
    if (g !== void 0)
      return (($ = (E = n()) == null ? void 0 : E.user) == null ? void 0 : $.name) !== void 0 && g.includes((Oe = (W = n()) == null ? void 0 : W.user) == null ? void 0 : Oe.name);
  }
  function Bi() {
    if (!nr("expanded")) {
      if (Ur(r()["start-expanded-users"])) {
        at(!0);
        return;
      }
      if (On === void 0) {
        Vi();
        return;
      }
      try {
        const g = localStorage.getItem(zi);
        if (g === null) {
          Vi();
          return;
        }
        const E = g ? g === "true" : h(o);
        at(E);
      } catch (g) {
        console.error(g), at(!1);
      }
    }
  }
  function Vi() {
    if (r().expanded !== void 0) {
      at(r().expanded);
      return;
    }
    at(!1);
  }
  function Tt(g) {
    h(f) && (clearTimeout(h(f)), O(f, null));
    const E = g !== void 0 ? g : !h(o);
    if (!r().animation) {
      at(E);
      return;
    }
    if (qr(E), O(c, E ? "opening" : "closing", !0), E) {
      Sn(!0), O(
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
          Sn(!1), O(c, "idle"), O(f, null);
        },
        350
      ),
      !0
    );
  }
  function at(g) {
    Sn(g), qr(g);
  }
  function Sn(g) {
    if (O(o, g, !0), !i() && On !== void 0)
      try {
        localStorage.setItem(zi, h(o) ? "true" : "false");
      } catch (E) {
        console.error(E);
      }
    h(o) && h(_) === 0 && O(_, 0.35);
  }
  function Wi(g) {
    var $;
    const E = ($ = g.detail) == null ? void 0 : $.rawConfig;
    E && JSON.stringify(E) !== JSON.stringify(h(C)) && O(C, E, !0);
  }
  function Yi(g) {
    var $, W;
    const E = (W = ($ = g.detail) == null ? void 0 : $["expander-card"]) == null ? void 0 : W.data;
    if (E != null && E["expander-card-id"] && E["expander-card-id"] === r()["expander-card-id"]) {
      if (E.action === "open" && !h(o)) {
        Tt(!0);
        return;
      }
      if (E.action === "close" && h(o)) {
        Tt(!1);
        return;
      }
      E.action === "toggle" && Tt();
    }
  }
  function so() {
    document.body.removeEventListener("ll-custom", Yi), document.body.removeEventListener("expander-card-raw-config-updated", Wi), Object.entries(S).forEach(([g, E]) => {
      E.then(($) => {
        $(), delete S[g];
      }).catch(() => {
      });
    }), Object.entries(y).forEach(([g, E]) => {
      E.then(($) => {
        $(), delete y[g];
      }).catch(() => {
      });
    }), Object.entries(m).forEach(([g, E]) => {
      E(), delete m[g];
    });
  }
  const Ji = (g) => {
    r().haptic && r().haptic !== "none" && dc(g, r().haptic);
  };
  let xn, Tn = !1, Ki = 0, Qi = 0;
  const ao = (g) => {
    h(v) && (h(v).disabled = !0), xn = g.target, Ki = g.touches[0].clientX, Qi = g.touches[0].clientY, Tn = !1;
  }, oo = (g) => {
    const E = g.touches[0].clientX, $ = g.touches[0].clientY;
    Tn = Math.abs(E - Ki) > 10 || Math.abs($ - Qi) > 10;
  }, lo = () => {
    h(v) && (h(v).disabled = !1), xn = void 0, Tn = !1;
  }, co = () => {
    h(v) && (h(v).disabled = !1);
  }, uo = (g) => {
    !Tn && xn === g.target && r()["title-card-clickable"] && (Ji(xn), Tt(), O(s, !0), O(
      a,
      window.setTimeout(
        () => {
          O(s, !1), O(a, null);
        },
        100
      ),
      !0
    ), h(v) && (h(v).startPressAnimation(), h(v).endPressAnimation())), xn = void 0, Tn = !1;
  }, fo = (g) => {
    for (const E of Object.values(r().variables ?? {}))
      pr(E.value_template) ? y[E.variable] = gs(
        g,
        ($) => {
          ms(g, E.variable, $);
        },
        E.value_template,
        { config: r() }
      ) : ms(g, E.variable, E.value_template);
  }, ho = (g) => {
    m["expander-card"] = mc(g, "expander-card");
  }, po = () => {
    if (!r().templates) return;
    const g = Object.values(r().variables || {}).reduce(
      ($, W) => ($[W.variable] = void 0, $),
      {}
    ), E = _c({ config: r(), expanderCard: {} }, g);
    fo(E), ho(E), Object.values(r().templates || {}).forEach(($) => {
      pr($.value_template) ? S[$.template] = gs(
        E,
        (W) => {
          h(x)[$.template] = W;
        },
        $.value_template,
        { config: r() }
      ) : h(x)[$.template] = $.value_template;
    });
  };
  function vo() {
    if (nr("expanded"))
      return;
    const g = r()["min-width-expanded"], E = r()["max-width-expanded"], $ = document.body.offsetWidth;
    if (g && E) {
      r().expanded = $ >= g && $ <= E;
      return;
    }
    if (g) {
      r().expanded = $ >= g;
      return;
    }
    E && (r().expanded = $ <= E);
  }
  function _o() {
    if (i() && h(C)["preview-expanded"] !== !1) {
      Sn(!0);
      return;
    }
    if (nr("expanded")) {
      const g = Re(() => h(x).expanded);
      at(g !== void 0 ? !!g : !1);
    } else
      Bi();
  }
  function go() {
    if (r()["title-card-clickable"] && !r()["title-card-button-overlay"] && h(A))
      return h(A);
    if (h(d))
      return h(d);
  }
  Fa(() => {
    po(), qr(!1), vo(), _o(), document.body.addEventListener("ll-custom", Yi), document.body.addEventListener("expander-card-raw-config-updated", Wi);
    const g = go();
    return g && (g.addEventListener("touchstart", ao, { passive: !0, capture: !0 }), g.addEventListener("touchmove", oo, { passive: !0, capture: !0 }), g.addEventListener("touchcancel", lo, { passive: !0, capture: !0 }), g.addEventListener("touchend", co, { passive: !0, capture: !0 }), g.addEventListener("touchend", uo, { passive: !1, capture: !1 })), r()["title-card-clickable"] && r()["title-card-button-overlay"] && h(A) && new ResizeObserver(() => {
      if (h(d) && h(A) && h(b)) {
        const $ = h(A).getBoundingClientRect();
        O(w, $.height - parseFloat(getComputedStyle(h(d)).marginTop) - parseFloat(getComputedStyle(h(d)).marginBottom) + parseFloat(getComputedStyle(h(b)).paddingTop) + parseFloat(getComputedStyle(h(b)).paddingBottom));
      }
    }).observe(h(A)), so;
  });
  const Gr = (g) => {
    if (!h(s)) {
      Ji(g.currentTarget), Tt();
      return;
    }
    return g.preventDefault(), g.stopImmediatePropagation(), O(s, !1), h(a) && (clearTimeout(h(a)), O(a, null)), !1;
  };
  var mo = {
    get hass() {
      return n();
    },
    set hass(g) {
      n(g), me();
    },
    get preview() {
      return i();
    },
    set preview(g) {
      i(g), me();
    },
    get config() {
      return r();
    },
    set config(g = wi) {
      r(g), me();
    }
  }, en = Hc(), Xi = ct(en);
  {
    var yo = (g) => {
      var E = Pc();
      E.__click = function(...X) {
        var te;
        (te = r()["title-card-clickable"] && !r()["title-card-button-overlay"] ? Gr : null) == null || te.apply(this, X);
      };
      var $ = ct(E), W = ct($);
      mi(W, {
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
      }), Ve($);
      var Oe = Ct($, 2);
      {
        var Se = (X) => {
          var te = Lc();
          te.__click = function(...Nt) {
            var Nn;
            (Nn = !r()["title-card-clickable"] || r()["title-card-button-overlay"] ? Gr : null) == null || Nn.apply(this, Nt);
          };
          var He = ct(te);
          We(() => fs(He, "icon", h(F)));
          var Ao = Ct(He, 2);
          {
            var Oo = (Nt) => {
              var Nn = Ic();
              ft(Nn, (So) => O(v, So), () => h(v)), ve(Nt, Nn);
            };
            ut(Ao, (Nt) => {
              (!r()["title-card-clickable"] || r()["title-card-button-overlay"]) && Nt(Oo);
            });
          }
          Ve(te), ft(te, (Nt) => O(d, Nt), () => h(d)), We(() => {
            dt(te, `--overlay-margin:${r()["overlay-margin"] ?? ""}; --button-background:${r()["button-background"] ?? ""}; --header-color:${r()["header-color"] ?? ""};`), xe(te, 1, `header ${r()["title-card-button-overlay"] ? " header-overlay" : ""}${h(o) ? " open" : " close"}${r().animation ? " animation " + h(c) : ""}`, "svelte-1jqiztq"), dt(He, `--arrow-color:${h(tr) ?? ""}`), xe(He, 1, `ico${h(o) && h(c) !== "closing" ? " flipped open" : " close"}${r().animation ? " animation " + h(c) : ""}`, "svelte-1jqiztq");
          }), ve(X, te);
        };
        ut(Oe, (X) => {
          h(u) && X(Se);
        });
      }
      var tn = Ct(Oe, 2);
      {
        var zr = (X) => {
          var te = kc();
          ft(te, (He) => O(v, He), () => h(v)), ve(X, te);
        };
        ut(tn, (X) => {
          r()["title-card-clickable"] && !r()["title-card-button-overlay"] && X(zr);
        });
      }
      Ve(E), ft(E, (X) => O(A, X), () => h(A)), We(() => {
        xe(E, 1, `title-card-header${r()["title-card-button-overlay"] ? "-overlay" : ""}${h(o) ? " open" : " close"}${r().animation ? " animation " + h(c) : ""}${r()["title-card-clickable"] ? " clickable" : ""}`, "svelte-1jqiztq"), Ua(E, "role", r()["title-card-clickable"] && !r()["title-card-button-overlay"] ? "button" : void 0), xe($, 1, `title-card-container${h(o) ? " open" : " close"}${r().animation ? " animation " + h(c) : ""}`, "svelte-1jqiztq"), dt($, `--title-padding:${(r()["title-card-padding"] ? r()["title-card-padding"] : "0px") ?? ""};`);
      }), ve(g, E);
    }, bo = (g) => {
      var E = us(), $ = as(E);
      {
        var W = (Oe) => {
          var Se = Dc();
          Se.__click = Gr;
          var tn = ct(Se), zr = ct(tn, !0);
          Ve(tn);
          var X = Ct(tn, 2);
          We(() => fs(X, "icon", h(F)));
          var te = Ct(X, 2);
          ft(te, (He) => O(v, He), () => h(v)), Ve(Se), ft(Se, (He) => O(d, He), () => h(d)), We(() => {
            xe(Se, 1, `header${h(o) ? " open" : " close"}${r().animation ? " animation " + h(c) : ""}`, "svelte-1jqiztq"), dt(Se, `--header-width:100%; --button-background:${r()["button-background"] ?? ""};--header-color:${r()["header-color"] ?? ""};`), xe(tn, 1, `primary title${h(o) ? " open" : " close"}`, "svelte-1jqiztq"), zl(zr, h(H)), dt(X, `--arrow-color:${h(tr) ?? ""}`), xe(X, 1, `ico${h(o) && h(c) !== "closing" ? " flipped open" : " close"}${r().animation ? " animation " + h(c) : ""}`, "svelte-1jqiztq");
          }), ve(Oe, Se);
        };
        ut($, (Oe) => {
          h(u) && Oe(W);
        });
      }
      ve(g, E);
    };
    ut(Xi, (g) => {
      r()["title-card"] ? g(yo) : g(bo, !1);
    });
  }
  var Zi = Ct(Xi, 2);
  {
    var wo = (g) => {
      var E = Mc(), $ = ct(E);
      Jl($, 20, () => r().cards, (W) => W, (W, Oe) => {
        {
          let Se = /* @__PURE__ */ Cn(() => h(o) && i());
          mi(W, {
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
              return r()["child-margin-top"];
            },
            get open() {
              return h(o);
            },
            get animation() {
              return r().animation;
            },
            get animationState() {
              return h(c);
            },
            get clearCardCss() {
              return r()["clear-children"];
            }
          });
        }
      }), Ve($), Ve(E), We(() => {
        xe(E, 1, `children-wrapper ${r().animation ? "animation " + h(c) : ""}${h(o) ? " open" : " close"}`, "svelte-1jqiztq"), dt($, `--expander-card-display:${r()["expander-card-display"] ?? ""};
                --gap:${(h(o) && h(c) !== "closing" ? r()["expanded-gap"] : r().gap) ?? ""};
                --child-padding:${(h(o) && h(c) !== "closing" ? r()["child-padding"] : "0px") ?? ""};`), xe($, 1, `children-container${h(o) ? " open" : " close"}${r().animation ? " animation " + h(c) : ""}`, "svelte-1jqiztq");
      }), ve(g, E);
    };
    ut(Zi, (g) => {
      r().cards && g(wo);
    });
  }
  var Eo = Ct(Zi, 2);
  {
    var $o = (g) => {
      var E = us(), $ = as(E);
      Xl($, () => h(k)), ve(g, E);
    };
    ut(Eo, (g) => {
      h(k) && g($o);
    });
  }
  return Ve(en), ft(en, (g) => O(b, g), () => h(b)), We(() => {
    xe(en, 1, `expander-card${r().clear ? " clear" : ""}${h(o) ? " open" : " close"} ${h(c)}${r().animation ? " animation " + h(c) : ""}`, "svelte-1jqiztq"), dt(en, `--expander-card-display:${r()["expander-card-display"] ?? ""};
     --gap:${(h(o) && h(c) !== "closing" ? r()["expanded-gap"] : r().gap) ?? ""}; --padding:${r().padding ?? ""};
     --expander-state:${h(o) ?? ""};
     --icon-rotate-degree:${r()["icon-rotate-degree"] ?? ""};
     --card-background:${(h(o) && h(c) !== "closing" && r()["expander-card-background-expanded"] ? r()["expander-card-background-expanded"] : r()["expander-card-background"]) ?? ""};
     --background-animation-duration:${h(_) ?? ""}s;
     --expander-card-overlay-height:${h(w) ? `${h(w)}px` : "auto"};
    `);
  }), ve(t, en), xi(mo);
}
ql(["click"]);
customElements.define("expander-card", Ba(Fc, { hass: {}, preview: {}, config: {} }, [], [], !0, (t) => class extends t {
  constructor() {
    super(...arguments);
    // re-declare props used in customClass.
    q(this, "config");
  }
  static async getConfigElement() {
    return await Go(), document.createElement("expander-card-editor");
  }
  static getStubConfig() {
    return {
      type: "custom:expander-card",
      title: "Expander Card",
      cards: []
    };
  }
  setConfig(n = {}) {
    this.config = { ...wi, ...n };
  }
}));
const qc = "5.0.0";
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const _r = globalThis, ji = _r.ShadowRoot && (_r.ShadyCSS === void 0 || _r.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Fi = Symbol(), Ns = /* @__PURE__ */ new WeakMap();
let Za = class {
  constructor(e, n, i) {
    if (this._$cssResult$ = !0, i !== Fi) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = n;
  }
  get styleSheet() {
    let e = this.o;
    const n = this.t;
    if (ji && e === void 0) {
      const i = n !== void 0 && n.length === 1;
      i && (e = Ns.get(n)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), i && Ns.set(n, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const Uc = (t) => new Za(typeof t == "string" ? t : t + "", void 0, Fi), qi = (t, ...e) => {
  const n = t.length === 1 ? t[0] : e.reduce((i, r, s) => i + ((a) => {
    if (a._$cssResult$ === !0) return a.cssText;
    if (typeof a == "number") return a;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + t[s + 1], t[0]);
  return new Za(n, t, Fi);
}, Gc = (t, e) => {
  if (ji) t.adoptedStyleSheets = e.map((n) => n instanceof CSSStyleSheet ? n : n.styleSheet);
  else for (const n of e) {
    const i = document.createElement("style"), r = _r.litNonce;
    r !== void 0 && i.setAttribute("nonce", r), i.textContent = n.cssText, t.appendChild(i);
  }
}, Cs = ji ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let n = "";
  for (const i of e.cssRules) n += i.cssText;
  return Uc(n);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: zc, defineProperty: Bc, getOwnPropertyDescriptor: Vc, getOwnPropertyNames: Wc, getOwnPropertySymbols: Yc, getPrototypeOf: Jc } = Object, $t = globalThis, Rs = $t.trustedTypes, Kc = Rs ? Rs.emptyScript : "", ti = $t.reactiveElementPolyfillSupport, Hn = (t, e) => t, xr = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? Kc : null;
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
} }, Ui = (t, e) => !zc(t, e), Is = { attribute: !0, type: String, converter: xr, reflect: !1, useDefault: !1, hasChanged: Ui };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), $t.litPropertyMetadata ?? ($t.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let on = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, n = Is) {
    if (n.state && (n.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((n = Object.create(n)).wrapped = !0), this.elementProperties.set(e, n), !n.noAccessor) {
      const i = Symbol(), r = this.getPropertyDescriptor(e, i, n);
      r !== void 0 && Bc(this.prototype, e, r);
    }
  }
  static getPropertyDescriptor(e, n, i) {
    const { get: r, set: s } = Vc(this.prototype, e) ?? { get() {
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
    return this.elementProperties.get(e) ?? Is;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Hn("elementProperties"))) return;
    const e = Jc(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Hn("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Hn("properties"))) {
      const n = this.properties, i = [...Wc(n), ...Yc(n)];
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
      for (const r of i) n.unshift(Cs(r));
    } else e !== void 0 && n.push(Cs(e));
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
    return Gc(e, this.constructor.elementStyles), e;
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
      const a = (((s = i.converter) == null ? void 0 : s.toAttribute) !== void 0 ? i.converter : xr).toAttribute(n, i.type);
      this._$Em = e, a == null ? this.removeAttribute(r) : this.setAttribute(r, a), this._$Em = null;
    }
  }
  _$AK(e, n) {
    var s, a;
    const i = this.constructor, r = i._$Eh.get(e);
    if (r !== void 0 && this._$Em !== r) {
      const o = i.getPropertyOptions(r), l = typeof o.converter == "function" ? { fromAttribute: o.converter } : ((s = o.converter) == null ? void 0 : s.fromAttribute) !== void 0 ? o.converter : xr;
      this._$Em = r;
      const u = l.fromAttribute(n, o.type);
      this[r] = u ?? ((a = this._$Ej) == null ? void 0 : a.get(r)) ?? u, this._$Em = null;
    }
  }
  requestUpdate(e, n, i, r = !1, s) {
    var a;
    if (e !== void 0) {
      const o = this.constructor;
      if (r === !1 && (s = this[e]), i ?? (i = o.getPropertyOptions(e)), !((i.hasChanged ?? Ui)(s, n) || i.useDefault && i.reflect && s === ((a = this._$Ej) == null ? void 0 : a.get(e)) && !this.hasAttribute(o._$Eu(e, i)))) return;
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
on.elementStyles = [], on.shadowRootOptions = { mode: "open" }, on[Hn("elementProperties")] = /* @__PURE__ */ new Map(), on[Hn("finalized")] = /* @__PURE__ */ new Map(), ti == null || ti({ ReactiveElement: on }), ($t.reactiveElementVersions ?? ($t.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const jn = globalThis, Ls = (t) => t, Tr = jn.trustedTypes, ks = Tr ? Tr.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, eo = "$lit$", pt = `lit$${Math.random().toFixed(9).slice(2)}$`, to = "?" + pt, Qc = `<${to}>`, Jt = document, Gn = () => Jt.createComment(""), zn = (t) => t === null || typeof t != "object" && typeof t != "function", Gi = Array.isArray, Xc = (t) => Gi(t) || typeof (t == null ? void 0 : t[Symbol.iterator]) == "function", ni = `[ 	
\f\r]`, In = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Ps = /-->/g, Ds = />/g, It = RegExp(`>|${ni}(?:([^\\s"'>=/]+)(${ni}*=${ni}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Ms = /'/g, Hs = /"/g, no = /^(?:script|style|textarea|title)$/i, Zc = (t) => (e, ...n) => ({ _$litType$: t, strings: e, values: n }), an = Zc(1), $n = Symbol.for("lit-noChange"), U = Symbol.for("lit-nothing"), js = /* @__PURE__ */ new WeakMap(), kt = Jt.createTreeWalker(Jt, 129);
function ro(t, e) {
  if (!Gi(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return ks !== void 0 ? ks.createHTML(e) : e;
}
const eu = (t, e) => {
  const n = t.length - 1, i = [];
  let r, s = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", a = In;
  for (let o = 0; o < n; o++) {
    const l = t[o];
    let u, c, f = -1, _ = 0;
    for (; _ < l.length && (a.lastIndex = _, c = a.exec(l), c !== null); ) _ = a.lastIndex, a === In ? c[1] === "!--" ? a = Ps : c[1] !== void 0 ? a = Ds : c[2] !== void 0 ? (no.test(c[2]) && (r = RegExp("</" + c[2], "g")), a = It) : c[3] !== void 0 && (a = It) : a === It ? c[0] === ">" ? (a = r ?? In, f = -1) : c[1] === void 0 ? f = -2 : (f = a.lastIndex - c[2].length, u = c[1], a = c[3] === void 0 ? It : c[3] === '"' ? Hs : Ms) : a === Hs || a === Ms ? a = It : a === Ps || a === Ds ? a = In : (a = It, r = void 0);
    const w = a === It && t[o + 1].startsWith("/>") ? " " : "";
    s += a === In ? l + Qc : f >= 0 ? (i.push(u), l.slice(0, f) + eo + l.slice(f) + pt + w) : l + pt + (f === -2 ? o : w);
  }
  return [ro(t, s + (t[n] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), i];
};
class Bn {
  constructor({ strings: e, _$litType$: n }, i) {
    let r;
    this.parts = [];
    let s = 0, a = 0;
    const o = e.length - 1, l = this.parts, [u, c] = eu(e, n);
    if (this.el = Bn.createElement(u, i), kt.currentNode = this.el.content, n === 2 || n === 3) {
      const f = this.el.content.firstChild;
      f.replaceWith(...f.childNodes);
    }
    for (; (r = kt.nextNode()) !== null && l.length < o; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const f of r.getAttributeNames()) if (f.endsWith(eo)) {
          const _ = c[a++], w = r.getAttribute(f).split(pt), b = /([.?@])?(.*)/.exec(_);
          l.push({ type: 1, index: s, name: b[2], strings: w, ctor: b[1] === "." ? nu : b[1] === "?" ? ru : b[1] === "@" ? iu : jr }), r.removeAttribute(f);
        } else f.startsWith(pt) && (l.push({ type: 6, index: s }), r.removeAttribute(f));
        if (no.test(r.tagName)) {
          const f = r.textContent.split(pt), _ = f.length - 1;
          if (_ > 0) {
            r.textContent = Tr ? Tr.emptyScript : "";
            for (let w = 0; w < _; w++) r.append(f[w], Gn()), kt.nextNode(), l.push({ type: 2, index: ++s });
            r.append(f[_], Gn());
          }
        }
      } else if (r.nodeType === 8) if (r.data === to) l.push({ type: 2, index: s });
      else {
        let f = -1;
        for (; (f = r.data.indexOf(pt, f + 1)) !== -1; ) l.push({ type: 7, index: s }), f += pt.length - 1;
      }
      s++;
    }
  }
  static createElement(e, n) {
    const i = Jt.createElement("template");
    return i.innerHTML = e, i;
  }
}
function An(t, e, n = t, i) {
  var a, o;
  if (e === $n) return e;
  let r = i !== void 0 ? (a = n._$Co) == null ? void 0 : a[i] : n._$Cl;
  const s = zn(e) ? void 0 : e._$litDirective$;
  return (r == null ? void 0 : r.constructor) !== s && ((o = r == null ? void 0 : r._$AO) == null || o.call(r, !1), s === void 0 ? r = void 0 : (r = new s(t), r._$AT(t, n, i)), i !== void 0 ? (n._$Co ?? (n._$Co = []))[i] = r : n._$Cl = r), r !== void 0 && (e = An(t, r._$AS(t, e.values), r, i)), e;
}
class tu {
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
    const { el: { content: n }, parts: i } = this._$AD, r = ((e == null ? void 0 : e.creationScope) ?? Jt).importNode(n, !0);
    kt.currentNode = r;
    let s = kt.nextNode(), a = 0, o = 0, l = i[0];
    for (; l !== void 0; ) {
      if (a === l.index) {
        let u;
        l.type === 2 ? u = new Zn(s, s.nextSibling, this, e) : l.type === 1 ? u = new l.ctor(s, l.name, l.strings, this, e) : l.type === 6 && (u = new su(s, this, e)), this._$AV.push(u), l = i[++o];
      }
      a !== (l == null ? void 0 : l.index) && (s = kt.nextNode(), a++);
    }
    return kt.currentNode = Jt, r;
  }
  p(e) {
    let n = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(e, i, n), n += i.strings.length - 2) : i._$AI(e[n])), n++;
  }
}
class Zn {
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
    e = An(this, e, n), zn(e) ? e === U || e == null || e === "" ? (this._$AH !== U && this._$AR(), this._$AH = U) : e !== this._$AH && e !== $n && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : Xc(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== U && zn(this._$AH) ? this._$AA.nextSibling.data = e : this.T(Jt.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    var s;
    const { values: n, _$litType$: i } = e, r = typeof i == "number" ? this._$AC(e) : (i.el === void 0 && (i.el = Bn.createElement(ro(i.h, i.h[0]), this.options)), i);
    if (((s = this._$AH) == null ? void 0 : s._$AD) === r) this._$AH.p(n);
    else {
      const a = new tu(r, this), o = a.u(this.options);
      a.p(n), this.T(o), this._$AH = a;
    }
  }
  _$AC(e) {
    let n = js.get(e.strings);
    return n === void 0 && js.set(e.strings, n = new Bn(e)), n;
  }
  k(e) {
    Gi(this._$AH) || (this._$AH = [], this._$AR());
    const n = this._$AH;
    let i, r = 0;
    for (const s of e) r === n.length ? n.push(i = new Zn(this.O(Gn()), this.O(Gn()), this, this.options)) : i = n[r], i._$AI(s), r++;
    r < n.length && (this._$AR(i && i._$AB.nextSibling, r), n.length = r);
  }
  _$AR(e = this._$AA.nextSibling, n) {
    var i;
    for ((i = this._$AP) == null ? void 0 : i.call(this, !1, !0, n); e !== this._$AB; ) {
      const r = Ls(e).nextSibling;
      Ls(e).remove(), e = r;
    }
  }
  setConnected(e) {
    var n;
    this._$AM === void 0 && (this._$Cv = e, (n = this._$AP) == null || n.call(this, e));
  }
}
class jr {
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
    if (s === void 0) e = An(this, e, n, 0), a = !zn(e) || e !== this._$AH && e !== $n, a && (this._$AH = e);
    else {
      const o = e;
      let l, u;
      for (e = s[0], l = 0; l < s.length - 1; l++) u = An(this, o[i + l], n, l), u === $n && (u = this._$AH[l]), a || (a = !zn(u) || u !== this._$AH[l]), u === U ? e = U : e !== U && (e += (u ?? "") + s[l + 1]), this._$AH[l] = u;
    }
    a && !r && this.j(e);
  }
  j(e) {
    e === U ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class nu extends jr {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === U ? void 0 : e;
  }
}
class ru extends jr {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== U);
  }
}
class iu extends jr {
  constructor(e, n, i, r, s) {
    super(e, n, i, r, s), this.type = 5;
  }
  _$AI(e, n = this) {
    if ((e = An(this, e, n, 0) ?? U) === $n) return;
    const i = this._$AH, r = e === U && i !== U || e.capture !== i.capture || e.once !== i.once || e.passive !== i.passive, s = e !== U && (i === U || r);
    r && this.element.removeEventListener(this.name, this, i), s && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    var n;
    typeof this._$AH == "function" ? this._$AH.call(((n = this.options) == null ? void 0 : n.host) ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class su {
  constructor(e, n, i) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = n, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    An(this, e);
  }
}
const ri = jn.litHtmlPolyfillSupport;
ri == null || ri(Bn, Zn), (jn.litHtmlVersions ?? (jn.litHtmlVersions = [])).push("3.3.2");
const au = (t, e, n) => {
  const i = (n == null ? void 0 : n.renderBefore) ?? e;
  let r = i._$litPart$;
  if (r === void 0) {
    const s = (n == null ? void 0 : n.renderBefore) ?? null;
    i._$litPart$ = r = new Zn(e.insertBefore(Gn(), s), s, void 0, n ?? {});
  }
  return r._$AI(t), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const zt = globalThis;
class Fn extends on {
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
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = au(n, this.renderRoot, this.renderOptions);
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
    return $n;
  }
}
var qs;
Fn._$litElement$ = !0, Fn.finalized = !0, (qs = zt.litElementHydrateSupport) == null || qs.call(zt, { LitElement: Fn });
const ii = zt.litElementPolyfillSupport;
ii == null || ii({ LitElement: Fn });
(zt.litElementVersions ?? (zt.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ou = (t) => (e, n) => {
  n !== void 0 ? n.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const lu = { attribute: !0, type: String, converter: xr, reflect: !1, hasChanged: Ui }, cu = (t = lu, e, n) => {
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
function Fr(t) {
  return (e, n) => typeof n == "object" ? cu(t, e, n) : ((i, r, s) => {
    const a = r.hasOwnProperty(s);
    return r.constructor.createProperty(s, i), a ? Object.getOwnPropertyDescriptor(r, s) : void 0;
  })(t, e, n);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function er(t) {
  return Fr({ ...t, state: !0, attribute: !1 });
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const uu = (t, e, n) => (n.configurable = !0, n.enumerable = !0, Reflect.decorate && typeof e != "object" && Object.defineProperty(t, e, n), n);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function du(t, e) {
  return (n, i, r) => {
    const s = (a) => {
      var o;
      return ((o = a.renderRoot) == null ? void 0 : o.querySelector(t)) ?? null;
    };
    return uu(n, i, { get() {
      return s(this);
    } });
  };
}
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const fu = (t) => t ?? U, hu = qi`
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
`, pu = qi`
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
var vu = Object.defineProperty, _u = Object.getOwnPropertyDescriptor, Be = (t, e, n, i) => {
  for (var r = i > 1 ? void 0 : i ? _u(e, n) : e, s = t.length - 1, a; s >= 0; s--)
    (a = t[s]) && (r = (i ? a(e, n, r) : a(r)) || r);
  return i && r && vu(e, n, r), r;
};
const io = "custom:", gu = (t) => t.startsWith(io), mu = (t) => {
  var e;
  return (e = window.customCards) == null ? void 0 : e.find((n) => n.type === t);
}, yu = (t) => t.replace(io, "");
let he = class extends Fn {
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
      gu(this._config.type) ? (i = (n = mu(
        yu(this._config.type)
      )) == null ? void 0 : n.name, i != null && i.toLowerCase().endsWith(" card") && (i = i.substring(0, i.length - 5))) : i = this.hass.localize(
        `ui.panel.lovelace.editor.card.${this._config.type}.name`
      ), e = `${e} - ${this.hass.localize(
        "ui.panel.lovelace.editor.edit_card.typed_header",
        { type: i }
      )}`;
    }
    return an`
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
                    disabled=${fu(t)}
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
    return an`
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
    const t = this._error ? "blur" : "", e = this._error ? an` <ha-spinner aria-label="Can't update card"></ha-spinner> ` : "";
    return an`
        ${this._config.type ? an`
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
            ` : an`
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
  hu,
  pu,
  qi`
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
Be([
  Fr({ attribute: !1 })
], he.prototype, "hass", 2);
Be([
  Fr({ type: Boolean, reflect: !0 })
], he.prototype, "large", 2);
Be([
  Fr({ attribute: !1 })
], he.prototype, "lovelace", 2);
Be([
  er()
], he.prototype, "_params", 2);
Be([
  er()
], he.prototype, "_config", 2);
Be([
  er()
], he.prototype, "_cardGUIMode", 2);
Be([
  er()
], he.prototype, "_cardGUIModeAvailable", 2);
Be([
  er()
], he.prototype, "_error", 2);
Be([
  du("hui-card-element-editor")
], he.prototype, "_cardEditorEl", 2);
he = Be([
  ou("expander-card-title-card-edit-form")
], he);
console.info(
  `%c  Expander-Card 
%c Version ${qc}`,
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
  Fc as default
};
//# sourceMappingURL=expander-card.js.map
