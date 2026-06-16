//#region node_modules/.pnpm/svelte@5.56.3_@typescript-eslint+types@8.61.1/node_modules/svelte/src/internal/disclose-version.js
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
//#endregion
//#region src/editortype.ts
var e = {
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
}, t = [
	"expanded",
	"icon",
	"arrow-color",
	"title",
	"style"
], n = /* @__PURE__ */ function(e) {
	return e.CSS = "css", e.Object = "object", e;
}({}), r = {
	name: "style",
	label: "CSS text",
	selector: { text: { multiline: !0 } }
}, i = {
	name: "style",
	label: "CSS structured object",
	selector: { object: {} }
}, a = { icon: {} }, o = { text: {} }, s = { boolean: {} }, c = (e) => ({ number: { unit_of_measurement: e } }), l = (e, t) => ({
	name: e,
	label: t,
	selector: a
}), u = (e, t) => ({
	name: e,
	label: t,
	selector: o
}), d = (e, t) => ({
	name: e,
	label: t,
	selector: s
}), f = (e, t, n) => ({
	name: e,
	label: t,
	selector: c(n)
}), p = [{
	type: "expandable",
	label: "Expander Card Settings",
	icon: "mdi:arrow-down-bold-box-outline",
	schema: [
		{ ...u("title", "Title") },
		{ ...l("icon", "Icon") },
		{
			type: "expandable",
			label: "Expander control",
			icon: "mdi:cog-outline",
			schema: [{
				type: "grid",
				schema: [
					{ ...d("expanded", "Start expanded") },
					{ ...d("animation", "Enable animation") },
					{
						name: "haptic",
						label: "Haptic feedback",
						selector: { select: {
							mode: "dropdown",
							options: [
								{
									value: "light",
									label: "Light"
								},
								{
									value: "medium",
									label: "Medium"
								},
								{
									value: "heavy",
									label: "Heavy"
								},
								{
									value: "success",
									label: "Success"
								},
								{
									value: "warning",
									label: "Warning"
								},
								{
									value: "failure",
									label: "Failure"
								},
								{
									value: "selection",
									label: "Selection"
								},
								{
									value: "none",
									label: "None"
								}
							]
						} }
					},
					{ ...f("min-width-expanded", "Min width expanded", "px") },
					{ ...f("max-width-expanded", "Max width expanded", "px") },
					{ ...u("storage-id", "Storage ID") },
					{ ...u("expander-card-id", "Expander card ID") }
				]
			}]
		},
		{
			type: "expandable",
			label: "Expander styling",
			icon: "mdi:palette-swatch",
			schema: [{
				type: "grid",
				schema: [
					{ ...u("arrow-color", "Icon color") },
					{ ...u("icon-rotate-degree", "Icon rotate degree") },
					{ ...u("header-color", "Header color") },
					{ ...u("button-background", "Button background color") },
					{ ...u("expander-card-background", "Background") },
					{ ...u("expander-card-background-expanded", "Background when expanded") },
					{ ...u("expander-card-display", "Expander card display") },
					{ ...d("clear", "Clear border and background") },
					{ ...u("gap", "Gap") },
					{ ...u("padding", "Padding") }
				]
			}]
		},
		{
			type: "expandable",
			label: "Card styling",
			icon: "mdi:palette-swatch-outline",
			schema: [{
				type: "grid",
				schema: [
					{ ...u("expanded-gap", "Card gap") },
					{ ...u("child-padding", "Card padding") },
					{ ...u("child-margin-top", "Card margin top") },
					{ ...d("clear-children", "Clear card border and background") }
				]
			}]
		},
		{
			type: "expandable",
			label: "Title card",
			icon: "mdi:subtitles-outline",
			schema: [{
				name: "title-card",
				label: "Title card",
				selector: { object: {
					label_field: "type",
					fields: {
						type: {
							label: "Card type",
							required: !0,
							selector: { text: {} }
						},
						expander_card_title_card_marker: {
							required: !1,
							selector: { text: {} }
						}
					}
				} }
			}, {
				type: "grid",
				schema: [
					{ ...d("title-card-clickable", "Make title card clickable to expand/collapse") },
					{ ...d("title-card-button-overlay", "Overlay expand button on title card") },
					{ ...u("overlay-margin", "Overlay margin") },
					{ ...u("title-card-padding", "Title card padding") }
				]
			}]
		},
		{
			type: "expandable",
			label: "User settings",
			icon: "mdi:account-multiple-outline",
			schema: [{
				type: "grid",
				schema: [{
					name: "show-button-users",
					label: "Show button users",
					selector: { select: {
						multiple: !0,
						mode: "dropdown",
						custom: !0,
						options: ["[[users]]"]
					} }
				}, {
					name: "start-expanded-users",
					label: "Start expanded users",
					selector: { select: {
						multiple: !0,
						mode: "dropdown",
						custom: !0,
						options: ["[[users]]"]
					} }
				}]
			}]
		},
		{
			type: "expandable",
			label: "Advanced styling",
			icon: "mdi:brush-outline",
			schema: ["[[style]]"]
		},
		{
			type: "expandable",
			label: "Advanced templates",
			icon: "mdi:code-brackets",
			schema: [{
				type: "expandable",
				label: "Variables",
				icon: "mdi:variable",
				schema: [{
					name: "variables",
					label: "Variables",
					selector: { object: {
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
					} }
				}]
			}, {
				type: "expandable",
				label: "Templates",
				icon: "mdi:code-brackets",
				schema: [{
					name: "templates",
					label: "Templates",
					selector: { object: {
						label_field: "template",
						multiple: !0,
						fields: {
							template: {
								label: "Config item",
								required: !0,
								selector: { select: {
									mode: "dropdown",
									custom_value: !0,
									sort: !0,
									options: ["[[templates]]"]
								} }
							},
							value_template: {
								label: "Value template",
								required: !0,
								selector: { template: {} }
							}
						}
					} }
				}]
			}]
		}
	]
}], m = (e, t) => new Promise((n) => {
	let r = t.cancel, i = t.submit;
	e.dispatchEvent(new CustomEvent("show-dialog", {
		detail: {
			dialogTag: "expander-card-title-card-edit-form",
			dialogImport: () => customElements.whenDefined("expander-card-title-card-edit-form"),
			dialogParams: {
				...t,
				cancel: () => {
					n(null), r && r();
				},
				submit: (e) => {
					n(e), i && i(e);
				}
			}
		},
		bubbles: !0,
		composed: !0
	}));
}), h = window, g = h.cardHelpers, _ = new Promise((e) => {
	g && e(), h.loadCardHelpers && h.loadCardHelpers().then((t) => {
		g = t, h.cardHelpers = g, e();
	});
});
async function v() {
	let e = document.querySelector("home-assistant")?.hass;
	if (e) return (await e.callWS({ type: "config/auth/list" })).filter((e) => !e.system_generated).map((e) => e.name);
}
var y = async () => {
	let a = await _.then(() => g.createCardElement({
		type: "vertical-stack",
		cards: []
	})), o = await customElements.whenDefined("hui-vertical-stack-card").then(() => a.constructor.getConfigElement()), s = await v();
	return class extends o.constructor {
		constructor() {
			super(), this.showDialogCallback = (e) => {
				e.detail?.dialogParams?.schema?.find((e) => e.name === "expander_card_title_card_marker") && (e.stopPropagation(), e.detail?.dialogImport && e.detail.dialogImport().then(async () => {
					let t = {
						title: "Title card",
						config: this._config["title-card"] || {},
						submit: e.detail?.dialogParams?.submit,
						cancel: e.detail?.dialogParams?.cancel,
						submitText: e.detail?.dialogParams?.submitText,
						cancelText: e.detail?.dialogParams?.cancelText,
						lovelace: this.lovelace
					};
					await m(this, t);
				}));
			}, this._computeLabelCallback = (e) => e.label ?? e.name ?? "", this._valueChanged = (t) => {
				let n = t.detail.value, r = Object.entries(e);
				for (let [e, t] of r) {
					if (typeof t == "object" && Array.isArray(t) && Array.isArray(n[e])) {
						JSON.stringify(n[e]) === JSON.stringify(t) && delete n[e];
						continue;
					}
					n[e] === t && delete n[e];
				}
				this._config = n, this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: this._config } }));
			}, this._users = s;
		}
		setConfig(e) {
			this._config = e;
		}
		get _schema() {
			let e = JSON.stringify(p), a = this._users.map((e) => e.replace(/\\/g, "\\\\").replace(/"/g, "\\\"")).join("\",\""), o = e.replace(/\[\[users\]\]/g, a);
			o = o.replace(/\[\[templates\]\]/g, t.filter((e) => !this._config.templates?.some((t) => t.template === e)).join("\",\""));
			let s = (this._config.style && typeof this._config.style == "object" ? n.Object : n.CSS) === n.CSS ? JSON.stringify(r) : JSON.stringify(i);
			return o = o.replace(/"\[\[style\]\]"/g, s), JSON.parse(o);
		}
		set _schema(e) {}
		connectedCallback() {
			super.connectedCallback(), this.addEventListener("show-dialog", this.showDialogCallback.bind(this), !0);
		}
		disconnectedCallback() {
			super.disconnectedCallback(), this.removeEventListener("show-dialog", this.showDialogCallback.bind(this), !0);
		}
	};
}, b = (async () => {
	for (; customElements.get("home-assistant") === void 0;) await new Promise((e) => h.setTimeout(e, 100));
	if (!customElements.get("expander-card-editor")) {
		let e = await y();
		customElements.define("expander-card-editor", e);
	}
}), x = {}, S = Symbol("uninitialized"), ee = "http://www.w3.org/1999/xhtml", te = "http://www.w3.org/2000/svg", ne = "http://www.w3.org/1998/Math/MathML", re = Array.isArray, ie = Array.prototype.indexOf, ae = Array.prototype.includes, oe = Array.from, se = Object.keys, ce = Object.defineProperty, le = Object.getOwnPropertyDescriptor, ue = Object.getOwnPropertyDescriptors, de = Object.prototype, fe = Array.prototype, pe = Object.getPrototypeOf, me = Object.isExtensible, he = () => {};
function ge(e) {
	for (var t = 0; t < e.length; t++) e[t]();
}
function _e() {
	var e, t;
	return {
		promise: new Promise((n, r) => {
			e = n, t = r;
		}),
		resolve: e,
		reject: t
	};
}
var C = 1024, w = 2048, T = 4096, ve = 8192, ye = 16384, be = 32768, xe = 1 << 25, Se = 65536, Ce = 1 << 19, we = 1 << 20, Te = 1 << 25, Ee = 65536, De = 1 << 21, Oe = 1 << 22, ke = 1 << 23, Ae = Symbol("$state"), je = Symbol("legacy props"), Me = Symbol(""), Ne = Symbol("attributes"), Pe = Symbol("class"), Fe = Symbol("style"), Ie = Symbol("text"), Le = new class extends Error {
	name = "StaleReactionError";
	message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), Re = !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml");
function ze(e) {
	throw Error("https://svelte.dev/e/lifecycle_outside_component");
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.3_@typescript-eslint+types@8.61.1/node_modules/svelte/src/internal/client/errors.js
function Be() {
	throw Error("https://svelte.dev/e/async_derived_orphan");
}
function Ve(e, t, n) {
	throw Error("https://svelte.dev/e/each_key_duplicate");
}
function He(e) {
	throw Error("https://svelte.dev/e/effect_in_teardown");
}
function Ue() {
	throw Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function We(e) {
	throw Error("https://svelte.dev/e/effect_orphan");
}
function Ge() {
	throw Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Ke() {
	throw Error("https://svelte.dev/e/hydration_failed");
}
function qe(e) {
	throw Error("https://svelte.dev/e/props_invalid_value");
}
function Je() {
	throw Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Ye() {
	throw Error("https://svelte.dev/e/state_prototype_fixed");
}
function Xe() {
	throw Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Ze() {
	throw Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
function Qe() {
	console.warn("https://svelte.dev/e/derived_inert");
}
function $e(e) {
	console.warn("https://svelte.dev/e/hydration_mismatch");
}
function et() {
	console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.3_@typescript-eslint+types@8.61.1/node_modules/svelte/src/internal/client/dom/hydration.js
var E = !1;
function tt(e) {
	E = e;
}
var D;
function O(e) {
	if (e === null) throw $e(), x;
	return D = e;
}
function nt() {
	return O(/* @__PURE__ */ On(D));
}
function rt(e) {
	if (E) {
		if (/* @__PURE__ */ On(D) !== null) throw $e(), x;
		D = e;
	}
}
function it(e = 1) {
	if (E) {
		for (var t = e, n = D; t--;) n = /* @__PURE__ */ On(n);
		D = n;
	}
}
function at(e = !0) {
	for (var t = 0, n = D;;) {
		if (n.nodeType === 8) {
			var r = n.data;
			if (r === "]") {
				if (t === 0) return n;
				--t;
			} else (r === "[" || r === "[!" || r[0] === "[" && !isNaN(Number(r.slice(1)))) && (t += 1);
		}
		var i = /* @__PURE__ */ On(n);
		e && n.remove(), n = i;
	}
}
function ot(e) {
	if (!e || e.nodeType !== 8) throw $e(), x;
	return e.data;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.3_@typescript-eslint+types@8.61.1/node_modules/svelte/src/internal/client/reactivity/equality.js
function st(e) {
	return e === this.v;
}
function ct(e, t) {
	return e == e ? e !== t || typeof e == "object" && !!e || typeof e == "function" : t == t;
}
function lt(e) {
	return !ct(e, this.v);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.3_@typescript-eslint+types@8.61.1/node_modules/svelte/src/internal/flags/index.js
var ut = !1, dt = !1, k = null;
function ft(e) {
	k = e;
}
function pt(e, t = !1, n) {
	k = {
		p: k,
		i: !1,
		c: null,
		e: null,
		s: e,
		x: null,
		r: H,
		l: dt && !t ? {
			s: null,
			u: null,
			$: []
		} : null
	};
}
function mt(e) {
	var t = k, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) Un(r);
	}
	return e !== void 0 && (t.x = e), t.i = !0, k = t.p, e ?? {};
}
function ht() {
	return !dt || k !== null && k.l === null;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.3_@typescript-eslint+types@8.61.1/node_modules/svelte/src/internal/client/dom/task.js
var gt = [];
function _t() {
	var e = gt;
	gt = [], ge(e);
}
function vt(e) {
	if (gt.length === 0 && !Zt) {
		var t = gt;
		queueMicrotask(() => {
			t === gt && _t();
		});
	}
	gt.push(e);
}
function yt() {
	for (; gt.length > 0;) _t();
}
function bt(e) {
	var t = H;
	if (t === null) return B.f |= ke, e;
	if (!(t.f & 32768) && !(t.f & 4)) throw e;
	xt(e, t);
}
function xt(e, t) {
	if (!(t !== null && t.f & 16384)) {
		for (; t !== null;) {
			if (t.f & 128) {
				if (!(t.f & 32768)) throw e;
				try {
					t.b.error(e);
					return;
				} catch (t) {
					e = t;
				}
			}
			t = t.parent;
		}
		throw e;
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.3_@typescript-eslint+types@8.61.1/node_modules/svelte/src/internal/client/reactivity/status.js
var St = ~(w | T | C);
function A(e, t) {
	e.f = e.f & St | t;
}
function Ct(e) {
	e.f & 512 || e.deps === null ? A(e, C) : A(e, T);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.3_@typescript-eslint+types@8.61.1/node_modules/svelte/src/internal/client/reactivity/utils.js
function wt(e) {
	if (e !== null) for (let t of e) !(t.f & 2) || !(t.f & 65536) || (t.f ^= Ee, wt(t.deps));
}
function Tt(e, t, n) {
	e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), wt(e.deps), A(e, C);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.3_@typescript-eslint+types@8.61.1/node_modules/svelte/src/internal/client/reactivity/store.js
var Et = !1, Dt = !1;
function Ot(e) {
	var t = Dt;
	try {
		return Dt = !1, [e(), Dt];
	} finally {
		Dt = t;
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.3_@typescript-eslint+types@8.61.1/node_modules/svelte/src/reactivity/create-subscriber.js
function kt(e) {
	let t = 0, n = gn(0), r;
	return () => {
		Bn() && (q(n), Jn(() => (t === 0 && (r = J(() => e(() => bn(n)))), t += 1, () => {
			vt(() => {
				--t, t === 0 && (r?.(), r = void 0, bn(n));
			});
		})));
	};
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.3_@typescript-eslint+types@8.61.1/node_modules/svelte/src/internal/client/dom/blocks/boundary.js
var At = Se | Ce;
function jt(e, t, n, r) {
	new Mt(e, t, n, r);
}
var Mt = class {
	parent;
	is_pending = !1;
	transform_error;
	#e;
	#t = E ? D : null;
	#n;
	#r;
	#i;
	#a = null;
	#o = null;
	#s = null;
	#c = null;
	#l = 0;
	#u = 0;
	#d = !1;
	#f = /* @__PURE__ */ new Set();
	#p = /* @__PURE__ */ new Set();
	#m = null;
	#h = kt(() => (this.#m = gn(this.#l), () => {
		this.#m = null;
	}));
	constructor(e, t, n, r) {
		this.#e = e, this.#n = t, this.#r = (e) => {
			var t = H;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = H.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#i = Xn(() => {
			if (E) {
				let e = this.#t;
				nt();
				let t = e.data === "[!";
				if (e.data.startsWith("[?")) {
					let t = JSON.parse(e.data.slice(2));
					this.#_(t);
				} else t ? this.#v() : this.#g();
			} else this.#y();
		}, At), E && (this.#e = D);
	}
	#g() {
		try {
			this.#a = R(() => this.#r(this.#e));
		} catch (e) {
			this.error(e);
		}
	}
	#_(e) {
		let t = this.#n.failed;
		t && (this.#s = R(() => {
			t(this.#e, () => e, () => () => {});
		}));
	}
	#v() {
		let e = this.#n.pending;
		e && (this.is_pending = !0, this.#o = R(() => e(this.#e)), vt(() => {
			var e = this.#c = document.createDocumentFragment(), t = I();
			e.append(t), this.#a = this.#x(() => R(() => this.#r(t))), this.#u === 0 && (this.#e.before(e), this.#c = null, nr(this.#o, () => {
				this.#o = null;
			}), this.#b(j));
		}));
	}
	#y() {
		try {
			if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#l = 0, this.#a = R(() => {
				this.#r(this.#e);
			}), this.#u > 0) {
				var e = this.#c = document.createDocumentFragment();
				or(this.#a, e);
				let t = this.#n.pending;
				this.#o = R(() => t(this.#e));
			} else this.#b(j);
		} catch (e) {
			this.error(e);
		}
	}
	#b(e) {
		this.is_pending = !1, e.transfer_effects(this.#f, this.#p);
	}
	defer_effect(e) {
		Tt(e, this.#f, this.#p);
	}
	is_rendered() {
		return !this.is_pending && (!this.parent || this.parent.is_rendered());
	}
	has_pending_snippet() {
		return !!this.#n.pending;
	}
	#x(e) {
		var t = H, n = B, r = k;
		U(this.#i), V(this.#i), ft(this.#i.ctx);
		try {
			return rn.ensure(), e();
		} catch (e) {
			return bt(e), null;
		} finally {
			U(t), V(n), ft(r);
		}
	}
	#S(e, t) {
		if (!this.has_pending_snippet()) {
			this.parent && this.parent.#S(e, t);
			return;
		}
		this.#u += e, this.#u === 0 && (this.#b(t), this.#o && nr(this.#o, () => {
			this.#o = null;
		}), this.#c &&= (this.#e.before(this.#c), null));
	}
	update_pending_count(e, t) {
		this.#S(e, t), this.#l += e, !(!this.#m || this.#d) && (this.#d = !0, vt(() => {
			this.#d = !1, this.#m && vn(this.#m, this.#l);
		}));
	}
	get_effect_pending() {
		return this.#h(), q(this.#m);
	}
	error(e) {
		if (!this.#n.onerror && !this.#n.failed) throw e;
		j?.is_fork ? (this.#a && j.skip_effect(this.#a), this.#o && j.skip_effect(this.#o), this.#s && j.skip_effect(this.#s), j.oncommit(() => {
			this.#C(e);
		})) : this.#C(e);
	}
	#C(e) {
		this.#a &&= (z(this.#a), null), this.#o &&= (z(this.#o), null), this.#s &&= (z(this.#s), null), E && (O(this.#t), it(), O(at()));
		var t = this.#n.onerror;
		let n = this.#n.failed;
		var r = !1, i = !1;
		let a = () => {
			if (r) {
				et();
				return;
			}
			r = !0, i && Ze(), this.#s !== null && nr(this.#s, () => {
				this.#s = null;
			}), this.#x(() => {
				this.#y();
			});
		}, o = (e) => {
			try {
				i = !0, t?.(e, a), i = !1;
			} catch (e) {
				xt(e, this.#i && this.#i.parent);
			}
			n && (this.#s = this.#x(() => {
				try {
					return R(() => {
						var t = H;
						t.b = this, t.f |= 128, n(this.#e, () => e, () => a);
					});
				} catch (e) {
					return xt(e, this.#i.parent), null;
				}
			}));
		};
		vt(() => {
			var t;
			try {
				t = this.transform_error(e);
			} catch (e) {
				xt(e, this.#i && this.#i.parent);
				return;
			}
			typeof t == "object" && t && typeof t.then == "function" ? t.then(o, (e) => xt(e, this.#i && this.#i.parent)) : o(t);
		});
	}
};
//#endregion
//#region node_modules/.pnpm/svelte@5.56.3_@typescript-eslint+types@8.61.1/node_modules/svelte/src/internal/client/reactivity/async.js
function Nt(e, t, n, r) {
	let i = ht() ? Lt : Vt;
	var a = e.filter((e) => !e.settled), o = t.map(i);
	if (n.length === 0 && a.length === 0) {
		r(o);
		return;
	}
	var s = H, c = Pt(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
	function u(e) {
		if (!(s.f & 16384)) {
			c();
			try {
				r([...o, ...e]);
			} catch (e) {
				xt(e, s);
			}
			Ft();
		}
	}
	var d = It();
	if (n.length === 0) {
		l.then(() => u([])).finally(d);
		return;
	}
	function f() {
		Promise.all(n.map((e) => /* @__PURE__ */ zt(e))).then(u).catch((e) => xt(e, s)).finally(d);
	}
	l ? l.then(() => {
		c(), f(), Ft();
	}) : f();
}
function Pt() {
	var e = H, t = B, n = k, r = j;
	return function(i = !0) {
		U(e), V(t), ft(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function Ft(e = !0) {
	U(null), V(null), ft(null), e && j?.deactivate();
}
function It() {
	var e = H, t = e.b, n = j, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function Lt(e) {
	var t = 2 | w;
	return H !== null && (H.f |= Ce), {
		ctx: k,
		deps: null,
		effects: null,
		equals: st,
		f: t,
		fn: e,
		reactions: null,
		rv: 0,
		v: S,
		wv: 0,
		parent: H,
		ac: null
	};
}
var Rt = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function zt(e, t, n) {
	let r = H;
	r === null && Be();
	var i = void 0, a = gn(S), o = !B, s = /* @__PURE__ */ new Set();
	return qn(() => {
		var t = H, n = _e();
		i = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== Le && n.reject(e);
			}).finally(Ft);
		} catch (e) {
			n.reject(e), Ft();
		}
		var c = j;
		if (o) {
			if (t.f & 32768) var l = It();
			if (r.b?.is_rendered()) c.async_deriveds.get(t)?.reject(Rt);
			else for (let e of s.values()) e.reject(Rt);
			s.add(n), c.async_deriveds.set(t, n);
		}
		let u = (e, t = void 0) => {
			l?.(), s.delete(n), t !== Rt && (c.activate(), t ? (a.f |= ke, vn(a, t)) : (a.f & 8388608 && (a.f ^= ke), vn(a, e)), c.deactivate());
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), Vn(() => {
		for (let e of s) e.reject(Rt);
	}), new Promise((e) => {
		function t(n) {
			function r() {
				n === i ? e(a) : t(i);
			}
			n.then(r, r);
		}
		t(i);
	});
}
/*#__NO_SIDE_EFFECTS__*/
function Bt(e) {
	let t = /* @__PURE__ */ Lt(e);
	return ut || pr(t), t;
}
/*#__NO_SIDE_EFFECTS__*/
function Vt(e) {
	let t = /* @__PURE__ */ Lt(e);
	return t.equals = lt, t;
}
function Ht(e) {
	var t = e.effects;
	if (t !== null) {
		e.effects = null;
		for (var n = 0; n < t.length; n += 1) z(t[n]);
	}
}
function Ut(e) {
	var t, n = H, r = e.parent;
	if (!lr && r !== null && e.v !== S && r.f & 24576) return Qe(), e.v;
	U(r);
	try {
		e.f &= ~Ee, Ht(e), t = Sr(e);
	} finally {
		U(n);
	}
	return t;
}
function Wt(e) {
	var t = Ut(e);
	if (!e.equals(t) && (e.wv = yr(), (!j?.is_fork || e.deps === null) && (j === null ? e.v = t : (j.capture(e, t, !0), Yt?.capture(e, t, !0)), e.deps === null))) {
		A(e, C);
		return;
	}
	lr || (M === null ? Ct(e) : (Bn() || j?.is_fork) && M.set(e, t));
}
function Gt(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(Le), t.fn !== null && (t.teardown = he), t.ac = null, wr(t, 0), Qn(t));
}
function Kt(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && Tr(t);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.3_@typescript-eslint+types@8.61.1/node_modules/svelte/src/internal/client/reactivity/batch.js
var qt = null, Jt = null, j = null, Yt = null, M = null, Xt = null, Zt = !1, Qt = !1, $t = null, en = null, tn = 0, nn = 1, rn = class e {
	id = nn++;
	#e = !1;
	linked = !0;
	#t = null;
	#n = null;
	async_deriveds = /* @__PURE__ */ new Map();
	current = /* @__PURE__ */ new Map();
	previous = /* @__PURE__ */ new Map();
	#r = /* @__PURE__ */ new Set();
	#i = /* @__PURE__ */ new Set();
	#a = 0;
	#o = /* @__PURE__ */ new Map();
	#s = null;
	#c = [];
	#l = [];
	#u = /* @__PURE__ */ new Set();
	#d = /* @__PURE__ */ new Set();
	#f = /* @__PURE__ */ new Map();
	#p = /* @__PURE__ */ new Set();
	is_fork = !1;
	#m = !1;
	constructor() {
		Jt === null ? qt = Jt = this : (Jt.#n = this, this.#t = Jt), Jt = this;
	}
	#h() {
		if (this.is_fork) return !0;
		for (let n of this.#o.keys()) {
			for (var e = n, t = !1; e.parent !== null;) {
				if (this.#f.has(e)) {
					t = !0;
					break;
				}
				e = e.parent;
			}
			if (!t) return !0;
		}
		return !1;
	}
	skip_effect(e) {
		this.#f.has(e) || this.#f.set(e, {
			d: [],
			m: []
		}), this.#p.delete(e);
	}
	unskip_effect(e, t = (e) => this.schedule(e)) {
		var n = this.#f.get(e);
		if (n) {
			this.#f.delete(e);
			for (var r of n.d) A(r, w), t(r);
			for (r of n.m) A(r, T), t(r);
		}
		this.#p.add(e);
	}
	#g() {
		this.#e = !0, tn++ > 1e3 && (this.#S(), an());
		for (let e of this.#u) this.#d.delete(e), A(e, w), this.schedule(e);
		for (let e of this.#d) A(e, T), this.schedule(e);
		let t = this.#c;
		this.#c = [], this.apply();
		var n = $t = [], r = [], i = en = [];
		for (let e of t) try {
			this.#_(e, n, r);
		} catch (t) {
			throw fn(e), this.#h() || this.discard(), t;
		}
		if (j = null, i.length > 0) {
			var a = e.ensure();
			for (let e of i) a.schedule(e);
		}
		if ($t = null, en = null, this.#h()) {
			this.#b(r), this.#b(n);
			for (let [e, t] of this.#f) dn(e, t);
			i.length > 0 && j.#g();
			return;
		}
		let o = this.#v();
		if (o) {
			this.#b(r), this.#b(n), o.#y(this);
			return;
		}
		this.#u.clear(), this.#d.clear();
		for (let e of this.#r) e(this);
		this.#r.clear(), Yt = this, sn(r), sn(n), Yt = null, this.#s?.resolve();
		var s = j;
		if (this.#a === 0 && (this.#c.length === 0 || s !== null) && (this.#S(), ut && (this.#x(), j = s)), this.#c.length > 0) if (s !== null) {
			let e = s;
			e.#c.push(...this.#c.filter((t) => !e.#c.includes(t)));
		} else s = this;
		s !== null && s.#g();
	}
	#_(e, t, n) {
		e.f ^= C;
		for (var r = e.first; r !== null;) {
			var i = r.f, a = (i & 96) != 0;
			if (!(a && i & 1024 || i & 8192 || this.#f.has(r)) && r.fn !== null) {
				a ? r.f ^= C : i & 4 ? t.push(r) : ut && i & 16777224 ? n.push(r) : br(r) && (i & 16 && this.#d.add(r), Tr(r));
				var o = r.first;
				if (o !== null) {
					r = o;
					continue;
				}
			}
			for (; r !== null;) {
				var s = r.next;
				if (s !== null) {
					r = s;
					break;
				}
				r = r.parent;
			}
		}
	}
	#v() {
		for (var e = this.#t; e !== null;) {
			if (!e.is_fork) {
				for (let [t, [, n]] of this.current) if (e.current.has(t) && !n) return e;
			}
			e = e.#t;
		}
		return null;
	}
	#y(e) {
		for (let [t, n] of e.current) !this.previous.has(t) && e.previous.has(t) && this.previous.set(t, e.previous.get(t)), this.current.set(t, n);
		for (let [t, n] of e.async_deriveds) {
			let e = this.async_deriveds.get(t);
			e && n.promise.then(e.resolve).catch(e.reject);
		}
		e.async_deriveds.clear(), this.transfer_effects(e.#u, e.#d);
		let t = (e) => {
			var n = e.reactions;
			if (n !== null) for (let e of n) {
				var r = e.f;
				if (r & 2) t(e);
				else {
					var i = e;
					r & 4194320 && !this.async_deriveds.has(i) && (this.#d.delete(i), A(i, w), this.schedule(i));
				}
			}
		};
		for (let e of this.current.keys()) t(e);
		this.oncommit(() => e.discard()), e.#S(), j = this, this.#g();
	}
	#b(e) {
		for (var t = 0; t < e.length; t += 1) Tt(e[t], this.#u, this.#d);
	}
	capture(e, t, n = !1) {
		e.v !== S && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [t, n]), M?.set(e, t)), this.is_fork || (e.v = t);
	}
	activate() {
		j = this;
	}
	deactivate() {
		j = null, M = null;
	}
	flush() {
		try {
			Qt = !0, j = this, this.#g();
		} finally {
			tn = 0, Xt = null, $t = null, en = null, Qt = !1, j = null, M = null, mn.clear();
		}
	}
	discard() {
		for (let e of this.#i) e(this);
		this.#i.clear();
		for (let e of this.async_deriveds.values()) e.reject(Rt);
		this.#S(), this.#s?.resolve();
	}
	register_created_effect(e) {
		this.#l.push(e);
	}
	#x() {
		for (let u = qt; u !== null; u = u.#n) {
			var e = u.id < this.id, t = [];
			for (let [r, [i, a]] of this.current) {
				if (u.current.has(r)) {
					var n = u.current.get(r)[0];
					if (e && i !== n) u.current.set(r, [i, a]);
					else continue;
				}
				t.push(r);
			}
			if (e) for (let [e, t] of this.async_deriveds) {
				let n = u.async_deriveds.get(e);
				n && t.promise.then(n.resolve).catch(n.reject);
			}
			var r = [...u.current.keys()].filter((e) => !u.current.get(e)[1]);
			if (!(!u.#e || r.length === 0)) {
				var i = r.filter((e) => !this.current.has(e));
				if (i.length === 0) e && u.discard();
				else if (t.length > 0) {
					if (e) for (let e of this.#p) u.unskip_effect(e, (e) => {
						e.f & 4194320 ? u.schedule(e) : u.#b([e]);
					});
					u.activate();
					var a = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map();
					for (var s of t) cn(s, i, a, o);
					o = /* @__PURE__ */ new Map();
					var c = [...u.current].filter(([e, t]) => {
						let n = this.current.get(e);
						return n ? n[0] !== t[0] || n[1] !== t[1] : !0;
					}).map(([e]) => e);
					if (c.length > 0) for (let e of this.#l) !(e.f & 155648) && ln(e, c, o) && (e.f & 4194320 ? (A(e, w), u.schedule(e)) : u.#u.add(e));
					if (u.#c.length > 0 && !u.#m) {
						u.apply();
						for (var l of u.#c) u.#_(l, [], []);
						u.#c = [];
					}
					u.deactivate();
				}
			}
		}
	}
	increment(e, t) {
		if (this.#a += 1, e) {
			let e = this.#o.get(t) ?? 0;
			this.#o.set(t, e + 1);
		}
	}
	decrement(e, t) {
		if (--this.#a, e) {
			let e = this.#o.get(t) ?? 0;
			e === 1 ? this.#o.delete(t) : this.#o.set(t, e - 1);
		}
		this.#m || (this.#m = !0, vt(() => {
			this.#m = !1, this.linked && this.flush();
		}));
	}
	transfer_effects(e, t) {
		for (let t of e) this.#u.add(t);
		for (let e of t) this.#d.add(e);
		e.clear(), t.clear();
	}
	oncommit(e) {
		this.#r.add(e);
	}
	ondiscard(e) {
		this.#i.add(e);
	}
	settled() {
		return (this.#s ??= _e()).promise;
	}
	static ensure() {
		if (j === null) {
			let t = j = new e();
			!Qt && !Zt && vt(() => {
				t.#e || t.flush();
			});
		}
		return j;
	}
	apply() {
		if (!ut || !this.is_fork && this.#t === null && this.#n === null) {
			M = null;
			return;
		}
		M = /* @__PURE__ */ new Map();
		for (let [e, [t]] of this.current) M.set(e, t);
		for (let t = qt; t !== null; t = t.#n) if (!(t === this || t.is_fork)) {
			var e = !1;
			if (t.id < this.id) {
				for (let [n, [, r]] of t.current) if (!r && this.current.has(n)) {
					e = !0;
					break;
				}
			}
			if (!e) for (let [e, n] of t.previous) M.has(e) || M.set(e, n);
		}
	}
	schedule(e) {
		if (Xt = e, e.b?.is_pending && e.f & 16777228 && !(e.f & 32768)) {
			e.b.defer_effect(e);
			return;
		}
		for (var t = e; t.parent !== null;) {
			t = t.parent;
			var n = t.f;
			if ($t !== null && t === H && (ut || (B === null || !(B.f & 2)) && !Et)) return;
			if (n & 96) {
				if (!(n & 1024)) return;
				t.f ^= C;
			}
		}
		this.#c.push(t);
	}
	#S() {
		if (this.linked) {
			var e = this.#t, t = this.#n;
			e === null ? qt = t : e.#n = t, t === null ? Jt = e : t.#t = e, this.linked = !1;
		}
	}
};
function N(e) {
	var t = Zt;
	Zt = !0;
	try {
		var n;
		for (e && (j !== null && !j.is_fork && j.flush(), n = e());;) {
			if (yt(), j === null) return n;
			j.flush();
		}
	} finally {
		Zt = t;
	}
}
function an() {
	try {
		Ge();
	} catch (e) {
		xt(e, Xt);
	}
}
var on = null;
function sn(e) {
	var t = e.length;
	if (t !== 0) {
		for (var n = 0; n < t;) {
			var r = e[n++];
			if (!(r.f & 24576) && br(r) && (on = /* @__PURE__ */ new Set(), Tr(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && tr(r), on?.size > 0)) {
				mn.clear();
				for (let e of on) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) on.has(n) && (on.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || Tr(n);
					}
				}
				on.clear();
			}
		}
		on = null;
	}
}
function cn(e, t, n, r) {
	if (!n.has(e) && (n.add(e), e.reactions !== null)) for (let i of e.reactions) {
		let e = i.f;
		e & 2 ? cn(i, t, n, r) : e & 4194320 && !(e & 2048) && ln(i, t, r) && (A(i, w), un(i));
	}
}
function ln(e, t, n) {
	let r = n.get(e);
	if (r !== void 0) return r;
	if (e.deps !== null) for (let r of e.deps) {
		if (ae.call(t, r)) return !0;
		if (r.f & 2 && ln(r, t, n)) return n.set(r, !0), !0;
	}
	return n.set(e, !1), !1;
}
function un(e) {
	j.schedule(e);
}
function dn(e, t) {
	if (!(e.f & 32 && e.f & 1024)) {
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), A(e, C);
		for (var n = e.first; n !== null;) dn(n, t), n = n.next;
	}
}
function fn(e) {
	A(e, C);
	for (var t = e.first; t !== null;) fn(t), t = t.next;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.3_@typescript-eslint+types@8.61.1/node_modules/svelte/src/internal/client/reactivity/sources.js
var pn = /* @__PURE__ */ new Set(), mn = /* @__PURE__ */ new Map(), hn = !1;
function gn(e, t) {
	return {
		f: 0,
		v: e,
		reactions: null,
		equals: st,
		rv: 0,
		wv: 0
	};
}
/*#__NO_SIDE_EFFECTS__*/
function P(e, t) {
	let n = gn(e, t);
	return pr(n), n;
}
/*#__NO_SIDE_EFFECTS__*/
function _n(e, t = !1, n = !0) {
	let r = gn(e);
	return t || (r.equals = lt), dt && n && k !== null && k.l !== null && (k.l.s ??= []).push(r), r;
}
function F(e, t, n = !1) {
	return B !== null && (!dr || B.f & 131072) && ht() && B.f & 4325394 && (fr === null || !fr.has(e)) && Xe(), vn(e, n ? Sn(t) : t, en);
}
function vn(e, t, n = null) {
	if (!e.equals(t)) {
		mn.set(e, lr ? t : e.v);
		var r = rn.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && Ut(t), M === null && Ct(t);
		}
		e.wv = yr(), xn(e, w, n), ht() && H !== null && H.f & 1024 && !(H.f & 96) && (K === null ? mr([e]) : K.push(e)), !r.is_fork && pn.size > 0 && !hn && yn();
	}
	return t;
}
function yn() {
	hn = !1;
	for (let e of pn) {
		e.f & 1024 && A(e, T);
		let t;
		try {
			t = br(e);
		} catch {
			t = !0;
		}
		t && Tr(e);
	}
	pn.clear();
}
function bn(e) {
	F(e, e.v + 1);
}
function xn(e, t, n) {
	var r = e.reactions;
	if (r !== null) for (var i = ht(), a = r.length, o = 0; o < a; o++) {
		var s = r[o], c = s.f;
		if (!(!i && s === H)) {
			var l = (c & w) === 0;
			if (l && A(s, t), c & 131072) pn.add(s);
			else if (c & 2) {
				var u = s;
				M?.delete(u), c & 65536 || (c & 512 && (H === null || !(H.f & 2097152)) && (s.f |= Ee), xn(u, T, n));
			} else if (l) {
				var d = s;
				c & 16 && on !== null && on.add(d), n === null ? un(d) : n.push(d);
			}
		}
	}
}
function Sn(e) {
	if (typeof e != "object" || !e || Ae in e) return e;
	let t = pe(e);
	if (t !== de && t !== fe) return e;
	var n = /* @__PURE__ */ new Map(), r = re(e), i = /* @__PURE__ */ P(0), a = null, o = _r, s = (e) => {
		if (_r === o) return e();
		var t = B, n = _r;
		V(null), vr(o);
		var r = e();
		return V(t), vr(n), r;
	};
	return r && n.set("length", /* @__PURE__ */ P(e.length, a)), new Proxy(e, {
		defineProperty(e, t, r) {
			(!("value" in r) || r.configurable === !1 || r.enumerable === !1 || r.writable === !1) && Je();
			var i = n.get(t);
			return i === void 0 ? s(() => {
				var e = /* @__PURE__ */ P(r.value, a);
				return n.set(t, e), e;
			}) : F(i, r.value, !0), !0;
		},
		deleteProperty(e, t) {
			var r = n.get(t);
			if (r === void 0) {
				if (t in e) {
					let e = s(() => /* @__PURE__ */ P(S, a));
					n.set(t, e), bn(i);
				}
			} else F(r, S), bn(i);
			return !0;
		},
		get(t, r, i) {
			if (r === Ae) return e;
			var o = n.get(r), c = r in t;
			if (o === void 0 && (!c || le(t, r)?.writable) && (o = s(() => /* @__PURE__ */ P(Sn(c ? t[r] : S), a)), n.set(r, o)), o !== void 0) {
				var l = q(o);
				return l === S ? void 0 : l;
			}
			return Reflect.get(t, r, i);
		},
		getOwnPropertyDescriptor(e, t) {
			var r = Reflect.getOwnPropertyDescriptor(e, t);
			if (r && "value" in r) {
				var i = n.get(t);
				i && (r.value = q(i));
			} else if (r === void 0) {
				var a = n.get(t), o = a?.v;
				if (a !== void 0 && o !== S) return {
					enumerable: !0,
					configurable: !0,
					value: o,
					writable: !0
				};
			}
			return r;
		},
		has(e, t) {
			if (t === Ae) return !0;
			var r = n.get(t), i = r !== void 0 && r.v !== S || Reflect.has(e, t);
			return (r !== void 0 || H !== null && (!i || le(e, t)?.writable)) && (r === void 0 && (r = s(() => /* @__PURE__ */ P(i ? Sn(e[t]) : S, a)), n.set(t, r)), q(r) === S) ? !1 : i;
		},
		set(e, t, o, c) {
			var l = n.get(t), u = t in e;
			if (r && t === "length") for (var d = o; d < l.v; d += 1) {
				var f = n.get(d + "");
				f === void 0 ? d in e && (f = s(() => /* @__PURE__ */ P(S, a)), n.set(d + "", f)) : F(f, S);
			}
			if (l === void 0) (!u || le(e, t)?.writable) && (l = s(() => /* @__PURE__ */ P(void 0, a)), F(l, Sn(o)), n.set(t, l));
			else {
				u = l.v !== S;
				var p = s(() => Sn(o));
				F(l, p);
			}
			var m = Reflect.getOwnPropertyDescriptor(e, t);
			if (m?.set && m.set.call(c, o), !u) {
				if (r && typeof t == "string") {
					var h = n.get("length"), g = Number(t);
					Number.isInteger(g) && g >= h.v && F(h, g + 1);
				}
				bn(i);
			}
			return !0;
		},
		ownKeys(e) {
			q(i);
			var t = Reflect.ownKeys(e).filter((e) => {
				var t = n.get(e);
				return t === void 0 || t.v !== S;
			});
			for (var [r, a] of n) a.v !== S && !(r in e) && t.push(r);
			return t;
		},
		setPrototypeOf() {
			Ye();
		}
	});
}
new Set([
	"copyWithin",
	"fill",
	"pop",
	"push",
	"reverse",
	"shift",
	"sort",
	"splice",
	"unshift"
]);
var Cn, wn, Tn, En;
function Dn() {
	if (Cn === void 0) {
		Cn = window, wn = /Firefox/.test(navigator.userAgent);
		var e = Element.prototype, t = Node.prototype, n = Text.prototype;
		Tn = le(t, "firstChild").get, En = le(t, "nextSibling").get, me(e) && (e[Pe] = void 0, e[Ne] = null, e[Fe] = void 0, e.__e = void 0), me(n) && (n[Ie] = void 0);
	}
}
function I(e = "") {
	return document.createTextNode(e);
}
/*@__NO_SIDE_EFFECTS__*/
function L(e) {
	return Tn.call(e);
}
/*@__NO_SIDE_EFFECTS__*/
function On(e) {
	return En.call(e);
}
function kn(e, t) {
	if (!E) return /* @__PURE__ */ L(e);
	var n = /* @__PURE__ */ L(D);
	if (n === null) n = D.appendChild(I());
	else if (t && n.nodeType !== 3) {
		var r = I();
		return n?.before(r), O(r), r;
	}
	return t && Fn(n), O(n), n;
}
function An(e, t = !1) {
	if (!E) {
		var n = /* @__PURE__ */ L(e);
		return n instanceof Comment && n.data === "" ? /* @__PURE__ */ On(n) : n;
	}
	if (t) {
		if (D?.nodeType !== 3) {
			var r = I();
			return D?.before(r), O(r), r;
		}
		Fn(D);
	}
	return D;
}
function jn(e, t = 1, n = !1) {
	let r = E ? D : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ On(r);
	if (!E) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = I();
			return r === null ? i?.after(a) : r.before(a), O(a), a;
		}
		Fn(r);
	}
	return O(r), r;
}
function Mn(e) {
	e.textContent = "";
}
function Nn() {
	return !ut || on !== null ? !1 : (H.f & be) !== 0;
}
function Pn(e, t, n) {
	return t == null || t === "http://www.w3.org/1999/xhtml" ? n ? document.createElement(e, { is: n }) : document.createElement(e) : n ? document.createElementNS(t, e, { is: n }) : document.createElementNS(t, e);
}
function Fn(e) {
	if (e.nodeValue.length < 65536) return;
	let t = e.nextSibling;
	for (; t !== null && t.nodeType === 3;) t.remove(), e.nodeValue += t.nodeValue, t = e.nextSibling;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.3_@typescript-eslint+types@8.61.1/node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function In(e) {
	var t = B, n = H;
	V(null), U(null);
	try {
		return e();
	} finally {
		V(t), U(n);
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.3_@typescript-eslint+types@8.61.1/node_modules/svelte/src/internal/client/reactivity/effects.js
function Ln(e) {
	H === null && (B === null && We(e), Ue()), lr && He(e);
}
function Rn(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function zn(e, t) {
	var n = H;
	n !== null && n.f & 8192 && (e |= ve);
	var r = {
		ctx: k,
		deps: null,
		nodes: null,
		f: e | w | 512,
		first: null,
		fn: t,
		last: null,
		next: null,
		parent: n,
		b: n && n.b,
		prev: null,
		teardown: null,
		wv: 0,
		ac: null
	};
	j?.register_created_effect(r);
	var i = r;
	if (e & 4) $t === null ? rn.ensure().schedule(r) : $t.push(r);
	else if (t !== null) {
		try {
			Tr(r);
		} catch (e) {
			throw z(r), e;
		}
		i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && !(i.f & 524288) && (i = i.first, e & 16 && e & 65536 && i !== null && (i.f |= Se));
	}
	if (i !== null && (i.parent = n, n !== null && Rn(i, n), B !== null && B.f & 2 && !(e & 64))) {
		var a = B;
		(a.effects ??= []).push(i);
	}
	return r;
}
function Bn() {
	return B !== null && !dr;
}
function Vn(e) {
	let t = zn(8, null);
	return A(t, C), t.teardown = e, t;
}
function Hn(e) {
	Ln("$effect");
	var t = H.f;
	if (!B && t & 32 && k !== null && !k.i) {
		var n = k;
		(n.e ??= []).push(e);
	} else return Un(e);
}
function Un(e) {
	return zn(4 | we, e);
}
function Wn(e) {
	rn.ensure();
	let t = zn(64 | Ce, e);
	return () => {
		z(t);
	};
}
function Gn(e) {
	rn.ensure();
	let t = zn(64 | Ce, e);
	return (e = {}) => new Promise((n) => {
		e.outro ? nr(t, () => {
			z(t), n(void 0);
		}) : (z(t), n(void 0));
	});
}
function Kn(e) {
	return zn(4, e);
}
function qn(e) {
	return zn(Oe | Ce, e);
}
function Jn(e, t = 0) {
	return zn(8 | t, e);
}
function Yn(e, t = [], n = [], r = []) {
	Nt(r, t, n, (t) => {
		zn(8, () => {
			e(...t.map(q));
		});
	});
}
function Xn(e, t = 0) {
	return zn(16 | t, e);
}
function R(e) {
	return zn(32 | Ce, e);
}
function Zn(e) {
	var t = e.teardown;
	if (t !== null) {
		let e = lr, n = B;
		ur(!0), V(null);
		try {
			t.call(null);
		} finally {
			ur(e), V(n);
		}
	}
}
function Qn(e, t = !1) {
	var n = e.first;
	for (e.first = e.last = null; n !== null;) {
		let e = n.ac;
		e !== null && In(() => {
			e.abort(Le);
		});
		var r = n.next;
		n.f & 64 ? n.parent = null : z(n, t), n = r;
	}
}
function $n(e) {
	for (var t = e.first; t !== null;) {
		var n = t.next;
		t.f & 32 || z(t), t = n;
	}
}
function z(e, t = !0) {
	var n = !1;
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (er(e.nodes.start, e.nodes.end), n = !0), e.f |= xe, Qn(e, t && !n), wr(e, 0);
	var r = e.nodes && e.nodes.t;
	if (r !== null) for (let e of r) e.stop();
	Zn(e), e.f ^= xe, e.f |= ye;
	var i = e.parent;
	i !== null && i.first !== null && tr(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function er(e, t) {
	for (; e !== null;) {
		var n = e === t ? null : /* @__PURE__ */ On(e);
		e.remove(), e = n;
	}
}
function tr(e) {
	var t = e.parent, n = e.prev, r = e.next;
	n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function nr(e, t, n = !0) {
	var r = [];
	rr(e, r, !0);
	var i = () => {
		n && z(e), t && t();
	}, a = r.length;
	if (a > 0) {
		var o = () => --a || i();
		for (var s of r) s.out(o);
	} else i();
}
function rr(e, t, n) {
	if (!(e.f & 8192)) {
		e.f ^= ve;
		var r = e.nodes && e.nodes.t;
		if (r !== null) for (let e of r) (e.is_global || n) && t.push(e);
		for (var i = e.first; i !== null;) {
			var a = i.next;
			if (!(i.f & 64)) {
				var o = (i.f & 65536) != 0 || (i.f & 32) != 0 && (e.f & 16) != 0;
				rr(i, t, o ? n : !1);
			}
			i = a;
		}
	}
}
function ir(e) {
	ar(e, !0);
}
function ar(e, t) {
	if (e.f & 8192) {
		e.f ^= ve, e.f & 1024 || (A(e, w), rn.ensure().schedule(e));
		for (var n = e.first; n !== null;) {
			var r = n.next, i = (n.f & 65536) != 0 || (n.f & 32) != 0;
			ar(n, i ? t : !1), n = r;
		}
		var a = e.nodes && e.nodes.t;
		if (a !== null) for (let e of a) (e.is_global || t) && e.in();
	}
}
function or(e, t) {
	if (e.nodes) for (var n = e.nodes.start, r = e.nodes.end; n !== null;) {
		var i = n === r ? null : /* @__PURE__ */ On(n);
		t.append(n), n = i;
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.3_@typescript-eslint+types@8.61.1/node_modules/svelte/src/internal/client/legacy.js
var sr = null, cr = !1, lr = !1;
function ur(e) {
	lr = e;
}
var B = null, dr = !1;
function V(e) {
	B = e;
}
var H = null;
function U(e) {
	H = e;
}
var fr = null;
function pr(e) {
	B !== null && (!ut || B.f & 2) && (fr ??= /* @__PURE__ */ new Set()).add(e);
}
var W = null, G = 0, K = null;
function mr(e) {
	K = e;
}
var hr = 1, gr = 0, _r = gr;
function vr(e) {
	_r = e;
}
function yr() {
	return ++hr;
}
function br(e) {
	var t = e.f;
	if (t & 2048) return !0;
	if (t & 2 && (e.f &= ~Ee), t & 4096) {
		for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
			var a = n[i];
			if (br(a) && Wt(a), a.wv > e.wv) return !0;
		}
		t & 512 && M === null && A(e, C);
	}
	return !1;
}
function xr(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(!ut && fr !== null && fr.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? xr(a, t, !1) : t === a && (n ? A(a, w) : a.f & 1024 && A(a, T), un(a));
	}
}
function Sr(e) {
	var t = W, n = G, r = K, i = B, a = fr, o = k, s = dr, c = _r, l = e.f;
	W = null, G = 0, K = null, B = l & 96 ? null : e, fr = null, ft(e.ctx), dr = !1, _r = ++gr, e.ac !== null && (In(() => {
		e.ac.abort(Le);
	}), e.ac = null);
	try {
		e.f |= De;
		var u = e.fn, d = u();
		e.f |= be;
		var f = e.deps, p = j?.is_fork;
		if (W !== null) {
			var m;
			if (p || wr(e, G), f !== null && G > 0) for (f.length = G + W.length, m = 0; m < W.length; m++) f[G + m] = W[m];
			else e.deps = f = W;
			if (Bn() && e.f & 512) for (m = G; m < f.length; m++) (f[m].reactions ??= []).push(e);
		} else !p && f !== null && G < f.length && (wr(e, G), f.length = G);
		if (ht() && K !== null && !dr && f !== null && !(e.f & 6146)) for (m = 0; m < K.length; m++) xr(K[m], e);
		if (i !== null && i !== e) {
			if (gr++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = gr;
			if (t !== null) for (let e of t) e.rv = gr;
			K !== null && (r === null ? r = K : r.push(...K));
		}
		return e.f & 8388608 && (e.f ^= ke), d;
	} catch (e) {
		return bt(e);
	} finally {
		e.f ^= De, W = t, G = n, K = r, B = i, fr = a, ft(o), dr = s, _r = c;
	}
}
function Cr(e, t) {
	let n = t.reactions;
	if (n !== null) {
		var r = ie.call(n, e);
		if (r !== -1) {
			var i = n.length - 1;
			i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
		}
	}
	if (n === null && t.f & 2 && (W === null || !ae.call(W, t))) {
		var a = t;
		a.f & 512 && (a.f ^= 512, a.f &= ~Ee), a.v !== S && Ct(a), Gt(a), wr(a, 0);
	}
}
function wr(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) Cr(e, n[r]);
}
function Tr(e) {
	var t = e.f;
	if (!(t & 16384)) {
		A(e, C);
		var n = H, r = cr;
		H = e, cr = !0;
		try {
			t & 16777232 ? $n(e) : Qn(e), Zn(e);
			var i = Sr(e);
			e.teardown = typeof i == "function" ? i : null, e.wv = hr;
		} finally {
			cr = r, H = n;
		}
	}
}
function q(e) {
	var t = (e.f & 2) != 0;
	if (sr?.add(e), B !== null && !dr && !(H !== null && H.f & 16384) && (fr === null || !fr.has(e))) {
		var n = B.deps;
		if (B.f & 2097152) e.rv < gr && (e.rv = gr, W === null && n !== null && n[G] === e ? G++ : W === null ? W = [e] : W.push(e));
		else {
			B.deps ??= [], ae.call(B.deps, e) || B.deps.push(e);
			var r = e.reactions;
			r === null ? e.reactions = [B] : ae.call(r, B) || r.push(B);
		}
	}
	if (lr && mn.has(e)) return mn.get(e);
	if (t) {
		var i = e;
		if (lr) {
			var a = i.v;
			return (!(i.f & 1024) && i.reactions !== null || Dr(i)) && (a = Ut(i)), mn.set(i, a), a;
		}
		var o = (i.f & 512) == 0 && !dr && B !== null && (cr || (B.f & 512) != 0), s = (i.f & be) === 0;
		br(i) && (o && (i.f |= 512), Wt(i)), o && !s && (Kt(i), Er(i));
	}
	if (M?.has(e)) return M.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function Er(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (Kt(t), Er(t));
}
function Dr(e) {
	if (e.v === S) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (mn.has(t) || t.f & 2 && Dr(t)) return !0;
	return !1;
}
function J(e) {
	var t = dr;
	try {
		return dr = !0, e();
	} finally {
		dr = t;
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.3_@typescript-eslint+types@8.61.1/node_modules/svelte/src/internal/client/dom/elements/events.js
var Or = Symbol("events"), kr = /* @__PURE__ */ new Set(), Ar = /* @__PURE__ */ new Set();
function jr(e, t, n) {
	(t[Or] ??= {})[e] = n;
}
function Mr(e) {
	for (var t = 0; t < e.length; t++) kr.add(e[t]);
	for (var n of Ar) n(e);
}
var Nr = null;
function Pr(e) {
	var t = this, n = t.ownerDocument, r = e.type, i = e.composedPath?.() || [], a = i[0] || e.target;
	Nr = e;
	var o = 0, s = Nr === e && e[Or];
	if (s) {
		var c = i.indexOf(s);
		if (c !== -1 && (t === document || t === window)) {
			e[Or] = t;
			return;
		}
		var l = i.indexOf(t);
		if (l === -1) return;
		c <= l && (o = c);
	}
	if (a = i[o] || e.target, a !== t) {
		ce(e, "currentTarget", {
			configurable: !0,
			get() {
				return a || n;
			}
		});
		var u = B, d = H;
		V(null), U(null);
		try {
			for (var f, p = []; a !== null && a !== t;) {
				try {
					var m = a[Or]?.[r];
					m != null && (!a.disabled || e.target === a) && m.call(a, e);
				} catch (e) {
					f ? p.push(e) : f = e;
				}
				if (e.cancelBubble) break;
				o++, a = o < i.length ? i[o] : null;
			}
			if (f) {
				for (let e of p) queueMicrotask(() => {
					throw e;
				});
				throw f;
			}
		} finally {
			e[Or] = t, delete e.currentTarget, V(u), U(d);
		}
	}
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.3_@typescript-eslint+types@8.61.1/node_modules/svelte/src/internal/client/dom/reconciler.js
var Fr = globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", { createHTML: (e) => e });
function Ir(e) {
	return Fr?.createHTML(e) ?? e;
}
function Lr(e) {
	var t = Pn("template");
	return t.innerHTML = Ir(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.3_@typescript-eslint+types@8.61.1/node_modules/svelte/src/internal/client/dom/template.js
function Rr(e, t) {
	var n = H;
	n.nodes === null && (n.nodes = {
		start: e,
		end: t,
		a: null,
		t: null
	});
}
/*#__NO_SIDE_EFFECTS__*/
function zr(e, t) {
	var n = (t & 1) != 0, r = (t & 2) != 0, i, a = !e.startsWith("<!>");
	return () => {
		if (E) return Rr(D, null), D;
		i === void 0 && (i = Lr(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ L(i)));
		var t = r || wn ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ L(t), s = t.lastChild;
			Rr(o, s);
		} else Rr(t, t);
		return t;
	};
}
function Br() {
	if (E) return Rr(D, null), D;
	var e = document.createDocumentFragment(), t = document.createComment(""), n = I();
	return e.append(t, n), Rr(t, n), e;
}
function Y(e, t) {
	if (E) {
		var n = H;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = D), nt();
		return;
	}
	e !== null && e.before(t);
}
[.../* @__PURE__ */ "allowfullscreen.async.autofocus.autoplay.checked.controls.default.disabled.formnovalidate.indeterminate.inert.ismap.loop.multiple.muted.nomodule.novalidate.open.playsinline.readonly.required.reversed.seamless.selected.webkitdirectory.defer.disablepictureinpicture.disableremoteplayback".split(".")];
var Vr = ["touchstart", "touchmove"];
function Hr(e) {
	return Vr.includes(e);
}
function Ur(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[Ie] ??= e.nodeValue) && (e[Ie] = n, e.nodeValue = `${n}`);
}
function Wr(e, t) {
	return qr(e, t);
}
function Gr(e, t) {
	Dn(), t.intro = t.intro ?? !1;
	let n = t.target, r = E, i = D;
	try {
		for (var a = /* @__PURE__ */ L(n); a && (a.nodeType !== 8 || a.data !== "[");) a = /* @__PURE__ */ On(a);
		if (!a) throw x;
		tt(!0), O(a);
		let r = qr(e, {
			...t,
			anchor: a
		});
		return tt(!1), r;
	} catch (r) {
		if (r instanceof Error && r.message.split("\n").some((e) => e.startsWith("https://svelte.dev/e/"))) throw r;
		return r !== x && console.warn("Failed to hydrate: ", r), t.recover === !1 && Ke(), Dn(), Mn(n), tt(!1), Wr(e, t);
	} finally {
		tt(r), O(i);
	}
}
var Kr = /* @__PURE__ */ new Map();
function qr(e, { target: t, anchor: n, props: r = {}, events: i, context: a, intro: o = !0, transformError: s }) {
	Dn();
	var c = void 0, l = Gn(() => {
		var o = n ?? t.appendChild(I());
		jt(o, { pending: () => {} }, (t) => {
			pt({});
			var n = k;
			if (a && (n.c = a), i && (r.$$events = i), E && Rr(t, null), c = e(t, r) || {}, E && (H.nodes.end = D, D === null || D.nodeType !== 8 || D.data !== "]")) throw $e(), x;
			mt();
		}, s);
		var l = /* @__PURE__ */ new Set(), u = (e) => {
			for (var n = 0; n < e.length; n++) {
				var r = e[n];
				if (!l.has(r)) {
					l.add(r);
					var i = Hr(r);
					for (let e of [t, document]) {
						var a = Kr.get(e);
						a === void 0 && (a = /* @__PURE__ */ new Map(), Kr.set(e, a));
						var o = a.get(r);
						o === void 0 ? (e.addEventListener(r, Pr, { passive: i }), a.set(r, 1)) : a.set(r, o + 1);
					}
				}
			}
		};
		return u(oe(kr)), Ar.add(u), () => {
			for (var e of l) for (let n of [t, document]) {
				var r = Kr.get(n), i = r.get(e);
				--i == 0 ? (n.removeEventListener(e, Pr), r.delete(e), r.size === 0 && Kr.delete(n)) : r.set(e, i);
			}
			Ar.delete(u), o !== n && o.parentNode?.removeChild(o);
		};
	});
	return Jr.set(c, l), c;
}
var Jr = /* @__PURE__ */ new WeakMap();
function Yr(e, t) {
	let n = Jr.get(e);
	return n ? (Jr.delete(e), n(t)) : Promise.resolve();
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.3_@typescript-eslint+types@8.61.1/node_modules/svelte/src/internal/client/dom/blocks/branches.js
var Xr = class {
	anchor;
	#e = /* @__PURE__ */ new Map();
	#t = /* @__PURE__ */ new Map();
	#n = /* @__PURE__ */ new Map();
	#r = /* @__PURE__ */ new Set();
	#i = !0;
	constructor(e, t = !0) {
		this.anchor = e, this.#i = t;
	}
	#a = (e) => {
		if (this.#e.has(e)) {
			var t = this.#e.get(e), n = this.#t.get(t);
			if (n) ir(n), this.#r.delete(t);
			else {
				var r = this.#n.get(t);
				r && (ir(r.effect), this.#t.set(t, r.effect), this.#n.delete(t), r.fragment.lastChild.remove(), this.anchor.before(r.fragment), n = r.effect);
			}
			for (let [t, n] of this.#e) {
				if (this.#e.delete(t), t === e) break;
				let r = this.#n.get(n);
				r && (z(r.effect), this.#n.delete(n));
			}
			for (let [e, r] of this.#t) {
				if (e === t || this.#r.has(e)) continue;
				let i = () => {
					if (Array.from(this.#e.values()).includes(e)) {
						var t = document.createDocumentFragment();
						or(r, t), t.append(I()), this.#n.set(e, {
							effect: r,
							fragment: t
						});
					} else z(r);
					this.#r.delete(e), this.#t.delete(e);
				};
				this.#i || !n ? (this.#r.add(e), nr(r, i, !1)) : i();
			}
		}
	};
	#o = (e) => {
		this.#e.delete(e);
		let t = Array.from(this.#e.values());
		for (let [e, n] of this.#n) t.includes(e) || (z(n.effect), this.#n.delete(e));
	};
	ensure(e, t) {
		var n = j, r = Nn();
		if (t && !this.#t.has(e) && !this.#n.has(e)) if (r) {
			var i = document.createDocumentFragment(), a = I();
			i.append(a), this.#n.set(e, {
				effect: R(() => t(a)),
				fragment: i
			});
		} else this.#t.set(e, R(() => t(this.anchor)));
		if (this.#e.set(n, e), r) {
			for (let [t, r] of this.#t) t === e ? n.unskip_effect(r) : n.skip_effect(r);
			for (let [t, r] of this.#n) t === e ? n.unskip_effect(r.effect) : n.skip_effect(r.effect);
			n.oncommit(this.#a), n.ondiscard(this.#o);
		} else E && (this.anchor = D), this.#a(n);
	}
};
function Zr(e) {
	k === null && ze("onMount"), dt && k.l !== null ? Qr(k).m.push(e) : Hn(() => {
		let t = J(e);
		if (typeof t == "function") return t;
	});
}
function Qr(e) {
	var t = e.l;
	return t.u ??= {
		a: [],
		b: [],
		m: []
	};
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.3_@typescript-eslint+types@8.61.1/node_modules/svelte/src/internal/client/dom/blocks/if.js
function $r(e, t, n = !1) {
	var r;
	E && (r = D, nt());
	var i = new Xr(e), a = n ? Se : 0;
	function o(e, t) {
		if (E) {
			var n = ot(r);
			if (e !== parseInt(n.substring(1))) {
				var a = at();
				O(a), i.anchor = a, tt(!1), i.ensure(e, t), tt(!0);
				return;
			}
		}
		i.ensure(e, t);
	}
	Xn(() => {
		var e = !1;
		t((t, n = 0) => {
			e = !0, o(n, t);
		}), e || o(-1, null);
	}, a);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.3_@typescript-eslint+types@8.61.1/node_modules/svelte/src/internal/client/dom/blocks/each.js
function ei(e, t, n) {
	for (var r = [], i = t.length, a, o = t.length, s = 0; s < i; s++) {
		let n = t[s];
		nr(n, () => {
			if (a) {
				if (a.pending.delete(n), a.done.add(n), a.pending.size === 0) {
					var t = e.outrogroups;
					ti(e, oe(a.done)), t.delete(a), t.size === 0 && (e.outrogroups = null);
				}
			} else --o;
		}, !1);
	}
	if (o === 0) {
		var c = r.length === 0 && n !== null;
		if (c) {
			var l = n, u = l.parentNode;
			Mn(u), u.append(l), e.items.clear();
		}
		ti(e, t, !c);
	} else a = {
		pending: new Set(t),
		done: /* @__PURE__ */ new Set()
	}, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(a);
}
function ti(e, t, n = !0) {
	var r;
	if (e.pending.size > 0) {
		r = /* @__PURE__ */ new Set();
		for (let t of e.pending.values()) for (let n of t) r.add(e.items.get(n).e);
	}
	for (var i = 0; i < t.length; i++) {
		var a = t[i];
		r?.has(a) ? (a.f |= Te, or(a, document.createDocumentFragment())) : z(t[i], n);
	}
}
var ni;
function ri(e, t, n, r, i, a = null) {
	var o = e, s = /* @__PURE__ */ new Map();
	if (t & 4) {
		var c = e;
		o = E ? O(/* @__PURE__ */ L(c)) : c.appendChild(I());
	}
	E && nt();
	var l = null, u = /* @__PURE__ */ Vt(() => {
		var e = n();
		return re(e) ? e : e == null ? [] : oe(e);
	}), d, f = /* @__PURE__ */ new Map(), p = !0;
	function m(e) {
		g.effect.f & 16384 || (g.pending.delete(e), g.fallback = l, ai(g, d, o, t, r), l !== null && (d.length === 0 ? l.f & 33554432 ? (l.f ^= Te, si(l, null, o)) : ir(l) : nr(l, () => {
			l = null;
		})));
	}
	function h(e) {
		g.pending.delete(e);
	}
	var g = {
		effect: Xn(() => {
			d = q(u);
			var e = d.length;
			let c = !1;
			E && ot(o) === "[!" != (e === 0) && (o = at(), O(o), tt(!1), c = !0);
			for (var g = /* @__PURE__ */ new Set(), _ = j, v = Nn(), y = 0; y < e; y += 1) {
				E && D.nodeType === 8 && D.data === "]" && (o = D, c = !0, tt(!1));
				var b = d[y], x = r(b, y), S = p ? null : s.get(x);
				S ? (S.v && vn(S.v, b), S.i && vn(S.i, y), v && _.unskip_effect(S.e)) : (S = oi(s, p ? o : ni ??= I(), b, x, y, i, t, n), p || (S.e.f |= Te), s.set(x, S)), g.add(x);
			}
			if (e === 0 && a && !l && (p ? l = R(() => a(o)) : (l = R(() => a(ni ??= I())), l.f |= Te)), e > g.size && Ve("", "", ""), E && e > 0 && O(at()), !p) if (f.set(_, g), v) {
				for (let [e, t] of s) g.has(e) || _.skip_effect(t.e);
				_.oncommit(m), _.ondiscard(h);
			} else m(_);
			c && tt(!0), q(u);
		}),
		flags: t,
		items: s,
		pending: f,
		outrogroups: null,
		fallback: l
	};
	p = !1, E && (o = D);
}
function ii(e) {
	for (; e !== null && !(e.f & 32);) e = e.next;
	return e;
}
function ai(e, t, n, r, i) {
	var a = (r & 8) != 0, o = t.length, s = e.items, c = ii(e.effect.first), l, u = null, d, f = [], p = [], m, h, g, _;
	if (a) for (_ = 0; _ < o; _ += 1) m = t[_], h = i(m, _), g = s.get(h).e, g.f & 33554432 || (g.nodes?.a?.measure(), (d ??= /* @__PURE__ */ new Set()).add(g));
	for (_ = 0; _ < o; _ += 1) {
		if (m = t[_], h = i(m, _), g = s.get(h).e, e.outrogroups !== null) for (let t of e.outrogroups) t.pending.delete(g), t.done.delete(g);
		if (g.f & 8192 && (ir(g), a && (g.nodes?.a?.unfix(), (d ??= /* @__PURE__ */ new Set()).delete(g))), g.f & 33554432) if (g.f ^= Te, g === c) si(g, null, n);
		else {
			var v = u ? u.next : c;
			g === e.effect.last && (e.effect.last = g.prev), g.prev && (g.prev.next = g.next), g.next && (g.next.prev = g.prev), ci(e, u, g), ci(e, g, v), si(g, v, n), u = g, f = [], p = [], c = ii(u.next);
			continue;
		}
		if (g !== c) {
			if (l !== void 0 && l.has(g)) {
				if (f.length < p.length) {
					var y = p[0], b;
					u = y.prev;
					var x = f[0], S = f[f.length - 1];
					for (b = 0; b < f.length; b += 1) si(f[b], y, n);
					for (b = 0; b < p.length; b += 1) l.delete(p[b]);
					ci(e, x.prev, S.next), ci(e, u, x), ci(e, S, y), c = y, u = S, --_, f = [], p = [];
				} else l.delete(g), si(g, c, n), ci(e, g.prev, g.next), ci(e, g, u === null ? e.effect.first : u.next), ci(e, u, g), u = g;
				continue;
			}
			for (f = [], p = []; c !== null && c !== g;) (l ??= /* @__PURE__ */ new Set()).add(c), p.push(c), c = ii(c.next);
			if (c === null) continue;
		}
		g.f & 33554432 || f.push(g), u = g, c = ii(g.next);
	}
	if (e.outrogroups !== null) {
		for (let t of e.outrogroups) t.pending.size === 0 && (ti(e, oe(t.done)), e.outrogroups?.delete(t));
		e.outrogroups.size === 0 && (e.outrogroups = null);
	}
	if (c !== null || l !== void 0) {
		var ee = [];
		if (l !== void 0) for (g of l) g.f & 8192 || ee.push(g);
		for (; c !== null;) !(c.f & 8192) && c !== e.fallback && ee.push(c), c = ii(c.next);
		var te = ee.length;
		if (te > 0) {
			var ne = r & 4 && o === 0 ? n : null;
			if (a) {
				for (_ = 0; _ < te; _ += 1) ee[_].nodes?.a?.measure();
				for (_ = 0; _ < te; _ += 1) ee[_].nodes?.a?.fix();
			}
			ei(e, ee, ne);
		}
	}
	a && vt(() => {
		if (d !== void 0) for (g of d) g.nodes?.a?.apply();
	});
}
function oi(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? gn(n) : /* @__PURE__ */ _n(n, !1, !1) : null, l = o & 2 ? gn(i) : null;
	return {
		v: c,
		i: l,
		e: R(() => (a(t, c ?? n, l ?? i, s), () => {
			e.delete(r);
		}))
	};
}
function si(e, t, n) {
	if (e.nodes) for (var r = e.nodes.start, i = e.nodes.end, a = t && !(t.f & 33554432) ? t.nodes.start : n; r !== null;) {
		var o = /* @__PURE__ */ On(r);
		if (a.before(r), r === i) return;
		r = o;
	}
}
function ci(e, t, n) {
	t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
function li(e, t, n = !1, r = !1, i = !1, a = !1) {
	var o = e, s = "";
	if (n) {
		var c = e;
		E && (o = O(/* @__PURE__ */ L(c)));
	}
	Yn(() => {
		var e = H;
		if (s === (s = t() ?? "")) {
			E && nt();
			return;
		}
		if (n && !E) {
			e.nodes = null, c.innerHTML = s, s !== "" && Rr(/* @__PURE__ */ L(c), c.lastChild);
			return;
		}
		if (e.nodes !== null && (er(e.nodes.start, e.nodes.end), e.nodes = null), s !== "") {
			if (E) {
				for (var a = D.data, l = nt(), u = l; l !== null && (l.nodeType !== 8 || l.data !== "");) u = l, l = /* @__PURE__ */ On(l);
				if (l === null) throw $e(), x;
				Rr(D, u), o = O(l);
				return;
			}
			var d = Pn(r ? "svg" : i ? "math" : "template", r ? te : i ? ne : void 0);
			d.innerHTML = s;
			var f = r || i ? d : d.content;
			if (Rr(/* @__PURE__ */ L(f), f.lastChild), r || i) for (; /* @__PURE__ */ L(f);) o.before(/* @__PURE__ */ L(f));
			else o.before(f);
		}
	});
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.3_@typescript-eslint+types@8.61.1/node_modules/svelte/src/internal/client/dom/css.js
function ui(e, t) {
	Kn(() => {
		var n = e.getRootNode(), r = n.host ? n : n.head ?? n.ownerDocument.head;
		if (!r.querySelector("#" + t.hash)) {
			let e = Pn("style");
			e.id = t.hash, e.textContent = t.code, r.appendChild(e);
		}
	});
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.3_@typescript-eslint+types@8.61.1/node_modules/svelte/src/internal/shared/attributes.js
var di = [..." 	\n\r\f\xA0\v﻿"];
function fi(e, t, n) {
	var r = e == null ? "" : "" + e;
	if (t && (r = r ? r + " " + t : t), n) {
		for (var i of Object.keys(n)) if (n[i]) r = r ? r + " " + i : i;
		else if (r.length) for (var a = i.length, o = 0; (o = r.indexOf(i, o)) >= 0;) {
			var s = o + a;
			(o === 0 || di.includes(r[o - 1])) && (s === r.length || di.includes(r[s])) ? r = (o === 0 ? "" : r.substring(0, o)) + r.substring(s + 1) : o = s;
		}
	}
	return r === "" ? null : r;
}
function pi(e, t = !1) {
	var n = t ? " !important;" : ";", r = "";
	for (var i of Object.keys(e)) {
		var a = e[i];
		a != null && a !== "" && (r += " " + i + ": " + a + n);
	}
	return r;
}
function mi(e) {
	return e[0] !== "-" || e[1] !== "-" ? e.toLowerCase() : e;
}
function hi(e, t) {
	if (t) {
		var n = "", r, i;
		if (Array.isArray(t) ? (r = t[0], i = t[1]) : r = t, e) {
			e = String(e).replaceAll(/\s*\/\*.*?\*\/\s*/g, "").trim();
			var a = !1, o = 0, s = !1, c = [];
			r && c.push(...Object.keys(r).map(mi)), i && c.push(...Object.keys(i).map(mi));
			var l = 0, u = -1;
			let t = e.length;
			for (var d = 0; d < t; d++) {
				var f = e[d];
				if (s ? f === "/" && e[d - 1] === "*" && (s = !1) : a ? a === f && (a = !1) : f === "/" && e[d + 1] === "*" ? s = !0 : f === "\"" || f === "'" ? a = f : f === "(" ? o++ : f === ")" && o--, !s && a === !1 && o === 0) {
					if (f === ":" && u === -1) u = d;
					else if (f === ";" || d === t - 1) {
						if (u !== -1) {
							var p = mi(e.substring(l, u).trim());
							if (!c.includes(p)) {
								f !== ";" && d++;
								var m = e.substring(l, d).trim();
								n += " " + m + ";";
							}
						}
						l = d + 1, u = -1;
					}
				}
			}
		}
		return r && (n += pi(r)), i && (n += pi(i, !0)), n = n.trim(), n === "" ? null : n;
	}
	return e == null ? null : String(e);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.3_@typescript-eslint+types@8.61.1/node_modules/svelte/src/internal/client/dom/elements/class.js
function gi(e, t, n, r, i, a) {
	var o = e[Pe];
	if (E || o !== n || o === void 0) {
		var s = fi(n, r, a);
		(!E || s !== e.getAttribute("class")) && (s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s)), e[Pe] = n;
	} else if (a && i !== a) for (var c in a) {
		var l = !!a[c];
		(i == null || l !== !!i[c]) && e.classList.toggle(c, l);
	}
	return a;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.3_@typescript-eslint+types@8.61.1/node_modules/svelte/src/internal/client/dom/elements/style.js
function _i(e, t = {}, n, r) {
	for (var i in n) {
		var a = n[i];
		t[i] !== a && (n[i] == null ? e.style.removeProperty(i) : e.style.setProperty(i, a, r));
	}
}
function vi(e, t, n, r) {
	var i = e[Fe];
	if (E || i !== t) {
		var a = hi(t, r);
		(!E || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e[Fe] = t;
	} else r && (Array.isArray(r) ? (_i(e, n?.[0], r[0]), _i(e, n?.[1], r[1], "important")) : _i(e, n, r));
	return r;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.3_@typescript-eslint+types@8.61.1/node_modules/svelte/src/internal/client/dom/elements/attributes.js
var yi = Symbol("is custom element"), bi = Symbol("is html"), xi = Re ? "link" : "LINK";
function Si(e, t, n, r) {
	var i = wi(e);
	E && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === xi) || i[t] !== (i[t] = n) && (t === "loading" && (e[Me] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && Ei(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function Ci(e, t, n) {
	var r = B, i = H;
	let a = E;
	E && tt(!1), V(null), U(null);
	try {
		t !== "style" && (Ti.has(e.getAttribute("is") || e.nodeName) || !customElements || customElements.get(e.getAttribute("is") || e.nodeName.toLowerCase()) ? Ei(e).includes(t) : n && typeof n == "object") ? e[t] = n : Si(e, t, n == null ? n : String(n));
	} finally {
		V(r), U(i), a && tt(!0);
	}
}
function wi(e) {
	return e[Ne] ??= {
		[yi]: e.nodeName.includes("-"),
		[bi]: e.namespaceURI === ee
	};
}
var Ti = /* @__PURE__ */ new Map();
function Ei(e) {
	var t = e.getAttribute("is") || e.nodeName, n = Ti.get(t);
	if (n) return n;
	Ti.set(t, n = []);
	for (var r, i = e, a = Element.prototype; a !== i;) {
		for (var o in r = ue(i), r) r[o].set && o !== "innerHTML" && o !== "textContent" && o !== "innerText" && n.push(o);
		i = pe(i);
	}
	return n;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.3_@typescript-eslint+types@8.61.1/node_modules/svelte/src/internal/client/dom/elements/bindings/this.js
function Di(e, t) {
	return e === t || e?.[Ae] === t;
}
function Oi(e = {}, t, n, r) {
	var i = k.r, a = H;
	return Kn(() => {
		var o, s;
		return Jn(() => {
			o = s, s = r?.() || [], J(() => {
				Di(n(...s), e) || (t(e, ...s), o && Di(n(...o), e) && t(null, ...o));
			});
		}), () => {
			let r = a;
			for (; r !== i && r.parent !== null && r.parent.f & 33554432;) r = r.parent;
			let o = () => {
				s && Di(n(...s), e) && t(null, ...s);
			}, c = r.teardown;
			r.teardown = () => {
				o(), c?.();
			};
		};
	}), e;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.3_@typescript-eslint+types@8.61.1/node_modules/svelte/src/internal/client/reactivity/props.js
function ki(e, t, n, r) {
	var i = !dt || (n & 2) != 0, a = (n & 8) != 0, o = (n & 16) != 0, s = r, c = !0, l = void 0, u = () => o && i ? (l ??= /* @__PURE__ */ Lt(r), q(l)) : (c && (c = !1, s = o ? J(r) : r), s);
	let d;
	if (a) {
		var f = Ae in e || je in e;
		d = le(e, t)?.set ?? (f && t in e ? (n) => e[t] = n : void 0);
	}
	var p, m = !1;
	a ? [p, m] = Ot(() => e[t]) : p = e[t], p === void 0 && r !== void 0 && (p = u(), d && (i && qe(t), d(p)));
	var h = i ? () => {
		var n = e[t];
		return n === void 0 ? u() : (c = !0, n);
	} : () => {
		var n = e[t];
		return n !== void 0 && (s = void 0), n === void 0 ? s : n;
	};
	if (i && !(n & 4)) return h;
	if (d) {
		var g = e.$$legacy;
		return (function(e, t) {
			return arguments.length > 0 ? ((!i || !t || g || m) && d(t ? h() : e), e) : h();
		});
	}
	var _ = !1, v = (n & 1 ? Lt : Vt)(() => (_ = !1, h()));
	a && q(v);
	var y = H;
	return (function(e, t) {
		if (arguments.length > 0) {
			let n = t ? q(v) : i && a ? Sn(e) : e;
			return F(v, n), _ = !0, s !== void 0 && (s = n), e;
		}
		return lr && _ || y.f & 16384 ? v.v : q(v);
	});
}
//#endregion
//#region node_modules/.pnpm/svelte@5.56.3_@typescript-eslint+types@8.61.1/node_modules/svelte/src/legacy/legacy-client.js
function Ai(e) {
	return new ji(e);
}
var ji = class {
	#e;
	#t;
	constructor(e) {
		var t = /* @__PURE__ */ new Map(), n = (e, n) => {
			var r = /* @__PURE__ */ _n(n, !1, !1);
			return t.set(e, r), r;
		};
		let r = new Proxy({
			...e.props || {},
			$$events: {}
		}, {
			get(e, r) {
				return q(t.get(r) ?? n(r, Reflect.get(e, r)));
			},
			has(e, r) {
				return r === je ? !0 : (q(t.get(r) ?? n(r, Reflect.get(e, r))), Reflect.has(e, r));
			},
			set(e, r, i) {
				return F(t.get(r) ?? n(r, i), i), Reflect.set(e, r, i);
			}
		});
		this.#t = (e.hydrate ? Gr : Wr)(e.component, {
			target: e.target,
			anchor: e.anchor,
			props: r,
			context: e.context,
			intro: e.intro ?? !1,
			recover: e.recover,
			transformError: e.transformError
		}), !ut && (!e?.props?.$$host || e.sync === !1) && N(), this.#e = r.$$events;
		for (let e of Object.keys(this.#t)) e === "$set" || e === "$destroy" || e === "$on" || ce(this, e, {
			get() {
				return this.#t[e];
			},
			set(t) {
				this.#t[e] = t;
			},
			enumerable: !0
		});
		this.#t.$set = (e) => {
			Object.assign(r, e);
		}, this.#t.$destroy = () => {
			Yr(this.#t);
		};
	}
	$set(e) {
		this.#t.$set(e);
	}
	$on(e, t) {
		this.#e[e] = this.#e[e] || [];
		let n = (...e) => t.call(this, ...e);
		return this.#e[e].push(n), () => {
			this.#e[e] = this.#e[e].filter((e) => e !== n);
		};
	}
	$destroy() {
		this.#t.$destroy();
	}
}, Mi;
typeof HTMLElement == "function" && (Mi = class extends HTMLElement {
	$$ctor;
	$$s;
	$$c;
	$$cn = !1;
	$$d = {};
	$$r = !1;
	$$p_d = {};
	$$l = {};
	$$l_u = /* @__PURE__ */ new Map();
	$$me;
	$$shadowRoot = null;
	constructor(e, t, n) {
		super(), this.$$ctor = e, this.$$s = t, n && (this.$$shadowRoot = this.attachShadow(n));
	}
	addEventListener(e, t, n) {
		if (this.$$l[e] = this.$$l[e] || [], this.$$l[e].push(t), this.$$c) {
			let n = this.$$c.$on(e, t);
			this.$$l_u.set(t, n);
		}
		super.addEventListener(e, t, n);
	}
	removeEventListener(e, t, n) {
		if (super.removeEventListener(e, t, n), this.$$c) {
			let e = this.$$l_u.get(t);
			e && (e(), this.$$l_u.delete(t));
		}
	}
	async connectedCallback() {
		if (this.$$cn = !0, !this.$$c) {
			if (await Promise.resolve(), !this.$$cn || this.$$c) return;
			function e(e) {
				return (t) => {
					let n = Pn("slot");
					e !== "default" && (n.name = e), Y(t, n);
				};
			}
			let t = {}, n = Pi(this);
			for (let r of this.$$s) r in n && (r === "default" && !this.$$d.children ? (this.$$d.children = e(r), t.default = !0) : t[r] = e(r));
			for (let e of this.attributes) {
				let t = this.$$g_p(e.name);
				t in this.$$d || (this.$$d[t] = Ni(t, e.value, this.$$p_d, "toProp"));
			}
			for (let e in this.$$p_d) !(e in this.$$d) && this[e] !== void 0 && (this.$$d[e] = this[e], delete this[e]);
			this.$$c = Ai({
				component: this.$$ctor,
				target: this.$$shadowRoot || this,
				props: {
					...this.$$d,
					$$slots: t,
					$$host: this
				}
			}), this.$$me = Wn(() => {
				Jn(() => {
					this.$$r = !0;
					for (let e of se(this.$$c)) {
						if (!this.$$p_d[e]?.reflect) continue;
						this.$$d[e] = this.$$c[e];
						let t = Ni(e, this.$$d[e], this.$$p_d, "toAttribute");
						t == null ? this.removeAttribute(this.$$p_d[e].attribute || e) : this.setAttribute(this.$$p_d[e].attribute || e, t);
					}
					this.$$r = !1;
				});
			});
			for (let e in this.$$l) for (let t of this.$$l[e]) {
				let n = this.$$c.$on(e, t);
				this.$$l_u.set(t, n);
			}
			this.$$l = {};
		}
	}
	attributeChangedCallback(e, t, n) {
		this.$$r || (e = this.$$g_p(e), this.$$d[e] = Ni(e, n, this.$$p_d, "toProp"), this.$$c?.$set({ [e]: this.$$d[e] }));
	}
	disconnectedCallback() {
		this.$$cn = !1, Promise.resolve().then(() => {
			!this.$$cn && this.$$c && (this.$$c.$destroy(), this.$$me(), this.$$c = void 0);
		});
	}
	$$g_p(e) {
		return se(this.$$p_d).find((t) => this.$$p_d[t].attribute === e || !this.$$p_d[t].attribute && t.toLowerCase() === e) || e;
	}
});
function Ni(e, t, n, r) {
	let i = n[e]?.type;
	if (t = i === "Boolean" && typeof t != "boolean" ? t != null : t, !r || !n[e]) return t;
	if (r === "toAttribute") switch (i) {
		case "Object":
		case "Array": return t == null ? null : JSON.stringify(t);
		case "Boolean": return t ? "" : null;
		case "Number": return t ?? null;
		default: return t;
	}
	else switch (i) {
		case "Object":
		case "Array": return t && JSON.parse(t);
		case "Boolean": return t;
		case "Number": return t == null ? t : +t;
		default: return t;
	}
}
function Pi(e) {
	let t = {};
	return e.childNodes.forEach((e) => {
		t[e.slot || "default"] = !0;
	}), t;
}
function Fi(e, t, n, r, i, a) {
	let o = class extends Mi {
		constructor() {
			super(e, n, i), this.$$p_d = t;
		}
		static get observedAttributes() {
			return se(t).map((e) => (t[e].attribute || e).toLowerCase());
		}
	};
	return se(t).forEach((e) => {
		ce(o.prototype, e, {
			get() {
				return this.$$c && e in this.$$c ? this.$$c[e] : this.$$d[e];
			},
			set(n) {
				n = Ni(e, n, t), this.$$d[e] = n;
				var r = this.$$c;
				r && (le(r, e)?.get ? r[e] = n : r.$set({ [e]: n }));
			}
		});
	}), r.forEach((e) => {
		ce(o.prototype, e, { get() {
			return this.$$c?.[e];
		} });
	}), a && (o = a(o)), e.element = o, o;
}
//#endregion
//#region src/helpers/promise-timeout.ts
var Ii = class e extends Error {
	constructor(t, ...n) {
		super(...n), Error.captureStackTrace && Error.captureStackTrace(this, e), this.name = "TimeoutError", this.timeout = t, this.message = `Timed out in ${t} ms.`;
	}
}, Li = (e, t) => {
	let n = new Promise((t, n) => {
		setTimeout(() => {
			n(new Ii(e));
		}, e);
	});
	return Promise.race([t, n]);
}, Ri = (e) => {
	if (typeof e.getCardSize == "function") try {
		return Li(500, e.getCardSize()).catch(() => 1);
	} catch {
		return 1;
	}
	return customElements.get(e.localName) ? 1 : customElements.whenDefined(e.localName).then(() => Ri(e));
}, zi = /* @__PURE__ */ zr("<span class=\"loading svelte-lv9s7p\">Loading...</span>"), Bi = /* @__PURE__ */ zr("<div><!></div>"), Vi = {
	hash: "svelte-lv9s7p",
	code: ".loading.svelte-lv9s7p {padding:1em;display:block;}.animation.svelte-lv9s7p {hui-card {display:flex;flex-direction:column;}}.outer-container.animation.svelte-lv9s7p {transition:margin-bottom 0.35s ease;}.outer-container.animation.open.svelte-lv9s7p,\n  .outer-container.animation.opening.svelte-lv9s7p {margin-bottom:inherit;}.outer-container.animation.close.svelte-lv9s7p,\n  .outer-container.animation.closing.svelte-lv9s7p {margin-bottom:var(--expander-animation-height, -100%);}.outer-container.animation.opening.svelte-lv9s7p {\n    animation: svelte-lv9s7p-fadeInOpacity 0.5s forwards ease;\n    -webkit-animation: svelte-lv9s7p-fadeInOpacity 0.5s forwards ease;}.outer-container.animation.closing.svelte-lv9s7p {\n      animation: svelte-lv9s7p-fadeOutOpacity 0.5s forwards ease;\n      -webkit-animation: svelte-lv9s7p-fadeOutOpacity 0.5s forwards ease;}.outer-container.svelte-lv9s7p > hui-card {margin-top:var(--child-card-margin-top, 0px);}\n  @keyframes svelte-lv9s7p-fadeInOpacity {\n      0% {\n          opacity: 0;\n      }\n      100% {\n          opacity: 1;\n      }\n  }\n  @-webkit-keyframes svelte-lv9s7p-fadeInOpacity {\n      0% {\n          opacity: 0;\n      }\n      100% {\n          opacity: 1;\n      }\n  }\n    @keyframes svelte-lv9s7p-fadeOutOpacity {\n      0% {\n          opacity: 1;\n      }\n      100% {\n          opacity: 0;\n      }\n  }\n  @-webkit-keyframes svelte-lv9s7p-fadeOutOpacity {\n      0% {\n          opacity: 1;\n      }\n      100% {\n          opacity: 0;\n      }\n  }"
};
function Hi(e, t) {
	pt(t, !0), ui(e, Vi);
	let n = ki(t, "config", 7), r = ki(t, "hass", 7), i = ki(t, "preview", 7), a = ki(t, "marginTop", 7, "0px"), o = ki(t, "open", 7), s = ki(t, "animation", 7, !0), c = ki(t, "animationState", 7), l = ki(t, "clearCardCss", 7, !1), u = null, d = /* @__PURE__ */ P(null), f = /* @__PURE__ */ P(!0), p = /* @__PURE__ */ P(0), m = J(() => JSON.parse(JSON.stringify(n())));
	Hn(() => {
		q(d) && (q(d).hass = r());
	}), Hn(() => {
		q(d) && i() !== void 0 && (q(d).preview = i());
	}), Hn(() => {
		q(d) && (m.disabled = !o(), q(d)._element?.dispatchEvent(new CustomEvent("card-visibility-changed", {
			detail: { value: o() },
			bubbles: !0,
			composed: !1
		})));
	}), Zr(async () => {
		let e = document.createElement("hui-card");
		e.hass = r(), e.preview = i(), m.disabled = !o(), e.config = m, e.load(), u?.appendChild(e), F(d, e, !0), F(f, !1), q(d).addEventListener("ll-upgrade", (e) => {
			e.stopPropagation(), q(d)?._element && r() && (q(d)._element.hass = r());
		}, { capture: !0 }), l() && (e.style.setProperty("--ha-card-background", "transparent"), e.style.setProperty("--ha-card-box-shadow", "none"), e.style.setProperty("--ha-card-border-color", "transparent"), e.style.setProperty("--ha-card-border-width", "0px"), e.style.setProperty("--ha-card-backdrop-filter", "none")), s() && (F(p, await Ri(e) * 56), u && F(p, q(p) + (window.getComputedStyle(u).marginTop ? parseFloat(window.getComputedStyle(u).marginTop) : 0)), new ResizeObserver((e) => {
			for (let t of e) if (t.contentBoxSize) {
				let e = Array.isArray(t.contentBoxSize) ? t.contentBoxSize[0] : t.contentBoxSize;
				e.blockSize && (F(p, e.blockSize, !0), q(d) && F(p, q(p) + (window.getComputedStyle(q(d)).marginTop ? parseFloat(window.getComputedStyle(q(d)).marginTop) : 0)));
			} else t.contentRect && (F(p, t.contentRect.height, !0), q(d) && F(p, q(p) + (window.getComputedStyle(q(d)).marginTop ? parseFloat(window.getComputedStyle(q(d)).marginTop) : 0)));
		}).observe(e));
	});
	var h = {
		get config() {
			return n();
		},
		set config(e) {
			n(e), N();
		},
		get hass() {
			return r();
		},
		set hass(e) {
			r(e), N();
		},
		get preview() {
			return i();
		},
		set preview(e) {
			i(e), N();
		},
		get marginTop() {
			return a();
		},
		set marginTop(e = "0px") {
			a(e), N();
		},
		get open() {
			return o();
		},
		set open(e) {
			o(e), N();
		},
		get animation() {
			return s();
		},
		set animation(e = !0) {
			s(e), N();
		},
		get animationState() {
			return c();
		},
		set animationState(e) {
			c(e), N();
		},
		get clearCardCss() {
			return l();
		},
		set clearCardCss(e = !1) {
			l(e), N();
		}
	}, g = Bi(), _ = kn(g), v = (e) => {
		Y(e, zi());
	};
	return $r(_, (e) => {
		q(f) && e(v);
	}), rt(g), Oi(g, (e) => u = e, () => u), Yn(() => {
		gi(g, 1, `outer-container${o() ? " open" : " close"}${s() ? " animation " + c() : ""}`, "svelte-lv9s7p"), vi(g, `--child-card-margin-top: ${(o() ? a() : "0px") ?? ""};${q(p) ? ` --expander-animation-height: -${q(p)}px;` : ""}`);
	}), Y(e, g), mt(h);
}
customElements.define("expander-sub-card", Fi(Hi, {
	config: {},
	hass: {},
	preview: {},
	marginTop: {},
	open: {},
	animation: {},
	animationState: {},
	clearCardCss: {}
}, [], [], { mode: "open" }));
//#endregion
//#region src/helpers/forward-haptic.ts
var Ui = (e, t) => {
	e.dispatchEvent?.(new CustomEvent("haptic", {
		detail: t,
		bubbles: !0,
		composed: !0
	}));
}, Wi = function(e, t, n) {
	n === void 0 && (n = {});
	var r = n.retries, i = r === void 0 ? 10 : r, a = n.delay, o = a === void 0 ? 10 : a, s = n.shouldReject, c = s === void 0 || s, l = n.rejectMessage ?? "Could not get the result after {{ retries }} retries";
	return new Promise((function(n, r) {
		var a = 0, s = function() {
			var u = e();
			t(u) ? n(u) : ++a < i ? setTimeout(s, o) : c ? r(Error(l.replace(/\{\{\s*retries\s*\}\}/g, `${i}`))) : n(u);
		};
		s();
	}));
}, Gi = "[home-assistant-javascript-templates]", Ki = /^([a-z_]+)\.(\w+)$/, qi, Ji, Yi, Xi;
(function(e) {
	e.UNKNOWN = "unknown", e.UNAVAILABLE = "unavailable";
})(qi ||= {}), function(e) {
	e.AREA_ID = "area_id", e.NAME = "name";
}(Ji ||= {}), function(e) {
	e.PANEL_URL = "panel_url", e.LANG = "lang";
}(Yi ||= {}), function(e) {
	e.LOCATION_CHANGED = "location-changed", e.TRANSLATIONS_UPDATED = "translations-updated", e.POPSTATE = "popstate", e.SUBSCRIBE_EVENTS = "subscribe_events", e.STATE_CHANGE_EVENT = "state_changed";
}(Xi ||= {});
var Zi = "refs", Qi = (e) => e.reduce((e, t) => {
	let [n, r] = t;
	return e[n.replace(Ki, "$2")] = r, e;
}, {}), $i = (e) => e.includes("."), ea = "ref", ta = "value", na = "toJSON", ra = (e) => `${ea}.${e}`;
function ia(e, t, n) {
	let r = () => Object.entries(e.hass.areas), i = () => Object.entries(e.hass.devices), a = () => Object.entries(e.hass.entities), o = /* @__PURE__ */ new Set(), s = /* @__PURE__ */ new Map(), c = (e, t) => {
		n && console.warn(`${e} ${t} used in a JavaScript template doesn't exist`);
	}, l = (e) => c("Entity", e), u = (e) => c("Domain", e), d = (e) => {
		let r = SyntaxError(e);
		if (t) throw r;
		n && console.warn(r);
	}, f = (t) => {
		e.hass.states[t] ? o.add(t) : l(t);
	}, p = (e) => {
		o.add(e);
	}, m = (t, n) => {
		let { with_unit: r = !1, rounded: i = !1 } = n;
		if (t) {
			let n = t.state, a = t.attributes.unit_of_measurement, o = Number(i), s = !1 === i || isNaN(Number(n)) ? n : new Intl.NumberFormat(e.hass.language, {
				minimumFractionDigits: o,
				maximumFractionDigits: o
			}).format(Number(n));
			return r && a ? `${s} ${a}` : s;
		}
	}, h = (e) => new Proxy(e, { get: (e, t) => t === "state_with_unit" ? m(e, {
		rounded: !0,
		with_unit: !0
	}) : e[t] });
	return {
		get hass() {
			return e.hass;
		},
		states: new Proxy((t, n = {}) => {
			if ($i(t)) return f(t), m(e.hass.states[t], n);
			throw SyntaxError(`${Gi}: states method cannot be used with a domain, use it as an object instead.`);
		}, { get(t, n) {
			if ($i(n)) return f(n), h(e.hass.states[n]);
			let r = Object.entries(e.hass.states).filter(([e]) => e.startsWith(n));
			return r.length || u(n), new Proxy(Qi(r), { get: (e, t) => (f(`${n}.${t}`), h(e[t])) });
		} }),
		state_translated(t) {
			if (f(t), e.hass.states[t]) return e.hass.formatEntityState(e.hass.states[t]);
		},
		is_state(t, n) {
			return f(t), Array.isArray(n) ? n.some((n) => e.hass.states[t]?.state === n) : e.hass.states[t]?.state === n;
		},
		state_attr(t, n) {
			return f(t), e.hass.states[t]?.attributes?.[n];
		},
		is_state_attr(e, t, n) {
			return this.state_attr(e, t) === n;
		},
		has_value(e) {
			return this.states(e) ? !(this.is_state(e, qi.UNKNOWN) || this.is_state(e, qi.UNAVAILABLE)) : (l(e), !1);
		},
		entities: new Proxy((t) => {
			if (t === void 0) return e.hass.entities;
			if ($i(t)) return f(t), e.hass.entities[t];
			let n = a().filter(([e]) => e.startsWith(t));
			return n.length || u(t), new Proxy(Qi(n), { get: (e, n) => (f(`${t}.${n}`), e[n]) });
		}, { get: (e, t) => e(t) }),
		entity_prop(t, n) {
			return f(t), e.hass.entities[t]?.[n];
		},
		is_entity_prop(e, t, n) {
			return this.entity_prop(e, t) === n;
		},
		devices: new Proxy((t) => {
			if (t === void 0) return e.hass.devices;
			if ($i(t)) throw SyntaxError(`${Gi}: devices method cannot be used with an entity id, you should use a device id instead.`);
			return e.hass.devices[t];
		}, { get(t, n) {
			if ($i(n)) throw SyntaxError(`${Gi}: devices cannot be accesed using an entity id, you should use a device id instead.`);
			return e.hass.devices[n];
		} }),
		device_attr(t, n) {
			if ($i(t)) {
				f(t);
				let r = e.hass.entities[t]?.device_id;
				return e.hass.devices[r]?.[n];
			}
			return e.hass.devices[t]?.[n];
		},
		is_device_attr(e, t, n) {
			return this.device_attr(e, t) === n;
		},
		device_id(t) {
			return $i(t) ? (f(t), e.hass.entities[t]?.device_id) : i().find((e) => e[1].name === t)?.[0];
		},
		device_name(t) {
			if ($i(t)) {
				f(t);
				let n = e.hass.entities[t]?.device_id;
				return e.hass.devices[n]?.name ?? void 0;
			}
			return e.hass.devices[t]?.name ?? void 0;
		},
		areas: () => r().map(([, e]) => e.area_id),
		area_id(t) {
			if (t in e.hass.devices) return this.device_attr(t, Ji.AREA_ID);
			let n = e.hass.entities[t]?.device_id;
			return n ? this.device_attr(n, Ji.AREA_ID) : r().find(([, e]) => e.name === t)?.[1]?.area_id;
		},
		area_name(t) {
			let n;
			t in e.hass.devices && (n = this.device_attr(t, Ji.AREA_ID));
			let i = e.hass.entities[t]?.device_id;
			return i && (n = this.device_attr(i, Ji.AREA_ID)), r().find(([, e]) => e.area_id === t || e.area_id === n)?.[1]?.name;
		},
		area_entities(e) {
			let t = r().find(([, t]) => t.area_id === e || t.name === e);
			return t ? a().filter(([, e]) => e.area_id === t[1].area_id).map(([e]) => e) : [];
		},
		area_devices(e) {
			let t = r().find(([, t]) => t.area_id === e || t.name === e);
			return t ? i().filter(([, e]) => e.area_id === t[1].area_id).map(([, e]) => e.id) : [];
		},
		get user_name() {
			return e.hass.user.name;
		},
		get user_is_admin() {
			return e.hass.user.is_admin;
		},
		get user_is_owner() {
			return e.hass.user.is_owner;
		},
		get user_agent() {
			return window.navigator.userAgent;
		},
		get tracked() {
			return o;
		},
		cleanTracked() {
			o.clear();
		},
		ref(e, t, n = void 0) {
			let r = ra(t);
			if (s.has(t)) return s.get(t);
			let i = new Proxy({
				[ta]: n,
				[na]() {
					return this[ta];
				}
			}, {
				get(e, t, n) {
					if (t === ta || t === na) return p(r), Reflect.get(e, t, n);
					d(`${t} is not a valid ${ea} property. A ${ea} only exposes a "${ta}" property`);
				},
				set(t, n, i) {
					if (n === ta) {
						let n = t[ta];
						return t[ta] = i, e({
							event_type: Xi.STATE_CHANGE_EVENT,
							data: {
								entity_id: r,
								old_state: { state: JSON.stringify(n) },
								new_state: { state: JSON.stringify(i) }
							}
						}), !0;
					}
					return d(`property "${n}" cannot be set in a ${ea}`), !1;
				}
			});
			return s.set(t, i), i;
		},
		unref(e, t) {
			let n = ra(t);
			s.has(t) ? (s.delete(t), e(n)) : d(`${t} is not a ref or it has been unrefed already`);
		},
		refs(e, t, n = {}) {
			let r = this.ref, i = this.unref, a = new Proxy(n, {
				get: (t, n) => r(e, n).value,
				set: (t, n, i) => (r(e, n).value = i, !0)
			});
			return Object.entries(n).forEach((n) => {
				let [a, o] = n;
				s.has(a) && i(t, a), r(e, a, o);
			}), a;
		},
		cleanRefs(e) {
			Array.from(s.keys()).forEach((t) => {
				this.unref(e, t);
			});
		},
		clientSideProxy: new Proxy({}, { get(t, r) {
			switch (Object.values(Yi).includes(r) && p(r), r) {
				case Yi.PANEL_URL: return window.location.pathname;
				case Yi.LANG: return e.hass.language;
			}
			n && console.warn(`clientSideProxy should only be used to access these variables: ${Object.values(Yi).join(", ")}`);
		} })
	};
}
var aa = class {
	constructor(e, t) {
		let { throwErrors: n = !1, throwWarnings: r = !0, variables: i = {}, refs: a = {}, refsVariableName: o = Zi, autoReturn: s = !0 } = t;
		this._throwErrors = n, this._throwWarnings = r, this._variables = i, this._refsVariableName = o, this._autoReturn = s, this._subscriptions = /* @__PURE__ */ new Map(), this._clientSideEntitiesRegExp = RegExp(`(^|[ \\?(+:\\{\\[><,])(${Object.values(Yi).join("|")})($|[ \\?)+:\\}\\]><.,])`, "gm"), this._scopped = ia(e, n, r), this.refs = a, this._watchForPanelUrlChange(), this._watchForEntitiesChange(), this._watchForLanguageChange();
	}
	_executeRenderingFunctions(e) {
		this._subscriptions.get(e).forEach((e, t) => {
			e.forEach((e, n) => {
				this.trackTemplate(t, n, e);
			});
		});
	}
	_watchForPanelUrlChange() {
		window.addEventListener(Xi.LOCATION_CHANGED, () => {
			this._panelUrlWatchCallback();
		}), window.addEventListener(Xi.POPSTATE, () => {
			this._panelUrlWatchCallback();
		});
	}
	_panelUrlWatchCallback() {
		this._subscriptions.has(Yi.PANEL_URL) && this._executeRenderingFunctions(Yi.PANEL_URL);
	}
	_watchForEntitiesChange() {
		window.hassConnection.then((e) => {
			e.conn.subscribeMessage((e) => this._entityWatchCallback(e), {
				type: Xi.SUBSCRIBE_EVENTS,
				event_type: Xi.STATE_CHANGE_EVENT
			});
		});
	}
	_watchForLanguageChange() {
		window.addEventListener(Xi.TRANSLATIONS_UPDATED, () => {
			this._subscriptions.has(Yi.LANG) && this._executeRenderingFunctions(Yi.LANG);
		});
	}
	_entityWatchCallback(e) {
		if (this._subscriptions.size) {
			let t = e.data.entity_id;
			this._subscriptions.has(t) && this._executeRenderingFunctions(t);
		}
	}
	_storeTracked(e, t, n) {
		this._scopped.tracked.forEach((r) => {
			let i = [t, n];
			if (this._subscriptions.has(r)) {
				let n = this._subscriptions.get(r);
				if (n.has(e)) {
					let r = n.get(e);
					r.has(t) || r.set(...i);
				} else n.set(e, new Map([i]));
			} else this._subscriptions.set(r, new Map([[e, new Map([i])]]));
		});
	}
	_untrackTemplate(e, t) {
		this._subscriptions.forEach((n, r) => {
			if (n.has(e)) {
				let i = n.get(e);
				i.delete(t), i.size === 0 && (n.delete(e), n.size === 0 && this._subscriptions.delete(r));
			}
		});
	}
	renderTemplate(e, t = {}) {
		try {
			let { variables: n = {}, refs: r = {} } = t, i = new Map(Object.entries(Object.assign(Object.assign({}, this._variables), n))), a = e.trim().replace(this._clientSideEntitiesRegExp, "$1clientSide.$2$3"), o = a.includes("return") || !this._autoReturn ? a : `return ${a}`;
			return Function("hass", "states", "state_translated", "is_state", "state_attr", "is_state_attr", "has_value", "entities", "entity_prop", "is_entity_prop", "devices", "device_attr", "is_device_attr", "device_id", "device_name", "areas", "area_id", "area_name", "area_entities", "area_devices", "user_name", "user_is_admin", "user_is_owner", "user_agent", "clientSide", "ref", "unref", this._refsVariableName, ...Array.from(i.keys()), `"use strict"; ${o}`)(this._scopped.hass, this._scopped.states, this._scopped.state_translated.bind(this._scopped), this._scopped.is_state.bind(this._scopped), this._scopped.state_attr.bind(this._scopped), this._scopped.is_state_attr.bind(this._scopped), this._scopped.has_value.bind(this._scopped), this._scopped.entities, this._scopped.entity_prop, this._scopped.is_entity_prop.bind(this._scopped), this._scopped.devices, this._scopped.device_attr.bind(this._scopped), this._scopped.is_device_attr.bind(this._scopped), this._scopped.device_id.bind(this._scopped), this._scopped.device_name.bind(this._scopped), this._scopped.areas.bind(this._scopped), this._scopped.area_id.bind(this._scopped), this._scopped.area_name.bind(this._scopped), this._scopped.area_entities.bind(this._scopped), this._scopped.area_devices.bind(this._scopped), this._scopped.user_name, this._scopped.user_is_admin, this._scopped.user_is_owner, this._scopped.user_agent, this._scopped.clientSideProxy, this._scopped.ref.bind(this._scopped, this._entityWatchCallback.bind(this)), this._scopped.unref.bind(this._scopped, this.cleanTracked.bind(this)), this._scopped.refs(this._entityWatchCallback.bind(this), this.cleanTracked.bind(this), r), ...Array.from(i.values()));
		} catch (e) {
			if (this._throwErrors) throw e;
			this._throwWarnings && console.warn(e);
			return;
		}
	}
	trackTemplate(e, t, n = {}) {
		this._scopped.cleanTracked();
		let r = this.renderTemplate(e, n);
		return this._storeTracked(e, t, n), t(r), () => this._untrackTemplate(e, t);
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
}, oa = class {
	constructor(e, t = {}) {
		this._renderer = Wi(() => e.hass, (e) => !!(e && e.areas && e.devices && e.entities && e.states && e.user), {
			retries: 100,
			delay: 50,
			rejectMessage: "The provided element doesn't contain a proper or initialised hass object"
		}).then(() => new aa(e, t));
	}
	getRenderer() {
		return this._renderer;
	}
};
//#endregion
//#region src/helpers/templates.ts
function sa(e = {}, t = {}) {
	return new oa(document.querySelector("home-assistant"), {
		autoReturn: !1,
		variables: e,
		refs: t,
		refsVariableName: "variables"
	}).getRenderer();
}
function ca(e) {
	return !e || typeof e != "string" ? !1 : String(e).trim().startsWith("[[[") && String(e).trim().endsWith("]]]");
}
function la(e, t, n, r = {}) {
	if (!ca(n)) throw Error("Not a valid JS template");
	return n = String(n).trim().slice(3, -3), e.then((e) => e.trackTemplate(n, t, { variables: r }));
}
function ua(e, t, n) {
	e.then((e) => {
		e.refs[t] = n;
	});
}
function da(e, t) {
	e.then((e) => {
		let n = t.detail;
		Object.keys(n).forEach((t) => {
			let r = n[t].property, i = n[t].value, a = `${t}_${r}`;
			e.refs[a] = i;
		});
	});
}
function fa(e, t) {
	let n = da.bind(null, e);
	return document.addEventListener(t, n), () => {
		document.removeEventListener(t, n);
	};
}
//#endregion
//#region node_modules/.pnpm/shadow-dom-selector@5.0.1/node_modules/shadow-dom-selector/dist/esm/index.js
var pa = function() {
	return pa = Object.assign || function(e) {
		for (var t, n = 1, r = arguments.length; n < r; n++) for (var i in t = arguments[n]) Object.prototype.hasOwnProperty.call(t, i) && (e[i] = t[i]);
		return e;
	}, pa.apply(this, arguments);
};
function ma(e, t, n, r) {
	return new (n ||= Promise)((function(i, a) {
		function o(e) {
			try {
				c(r.next(e));
			} catch (e) {
				a(e);
			}
		}
		function s(e) {
			try {
				c(r.throw(e));
			} catch (e) {
				a(e);
			}
		}
		function c(e) {
			var t;
			e.done ? i(e.value) : (t = e.value, t instanceof n ? t : new n((function(e) {
				e(t);
			}))).then(o, s);
		}
		c((r = r.apply(e, t || [])).next());
	}));
}
function ha(e, t) {
	var n, r, i, a = {
		label: 0,
		sent: function() {
			if (1 & i[0]) throw i[1];
			return i[1];
		},
		trys: [],
		ops: []
	}, o = Object.create((typeof Iterator == "function" ? Iterator : Object).prototype);
	return o.next = s(0), o.throw = s(1), o.return = s(2), typeof Symbol == "function" && (o[Symbol.iterator] = function() {
		return this;
	}), o;
	function s(s) {
		return function(c) {
			return function(s) {
				if (n) throw TypeError("Generator is already executing.");
				for (; o && (o = 0, s[0] && (a = 0)), a;) try {
					if (n = 1, r && (i = 2 & s[0] ? r.return : s[0] ? r.throw || ((i = r.return) && i.call(r), 0) : r.next) && !(i = i.call(r, s[1])).done) return i;
					switch (r = 0, i && (s = [2 & s[0], i.value]), s[0]) {
						case 0:
						case 1:
							i = s;
							break;
						case 4: return a.label++, {
							value: s[1],
							done: !1
						};
						case 5:
							a.label++, r = s[1], s = [0];
							continue;
						case 7:
							s = a.ops.pop(), a.trys.pop();
							continue;
						default:
							if (i = a.trys, !((i = i.length > 0 && i[i.length - 1]) || s[0] !== 6 && s[0] !== 2)) {
								a = 0;
								continue;
							}
							if (s[0] === 3 && (!i || s[1] > i[0] && s[1] < i[3])) {
								a.label = s[1];
								break;
							}
							if (s[0] === 6 && a.label < i[1]) {
								a.label = i[1], i = s;
								break;
							}
							if (i && a.label < i[2]) {
								a.label = i[2], a.ops.push(s);
								break;
							}
							i[2] && a.ops.pop(), a.trys.pop();
							continue;
					}
					s = t.call(e, a);
				} catch (e) {
					s = [6, e], r = 0;
				} finally {
					n = i = 0;
				}
				if (5 & s[0]) throw s[1];
				return {
					value: s[0] ? s[1] : void 0,
					done: !0
				};
			}([s, c]);
		};
	}
}
var ga = "$", _a = ":host", va = "invalid selector", ya = 10, ba = 10, xa = function(e) {
	var t, n = e[0], r = e[1];
	return (t = n) && (t instanceof Document || t instanceof Element || t instanceof ShadowRoot) && typeof r == "string";
};
function Sa(e, t) {
	return function(e) {
		return e.split(",").map((function(e) {
			return e.trim();
		}));
	}(e).map((function(e) {
		return t(function(e) {
			return e.split(ga).map((function(e) {
				return e.trim();
			}));
		}(e));
	}));
}
function Ca(e, t) {
	return `${e} cannot be used with a selector ending in a shadowRoot (${ga}).${t ? ` If you want to select a shadowRoot, use ${t} instead.` : ""}`;
}
function wa(e) {
	return e instanceof Promise ? e : Promise.resolve(e);
}
function Ta() {
	return `You can not select a shadowRoot (${ga}) of the document.`;
}
function Ea() {
	return `You can not select a shadowRoot (${ga}) of a shadowRoot.`;
}
function Da(e, t) {
	for (var n = null, r = e.length, i = 0; i < r; i++) {
		if (i === 0) if (e[i].length) n = t.querySelector(e[i]);
		else {
			if (t instanceof Document) throw SyntaxError(Ta());
			if (t instanceof ShadowRoot) throw SyntaxError(Ea());
			n = t.shadowRoot?.querySelector(e[++i]) || null;
		}
		else n = n.shadowRoot?.querySelector(`${_a} ${e[i]}`) || null;
		if (n === null) return null;
	}
	return n;
}
function Oa(e, t) {
	var n = function(e, t, n) {
		if (n || arguments.length === 2) for (var r, i = 0, a = t.length; i < a; i++) !r && i in t || (r ||= Array.prototype.slice.call(t, 0, i), r[i] = t[i]);
		return e.concat(r || Array.prototype.slice.call(t));
	}([], e, !0), r = n.pop();
	return n.length ? (Da(n, t)?.shadowRoot)?.querySelectorAll(`${_a} ${r}`) || null : t.querySelectorAll(r);
}
function ka(e, t) {
	if (e.length === 1 && !e[0].length) {
		if (t instanceof Document) throw SyntaxError(Ta());
		if (t instanceof ShadowRoot) throw SyntaxError(Ea());
		return t.shadowRoot;
	}
	return Da(e, t)?.shadowRoot || null;
}
function Aa(e, t, n, r) {
	n === void 0 && (n = "querySelector"), r === void 0 && (r = "shadowRootQuerySelector");
	for (var i = Sa(e, (function(e) {
		if (!e[e.length - 1].length) throw SyntaxError(Ca(n, r));
		return e;
	})), a = i.length, o = 0; o < a; o++) {
		var s = Da(i[o], t);
		if (s) return s;
	}
	return null;
}
function ja(e, t, n) {
	n === void 0 && (n = "querySelectorAll");
	for (var r = Sa(e, (function(e) {
		if (!e[e.length - 1].length) throw SyntaxError(Ca(n));
		return e;
	})), i = r.length, a = 0; a < i; a++) {
		var o = Oa(r[a], t);
		if (o?.length) return o;
	}
	return document.querySelectorAll(va);
}
function Ma(e, t, n, r) {
	n === void 0 && (n = "shadowRootQuerySelector"), r === void 0 && (r = "querySelector");
	for (var i = Sa(e, (function(e) {
		if (e.pop().length) throw SyntaxError(function(e, t) {
			return `${e} must be used with a selector ending in a shadowRoot (${ga}). If you don't want to select a shadowRoot, use ${t} instead.`;
		}(n, r));
		return e;
	})), a = i.length, o = 0; o < a; o++) {
		var s = ka(i[o], t);
		if (s) return s;
	}
	return null;
}
function Na(e, t, n, r) {
	return ma(this, void 0, void 0, (function() {
		return ha(this, (function(i) {
			return [2, Wi((function() {
				return Aa(e, t, "asyncQuerySelector", "asyncShadowRootQuerySelector");
			}), (function(e) {
				return !!e;
			}), {
				retries: n,
				delay: r,
				shouldReject: !1
			})];
		}));
	}));
}
function Pa(e, t, n, r) {
	return ma(this, void 0, void 0, (function() {
		return ha(this, (function(i) {
			return [2, Wi((function() {
				return ja(e, t, "asyncQuerySelectorAll");
			}), (function(e) {
				return !!e.length;
			}), {
				retries: n,
				delay: r,
				shouldReject: !1
			})];
		}));
	}));
}
function Fa(e, t, n, r) {
	return ma(this, void 0, void 0, (function() {
		return ha(this, (function(i) {
			return [2, Wi((function() {
				return Ma(e, t, "asyncShadowRootQuerySelector", "asyncQuerySelector");
			}), (function(e) {
				return !!e;
			}), {
				retries: n,
				delay: r,
				shouldReject: !1
			})];
		}));
	}));
}
var Ia = function(e, t) {
	var n = e.querySelectorAll(t);
	if (n.length) return n;
	if (e instanceof Element && e.shadowRoot) {
		var r = Ia(e.shadowRoot, t);
		if (r.length) return r;
	}
	for (var i = 0, a = Array.from(e.querySelectorAll("*")); i < a.length; i++) {
		var o = a[i], s = Ia(o, t);
		if (s.length) return s;
	}
	return document.querySelectorAll(va);
}, La = function(e, t, n, r) {
	return Wi((function() {
		return Ia(e, t);
	}), (function(e) {
		return !!e.length;
	}), {
		retries: n,
		delay: r,
		shouldReject: !1
	});
};
function Ra() {
	var e = [...arguments];
	return ma(this, void 0, void 0, (function() {
		var t, n, r, i, a;
		return ha(this, (function(o) {
			switch (o.label) {
				case 0: return xa(e) ? (t = e[0], n = e[1], r = e[2], [4, Na(n, t, r?.retries || ya, r?.delay || ba)]) : [3, 2];
				case 1:
				case 3: return [2, o.sent()];
				case 2: return i = e[0], a = e[1], [4, Na(i, document, a?.retries || ya, a?.delay || ba)];
			}
		}));
	}));
}
function za() {
	var e = [...arguments];
	return ma(this, void 0, void 0, (function() {
		var t, n, r, i, a;
		return ha(this, (function(o) {
			switch (o.label) {
				case 0: return xa(e) ? (t = e[0], n = e[1], r = e[2], [4, Pa(n, t, r?.retries || ya, r?.delay || ba)]) : [3, 2];
				case 1: return [2, o.sent()];
				case 2: return i = e[0], a = e[1], [2, Pa(i, document, a?.retries || ya, a?.delay || ba)];
			}
		}));
	}));
}
function Ba() {
	var e = [...arguments];
	return ma(this, void 0, void 0, (function() {
		var t, n, r, i, a;
		return ha(this, (function(o) {
			switch (o.label) {
				case 0: return xa(e) ? (t = e[0], n = e[1], r = e[2], [4, Fa(n, t, r?.retries || ya, r?.delay || ba)]) : [3, 2];
				case 1: return [2, o.sent()];
				case 2: return i = e[0], a = e[1], [2, Fa(i, document, a?.retries || ya, a?.delay || ba)];
			}
		}));
	}));
}
var Va = function() {
	function e(e, t) {
		e instanceof Node || e instanceof Promise ? (this._element = e, this._asyncParams = pa({
			retries: ya,
			delay: ba
		}, t || {})) : (this._element = document, this._asyncParams = pa({
			retries: ya,
			delay: ba
		}, e || {}));
	}
	return Object.defineProperty(e.prototype, "element", {
		get: function() {
			return wa(this._element).then((function(e) {
				return e instanceof NodeList ? e[0] || null : e;
			}));
		},
		enumerable: !1,
		configurable: !0
	}), Object.defineProperty(e.prototype, "$", {
		get: function() {
			var t = this;
			return new e(wa(this._element).then((function(e) {
				return e instanceof Document || e instanceof ShadowRoot || e === null || e instanceof NodeList && e.length === 0 ? null : e instanceof NodeList ? Ba(e[0], ga, t._asyncParams) : Ba(e, ga, t._asyncParams);
			})), this._asyncParams);
		},
		enumerable: !1,
		configurable: !0
	}), Object.defineProperty(e.prototype, "all", {
		get: function() {
			return wa(this._element).then((function(e) {
				return e instanceof NodeList ? e : document.querySelectorAll(va);
			}));
		},
		enumerable: !1,
		configurable: !0
	}), Object.defineProperty(e.prototype, "asyncParams", {
		get: function() {
			return this._asyncParams;
		},
		enumerable: !1,
		configurable: !0
	}), e.prototype.eq = function(e) {
		return ma(this, void 0, void 0, (function() {
			return ha(this, (function(t) {
				return [2, wa(this._element).then((function(t) {
					return t instanceof NodeList && t[e] || null;
				}))];
			}));
		}));
	}, e.prototype.query = function(t) {
		var n = this;
		return new e(wa(this._element).then((function(e) {
			return e === null || e instanceof NodeList && e.length === 0 ? null : e instanceof NodeList ? za(e[0], t, n._asyncParams) : za(e, t, n._asyncParams);
		})), this._asyncParams);
	}, e.prototype.deepQuery = function(t) {
		var n = this;
		return new e(wa(this._element).then((function(e) {
			return e === null || e instanceof NodeList && e.length === 0 ? null : e instanceof NodeList ? Promise.race(Array.from(e).map((function(e) {
				return La(e, t, n._asyncParams.retries, n._asyncParams.delay);
			}))) : La(e, t, n._asyncParams.retries, n._asyncParams.delay);
		})), this._asyncParams);
	}, e;
}(), Ha = "$", Ua = {
	retries: 100,
	delay: 50,
	eventThreshold: 450
}, Wa, Ga, X, Ka, Z;
(function(e) {
	e.HOME_ASSISTANT = "HOME_ASSISTANT", e.HOME_ASSISTANT_MAIN = "HOME_ASSISTANT_MAIN", e.HA_DRAWER = "HA_DRAWER", e.HA_SIDEBAR = "HA_SIDEBAR", e.PARTIAL_PANEL_RESOLVER = "PARTIAL_PANEL_RESOLVER";
})(Wa ||= {}), function(e) {
	e.HA_PANEL_LOVELACE = "HA_PANEL_LOVELACE", e.HUI_ROOT = "HUI_ROOT", e.HEADER = "HEADER", e.HUI_VIEW = "HUI_VIEW";
}(Ga ||= {}), function(e) {
	e.HA_MORE_INFO_DIALOG = "HA_MORE_INFO_DIALOG", e.HA_DIALOG = "HA_DIALOG", e.HA_DIALOG_CONTENT = "HA_DIALOG_CONTENT", e.HA_MORE_INFO_DIALOG_INFO = "HA_MORE_INFO_DIALOG_INFO", e.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK = "HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK", e.HA_DIALOG_MORE_INFO_SETTINGS = "HA_DIALOG_MORE_INFO_SETTINGS";
}(X ||= {}), function(e) {
	e.ON_LISTEN = "onListen", e.ON_PANEL_LOAD = "onPanelLoad", e.ON_LOVELACE_PANEL_LOAD = "onLovelacePanelLoad", e.ON_MORE_INFO_DIALOG_OPEN = "onMoreInfoDialogOpen", e.ON_HISTORY_AND_LOGBOOK_DIALOG_OPEN = "onHistoryAndLogBookDialogOpen", e.ON_SETTINGS_DIALOG_OPEN = "onSettingsDialogOpen";
}(Ka ||= {}), function(e) {
	e.HOME_ASSISTANT = "home-assistant", e.HOME_ASSISTANT_MAIN = "home-assistant-main", e.HA_DRAWER = "ha-drawer", e.HA_SIDEBAR = "ha-sidebar", e.PARTIAL_PANEL_RESOLVER = "partial-panel-resolver", e.HA_PANEL_LOVELACE = "ha-panel-lovelace", e.HUI_ROOT = "hui-root", e.HEADER = ".header", e.HUI_VIEW = "hui-view", e.HA_MORE_INFO_DIALOG = "ha-more-info-dialog", e.HA_DIALOG = "ha-adaptive-dialog, ha-dialog", e.HA_DIALOG_CONTENT = ".content", e.HA_MORE_INFO_DIALOG_INFO = "ha-more-info-info", e.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK = "ha-more-info-history-and-logbook", e.HA_DIALOG_MORE_INFO_SETTINGS = "ha-more-info-settings";
}(Z ||= {});
var qa = { [Wa.HOME_ASSISTANT]: {
	selector: Z.HOME_ASSISTANT,
	children: { shadowRoot: {
		selector: Ha,
		children: { [Wa.HOME_ASSISTANT_MAIN]: {
			selector: Z.HOME_ASSISTANT_MAIN,
			children: { shadowRoot: {
				selector: Ha,
				children: { [Wa.HA_DRAWER]: {
					selector: Z.HA_DRAWER,
					children: {
						[Wa.HA_SIDEBAR]: {
							selector: Z.HA_SIDEBAR,
							children: { shadowRoot: { selector: Ha } }
						},
						[Wa.PARTIAL_PANEL_RESOLVER]: { selector: Z.PARTIAL_PANEL_RESOLVER }
					}
				} }
			} }
		} }
	} }
} }, Ja = { [Ga.HA_PANEL_LOVELACE]: {
	selector: Z.HA_PANEL_LOVELACE,
	children: { shadowRoot: {
		selector: Ha,
		children: { [Ga.HUI_ROOT]: {
			selector: Z.HUI_ROOT,
			children: { shadowRoot: {
				selector: Ha,
				children: {
					[Ga.HEADER]: { selector: Z.HEADER },
					[Ga.HUI_VIEW]: { selector: Z.HUI_VIEW }
				}
			} }
		} }
	} }
} }, Ya = { shadowRoot: {
	selector: Ha,
	children: { [X.HA_MORE_INFO_DIALOG]: {
		selector: Z.HA_MORE_INFO_DIALOG,
		children: { shadowRoot: {
			selector: Ha,
			children: { [X.HA_DIALOG]: {
				selector: Z.HA_DIALOG,
				children: { [X.HA_DIALOG_CONTENT]: {
					selector: Z.HA_DIALOG_CONTENT,
					children: {
						[X.HA_MORE_INFO_DIALOG_INFO]: { selector: Z.HA_MORE_INFO_DIALOG_INFO },
						[X.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK]: { selector: Z.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK },
						[X.HA_DIALOG_MORE_INFO_SETTINGS]: { selector: Z.HA_DIALOG_MORE_INFO_SETTINGS }
					}
				} }
			} }
		} }
	} }
} }, Xa = (e, t, n, r = !1) => Object.entries(t || {}).reduce((t, i) => {
	let [a, o] = i;
	if (o.selector === Ha && n) return o.children ? Object.assign(Object.assign({}, t), Xa(e, o.children, n, !0)) : t;
	let s = n ? n.then((t) => {
		return t ? Ra(t, (n = o.selector, r ? "$ " + n : n), e) : null;
		var n;
	}) : Ra(o.selector, e);
	return t[a] = {
		element: s,
		children: Xa(e, o.children, s),
		selector: new Va(s, e)
	}, t;
}, {}), Za = (e, t) => {
	let n = Object.entries(t);
	for (let t of n) {
		if (t[0] === e) return t[1];
		{
			let n = Za(e, t[1].children);
			if (n) return n;
		}
	}
}, Qa = (e, t) => Object.keys(e).reduce((e, n) => {
	let r = Za(n, t);
	if (r) {
		let { children: t } = r, i = function(e, t) {
			var n = {};
			for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
			if (e != null && typeof Object.getOwnPropertySymbols == "function") {
				var i = 0;
				for (r = Object.getOwnPropertySymbols(e); i < r.length; i++) t.indexOf(r[i]) < 0 && Object.prototype.propertyIsEnumerable.call(e, r[i]) && (n[r[i]] = e[r[i]]);
			}
			return n;
		}(r, ["children"]);
		e[n] = Object.assign({}, i);
	}
	return e;
}, {}), $a = class {
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
}, eo = new class extends $a {
	constructor(e = {}) {
		super(), this._config = Object.assign(Object.assign({}, Ua), e), this._timestaps = {};
	}
	_dispatchEvent(e, t) {
		let n = Date.now();
		this._timestaps[e] && n - this._timestaps[e] < this._config.eventThreshold || (this._timestaps[e] = n, this.dispatchEvent(new CustomEvent(e, { detail: t })));
	}
	_updateDialogElements(e = X.HA_MORE_INFO_DIALOG_INFO) {
		this._dialogTree = Xa(this._config, Ya, this._haRootElements.HOME_ASSISTANT.element);
		let t = Qa(X, this._dialogTree);
		t.HA_DIALOG_CONTENT.element.then((e) => {
			this._dialogsContentObserver.disconnect(), this._dialogsContentObserver.observe(e, { childList: !0 });
		}), this._haDialogElements = ((e, t) => [
			X.HA_MORE_INFO_DIALOG,
			X.HA_DIALOG,
			X.HA_DIALOG_CONTENT,
			t
		].reduce((t, n) => (t[n] = e[n], t), {}))(t, e);
		let n = {
			[X.HA_MORE_INFO_DIALOG_INFO]: Ka.ON_MORE_INFO_DIALOG_OPEN,
			[X.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK]: Ka.ON_HISTORY_AND_LOGBOOK_DIALOG_OPEN,
			[X.HA_DIALOG_MORE_INFO_SETTINGS]: Ka.ON_SETTINGS_DIALOG_OPEN
		};
		this._dispatchEvent(n[e], this._haDialogElements);
	}
	_updateRootElements() {
		this._homeAssistantRootTree = Xa(this._config, qa), this._haRootElements = Qa(Wa, this._homeAssistantRootTree), this._haRootElements[Wa.HOME_ASSISTANT].selector.$.element.then((e) => {
			this._dialogsObserver.disconnect(), this._dialogsObserver.observe(e, { childList: !0 });
		}), this._haRootElements[Wa.PARTIAL_PANEL_RESOLVER].element.then((e) => {
			this._panelResolverObserver.disconnect(), e && this._panelResolverObserver.observe(e, {
				subtree: !0,
				childList: !0
			});
		}), this._dispatchEvent(Ka.ON_LISTEN, this._haRootElements), this._dispatchEvent(Ka.ON_PANEL_LOAD, this._haRootElements);
	}
	_updateLovelaceElements() {
		this._homeAssistantResolverTree = Xa(this._config, Ja, this._haRootElements[Wa.HA_DRAWER].element), this._haResolverElements = Qa(Ga, this._homeAssistantResolverTree), this._haResolverElements[Ga.HA_PANEL_LOVELACE].element.then((e) => {
			this._lovelaceObserver.disconnect(), e && (this._lovelaceObserver.observe(e.shadowRoot, { childList: !0 }), this._dispatchEvent(Ka.ON_LOVELACE_PANEL_LOAD, Object.assign(Object.assign({}, this._haRootElements), this._haResolverElements)));
		});
	}
	_watchDialogs(e) {
		e.forEach(({ addedNodes: e }) => {
			e.forEach((e) => {
				e instanceof Element && e.localName === Z.HA_MORE_INFO_DIALOG && this._updateDialogElements();
			});
		});
	}
	_watchDialogsContent(e) {
		e.forEach(({ addedNodes: e }) => {
			e.forEach((e) => {
				let t = {
					[Z.HA_MORE_INFO_DIALOG_INFO]: X.HA_MORE_INFO_DIALOG_INFO,
					[Z.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK]: X.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK,
					[Z.HA_DIALOG_MORE_INFO_SETTINGS]: X.HA_DIALOG_MORE_INFO_SETTINGS
				};
				if (e instanceof Element && e.localName && e.localName in t) {
					let n = e.localName;
					this._updateDialogElements(t[n]);
				}
			});
		});
	}
	_watchDashboards(e) {
		e.forEach(({ addedNodes: e }) => {
			e.forEach((e) => {
				this._dispatchEvent(Ka.ON_PANEL_LOAD, this._haRootElements), e instanceof Element && e.localName === Z.HA_PANEL_LOVELACE && this._updateLovelaceElements();
			});
		});
	}
	_watchLovelace(e) {
		e.forEach(({ addedNodes: e }) => {
			e.forEach((e) => {
				e instanceof Element && e.localName === Z.HUI_ROOT && this._updateLovelaceElements();
			});
		});
	}
	listen() {
		this._watchDialogsBinded = this._watchDialogs.bind(this), this._watchDialogsContentBinded = this._watchDialogsContent.bind(this), this._watchDashboardsBinded = this._watchDashboards.bind(this), this._watchLovelaceBinded = this._watchLovelace.bind(this), this._dialogsObserver = new MutationObserver(this._watchDialogsBinded), this._dialogsContentObserver = new MutationObserver(this._watchDialogsContentBinded), this._panelResolverObserver = new MutationObserver(this._watchDashboardsBinded), this._lovelaceObserver = new MutationObserver(this._watchLovelaceBinded), this._updateRootElements(), this._updateLovelaceElements();
	}
	addEventListener(e, t, n) {
		super.addEventListener(e, t, n);
	}
}(), to = {};
eo.addEventListener("onLovelacePanelLoad", ({ detail: e }) => {
	e.HUI_ROOT.element.then((e) => {
		let t = e?.lovelace;
		t?.config && (to = t.config["expander-card"] || {});
	}).catch(() => {
		to = {};
	}).finally(() => {
		document.body.dispatchEvent(new CustomEvent("expander-card-raw-config-updated", {
			detail: { rawConfig: to },
			bubbles: !0,
			composed: !0
		}));
	});
}), eo.listen();
var no = () => to, ro = (e) => e ? typeof e == "string" ? e : Object.entries(e).map(([e, t]) => Array.isArray(t) ? `${e} {\n${t.map((e) => {
	if (typeof e == "string") return `  ${e};`;
	let [t, n] = Object.entries(e)[0];
	return `  ${t}: ${n};`;
}).join("\n")}\n}` : null).filter((e) => e !== null).join("\n") : null, io = {
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
}, ao = /* @__PURE__ */ zr("<ha-ripple></ha-ripple>", 2), oo = /* @__PURE__ */ zr("<button aria-label=\"Toggle button\"><ha-icon></ha-icon> <!></button>", 2), so = /* @__PURE__ */ zr("<div id=\"id1\"><div id=\"id2\"><!></div> <!> <!></div>"), co = /* @__PURE__ */ zr("<button><div> </div> <ha-icon></ha-icon> <ha-ripple></ha-ripple></button>", 2), lo = /* @__PURE__ */ zr("<div><div></div></div>"), uo = /* @__PURE__ */ zr("<ha-card><!> <!> <!></ha-card>", 2), fo = {
	hash: "svelte-1jqiztq",
	code: ".expander-card.svelte-1jqiztq {display:var(--expander-card-display,block);gap:var(--gap);padding:var(--padding);background:var(--card-background,#fff);-webkit-tap-highlight-color:transparent;}.expander-card.animation.svelte-1jqiztq {transition:gap 0.35s ease, background-color var(--background-animation-duration, 0) ease;}.children-wrapper.svelte-1jqiztq {display:flex;flex-direction:column;}.children-wrapper.animation.opening.svelte-1jqiztq,\n    .children-wrapper.animation.closing.svelte-1jqiztq {overflow:hidden;}.children-container.animation.svelte-1jqiztq {transition:padding 0.35s ease, gap 0.35s ease;}.children-container.svelte-1jqiztq {padding:var(--child-padding);display:var(--expander-card-display,block);gap:var(--gap);}.clear.svelte-1jqiztq {background:none !important;background-color:transparent !important;border-style:none !important;box-shadow:none !important;}.title-card-header.svelte-1jqiztq {display:flex;align-items:center;justify-content:space-between;flex-direction:row;position:relative;}.title-card-header.clickable.svelte-1jqiztq {cursor:pointer;border-style:none;border-radius:var(--ha-card-border-radius, var(--ha-border-radius-lg));}.title-card-header-overlay.svelte-1jqiztq {display:block;}.title-card-container.svelte-1jqiztq {width:100%;padding:var(--title-padding);}.header.svelte-1jqiztq {display:flex;flex-direction:row;align-items:center;padding:0.85em 0.85em;background:var(--button-background);border-style:none;border-radius:var(--ha-card-border-radius, var(--ha-border-radius-lg));width:var(--header-width,auto);color:var(--header-color,#fff);cursor:pointer;position:relative;font-family:var(--ha-font-family-body);font-size:var(--ha-font-size-m);}.header-overlay.svelte-1jqiztq {position:absolute;top:0;right:0;margin:var(--overlay-margin);height:var(--expander-card-overlay-height, auto);z-index:1;}.title-card-header-overlay.clickable.svelte-1jqiztq  > .header-overlay:where(.svelte-1jqiztq) {width:calc(100% - var(--overlay-margin) * 2);justify-content:flex-end;}.title-card-header-overlay.clickable.svelte-1jqiztq > .title-card-container:where(.svelte-1jqiztq) {width:calc(100% - var(--overlay-margin) * 2);}.title.svelte-1jqiztq {width:100%;text-align:left;}.ico.animation.svelte-1jqiztq {transition-property:transform;transition-duration:0.35s;}.ico.svelte-1jqiztq {color:var(--arrow-color,var(--primary-text-color,#fff));}.flipped.svelte-1jqiztq {transform:rotate(var(--icon-rotate-degree,180deg));}"
};
function po(e, t) {
	pt(t, !0), ui(e, fo);
	let n = ki(t, "hass", 7), r = ki(t, "preview", 7), i = ki(t, "config", 7, io), a = /* @__PURE__ */ P(!1), o = /* @__PURE__ */ P(null), s = /* @__PURE__ */ P(Sn(!!J(() => r()))), c = /* @__PURE__ */ P(Sn(!!J(() => r()))), l = /* @__PURE__ */ P(Sn(J(() => r() || (ce(i()["show-button-users"]) ?? !0)))), u = /* @__PURE__ */ P("idle"), d = /* @__PURE__ */ P(null), f = /* @__PURE__ */ P(0), p = /* @__PURE__ */ P(0), m = /* @__PURE__ */ P(null), h = /* @__PURE__ */ P(null), g = /* @__PURE__ */ P(null), _ = /* @__PURE__ */ P(null), v = {}, y = {}, b = {}, x = /* @__PURE__ */ P(Sn({})), S = /* @__PURE__ */ P(Sn(no())), ee = /* @__PURE__ */ Bt(() => {
		let e = q(x).style, t = i().style, n = null;
		return e === void 0 ? t && (n = ro(t)) : n = typeof e == "string" ? e : typeof e == "object" && e ? ro(e) : String(e), n ? `<style>${n}</style>` : null;
	}), te = /* @__PURE__ */ Bt(() => q(x).icon === void 0 ? i().icon : String(q(x).icon)), ne = /* @__PURE__ */ Bt(() => q(x).title === void 0 ? i().title : String(q(x).title)), re = /* @__PURE__ */ Bt(() => q(x)["arrow-color"] === void 0 ? i()["arrow-color"] : String(q(x)["arrow-color"])), ie = J(() => i()["storage-id"]), ae = "expander-open-" + ie;
	Hn(() => {
		if (q(x).expanded === void 0 || J(() => r() && q(S)["preview-expanded"] !== !1)) return;
		let e = !!q(x).expanded;
		queueMicrotask(() => {
			e !== q(s) && de(e);
		});
	}), Hn(() => {
		if (!(r() === q(c) || r() === void 0)) {
			if (F(c, r(), !0), q(c) && q(S)["preview-expanded"] !== !1) {
				pe(!0), F(l, !0);
				return;
			}
			if (F(l, ce(i()["show-button-users"]) ?? !0, !0), oe("expanded")) {
				let e = J(() => q(x).expanded);
				e !== void 0 && de(!!e);
				return;
			}
			le();
		}
	});
	function oe(e) {
		let t = i().templates && Array.isArray(i().templates) ? i().templates.find((t) => t.template === e) : void 0;
		if (t && ca(t.value_template)) return t;
	}
	function se(e) {
		if (!i()["expander-card-id"]) return;
		let t = {};
		t[i()["expander-card-id"]] = {
			property: "open",
			value: e
		}, document.dispatchEvent(new CustomEvent("expander-card", {
			detail: t,
			bubbles: !0,
			composed: !0
		}));
	}
	function ce(e) {
		if (e !== void 0) return n()?.user?.name !== void 0 && e.includes(n()?.user?.name);
	}
	function le() {
		if (!oe("expanded")) {
			if (ce(i()["start-expanded-users"])) {
				fe(!0);
				return;
			}
			if (ie === void 0) {
				ue();
				return;
			}
			try {
				let e = localStorage.getItem(ae);
				if (e === null) {
					ue();
					return;
				}
				fe(e ? e === "true" : q(s));
			} catch (e) {
				console.error(e), fe(!1);
			}
		}
	}
	function ue() {
		if (i().expanded !== void 0) {
			fe(i().expanded);
			return;
		}
		fe(!1);
	}
	function de(e) {
		q(d) && (clearTimeout(q(d)), F(d, null));
		let t = e === void 0 ? !q(s) : e;
		if (!i().animation) {
			fe(t);
			return;
		}
		if (se(t), F(u, t ? "opening" : "closing", !0), t) {
			pe(!0), F(d, setTimeout(() => {
				F(u, "idle"), F(d, null);
			}, 350), !0);
			return;
		}
		F(d, setTimeout(() => {
			pe(!1), F(u, "idle"), F(d, null);
		}, 350), !0);
	}
	function fe(e) {
		pe(e), se(e);
	}
	function pe(e) {
		if (F(s, e, !0), !r() && ie !== void 0) try {
			localStorage.setItem(ae, q(s) ? "true" : "false");
		} catch (e) {
			console.error(e);
		}
		q(s) && q(f) === 0 && F(f, .35);
	}
	function me(e) {
		let t = e.detail?.rawConfig;
		t && JSON.stringify(t) !== JSON.stringify(q(S)) && F(S, t, !0);
	}
	function he(e) {
		let t = e.detail?.["expander-card"]?.data;
		if (t?.["expander-card-id"] && t["expander-card-id"] === i()["expander-card-id"]) {
			if (t.action === "open" && !q(s)) {
				de(!0);
				return;
			}
			if (t.action === "close" && q(s)) {
				de(!1);
				return;
			}
			t.action === "toggle" && de();
		}
	}
	function ge(e) {
		e.stopPropagation();
	}
	function _e() {
		t.$$host.removeEventListener("card-updated", ge), document.body.removeEventListener("ll-custom", he), document.body.removeEventListener("expander-card-raw-config-updated", me), Object.entries(b).forEach(([e, t]) => {
			t.then((t) => {
				t(), delete b[e];
			}).catch(() => {});
		}), Object.entries(y).forEach(([e, t]) => {
			t.then((t) => {
				t(), delete y[e];
			}).catch(() => {});
		}), Object.entries(v).forEach(([e, t]) => {
			t(), delete v[e];
		});
	}
	let C = (e) => {
		i().haptic && i().haptic !== "none" && Ui(e, i().haptic);
	}, w, T = !1, ve = 0, ye = 0, be = (e) => {
		q(_) && (q(_).disabled = !0), w = e.target, ve = e.touches[0].clientX, ye = e.touches[0].clientY, T = !1;
	}, xe = (e) => {
		let t = e.touches[0].clientX, n = e.touches[0].clientY;
		T = Math.abs(t - ve) > 10 || Math.abs(n - ye) > 10;
	}, Se = () => {
		q(_) && (q(_).disabled = !1), w = void 0, T = !1;
	}, Ce = () => {
		q(_) && (q(_).disabled = !1);
	}, we = (e) => {
		!T && w === e.target && i()["title-card-clickable"] && (C(w), de(), F(a, !0), F(o, window.setTimeout(() => {
			F(a, !1), F(o, null);
		}, 100), !0), q(_) && (q(_).startPressAnimation(), q(_).endPressAnimation())), w = void 0, T = !1;
	}, Te = (e) => {
		for (let t of Object.values(i().variables ?? {})) ca(t.value_template) ? y[t.variable] = la(e, (n) => {
			ua(e, t.variable, n);
		}, t.value_template, { config: i() }) : ua(e, t.variable, t.value_template);
	}, Ee = (e) => {
		v["expander-card"] = fa(e, "expander-card");
	}, De = () => {
		if (!i().templates) return;
		let e = Object.values(i().variables || {}).reduce((e, t) => (e[t.variable] = void 0, e), {}), t = sa({
			config: i(),
			expanderCard: {}
		}, e);
		Te(t), Ee(t), Object.values(i().templates || {}).forEach((e) => {
			ca(e.value_template) ? b[e.template] = la(t, (t) => {
				q(x)[e.template] = t;
			}, e.value_template, { config: i() }) : q(x)[e.template] = e.value_template;
		});
	};
	function Oe() {
		if (oe("expanded")) return;
		let e = i()["min-width-expanded"], t = i()["max-width-expanded"], n = document.body.offsetWidth;
		if (e && t) {
			i().expanded = n >= e && n <= t;
			return;
		}
		if (e) {
			i().expanded = n >= e;
			return;
		}
		t && (i().expanded = n <= t);
	}
	function ke() {
		if (r() && q(S)["preview-expanded"] !== !1) {
			pe(!0);
			return;
		}
		if (oe("expanded")) {
			let e = J(() => q(x).expanded);
			fe(e === void 0 ? !1 : !!e);
		} else le();
	}
	function Ae() {
		if (i()["title-card-clickable"] && !i()["title-card-button-overlay"] && q(h)) return q(h);
		if (q(g)) return q(g);
	}
	Zr(() => {
		De(), se(!1), Oe(), ke(), t.$$host.addEventListener("card-updated", ge), document.body.addEventListener("ll-custom", he), document.body.addEventListener("expander-card-raw-config-updated", me);
		let e = Ae();
		return e && (e.addEventListener("touchstart", be, {
			passive: !0,
			capture: !0
		}), e.addEventListener("touchmove", xe, {
			passive: !0,
			capture: !0
		}), e.addEventListener("touchcancel", Se, {
			passive: !0,
			capture: !0
		}), e.addEventListener("touchend", Ce, {
			passive: !0,
			capture: !0
		}), e.addEventListener("touchend", we, {
			passive: !1,
			capture: !1
		})), i()["title-card-clickable"] && i()["title-card-button-overlay"] && q(h) && new ResizeObserver(() => {
			q(g) && q(h) && q(m) && F(p, q(h).getBoundingClientRect().height - parseFloat(getComputedStyle(q(g)).marginTop) - parseFloat(getComputedStyle(q(g)).marginBottom) + parseFloat(getComputedStyle(q(m)).paddingTop) + parseFloat(getComputedStyle(q(m)).paddingBottom));
		}).observe(q(h)), _e;
	});
	let je = (e) => {
		if (!q(a)) {
			C(e.currentTarget), de();
			return;
		}
		return e.preventDefault(), e.stopImmediatePropagation(), F(a, !1), q(o) && (clearTimeout(q(o)), F(o, null)), !1;
	};
	var Me = {
		get hass() {
			return n();
		},
		set hass(e) {
			n(e), N();
		},
		get preview() {
			return r();
		},
		set preview(e) {
			r(e), N();
		},
		get config() {
			return i();
		},
		set config(e = io) {
			i(e), N();
		}
	}, Ne = uo(), Pe = kn(Ne), Fe = (e) => {
		var t = so(), a = kn(t);
		Hi(kn(a), {
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
		}), rt(a);
		var o = jn(a, 2), c = (e) => {
			var t = oo(), n = kn(t);
			Yn(() => Ci(n, "icon", q(te)));
			var r = jn(n, 2), a = (e) => {
				var t = ao();
				Oi(t, (e) => F(_, e), () => q(_)), Y(e, t);
			};
			$r(r, (e) => {
				(!i()["title-card-clickable"] || i()["title-card-button-overlay"]) && e(a);
			}), rt(t), Oi(t, (e) => F(g, e), () => q(g)), Yn(() => {
				vi(t, `--overlay-margin:${i()["overlay-margin"] ?? ""}; --button-background:${i()["button-background"] ?? ""}; --header-color:${i()["header-color"] ?? ""};`), gi(t, 1, `header ${i()["title-card-button-overlay"] ? " header-overlay" : ""}${q(s) ? " open" : " close"}${i().animation ? " animation " + q(u) : ""}`, "svelte-1jqiztq"), vi(n, `--arrow-color:${q(re) ?? ""}`), gi(n, 1, `ico${q(s) && q(u) !== "closing" ? " flipped open" : " close"}${i().animation ? " animation " + q(u) : ""}`, "svelte-1jqiztq");
			}), jr("click", t, function(...e) {
				(!i()["title-card-clickable"] || i()["title-card-button-overlay"] ? je : null)?.apply(this, e);
			}), Y(e, t);
		};
		$r(o, (e) => {
			q(l) && e(c);
		});
		var d = jn(o, 2), f = (e) => {
			var t = ao();
			Oi(t, (e) => F(_, e), () => q(_)), Y(e, t);
		};
		$r(d, (e) => {
			i()["title-card-clickable"] && !i()["title-card-button-overlay"] && e(f);
		}), rt(t), Oi(t, (e) => F(h, e), () => q(h)), Yn(() => {
			gi(t, 1, `title-card-header${i()["title-card-button-overlay"] ? "-overlay" : ""}${q(s) ? " open" : " close"}${i().animation ? " animation " + q(u) : ""}${i()["title-card-clickable"] ? " clickable" : ""}`, "svelte-1jqiztq"), Si(t, "role", i()["title-card-clickable"] && !i()["title-card-button-overlay"] ? "button" : void 0), gi(a, 1, `title-card-container${q(s) ? " open" : " close"}${i().animation ? " animation " + q(u) : ""}`, "svelte-1jqiztq"), vi(a, `--title-padding:${(i()["title-card-padding"] ? i()["title-card-padding"] : "0px") ?? ""};`);
		}), jr("click", t, function(...e) {
			(i()["title-card-clickable"] && !i()["title-card-button-overlay"] ? je : null)?.apply(this, e);
		}), Y(e, t);
	}, Ie = (e) => {
		var t = Br(), n = An(t), r = (e) => {
			var t = co(), n = kn(t), r = kn(n, !0);
			rt(n);
			var a = jn(n, 2);
			Yn(() => Ci(a, "icon", q(te))), Oi(jn(a, 2), (e) => F(_, e), () => q(_)), rt(t), Oi(t, (e) => F(g, e), () => q(g)), Yn(() => {
				gi(t, 1, `header${q(s) ? " open" : " close"}${i().animation ? " animation " + q(u) : ""}`, "svelte-1jqiztq"), vi(t, `--header-width:100%; --button-background:${i()["button-background"] ?? ""};--header-color:${i()["header-color"] ?? ""};`), gi(n, 1, `primary title${q(s) ? " open" : " close"}`, "svelte-1jqiztq"), Ur(r, q(ne)), vi(a, `--arrow-color:${q(re) ?? ""}`), gi(a, 1, `ico${q(s) && q(u) !== "closing" ? " flipped open" : " close"}${i().animation ? " animation " + q(u) : ""}`, "svelte-1jqiztq");
			}), jr("click", t, je), Y(e, t);
		};
		$r(n, (e) => {
			q(l) && e(r);
		}), Y(e, t);
	};
	$r(Pe, (e) => {
		i()["title-card"] ? e(Fe) : e(Ie, -1);
	});
	var Le = jn(Pe, 2), Re = (e) => {
		var t = lo(), a = kn(t);
		ri(a, 20, () => i().cards, (e) => e, (e, t) => {
			{
				let a = /* @__PURE__ */ Bt(() => q(s) && r());
				Hi(e, {
					get hass() {
						return n();
					},
					get preview() {
						return q(a);
					},
					get config() {
						return t;
					},
					get marginTop() {
						return i()["child-margin-top"];
					},
					get open() {
						return q(s);
					},
					get animation() {
						return i().animation;
					},
					get animationState() {
						return q(u);
					},
					get clearCardCss() {
						return i()["clear-children"];
					}
				});
			}
		}), rt(a), rt(t), Yn(() => {
			gi(t, 1, `children-wrapper ${i().animation ? "animation " + q(u) : ""}${q(s) ? " open" : " close"}`, "svelte-1jqiztq"), vi(a, `--expander-card-display:${i()["expander-card-display"] ?? ""};
                --gap:${(q(s) && q(u) !== "closing" ? i()["expanded-gap"] : i().gap) ?? ""};
                --child-padding:${(q(s) && q(u) !== "closing" ? i()["child-padding"] : "0px") ?? ""};`), gi(a, 1, `children-container${q(s) ? " open" : " close"}${i().animation ? " animation " + q(u) : ""}`, "svelte-1jqiztq");
		}), Y(e, t);
	};
	$r(Le, (e) => {
		i().cards && e(Re);
	});
	var ze = jn(Le, 2), Be = (e) => {
		var t = Br();
		li(An(t), () => q(ee)), Y(e, t);
	};
	return $r(ze, (e) => {
		q(ee) && e(Be);
	}), rt(Ne), Oi(Ne, (e) => F(m, e), () => q(m)), Yn(() => {
		gi(Ne, 1, `expander-card${i().clear ? " clear" : ""}${q(s) ? " open" : " close"} ${q(u)}${i().animation ? " animation " + q(u) : ""}`, "svelte-1jqiztq"), vi(Ne, `--expander-card-display:${i()["expander-card-display"] ?? ""};
     --gap:${(q(s) && q(u) !== "closing" ? i()["expanded-gap"] : i().gap) ?? ""}; --padding:${i().padding ?? ""};
     --expander-state:${q(s) ?? ""};
     --icon-rotate-degree:${i()["icon-rotate-degree"] ?? ""};
     --card-background:${(q(s) && q(u) !== "closing" && i()["expander-card-background-expanded"] ? i()["expander-card-background-expanded"] : i()["expander-card-background"]) ?? ""};
     --background-animation-duration:${q(f) ?? ""}s;
     --expander-card-overlay-height:${q(p) ? `${q(p)}px` : "auto"};
    `);
	}), Y(e, Ne), mt(Me);
}
Mr(["click"]), customElements.define("expander-card", Fi(po, {
	hass: {},
	preview: {},
	config: {}
}, [], [], { mode: "open" }, (e) => class extends e {
	config;
	static async getConfigElement() {
		return await b(), document.createElement("expander-card-editor");
	}
	static getStubConfig() {
		return {
			type: "custom:expander-card",
			title: "Expander Card",
			cards: []
		};
	}
	setConfig(e = {}) {
		this.config = {
			...io,
			...e
		};
	}
}));
//#endregion
//#region package.json
var mo = "7.1.6", ho = globalThis, go = ho.ShadowRoot && (ho.ShadyCSS === void 0 || ho.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, _o = Symbol(), vo = /* @__PURE__ */ new WeakMap(), yo = class {
	constructor(e, t, n) {
		if (this._$cssResult$ = !0, n !== _o) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
		this.cssText = e, this.t = t;
	}
	get styleSheet() {
		let e = this.o, t = this.t;
		if (go && e === void 0) {
			let n = t !== void 0 && t.length === 1;
			n && (e = vo.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), n && vo.set(t, e));
		}
		return e;
	}
	toString() {
		return this.cssText;
	}
}, bo = (e) => new yo(typeof e == "string" ? e : e + "", void 0, _o), xo = (e, ...t) => new yo(e.length === 1 ? e[0] : t.reduce((t, n, r) => t + ((e) => {
	if (!0 === e._$cssResult$) return e.cssText;
	if (typeof e == "number") return e;
	throw Error("Value passed to 'css' function must be a 'css' function result: " + e + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
})(n) + e[r + 1], e[0]), e, _o), So = (e, t) => {
	if (go) e.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
	else for (let n of t) {
		let t = document.createElement("style"), r = ho.litNonce;
		r !== void 0 && t.setAttribute("nonce", r), t.textContent = n.cssText, e.appendChild(t);
	}
}, Co = go ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((e) => {
	let t = "";
	for (let n of e.cssRules) t += n.cssText;
	return bo(t);
})(e) : e, { is: wo, defineProperty: To, getOwnPropertyDescriptor: Eo, getOwnPropertyNames: Do, getOwnPropertySymbols: Oo, getPrototypeOf: ko } = Object, Ao = globalThis, jo = Ao.trustedTypes, Mo = jo ? jo.emptyScript : "", No = Ao.reactiveElementPolyfillSupport, Po = (e, t) => e, Fo = {
	toAttribute(e, t) {
		switch (t) {
			case Boolean:
				e = e ? Mo : null;
				break;
			case Object:
			case Array: e = e == null ? e : JSON.stringify(e);
		}
		return e;
	},
	fromAttribute(e, t) {
		let n = e;
		switch (t) {
			case Boolean:
				n = e !== null;
				break;
			case Number:
				n = e === null ? null : Number(e);
				break;
			case Object:
			case Array: try {
				n = JSON.parse(e);
			} catch {
				n = null;
			}
		}
		return n;
	}
}, Io = (e, t) => !wo(e, t), Lo = {
	attribute: !0,
	type: String,
	converter: Fo,
	reflect: !1,
	useDefault: !1,
	hasChanged: Io
};
Symbol.metadata ??= Symbol("metadata"), Ao.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var Ro = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ??= []).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = Lo) {
		if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
			let n = Symbol(), r = this.getPropertyDescriptor(e, n, t);
			r !== void 0 && To(this.prototype, e, r);
		}
	}
	static getPropertyDescriptor(e, t, n) {
		let { get: r, set: i } = Eo(this.prototype, e) ?? {
			get() {
				return this[t];
			},
			set(e) {
				this[t] = e;
			}
		};
		return {
			get: r,
			set(t) {
				let a = r?.call(this);
				i?.call(this, t), this.requestUpdate(e, a, n);
			},
			configurable: !0,
			enumerable: !0
		};
	}
	static getPropertyOptions(e) {
		return this.elementProperties.get(e) ?? Lo;
	}
	static _$Ei() {
		if (this.hasOwnProperty(Po("elementProperties"))) return;
		let e = ko(this);
		e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
	}
	static finalize() {
		if (this.hasOwnProperty(Po("finalized"))) return;
		if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Po("properties"))) {
			let e = this.properties, t = [...Do(e), ...Oo(e)];
			for (let n of t) this.createProperty(n, e[n]);
		}
		let e = this[Symbol.metadata];
		if (e !== null) {
			let t = litPropertyMetadata.get(e);
			if (t !== void 0) for (let [e, n] of t) this.elementProperties.set(e, n);
		}
		this._$Eh = /* @__PURE__ */ new Map();
		for (let [e, t] of this.elementProperties) {
			let n = this._$Eu(e, t);
			n !== void 0 && this._$Eh.set(n, e);
		}
		this.elementStyles = this.finalizeStyles(this.styles);
	}
	static finalizeStyles(e) {
		let t = [];
		if (Array.isArray(e)) {
			let n = new Set(e.flat(Infinity).reverse());
			for (let e of n) t.unshift(Co(e));
		} else e !== void 0 && t.push(Co(e));
		return t;
	}
	static _$Eu(e, t) {
		let n = t.attribute;
		return !1 === n ? void 0 : typeof n == "string" ? n : typeof e == "string" ? e.toLowerCase() : void 0;
	}
	constructor() {
		super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
	}
	_$Ev() {
		this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((e) => e(this));
	}
	addController(e) {
		(this._$EO ??= /* @__PURE__ */ new Set()).add(e), this.renderRoot !== void 0 && this.isConnected && e.hostConnected?.();
	}
	removeController(e) {
		this._$EO?.delete(e);
	}
	_$E_() {
		let e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
		for (let n of t.keys()) this.hasOwnProperty(n) && (e.set(n, this[n]), delete this[n]);
		e.size > 0 && (this._$Ep = e);
	}
	createRenderRoot() {
		let e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
		return So(e, this.constructor.elementStyles), e;
	}
	connectedCallback() {
		this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
	}
	enableUpdating(e) {}
	disconnectedCallback() {
		this._$EO?.forEach((e) => e.hostDisconnected?.());
	}
	attributeChangedCallback(e, t, n) {
		this._$AK(e, n);
	}
	_$ET(e, t) {
		let n = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, n);
		if (r !== void 0 && !0 === n.reflect) {
			let i = (n.converter?.toAttribute === void 0 ? Fo : n.converter).toAttribute(t, n.type);
			this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
		}
	}
	_$AK(e, t) {
		let n = this.constructor, r = n._$Eh.get(e);
		if (r !== void 0 && this._$Em !== r) {
			let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? Fo : e.converter;
			this._$Em = r;
			let a = i.fromAttribute(t, e.type);
			this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
		}
	}
	requestUpdate(e, t, n, r = !1, i) {
		if (e !== void 0) {
			let a = this.constructor;
			if (!1 === r && (i = this[e]), n ??= a.getPropertyOptions(e), !((n.hasChanged ?? Io)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
			this.C(e, t, n);
		}
		!1 === this.isUpdatePending && (this._$ES = this._$EP());
	}
	C(e, t, { useDefault: n, reflect: r, wrapped: i }, a) {
		n && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, a ?? t ?? this[e]), !0 !== i || a !== void 0) || (this._$AL.has(e) || (this.hasUpdated || n || (t = void 0), this._$AL.set(e, t)), !0 === r && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
	}
	async _$EP() {
		this.isUpdatePending = !0;
		try {
			await this._$ES;
		} catch (e) {
			Promise.reject(e);
		}
		let e = this.scheduleUpdate();
		return e != null && await e, !this.isUpdatePending;
	}
	scheduleUpdate() {
		return this.performUpdate();
	}
	performUpdate() {
		if (!this.isUpdatePending) return;
		if (!this.hasUpdated) {
			if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
				for (let [e, t] of this._$Ep) this[e] = t;
				this._$Ep = void 0;
			}
			let e = this.constructor.elementProperties;
			if (e.size > 0) for (let [t, n] of e) {
				let { wrapped: e } = n, r = this[t];
				!0 !== e || this._$AL.has(t) || r === void 0 || this.C(t, void 0, n, r);
			}
		}
		let e = !1, t = this._$AL;
		try {
			e = this.shouldUpdate(t), e ? (this.willUpdate(t), this._$EO?.forEach((e) => e.hostUpdate?.()), this.update(t)) : this._$EM();
		} catch (t) {
			throw e = !1, this._$EM(), t;
		}
		e && this._$AE(t);
	}
	willUpdate(e) {}
	_$AE(e) {
		this._$EO?.forEach((e) => e.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
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
		this._$Eq &&= this._$Eq.forEach((e) => this._$ET(e, this[e])), this._$EM();
	}
	updated(e) {}
	firstUpdated(e) {}
};
Ro.elementStyles = [], Ro.shadowRootOptions = { mode: "open" }, Ro[Po("elementProperties")] = /* @__PURE__ */ new Map(), Ro[Po("finalized")] = /* @__PURE__ */ new Map(), No?.({ ReactiveElement: Ro }), (Ao.reactiveElementVersions ??= []).push("2.1.2");
//#endregion
//#region node_modules/.pnpm/lit-html@3.3.3/node_modules/lit-html/lit-html.js
var zo = globalThis, Bo = (e) => e, Vo = zo.trustedTypes, Ho = Vo ? Vo.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, Uo = "$lit$", Wo = `lit$${Math.random().toFixed(9).slice(2)}$`, Go = "?" + Wo, Ko = `<${Go}>`, qo = document, Jo = () => qo.createComment(""), Yo = (e) => e === null || typeof e != "object" && typeof e != "function", Xo = Array.isArray, Zo = (e) => Xo(e) || typeof e?.[Symbol.iterator] == "function", Qo = "[ 	\n\f\r]", $o = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, es = /-->/g, ts = />/g, ns = RegExp(`>|${Qo}(?:([^\\s"'>=/]+)(${Qo}*=${Qo}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), rs = /'/g, is = /"/g, as = /^(?:script|style|textarea|title)$/i, os = ((e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}))(1), ss = Symbol.for("lit-noChange"), Q = Symbol.for("lit-nothing"), cs = /* @__PURE__ */ new WeakMap(), ls = qo.createTreeWalker(qo, 129);
function us(e, t) {
	if (!Xo(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return Ho === void 0 ? t : Ho.createHTML(t);
}
var ds = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = $o;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === $o ? c[1] === "!--" ? o = es : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = ns) : (as.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = ns) : o = ts : o === ns ? c[0] === ">" ? (o = i ?? $o, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? ns : c[3] === "\"" ? is : rs) : o === is || o === rs ? o = ns : o === es || o === ts ? o = $o : (o = ns, i = void 0);
		let d = o === ns && e[t + 1].startsWith("/>") ? " " : "";
		a += o === $o ? n + Ko : l >= 0 ? (r.push(s), n.slice(0, l) + Uo + n.slice(l) + Wo + d) : n + Wo + (l === -2 ? t : d);
	}
	return [us(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, fs = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = ds(t, n);
		if (this.el = e.createElement(l, r), ls.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = ls.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(Uo)) {
					let t = u[o++], n = i.getAttribute(e).split(Wo), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? _s : r[1] === "?" ? vs : r[1] === "@" ? ys : gs
					}), i.removeAttribute(e);
				} else e.startsWith(Wo) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (as.test(i.tagName)) {
					let e = i.textContent.split(Wo), t = e.length - 1;
					if (t > 0) {
						i.textContent = Vo ? Vo.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], Jo()), ls.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], Jo());
					}
				}
			} else if (i.nodeType === 8) if (i.data === Go) c.push({
				type: 2,
				index: a
			});
			else {
				let e = -1;
				for (; (e = i.data.indexOf(Wo, e + 1)) !== -1;) c.push({
					type: 7,
					index: a
				}), e += Wo.length - 1;
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = qo.createElement("template");
		return n.innerHTML = e, n;
	}
};
function ps(e, t, n = e, r) {
	if (t === ss) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = Yo(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = ps(e, i._$AS(e, t.values), i, r)), t;
}
var ms = class {
	constructor(e, t) {
		this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
	}
	get parentNode() {
		return this._$AM.parentNode;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	u(e) {
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? qo).importNode(t, !0);
		ls.currentNode = r;
		let i = ls.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new hs(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new bs(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = ls.nextNode(), a++);
		}
		return ls.currentNode = qo, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, hs = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = Q, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
	}
	get parentNode() {
		let e = this._$AA.parentNode, t = this._$AM;
		return t !== void 0 && e?.nodeType === 11 && (e = t.parentNode), e;
	}
	get startNode() {
		return this._$AA;
	}
	get endNode() {
		return this._$AB;
	}
	_$AI(e, t = this) {
		e = ps(this, e, t), Yo(e) ? e === Q || e == null || e === "" ? (this._$AH !== Q && this._$AR(), this._$AH = Q) : e !== this._$AH && e !== ss && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? Zo(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== Q && Yo(this._$AH) ? this._$AA.nextSibling.data = e : this.T(qo.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = fs.createElement(us(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new ms(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = cs.get(e.strings);
		return t === void 0 && cs.set(e.strings, t = new fs(e)), t;
	}
	k(t) {
		Xo(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(Jo()), this.O(Jo()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = Bo(e).nextSibling;
			Bo(e).remove(), e = t;
		}
	}
	setConnected(e) {
		this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
	}
}, gs = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = Q, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = Q;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = ps(this, e, t, 0), a = !Yo(e) || e !== this._$AH && e !== ss, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = ps(this, r[n + o], t, o), s === ss && (s = this._$AH[o]), a ||= !Yo(s) || s !== this._$AH[o], s === Q ? e = Q : e !== Q && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === Q ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, _s = class extends gs {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === Q ? void 0 : e;
	}
}, vs = class extends gs {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== Q);
	}
}, ys = class extends gs {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = ps(this, e, t, 0) ?? Q) === ss) return;
		let n = this._$AH, r = e === Q && n !== Q || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== Q && (n === Q || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, bs = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		ps(this, e);
	}
}, xs = zo.litHtmlPolyfillSupport;
xs?.(fs, hs), (zo.litHtmlVersions ??= []).push("3.3.3");
var Ss = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new hs(t.insertBefore(Jo(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, Cs = globalThis, ws = class extends Ro {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Ss(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return ss;
	}
};
ws._$litElement$ = !0, ws.finalized = !0, Cs.litElementHydrateSupport?.({ LitElement: ws });
var Ts = Cs.litElementPolyfillSupport;
Ts?.({ LitElement: ws }), (Cs.litElementVersions ??= []).push("4.2.2");
//#endregion
//#region node_modules/.pnpm/@lit+reactive-element@2.1.2/node_modules/@lit/reactive-element/decorators/custom-element.js
var Es = (e) => (t, n) => {
	n === void 0 ? customElements.define(e, t) : n.addInitializer(() => {
		customElements.define(e, t);
	});
}, Ds = {
	attribute: !0,
	type: String,
	converter: Fo,
	reflect: !1,
	hasChanged: Io
}, Os = (e = Ds, t, n) => {
	let { kind: r, metadata: i } = n, a = globalThis.litPropertyMetadata.get(i);
	if (a === void 0 && globalThis.litPropertyMetadata.set(i, a = /* @__PURE__ */ new Map()), r === "setter" && ((e = Object.create(e)).wrapped = !0), a.set(n.name, e), r === "accessor") {
		let { name: r } = n;
		return {
			set(n) {
				let i = t.get.call(this);
				t.set.call(this, n), this.requestUpdate(r, i, e, !0, n);
			},
			init(t) {
				return t !== void 0 && this.C(r, void 0, e, t), t;
			}
		};
	}
	if (r === "setter") {
		let { name: r } = n;
		return function(n) {
			let i = this[r];
			t.call(this, n), this.requestUpdate(r, i, e, !0, n);
		};
	}
	throw Error("Unsupported decorator location: " + r);
};
function ks(e) {
	return (t, n) => typeof n == "object" ? Os(e, t, n) : ((e, t, n) => {
		let r = t.hasOwnProperty(n);
		return t.constructor.createProperty(n, e), r ? Object.getOwnPropertyDescriptor(t, n) : void 0;
	})(e, t, n);
}
//#endregion
//#region node_modules/.pnpm/@lit+reactive-element@2.1.2/node_modules/@lit/reactive-element/decorators/state.js
function As(e) {
	return ks({
		...e,
		state: !0,
		attribute: !1
	});
}
//#endregion
//#region node_modules/.pnpm/@lit+reactive-element@2.1.2/node_modules/@lit/reactive-element/decorators/base.js
var js = (e, t, n) => (n.configurable = !0, n.enumerable = !0, Reflect.decorate && typeof t != "object" && Object.defineProperty(e, t, n), n);
//#endregion
//#region node_modules/.pnpm/@lit+reactive-element@2.1.2/node_modules/@lit/reactive-element/decorators/query.js
function Ms(e, t) {
	return (n, r, i) => {
		let a = (t) => t.renderRoot?.querySelector(e) ?? null;
		if (t) {
			let { get: e, set: t } = typeof r == "object" ? n : i ?? (() => {
				let e = Symbol();
				return {
					get() {
						return this[e];
					},
					set(t) {
						this[e] = t;
					}
				};
			})();
			return js(n, r, { get() {
				let n = e.call(this);
				return n === void 0 && (n = a(this), (n !== null || this.hasUpdated) && t.call(this, n)), n;
			} });
		}
		return js(n, r, { get() {
			return a(this);
		} });
	};
}
//#endregion
//#region node_modules/.pnpm/lit-html@3.3.3/node_modules/lit-html/directives/if-defined.js
var Ns = (e) => e ?? Q, Ps = xo`
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
`, Fs = xo`
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
//#endregion
//#region \0@oxc-project+runtime@0.133.0/helpers/esm/decorate.js
function Is(e, t, n, r) {
	var i = arguments.length, a = i < 3 ? t : r === null ? r = Object.getOwnPropertyDescriptor(t, n) : r, o;
	if (typeof Reflect == "object" && typeof Reflect.decorate == "function") a = Reflect.decorate(e, t, n, r);
	else for (var s = e.length - 1; s >= 0; s--) (o = e[s]) && (a = (i < 3 ? o(a) : i > 3 ? o(t, n, a) : o(t, n)) || a);
	return i > 3 && a && Object.defineProperty(t, n, a), a;
}
//#endregion
//#region src/title-card/titleCardEditForm.ts
var Ls = "custom:", Rs = (e) => e.startsWith(Ls), zs = (e) => window.customCards?.find((t) => t.type === e), Bs = (e) => e.replace(Ls, ""), $ = class extends ws {
	constructor(...e) {
		super(...e), this.large = !1, this._config = {}, this._cardGUIMode = !0, this._cardGUIModeAvailable = !0, this._error = !1;
	}
	async showDialog(e) {
		this._params = e, this._config = e.config ?? {}, this.lovelace = e.lovelace, this.large = !1;
	}
	closeDialog() {
		return this._params = void 0, this._config = {}, this.dispatchEvent(new CustomEvent("dialog-closed", { detail: { dialog: this.localName } })), !0;
	}
	_submit() {
		this._params?.submit?.(this._config), this.closeDialog();
	}
	_cancel() {
		this._params?.cancel?.(), this.closeDialog();
	}
	_enlarge() {
		this.large = !this.large;
	}
	_ignoreKeydown(e) {
		e.stopPropagation();
	}
	render() {
		if (!this._params || !this.hass) return Q;
		let e = !this._config.type || this._error || void 0, t = this._params.title ?? "";
		if (this._config.type) {
			let e;
			Rs(this._config.type) ? (e = zs(Bs(this._config.type))?.name, e?.toLowerCase().endsWith(" card") && (e = e.substring(0, e.length - 5))) : e = this.hass.localize(`ui.panel.lovelace.editor.card.${this._config.type}.name`), t = `${t} - ${this.hass.localize("ui.panel.lovelace.editor.edit_card.typed_header", { type: e })}`;
		}
		return os`
        <ha-dialog
            open
            scrimClickAction
            escapeKeyAction
            @keydown=${this._ignoreKeydown.bind(this)}
            @closed=${this._cancel.bind(this)}
            .heading=${t}
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
                <span slot="title" @click=${this._enlarge.bind(this)}>${t}</span>
            </ha-dialog-header>
            ${this._renderCardEditor()}
            <ha-dialog-footer slot="footer">
                <div slot="primaryAction" @click=${this._submit.bind(this)}>
                    <ha-button
                        appearance="plain"
                        size="s"
                        @click=${this._cancel.bind(this)}
                        dialogInitialFocus
                    >
                        ${this._params.cancelText || this.hass.localize("ui.common.cancel")}
                    </ha-button>
                    <ha-button
                        size="s"
                        @click=${this._submit.bind(this)} 
                        disabled=${Ns(e)}
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
		this._cardEditorEl?.toggleMode();
	}
	_deleteCard() {
		this._config = {};
	}
	_cardConfigChanged(e) {
		e.stopPropagation(), this._config = { ...e.detail.config }, this._error = e.detail.error, this._cardGUIModeAvailable = e.detail.guiModeAvailable;
	}
	_cardGUIModeChanged(e) {
		e.stopPropagation(), this._cardGUIMode = e.detail.guiMode, this._cardGUIModeAvailable = e.detail.guiModeAvailable;
	}
	_renderCardEditorActions() {
		if (!this._config.type) return Q;
		let e = this.hass.localize(!this._cardEditorEl || this._cardGUIMode ? "ui.panel.lovelace.editor.edit_card.show_code_editor" : "ui.panel.lovelace.editor.edit_card.show_visual_editor");
		return os`
            <div slot="secondaryAction">
                <ha-button
                appearance="plain"
                size="s"
                @click=${this._toggleCardMode.bind(this)}
                .disabled=${!this._cardGUIModeAvailable}
                >
                    ${e}
                </ha-button>
                <ha-button
                appearance="plain"
                size="s"
                @click=${this._deleteCard.bind(this)}
                >
                    Change card
                </ha-button>
            </div>
        `;
	}
	_renderCardEditor() {
		let e = this._error ? "blur" : "", t = this._error ? os` <ha-spinner aria-label="Can't update card"></ha-spinner> ` : "";
		return os`
        ${this._config.type ? os`
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
                        class=${e}
                    ></hui-card>
                    ${t}
                </div>
            </div>
            ` : os`
            <hui-card-picker
                .hass=${this.hass}
                .lovelace=${this.lovelace}
                @config-changed=${this._cardConfigChanged.bind(this)}
            ></hui-card-picker>
            `}
        `;
	}
	static {
		this.styles = [
			Ps,
			Fs,
			xo`
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
	}
};
Is([ks({ attribute: !1 })], $.prototype, "hass", void 0), Is([ks({
	type: Boolean,
	reflect: !0
})], $.prototype, "large", void 0), Is([ks({ attribute: !1 })], $.prototype, "lovelace", void 0), Is([As()], $.prototype, "_params", void 0), Is([As()], $.prototype, "_config", void 0), Is([As()], $.prototype, "_cardGUIMode", void 0), Is([As()], $.prototype, "_cardGUIModeAvailable", void 0), Is([As()], $.prototype, "_error", void 0), Is([Ms("hui-card-element-editor")], $.prototype, "_cardEditorEl", void 0), $ = Is([Es("expander-card-title-card-edit-form")], $), console.info(`%c  Expander-Card \n%c Version ${mo}`, "color: orange; font-weight: bold; background: black", "color: white; font-weight: bold; background: dimgray"), window.customCards = window.customCards || [], window.customCards.push({
	type: "expander-card",
	name: "Expander Card",
	preview: !0,
	description: "Expander card"
}), customElements.get("expander-card-title-card-edit-form") || customElements.define("expander-card-title-card-edit-form", $);
//#endregion
export { po as default };

//# sourceMappingURL=expander-card.js.map