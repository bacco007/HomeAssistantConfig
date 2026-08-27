//#region \0rolldown/runtime.js
var e = Object.defineProperty, t = (e, t, n) => () => {
	if (n) throw n[0];
	try {
		return e && (t = e(e = 0)), t;
	} catch (e) {
		throw n = [e], e;
	}
}, n = (t, n) => {
	let r = {};
	for (var i in t) e(r, i, {
		get: t[i],
		enumerable: !0
	});
	return n || e(r, Symbol.toStringTag, { value: "Module" }), r;
};
//#endregion
//#region node_modules/custom-card-helpers/dist/index.m.js
function r() {
	return (r = Object.assign || function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}).apply(this, arguments);
}
function i(e) {
	return e.substr(0, e.indexOf("."));
}
function a(e) {
	return e !== void 0 && e.action !== "none";
}
function o(e, t, n) {
	if (t.has("config") || n) return !0;
	if (e.config.entity) {
		var r = t.get("hass");
		return !r || r.states[e.config.entity] !== e.hass.states[e.config.entity];
	}
	return !1;
}
var s, c, l, u, d, f, p, m, h, g, _, v, y, b, x, S, C, w, T, E, D = t((() => {
	l = function(e, t) {
		return u(t).format(e);
	}, u = function(e) {
		return new Intl.DateTimeFormat(e.language, {
			day: "numeric",
			month: "short"
		});
	}, (function(e) {
		e.language = "language", e.system = "system", e.comma_decimal = "comma_decimal", e.decimal_comma = "decimal_comma", e.space_comma = "space_comma", e.none = "none";
	})(s || (s = {})), function(e) {
		e.language = "language", e.system = "system", e.am_pm = "12", e.twenty_four = "24";
	}(c || (c = {})), d = function(e) {
		if (e.time_format === c.language || e.time_format === c.system) {
			var t = e.time_format === c.language ? e.language : void 0, n = (/* @__PURE__ */ new Date()).toLocaleString(t);
			return n.includes("AM") || n.includes("PM");
		}
		return e.time_format === c.am_pm;
	}, f = function(e, t) {
		return p(t).format(e);
	}, p = function(e) {
		return new Intl.DateTimeFormat(e.language, {
			hour: "numeric",
			minute: "2-digit",
			hour12: d(e)
		});
	}, m = function(e) {
		switch (e.number_format) {
			case s.comma_decimal: return ["en-US", "en"];
			case s.decimal_comma: return [
				"de",
				"es",
				"it"
			];
			case s.space_comma: return [
				"fr",
				"sv",
				"cs"
			];
			case s.system: return;
			default: return e.language;
		}
	}, h = function(e, t) {
		return t === void 0 && (t = 2), Math.round(e * 10 ** t) / 10 ** t;
	}, g = function(e, t, n) {
		var r = t ? m(t) : void 0;
		if (Number.isNaN = Number.isNaN || function e(t) {
			return typeof t == "number" && e(t);
		}, t?.number_format !== s.none && !Number.isNaN(Number(e)) && Intl) try {
			return new Intl.NumberFormat(r, _(e, n)).format(Number(e));
		} catch (t) {
			return console.error(t), new Intl.NumberFormat(void 0, _(e, n)).format(Number(e));
		}
		return typeof e == "string" ? e : h(e, n?.maximumFractionDigits).toString() + (n?.style === "currency" ? " " + n.currency : "");
	}, _ = function(e, t) {
		var n = r({ maximumFractionDigits: 2 }, t);
		if (typeof e != "string") return n;
		if (!t || !t.minimumFractionDigits && !t.maximumFractionDigits) {
			var i = e.indexOf(".") > -1 ? e.split(".")[1].length : 0;
			n.minimumFractionDigits = i, n.maximumFractionDigits = i;
		}
		return n;
	}, v = [
		"closed",
		"locked",
		"off"
	], y = function(e, t, n, r) {
		r = r || {}, n = n ?? {};
		var i = new Event(t, {
			bubbles: r.bubbles === void 0 || r.bubbles,
			cancelable: !!r.cancelable,
			composed: r.composed === void 0 || r.composed
		});
		return i.detail = n, e.dispatchEvent(i), i;
	}, b = function(e) {
		y(window, "haptic", e);
	}, x = function(e, t, n) {
		n === void 0 && (n = !1), n ? history.replaceState(null, "", t) : history.pushState(null, "", t), y(window, "location-changed", { replace: n });
	}, S = function(e, t, n) {
		n === void 0 && (n = !0);
		var r, a = i(t), o = a === "group" ? "homeassistant" : a;
		switch (a) {
			case "lock":
				r = n ? "unlock" : "lock";
				break;
			case "cover":
				r = n ? "open_cover" : "close_cover";
				break;
			default: r = n ? "turn_on" : "turn_off";
		}
		return e.callService(o, r, { entity_id: t });
	}, C = function(e, t) {
		return S(e, t, v.includes(e.states[t].state));
	}, w = function(e, t, n, r) {
		if (r || (r = { action: "more-info" }), !r.confirmation || r.confirmation.exemptions && r.confirmation.exemptions.some(function(e) {
			return e.user === t.user.id;
		}) || (b("warning"), confirm(r.confirmation.text || "Are you sure you want to " + r.action + "?"))) switch (r.action) {
			case "more-info":
				(n.entity || n.camera_image) && y(e, "hass-more-info", { entityId: n.entity ? n.entity : n.camera_image });
				break;
			case "navigate":
				r.navigation_path && x(0, r.navigation_path);
				break;
			case "url":
				r.url_path && window.open(r.url_path);
				break;
			case "toggle":
				n.entity && (C(t, n.entity), b("success"));
				break;
			case "call-service":
				if (!r.service) return void b("failure");
				var i = r.service.split(".", 2);
				t.callService(i[0], i[1], r.service_data, r.target), b("success");
				break;
			case "fire-dom-event": y(e, "ll-custom", r);
		}
	}, T = function(e, t, n, r) {
		var i;
		r === "double_tap" && n.double_tap_action ? i = n.double_tap_action : r === "hold" && n.hold_action ? i = n.hold_action : r === "tap" && n.tap_action && (i = n.tap_action), w(e, t, n, i);
	}, E = function() {
		var e = document.querySelector("home-assistant");
		if (e = (e = (e = (e = (e = (e = (e = (e = e && e.shadowRoot) && e.querySelector("home-assistant-main")) && e.shadowRoot) && e.querySelector("app-drawer-layout partial-panel-resolver")) && e.shadowRoot || e) && e.querySelector("ha-panel-lovelace")) && e.shadowRoot) && e.querySelector("hui-root")) {
			var t = e.lovelace;
			return t.current_view = e.___curView, t;
		}
		return null;
	};
}));
//#endregion
//#region node_modules/is-valid-css-color/dist/index.js
D();
var O = String.raw`[+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:[eE][+-]?\d+)?`, k = `(?:${O}%?|none)`, A = `(?:${O}(?:deg|grad|rad|turn)?|none)`, j = `(?:${String.raw`${O}\s*,\s*${O}\s*,\s*${O}`}|${String.raw`${O}%\s*,\s*${O}%\s*,\s*${O}%`})${String.raw`(?:\s*,\s*${O}%?)?`}`, M = `(?:${O}%?|none)`, N = String.raw`(?:\s*\/\s*${M})?`, P = String.raw`${M}\s+${M}\s+${M}${N}`, ee = new RegExp(String.raw`^rgba?\(\s*(?:${j})\s*\)$`, "i"), te = new RegExp(String.raw`^rgba?\(\s*(?:${P})\s*\)$`, "i"), F = (e) => typeof e == "string" && (e = e.trim(), ee.test(e) || te.test(e)), ne = `(?:${O}(?:deg|grad|rad|turn)?)`, re = `(?:${O}%)`, ie = `(?:${O}%?)`, ae = String.raw`${ne}\s*,\s*${re}\s*,\s*${re}(?:\s*,\s*${ie})?`, oe = String.raw`${A}\s+${k}\s+${k}(?:\s*\/\s*${k})?`, se = new RegExp(String.raw`^hsla?\(\s*${ae}\s*\)$`, "i"), ce = new RegExp(String.raw`^hsla?\(\s*${oe}\s*\)$`, "i"), le = (e) => typeof e == "string" && (e = e.trim(), se.test(e) || ce.test(e)), ue = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}(?:[0-9a-f]{2})?)$/i, de = (e) => typeof e == "string" && ue.test(e.trim()), fe = new RegExp(String.raw`^hwb\(\s*${A}\s+${k}\s+${k}\s*(?:\/\s*${k}\s*)?\)$`, "i"), pe = (e) => typeof e == "string" && fe.test(e.trim()), me = new RegExp(String.raw`^lab\(\s*${k}\s+${k}\s+${k}(?:\s*\/\s*${k})?\s*\)$`, "i"), he = (e) => typeof e == "string" && me.test(e.trim()), ge = new RegExp(String.raw`^lch\(\s*${k}\s+${k}\s+${A}\s*(?:\/\s*${k}\s*)?\)$`, "i"), _e = (e) => typeof e == "string" && ge.test(e.trim()), I = new RegExp(String.raw`^oklab\(\s*${k}\s+${k}\s+${k}(?:\s*\/\s*${k})?\s*\)$`, "i"), ve = (e) => typeof e == "string" && I.test(e.trim()), ye = new RegExp(String.raw`^oklch\(\s*${k}\s+${k}\s+${A}\s*(?:\/\s*${k}\s*)?\)$`, "i"), be = (e) => typeof e == "string" && ye.test(e.trim()), xe = /* @__PURE__ */ new Set(/* @__PURE__ */ "accentcolor.accentcolortext.activeborder.activecaption.activetext.aliceblue.antiquewhite.appworkspace.aqua.aquamarine.azure.background.beige.bisque.black.blanchedalmond.blue.blueviolet.brown.burlywood.buttonborder.buttonface.buttonhighlight.buttonshadow.buttontext.cadetblue.canvas.canvastext.captiontext.chartreuse.chocolate.coral.cornflowerblue.cornsilk.crimson.currentcolor.cyan.darkblue.darkcyan.darkgoldenrod.darkgray.darkgreen.darkgrey.darkkhaki.darkmagenta.darkolivegreen.darkorange.darkorchid.darkred.darksalmon.darkseagreen.darkslateblue.darkslategray.darkslategrey.darkturquoise.darkviolet.deeppink.deepskyblue.dimgray.dimgrey.dodgerblue.field.fieldtext.firebrick.floralwhite.forestgreen.fuchsia.gainsboro.ghostwhite.gold.goldenrod.gray.graytext.green.greenyellow.grey.highlight.highlighttext.honeydew.hotpink.inactiveborder.inactivecaption.inactivecaptiontext.indianred.indigo.infobackground.infotext.ivory.khaki.lavender.lavenderblush.lawngreen.lemonchiffon.lightblue.lightcoral.lightcyan.lightgoldenrodyellow.lightgray.lightgreen.lightgrey.lightpink.lightsalmon.lightseagreen.lightskyblue.lightslategray.lightslategrey.lightsteelblue.lightyellow.lime.limegreen.linen.linktext.magenta.mark.marktext.maroon.mediumaquamarine.mediumblue.mediumorchid.mediumpurple.mediumseagreen.mediumslateblue.mediumspringgreen.mediumturquoise.mediumvioletred.menu.menutext.midnightblue.mintcream.mistyrose.moccasin.navajowhite.navy.oldlace.olive.olivedrab.orange.orangered.orchid.palegoldenrod.palegreen.paleturquoise.palevioletred.papayawhip.peachpuff.peru.pink.plum.powderblue.purple.rebeccapurple.red.rosybrown.royalblue.saddlebrown.salmon.sandybrown.scrollbar.seagreen.seashell.selecteditem.selecteditemtext.sienna.silver.skyblue.slateblue.slategray.slategrey.snow.springgreen.steelblue.tan.teal.thistle.threeddarkshadow.threedface.threedhighlight.threedlightshadow.threedshadow.tomato.transparent.turquoise.violet.visitedtext.wheat.white.whitesmoke.window.windowframe.windowtext.yellow.yellowgreen".split(".")), Se = (e) => typeof e == "string" && xe.has(e.trim().toLowerCase()), Ce = new RegExp(String.raw`^color\(\s*${"(?:srgb(?:-linear)?|display-p3(?:-linear)?|a98-rgb|prophoto-rgb|rec2020|xyz(?:-d(?:50|65))?)"}\s+${k}\s+${k}\s+${k}(?:\s*\/\s*${k})?\s*\)$`, "i"), we = (e) => typeof e == "string" && Ce.test(e.trim()), Te = (e) => {
	if (typeof e != "string") return !1;
	let t = e.trim();
	if (t.length === 0) return !1;
	if (t[0] === "#") return de(t);
	if (!t.includes("(")) return Se(t);
	switch (t[0]) {
		case "r":
		case "R": return F(t);
		case "c":
		case "C": return we(t);
		case "h":
		case "H": return pe(t) || le(t);
		case "l":
		case "L": return he(t) || _e(t);
		case "o":
		case "O": return ve(t) || be(t);
		default: return !1;
	}
}, Ee, De, Oe, ke, Ae, je, Me, Ne, Pe = t((() => {
	Ee = globalThis, De = Ee.ShadowRoot && (Ee.ShadyCSS === void 0 || Ee.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Oe = Symbol(), ke = /* @__PURE__ */ new WeakMap(), Ae = class {
		constructor(e, t, n) {
			if (this._$cssResult$ = !0, n !== Oe) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
			this.cssText = e, this.t = t;
		}
		get styleSheet() {
			let e = this.o, t = this.t;
			if (De && e === void 0) {
				let n = t !== void 0 && t.length === 1;
				n && (e = ke.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), n && ke.set(t, e));
			}
			return e;
		}
		toString() {
			return this.cssText;
		}
	}, je = (e) => new Ae(typeof e == "string" ? e : e + "", void 0, Oe), Me = (e, t) => {
		if (De) e.adoptedStyleSheets = t.map(((e) => e instanceof CSSStyleSheet ? e : e.styleSheet));
		else for (let n of t) {
			let t = document.createElement("style"), r = Ee.litNonce;
			r !== void 0 && t.setAttribute("nonce", r), t.textContent = n.cssText, e.appendChild(t);
		}
	}, Ne = De ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((e) => {
		let t = "";
		for (let n of e.cssRules) t += n.cssText;
		return je(t);
	})(e) : e;
})), Fe, Ie, Le, Re, ze, Be, Ve, He, Ue, We, Ge, Ke, qe, Je, Ye, Xe, Ze = t((() => {
	Pe(), {is: Ie, defineProperty: Le, getOwnPropertyDescriptor: Re, getOwnPropertyNames: ze, getOwnPropertySymbols: Be, getPrototypeOf: Ve} = Object, He = globalThis, Ue = He.trustedTypes, We = Ue ? Ue.emptyScript : "", Ge = He.reactiveElementPolyfillSupport, Ke = (e, t) => e, qe = {
		toAttribute(e, t) {
			switch (t) {
				case Boolean:
					e = e ? We : null;
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
	}, Je = (e, t) => !Ie(e, t), Ye = {
		attribute: !0,
		type: String,
		converter: qe,
		reflect: !1,
		useDefault: !1,
		hasChanged: Je
	}, (Fe = Symbol).metadata ?? (Fe.metadata = Symbol("metadata")), He.litPropertyMetadata ?? (He.litPropertyMetadata = /* @__PURE__ */ new WeakMap()), Xe = class extends HTMLElement {
		static addInitializer(e) {
			this._$Ei(), (this.l ?? (this.l = [])).push(e);
		}
		static get observedAttributes() {
			return this.finalize(), this._$Eh && [...this._$Eh.keys()];
		}
		static createProperty(e, t = Ye) {
			if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
				let n = Symbol(), r = this.getPropertyDescriptor(e, n, t);
				r !== void 0 && Le(this.prototype, e, r);
			}
		}
		static getPropertyDescriptor(e, t, n) {
			let { get: r, set: i } = Re(this.prototype, e) ?? {
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
			return this.elementProperties.get(e) ?? Ye;
		}
		static _$Ei() {
			if (this.hasOwnProperty(Ke("elementProperties"))) return;
			let e = Ve(this);
			e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
		}
		static finalize() {
			if (this.hasOwnProperty(Ke("finalized"))) return;
			if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Ke("properties"))) {
				let e = this.properties, t = [...ze(e), ...Be(e)];
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
				let n = new Set(e.flat(1 / 0).reverse());
				for (let e of n) t.unshift(Ne(e));
			} else e !== void 0 && t.push(Ne(e));
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
			this._$ES = new Promise(((e) => this.enableUpdating = e)), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach(((e) => e(this)));
		}
		addController(e) {
			(this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(e), this.renderRoot !== void 0 && this.isConnected && e.hostConnected?.();
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
			return Me(e, this.constructor.elementStyles), e;
		}
		connectedCallback() {
			this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), this._$EO?.forEach(((e) => e.hostConnected?.()));
		}
		enableUpdating(e) {}
		disconnectedCallback() {
			this._$EO?.forEach(((e) => e.hostDisconnected?.()));
		}
		attributeChangedCallback(e, t, n) {
			this._$AK(e, n);
		}
		_$ET(e, t) {
			let n = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, n);
			if (r !== void 0 && !0 === n.reflect) {
				let i = (n.converter?.toAttribute === void 0 ? qe : n.converter).toAttribute(t, n.type);
				this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
			}
		}
		_$AK(e, t) {
			let n = this.constructor, r = n._$Eh.get(e);
			if (r !== void 0 && this._$Em !== r) {
				let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? qe : e.converter;
				this._$Em = r;
				let a = i.fromAttribute(t, e.type);
				this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
			}
		}
		requestUpdate(e, t, n) {
			if (e !== void 0) {
				let r = this.constructor, i = this[e];
				if (n ?? (n = r.getPropertyOptions(e)), !((n.hasChanged ?? Je)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(r._$Eu(e, n)))) return;
				this.C(e, t, n);
			}
			!1 === this.isUpdatePending && (this._$ES = this._$EP());
		}
		C(e, t, { useDefault: n, reflect: r, wrapped: i }, a) {
			n && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(e) && (this._$Ej.set(e, a ?? t ?? this[e]), !0 !== i || a !== void 0) || (this._$AL.has(e) || (this.hasUpdated || n || (t = void 0), this._$AL.set(e, t)), !0 === r && this._$Em !== e && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(e));
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
				if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
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
				e = this.shouldUpdate(t), e ? (this.willUpdate(t), this._$EO?.forEach(((e) => e.hostUpdate?.())), this.update(t)) : this._$EM();
			} catch (t) {
				throw e = !1, this._$EM(), t;
			}
			e && this._$AE(t);
		}
		willUpdate(e) {}
		_$AE(e) {
			this._$EO?.forEach(((e) => e.hostUpdated?.())), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
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
			this._$Eq && (this._$Eq = this._$Eq.forEach(((e) => this._$ET(e, this[e])))), this._$EM();
		}
		updated(e) {}
		firstUpdated(e) {}
	}, Xe.elementStyles = [], Xe.shadowRootOptions = { mode: "open" }, Xe[Ke("elementProperties")] = /* @__PURE__ */ new Map(), Xe[Ke("finalized")] = /* @__PURE__ */ new Map(), Ge?.({ ReactiveElement: Xe }), (He.reactiveElementVersions ?? (He.reactiveElementVersions = [])).push("2.1.1");
}));
//#endregion
//#region node_modules/lit-html/lit-html.js
function Qe(e, t) {
	if (!lt(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return nt === void 0 ? t : nt.createHTML(t);
}
function $e(e, t, n = e, r) {
	if (t === B) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = ct(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ?? (n._$Co = []))[r] = i), i !== void 0 && (t = $e(e, i._$AS(e, t.values), i, r)), t;
}
var et, tt, nt, rt, L, it, at, ot, st, ct, lt, ut, dt, ft, pt, mt, ht, gt, _t, vt, yt, R, z, B, V, bt, xt, St, Ct, wt, Tt, Et, Dt, Ot, kt, At, jt, Mt, Nt, Pt = t((() => {
	et = globalThis, tt = et.trustedTypes, nt = tt ? tt.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, rt = "$lit$", L = `lit$${Math.random().toFixed(9).slice(2)}$`, it = "?" + L, at = `<${it}>`, ot = document, st = () => ot.createComment(""), ct = (e) => e === null || typeof e != "object" && typeof e != "function", lt = Array.isArray, ut = (e) => lt(e) || typeof e?.[Symbol.iterator] == "function", dt = "[ 	\n\f\r]", ft = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, pt = /-->/g, mt = />/g, ht = RegExp(`>|${dt}(?:([^\\s"'>=/]+)(${dt}*=${dt}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), gt = /'/g, _t = /"/g, vt = /^(?:script|style|textarea|title)$/i, yt = (e) => (t, ...n) => ({
		_$litType$: e,
		strings: t,
		values: n
	}), R = yt(1), z = yt(2), yt(3), B = Symbol.for("lit-noChange"), V = Symbol.for("lit-nothing"), bt = /* @__PURE__ */ new WeakMap(), xt = ot.createTreeWalker(ot, 129), St = (e, t) => {
		let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = ft;
		for (let t = 0; t < n; t++) {
			let n = e[t], s, c, l = -1, u = 0;
			for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === ft ? c[1] === "!--" ? o = pt : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = ht) : (vt.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = ht) : o = mt : o === ht ? c[0] === ">" ? (o = i ?? ft, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? ht : c[3] === "\"" ? _t : gt) : o === _t || o === gt ? o = ht : o === pt || o === mt ? o = ft : (o = ht, i = void 0);
			let d = o === ht && e[t + 1].startsWith("/>") ? " " : "";
			a += o === ft ? n + at : l >= 0 ? (r.push(s), n.slice(0, l) + rt + n.slice(l) + L + d) : n + L + (l === -2 ? t : d);
		}
		return [Qe(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
	}, Ct = class e {
		constructor({ strings: t, _$litType$: n }, r) {
			let i;
			this.parts = [];
			let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = St(t, n);
			if (this.el = e.createElement(l, r), xt.currentNode = this.el.content, n === 2 || n === 3) {
				let e = this.el.content.firstChild;
				e.replaceWith(...e.childNodes);
			}
			for (; (i = xt.nextNode()) !== null && c.length < s;) {
				if (i.nodeType === 1) {
					if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(rt)) {
						let t = u[o++], n = i.getAttribute(e).split(L), r = /([.?@])?(.*)/.exec(t);
						c.push({
							type: 1,
							index: a,
							name: r[2],
							strings: n,
							ctor: r[1] === "." ? Dt : r[1] === "?" ? Ot : r[1] === "@" ? kt : Et
						}), i.removeAttribute(e);
					} else e.startsWith(L) && (c.push({
						type: 6,
						index: a
					}), i.removeAttribute(e));
					if (vt.test(i.tagName)) {
						let e = i.textContent.split(L), t = e.length - 1;
						if (t > 0) {
							i.textContent = tt ? tt.emptyScript : "";
							for (let n = 0; n < t; n++) i.append(e[n], st()), xt.nextNode(), c.push({
								type: 2,
								index: ++a
							});
							i.append(e[t], st());
						}
					}
				} else if (i.nodeType === 8) {
					if (i.data === it) c.push({
						type: 2,
						index: a
					});
					else {
						let e = -1;
						for (; (e = i.data.indexOf(L, e + 1)) !== -1;) c.push({
							type: 7,
							index: a
						}), e += L.length - 1;
					}
				}
				a++;
			}
		}
		static createElement(e, t) {
			let n = ot.createElement("template");
			return n.innerHTML = e, n;
		}
	}, wt = class {
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
			let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? ot).importNode(t, !0);
			xt.currentNode = r;
			let i = xt.nextNode(), a = 0, o = 0, s = n[0];
			for (; s !== void 0;) {
				if (a === s.index) {
					let t;
					s.type === 2 ? t = new Tt(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new At(i, this, e)), this._$AV.push(t), s = n[++o];
				}
				a !== s?.index && (i = xt.nextNode(), a++);
			}
			return xt.currentNode = ot, r;
		}
		p(e) {
			let t = 0;
			for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
		}
	}, Tt = class e {
		get _$AU() {
			return this._$AM?._$AU ?? this._$Cv;
		}
		constructor(e, t, n, r) {
			this.type = 2, this._$AH = V, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
			e = $e(this, e, t), ct(e) ? e === V || e == null || e === "" ? (this._$AH !== V && this._$AR(), this._$AH = V) : e !== this._$AH && e !== B && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? ut(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
		}
		O(e) {
			return this._$AA.parentNode.insertBefore(e, this._$AB);
		}
		T(e) {
			this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
		}
		_(e) {
			this._$AH !== V && ct(this._$AH) ? this._$AA.nextSibling.data = e : this.T(ot.createTextNode(e)), this._$AH = e;
		}
		$(e) {
			let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = Ct.createElement(Qe(n.h, n.h[0]), this.options)), n);
			if (this._$AH?._$AD === r) this._$AH.p(t);
			else {
				let e = new wt(r, this), n = e.u(this.options);
				e.p(t), this.T(n), this._$AH = e;
			}
		}
		_$AC(e) {
			let t = bt.get(e.strings);
			return t === void 0 && bt.set(e.strings, t = new Ct(e)), t;
		}
		k(t) {
			lt(this._$AH) || (this._$AH = [], this._$AR());
			let n = this._$AH, r, i = 0;
			for (let a of t) i === n.length ? n.push(r = new e(this.O(st()), this.O(st()), this, this.options)) : r = n[i], r._$AI(a), i++;
			i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
		}
		_$AR(e = this._$AA.nextSibling, t) {
			for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
				let t = e.nextSibling;
				e.remove(), e = t;
			}
		}
		setConnected(e) {
			this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
		}
	}, Et = class {
		get tagName() {
			return this.element.tagName;
		}
		get _$AU() {
			return this._$AM._$AU;
		}
		constructor(e, t, n, r, i) {
			this.type = 1, this._$AH = V, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = V;
		}
		_$AI(e, t = this, n, r) {
			let i = this.strings, a = !1;
			if (i === void 0) e = $e(this, e, t, 0), a = !ct(e) || e !== this._$AH && e !== B, a && (this._$AH = e);
			else {
				let r = e, o, s;
				for (e = i[0], o = 0; o < i.length - 1; o++) s = $e(this, r[n + o], t, o), s === B && (s = this._$AH[o]), a || (a = !ct(s) || s !== this._$AH[o]), s === V ? e = V : e !== V && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
			}
			a && !r && this.j(e);
		}
		j(e) {
			e === V ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
		}
	}, Dt = class extends Et {
		constructor() {
			super(...arguments), this.type = 3;
		}
		j(e) {
			this.element[this.name] = e === V ? void 0 : e;
		}
	}, Ot = class extends Et {
		constructor() {
			super(...arguments), this.type = 4;
		}
		j(e) {
			this.element.toggleAttribute(this.name, !!e && e !== V);
		}
	}, kt = class extends Et {
		constructor(e, t, n, r, i) {
			super(e, t, n, r, i), this.type = 5;
		}
		_$AI(e, t = this) {
			if ((e = $e(this, e, t, 0) ?? V) === B) return;
			let n = this._$AH, r = e === V && n !== V || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== V && (n === V || r);
			r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
		}
		handleEvent(e) {
			typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
		}
	}, At = class {
		constructor(e, t, n) {
			this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
		}
		get _$AU() {
			return this._$AM._$AU;
		}
		_$AI(e) {
			$e(this, e);
		}
	}, jt = {
		M: rt,
		P: L,
		A: it,
		C: 1,
		L: St,
		R: wt,
		D: ut,
		V: $e,
		I: Tt,
		H: Et,
		N: Ot,
		U: kt,
		B: Dt,
		F: At
	}, Mt = et.litHtmlPolyfillSupport, Mt?.(Ct, Tt), (et.litHtmlVersions ?? (et.litHtmlVersions = [])).push("3.3.1"), Nt = (e, t, n) => {
		let r = n?.renderBefore ?? t, i = r._$litPart$;
		if (i === void 0) {
			let e = n?.renderBefore ?? null;
			r._$litPart$ = i = new Tt(t.insertBefore(st(), e), e, void 0, n ?? {});
		}
		return i._$AI(e), i;
	};
})), Ft, It, Lt, Rt, zt, Bt, Vt, Ht, Ut, Wt = t((() => {
	Ft = globalThis, It = Ft.ShadowRoot && (Ft.ShadyCSS === void 0 || Ft.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Lt = Symbol(), Rt = /* @__PURE__ */ new WeakMap(), zt = class {
		constructor(e, t, n) {
			if (this._$cssResult$ = !0, n !== Lt) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
			this.cssText = e, this.t = t;
		}
		get styleSheet() {
			let e = this.o, t = this.t;
			if (It && e === void 0) {
				let n = t !== void 0 && t.length === 1;
				n && (e = Rt.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), n && Rt.set(t, e));
			}
			return e;
		}
		toString() {
			return this.cssText;
		}
	}, Bt = (e) => new zt(typeof e == "string" ? e : e + "", void 0, Lt), Vt = (e, ...t) => {
		let n = e.length === 1 ? e[0] : t.reduce(((t, n, r) => t + ((e) => {
			if (!0 === e._$cssResult$) return e.cssText;
			if (typeof e == "number") return e;
			throw Error("Value passed to 'css' function must be a 'css' function result: " + e + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
		})(n) + e[r + 1]), e[0]);
		return new zt(n, e, Lt);
	}, Ht = (e, t) => {
		if (It) e.adoptedStyleSheets = t.map(((e) => e instanceof CSSStyleSheet ? e : e.styleSheet));
		else for (let n of t) {
			let t = document.createElement("style"), r = Ft.litNonce;
			r !== void 0 && t.setAttribute("nonce", r), t.textContent = n.cssText, e.appendChild(t);
		}
	}, Ut = It ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((e) => {
		let t = "";
		for (let n of e.cssRules) t += n.cssText;
		return Bt(t);
	})(e) : e;
})), Gt, Kt, qt, Jt, Yt, Xt, Zt, Qt, $t, en, tn, nn, rn, an, on, sn, cn = t((() => {
	Wt(), {is: Kt, defineProperty: qt, getOwnPropertyDescriptor: Jt, getOwnPropertyNames: Yt, getOwnPropertySymbols: Xt, getPrototypeOf: Zt} = Object, Qt = globalThis, $t = Qt.trustedTypes, en = $t ? $t.emptyScript : "", tn = Qt.reactiveElementPolyfillSupport, nn = (e, t) => e, rn = {
		toAttribute(e, t) {
			switch (t) {
				case Boolean:
					e = e ? en : null;
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
	}, an = (e, t) => !Kt(e, t), on = {
		attribute: !0,
		type: String,
		converter: rn,
		reflect: !1,
		useDefault: !1,
		hasChanged: an
	}, (Gt = Symbol).metadata ?? (Gt.metadata = Symbol("metadata")), Qt.litPropertyMetadata ?? (Qt.litPropertyMetadata = /* @__PURE__ */ new WeakMap()), sn = class extends HTMLElement {
		static addInitializer(e) {
			this._$Ei(), (this.l ?? (this.l = [])).push(e);
		}
		static get observedAttributes() {
			return this.finalize(), this._$Eh && [...this._$Eh.keys()];
		}
		static createProperty(e, t = on) {
			if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
				let n = Symbol(), r = this.getPropertyDescriptor(e, n, t);
				r !== void 0 && qt(this.prototype, e, r);
			}
		}
		static getPropertyDescriptor(e, t, n) {
			let { get: r, set: i } = Jt(this.prototype, e) ?? {
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
			return this.elementProperties.get(e) ?? on;
		}
		static _$Ei() {
			if (this.hasOwnProperty(nn("elementProperties"))) return;
			let e = Zt(this);
			e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
		}
		static finalize() {
			if (this.hasOwnProperty(nn("finalized"))) return;
			if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(nn("properties"))) {
				let e = this.properties, t = [...Yt(e), ...Xt(e)];
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
				let n = new Set(e.flat(1 / 0).reverse());
				for (let e of n) t.unshift(Ut(e));
			} else e !== void 0 && t.push(Ut(e));
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
			this._$ES = new Promise(((e) => this.enableUpdating = e)), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach(((e) => e(this)));
		}
		addController(e) {
			(this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(e), this.renderRoot !== void 0 && this.isConnected && e.hostConnected?.();
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
			return Ht(e, this.constructor.elementStyles), e;
		}
		connectedCallback() {
			this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), this._$EO?.forEach(((e) => e.hostConnected?.()));
		}
		enableUpdating(e) {}
		disconnectedCallback() {
			this._$EO?.forEach(((e) => e.hostDisconnected?.()));
		}
		attributeChangedCallback(e, t, n) {
			this._$AK(e, n);
		}
		_$ET(e, t) {
			let n = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, n);
			if (r !== void 0 && !0 === n.reflect) {
				let i = (n.converter?.toAttribute === void 0 ? rn : n.converter).toAttribute(t, n.type);
				this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
			}
		}
		_$AK(e, t) {
			let n = this.constructor, r = n._$Eh.get(e);
			if (r !== void 0 && this._$Em !== r) {
				let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? rn : e.converter;
				this._$Em = r;
				let a = i.fromAttribute(t, e.type);
				this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
			}
		}
		requestUpdate(e, t, n) {
			if (e !== void 0) {
				let r = this.constructor, i = this[e];
				if (n ?? (n = r.getPropertyOptions(e)), !((n.hasChanged ?? an)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(r._$Eu(e, n)))) return;
				this.C(e, t, n);
			}
			!1 === this.isUpdatePending && (this._$ES = this._$EP());
		}
		C(e, t, { useDefault: n, reflect: r, wrapped: i }, a) {
			n && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(e) && (this._$Ej.set(e, a ?? t ?? this[e]), !0 !== i || a !== void 0) || (this._$AL.has(e) || (this.hasUpdated || n || (t = void 0), this._$AL.set(e, t)), !0 === r && this._$Em !== e && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(e));
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
				if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
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
				e = this.shouldUpdate(t), e ? (this.willUpdate(t), this._$EO?.forEach(((e) => e.hostUpdate?.())), this.update(t)) : this._$EM();
			} catch (t) {
				throw e = !1, this._$EM(), t;
			}
			e && this._$AE(t);
		}
		willUpdate(e) {}
		_$AE(e) {
			this._$EO?.forEach(((e) => e.hostUpdated?.())), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
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
			this._$Eq && (this._$Eq = this._$Eq.forEach(((e) => this._$ET(e, this[e])))), this._$EM();
		}
		updated(e) {}
		firstUpdated(e) {}
	}, sn.elementStyles = [], sn.shadowRootOptions = { mode: "open" }, sn[nn("elementProperties")] = /* @__PURE__ */ new Map(), sn[nn("finalized")] = /* @__PURE__ */ new Map(), tn?.({ ReactiveElement: sn }), (Qt.reactiveElementVersions ?? (Qt.reactiveElementVersions = [])).push("2.1.1");
})), ln, un, dn, fn = t((() => {
	cn(), cn(), Pt(), Pt(), ln = globalThis, un = class extends sn {
		constructor() {
			super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
		}
		createRenderRoot() {
			var e;
			let t = super.createRenderRoot();
			return (e = this.renderOptions).renderBefore ?? (e.renderBefore = t.firstChild), t;
		}
		update(e) {
			let t = this.render();
			this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Nt(t, this.renderRoot, this.renderOptions);
		}
		connectedCallback() {
			super.connectedCallback(), this._$Do?.setConnected(!0);
		}
		disconnectedCallback() {
			super.disconnectedCallback(), this._$Do?.setConnected(!1);
		}
		render() {
			return B;
		}
	}, un._$litElement$ = !0, un.finalized = !0, ln.litElementHydrateSupport?.({ LitElement: un }), dn = ln.litElementPolyfillSupport, dn?.({ LitElement: un }), (ln.litElementVersions ?? (ln.litElementVersions = [])).push("4.2.1");
})), pn = t((() => {})), mn = t((() => {
	Ze(), Pt(), fn(), pn();
})), hn, gn = t((() => {
	hn = (e) => (t, n) => {
		n === void 0 ? customElements.define(e, t) : n.addInitializer((() => {
			customElements.define(e, t);
		}));
	};
}));
//#endregion
//#region node_modules/lit/node_modules/@lit/reactive-element/decorators/property.js
function H(e) {
	return (t, n) => typeof n == "object" ? vn(e, t, n) : ((e, t, n) => {
		let r = t.hasOwnProperty(n);
		return t.constructor.createProperty(n, e), r ? Object.getOwnPropertyDescriptor(t, n) : void 0;
	})(e, t, n);
}
var _n, vn, yn = t((() => {
	Ze(), _n = {
		attribute: !0,
		type: String,
		converter: qe,
		reflect: !1,
		hasChanged: Je
	}, vn = (e = _n, t, n) => {
		let { kind: r, metadata: i } = n, a = globalThis.litPropertyMetadata.get(i);
		if (a === void 0 && globalThis.litPropertyMetadata.set(i, a = /* @__PURE__ */ new Map()), r === "setter" && ((e = Object.create(e)).wrapped = !0), a.set(n.name, e), r === "accessor") {
			let { name: r } = n;
			return {
				set(n) {
					let i = t.get.call(this);
					t.set.call(this, n), this.requestUpdate(r, i, e);
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
				t.call(this, n), this.requestUpdate(r, i, e);
			};
		}
		throw Error("Unsupported decorator location: " + r);
	};
}));
//#endregion
//#region node_modules/lit/node_modules/@lit/reactive-element/decorators/state.js
function bn(e) {
	return H({
		...e,
		state: !0,
		attribute: !1
	});
}
var xn = t((() => {
	yn();
})), Sn = t((() => {})), Cn = t((() => {})), wn = t((() => {})), Tn = t((() => {})), En = t((() => {})), Dn = t((() => {})), On = t((() => {
	gn(), yn(), xn(), Sn(), Cn(), wn(), Tn(), En(), Dn();
}));
mn(), On(), Pt();
var { I: kn } = jt, An = (e) => e === null || typeof e != "object" && typeof e != "function", jn = (e) => e.strings === void 0, Mn = {
	ATTRIBUTE: 1,
	CHILD: 2,
	PROPERTY: 3,
	BOOLEAN_ATTRIBUTE: 4,
	EVENT: 5,
	ELEMENT: 6
}, Nn = (e) => (...t) => ({
	_$litDirective$: e,
	values: t
}), Pn = class {
	constructor(e) {}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AT(e, t, n) {
		this._$Ct = e, this._$AM = t, this._$Ci = n;
	}
	_$AS(e, t) {
		return this.update(e, t);
	}
	update(e, t) {
		return this.render(...t);
	}
}, Fn = (e, t) => {
	let n = e._$AN;
	if (n === void 0) return !1;
	for (let e of n) e._$AO?.(t, !1), Fn(e, t);
	return !0;
}, In = (e) => {
	let t, n;
	do {
		if ((t = e._$AM) === void 0) break;
		n = t._$AN, n.delete(e), e = t;
	} while (n?.size === 0);
}, Ln = (e) => {
	for (let t; t = e._$AM; e = t) {
		let n = t._$AN;
		if (n === void 0) t._$AN = n = /* @__PURE__ */ new Set();
		else if (n.has(e)) break;
		n.add(e), Bn(t);
	}
};
function Rn(e) {
	this._$AN === void 0 ? this._$AM = e : (In(this), this._$AM = e, Ln(this));
}
function zn(e, t = !1, n = 0) {
	let r = this._$AH, i = this._$AN;
	if (i !== void 0 && i.size !== 0) {
		if (t) {
			if (Array.isArray(r)) for (let e = n; e < r.length; e++) Fn(r[e], !1), In(r[e]);
			else r != null && (Fn(r, !1), In(r));
		} else Fn(this, e);
	}
}
var Bn = (e) => {
	e.type == Mn.CHILD && (e._$AP ?? (e._$AP = zn), e._$AQ ?? (e._$AQ = Rn));
}, Vn = class extends Pn {
	constructor() {
		super(...arguments), this._$AN = void 0;
	}
	_$AT(e, t, n) {
		super._$AT(e, t, n), Ln(this), this.isConnected = e._$AU;
	}
	_$AO(e, t = !0) {
		e !== this.isConnected && (this.isConnected = e, e ? this.reconnected?.() : this.disconnected?.()), t && (Fn(this, e), In(this));
	}
	setValue(e) {
		if (jn(this._$Ct)) this._$Ct._$AI(e, this);
		else {
			let t = [...this._$Ct._$AH];
			t[this._$Ci] = e, this._$Ct._$AI(t, this, 0);
		}
	}
	disconnected() {}
	reconnected() {}
}, Hn = class {
	constructor(e) {
		this.G = e;
	}
	disconnect() {
		this.G = void 0;
	}
	reconnect(e) {
		this.G = e;
	}
	deref() {
		return this.G;
	}
}, Un = class {
	constructor() {
		this.Y = void 0, this.Z = void 0;
	}
	get() {
		return this.Y;
	}
	pause() {
		this.Y ?? (this.Y = new Promise(((e) => this.Z = e)));
	}
	resume() {
		this.Z?.(), this.Y = this.Z = void 0;
	}
};
//#endregion
//#region node_modules/lit-html/directives/until.js
Pt();
var Wn = (e) => !An(e) && typeof e.then == "function", Gn = 1073741823, Kn = Nn(class extends Vn {
	constructor() {
		super(...arguments), this._$Cwt = Gn, this._$Cbt = [], this._$CK = new Hn(this), this._$CX = new Un();
	}
	render(...e) {
		return e.find(((e) => !Wn(e))) ?? B;
	}
	update(e, t) {
		let n = this._$Cbt, r = n.length;
		this._$Cbt = t;
		let i = this._$CK, a = this._$CX;
		this.isConnected || this.disconnected();
		for (let e = 0; e < t.length && !(e > this._$Cwt); e++) {
			let o = t[e];
			if (!Wn(o)) return this._$Cwt = e, o;
			e < r && o === n[e] || (this._$Cwt = Gn, r = 0, Promise.resolve(o).then((async (e) => {
				for (; a.get();) await a.get();
				let t = i.deref();
				if (t !== void 0) {
					let n = t._$Cbt.indexOf(o);
					n > -1 && n < t._$Cwt && (t._$Cwt = n, t.setValue(e));
				}
			})));
		}
		return B;
	}
	disconnected() {
		this._$CK.disconnect(), this._$CX.pause();
	}
	reconnected() {
		this._$CK.reconnect(this), this._$CX.resume();
	}
}), qn = "7.0.0", Jn = "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.maxTouchPoints > 0, Yn = class extends HTMLElement {
	constructor() {
		super(), this.holdTime = 500, this.held = !1, this.ripple = document.createElement("mwc-ripple");
	}
	connectedCallback() {
		Object.assign(this.style, {
			position: "absolute",
			width: Jn ? "100px" : "50px",
			height: Jn ? "100px" : "50px",
			transform: "translate(-50%, -50%)",
			pointerEvents: "none",
			zIndex: "999"
		}), this.appendChild(this.ripple), this.ripple.primary = !0, [
			"touchcancel",
			"mouseout",
			"mouseup",
			"touchmove",
			"mousewheel",
			"wheel",
			"scroll"
		].forEach((e) => {
			document.addEventListener(e, () => {
				clearTimeout(this.timer), this.stopAnimation(), this.timer = void 0;
			}, { passive: !0 });
		});
	}
	bind(e, t) {
		if (e.actionHandler) return;
		e.actionHandler = !0, e.addEventListener("contextmenu", (e) => {
			let t = e || window.event;
			return t.preventDefault && t.preventDefault(), t.stopPropagation && t.stopPropagation(), t.cancelBubble = !0, t.returnValue = !1, !1;
		});
		let n = (e) => {
			this.held = !1;
			let t, n;
			e.touches ? (t = e.touches[0].pageX, n = e.touches[0].pageY) : (t = e.pageX, n = e.pageY), this.timer = window.setTimeout(() => {
				this.startAnimation(t, n), this.held = !0;
			}, this.holdTime);
		}, r = (n) => {
			n.preventDefault(), !(["touchend", "touchcancel"].includes(n.type) && this.timer === void 0) && (clearTimeout(this.timer), this.stopAnimation(), this.timer = void 0, this.held ? y(e, "action", { action: "hold" }) : t.hasDoubleClick ? n.type === "click" && n.detail < 2 || !this.dblClickTimeout ? this.dblClickTimeout = window.setTimeout(() => {
				this.dblClickTimeout = void 0, y(e, "action", { action: "tap" });
			}, 250) : (clearTimeout(this.dblClickTimeout), this.dblClickTimeout = void 0, y(e, "action", { action: "double_tap" })) : y(e, "action", { action: "tap" }));
		};
		e.addEventListener("touchstart", n, { passive: !0 }), e.addEventListener("touchend", r), e.addEventListener("touchcancel", r), e.addEventListener("mousedown", n, { passive: !0 }), e.addEventListener("click", r), e.addEventListener("keyup", (e) => {
			e.keyCode === 13 && r(e);
		});
	}
	startAnimation(e, t) {
		Object.assign(this.style, {
			left: `${e}px`,
			top: `${t}px`,
			display: null
		}), this.ripple.disabled = !1, this.ripple.active = !0, this.ripple.unbounded = !0;
	}
	stopAnimation() {
		this.ripple.active = !1, this.ripple.disabled = !0, this.style.display = "none";
	}
};
customElements.define("action-handler-hourly-weather", Yn);
var Xn = () => {
	let e = document.body;
	if (e.querySelector("action-handler-hourly-weather")) return e.querySelector("action-handler-hourly-weather");
	let t = document.createElement("action-handler-hourly-weather");
	return e.appendChild(t), t;
}, Zn = (e, t) => {
	let n = Xn();
	n && n.bind(e, t);
}, Qn = Nn(class extends Pn {
	update(e, [t]) {
		return Zn(e.element, t), B;
	}
	render(e) {}
}), $n = {
	"clear-night": "conditions.clear",
	cloudy: "conditions.cloudy",
	fog: "conditions.fog",
	hail: "conditions.hail",
	lightning: "conditions.thunderstorm",
	"lightning-rainy": "conditions.thunderstorm",
	partlycloudy: "conditions.partlyCloudy",
	"night-partly-cloudy": "conditions.partlyCloudyNight",
	pouring: "conditions.heavyRain",
	rainy: "conditions.rain",
	snowy: "conditions.snow",
	"snowy-rainy": "conditions.mixedPrecip",
	sunny: "conditions.sunny",
	windy: "conditions.windy",
	"windy-variant": "conditions.windy",
	exceptional: "conditions.clear"
}, er = {
	"clear-night": "weather-night",
	cloudy: "cloudy",
	fog: "fog",
	hail: "hail",
	lightning: "lightning",
	"lightning-rainy": "lightning-rainy",
	partlycloudy: "weather-partly-cloudy",
	"night-partly-cloudy": "weather-night-partly-cloudy",
	pouring: "pouring",
	rainy: "rainy",
	snowy: "snowy",
	"snowy-rainy": "snowy-rainy",
	sunny: "sunny",
	windy: "windy",
	"windy-variant": "windy-variant",
	exceptional: "alert-outline"
}, tr = {
	sunny: ["sunny", "clear-night"],
	"clear-night": ["sunny", "clear-night"],
	partlycloudy: ["partlycloudy", "night-partly-cloudy"],
	"night-partly-cloudy": ["partlycloudy", "night-partly-cloudy"]
}, nr = {
	n: "direction.n",
	nne: "direction.nne",
	ne: "direction.ne",
	ene: "direction.ene",
	e: "direction.e",
	ese: "direction.ese",
	se: "direction.se",
	sse: "direction.sse",
	s: "direction.s",
	ssw: "direction.ssw",
	sw: "direction.sw",
	wsw: "direction.wsw",
	w: "direction.w",
	wnw: "direction.wnw",
	nw: "direction.nw",
	nnw: "direction.nnw"
}, rr = {
	n: 0,
	nne: 22.5,
	ne: 45,
	ene: 67.5,
	e: 90,
	ese: 112.5,
	se: 135,
	sse: 157.5,
	s: 180,
	ssw: 202.5,
	sw: 225,
	wsw: 247.5,
	w: 270,
	wnw: 292.5,
	nw: 315,
	nnw: 337.5
}, ir = /* @__PURE__ */ n({
	card: () => ur,
	common: () => ar,
	conditions: () => cr,
	default: () => dr,
	direction: () => lr,
	editor: () => or,
	errors: () => sr
}), ar, or, sr, cr, lr, ur, dr, fr = t((() => {
	ar = {
		version: "Версия",
		title: "Времето по часове",
		title_card: "Карта с времето по часове",
		description: "Карта, която визуализира почасово метеорологичните условия във вид на лента.",
		invalid_configuration: "Невалидна конфигурация"
	}, or = {
		entity: "Entity (Задължително)",
		name: "Име (Опционално)",
		segments_to_show: "Брой сегменти за визуализиране (Опционално)",
		offset: "Брой сегменти с които да се отмести началото (Опционално)",
		icons: "Показвай икони вместо текст",
		label_spacing: "Брой сегменти между етикетите за час и температура (Опционално)",
		show_wind: "Показвай посока и скорост на вятъра",
		show_date: "Показвай дати",
		show_precipitation_amounts: "Покажи количеството валежи",
		show_precipitation_probability: "Покажи вероятноста за валежи",
		none: "Няма",
		speed_and_direction: "Скорост и посока",
		speed_only: "Само скорост",
		direction_only: "Само посока",
		barb: "Като wind barb",
		barb_and_speed: "Като wind barb и скорост",
		barb_and_direction: "Като wind barb и посока",
		barb_speed_and_direction: "Като wind barb, скорост и посока",
		all: "Всички",
		on_day_boundaries: "На границите между дните"
	}, sr = {
		missing_entity: "entity липсва в конфигурацията",
		too_many_segments_requested: "Задали сте твърде много сегменти с прогнози в num_segments. Трябва да бъдат <= от броя сегменти във forecast entity.",
		must_be_int: "Трябва да бъде четно число по-голямо или равно на 2",
		invalid_colors: "Следните цветове в конфигурацията Ви са невалидни:",
		must_be_positive_int: "Трябва да е положително число",
		offset_must_be_positive_int: "Отместването трябва да е положително число",
		forecast_not_available: "Не е налична прогноза",
		check_entity: "Проверете конфигурираното forecast entity.",
		invalid_value_icon_fill: "icon_fill трябва да бъде или положително цяло число, или едно от 'single' или 'full'"
	}, cr = {
		clear: "Ясно",
		cloudy: "Облачно",
		fog: "Мъгла",
		hail: "Градушка",
		thunderstorm: "Гръмотевична буря",
		partlyCloudy: "Частична облачност",
		partlyCloudyNight: "Частична облачност (нощ)",
		heavyRain: "Проливен дъжд",
		rain: "Дъжд",
		snow: "Сняг",
		mixedPrecip: "Смесен валеж",
		sunny: "Слънчево",
		windy: "Ветровито"
	}, lr = {
		n: "С",
		nne: "ССИ",
		ne: "СИ",
		ene: "ИСИ",
		e: "И",
		ese: "ИЮИ",
		se: "ЮИ",
		sse: "ЮЮИ",
		s: "Ю",
		ssw: "ЮЮЗ",
		sw: "ЮЗ",
		wsw: "ЗЮЗ",
		w: "З",
		wnw: "ЗСЗ",
		nw: "СЗ",
		nnw: "ССЗ"
	}, ur = { chance_of_precipitation: "{0}% вероятност за валежи" }, dr = {
		common: ar,
		editor: or,
		errors: sr,
		conditions: cr,
		direction: lr,
		card: ur
	};
})), pr = /* @__PURE__ */ n({
	card: () => yr,
	common: () => mr,
	conditions: () => _r,
	default: () => br,
	direction: () => vr,
	editor: () => hr,
	errors: () => gr
}), mr, hr, gr, _r, vr, yr, br, xr = t((() => {
	mr = {
		version: "Verze",
		title: "Hodinnová předpověď",
		title_card: "Karta Hodinnová předpověď",
		description: "Karta zobrazující hodinovou předpověď v řádku.",
		invalid_configuration: "Neplatná konfigurace"
	}, hr = {
		entity: "Entita (Povinné)",
		name: "Název (Nepovinné)",
		segments_to_show: "Počet dílků předpovědi k vykreslení (Nepovinné)",
		offset: "Počet dílků, které se přeskočí před začátkem (Nepovinné)",
		icons: "Zobrazit ikony namísto textových popisků",
		label_spacing: "Po kolika dílcích se vykreslí čas a teplota (Nepovinné)",
		show_wind: "Zobrazit rychlost a směr větru",
		show_date: "Zobrazit datumy",
		show_precipitation_amounts: "Zobrazit množství srážek",
		show_precipitation_probability: "Zobrazit pravdědpodobnost srážek",
		none: "Žádné",
		speed_and_direction: "Rychlost a směr",
		speed_only: "Jen rychlost",
		direction_only: "Jen směr",
		barb: "Jako šipku větru",
		barb_and_speed: "Jako šipku větru a rychlost",
		barb_and_direction: "Jako šipku větru a směr",
		barb_speed_and_direction: "Jako šipku větru, rychlost a směr",
		all: "Všechny",
		on_day_boundaries: "Při změně dne"
	}, gr = {
		missing_entity: "Hodnota 'entity' nebyla zadána",
		too_many_segments_requested: "Je nastaveno příliš mnoho dílků předpovědi v 'num_segments'. Hodnota musí být <= počtu hodnot v zadané entitě.",
		must_be_int: "Hodnota musí být kladné sudé celé číslo",
		invalid_colors: "Následující hodnoty v konfiguraci jsou neplatné:",
		must_be_positive_int: "Hodnota musí být kladné celé číslo",
		offset_must_be_positive_int: "Hodnota 'offset' musí být kladné celé číslo",
		forecast_not_available: "Předpověď není dostupná",
		check_entity: "Zkontrolujte zadanou entity předpovědi.",
		invalid_value_icon_fill: "icon_fill musí být buď kladné celé číslo, nebo jedno z 'single'; nebo 'full';"
	}, _r = {
		clear: "Jasno",
		cloudy: "Oblačno",
		fog: "Mlha",
		hail: "Kroupy",
		thunderstorm: "Bouřka",
		partlyCloudy: "Polojasno",
		partlyCloudyNight: "Polojasno (noc)",
		heavyRain: "Silný déšť",
		rain: "Déšť",
		snow: "Sníh",
		mixedPrecip: "Smíšené srážky",
		sunny: "Slunečno",
		windy: "Větrno"
	}, vr = {
		n: "S",
		nne: "SSV",
		ne: "SV",
		ene: "VSV",
		e: "V",
		ese: "VJV",
		se: "JV",
		sse: "JJV",
		s: "J",
		ssw: "JJZ",
		sw: "JZ",
		wsw: "ZJZ",
		w: "Z",
		wnw: "ZSZ",
		nw: "SZ",
		nnw: "SSZ"
	}, yr = { chance_of_precipitation: "{0}% šance srážek" }, br = {
		common: mr,
		editor: hr,
		errors: gr,
		conditions: _r,
		direction: vr,
		card: yr
	};
})), Sr = /* @__PURE__ */ n({
	card: () => Or,
	common: () => Cr,
	conditions: () => Er,
	default: () => kr,
	direction: () => Dr,
	editor: () => wr,
	errors: () => Tr
}), Cr, wr, Tr, Er, Dr, Or, kr, Ar = t((() => {
	Cr = {
		version: "Version",
		title: "Time Vejr",
		title_card: "Time Vejr Kort",
		description: "Et kort som viser vejret hver time som en linje.",
		invalid_configuration: "Ugyldig konfiguration"
	}, wr = {
		entity: "Entitet (Påkrævet)",
		name: "Navn (Valgfri)",
		segments_to_show: "Antal udsigtssegmenter der skal vises (Valgfri)",
		offset: "Antal udsigtssegmenter starten skal forskydes (Valgfri)",
		icons: "Vis ikoner i stedet for tekst",
		label_spacing: "Antal segmenter imellem tid og temperatur labels (Valgfri)",
		show_wind: "Vis vindhastighed og retning",
		show_precipitation_amounts: "Vis nedbørsmængde",
		show_precipitation_probability: "Vis nedbørssandsynlighed",
		none: "Ingen",
		speed_and_direction: "Hastighed og retning",
		speed_only: "Kun hastighed",
		direction_only: "Kun retning",
		barb: "Som vindrose",
		barb_and_speed: "Som vindrose og hastighed",
		barb_and_direction: "Som vindrose og retning",
		barb_speed_and_direction: "Som vindrose, hastighed, og retning",
		show_date: "Vis datoer",
		all: "Alle",
		on_day_boundaries: "På dagsgrænser"
	}, Tr = {
		missing_entity: "entitet mangler i konfiguration",
		too_many_segments_requested: "For mange segmenter forespurgt i num_segments. Skal være mindre eller lig antal segmenter i vejrudsigtsentiteten.",
		must_be_int: "Skal være et heltal størrere end eller lig 2",
		invalid_colors: "Føglende farver i din konfiguration er ugyldige:",
		must_be_positive_int: "Skal være et positivt heltal",
		offset_must_be_positive_int: "offset skal være et positivt heltal",
		forecast_not_available: "Vejrudsigt ikke tilgængelig",
		check_entity: "Kontroller den definerede vejrudsigtsentitet.",
		invalid_value_icon_fill: "icon_fill skal enten være et positivt heltal eller et af 'single' eller 'full'"
	}, Er = {
		clear: "Klart",
		cloudy: "Skyet",
		fog: "Tåge",
		hail: "Hagl",
		thunderstorm: "Torden",
		partlyCloudy: "Delvist overskyet",
		partlyCloudyNight: "Delvist overskyet (nat)",
		heavyRain: "Kraftig regn",
		rain: "Regn",
		snow: "Sne",
		mixedPrecip: "Blandet nedbør",
		sunny: "Sol",
		windy: "Blæsende"
	}, Dr = {
		n: "N",
		nne: "NNØ",
		ne: "NØ",
		ene: "ØNØ",
		e: "Ø",
		ese: "ØSØ",
		se: "SØ",
		sse: "SSØ",
		s: "S",
		ssw: "SSV",
		sw: "SV",
		wsw: "VSV",
		w: "V",
		wnw: "VNV",
		nw: "NV",
		nnw: "NNV"
	}, Or = { chance_of_precipitation: "{0}% risiko for nedbør" }, kr = {
		common: Cr,
		editor: wr,
		errors: Tr,
		conditions: Er,
		direction: Dr,
		card: Or
	};
})), jr = /* @__PURE__ */ n({
	card: () => Lr,
	common: () => Mr,
	conditions: () => Fr,
	default: () => Rr,
	direction: () => Ir,
	editor: () => Nr,
	errors: () => Pr
}), Mr, Nr, Pr, Fr, Ir, Lr, Rr, zr = t((() => {
	Mr = {
		version: "Version",
		title: "Stündliches Wetterbedingungen",
		title_card: "Stündliche Wetterbedingungen",
		description: "Diese Karte stellt stündliche Wetterbedingungen als Balken dar.",
		invalid_configuration: "Ungültige Konfiguration"
	}, Nr = {
		entity: "Entität",
		name: "Bezeichnung (optional)",
		icons: "Zeigen Sie Symbole anstelle von Textbeschriftungen an",
		offset: "Anzahl der Prognosesegmente zum Versetzen beginnen um (optional)",
		segments_to_show: "Anzahl der anzuzeigenden Prognosesegmente (optional)",
		label_spacing: "Anzahl der Vorhersagesegmente für Raumzeit- und Temperaturbeschriftungen nach (optional)",
		show_wind: "Zeigt Windgeschwindigkeit und -richtung an",
		show_precipitation_amounts: "Niederschlagsmenge anzeigen",
		speed_only: "Nur Geschwindigkeit",
		direction_only: "Nur Richtung",
		barb: "Als Windbarbe",
		show_precipitation_probability: "Niederschlagswahrscheinlichkeit anzeigen",
		none: "Keiner",
		speed_and_direction: "Geschwindigkeit und Richtung",
		barb_and_speed: "Als Windwiderhaken und Geschwindigkeit",
		barb_and_direction: "Als Windwiderhaken und Richtung",
		barb_speed_and_direction: "Als Windwiderstand, Geschwindigkeit und Richtung",
		show_date: "Termine anzeigen",
		all: "Alle",
		on_day_boundaries: "An Tagesgrenzen"
	}, Pr = {
		missing_entity: "Keine Wetter-Entität festgelegt",
		must_be_int: "Muss eine gerade ganze Zahl größer oder gleich 2 sein.",
		invalid_colors: "Die folgenden Farben in Ihrer Konfiguration sind ungültig:",
		must_be_positive_int: "Muss eine positive Ganzzahl sein",
		too_many_segments_requested: "Zu viele Prognosesegmente in num_segments angefordert. Muss <= Anzahl der Segmente in der Prognoseentität sein.",
		offset_must_be_positive_int: "offset muss eine positive Ganzzahl sein",
		forecast_not_available: "Prognose nicht verfügbar",
		check_entity: "Überprüfen Sie die konfigurierte Prognoseentität.",
		invalid_value_icon_fill: "icon_fill muss entweder eine positive Ganzzahl oder einer der Werte 'single' oder 'full' sein."
	}, Fr = {
		clear: "Klar",
		cloudy: "Bewölkt",
		fog: "Nebel",
		hail: "Hagel",
		thunderstorm: "Gewitter",
		partlyCloudy: "Teilweise bewölkt",
		partlyCloudyNight: "Teilweise bewölkt (Nacht)",
		heavyRain: "Platzregen",
		rain: "Regen",
		snow: "Schnee",
		mixedPrecip: "Gemischter Niederschlag",
		sunny: "Sonnig",
		windy: "Windig"
	}, Ir = {
		n: "N",
		nne: "NNO",
		ne: "NO",
		ene: "ONO",
		e: "O",
		ese: "OSO",
		se: "SO",
		sse: "SSO",
		s: "S",
		ssw: "SSW",
		sw: "SW",
		wsw: "WSW",
		w: "W",
		wnw: "WNW",
		nw: "NW",
		nnw: "NNW"
	}, Lr = { chance_of_precipitation: "{0}% Niederschlagswahrscheinlichkeit" }, Rr = {
		common: Mr,
		editor: Nr,
		errors: Pr,
		conditions: Fr,
		direction: Ir,
		card: Lr
	};
})), Br = /* @__PURE__ */ n({
	card: () => Kr,
	common: () => Vr,
	conditions: () => Wr,
	default: () => qr,
	direction: () => Gr,
	editor: () => Hr,
	errors: () => Ur
}), Vr, Hr, Ur, Wr, Gr, Kr, qr, Jr = t((() => {
	Vr = {
		version: "Version",
		title: "Hourly Weather",
		title_card: "Hourly Weather Card",
		description: "A card to render hourly weather conditions as a bar.",
		invalid_configuration: "Invalid configuration"
	}, Hr = {
		entity: "Entity (Required)",
		name: "Name (Optional)",
		segments_to_show: "Number of forecast segments to show (Optional)",
		offset: "Number of forecast segments to offset start by (Optional)",
		icons: "Show icons instead of text labels",
		label_spacing: "Number of forecast segments to space time and temperature labels by (Optional)",
		show_wind: "Show wind speed and direction",
		show_date: "Show dates",
		show_precipitation_amounts: "Show precipitation amount",
		show_precipitation_probability: "Show precipitation probability",
		none: "None",
		speed_and_direction: "Speed and direction",
		speed_only: "Speed only",
		direction_only: "Direction only",
		barb: "As wind barb",
		barb_and_speed: "As wind barb and speed",
		barb_and_direction: "As wind barb and direction",
		barb_speed_and_direction: "As wind barb, speed, and direction",
		all: "All",
		on_day_boundaries: "On day boundaries"
	}, Ur = {
		missing_entity: "entity is missing in configuration",
		too_many_segments_requested: "Too many forecast segments requested in num_segments. Must be <= number of segments in forecast entity.",
		must_be_int: "Must be an even integer greater than or equal to 2",
		invalid_colors: "The following colors in your configuration are invalid:",
		must_be_positive_int: "Must be a positive integer",
		offset_must_be_positive_int: "offset must be a positive integer",
		forecast_not_available: "Forecast not available",
		check_entity: "Check the configured forecast entity.",
		invalid_value_icon_fill: "icon_fill must be either a positive integer or one of 'single' or 'full'"
	}, Wr = {
		clear: "Clear",
		cloudy: "Cloudy",
		fog: "Fog",
		hail: "Hail",
		thunderstorm: "Thunderstorm",
		partlyCloudy: "Partly cloudy",
		partlyCloudyNight: "Partly cloudy (night)",
		heavyRain: "Heavy rain",
		rain: "Rain",
		snow: "Snow",
		mixedPrecip: "Mixed precip",
		sunny: "Sunny",
		windy: "Windy"
	}, Gr = {
		n: "N",
		nne: "NNE",
		ne: "NE",
		ene: "ENE",
		e: "E",
		ese: "ESE",
		se: "SE",
		sse: "SSE",
		s: "S",
		ssw: "SSW",
		sw: "SW",
		wsw: "WSW",
		w: "W",
		wnw: "WNW",
		nw: "NW",
		nnw: "NNW"
	}, Kr = { chance_of_precipitation: "{0}% chance of precipitation" }, qr = {
		common: Vr,
		editor: Hr,
		errors: Ur,
		conditions: Wr,
		direction: Gr,
		card: Kr
	};
})), Yr = /* @__PURE__ */ n({
	card: () => ti,
	common: () => Xr,
	conditions: () => $r,
	default: () => ni,
	direction: () => ei,
	editor: () => Zr,
	errors: () => Qr
}), Xr, Zr, Qr, $r, ei, ti, ni, ri = t((() => {
	Xr = {
		version: "Versión",
		title: "Tiempo por hora",
		title_card: "Tarjeta de Tiempo por hora",
		description: "Una tarjeta para mostrar las condiciones climáticas cada hora en una barra.",
		invalid_configuration: "Configuración inválida"
	}, Zr = {
		entity: "Entidad (Requerida)",
		name: "Nombre (Opcional)",
		icons: "Mostrar iconos en vez de texto",
		offset: "Número de segmentos de pronóstico para compensar el inicio por (Opcional)",
		segments_to_show: "Número de segmentos de pronóstico para mostrar (Opcional)",
		label_spacing: "Número de segmentos de pronóstico para etiquetas de temperatura y tiempo espacial por (Opcional)",
		show_wind: "Mostrar la velocidad y dirección del viento",
		show_precipitation_amounts: "Mostrar cantidad de precipitación",
		speed_only: "Solo velocidad",
		direction_only: "Solo dirección",
		barb: "Como púa de viento",
		show_precipitation_probability: "Mostrar probabilidad de precipitación",
		none: "Ninguno",
		speed_and_direction: "Velocidad y dirección",
		barb_and_speed: "Como púas de viento y velocidad",
		barb_and_direction: "Como púa de viento y dirección",
		barb_speed_and_direction: "Como púa de viento, velocidad y dirección",
		show_date: "Mostrar fechas",
		all: "Todo",
		on_day_boundaries: "En los límites del día"
	}, Qr = {
		missing_entity: "falta la entidad en la configuración",
		must_be_int: "Debe ser un entero mayor o igual a 2",
		invalid_colors: "Los siguientes colores en su configuración no son válidos:",
		must_be_positive_int: "Debe ser un entero positivo",
		too_many_segments_requested: "Se solicitaron demasiados segmentos de pronóstico en num_segments. Debe ser <= número de segmentos en la entidad de pronóstico.",
		offset_must_be_positive_int: "offset debe ser un número entero positivo",
		forecast_not_available: "Pronóstico no disponible",
		check_entity: "Verifique la entidad de pronóstico configurada.",
		invalid_value_icon_fill: "icon_fill debe ser un número entero positivo o uno de los valores 'single' o 'full'"
	}, $r = {
		clear: "Despejado",
		cloudy: "Nublado",
		fog: "Niebla",
		hail: "Granizo",
		thunderstorm: "Tormenta electrica",
		partlyCloudy: "Parcialmente nublado",
		partlyCloudyNight: "Parcialmente nublado (noche)",
		heavyRain: "Tormenta",
		rain: "Lluvia",
		snow: "Nieve",
		mixedPrecip: "Chaparrones dispersos",
		sunny: "Soleado",
		windy: "Ventoso"
	}, ei = {
		n: "N",
		nne: "NNE",
		ne: "NE",
		ene: "ENE",
		e: "E",
		ese: "ESE",
		se: "SE",
		sse: "SSE",
		s: "S",
		ssw: "SSO",
		sw: "SO",
		wsw: "OSO",
		w: "O",
		wnw: "ONO",
		nw: "NO",
		nnw: "NNO"
	}, ti = { chance_of_precipitation: "{0}% probabilidad de precipitación" }, ni = {
		common: Xr,
		editor: Zr,
		errors: Qr,
		conditions: $r,
		direction: ei,
		card: ti
	};
})), ii = /* @__PURE__ */ n({
	card: () => ui,
	common: () => ai,
	conditions: () => ci,
	default: () => di,
	direction: () => li,
	editor: () => oi,
	errors: () => si
}), ai, oi, si, ci, li, ui, di, fi = t((() => {
	ai = {
		version: "Version",
		title: "Prévisions météo par heure",
		title_card: "Prévisions météo par heure",
		description: "Une carte pour afficher les prévisions météo par heure sur une ligne.",
		invalid_configuration: "Configuration invalide"
	}, oi = {
		entity: "Entité (requis)",
		name: "Nom (facultatif)",
		icons: "Afficher des icônes à la place du texte",
		offset: "Décalage initial de segments de prévision (facultatif)",
		segments_to_show: "Nombre de segments de prévision à afficher (facultatif)",
		label_spacing: "Segments d'espacement entre les étiquettes d'heure et de température (facultatif)",
		show_wind: "Afficher la vitesse et la direction du vent",
		show_precipitation_amounts: "Afficher la quantité de précipitations",
		speed_only: "Vitesse uniquement",
		direction_only: "Sens uniquement",
		barb: "Comme barbillon de vent",
		show_precipitation_probability: "Afficher la probabilité de précipitation",
		none: "Aucun",
		speed_and_direction: "Vitesse et orientation",
		barb_and_speed: "Comme barbe de vent et vitesse",
		barb_and_direction: "Comme barbillon de vent et direction",
		barb_speed_and_direction: "Comme barbillon de vent, vitesse et direction",
		show_date: "Afficher les dates",
		all: "Tous",
		on_day_boundaries: "Aux limites du jour"
	}, si = {
		missing_entity: "Entité manquante dans la configuration",
		must_be_int: "Doit être un nombre entier pair supérieur ou égal à 2",
		invalid_colors: "Les couleurs suivantes dans votre configuration ne sont pas valides\xA0:",
		must_be_positive_int: "Doit être un entier positif",
		too_many_segments_requested: "Trop de segments de prévision demandés dans num_segments. Doit être <= au nombre de segments de l'entité de prévision.",
		offset_must_be_positive_int: "offset doit être un entier positif",
		forecast_not_available: "Prévision non disponible",
		check_entity: "Vérifiez l'entité de prévision configurée.",
		invalid_value_icon_fill: "icon_fill doit être soit un entier positif, soit l'un des nombres 'single' ou 'full'"
	}, ci = {
		clear: "Dégagé",
		cloudy: "Nuageux",
		fog: "Brouillard",
		hail: "Grêle",
		thunderstorm: "Orage",
		partlyCloudy: "Éclaircies",
		partlyCloudyNight: "Éclaircies (nuit)",
		heavyRain: "Averses",
		rain: "Pluie",
		snow: "Neige",
		mixedPrecip: "Neigeux, pluvieux",
		sunny: "Ensoleillé",
		windy: "Venteux"
	}, li = {
		n: "N",
		nne: "NNE",
		ne: "NE",
		ene: "ENE",
		e: "E",
		ese: "ESE",
		se: "SE",
		sse: "SSE",
		s: "S",
		ssw: "SSO",
		sw: "SO",
		wsw: "OSO",
		w: "O",
		wnw: "ONO",
		nw: "NO",
		nnw: "NNO"
	}, ui = { chance_of_precipitation: "{0}% probabilité de précipitations" }, di = {
		common: ai,
		editor: oi,
		errors: si,
		conditions: ci,
		direction: li,
		card: ui
	};
})), pi = /* @__PURE__ */ n({
	card: () => yi,
	common: () => mi,
	conditions: () => _i,
	default: () => bi,
	direction: () => vi,
	editor: () => hi,
	errors: () => gi
}), mi, hi, gi, _i, vi, yi, bi, xi = t((() => {
	mi = {
		version: "Verzió",
		title: "Óránkénti időjárás",
		title_card: "Óránkénti időjárás kártya",
		description: "Egy kártya, amely az óránkénti időjárási viszonyokat egy sávban jeleníti meg",
		invalid_configuration: "Érvénytelen konfiguráció"
	}, hi = {
		entity: "Entitás (Kötelező)",
		name: "Név (Opcionális)",
		segments_to_show: "Megjelenítendő előrejelzési órák száma (Opcionális)",
		offset: "Az előrejelzett órák kezdő értékének eltolása (Opcionális)",
		icons: "Ikonok megjelenítése szövegek helyett",
		label_spacing: "Az idő- és hőmérsékleti címkékhez tartozó előrejelzési órák időköze (Opcionális)",
		show_wind: "Szélsebesség és irány megjelenítése",
		show_precipitation_amounts: "Csapadékmennyiség megjelenítése",
		show_precipitation_probability: "Csapadék valószínűségének megjelenítése",
		speed_only: "Sebesség",
		direction_only: "Irány",
		barb: "Irány nyílként",
		none: "Egyik sem",
		speed_and_direction: "Sebesség és irány",
		barb_and_speed: "Szélfogóként és sebességként",
		barb_and_direction: "Szellőként és irányként",
		barb_speed_and_direction: "Szélfogként, sebességként és irányként",
		show_date: "Dátumok megjelenítése",
		all: "Minden",
		on_day_boundaries: "A napok határain"
	}, gi = {
		missing_entity: "az entitás hiányzik a konfigurációból",
		too_many_segments_requested: "Túl sok előrejelzési órát adtak meg a num_segments-ben. <= az előrejelző egységben lévő órák száma.",
		must_be_int: "Páros egész számnak kell lennie, amely nagyobb vagy egyenlő 2-nél.",
		invalid_colors: "A konfigurációdban a következő színek érvénytelenek:",
		must_be_positive_int: "Pozitív egész szám kell legyen",
		offset_must_be_positive_int: "offset pozitív egész számnak kell lennie",
		forecast_not_available: "Előrejelzés nem elérhető",
		check_entity: "Ellenőrizze a beállított előrejelző egységet.",
		invalid_value_icon_fill: "Az ikon_kitöltésének pozitív egésznek vagy az 'single' vagy 'full'"
	}, _i = {
		clear: "Tiszta",
		cloudy: "Felhős",
		fog: "Ködös",
		hail: "Jégeső",
		thunderstorm: "Vihar",
		partlyCloudy: "Részben felhős",
		partlyCloudyNight: "Részben felhős (éjszaka)",
		heavyRain: "Heves eső",
		rain: "Esős",
		snow: "Havazás",
		mixedPrecip: "Havas eső",
		sunny: "Napos",
		windy: "Szeles"
	}, vi = {
		n: "É",
		nne: "ÉÉK",
		ne: "ÉK",
		ene: "KÉK",
		e: "K",
		ese: "KDK",
		se: "DK",
		sse: "DDK",
		s: "D",
		ssw: "DDNy",
		sw: "DNy",
		wsw: "NyDNy",
		w: "Ny",
		wnw: "NyÉNy",
		nw: "ÉNy",
		nnw: "ÉÉNy"
	}, yi = { chance_of_precipitation: "{0}% a csapadék valószínűsége" }, bi = {
		common: mi,
		editor: hi,
		errors: gi,
		conditions: _i,
		direction: vi,
		card: yi
	};
})), Si = /* @__PURE__ */ n({
	card: () => Oi,
	common: () => Ci,
	conditions: () => Ei,
	default: () => ki,
	direction: () => Di,
	editor: () => wi,
	errors: () => Ti
}), Ci, wi, Ti, Ei, Di, Oi, ki, Ai = t((() => {
	Ci = {
		version: "Versione",
		title: "Previsione Meteo Oraria",
		title_card: "Scheda Meteo Oraria",
		description: "Una scheda per rappresentare le condizioni meteorologiche orarie come una barra.",
		invalid_configuration: "Configurazione Non Valida"
	}, wi = {
		entity: "Entità (Richiesta)",
		name: "Nome (Facoltativo)",
		icons: "Mostra le icone invece delle etichette di testo",
		offset: "Numero di segmenti di previsione di cui compensare l'inizio (Facoltativo)",
		segments_to_show: "Numero di segmenti di previsione da mostrare (facoltativo)",
		label_spacing: "Numero di segmenti di previsione per spazio etichette tempo e temperatura per (facoltativo)",
		show_wind: "Mostra la velocità e la direzione del vento",
		show_precipitation_amounts: "Mostra la quantità di precipitazioni",
		speed_only: "Solo velocità",
		direction_only: "Solo direzione",
		barb: "Come una punta di vento",
		show_precipitation_probability: "Mostra la probabilità di precipitazioni",
		none: "Nessuno",
		speed_and_direction: "Velocità e direzione",
		barb_and_speed: "Come il vento tagliente e la velocità",
		barb_and_direction: "Come il vento e la direzione",
		barb_speed_and_direction: "Come la punta del vento, la velocità e la direzione",
		show_date: "Mostra date",
		all: "Tutto",
		on_day_boundaries: "Sui confini del giorno"
	}, Ti = {
		missing_entity: "entità mancante nella configurazione",
		must_be_int: "Deve essere un numero intero pari, maggiore o uguale a 2",
		invalid_colors: "I seguenti colori nella tua configurazione non sono validi:",
		must_be_positive_int: "Deve essere un numero intero positivo",
		too_many_segments_requested: "Troppi segmenti di previsione richiesti in num_segments. Deve essere <= numero di segmenti nell'entità di previsione.",
		offset_must_be_positive_int: "offset deve essere un numero intero positivo",
		forecast_not_available: "Previsione non disponibile",
		check_entity: "Controllare l'entità di previsione configurata.",
		invalid_value_icon_fill: "icon_fill deve essere un numero intero positivo o uno dei valori 'single' o 'full'"
	}, Ei = {
		clear: "Limpido",
		cloudy: "Nuvoloso",
		fog: "Nebbia",
		hail: "Grandine",
		thunderstorm: "Temporale",
		partlyCloudy: "Parzialmente Nuvoloso",
		partlyCloudyNight: "Parzialmente Nuvoloso (notte)",
		heavyRain: "Acquazzone",
		rain: "Pioggia",
		snow: "Neve",
		mixedPrecip: "Precipitazioni Miste",
		sunny: "Soleggiato",
		windy: "Ventoso"
	}, Di = {
		n: "N",
		nne: "NNE",
		ne: "NE",
		ene: "ENE",
		e: "E",
		ese: "ESE",
		se: "SE",
		sse: "SSE",
		s: "S",
		ssw: "SSO",
		sw: "SO",
		wsw: "OSO",
		w: "O",
		wnw: "ONO",
		nw: "NO",
		nnw: "NNO"
	}, Oi = { chance_of_precipitation: "{0}% possibilità di precipitazioni" }, ki = {
		common: Ci,
		editor: wi,
		errors: Ti,
		conditions: Ei,
		direction: Di,
		card: Oi
	};
})), ji = /* @__PURE__ */ n({
	card: () => Li,
	common: () => Mi,
	conditions: () => Fi,
	default: () => Ri,
	direction: () => Ii,
	editor: () => Ni,
	errors: () => Pi
}), Mi, Ni, Pi, Fi, Ii, Li, Ri, zi = t((() => {
	Mi = {
		version: "Versjon",
		invalid_configuration: "Ikke gyldig konfiguration",
		title: "Timelig vær",
		title_card: "Timevis værkort",
		description: "Et kort for å gjengi værforhold hver time som en bar."
	}, Ni = {
		icons: "Vis ikoner i stedet for tekstetiketter",
		entity: "Entitet (obligatorisk)",
		name: "Navn (valgfritt)",
		offset: "Antall prognosesegmenter å utligne start med (valgfritt)",
		segments_to_show: "Antall prognosesegmenter som skal vises (valgfritt)",
		label_spacing: "Antall prognosesegmenter til romtid og temperaturetiketter etter (valgfritt)",
		show_wind: "Vis vindhastighet og retning",
		show_precipitation_amounts: "Vis nedbørsmengde",
		speed_only: "Kun hastighet",
		direction_only: "Kun retning",
		barb: "Som vindmothak",
		show_precipitation_probability: "Vis nedbørssannsynlighet",
		none: "Ingen",
		speed_and_direction: "Fart og retning",
		barb_and_speed: "Som vindmottak og fart",
		barb_and_direction: "Som vindmottak og retning",
		barb_speed_and_direction: "Som vindmothak, hastighet og retning",
		show_date: "Vis datoer",
		all: "Alle",
		on_day_boundaries: "På dagsgrenser"
	}, Pi = {
		missing_entity: "entity mangler i konfigurasjonen",
		must_be_int: "Må være et jevnt heltall større enn eller lik 2",
		invalid_colors: "Følgende farger i konfigurasjonen din er ugyldige:",
		must_be_positive_int: "Må være et positivt heltall",
		too_many_segments_requested: "For mange prognosesegmenter er forespurt i num_segments. Må være <= antall segmenter i prognoseenheten.",
		offset_must_be_positive_int: "offset må være et positivt heltall",
		forecast_not_available: "Værvarsel er ikke tilgjengelig",
		check_entity: "Sjekk den konfigurerte prognoseenheten.",
		invalid_value_icon_fill: "icon_fill må enten være et positivt heltall eller et av 'single' eller 'full'"
	}, Fi = {
		clear: "Klar",
		cloudy: "Skyet",
		fog: "Tåke",
		hail: "Hagl",
		thunderstorm: "Tordenvær",
		partlyCloudy: "Delvis skyet",
		partlyCloudyNight: "Delvis skyet (natt)",
		heavyRain: "Mye regn",
		rain: "Regn",
		snow: "Snø",
		mixedPrecip: "Blandet nedbør",
		sunny: "Solfylt",
		windy: "Vindfullt"
	}, Ii = {
		n: "N",
		nne: "NNØ",
		ne: "NE",
		ene: "ØNØ",
		e: "Ø",
		ese: "ØSØ",
		se: "SØ",
		sse: "SSØ",
		s: "S",
		ssw: "SSV",
		sw: "SV",
		wsw: "VSV",
		w: "V",
		wnw: "VNV",
		nw: "NV",
		nnw: "NNV"
	}, Li = { chance_of_precipitation: "{0}% sjanse for nedbør" }, Ri = {
		common: Mi,
		editor: Ni,
		errors: Pi,
		conditions: Fi,
		direction: Ii,
		card: Li
	};
})), Bi = /* @__PURE__ */ n({
	card: () => Ki,
	common: () => Vi,
	conditions: () => Wi,
	default: () => qi,
	direction: () => Gi,
	editor: () => Hi,
	errors: () => Ui
}), Vi, Hi, Ui, Wi, Gi, Ki, qi, Ji = t((() => {
	Vi = {
		version: "Versjon",
		invalid_configuration: "Ikkje gyldeg konfiguasjon",
		title: "Timelig vær",
		title_card: "Timevis værkort",
		description: "Eit kort for å gjengje verforhold kvar time som ein bar."
	}, Hi = {
		icons: "Vis ikon i staden for tekstetikettar",
		entity: "Entitet (obligatorisk)",
		name: "Namn (valfritt)",
		offset: "Antall prognosesegment å utligne start med (valfritt)",
		segments_to_show: "Antall prognosesegment som skal synast (valfritt)",
		label_spacing: "Antall prognosesegment til romtid og temperaturetikettar etter (valfritt)",
		show_wind: "Vis vindhastigheit og retning",
		show_precipitation_amounts: "Vis nedbørsmengde",
		neither: "Ingen",
		both: "Både",
		speed_only: "Kun hastigheit",
		direction_only: "Kun retning",
		barb: "Som vindmothak",
		show_precipitation_probability: "Vis nedbørssannsyn",
		none: "Ingen",
		speed_and_direction: "Fart og retning",
		barb_and_speed: "Som vindmottak og fart",
		barb_and_direction: "Som vindmottak og retning",
		barb_speed_and_direction: "Som vindmothak, hastighet og retning",
		show_date: "Vis datoer",
		all: "Alle",
		on_day_boundaries: "På dagsgrenser"
	}, Ui = {
		missing_entity: "entity manglar i konfigurasjonen",
		must_be_int: "Må være et jevnt heiltal større enn eller lik 2",
		invalid_colors: "Følgande fargar i konfigurasjonen din er ugyldege:",
		must_be_positive_int: "Må vere eit positivt heiltal",
		too_many_segments_requested: "For mange prognosesegment er førespurt i num_segments. Må vere <= antall segment i prognoseeininga.",
		offset_must_be_positive_int: "offset må vere eit positivt heiltal",
		forecast_not_available: "Vervarsel er ikkje tilgjengeleg",
		check_entity: "Sjekk den konfigurerte prognoseeininga.",
		invalid_value_icon_fill: "icon_fill må enten være et positivt heltall eller et av 'single' eller 'full'"
	}, Wi = {
		clear: "Klart",
		cloudy: "Skya",
		fog: "Tåke",
		hail: "Hagl",
		thunderstorm: "Tordenvær",
		partlyCloudy: "Delvis skya",
		partlyCloudyNight: "Delvis skya (natt)",
		heavyRain: "Mykje regn",
		rain: "Regn",
		snow: "Snø",
		mixedPrecip: "Blanda nedbør",
		sunny: "Sol",
		windy: "Vindfullt"
	}, Gi = {
		n: "N",
		nne: "NNØ",
		ne: "NE",
		ene: "ØNØ",
		e: "Ø",
		ese: "ØSØ",
		se: "SØ",
		sse: "SSØ",
		s: "S",
		ssw: "SSV",
		sw: "SV",
		wsw: "VSV",
		w: "V",
		wnw: "VNV",
		nw: "NV",
		nnw: "NNV"
	}, Ki = { chance_of_precipitation: "{0}% sjanse for nedbør" }, qi = {
		common: Vi,
		editor: Hi,
		errors: Ui,
		conditions: Wi,
		direction: Gi,
		card: Ki
	};
})), Yi = /* @__PURE__ */ n({
	card: () => ta,
	common: () => Xi,
	conditions: () => $i,
	default: () => na,
	direction: () => ea,
	editor: () => Zi,
	errors: () => Qi
}), Xi, Zi, Qi, $i, ea, ta, na, ra = t((() => {
	Xi = {
		version: "Versie",
		title: "Weer per uur",
		title_card: "Weerkaart per uur",
		description: "Een kaart om de weersomstandigheden per uur weer te geven als een bar.",
		invalid_configuration: "Ongeldige configuratie"
	}, Zi = {
		entity: "Entiteit (Verplicht)",
		name: "Naam: (Optioneel)",
		segments_to_show: "Aantal weer te geven prognosesegmenten (Optioneel)",
		offset: "Aantal prognosesegmenten om mee te compenseren (Optioneel)",
		icons: "Pictogrammen weergeven in plaats van tekstlabels",
		label_spacing: "Aantal prognosesegmenten naar ruimtetijd- en temperatuurlabels per (Optioneel)",
		show_wind: "Toon windsnelheid en richting",
		show_precipitation_amounts: "Toon hoeveelheid neerslag",
		speed_only: "Alleen snelheid",
		direction_only: "Alleen richting (tekst)",
		barb: "Alleen richting (pijl)",
		show_precipitation_probability: "Neerslagkans weergeven",
		none: "Geen",
		speed_and_direction: "Snelheid en richting",
		barb_and_speed: "Zoals wind weerhaak en snelheid",
		barb_and_direction: "Als windhaak en richting",
		barb_speed_and_direction: "Zoals wind weerhaak, snelheid en richting",
		show_date: "Datums weergeven",
		all: "Alle",
		on_day_boundaries: "Op daggrenzen"
	}, Qi = {
		missing_entity: "entiteit ontbreekt in configuratie",
		too_many_segments_requested: "Te veel prognosesegmenten aangevraagd in num_segments. Moet <= aantal segmenten in prognose-entiteit zijn.",
		must_be_int: "Moet een even geheel getal zijn groter of gelijk aan 2",
		invalid_colors: "De volgende kleuren in uw configuratie zijn ongeldig:",
		must_be_positive_int: "Moet een positief geheel getal zijn",
		offset_must_be_positive_int: "offset moet een positief geheel getal zijn",
		forecast_not_available: "Prognose niet beschikbaar",
		check_entity: "Controleer de geconfigureerde prognose-entiteit.",
		invalid_value_icon_fill: "icon_fill moet een positief geheel getal zijn of een van de 'single'; of 'full'"
	}, $i = {
		clear: "Helder",
		cloudy: "Bewolkt",
		fog: "Mist",
		hail: "Hagel",
		thunderstorm: "Onweersbui",
		partlyCloudy: "Half bewolkt",
		partlyCloudyNight: "Half bewolkt (nacht)",
		heavyRain: "Zware regen",
		rain: "Regen",
		snow: "Sneeuw",
		mixedPrecip: "Gemengde neerslag",
		sunny: "Zonnig",
		windy: "Winderig"
	}, ea = {
		n: "N",
		nne: "NNO",
		ne: "NO",
		ene: "ONO",
		e: "O",
		ese: "OZO",
		se: "ZO",
		sse: "ZZO",
		s: "Z",
		ssw: "ZZW",
		sw: "ZW",
		wsw: "WZW",
		w: "W",
		wnw: "WNW",
		nw: "NW",
		nnw: "NNW"
	}, ta = { chance_of_precipitation: "{0}% kans op neerslag" }, na = {
		common: Xi,
		editor: Zi,
		errors: Qi,
		conditions: $i,
		direction: ea,
		card: ta
	};
})), ia = /* @__PURE__ */ n({
	card: () => ua,
	common: () => aa,
	conditions: () => ca,
	default: () => da,
	direction: () => la,
	editor: () => oa,
	errors: () => sa
}), aa, oa, sa, ca, la, ua, da, fa = t((() => {
	aa = {
		version: "Wersja",
		title: "Pogoda godzinowa",
		title_card: "Pogoda godzinowa",
		description: "Karta w formie wykresu słupkowego dla pogody godzinowej",
		invalid_configuration: "Nieprawiłowa konfiguracja"
	}, oa = {
		entity: "Encja",
		name: "Nazwa (opcjonalnie)",
		icons: "Pokaż ikony zamiast etykiet tekstowych",
		offset: "Liczba segmentów prognozy, o które należy skompensować początek (opcjonalnie)",
		segments_to_show: "Liczba segmentów prognozy do wyświetlenia (opcjonalnie)",
		label_spacing: "Liczba segmentów prognozy do etykiet czasoprzestrzeni i temperatury według (opcjonalnie)",
		show_wind: "Pokaż prędkość i kierunek wiatru",
		show_precipitation_amounts: "Pokaż ilość opadów",
		speed_only: "Tylko prędkość",
		direction_only: "Tylko kierunek",
		barb: "Jak kolce wiatru",
		show_precipitation_probability: "Pokaż prawdopodobieństwo opadów",
		none: "Nic",
		speed_and_direction: "Szybkość i kierunek",
		barb_and_speed: "Jak kolce wiatru i prędkość",
		barb_and_direction: "Jako zadzior i kierunek wiatru",
		barb_speed_and_direction: "Jak kolce wiatru, prędkość i kierunek",
		show_date: "Pokaż daty",
		all: "Wszystko",
		on_day_boundaries: "Na granicach dnia"
	}, sa = {
		missing_entity: "encja nie istnieje",
		must_be_int: "Musi być parzystą liczbą całkowitą większą lub równą 2",
		invalid_colors: "Następujące kolory w Twojej konfiguracji są nieprawidłowe:",
		must_be_positive_int: "Musi być dodatnią liczbą całkowitą",
		too_many_segments_requested: "Zażądano zbyt wielu segmentów prognozy w num_segments. Musi wynosić <= liczba segmentów w elemencie prognozy.",
		offset_must_be_positive_int: "offset musi być dodatnią liczbą całkowitą",
		forecast_not_available: "Prognoza niedostępna",
		check_entity: "Sprawdź skonfigurowaną encję prognozy.",
		invalid_value_icon_fill: "icon_fill musi być dodatnią liczbą całkowitą lub jedną z wartości 'single' lub 'full'"
	}, ca = {
		clear: "Bezchmurnie",
		cloudy: "Pochmurnie",
		fog: "Mgła",
		hail: "Grad",
		thunderstorm: "Burza",
		partlyCloudy: "Częściowe zachmurzenie",
		partlyCloudyNight: "Częściowe zachmurzenie (noc)",
		heavyRain: "Ulewa",
		rain: "Deszcz",
		snow: "Śnieg",
		mixedPrecip: "Mieszane opady",
		sunny: "Słonecznie",
		windy: "Wietrznie"
	}, la = {
		n: "P",
		nne: "PPW",
		ne: "PW",
		ene: "WPW",
		e: "W",
		ese: "WPdW",
		se: "PdW",
		sse: "PdPdW",
		s: "Pd",
		ssw: "PdPdZ",
		sw: "PdZ",
		wsw: "ZPdZ",
		w: "Z",
		wnw: "ZPZ",
		nw: "PZ",
		nnw: "PPZ"
	}, ua = { chance_of_precipitation: "{0}% szans na opady" }, da = {
		common: aa,
		editor: oa,
		errors: sa,
		conditions: ca,
		direction: la,
		card: ua
	};
})), pa = /* @__PURE__ */ n({
	card: () => ya,
	common: () => ma,
	conditions: () => _a,
	default: () => ba,
	direction: () => va,
	editor: () => ha,
	errors: () => ga
}), ma, ha, ga, _a, va, ya, ba, xa = t((() => {
	ma = {
		version: "Versão",
		title: "Tempo de hora em hora",
		title_card: "Tempo de hora em hora",
		description: "Um cartão para mostrar as condições meteorológicas de hora em hora como uma barra.",
		invalid_configuration: "Configuração Inválida"
	}, ha = {
		entity: "Entidade",
		name: "Nome (opcional)",
		icons: "Mostrar ícones em vez de rótulos de texto",
		offset: "Número de segmentos de previsão para começar a compensar (opcional)",
		segments_to_show: "Número de segmentos de previsão a serem exibidos (opcional)",
		label_spacing: "Número de segmentos de previsão para rótulos de tempo e temperatura de espaço por (opcional)",
		show_wind: "Mostrar velocidade e direção do vento",
		show_precipitation_amounts: "Mostrar quantidade de precipitação",
		speed_only: "Apenas velocidade",
		direction_only: "Apenas direção",
		barb: "Como farpa de vento",
		show_precipitation_probability: "Mostrar probabilidade de precipitação",
		none: "Nenhum",
		speed_and_direction: "Velocidade e direção",
		barb_and_speed: "Como farpa de vento e velocidade",
		barb_and_direction: "Como farpa de vento e direção",
		barb_speed_and_direction: "Como farpa de vento, velocidade e direção",
		show_date: "Mostrar datas",
		all: "Todos",
		on_day_boundaries: "Nos limites do dia"
	}, ga = {
		missing_entity: "A entidade não existe na configuração",
		must_be_int: "Deve ser um número inteiro par maior ou igual a 2",
		invalid_colors: "As seguintes cores em sua configuração são inválidas:",
		must_be_positive_int: "Deve ser um número inteiro positivo",
		too_many_segments_requested: "Muitos segmentos de previsão solicitados em num_segments. Deve ser <= número de segmentos na entidade de previsão.",
		offset_must_be_positive_int: "offset deve ser um número inteiro positivo",
		forecast_not_available: "Previsão não disponível",
		check_entity: "Verifique a entidade de previsão configurada.",
		invalid_value_icon_fill: "icon_fill deve ser um número inteiro positivo ou um dos valores 'single' ou 'full'"
	}, _a = {
		clear: "Limpo",
		cloudy: "Nublado",
		fog: "Nevoeiro",
		hail: "Granizo",
		thunderstorm: "Trovoada",
		partlyCloudy: "Pouco nublado",
		partlyCloudyNight: "Pouco nublado (noite)",
		heavyRain: "Chuva forte",
		rain: "Chuva",
		snow: "Neve",
		mixedPrecip: "Precipitação mista",
		sunny: "Sol",
		windy: "Vento"
	}, va = {
		n: "N",
		nne: "NNE",
		ne: "NE",
		ene: "ENE",
		e: "E",
		ese: "ESE",
		se: "SE",
		sse: "SSE",
		s: "S",
		ssw: "SSO",
		sw: "SO",
		wsw: "OSO",
		w: "O",
		wnw: "ONO",
		nw: "NO",
		nnw: "NNO"
	}, ya = { chance_of_precipitation: "{0}% chance de chuva" }, ba = {
		common: ma,
		editor: ha,
		errors: ga,
		conditions: _a,
		direction: va,
		card: ya
	};
})), Sa = /* @__PURE__ */ n({
	card: () => Oa,
	common: () => Ca,
	conditions: () => Ea,
	default: () => ka,
	direction: () => Da,
	editor: () => wa,
	errors: () => Ta
}), Ca, wa, Ta, Ea, Da, Oa, ka, Aa = t((() => {
	Ca = {
		version: "Versão",
		title: "Tempo de hora em hora",
		title_card: "Cartão meteorológico por hora",
		description: "Um cartão para renderizar as condições climáticas horárias como uma barra.",
		invalid_configuration: "Configuração inválida"
	}, wa = {
		entity: "Entidade (obrigatório)",
		name: "Nome (opcional)",
		segments_to_show: "Número de segmentos de previsão a serem exibidos (opcional)",
		offset: "Número de segmentos de previsão para começar a compensar (opcional)",
		icons: "Mostrar ícones em vez de rótulos de texto",
		label_spacing: "Número de segmentos de previsão para rótulos de tempo e temperatura de espaço por (opcional)",
		show_wind: "Mostrar velocidade e direção do vento",
		show_precipitation_amounts: "Mostrar quantidade de precipitação",
		neither: "Nenhum",
		both: "Ambos",
		speed_only: "Apenas velocidade",
		direction_only: "Apenas direção",
		barb: "Como farpa de vento",
		show_precipitation_probability: "Mostrar probabilidade de precipitação",
		none: "Nenhum",
		speed_and_direction: "Velocidade e direção",
		barb_and_speed: "Como farpa de vento e velocidade",
		barb_and_direction: "Como farpa de vento e direção",
		barb_speed_and_direction: "Como farpa de vento, velocidade e direção",
		show_date: "Mostrar datas",
		all: "Todos",
		on_day_boundaries: "Nos limites do dia"
	}, Ta = {
		missing_entity: "entidade está faltando na configuração",
		too_many_segments_requested: "Muitos segmentos de previsão solicitados em num_segments. Deve ser <= número de segmentos na entidade de previsão.",
		must_be_int: "Deve ser um número inteiro par maior ou igual a 2",
		invalid_colors: "As seguintes cores em sua configuração são inválidas:",
		must_be_positive_int: "Deve ser um número inteiro positivo",
		offset_must_be_positive_int: "offset deve ser um número inteiro positivo",
		forecast_not_available: "Previsão não disponível",
		check_entity: "Verifique a entidade de previsão configurada.",
		invalid_value_icon_fill: "icon_fill deve ser um número inteiro positivo ou um dos valores 'single' ou 'full'"
	}, Ea = {
		clear: "Claro",
		cloudy: "Nublado",
		fog: "Névoa",
		hail: "Granizo",
		thunderstorm: "Tempestade",
		partlyCloudy: "Parcialmente nublado",
		partlyCloudyNight: "Parcialmente nublado (noite)",
		heavyRain: "Chuva pesada",
		rain: "Chuva",
		snow: "Neve",
		mixedPrecip: "Precipitação mista",
		sunny: "Ensolarado",
		windy: "Ventania"
	}, Da = {
		n: "N",
		nne: "NNE",
		ne: "NE",
		ene: "ENE",
		e: "E",
		ese: "ESE",
		se: "SE",
		sse: "SSE",
		s: "S",
		ssw: "SSO",
		sw: "SO",
		wsw: "OSO",
		w: "O",
		wnw: "ONO",
		nw: "NO",
		nnw: "NNO"
	}, Oa = { chance_of_precipitation: "{0}% chance de precipitação" }, ka = {
		common: Ca,
		editor: wa,
		errors: Ta,
		conditions: Ea,
		direction: Da,
		card: Oa
	};
})), ja = /* @__PURE__ */ n({
	card: () => La,
	common: () => Ma,
	conditions: () => Fa,
	default: () => Ra,
	direction: () => Ia,
	editor: () => Na,
	errors: () => Pa
}), Ma, Na, Pa, Fa, Ia, La, Ra, za = t((() => {
	Ma = {
		version: "Версия",
		title: "Почасовая погода",
		title_card: "Карточка почасовой погоды",
		description: "Карточка для отображения почасовых условий погоды в виде полосы.",
		invalid_configuration: "Недопустимая конфигурация"
	}, Na = {
		entity: "Сущность (Обязательно)",
		name: "Название (По желанию)",
		segments_to_show: "Количество отображаемых сегментов (По желанию)",
		offset: "Количество сегментов для смещения (По желанию)",
		icons: "Отображать значки вместо текстовых меток",
		label_spacing: "Количество сегментов для размещения временных и температурных меток (По желанию)",
		show_wind: "Отображать скорость и направление ветра",
		show_date: "Отображать даты",
		show_precipitation_amounts: "Отображать количество осадков",
		show_precipitation_probability: "Отображать вероятность осадков",
		none: "Нет",
		speed_and_direction: "Скорость и направление",
		speed_only: "Только скорость",
		direction_only: "Только направление",
		barb: "Как ветровой флажок",
		barb_and_speed: "Как ветровой флажок и скорость",
		barb_and_direction: "Как ветровой флажок и направление",
		barb_speed_and_direction: "Как ветровой флажок, скорость и направление",
		all: "Все",
		on_day_boundaries: "На границах дня"
	}, Pa = {
		missing_entity: "Отсутствует сущность в конфигурации",
		too_many_segments_requested: "Запрошено слишком много сегментов в num_segments. Должно быть <= количества сегментов в сущности прогноза.",
		must_be_int: "Должно быть четным целым числом, большим или равным 2",
		invalid_colors: "Следующие цвета в вашей конфигурации недопустимы:",
		must_be_positive_int: "Должно быть положительным целым числом",
		offset_must_be_positive_int: "Смещение должно быть положительным целым числом",
		forecast_not_available: "Прогноз недоступен",
		check_entity: "Проверьте настроенную сущность прогноза.",
		invalid_value_icon_fill: "icon_fill должен быть либо положительным целым числом, либо одним из значений 'single' или 'full'"
	}, Fa = {
		clear: "Ясно",
		cloudy: "Облачно",
		fog: "Туман",
		hail: "Град",
		thunderstorm: "Гроза",
		partlyCloudy: "Частичная облачность",
		partlyCloudyNight: "Частичная облачность (ночь)",
		heavyRain: "Сильный дождь",
		rain: "Дождь",
		snow: "Снег",
		mixedPrecip: "Смешанные осадки",
		sunny: "Солнечно",
		windy: "Ветрено"
	}, Ia = {
		n: "С",
		nne: "ССВ",
		ne: "СВ",
		ene: "ВСВ",
		e: "В",
		ese: "ВЮВ",
		se: "ЮВ",
		sse: "ЮЮВ",
		s: "Ю",
		ssw: "ЮЮЗ",
		sw: "ЮЗ",
		wsw: "ЗЮЗ",
		w: "З",
		wnw: "ЗСЗ",
		nw: "СЗ",
		nnw: "ССЗ"
	}, La = { chance_of_precipitation: "Вероятность осадков: {0}%" }, Ra = {
		common: Ma,
		editor: Na,
		errors: Pa,
		conditions: Fa,
		direction: Ia,
		card: La
	};
})), Ba = /* @__PURE__ */ n({
	card: () => Ka,
	common: () => Va,
	conditions: () => Wa,
	default: () => qa,
	direction: () => Ga,
	editor: () => Ha,
	errors: () => Ua
}), Va, Ha, Ua, Wa, Ga, Ka, qa, Ja = t((() => {
	Va = {
		version: "Verzia",
		title: "Hodinové počasie",
		title_card: "Hodinové Weather Card",
		description: "Karta na vykreslenie hodinových poveternostných podmienok ako pruh.",
		invalid_configuration: "Neplatná konfigurácia"
	}, Ha = {
		entity: "Entita (požadovaná)",
		name: "Názov (voliteľné)",
		segments_to_show: "Počet segmentov prognózy, ktoré sa majú zobraziť (voliteľné)",
		offset: "Počet segmentov prognózy, o ktoré sa má začať kompenzácia (voliteľné)",
		icons: "Zobrazovať ikony namiesto textových štítkov",
		label_spacing: "Počet segmentov predpovede na štítky časopriestoru a teploty podľa (voliteľné)",
		show_wind: "Zobraziť rýchlosť a smer vetra",
		show_precipitation_amounts: "Zobraziť množstvo zrážok",
		show_precipitation_probability: "Zobraziť pravdepodobnosť zrážok",
		none: "Nič",
		speed_and_direction: "Rýchlosť a smer",
		speed_only: "Len rýchlosť",
		direction_only: "Len smer",
		barb: "Ako veterný osteň",
		barb_and_speed: "Ako veterný osteň a rýchlosť",
		barb_and_direction: "Ako veterný osteň a smer",
		barb_speed_and_direction: "Ako veterný osteň, rýchlosť a smer",
		show_date: "Zobraziť dátumy",
		all: "Všetky",
		on_day_boundaries: "Na hraniciach dňa"
	}, Ua = {
		missing_entity: "v konfigurácii chýba entita",
		too_many_segments_requested: "Príliš veľa segmentov prognózy požadovaných v num_segments. Musí byť <= počet segmentov v entite prognózy.",
		must_be_int: "Musí byť párne celé číslo väčšie alebo rovné 2",
		invalid_colors: "Nasledujúce farby vo vašej konfigurácii sú neplatné:",
		must_be_positive_int: "Musí to byť kladné celé číslo",
		offset_must_be_positive_int: "offset musí byť kladné celé číslo",
		forecast_not_available: "Predpoveď nie je k dispozícii",
		check_entity: "Skontrolujte nakonfigurovanú entitu predpovede.",
		invalid_value_icon_fill: "icon_fill musí byť buď kladné celé číslo alebo jedno z 'single'; alebo 'full';"
	}, Wa = {
		clear: "Čisté",
		cloudy: "Zamračené",
		fog: "Hmla",
		hail: "Ľadovec",
		thunderstorm: "Búrka",
		partlyCloudy: "Čiastočne zamračené",
		partlyCloudyNight: "Čiastočne zamračené (noc)",
		heavyRain: "Hustý dážď",
		rain: "Dážď",
		snow: "Sneh",
		mixedPrecip: "Zmiešené",
		sunny: "Slnečno",
		windy: "Veterno"
	}, Ga = {
		n: "S",
		nne: "SSV",
		ne: "SV",
		ene: "VSV",
		e: "V",
		ese: "VJV",
		se: "JV",
		sse: "JJV",
		s: "J",
		ssw: "JJZ",
		sw: "JZ",
		wsw: "ZJZ",
		w: "Z",
		wnw: "ZSZ",
		nw: "SZ",
		nnw: "SSZ"
	}, Ka = { chance_of_precipitation: "{0}% možnosť zrážok" }, qa = {
		common: Va,
		editor: Ha,
		errors: Ua,
		conditions: Wa,
		direction: Ga,
		card: Ka
	};
})), Ya = /* @__PURE__ */ n({
	card: () => to,
	common: () => Xa,
	conditions: () => $a,
	default: () => no,
	direction: () => eo,
	editor: () => Za,
	errors: () => Qa
}), Xa, Za, Qa, $a, eo, to, no, ro = t((() => {
	Xa = {
		version: "Sürüm",
		title: "Saatlik Hava Durumu",
		title_card: "Saatlik Hava Durumu Kartı",
		description: "Saatlik hava koşullarını çubuk grafik olarak gösteren bir kart.",
		invalid_configuration: "Geçersiz yapılandırma"
	}, Za = {
		entity: "Varlık (Zorunlu)",
		name: "Ad (İsteğe bağlı)",
		segments_to_show: "Gösterilecek tahmin dilimi sayısı (İsteğe bağlı)",
		offset: "Başlangıcı öteleme sayısı (İsteğe bağlı)",
		icons: "Metin etiketleri yerine simgeleri göster",
		label_spacing: "Zaman ve sıcaklık etiketlerinin aralık sayısı (İsteğe bağlı)",
		show_wind: "Rüzgar hızı ve yönünü göster",
		show_date: "Tarihleri göster",
		show_precipitation_amounts: "Yağış miktarını göster",
		show_precipitation_probability: "Yağış olasılığını göster",
		none: "Yok",
		speed_and_direction: "Hız ve yön",
		speed_only: "Sadece hız",
		direction_only: "Sadece yön",
		barb: "Rüzgar oku olarak",
		barb_and_speed: "Rüzgar oku ve hız olarak",
		barb_and_direction: "Rüzgar oku ve yön olarak",
		barb_speed_and_direction: "Rüzgar oku, hız ve yön olarak",
		all: "Tümü",
		on_day_boundaries: "Gün sınırlarında"
	}, Qa = {
		missing_entity: "Yapılandırmada varlık eksik",
		too_many_segments_requested: "İstenen tahmin dilimi sayısı çok fazla. num_segments değeri, tahmin varlığındaki dilim sayısından fazla olamaz.",
		must_be_int: "2 veya daha büyük çift bir tam sayı olmalı",
		invalid_colors: "Yapılandırmanızdaki geçersiz renkler:",
		must_be_positive_int: "Pozitif bir tam sayı olmalı",
		offset_must_be_positive_int: "offset pozitif bir tam sayı olmalı",
		forecast_not_available: "Tahmin mevcut değil",
		check_entity: "Yapılandırılmış tahmin varlığını kontrol edin.",
		invalid_value_icon_fill: "icon_fill değeri pozitif bir tam sayı ya da 'single' veya 'full' olmalıdır"
	}, $a = {
		clear: "Açık",
		cloudy: "Bulutlu",
		fog: "Sisli",
		hail: "Dolu",
		thunderstorm: "Gök gürültülü fırtına",
		partlyCloudy: "Parçalı bulutlu",
		partlyCloudyNight: "Parçalı bulutlu (gece)",
		heavyRain: "Şiddetli yağmur",
		rain: "Yağmur",
		snow: "Kar",
		mixedPrecip: "Karışık yağış",
		sunny: "Güneşli",
		windy: "Rüzgarlı"
	}, eo = {
		n: "K",
		nne: "KKB",
		ne: "KB",
		ene: "DKB",
		e: "D",
		ese: "DGD",
		se: "GD",
		sse: "GGB",
		s: "G",
		ssw: "GGB",
		sw: "GB",
		wsw: "BGB",
		w: "B",
		wnw: "BKB",
		nw: "KB",
		nnw: "KKB"
	}, to = { chance_of_precipitation: "%{0} yağış olasılığı" }, no = {
		common: Xa,
		editor: Za,
		errors: Qa,
		conditions: $a,
		direction: eo,
		card: to
	};
})), io = /* @__PURE__ */ n({
	card: () => uo,
	common: () => ao,
	conditions: () => co,
	default: () => fo,
	direction: () => lo,
	editor: () => oo,
	errors: () => so
}), ao, oo, so, co, lo, uo, fo, po = t((() => {
	ao = {
		version: "Версія",
		title: "Погодинний прогноз погоди",
		title_card: "Картка погодинного прогнозу погоди",
		description: "Картка для відображення погодинних умов погоди у вигляді діаграми.",
		invalid_configuration: "Недійсна конфігурація"
	}, oo = {
		entity: "Сутність (Обов'язково)",
		name: "Назва (Необов'язково)",
		segments_to_show: "Кількість сегментів прогнозу для показу (Необов'язково)",
		offset: "Кількість сегментів прогнозу для зміщення початку (Необов'язково)",
		icons: "Показувати іконки замість текстових міток",
		label_spacing: "Кількість сегментів прогнозу для інтервалу між мітками часу та температури (Необов'язково)",
		show_wind: "Показувати швидкість та напрямок вітру",
		show_date: "Показувати дати",
		show_precipitation_amounts: "Показувати кількість опадів",
		show_precipitation_probability: "Показувати ймовірність опадів",
		none: "Нічого",
		speed_and_direction: "Швидкість та напрямок",
		speed_only: "Тільки швидкість",
		direction_only: "Тільки напрямок",
		barb: "Як вітровий вимпел",
		barb_and_speed: "Як вітровий вимпел та швидкість",
		barb_and_direction: "Як вітровий вимпел та напрямок",
		barb_speed_and_direction: "Як вітровий вимпел, швидкість та напрямок",
		all: "Все",
		on_day_boundaries: "На межах днів"
	}, so = {
		missing_entity: "відсутня сутність в конфігурації",
		too_many_segments_requested: "Запитано забагато сегментів прогнозу в num_segments. Має бути <= кількості сегментів в сутності прогнозу.",
		must_be_int: "Має бути парним цілим числом більшим або рівним 2",
		invalid_colors: "Наступні кольори у вашій конфігурації недійсні:",
		must_be_positive_int: "Має бути додатнім цілим числом",
		offset_must_be_positive_int: "offset має бути додатнім цілим числом",
		forecast_not_available: "Прогноз недоступний",
		check_entity: "Перевірте налаштовану сутність прогнозу.",
		invalid_value_icon_fill: "icon_fill має бути додатнім цілим числом або одним з 'single' чи 'full'"
	}, co = {
		clear: "Ясно",
		cloudy: "Хмарно",
		fog: "Туман",
		hail: "Град",
		thunderstorm: "Гроза",
		partlyCloudy: "Частково хмарно",
		partlyCloudyNight: "Частково хмарно (ніч)",
		heavyRain: "Сильний дощ",
		rain: "Дощ",
		snow: "Сніг",
		mixedPrecip: "Змішані опади",
		sunny: "Сонячно",
		windy: "Вітряно"
	}, lo = {
		n: "Пн",
		nne: "ПнПнСх",
		ne: "ПнСх",
		ene: "СхПнСх",
		e: "Сх",
		ese: "СхПдСх",
		se: "ПдСх",
		sse: "ПдПдСх",
		s: "Пд",
		ssw: "ПдПдЗх",
		sw: "ПдЗх",
		wsw: "ЗхПдЗх",
		w: "Зх",
		wnw: "ЗхПнЗх",
		nw: "ПнЗх",
		nnw: "ПнПнЗх"
	}, uo = { chance_of_precipitation: "{0}% ймовірність опадів" }, fo = {
		common: ao,
		editor: oo,
		errors: so,
		conditions: co,
		direction: lo,
		card: uo
	};
})), mo = /* @__PURE__ */ n({
	card: () => bo,
	common: () => ho,
	conditions: () => vo,
	default: () => xo,
	direction: () => yo,
	editor: () => go,
	errors: () => _o
}), ho, go, _o, vo, yo, bo, xo, So = t((() => {
	ho = {
		version: "版本",
		title: "逐小时天气",
		title_card: "逐小时天气卡片",
		description: "一个用于显示逐小时天气状况的卡片。",
		invalid_configuration: "无效的配置"
	}, go = {
		entity: "实体（必需）",
		name: "名称（可选）",
		segments_to_show: "显示的预测段数（可选）",
		offset: "开始的预测段偏移数（可选）",
		icons: "显示图标而非文字标签",
		label_spacing: "时间和温度标签的预测段间距数（可选）",
		show_wind: "显示风速和风向",
		show_date: "显示日期",
		show_precipitation_amounts: "显示降雨量",
		show_precipitation_probability: "显示降雨概率",
		none: "无",
		speed_and_direction: "速度和方向",
		speed_only: "仅速度",
		direction_only: "仅方向",
		barb: "风向图标",
		barb_and_speed: "风向图标和速度",
		barb_and_direction: "风向图标和方向",
		barb_speed_and_direction: "风向图标，速度和方向",
		all: "全部",
		on_day_boundaries: "在日边界上"
	}, _o = {
		missing_entity: "配置中缺少实体",
		too_many_segments_requested: "在num_segments中请求的预测段过多。必须 <= 预测实体中的段数。",
		must_be_int: "必须是大于或等于2的偶数",
		invalid_colors: "配置中的以下颜色无效：",
		must_be_positive_int: "必须是正整数",
		offset_must_be_positive_int: "偏移必须是正整数",
		forecast_not_available: "预测不可用",
		check_entity: "检查配置的预测实体。",
		invalid_value_icon_fill: "icon_fill 必须是正整数,或者是'single'或'full'之一"
	}, vo = {
		clear: "晴朗",
		cloudy: "多云",
		fog: "雾",
		hail: "冰雹",
		thunderstorm: "雷暴",
		partlyCloudy: "局部多云",
		partlyCloudyNight: "局部多云（夜间）",
		heavyRain: "大雨",
		rain: "雨",
		snow: "雪",
		mixedPrecip: "雨夹雪",
		sunny: "晴天",
		windy: "有风"
	}, yo = {
		n: "北",
		nne: "北偏东",
		ne: "东北",
		ene: "东偏北",
		e: "东",
		ese: "东偏南",
		se: "东南",
		sse: "南偏东",
		s: "南",
		ssw: "南偏西",
		sw: "西南",
		wsw: "西偏南",
		w: "西",
		wnw: "西偏北",
		nw: "西北",
		nnw: "北偏西"
	}, bo = { chance_of_precipitation: "{0}%的降雨概率" }, xo = {
		common: ho,
		editor: go,
		errors: _o,
		conditions: vo,
		direction: yo,
		card: bo
	};
}));
//#endregion
//#region src/localize/localize.ts
function Co(e, t) {
	return function(n, r = "", i = "") {
		let a = (e || localStorage.getItem("selectedLanguage") || t || "en").replace(/['"]+/g, "").replace("-", "_"), o;
		try {
			o = n.split(".").reduce((e, t) => e[t], wo[a]);
		} catch {
			o = n.split(".").reduce((e, t) => e[t], wo.en);
		}
		return o === void 0 && (o = n.split(".").reduce((e, t) => e[t], wo.en)), r !== "" && i !== "" && (o = o.replace(r, i)), o;
	};
}
var wo, To = t((() => {
	fr(), xr(), Ar(), zr(), Jr(), ri(), fi(), xi(), Ai(), zi(), Ji(), ra(), fa(), xa(), Aa(), za(), Ja(), ro(), po(), So(), wo = {
		bg: ir,
		cs: pr,
		da: Sr,
		de: jr,
		en: Br,
		es: Yr,
		fr: ii,
		hu: pi,
		it: Si,
		nb: ji,
		nn_NO: Bi,
		nl: Yi,
		pl: ia,
		pt: pa,
		pt_BR: Sa,
		ru: ja,
		sk: Ba,
		tr: Ya,
		uk: io,
		zh: mo
	};
}));
//#endregion
//#region src/solar.ts
To();
var Eo = Math.PI / 180, Do = 360, Oo = 24, ko = 864e5, Ao = 15, jo = 2451545, Mo = 2440587.5, No = 280.46, Po = .9856474, Fo = 357.528, Io = .9856003, Lo = 1.915, Ro = .02, zo = 23.439, Bo = 4e-7, Vo = 18.697374558, Ho = 24.06570982441908, Uo = -.833;
function Wo(e, t, n) {
	let r = e.getTime() / ko + Mo - jo, i = (No + Po * r) % Do, a = (Fo + Io * r) % Do * Eo, o = (i + Lo * Math.sin(a) + Ro * Math.sin(2 * a)) * Eo, s = (zo - Bo * r) * Eo, c = Math.asin(Math.sin(s) * Math.sin(o)), l = Math.atan2(Math.cos(s) * Math.sin(o), Math.cos(o)), u = (Vo + Ho * r) % Oo;
	u < 0 && (u += Oo);
	let d = u * Ao * Eo + n * Eo - l, f = t * Eo, p = Math.sin(f) * Math.sin(c) + Math.cos(f) * Math.cos(c) * Math.cos(d);
	return Math.asin(Math.min(1, Math.max(-1, p))) / Eo;
}
function Go(e, t, n) {
	return Wo(e, t, n) > Uo;
}
//#endregion
//#region node_modules/lit-html/directives/style-map.js
Pt();
var Ko = "important", qo = " !" + Ko, Jo = Nn(class extends Pn {
	constructor(e) {
		if (super(e), e.type !== Mn.ATTRIBUTE || e.name !== "style" || e.strings?.length > 2) throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.");
	}
	render(e) {
		return Object.keys(e).reduce(((t, n) => {
			let r = e[n];
			return r == null ? t : t + `${n = n.includes("-") ? n : n.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g, "-$&").toLowerCase()}:${r};`;
		}), "");
	}
	update(e, [t]) {
		let { style: n } = e.element;
		if (this.ft === void 0) return this.ft = new Set(Object.keys(t)), this.render(t);
		for (let e of this.ft) t[e] ?? (this.ft.delete(e), e.includes("-") ? n.removeProperty(e) : n[e] = null);
		for (let e in t) {
			let r = t[e];
			if (r != null) {
				this.ft.add(e);
				let t = typeof r == "string" && r.endsWith(qo);
				e.includes("-") || t ? n.setProperty(e, t ? r.slice(0, -11) : r, t ? Ko : "") : n[e] = r;
			}
		}
		return B;
	}
}), U = "bottom", Yo = "right", W = "left", Xo = "auto", Zo = [
	"top",
	U,
	Yo,
	W
], Qo = "start", $o = "clippingParents", es = "viewport", ts = "popper", ns = "reference", rs = /*#__PURE__*/ Zo.reduce(function(e, t) {
	return e.concat([t + "-" + Qo, t + "-end"]);
}, []), is = /*#__PURE__*/ [].concat(Zo, [Xo]).reduce(function(e, t) {
	return e.concat([
		t,
		t + "-" + Qo,
		t + "-end"
	]);
}, []), as = [
	"beforeRead",
	"read",
	"afterRead",
	"beforeMain",
	"main",
	"afterMain",
	"beforeWrite",
	"write",
	"afterWrite"
];
//#endregion
//#region node_modules/@popperjs/core/lib/dom-utils/getNodeName.js
function G(e) {
	return e ? (e.nodeName || "").toLowerCase() : null;
}
//#endregion
//#region node_modules/@popperjs/core/lib/dom-utils/getWindow.js
function K(e) {
	if (e == null) return window;
	if (e.toString() !== "[object Window]") {
		var t = e.ownerDocument;
		return t && t.defaultView || window;
	}
	return e;
}
//#endregion
//#region node_modules/@popperjs/core/lib/dom-utils/instanceOf.js
function os(e) {
	return e instanceof K(e).Element || e instanceof Element;
}
function q(e) {
	return e instanceof K(e).HTMLElement || e instanceof HTMLElement;
}
function ss(e) {
	return typeof ShadowRoot > "u" ? !1 : e instanceof K(e).ShadowRoot || e instanceof ShadowRoot;
}
//#endregion
//#region node_modules/@popperjs/core/lib/modifiers/applyStyles.js
function cs(e) {
	var t = e.state;
	Object.keys(t.elements).forEach(function(e) {
		var n = t.styles[e] || {}, r = t.attributes[e] || {}, i = t.elements[e];
		!q(i) || !G(i) || (Object.assign(i.style, n), Object.keys(r).forEach(function(e) {
			var t = r[e];
			t === !1 ? i.removeAttribute(e) : i.setAttribute(e, t === !0 ? "" : t);
		}));
	});
}
function ls(e) {
	var t = e.state, n = {
		popper: {
			position: t.options.strategy,
			left: "0",
			top: "0",
			margin: "0"
		},
		arrow: { position: "absolute" },
		reference: {}
	};
	return Object.assign(t.elements.popper.style, n.popper), t.styles = n, t.elements.arrow && Object.assign(t.elements.arrow.style, n.arrow), function() {
		Object.keys(t.elements).forEach(function(e) {
			var r = t.elements[e], i = t.attributes[e] || {}, a = Object.keys(t.styles.hasOwnProperty(e) ? t.styles[e] : n[e]).reduce(function(e, t) {
				return e[t] = "", e;
			}, {});
			!q(r) || !G(r) || (Object.assign(r.style, a), Object.keys(i).forEach(function(e) {
				r.removeAttribute(e);
			}));
		});
	};
}
var us = {
	name: "applyStyles",
	enabled: !0,
	phase: "write",
	fn: cs,
	effect: ls,
	requires: ["computeStyles"]
};
//#endregion
//#region node_modules/@popperjs/core/lib/utils/getBasePlacement.js
function J(e) {
	return e.split("-")[0];
}
//#endregion
//#region node_modules/@popperjs/core/lib/utils/math.js
var ds = Math.max, fs = Math.min, ps = Math.round;
//#endregion
//#region node_modules/@popperjs/core/lib/utils/userAgent.js
function ms() {
	var e = navigator.userAgentData;
	return e != null && e.brands && Array.isArray(e.brands) ? e.brands.map(function(e) {
		return e.brand + "/" + e.version;
	}).join(" ") : navigator.userAgent;
}
//#endregion
//#region node_modules/@popperjs/core/lib/dom-utils/isLayoutViewport.js
function hs() {
	return !/^((?!chrome|android).)*safari/i.test(ms());
}
//#endregion
//#region node_modules/@popperjs/core/lib/dom-utils/getBoundingClientRect.js
function gs(e, t, n) {
	t === void 0 && (t = !1), n === void 0 && (n = !1);
	var r = e.getBoundingClientRect(), i = 1, a = 1;
	t && q(e) && (i = e.offsetWidth > 0 && ps(r.width) / e.offsetWidth || 1, a = e.offsetHeight > 0 && ps(r.height) / e.offsetHeight || 1);
	var o = (os(e) ? K(e) : window).visualViewport, s = !hs() && n, c = (r.left + (s && o ? o.offsetLeft : 0)) / i, l = (r.top + (s && o ? o.offsetTop : 0)) / a, u = r.width / i, d = r.height / a;
	return {
		width: u,
		height: d,
		top: l,
		right: c + u,
		bottom: l + d,
		left: c,
		x: c,
		y: l
	};
}
//#endregion
//#region node_modules/@popperjs/core/lib/dom-utils/getLayoutRect.js
function _s(e) {
	var t = gs(e), n = e.offsetWidth, r = e.offsetHeight;
	return Math.abs(t.width - n) <= 1 && (n = t.width), Math.abs(t.height - r) <= 1 && (r = t.height), {
		x: e.offsetLeft,
		y: e.offsetTop,
		width: n,
		height: r
	};
}
//#endregion
//#region node_modules/@popperjs/core/lib/dom-utils/contains.js
function vs(e, t) {
	var n = t.getRootNode && t.getRootNode();
	if (e.contains(t)) return !0;
	if (n && ss(n)) {
		var r = t;
		do {
			if (r && e.isSameNode(r)) return !0;
			r = r.parentNode || r.host;
		} while (r);
	}
	return !1;
}
//#endregion
//#region node_modules/@popperjs/core/lib/dom-utils/getComputedStyle.js
function Y(e) {
	return K(e).getComputedStyle(e);
}
//#endregion
//#region node_modules/@popperjs/core/lib/dom-utils/isTableElement.js
function ys(e) {
	return [
		"table",
		"td",
		"th"
	].indexOf(G(e)) >= 0;
}
//#endregion
//#region node_modules/@popperjs/core/lib/dom-utils/getDocumentElement.js
function bs(e) {
	return ((os(e) ? e.ownerDocument : e.document) || window.document).documentElement;
}
//#endregion
//#region node_modules/@popperjs/core/lib/dom-utils/getParentNode.js
function xs(e) {
	return G(e) === "html" ? e : e.assignedSlot || e.parentNode || (ss(e) ? e.host : null) || bs(e);
}
//#endregion
//#region node_modules/@popperjs/core/lib/dom-utils/getOffsetParent.js
function Ss(e) {
	return !q(e) || Y(e).position === "fixed" ? null : e.offsetParent;
}
function Cs(e) {
	var t = /firefox/i.test(ms());
	if (/Trident/i.test(ms()) && q(e) && Y(e).position === "fixed") return null;
	var n = xs(e);
	for (ss(n) && (n = n.host); q(n) && ["html", "body"].indexOf(G(n)) < 0;) {
		var r = Y(n);
		if (r.transform !== "none" || r.perspective !== "none" || r.contain === "paint" || ["transform", "perspective"].indexOf(r.willChange) !== -1 || t && r.willChange === "filter" || t && r.filter && r.filter !== "none") return n;
		n = n.parentNode;
	}
	return null;
}
function ws(e) {
	for (var t = K(e), n = Ss(e); n && ys(n) && Y(n).position === "static";) n = Ss(n);
	return n && (G(n) === "html" || G(n) === "body" && Y(n).position === "static") ? t : n || Cs(e) || t;
}
//#endregion
//#region node_modules/@popperjs/core/lib/utils/getMainAxisFromPlacement.js
function Ts(e) {
	return ["top", "bottom"].indexOf(e) >= 0 ? "x" : "y";
}
//#endregion
//#region node_modules/@popperjs/core/lib/utils/within.js
function Es(e, t, n) {
	return ds(e, fs(t, n));
}
function Ds(e, t, n) {
	var r = Es(e, t, n);
	return r > n ? n : r;
}
//#endregion
//#region node_modules/@popperjs/core/lib/utils/getFreshSideObject.js
function Os() {
	return {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0
	};
}
//#endregion
//#region node_modules/@popperjs/core/lib/utils/mergePaddingObject.js
function ks(e) {
	return Object.assign({}, Os(), e);
}
//#endregion
//#region node_modules/@popperjs/core/lib/utils/expandToHashMap.js
function As(e, t) {
	return t.reduce(function(t, n) {
		return t[n] = e, t;
	}, {});
}
//#endregion
//#region node_modules/@popperjs/core/lib/modifiers/arrow.js
var js = function(e, t) {
	return e = typeof e == "function" ? e(Object.assign({}, t.rects, { placement: t.placement })) : e, ks(typeof e == "number" ? As(e, Zo) : e);
};
function Ms(e) {
	var t, n = e.state, r = e.name, i = e.options, a = n.elements.arrow, o = n.modifiersData.popperOffsets, s = J(n.placement), c = Ts(s), l = ["left", "right"].indexOf(s) >= 0 ? "height" : "width";
	if (!(!a || !o)) {
		var u = js(i.padding, n), d = _s(a), f = c === "y" ? "top" : W, p = c === "y" ? U : Yo, m = n.rects.reference[l] + n.rects.reference[c] - o[c] - n.rects.popper[l], h = o[c] - n.rects.reference[c], g = ws(a), _ = g ? c === "y" ? g.clientHeight || 0 : g.clientWidth || 0 : 0, v = m / 2 - h / 2, y = u[f], b = _ - d[l] - u[p], x = _ / 2 - d[l] / 2 + v, S = Es(y, x, b), C = c;
		n.modifiersData[r] = (t = {}, t[C] = S, t.centerOffset = S - x, t);
	}
}
function Ns(e) {
	var t = e.state, n = e.options.element, r = n === void 0 ? "[data-popper-arrow]" : n;
	r != null && (typeof r == "string" && (r = t.elements.popper.querySelector(r), !r) || vs(t.elements.popper, r) && (t.elements.arrow = r));
}
var Ps = {
	name: "arrow",
	enabled: !0,
	phase: "main",
	fn: Ms,
	effect: Ns,
	requires: ["popperOffsets"],
	requiresIfExists: ["preventOverflow"]
};
//#endregion
//#region node_modules/@popperjs/core/lib/utils/getVariation.js
function Fs(e) {
	return e.split("-")[1];
}
//#endregion
//#region node_modules/@popperjs/core/lib/modifiers/computeStyles.js
var Is = {
	top: "auto",
	right: "auto",
	bottom: "auto",
	left: "auto"
};
function Ls(e, t) {
	var n = e.x, r = e.y, i = t.devicePixelRatio || 1;
	return {
		x: ps(n * i) / i || 0,
		y: ps(r * i) / i || 0
	};
}
function Rs(e) {
	var t, n = e.popper, r = e.popperRect, i = e.placement, a = e.variation, o = e.offsets, s = e.position, c = e.gpuAcceleration, l = e.adaptive, u = e.roundOffsets, d = e.isFixed, f = o.x, p = f === void 0 ? 0 : f, m = o.y, h = m === void 0 ? 0 : m, g = typeof u == "function" ? u({
		x: p,
		y: h
	}) : {
		x: p,
		y: h
	};
	p = g.x, h = g.y;
	var _ = o.hasOwnProperty("x"), v = o.hasOwnProperty("y"), y = W, b = "top", x = window;
	if (l) {
		var S = ws(n), C = "clientHeight", w = "clientWidth";
		if (S === K(n) && (S = bs(n), Y(S).position !== "static" && s === "absolute" && (C = "scrollHeight", w = "scrollWidth")), S = S, i === "top" || (i === "left" || i === "right") && a === "end") {
			b = U;
			var T = d && S === x && x.visualViewport ? x.visualViewport.height : S[C];
			h -= T - r.height, h *= c ? 1 : -1;
		}
		if (i === "left" || (i === "top" || i === "bottom") && a === "end") {
			y = Yo;
			var E = d && S === x && x.visualViewport ? x.visualViewport.width : S[w];
			p -= E - r.width, p *= c ? 1 : -1;
		}
	}
	var D = Object.assign({ position: s }, l && Is), O = u === !0 ? Ls({
		x: p,
		y: h
	}, K(n)) : {
		x: p,
		y: h
	};
	if (p = O.x, h = O.y, c) {
		var k;
		return Object.assign({}, D, (k = {}, k[b] = v ? "0" : "", k[y] = _ ? "0" : "", k.transform = (x.devicePixelRatio || 1) <= 1 ? "translate(" + p + "px, " + h + "px)" : "translate3d(" + p + "px, " + h + "px, 0)", k));
	}
	return Object.assign({}, D, (t = {}, t[b] = v ? h + "px" : "", t[y] = _ ? p + "px" : "", t.transform = "", t));
}
function zs(e) {
	var t = e.state, n = e.options, r = n.gpuAcceleration, i = r === void 0 || r, a = n.adaptive, o = a === void 0 || a, s = n.roundOffsets, c = s === void 0 || s, l = {
		placement: J(t.placement),
		variation: Fs(t.placement),
		popper: t.elements.popper,
		popperRect: t.rects.popper,
		gpuAcceleration: i,
		isFixed: t.options.strategy === "fixed"
	};
	t.modifiersData.popperOffsets != null && (t.styles.popper = Object.assign({}, t.styles.popper, Rs(Object.assign({}, l, {
		offsets: t.modifiersData.popperOffsets,
		position: t.options.strategy,
		adaptive: o,
		roundOffsets: c
	})))), t.modifiersData.arrow != null && (t.styles.arrow = Object.assign({}, t.styles.arrow, Rs(Object.assign({}, l, {
		offsets: t.modifiersData.arrow,
		position: "absolute",
		adaptive: !1,
		roundOffsets: c
	})))), t.attributes.popper = Object.assign({}, t.attributes.popper, { "data-popper-placement": t.placement });
}
var Bs = {
	name: "computeStyles",
	enabled: !0,
	phase: "beforeWrite",
	fn: zs,
	data: {}
}, Vs = { passive: !0 };
function Hs(e) {
	var t = e.state, n = e.instance, r = e.options, i = r.scroll, a = i === void 0 || i, o = r.resize, s = o === void 0 || o, c = K(t.elements.popper), l = [].concat(t.scrollParents.reference, t.scrollParents.popper);
	return a && l.forEach(function(e) {
		e.addEventListener("scroll", n.update, Vs);
	}), s && c.addEventListener("resize", n.update, Vs), function() {
		a && l.forEach(function(e) {
			e.removeEventListener("scroll", n.update, Vs);
		}), s && c.removeEventListener("resize", n.update, Vs);
	};
}
var Us = {
	name: "eventListeners",
	enabled: !0,
	phase: "write",
	fn: function() {},
	effect: Hs,
	data: {}
}, Ws = {
	left: "right",
	right: "left",
	bottom: "top",
	top: "bottom"
};
function Gs(e) {
	return e.replace(/left|right|bottom|top/g, function(e) {
		return Ws[e];
	});
}
//#endregion
//#region node_modules/@popperjs/core/lib/utils/getOppositeVariationPlacement.js
var Ks = {
	start: "end",
	end: "start"
};
function qs(e) {
	return e.replace(/start|end/g, function(e) {
		return Ks[e];
	});
}
//#endregion
//#region node_modules/@popperjs/core/lib/dom-utils/getWindowScroll.js
function Js(e) {
	var t = K(e);
	return {
		scrollLeft: t.pageXOffset,
		scrollTop: t.pageYOffset
	};
}
//#endregion
//#region node_modules/@popperjs/core/lib/dom-utils/getWindowScrollBarX.js
function Ys(e) {
	return gs(bs(e)).left + Js(e).scrollLeft;
}
//#endregion
//#region node_modules/@popperjs/core/lib/dom-utils/getViewportRect.js
function Xs(e, t) {
	var n = K(e), r = bs(e), i = n.visualViewport, a = r.clientWidth, o = r.clientHeight, s = 0, c = 0;
	if (i) {
		a = i.width, o = i.height;
		var l = hs();
		(l || !l && t === "fixed") && (s = i.offsetLeft, c = i.offsetTop);
	}
	return {
		width: a,
		height: o,
		x: s + Ys(e),
		y: c
	};
}
//#endregion
//#region node_modules/@popperjs/core/lib/dom-utils/getDocumentRect.js
function Zs(e) {
	var t = bs(e), n = Js(e), r = e.ownerDocument?.body, i = ds(t.scrollWidth, t.clientWidth, r ? r.scrollWidth : 0, r ? r.clientWidth : 0), a = ds(t.scrollHeight, t.clientHeight, r ? r.scrollHeight : 0, r ? r.clientHeight : 0), o = -n.scrollLeft + Ys(e), s = -n.scrollTop;
	return Y(r || t).direction === "rtl" && (o += ds(t.clientWidth, r ? r.clientWidth : 0) - i), {
		width: i,
		height: a,
		x: o,
		y: s
	};
}
//#endregion
//#region node_modules/@popperjs/core/lib/dom-utils/isScrollParent.js
function Qs(e) {
	var t = Y(e), n = t.overflow, r = t.overflowX, i = t.overflowY;
	return /auto|scroll|overlay|hidden/.test(n + i + r);
}
//#endregion
//#region node_modules/@popperjs/core/lib/dom-utils/getScrollParent.js
function $s(e) {
	return [
		"html",
		"body",
		"#document"
	].indexOf(G(e)) >= 0 ? e.ownerDocument.body : q(e) && Qs(e) ? e : $s(xs(e));
}
//#endregion
//#region node_modules/@popperjs/core/lib/dom-utils/listScrollParents.js
function ec(e, t) {
	t === void 0 && (t = []);
	var n = $s(e), r = n === e.ownerDocument?.body, i = K(n), a = r ? [i].concat(i.visualViewport || [], Qs(n) ? n : []) : n, o = t.concat(a);
	return r ? o : o.concat(ec(xs(a)));
}
//#endregion
//#region node_modules/@popperjs/core/lib/utils/rectToClientRect.js
function tc(e) {
	return Object.assign({}, e, {
		left: e.x,
		top: e.y,
		right: e.x + e.width,
		bottom: e.y + e.height
	});
}
//#endregion
//#region node_modules/@popperjs/core/lib/dom-utils/getClippingRect.js
function nc(e, t) {
	var n = gs(e, !1, t === "fixed");
	return n.top += e.clientTop, n.left += e.clientLeft, n.bottom = n.top + e.clientHeight, n.right = n.left + e.clientWidth, n.width = e.clientWidth, n.height = e.clientHeight, n.x = n.left, n.y = n.top, n;
}
function rc(e, t, n) {
	return t === "viewport" ? tc(Xs(e, n)) : os(t) ? nc(t, n) : tc(Zs(bs(e)));
}
function ic(e) {
	var t = ec(xs(e)), n = ["absolute", "fixed"].indexOf(Y(e).position) >= 0 && q(e) ? ws(e) : e;
	return os(n) ? t.filter(function(e) {
		return os(e) && vs(e, n) && G(e) !== "body";
	}) : [];
}
function ac(e, t, n, r) {
	var i = t === "clippingParents" ? ic(e) : [].concat(t), a = [].concat(i, [n]), o = a[0], s = a.reduce(function(t, n) {
		var i = rc(e, n, r);
		return t.top = ds(i.top, t.top), t.right = fs(i.right, t.right), t.bottom = fs(i.bottom, t.bottom), t.left = ds(i.left, t.left), t;
	}, rc(e, o, r));
	return s.width = s.right - s.left, s.height = s.bottom - s.top, s.x = s.left, s.y = s.top, s;
}
//#endregion
//#region node_modules/@popperjs/core/lib/utils/computeOffsets.js
function oc(e) {
	var t = e.reference, n = e.element, r = e.placement, i = r ? J(r) : null, a = r ? Fs(r) : null, o = t.x + t.width / 2 - n.width / 2, s = t.y + t.height / 2 - n.height / 2, c;
	switch (i) {
		case "top":
			c = {
				x: o,
				y: t.y - n.height
			};
			break;
		case U:
			c = {
				x: o,
				y: t.y + t.height
			};
			break;
		case Yo:
			c = {
				x: t.x + t.width,
				y: s
			};
			break;
		case W:
			c = {
				x: t.x - n.width,
				y: s
			};
			break;
		default: c = {
			x: t.x,
			y: t.y
		};
	}
	var l = i ? Ts(i) : null;
	if (l != null) {
		var u = l === "y" ? "height" : "width";
		switch (a) {
			case Qo:
				c[l] = c[l] - (t[u] / 2 - n[u] / 2);
				break;
			case "end": c[l] = c[l] + (t[u] / 2 - n[u] / 2);
		}
	}
	return c;
}
//#endregion
//#region node_modules/@popperjs/core/lib/utils/detectOverflow.js
function sc(e, t) {
	t === void 0 && (t = {});
	var n = t, r = n.placement, i = r === void 0 ? e.placement : r, a = n.strategy, o = a === void 0 ? e.strategy : a, s = n.boundary, c = s === void 0 ? $o : s, l = n.rootBoundary, u = l === void 0 ? es : l, d = n.elementContext, f = d === void 0 ? ts : d, p = n.altBoundary, m = p !== void 0 && p, h = n.padding, g = h === void 0 ? 0 : h, _ = ks(typeof g == "number" ? As(g, Zo) : g), v = f === "popper" ? ns : ts, y = e.rects.popper, b = e.elements[m ? v : f], x = ac(os(b) ? b : b.contextElement || bs(e.elements.popper), c, u, o), S = gs(e.elements.reference), C = oc({
		reference: S,
		element: y,
		strategy: "absolute",
		placement: i
	}), w = tc(Object.assign({}, y, C)), T = f === "popper" ? w : S, E = {
		top: x.top - T.top + _.top,
		bottom: T.bottom - x.bottom + _.bottom,
		left: x.left - T.left + _.left,
		right: T.right - x.right + _.right
	}, D = e.modifiersData.offset;
	if (f === "popper" && D) {
		var O = D[i];
		Object.keys(E).forEach(function(e) {
			var t = ["right", "bottom"].indexOf(e) >= 0 ? 1 : -1, n = ["top", "bottom"].indexOf(e) >= 0 ? "y" : "x";
			E[e] += O[n] * t;
		});
	}
	return E;
}
//#endregion
//#region node_modules/@popperjs/core/lib/utils/computeAutoPlacement.js
function cc(e, t) {
	t === void 0 && (t = {});
	var n = t, r = n.placement, i = n.boundary, a = n.rootBoundary, o = n.padding, s = n.flipVariations, c = n.allowedAutoPlacements, l = c === void 0 ? is : c, u = Fs(r), d = u ? s ? rs : rs.filter(function(e) {
		return Fs(e) === u;
	}) : Zo, f = d.filter(function(e) {
		return l.indexOf(e) >= 0;
	});
	f.length === 0 && (f = d);
	var p = f.reduce(function(t, n) {
		return t[n] = sc(e, {
			placement: n,
			boundary: i,
			rootBoundary: a,
			padding: o
		})[J(n)], t;
	}, {});
	return Object.keys(p).sort(function(e, t) {
		return p[e] - p[t];
	});
}
//#endregion
//#region node_modules/@popperjs/core/lib/modifiers/flip.js
function lc(e) {
	if (J(e) === "auto") return [];
	var t = Gs(e);
	return [
		qs(e),
		t,
		qs(t)
	];
}
function uc(e) {
	var t = e.state, n = e.options, r = e.name;
	if (!t.modifiersData[r]._skip) {
		for (var i = n.mainAxis, a = i === void 0 || i, o = n.altAxis, s = o === void 0 || o, c = n.fallbackPlacements, l = n.padding, u = n.boundary, d = n.rootBoundary, f = n.altBoundary, p = n.flipVariations, m = p === void 0 || p, h = n.allowedAutoPlacements, g = t.options.placement, _ = J(g) === g, v = c || (_ || !m ? [Gs(g)] : lc(g)), y = [g].concat(v).reduce(function(e, n) {
			return e.concat(J(n) === "auto" ? cc(t, {
				placement: n,
				boundary: u,
				rootBoundary: d,
				padding: l,
				flipVariations: m,
				allowedAutoPlacements: h
			}) : n);
		}, []), b = t.rects.reference, x = t.rects.popper, S = /* @__PURE__ */ new Map(), C = !0, w = y[0], T = 0; T < y.length; T++) {
			var E = y[T], D = J(E), O = Fs(E) === Qo, k = ["top", U].indexOf(D) >= 0, A = k ? "width" : "height", j = sc(t, {
				placement: E,
				boundary: u,
				rootBoundary: d,
				altBoundary: f,
				padding: l
			}), M = k ? O ? Yo : W : O ? U : "top";
			b[A] > x[A] && (M = Gs(M));
			var N = Gs(M), P = [];
			if (a && P.push(j[D] <= 0), s && P.push(j[M] <= 0, j[N] <= 0), P.every(function(e) {
				return e;
			})) {
				w = E, C = !1;
				break;
			}
			S.set(E, P);
		}
		if (C) for (var ee = m ? 3 : 1, te = function(e) {
			var t = y.find(function(t) {
				var n = S.get(t);
				if (n) return n.slice(0, e).every(function(e) {
					return e;
				});
			});
			if (t) return w = t, "break";
		}, F = ee; F > 0 && te(F) !== "break"; F--);
		t.placement !== w && (t.modifiersData[r]._skip = !0, t.placement = w, t.reset = !0);
	}
}
var dc = {
	name: "flip",
	enabled: !0,
	phase: "main",
	fn: uc,
	requiresIfExists: ["offset"],
	data: { _skip: !1 }
};
//#endregion
//#region node_modules/@popperjs/core/lib/modifiers/hide.js
function fc(e, t, n) {
	return n === void 0 && (n = {
		x: 0,
		y: 0
	}), {
		top: e.top - t.height - n.y,
		right: e.right - t.width + n.x,
		bottom: e.bottom - t.height + n.y,
		left: e.left - t.width - n.x
	};
}
function pc(e) {
	return [
		"top",
		Yo,
		U,
		W
	].some(function(t) {
		return e[t] >= 0;
	});
}
function mc(e) {
	var t = e.state, n = e.name, r = t.rects.reference, i = t.rects.popper, a = t.modifiersData.preventOverflow, o = sc(t, { elementContext: "reference" }), s = sc(t, { altBoundary: !0 }), c = fc(o, r), l = fc(s, i, a), u = pc(c), d = pc(l);
	t.modifiersData[n] = {
		referenceClippingOffsets: c,
		popperEscapeOffsets: l,
		isReferenceHidden: u,
		hasPopperEscaped: d
	}, t.attributes.popper = Object.assign({}, t.attributes.popper, {
		"data-popper-reference-hidden": u,
		"data-popper-escaped": d
	});
}
var hc = {
	name: "hide",
	enabled: !0,
	phase: "main",
	requiresIfExists: ["preventOverflow"],
	fn: mc
};
//#endregion
//#region node_modules/@popperjs/core/lib/modifiers/offset.js
function gc(e, t, n) {
	var r = J(e), i = ["left", "top"].indexOf(r) >= 0 ? -1 : 1, a = typeof n == "function" ? n(Object.assign({}, t, { placement: e })) : n, o = a[0], s = a[1];
	return o = o || 0, s = (s || 0) * i, ["left", "right"].indexOf(r) >= 0 ? {
		x: s,
		y: o
	} : {
		x: o,
		y: s
	};
}
function _c(e) {
	var t = e.state, n = e.options, r = e.name, i = n.offset, a = i === void 0 ? [0, 0] : i, o = is.reduce(function(e, n) {
		return e[n] = gc(n, t.rects, a), e;
	}, {}), s = o[t.placement], c = s.x, l = s.y;
	t.modifiersData.popperOffsets != null && (t.modifiersData.popperOffsets.x += c, t.modifiersData.popperOffsets.y += l), t.modifiersData[r] = o;
}
var vc = {
	name: "offset",
	enabled: !0,
	phase: "main",
	requires: ["popperOffsets"],
	fn: _c
};
//#endregion
//#region node_modules/@popperjs/core/lib/modifiers/popperOffsets.js
function yc(e) {
	var t = e.state, n = e.name;
	t.modifiersData[n] = oc({
		reference: t.rects.reference,
		element: t.rects.popper,
		strategy: "absolute",
		placement: t.placement
	});
}
var bc = {
	name: "popperOffsets",
	enabled: !0,
	phase: "read",
	fn: yc,
	data: {}
};
//#endregion
//#region node_modules/@popperjs/core/lib/utils/getAltAxis.js
function xc(e) {
	return e === "x" ? "y" : "x";
}
//#endregion
//#region node_modules/@popperjs/core/lib/modifiers/preventOverflow.js
function Sc(e) {
	var t = e.state, n = e.options, r = e.name, i = n.mainAxis, a = i === void 0 || i, o = n.altAxis, s = o !== void 0 && o, c = n.boundary, l = n.rootBoundary, u = n.altBoundary, d = n.padding, f = n.tether, p = f === void 0 || f, m = n.tetherOffset, h = m === void 0 ? 0 : m, g = sc(t, {
		boundary: c,
		rootBoundary: l,
		padding: d,
		altBoundary: u
	}), _ = J(t.placement), v = Fs(t.placement), y = !v, b = Ts(_), x = xc(b), S = t.modifiersData.popperOffsets, C = t.rects.reference, w = t.rects.popper, T = typeof h == "function" ? h(Object.assign({}, t.rects, { placement: t.placement })) : h, E = typeof T == "number" ? {
		mainAxis: T,
		altAxis: T
	} : Object.assign({
		mainAxis: 0,
		altAxis: 0
	}, T), D = t.modifiersData.offset ? t.modifiersData.offset[t.placement] : null, O = {
		x: 0,
		y: 0
	};
	if (S) {
		if (a) {
			var k = b === "y" ? "top" : W, A = b === "y" ? U : Yo, j = b === "y" ? "height" : "width", M = S[b], N = M + g[k], P = M - g[A], ee = p ? -w[j] / 2 : 0, te = v === "start" ? C[j] : w[j], F = v === "start" ? -w[j] : -C[j], ne = t.elements.arrow, re = p && ne ? _s(ne) : {
				width: 0,
				height: 0
			}, ie = t.modifiersData["arrow#persistent"] ? t.modifiersData["arrow#persistent"].padding : Os(), ae = ie[k], oe = ie[A], se = Es(0, C[j], re[j]), ce = y ? C[j] / 2 - ee - se - ae - E.mainAxis : te - se - ae - E.mainAxis, le = y ? -C[j] / 2 + ee + se + oe + E.mainAxis : F + se + oe + E.mainAxis, ue = t.elements.arrow && ws(t.elements.arrow), de = ue ? b === "y" ? ue.clientTop || 0 : ue.clientLeft || 0 : 0, fe = D?.[b] ?? 0, pe = M + ce - fe - de, me = M + le - fe, he = Es(p ? fs(N, pe) : N, M, p ? ds(P, me) : P);
			S[b] = he, O[b] = he - M;
		}
		if (s) {
			var ge = b === "x" ? "top" : W, _e = b === "x" ? U : Yo, I = S[x], ve = x === "y" ? "height" : "width", ye = I + g[ge], be = I - g[_e], xe = ["top", W].indexOf(_) !== -1, Se = D?.[x] ?? 0, Ce = xe ? ye : I - C[ve] - w[ve] - Se + E.altAxis, we = xe ? I + C[ve] + w[ve] - Se - E.altAxis : be, Te = p && xe ? Ds(Ce, I, we) : Es(p ? Ce : ye, I, p ? we : be);
			S[x] = Te, O[x] = Te - I;
		}
		t.modifiersData[r] = O;
	}
}
var Cc = {
	name: "preventOverflow",
	enabled: !0,
	phase: "main",
	fn: Sc,
	requiresIfExists: ["offset"]
};
//#endregion
//#region node_modules/@popperjs/core/lib/dom-utils/getHTMLElementScroll.js
function wc(e) {
	return {
		scrollLeft: e.scrollLeft,
		scrollTop: e.scrollTop
	};
}
//#endregion
//#region node_modules/@popperjs/core/lib/dom-utils/getNodeScroll.js
function Tc(e) {
	return e === K(e) || !q(e) ? Js(e) : wc(e);
}
//#endregion
//#region node_modules/@popperjs/core/lib/dom-utils/getCompositeRect.js
function Ec(e) {
	var t = e.getBoundingClientRect(), n = ps(t.width) / e.offsetWidth || 1, r = ps(t.height) / e.offsetHeight || 1;
	return n !== 1 || r !== 1;
}
function Dc(e, t, n) {
	n === void 0 && (n = !1);
	var r = q(t), i = q(t) && Ec(t), a = bs(t), o = gs(e, i, n), s = {
		scrollLeft: 0,
		scrollTop: 0
	}, c = {
		x: 0,
		y: 0
	};
	return (r || !r && !n) && ((G(t) !== "body" || Qs(a)) && (s = Tc(t)), q(t) ? (c = gs(t, !0), c.x += t.clientLeft, c.y += t.clientTop) : a && (c.x = Ys(a))), {
		x: o.left + s.scrollLeft - c.x,
		y: o.top + s.scrollTop - c.y,
		width: o.width,
		height: o.height
	};
}
//#endregion
//#region node_modules/@popperjs/core/lib/utils/orderModifiers.js
function Oc(e) {
	var t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set(), r = [];
	e.forEach(function(e) {
		t.set(e.name, e);
	});
	function i(e) {
		n.add(e.name), [].concat(e.requires || [], e.requiresIfExists || []).forEach(function(e) {
			if (!n.has(e)) {
				var r = t.get(e);
				r && i(r);
			}
		}), r.push(e);
	}
	return e.forEach(function(e) {
		n.has(e.name) || i(e);
	}), r;
}
function kc(e) {
	var t = Oc(e);
	return as.reduce(function(e, n) {
		return e.concat(t.filter(function(e) {
			return e.phase === n;
		}));
	}, []);
}
//#endregion
//#region node_modules/@popperjs/core/lib/utils/debounce.js
function Ac(e) {
	var t;
	return function() {
		return t || (t = new Promise(function(n) {
			Promise.resolve().then(function() {
				t = void 0, n(e());
			});
		})), t;
	};
}
//#endregion
//#region node_modules/@popperjs/core/lib/utils/mergeByName.js
function jc(e) {
	var t = e.reduce(function(e, t) {
		var n = e[t.name];
		return e[t.name] = n ? Object.assign({}, n, t, {
			options: Object.assign({}, n.options, t.options),
			data: Object.assign({}, n.data, t.data)
		}) : t, e;
	}, {});
	return Object.keys(t).map(function(e) {
		return t[e];
	});
}
//#endregion
//#region node_modules/@popperjs/core/lib/createPopper.js
var Mc = {
	placement: "bottom",
	modifiers: [],
	strategy: "absolute"
};
function Nc() {
	return ![...arguments].some(function(e) {
		return !(e && typeof e.getBoundingClientRect == "function");
	});
}
function Pc(e) {
	e === void 0 && (e = {});
	var t = e, n = t.defaultModifiers, r = n === void 0 ? [] : n, i = t.defaultOptions, a = i === void 0 ? Mc : i;
	return function(e, t, n) {
		n === void 0 && (n = a);
		var i = {
			placement: "bottom",
			orderedModifiers: [],
			options: Object.assign({}, Mc, a),
			modifiersData: {},
			elements: {
				reference: e,
				popper: t
			},
			attributes: {},
			styles: {}
		}, o = [], s = !1, c = {
			state: i,
			setOptions: function(n) {
				var o = typeof n == "function" ? n(i.options) : n;
				u(), i.options = Object.assign({}, a, i.options, o), i.scrollParents = {
					reference: os(e) ? ec(e) : e.contextElement ? ec(e.contextElement) : [],
					popper: ec(t)
				};
				var s = kc(jc([].concat(r, i.options.modifiers)));
				return i.orderedModifiers = s.filter(function(e) {
					return e.enabled;
				}), l(), c.update();
			},
			forceUpdate: function() {
				if (!s) {
					var e = i.elements, t = e.reference, n = e.popper;
					if (Nc(t, n)) {
						i.rects = {
							reference: Dc(t, ws(n), i.options.strategy === "fixed"),
							popper: _s(n)
						}, i.reset = !1, i.placement = i.options.placement, i.orderedModifiers.forEach(function(e) {
							return i.modifiersData[e.name] = Object.assign({}, e.data);
						});
						for (var r = 0; r < i.orderedModifiers.length; r++) {
							if (i.reset === !0) {
								i.reset = !1, r = -1;
								continue;
							}
							var a = i.orderedModifiers[r], o = a.fn, l = a.options, u = l === void 0 ? {} : l, d = a.name;
							typeof o == "function" && (i = o({
								state: i,
								options: u,
								name: d,
								instance: c
							}) || i);
						}
					}
				}
			},
			update: Ac(function() {
				return new Promise(function(e) {
					c.forceUpdate(), e(i);
				});
			}),
			destroy: function() {
				u(), s = !0;
			}
		};
		if (!Nc(e, t)) return c;
		c.setOptions(n).then(function(e) {
			!s && n.onFirstUpdate && n.onFirstUpdate(e);
		});
		function l() {
			i.orderedModifiers.forEach(function(e) {
				var t = e.name, n = e.options, r = n === void 0 ? {} : n, a = e.effect;
				if (typeof a == "function") {
					var s = a({
						state: i,
						name: t,
						instance: c,
						options: r
					});
					o.push(s || function() {});
				}
			});
		}
		function u() {
			o.forEach(function(e) {
				return e();
			}), o = [];
		}
		return c;
	};
}
var Fc = /*#__PURE__*/ Pc({ defaultModifiers: [
	Us,
	bc,
	Bs,
	us,
	vc,
	dc,
	Cc,
	Ps,
	hc
] }), Ic = "tippy-box", Lc = "tippy-content", Rc = "tippy-backdrop", zc = "tippy-arrow", Bc = "tippy-svg-arrow", Vc = {
	passive: !0,
	capture: !0
}, Hc = function() {
	return document.body;
};
function Uc(e, t, n) {
	return Array.isArray(e) ? e[t] ?? (Array.isArray(n) ? n[t] : n) : e;
}
function Wc(e, t) {
	var n = {}.toString.call(e);
	return n.indexOf("[object") === 0 && n.indexOf(t + "]") > -1;
}
function Gc(e, t) {
	return typeof e == "function" ? e.apply(void 0, t) : e;
}
function Kc(e, t) {
	if (t === 0) return e;
	var n;
	return function(r) {
		clearTimeout(n), n = setTimeout(function() {
			e(r);
		}, t);
	};
}
function qc(e) {
	return e.split(/\s+/).filter(Boolean);
}
function Jc(e) {
	return [].concat(e);
}
function Yc(e, t) {
	e.indexOf(t) === -1 && e.push(t);
}
function Xc(e) {
	return e.filter(function(t, n) {
		return e.indexOf(t) === n;
	});
}
function Zc(e) {
	return e.split("-")[0];
}
function Qc(e) {
	return [].slice.call(e);
}
function $c(e) {
	return Object.keys(e).reduce(function(t, n) {
		return e[n] !== void 0 && (t[n] = e[n]), t;
	}, {});
}
function el() {
	return document.createElement("div");
}
function tl(e) {
	return ["Element", "Fragment"].some(function(t) {
		return Wc(e, t);
	});
}
function nl(e) {
	return Wc(e, "NodeList");
}
function rl(e) {
	return Wc(e, "MouseEvent");
}
function il(e) {
	return !!(e && e._tippy && e._tippy.reference === e);
}
function al(e) {
	return tl(e) ? [e] : nl(e) ? Qc(e) : Array.isArray(e) ? e : Qc(document.querySelectorAll(e));
}
function ol(e, t) {
	e.forEach(function(e) {
		e && (e.style.transitionDuration = t + "ms");
	});
}
function sl(e, t) {
	e.forEach(function(e) {
		e && e.setAttribute("data-state", t);
	});
}
function cl(e) {
	var t, n = Jc(e)[0];
	return n != null && (t = n.ownerDocument) != null && t.body ? n.ownerDocument : document;
}
function ll(e, t) {
	var n = t.clientX, r = t.clientY;
	return e.every(function(e) {
		var t = e.popperRect, i = e.popperState, a = e.props.interactiveBorder, o = Zc(i.placement), s = i.modifiersData.offset;
		if (!s) return !0;
		var c = o === "bottom" ? s.top.y : 0, l = o === "top" ? s.bottom.y : 0, u = o === "right" ? s.left.x : 0, d = o === "left" ? s.right.x : 0, f = t.top - r + c > a, p = r - t.bottom - l > a, m = t.left - n + u > a, h = n - t.right - d > a;
		return f || p || m || h;
	});
}
function ul(e, t, n) {
	var r = t + "EventListener";
	["transitionend", "webkitTransitionEnd"].forEach(function(t) {
		e[r](t, n);
	});
}
function dl(e, t) {
	for (var n = t; n;) {
		if (e.contains(n)) return !0;
		n = n.getRootNode == null ? void 0 : n.getRootNode()?.host;
	}
	return !1;
}
var X = { isTouch: !1 }, fl = 0;
function pl() {
	X.isTouch || (X.isTouch = !0, window.performance && document.addEventListener("mousemove", ml));
}
function ml() {
	var e = performance.now();
	e - fl < 20 && (X.isTouch = !1, document.removeEventListener("mousemove", ml)), fl = e;
}
function hl() {
	var e = document.activeElement;
	if (il(e)) {
		var t = e._tippy;
		e.blur && !t.state.isVisible && e.blur();
	}
}
function gl() {
	document.addEventListener("touchstart", pl, Vc), window.addEventListener("blur", hl);
}
var _l = typeof window < "u" && typeof document < "u" && !!window.msCrypto, Z = Object.assign({
	appendTo: Hc,
	aria: {
		content: "auto",
		expanded: "auto"
	},
	delay: 0,
	duration: [300, 250],
	getReferenceClientRect: null,
	hideOnClick: !0,
	ignoreAttributes: !1,
	interactive: !1,
	interactiveBorder: 2,
	interactiveDebounce: 0,
	moveTransition: "",
	offset: [0, 10],
	onAfterUpdate: function() {},
	onBeforeUpdate: function() {},
	onCreate: function() {},
	onDestroy: function() {},
	onHidden: function() {},
	onHide: function() {},
	onMount: function() {},
	onShow: function() {},
	onShown: function() {},
	onTrigger: function() {},
	onUntrigger: function() {},
	onClickOutside: function() {},
	placement: "top",
	plugins: [],
	popperOptions: {},
	render: null,
	showOnCreate: !1,
	touch: !0,
	trigger: "mouseenter focus",
	triggerTarget: null
}, {
	animateFill: !1,
	followCursor: !1,
	inlinePositioning: !1,
	sticky: !1
}, {
	allowHTML: !1,
	animation: "fade",
	arrow: !0,
	content: "",
	inertia: !1,
	maxWidth: 350,
	role: "tooltip",
	theme: "",
	zIndex: 9999
}), vl = Object.keys(Z), yl = function(e) {
	Object.keys(e).forEach(function(t) {
		Z[t] = e[t];
	});
};
function bl(e) {
	var t = (e.plugins || []).reduce(function(t, n) {
		var r = n.name, i = n.defaultValue;
		return r && (t[r] = e[r] === void 0 ? Z[r] ?? i : e[r]), t;
	}, {});
	return Object.assign({}, e, t);
}
function xl(e, t) {
	return (t ? Object.keys(bl(Object.assign({}, Z, { plugins: t }))) : vl).reduce(function(t, n) {
		var r = (e.getAttribute("data-tippy-" + n) || "").trim();
		if (!r) return t;
		if (n === "content") t[n] = r;
		else try {
			t[n] = JSON.parse(r);
		} catch {
			t[n] = r;
		}
		return t;
	}, {});
}
function Sl(e, t) {
	var n = Object.assign({}, t, { content: Gc(t.content, [e]) }, t.ignoreAttributes ? {} : xl(e, t.plugins));
	return n.aria = Object.assign({}, Z.aria, n.aria), n.aria = {
		expanded: n.aria.expanded === "auto" ? t.interactive : n.aria.expanded,
		content: n.aria.content === "auto" ? t.interactive ? null : "describedby" : n.aria.content
	}, n;
}
var Cl = function() {
	return "innerHTML";
};
function wl(e, t) {
	e[Cl()] = t;
}
function Tl(e) {
	var t = el();
	return e === !0 ? t.className = zc : (t.className = Bc, tl(e) ? t.appendChild(e) : wl(t, e)), t;
}
function El(e, t) {
	tl(t.content) ? (wl(e, ""), e.appendChild(t.content)) : typeof t.content != "function" && (t.allowHTML ? wl(e, t.content) : e.textContent = t.content);
}
function Dl(e) {
	var t = e.firstElementChild, n = Qc(t.children);
	return {
		box: t,
		content: n.find(function(e) {
			return e.classList.contains(Lc);
		}),
		arrow: n.find(function(e) {
			return e.classList.contains(zc) || e.classList.contains(Bc);
		}),
		backdrop: n.find(function(e) {
			return e.classList.contains(Rc);
		})
	};
}
function Ol(e) {
	var t = el(), n = el();
	n.className = Ic, n.setAttribute("data-state", "hidden"), n.setAttribute("tabindex", "-1");
	var r = el();
	r.className = Lc, r.setAttribute("data-state", "hidden"), El(r, e.props), t.appendChild(n), n.appendChild(r), i(e.props, e.props);
	function i(n, r) {
		var i = Dl(t), a = i.box, o = i.content, s = i.arrow;
		r.theme ? a.setAttribute("data-theme", r.theme) : a.removeAttribute("data-theme"), typeof r.animation == "string" ? a.setAttribute("data-animation", r.animation) : a.removeAttribute("data-animation"), r.inertia ? a.setAttribute("data-inertia", "") : a.removeAttribute("data-inertia"), a.style.maxWidth = typeof r.maxWidth == "number" ? r.maxWidth + "px" : r.maxWidth, r.role ? a.setAttribute("role", r.role) : a.removeAttribute("role"), (n.content !== r.content || n.allowHTML !== r.allowHTML) && El(o, e.props), r.arrow ? s ? n.arrow !== r.arrow && (a.removeChild(s), a.appendChild(Tl(r.arrow))) : a.appendChild(Tl(r.arrow)) : s && a.removeChild(s);
	}
	return {
		popper: t,
		onUpdate: i
	};
}
Ol.$$tippy = !0;
var kl = 1, Al = [], jl = [];
function Ml(e, t) {
	var n = Sl(e, Object.assign({}, Z, bl($c(t)))), r, i, a, o = !1, s = !1, c = !1, l = !1, u, d, f, p = [], m = Kc(pe, n.interactiveDebounce), h, g = kl++, _ = null, v = Xc(n.plugins), y = {
		id: g,
		reference: e,
		popper: el(),
		popperInstance: _,
		props: n,
		state: {
			isEnabled: !0,
			isVisible: !1,
			isDestroyed: !1,
			isMounted: !1,
			isShown: !1
		},
		plugins: v,
		clearDelayTimeouts: we,
		setProps: Te,
		setContent: Ee,
		show: De,
		hide: Oe,
		hideWithInteractivity: ke,
		enable: Se,
		disable: Ce,
		unmount: Ae,
		destroy: je
	};
	/* istanbul ignore if */
	if (!n.render) return y;
	var b = n.render(y), x = b.popper, S = b.onUpdate;
	x.setAttribute("data-tippy-root", ""), x.id = "tippy-" + y.id, y.popper = x, e._tippy = y, x._tippy = y;
	var C = v.map(function(e) {
		return e.fn(y);
	}), w = e.hasAttribute("aria-expanded");
	return ue(), ee(), M(), N("onCreate", [y]), n.showOnCreate && be(), x.addEventListener("mouseenter", function() {
		y.props.interactive && y.state.isVisible && y.clearDelayTimeouts();
	}), x.addEventListener("mouseleave", function() {
		y.props.interactive && y.props.trigger.indexOf("mouseenter") >= 0 && k().addEventListener("mousemove", m);
	}), y;
	function T() {
		var e = y.props.touch;
		return Array.isArray(e) ? e : [e, 0];
	}
	function E() {
		return T()[0] === "hold";
	}
	function D() {
		var e;
		return !!((e = y.props.render) != null && e.$$tippy);
	}
	function O() {
		return h || e;
	}
	function k() {
		var e = O().parentNode;
		return e ? cl(e) : document;
	}
	function A() {
		return Dl(x);
	}
	function j(e) {
		return y.state.isMounted && !y.state.isVisible || X.isTouch || u && u.type === "focus" ? 0 : Uc(y.props.delay, +!e, Z.delay);
	}
	function M(e) {
		e === void 0 && (e = !1), x.style.pointerEvents = y.props.interactive && !e ? "" : "none", x.style.zIndex = "" + y.props.zIndex;
	}
	function N(e, t, n) {
		if (n === void 0 && (n = !0), C.forEach(function(n) {
			n[e] && n[e].apply(n, t);
		}), n) {
			var r;
			(r = y.props)[e].apply(r, t);
		}
	}
	function P() {
		var t = y.props.aria;
		if (t.content) {
			var n = "aria-" + t.content, r = x.id;
			Jc(y.props.triggerTarget || e).forEach(function(e) {
				var t = e.getAttribute(n);
				if (y.state.isVisible) e.setAttribute(n, t ? t + " " + r : r);
				else {
					var i = t && t.replace(r, "").trim();
					i ? e.setAttribute(n, i) : e.removeAttribute(n);
				}
			});
		}
	}
	function ee() {
		w || !y.props.aria.expanded || Jc(y.props.triggerTarget || e).forEach(function(e) {
			y.props.interactive ? e.setAttribute("aria-expanded", y.state.isVisible && e === O() ? "true" : "false") : e.removeAttribute("aria-expanded");
		});
	}
	function te() {
		k().removeEventListener("mousemove", m), Al = Al.filter(function(e) {
			return e !== m;
		});
	}
	function F(t) {
		if (!(X.isTouch && (c || t.type === "mousedown"))) {
			var n = t.composedPath && t.composedPath()[0] || t.target;
			if (!(y.props.interactive && dl(x, n))) {
				if (Jc(y.props.triggerTarget || e).some(function(e) {
					return dl(e, n);
				})) {
					if (X.isTouch || y.state.isVisible && y.props.trigger.indexOf("click") >= 0) return;
				} else N("onClickOutside", [y, t]);
				y.props.hideOnClick === !0 && (y.clearDelayTimeouts(), y.hide(), s = !0, setTimeout(function() {
					s = !1;
				}), y.state.isMounted || ae());
			}
		}
	}
	function ne() {
		c = !0;
	}
	function re() {
		c = !1;
	}
	function ie() {
		var e = k();
		e.addEventListener("mousedown", F, !0), e.addEventListener("touchend", F, Vc), e.addEventListener("touchstart", re, Vc), e.addEventListener("touchmove", ne, Vc);
	}
	function ae() {
		var e = k();
		e.removeEventListener("mousedown", F, !0), e.removeEventListener("touchend", F, Vc), e.removeEventListener("touchstart", re, Vc), e.removeEventListener("touchmove", ne, Vc);
	}
	function oe(e, t) {
		ce(e, function() {
			!y.state.isVisible && x.parentNode && x.parentNode.contains(x) && t();
		});
	}
	function se(e, t) {
		ce(e, t);
	}
	function ce(e, t) {
		var n = A().box;
		function r(e) {
			e.target === n && (ul(n, "remove", r), t());
		}
		if (e === 0) return t();
		ul(n, "remove", d), ul(n, "add", r), d = r;
	}
	function le(t, n, r) {
		r === void 0 && (r = !1), Jc(y.props.triggerTarget || e).forEach(function(e) {
			e.addEventListener(t, n, r), p.push({
				node: e,
				eventType: t,
				handler: n,
				options: r
			});
		});
	}
	function ue() {
		E() && (le("touchstart", fe, { passive: !0 }), le("touchend", me, { passive: !0 })), qc(y.props.trigger).forEach(function(e) {
			if (e !== "manual") switch (le(e, fe), e) {
				case "mouseenter":
					le("mouseleave", me);
					break;
				case "focus":
					le(_l ? "focusout" : "blur", he);
					break;
				case "focusin": le("focusout", he);
			}
		});
	}
	function de() {
		p.forEach(function(e) {
			var t = e.node, n = e.eventType, r = e.handler, i = e.options;
			t.removeEventListener(n, r, i);
		}), p = [];
	}
	function fe(e) {
		var t = !1;
		if (!(!y.state.isEnabled || ge(e) || s)) {
			var n = u?.type === "focus";
			u = e, h = e.currentTarget, ee(), !y.state.isVisible && rl(e) && Al.forEach(function(t) {
				return t(e);
			}), e.type === "click" && (y.props.trigger.indexOf("mouseenter") < 0 || o) && y.props.hideOnClick !== !1 && y.state.isVisible ? t = !0 : be(e), e.type === "click" && (o = !t), t && !n && xe(e);
		}
	}
	function pe(e) {
		var t = e.target, r = O().contains(t) || x.contains(t);
		e.type === "mousemove" && r || ll(ye().concat(x).map(function(e) {
			var t = e._tippy.popperInstance?.state;
			return t ? {
				popperRect: e.getBoundingClientRect(),
				popperState: t,
				props: n
			} : null;
		}).filter(Boolean), e) && (te(), xe(e));
	}
	function me(e) {
		if (!(ge(e) || y.props.trigger.indexOf("click") >= 0 && o)) {
			if (y.props.interactive) {
				y.hideWithInteractivity(e);
				return;
			}
			xe(e);
		}
	}
	function he(e) {
		y.props.trigger.indexOf("focusin") < 0 && e.target !== O() || y.props.interactive && e.relatedTarget && x.contains(e.relatedTarget) || xe(e);
	}
	function ge(e) {
		return X.isTouch ? E() !== e.type.indexOf("touch") >= 0 : !1;
	}
	function _e() {
		I();
		var t = y.props, n = t.popperOptions, r = t.placement, i = t.offset, a = t.getReferenceClientRect, o = t.moveTransition, s = D() ? Dl(x).arrow : null, c = a ? {
			getBoundingClientRect: a,
			contextElement: a.contextElement || O()
		} : e, l = [
			{
				name: "offset",
				options: { offset: i }
			},
			{
				name: "preventOverflow",
				options: { padding: {
					top: 2,
					bottom: 2,
					left: 5,
					right: 5
				} }
			},
			{
				name: "flip",
				options: { padding: 5 }
			},
			{
				name: "computeStyles",
				options: { adaptive: !o }
			},
			{
				name: "$$tippy",
				enabled: !0,
				phase: "beforeWrite",
				requires: ["computeStyles"],
				fn: function(e) {
					var t = e.state;
					if (D()) {
						var n = A().box;
						[
							"placement",
							"reference-hidden",
							"escaped"
						].forEach(function(e) {
							e === "placement" ? n.setAttribute("data-placement", t.placement) : t.attributes.popper["data-popper-" + e] ? n.setAttribute("data-" + e, "") : n.removeAttribute("data-" + e);
						}), t.attributes.popper = {};
					}
				}
			}
		];
		D() && s && l.push({
			name: "arrow",
			options: {
				element: s,
				padding: 3
			}
		}), l.push.apply(l, n?.modifiers || []), y.popperInstance = Fc(c, x, Object.assign({}, n, {
			placement: r,
			onFirstUpdate: f,
			modifiers: l
		}));
	}
	function I() {
		y.popperInstance && (y.popperInstance.destroy(), y.popperInstance = null);
	}
	function ve() {
		var e = y.props.appendTo, t, n = O();
		t = y.props.interactive && e === Hc || e === "parent" ? n.parentNode : Gc(e, [n]), t.contains(x) || t.appendChild(x), y.state.isMounted = !0, _e();
	}
	function ye() {
		return Qc(x.querySelectorAll("[data-tippy-root]"));
	}
	function be(e) {
		y.clearDelayTimeouts(), e && N("onTrigger", [y, e]), ie();
		var t = j(!0), n = T(), i = n[0], a = n[1];
		X.isTouch && i === "hold" && a && (t = a), t ? r = setTimeout(function() {
			y.show();
		}, t) : y.show();
	}
	function xe(e) {
		if (y.clearDelayTimeouts(), N("onUntrigger", [y, e]), !y.state.isVisible) {
			ae();
			return;
		}
		if (!(y.props.trigger.indexOf("mouseenter") >= 0 && y.props.trigger.indexOf("click") >= 0 && ["mouseleave", "mousemove"].indexOf(e.type) >= 0 && o)) {
			var t = j(!1);
			t ? i = setTimeout(function() {
				y.state.isVisible && y.hide();
			}, t) : a = requestAnimationFrame(function() {
				y.hide();
			});
		}
	}
	function Se() {
		y.state.isEnabled = !0;
	}
	function Ce() {
		y.hide(), y.state.isEnabled = !1;
	}
	function we() {
		clearTimeout(r), clearTimeout(i), cancelAnimationFrame(a);
	}
	function Te(t) {
		if (!y.state.isDestroyed) {
			N("onBeforeUpdate", [y, t]), de();
			var n = y.props, r = Sl(e, Object.assign({}, n, $c(t), { ignoreAttributes: !0 }));
			y.props = r, ue(), n.interactiveDebounce !== r.interactiveDebounce && (te(), m = Kc(pe, r.interactiveDebounce)), n.triggerTarget && !r.triggerTarget ? Jc(n.triggerTarget).forEach(function(e) {
				e.removeAttribute("aria-expanded");
			}) : r.triggerTarget && e.removeAttribute("aria-expanded"), ee(), M(), S && S(n, r), y.popperInstance && (_e(), ye().forEach(function(e) {
				requestAnimationFrame(e._tippy.popperInstance.forceUpdate);
			})), N("onAfterUpdate", [y, t]);
		}
	}
	function Ee(e) {
		y.setProps({ content: e });
	}
	function De() {
		var e = y.state.isVisible, t = y.state.isDestroyed, n = !y.state.isEnabled, r = X.isTouch && !y.props.touch, i = Uc(y.props.duration, 0, Z.duration);
		if (!(e || t || n || r) && !O().hasAttribute("disabled") && (N("onShow", [y], !1), y.props.onShow(y) !== !1)) {
			if (y.state.isVisible = !0, D() && (x.style.visibility = "visible"), M(), ie(), y.state.isMounted || (x.style.transition = "none"), D()) {
				var a = A(), o = a.box, s = a.content;
				ol([o, s], 0);
			}
			f = function() {
				var e;
				if (!(!y.state.isVisible || l)) {
					if (l = !0, x.offsetHeight, x.style.transition = y.props.moveTransition, D() && y.props.animation) {
						var t = A(), n = t.box, r = t.content;
						ol([n, r], i), sl([n, r], "visible");
					}
					P(), ee(), Yc(jl, y), (e = y.popperInstance) == null || e.forceUpdate(), N("onMount", [y]), y.props.animation && D() && se(i, function() {
						y.state.isShown = !0, N("onShown", [y]);
					});
				}
			}, ve();
		}
	}
	function Oe() {
		var e = !y.state.isVisible, t = y.state.isDestroyed, n = !y.state.isEnabled, r = Uc(y.props.duration, 1, Z.duration);
		if (!(e || t || n) && (N("onHide", [y], !1), y.props.onHide(y) !== !1)) {
			if (y.state.isVisible = !1, y.state.isShown = !1, l = !1, o = !1, D() && (x.style.visibility = "hidden"), te(), ae(), M(!0), D()) {
				var i = A(), a = i.box, s = i.content;
				y.props.animation && (ol([a, s], r), sl([a, s], "hidden"));
			}
			P(), ee(), y.props.animation ? D() && oe(r, y.unmount) : y.unmount();
		}
	}
	function ke(e) {
		k().addEventListener("mousemove", m), Yc(Al, m), m(e);
	}
	function Ae() {
		y.state.isVisible && y.hide(), y.state.isMounted && (I(), ye().forEach(function(e) {
			e._tippy.unmount();
		}), x.parentNode && x.parentNode.removeChild(x), jl = jl.filter(function(e) {
			return e !== y;
		}), y.state.isMounted = !1, N("onHidden", [y]));
	}
	function je() {
		y.state.isDestroyed || (y.clearDelayTimeouts(), y.unmount(), de(), delete e._tippy, y.state.isDestroyed = !0, N("onDestroy", [y]));
	}
}
function Nl(e, t) {
	t === void 0 && (t = {});
	var n = Z.plugins.concat(t.plugins || []);
	gl();
	var r = Object.assign({}, t, { plugins: n }), i = al(e).reduce(function(e, t) {
		var n = t && Ml(t, r);
		return n && e.push(n), e;
	}, []);
	return tl(e) ? i[0] : i;
}
//#endregion
//#region src/lib/svg-wind-barbs/index.ts
Nl.defaultProps = Z, Nl.setDefaultProps = yl, Nl.currentInput = X, Object.assign({}, us, { effect: function(e) {
	var t = e.state, n = {
		popper: {
			position: t.options.strategy,
			left: "0",
			top: "0",
			margin: "0"
		},
		arrow: { position: "absolute" },
		reference: {}
	};
	Object.assign(t.elements.popper.style, n.popper), t.styles = n, t.elements.arrow && Object.assign(t.elements.arrow.style, n.arrow);
} }), Nl.setDefaultProps({ render: Ol }), mn();
var Pl = z`<path class="svg-wb-fill" d="M125,120c2.762,0,5,2.239,5,5c0,2.762-2.238,5-5,5c-2.761,0-5-2.238-5-5C120,122.239,122.239,120,125,120z"/><path fill="none" class="svg-wb-stroke" stroke-width="2" d="M125,115c5.523,0,10,4.477,10,10c0,5.523-4.477,10-10,10 c-5.523,0-10-4.477-10-10C115,119.477,119.477,115,125,115z "/>`, Fl = z`<path class="svg-wb" d="M125,112V76 M125,125l7-12.1h-14L125,125z"/>`, Il = z`<path class="svg-wb" d="M125,112V76 M125,89l7-7 M125,125l7-12.1h-14L125,125z"/>`, Ll = z`<path class="svg-wb" d="M125,112V89 M125,89l14-14 M125,125l7-12.1h-14L125,125z"/>`, Rl = z`<path class="svg-wb" d="M125,112V89 M125,89l14-14 M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>`, zl = z`<path class="svg-wb" d="M125,112V89 M125,89l14-14 M125,100l14-14 M125,125l7-12.1h-14L125,125z"/>`, Bl = z`<path class="svg-wb" d="M125,112V79 M125,79l14-14 M125,90l14-14 M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>`, Vl = z`<path class="svg-wb" d="M125,112V79 M125,79l14-14 M125,90l14-14 M125,100l14-14 M125,125l7-12.1h-14L125,125z"/>`, Hl = z`<path class="svg-wb" d="M125,112V69 M125,69l14-14 M125,80l14-14 M125,90l14-14 M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>`, Ul = z`<path class="svg-wb" d="M125,112V69 M125,69l14-14 M125,80l14-14 M125,90l14-14 M125,100l14-14 M125,125l7-12.1h-14L125,125z"/>`, Wl = z`<path class="svg-wb" d="M125,112V59 M125,59l14-14 M125,70l14-14 M125,80l14-14 M125,90l14-14 M125,100l7-7 M125,125l7-12.1h-14 L125,125z"/>`, Gl = z`<path class="svg-wb" d="M125,112V76 M125,76h14l-14,14V76z M125,125l7-12.1h-14L125,125z"/>`, Kl = z`<path class="svg-wb" d="M125,112V76 M125,76h14l-14,14V76z M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>`, ql = z`<path class="svg-wb" d="M125,112V76 M125,76h14l-14,14V76z M125,100l14-14 M125,125l7-12.1h-14L125,125z"/>`, Jl = z`<path class="svg-wb" d="M125,112V66 M125,66h14l-14,14V66z M125,90l14-14 M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>`, Yl = z`<path class="svg-wb" d="M125,112V66 M125,66h14l-14,14V66z M125,90l14-14 M125,100l14-14 M125,125l7-12.1h-14L125,125z"/>`, Xl = z`<path class="svg-wb" d="M125,112V56 M125,56h14l-14,14V56z M125,80l14-14 M125,90l14-14 M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>`, Zl = z`<path class="svg-wb" d="M125,112V56 M125,56h14l-14,14V56z M125,80l14-14 M125,90l14-14 M125,100l14-14 M125,125l7-12.1h-14L125,125z"/>`, Ql = z`<path class="svg-wb" d="M125,112V46 M125,46h14l-14,14V46z M125,70l14-14 M125,80l14-14 M125,90l14-14 M125,100l7-7 M125,125l7-12.1 h-14L125,125z"/>`, $l = z`<path class="svg-wb" d="M125,112V46 M125,46h14l-14,14V46z M125,70l14-14 M125,80l14-14 M125,90l14-14 M125,100l14-14 M125,125l7-12.1 h-14L125,125z"/>`, eu = z`<path class="svg-wb" d="M125,112V36 M125,36h14l-14,14V36z M125,60l14-14 M125,70l14-14 M125,80l14-14 M125,90l14-14 M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>`, tu = z`<path class="svg-wb" d="M125,112V62 M125,62h14l-14,14V62z M125,76h14l-14,14V76z M125,125l7-12.1h-14L125,125z"/>`, nu = z`<path class="svg-wb" d="M125,112V62 M125,62h14l-14,14V62z M125,76h14l-14,14V76z M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>`, ru = z`<path class="svg-wb" d="M125,112V62 M125,62h14l-14,14V62z M125,76h14l-14,14V76z M125,100l14-14 M125,125l7-12.1h-14L125,125z"/>`, iu = z`<path class="svg-wb" d="M125,112V52 M125,52h14l-14,14V52z M125,66h14l-14,14V66z M125,90l14-14 M125,100l7-7 M125,125l7-12.1h-14 L125,125z"/>`, au = z`<path class="svg-wb" d="M125,112V52 M125,52h14l-14,14V52z M125,66h14l-14,14V66z M125,90l14-14 M125,100l14-14 M125,125l7-12.1h-14 L125,125z"/>`, ou = z`<path class="svg-wb" d="M125,112V42 M125,42h14l-14,14V42z M125,56h14l-14,14V56z M125,80l14-14 M125,90l14-14 M125,100l7-7 M125,125 l7-12.1h-14L125,125z"/>`, su = z`<path class="svg-wb" d="M125,112V42 M125,42h14l-14,14V42z M125,56h14l-14,14V56z M125,80l14-14 M125,90l14-14 M125,100l14-14 M125,125 l7-12.1h-14L125,125z"/>`, cu = z`<path class="svg-wb" d="M125,112V32 M125,32h14l-14,14V32z M125,46h14l-14,14V46z M125,70l14-14 M125,80l14-14 M125,90l14-14 M125,100 l7-7 M125,125l7-12.1h-14L125,125z"/>`, lu = z`<path class="svg-wb" d="M125,112V32 M125,32h14l-14,14V32z M125,46h14l-14,14V46z M125,70l14-14 M125,80l14-14 M125,90l14-14 M125,100 l14-14 M125,125l7-12.1h-14L125,125z"/>`, uu = z`<path class="svg-wb" d="M125,112V22 M125,22h14l-14,14V22z M125,36h14l-14,14V36z M125,60l14-14 M125,70l14-14 M125,80l14-14 M125,90 l14-14 M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>`, du = z`<path class="svg-wb" d="M125,112V48 M125,48h14l-14,14V48z M125,62h14l-14,14V62z M125,76h14l-14,14V76z M125,125l7-12.1h-14L125,125z"/>`, fu = z`<path class="svg-wb" d="M125,112V48 M125,48h14l-14,14V48z M125,62h14l-14,14V62z M125,76h14l-14,14V76z M125,100l7-7 M125,125l7-12.1 h-14L125,125z"/>`, pu = z`<path class="svg-wb" d="M125,112V48 M125,48h14l-14,14V48z M125,62h14l-14,14V62z M125,76h14l-14,14V76z M125,100l14-14 M125,125 l7-12.1h-14L125,125z"/>`, mu = z`<path class="svg-wb" d="M125,112V38 M125,38h14l-14,14V38z M125,52h14l-14,14V52z M125,66h14l-14,14V66z M125,90l14-14 M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>`, hu = z`<path class="svg-wb" d="M125,112V38 M125,38h14l-14,14V38z M125,52h14l-14,14V52z M125,66h14l-14,14V66z M125,90l14-14 M125,100l14-14 M125,125l7-12.1h-14L125,125z"/>`, gu = z`<path class="svg-wb" d="M125,112V28 M125,28h14l-14,14V28z M125,42h14l-14,14V42z M125,56h14l-14,14V56z M125,80l14-14 M125,90l14-14 M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>`, _u = z`<path class="svg-wb" d="M125,112V28 M125,28h14l-14,14V28z M125,42h14l-14,14V42z M125,56h14l-14,14V56z M125,80l14-14 M125,90l14-14 M125,100l14-14 M125,125l7-12.1h-14L125,125z"/>`, vu = z`<path class="svg-wb" d="M125,112V18 M125,18h14l-14,14V18z M125,32h14l-14,14V32z M125,46h14l-14,14V46z M125,70l14-14 M125,80l14-14 M125,90l14-14 M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>`, yu = z`<path class="svg-wb" d="M125,112V18 M125,18h14l-14,14V18z M125,32h14l-14,14V32z M125,46h14l-14,14V46z M125,70l14-14 M125,80l14-14 M125,90l14-14 M125,100l14-14 M125,125l7-12.1h-14L125,125z"/>`;
function bu(e) {
	return e <= 0 || e < 1 ? Pl : e < 2.5 ? Fl : e < 5 ? Il : e < 7.5 ? Ll : e < 10 ? Rl : e < 12.5 ? zl : e < 15 ? Bl : e < 17.5 ? Vl : e < 20 ? Hl : e < 22.5 ? Ul : e < 25 ? Wl : e < 27.5 ? Gl : e < 30 ? Kl : e < 32.5 ? ql : e < 35 ? Jl : e < 37.5 ? Yl : e < 40 ? Xl : e < 42.5 ? Zl : e < 45 ? Ql : e < 47.5 ? $l : e < 50 ? eu : e < 52.5 ? tu : e < 55 ? nu : e < 57.5 ? ru : e < 60 ? iu : e < 62.5 ? au : e < 65 ? ou : e < 67.5 ? su : e < 70 ? cu : e < 72.5 ? lu : e < 75 ? uu : e < 77.5 ? du : e < 80 ? fu : e < 82.5 ? pu : e < 85 ? mu : e < 87.5 ? hu : e < 90 ? gu : e < 92.5 ? _u : e < 95 ? vu : e < 97.5 ? yu : Pl;
}
//#endregion
//#region \0@oxc-project+runtime@0.146.0/helpers/esm/decorate.js
function Q(e, t, n, r) {
	var i = arguments.length, a = i < 3 ? t : r === null ? r = Object.getOwnPropertyDescriptor(t, n) : r, o;
	if (typeof Reflect == "object" && typeof Reflect.decorate == "function") a = Reflect.decorate(e, t, n, r);
	else for (var s = e.length - 1; s >= 0; s--) (o = e[s]) && (a = (i < 3 ? o(a) : i > 3 ? o(t, n, a) : o(t, n)) || a);
	return i > 3 && a && Object.defineProperty(t, n, a), a;
}
var xu = t((() => {}));
mn(), xu();
var Su, Cu = ".tippy-box[data-animation=fade][data-state=hidden]{opacity:0}[data-tippy-root]{max-width:calc(100vw - 10px)}.tippy-box{position:relative;background-color:#333;color:#fff;border-radius:4px;font-size:14px;line-height:1.4;white-space:normal;outline:0;transition-property:transform,visibility,opacity}.tippy-box[data-placement^=top]>.tippy-arrow{bottom:0}.tippy-box[data-placement^=top]>.tippy-arrow:before{bottom:-7px;left:0;border-width:8px 8px 0;border-top-color:initial;transform-origin:center top}.tippy-box[data-placement^=bottom]>.tippy-arrow{top:0}.tippy-box[data-placement^=bottom]>.tippy-arrow:before{top:-7px;left:0;border-width:0 8px 8px;border-bottom-color:initial;transform-origin:center bottom}.tippy-box[data-placement^=left]>.tippy-arrow{right:0}.tippy-box[data-placement^=left]>.tippy-arrow:before{border-width:8px 0 8px 8px;border-left-color:initial;right:-7px;transform-origin:center left}.tippy-box[data-placement^=right]>.tippy-arrow{left:0}.tippy-box[data-placement^=right]>.tippy-arrow:before{left:-7px;border-width:8px 8px 8px 0;border-right-color:initial;transform-origin:center right}.tippy-box[data-inertia][data-state=visible]{transition-timing-function:cubic-bezier(.54,1.5,.38,1.11)}.tippy-arrow{width:16px;height:16px;color:#333}.tippy-arrow:before{content:\"\";position:absolute;border-color:transparent;border-style:solid}.tippy-content{position:relative;padding:5px 9px;z-index:1}", $ = class extends un {
	constructor(...e) {
		super(...e), this.conditions = [], this.temperatures = [], this.wind = [], this.precipitation = [], this.icons = !1, this.icon_map = void 0, this.colors = void 0, this.hide_hours = !1, this.hide_temperatures = !1, this.hide_bar = !1, this.icon_fill = "single", this.show_wind = "false", this.show_precipitation_amounts = !1, this.show_precipitation_probability = !1, this.show_date = "false", this.label_spacing = 2, this.labels = $n, this.tips = [];
	}
	render() {
		let e = [], t = 1;
		if (!this.hide_bar) for (let n of this.conditions) {
			let r = this.labels[n[0]], i = this.icon_map?.[n[0]];
			i || (i = er[n[0]], i = i === n[0] ? "mdi:weather-" + i : "mdi:" + i);
			let a = [];
			if (!this.icons) a.push(R`<span class="condition-label">${r}</span>`);
			else {
				let e;
				e = !this.icon_fill || this.icon_fill === "single" ? n[1] : this.icon_fill === "full" ? 1 : Math.max(Number(this.icon_fill) || 0, 1);
				let t = 1;
				for (let r = 0; r < n[1]; r += e) {
					let n = {
						gridColumnStart: String(t),
						gridColumnEnd: String(t += e * 2)
					};
					a.push(R`<span class="condition-icon" style=${Jo(n)}><ha-icon icon=${i}></ha-icon></span>`);
				}
			}
			let o = {
				gridColumnStart: String(t),
				gridColumnEnd: String(t += n[1] * 2)
			};
			e.push(R`
          <div class=${n[0]} style=${Jo(o)} data-tippy-content=${r}>
            ${a}
          </div>
        `);
		}
		let n = this.show_wind ?? "", r = [], i = null;
		for (let e = 0; e < this.temperatures.length; e += 1) {
			let t = e % this.label_spacing !== 0, a = this.hide_hours || t, o = this.hide_temperatures || t, s = (n === "true" || n.includes("speed")) && !t, c = (n === "true" || n.includes("direction")) && !t, l = n.includes("barb") && !t, u = this.show_precipitation_amounts && !t, d = this.show_precipitation_probability && !t, { hour: f, date: p, temperature: m } = this.temperatures[e], h = null;
			!t && this.show_date && this.show_date !== "false" && (this.show_date === "all" ? h = p : this.show_date === "boundary" && (i === p ? h = R`&nbsp;` : (h = p, i = p)));
			let { windSpeed: g, windSpeedRawMS: _, windDirection: v, windDirectionRaw: y } = this.wind[e], b = [], x = typeof y == "number" ? y : rr[y?.toLowerCase()];
			l && x !== void 0 && (b.push(R`<span title=${`${g} ${v}`}>
          ${this.getWindBarb(_, x)}
        </span>`), (s || c) && b.push(R`<br>`)), s && b.push(R`${g}`), s && c && b.push(R`<br>`), c && b.push(R`${v}`);
			let { precipitationAmount: S, precipitationProbability: C, precipitationProbabilityText: w } = this.precipitation[e], T = [];
			u && T.push(R`${S}`), u && d && T.push(R`<br>`), d && T.push(R`<span title=${w}>${C}</span>`), r.push(R`
        <div class="bar-block">
          <div class="bar-block-left"></div>
          <div class="bar-block-right"></div>
          <div class="bar-block-bottom">
            <div class="date">${h}</div>
            <div class="hour">${a ? null : f}</div>
            <div class="temperature">${o ? null : R`${m}&deg;`}</div>
            <div class="wind">${b}</div>
            <div class="precipitation">${T}</div>
          </div>
        </div>
      `);
		}
		let a = null;
		return this.colors && (a = this.getColorStyles(this.colors)), R`
      <div class="main">
        ${a ?? null}
        ${this.hide_bar ? null : R`<div class="bar">${e}</div>`}
        <div class="axes">${r}</div>
      </div>
    `;
	}
	update(e) {
		super.update(e), this.tips.forEach((e) => e.destroy()), this.tips = Nl(this.renderRoot.querySelectorAll(".bar > div"), {
			appendTo: this.renderRoot.firstElementChild || void 0,
			touch: "hold"
		});
	}
	getColorStyles(e) {
		if (!e || e.size === 0) return null;
		let t = [];
		for (let [n, r] of e.entries()) r.background && t.push(`--color-${n}: ${r.background};`), r.foreground && t.push(`--color-${n}-foreground: ${r.foreground};`);
		return R`<style>
      .main > .bar {
        ${Bt(t.join(" "))}
      }
    </style>`;
	}
	getWindBarb(e, t) {
		let n = { transform: `rotate(${t}deg)` };
		return R`<svg xmlns="http://www.w3.org/2000/svg" viewBox="70 40 120 120" class="barb" style=${Jo(n)}>
      ${bu(e)}
    </svg>`;
	}
};
Su = $, Su.styles = [Bt(Cu), Vt`
    .main {
      --color-clear-night: #111;
      --color-cloudy: #777777;
      --color-fog: var(--color-cloudy);
      --color-hail: #2b5174;
      --color-lightning: var(--color-rainy);
      --color-lightning-rainy: var(--color-rainy);
      --color-partlycloudy: #b3dbff;
      --color-night-partly-cloudy: #333;
      --color-pouring: var(--color-rainy);
      --color-rainy: #44739d;
      --color-snowy: white;
      --color-snowy-rainy: var(--color-partlycloudy);
      --color-sunny: #90cbff;
      --color-windy: var(--color-sunny);
      --color-windy-variant: var(--color-sunny);
      --color-exceptional: #ff9d00;
    }
    .bar {
      height: 30px;
      width: 100%;
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: 1fr;
    }
    .bar > div {
      height: 30px;
      text-align: center;
      align-items: center;
      display: grid;
    }
    .condition-label {
      display: inline-block;
      text-shadow: 1px 1px 2px var(--primary-background-color);
      max-width: max(0px, calc((100% - 120px) * 999));
      overflow: hidden;
    }
    .condition-icon {
      display: inline-block;
      max-width: max(0px, calc((100% - 40px) * 999));
      overflow: hidden;
    }
    .condition-icon > ha-icon {
      filter: drop-shadow(1px 1px 3px var(--primary-background-color));
    }
    .bar > div:first-child {
      border-top-left-radius: 10px;
      border-bottom-left-radius: 10px;
    }
    .bar > div:last-child {
      border-top-right-radius: 10px;
      border-bottom-right-radius: 10px;
    }
    .clear-night {
      background-color: var(--color-clear-night);
      color: var(--color-clear-night-foreground, var(--primary-text-color));
    }
    .cloudy {
      background-color: var(--color-cloudy);
      color: var(--color-cloudy-foreground, var(--primary-text-color));
    }
    .fog {
      background-color: var(--color-fog);
      color: var(--color-fog-foreground, var(--primary-text-color));
    }
    .hail {
      background-color: var(--color-hail);
      color: var(--color-hail-foreground, var(--primary-text-color));
    }
    .lightning {
      background-color: var(--color-lightning);
      color: var(--color-lightning-foreground, var(--primary-text-color));
    }
    .lightning-rainy {
      background-color: var(--color-lightning-rainy);
      color: var(--color-lightning-rainy-foreground, var(--primary-text-color));
    }
    .partlycloudy {
      background-color: var(--color-partlycloudy);
      color: var(--color-partlycloudy-foreground, var(--primary-text-color));
    }
    .night-partly-cloudy {
      background-color: var(--color-night-partly-cloudy);
      color: var(--color-night-partly-cloudy-foreground, var(--primary-text-color));
    }
    .pouring {
      background-color: var(--color-pouring);
      color: var(--color-pouring-foreground, var(--primary-text-color));
    }
    .rainy {
      background-color: var(--color-rainy);
      color: var(--color-rainy-foreground, var(--primary-text-color));
    }
    .snowy {
      background-color: var(--color-snowy);
      color: var(--color-snowy-foreground, var(--primary-text-color));
    }
    .snowy-rainy {
      background-color: var(--color-snowy-rainy);
      color: var(--color-snowy-rainy-foreground, var(--primary-text-color));
    }
    .sunny {
      background-color: var(--color-sunny);
      color: var(--color-sunny-foreground, var(--primary-text-color));
    }
    .windy {
      background-color: var(--color-windy);
      color: var(--color-windy-foreground, var(--primary-text-color));
    }
    .windy-variant {
      background-color: var(--color-windy-variant);
      color: var(--color-windy-variant-foreground, var(--primary-text-color));
    }
    .exceptional {
      background-color: var(--color-exceptional);
      color: var(--color-exceptional-foreground, var(--primary-text-color));
    }
    .axes {
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: 1fr;
      margin-top: 5px;
    }
    .bar-block {
      display: inline-grid;
      grid-template-areas:
        'left right'
        'bottom bottom';
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 5px auto;
    }
    .bar-block-left {
      grid-area: left;
      border: 1px solid var(--divider-color, lightgray);
      border-width: 0 1px 0 0;
    }
    .bar-block-right {
      grid-area: right;
      border: 1px solid var(--divider-color, lightgray);
      border-width: 0 0 0 1px;
    }
    .bar-block-bottom {
      text-align: center;
      grid-area: bottom;
      padding-top: 5px;
    }
    .date, .hour {
      color: var(--secondary-text-color, gray);
      font-size: 0.9rem;
      white-space: nowrap;
    }
    .temperature {
      font-size: 1.1rem;
    }
    .wind,
    .precipitation {
      font-size: 0.9rem;
      line-height: 1.1rem;
      padding-top: 0.1rem;
    }
    .barb {
      transform-box: fill-box;
      transform-origin: center;
      height: 3rem;
    }
    .svg-wb, .svg-wb-fill {
      fill: var(--primary-text-color, black);
    }
    .svg-wb, .svg-wb-stroke {
      stroke: var(--primary-text-color, black);
    }
    .svg-wb {
      stroke-width: 3;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-miterlimit: 10;
    }
  `], Q([H({ type: Array })], $.prototype, "conditions", void 0), Q([H({ type: Array })], $.prototype, "temperatures", void 0), Q([H({ type: Array })], $.prototype, "wind", void 0), Q([H({ type: Array })], $.prototype, "precipitation", void 0), Q([H({ type: Boolean })], $.prototype, "icons", void 0), Q([H({ type: Object })], $.prototype, "icon_map", void 0), Q([H({ attribute: !1 })], $.prototype, "colors", void 0), Q([H({ type: Boolean })], $.prototype, "hide_hours", void 0), Q([H({ type: Boolean })], $.prototype, "hide_temperatures", void 0), Q([H({ type: Boolean })], $.prototype, "hide_bar", void 0), Q([H({ type: String })], $.prototype, "icon_fill", void 0), Q([H({ type: String })], $.prototype, "show_wind", void 0), Q([H({ type: Boolean })], $.prototype, "show_precipitation_amounts", void 0), Q([H({ type: Boolean })], $.prototype, "show_precipitation_probability", void 0), Q([H({ type: String })], $.prototype, "show_date", void 0), Q([H({ type: Number })], $.prototype, "label_spacing", void 0), Q([H({ type: Object })], $.prototype, "labels", void 0);
//#endregion
//#region node_modules/@lit/reactive-element/css-tag.js
var wu, Tu, Eu, Du = t((() => {
	wu = window, Tu = wu.ShadowRoot && (wu.ShadyCSS === void 0 || wu.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Eu = (e, t) => {
		Tu ? e.adoptedStyleSheets = t.map(((e) => e instanceof CSSStyleSheet ? e : e.styleSheet)) : t.forEach(((t) => {
			let n = document.createElement("style"), r = wu.litNonce;
			r !== void 0 && n.setAttribute("nonce", r), n.textContent = t.cssText, e.appendChild(n);
		}));
	};
}));
//#endregion
//#region node_modules/@lit-labs/scoped-registry-mixin/scoped-registry-mixin.js
function Ou(e) {
	return class extends e {
		createRenderRoot() {
			let e = this.constructor, { registry: t, elementDefinitions: n, shadowRootOptions: r } = e;
			n && !t && (e.registry = new CustomElementRegistry(), Object.entries(n).forEach((([t, n]) => e.registry.define(t, n))));
			let i = this.renderOptions.creationScope = this.attachShadow({
				...r,
				customElements: e.registry
			});
			return Eu(i, this.constructor.elementStyles), i;
		}
	};
}
var ku = t((() => {
	Du();
})), Au = /* @__PURE__ */ n({ HourlyWeatherCardEditor: () => Mu }), ju, Mu, Nu = t((() => {
	mn(), D(), ku(), On(), xu(), Mu = (ju = class extends Ou(un) {
		constructor(...e) {
			super(...e), this._initialized = !1;
		}
		async setConfig(e) {
			this._config = e, await this.loadCardHelpers(), this.requestUpdate();
		}
		shouldUpdate() {
			return this._initialized || this._initialize(), !0;
		}
		get _name() {
			return this._config?.name || "";
		}
		get _entity() {
			return this._config?.entity || "";
		}
		get _numSegments() {
			return this._config?.num_segments ?? this._config?.num_hours ?? "12";
		}
		get _icons() {
			return this._config?.icons ?? !1;
		}
		get _show_wind() {
			let e = this._config?.show_wind;
			return typeof e == "boolean" ? e ? "true" : "false" : e ?? "false";
		}
		get _show_precipitation_amounts() {
			return this._config?.show_precipitation_amounts ?? !1;
		}
		get _show_precipitation_probability() {
			return this._config?.show_precipitation_probability ?? !1;
		}
		get _offset() {
			return this._config?.offset ?? "0";
		}
		get _labelSpacing() {
			return this._config?.label_spacing ?? "2";
		}
		get _show_date() {
			return this._config?.show_date ?? "false";
		}
		getSchema(e) {
			return [
				{
					name: "entity",
					selector: { entity: { domain: "weather" } }
				},
				{
					name: "name",
					selector: { text: {} }
				},
				{
					name: "num_segments",
					selector: { number: {
						min: 1,
						step: 1,
						mode: "box"
					} }
				},
				{
					name: "offset",
					selector: { number: {
						min: 0,
						step: 1,
						mode: "box"
					} }
				},
				{
					name: "label_spacing",
					selector: { number: {
						min: 1,
						step: 1,
						mode: "box"
					} }
				},
				{
					name: "icons",
					selector: { boolean: {} }
				},
				{
					name: "show_wind",
					selector: { select: {
						mode: "dropdown",
						options: [
							{
								value: "false",
								label: e("editor.none")
							},
							{
								value: "true",
								label: e("editor.speed_and_direction")
							},
							{
								value: "speed",
								label: e("editor.speed_only")
							},
							{
								value: "direction",
								label: e("editor.direction_only")
							},
							{
								value: "barb",
								label: e("editor.barb")
							},
							{
								value: "barb-and-speed",
								label: e("editor.barb_and_speed")
							},
							{
								value: "barb-and-direction",
								label: e("editor.barb_and_direction")
							},
							{
								value: "barb-speed-and-direction",
								label: e("editor.barb_speed_and_direction")
							}
						]
					} }
				},
				{
					name: "show_date",
					selector: { select: {
						mode: "dropdown",
						options: [
							{
								value: "false",
								label: e("editor.none")
							},
							{
								value: "all",
								label: e("editor.all")
							},
							{
								value: "boundary",
								label: e("editor.on_day_boundaries")
							}
						]
					} }
				},
				{
					name: "show_precipitation_amounts",
					selector: { boolean: {} }
				},
				{
					name: "show_precipitation_probability",
					selector: { boolean: {} }
				}
			];
		}
		render() {
			if (!this.hass || !this._helpers) return R``;
			let e = Co(this._config?.language, this.hass?.locale?.language), t = this.getSchema(e);
			return R`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${t}
        .computeLabel=${(t) => ({
				entity: e("editor.entity"),
				name: e("editor.name"),
				num_segments: e("editor.segments_to_show"),
				offset: e("editor.offset"),
				label_spacing: e("editor.label_spacing"),
				icons: e("editor.icons"),
				show_wind: e("editor.show_wind"),
				show_date: e("editor.show_date"),
				show_precipitation_amounts: e("editor.show_precipitation_amounts"),
				show_precipitation_probability: e("editor.show_precipitation_probability")
			})[t.name] || t.name}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
		}
		_initialize() {
			this.hass !== void 0 && this._config !== void 0 && this._helpers !== void 0 && (this._initialized = !0);
		}
		async loadCardHelpers() {
			this._helpers && customElements.get("ha-form") || (this._helpers = await window.loadCardHelpers(), this._helpers.createCardElement({
				type: "entities",
				entities: []
			}), await customElements.whenDefined("ha-form"));
		}
		_valueChanged(e) {
			if (!this._config || !this.hass) return;
			let t = { ...e.detail.value };
			Object.keys(t).forEach((e) => {
				(t[e] === "" || t[e] === void 0) && delete t[e];
			}), "num_hours" in t && "num_segments" in t && delete t.num_hours, this._config = t, y(this, "config-changed", { config: this._config });
		}
	}, ju.styles = Vt`
    mwc-select,
    mwc-textfield {
      margin-bottom: 16px;
      display: block;
    }
    mwc-formfield {
      padding-bottom: 8px;
    }
    mwc-switch {
      --mdc-theme-secondary: var(--switch-checked-color);
    }
  `, ju), Q([H({ attribute: !1 })], Mu.prototype, "hass", void 0), Q([bn()], Mu.prototype, "_config", void 0), Q([bn()], Mu.prototype, "_helpers", void 0), Mu = Q([hn("hourly-weather-editor")], Mu);
}));
D(), mn(), On(), To(), xu();
var Pu;
customElements.define("weather-bar", $);
var Fu = Co(void 0, void 0);
console.info(`%c  HOURLY-WEATHER-CARD \n%c  ${Fu("common.version")} ${qn}    `, "color: orange; font-weight: bold; background: black", "color: white; font-weight: bold; background: dimgray"), window.customCards = window.customCards || [], window.customCards.push({
	type: "hourly-weather",
	name: Fu("common.title_card"),
	description: Fu("common.description")
});
var Iu = Pu = class extends un {
	constructor(...e) {
		super(...e), this.configRenderPending = !1, this.localizer = void 0, this.localizerLastSettings = {
			configuredLanguage: void 0,
			haServerLanguage: void 0
		}, this._labels = $n, this.labelsLocalized = !1, this._directions = Object.keys(nr), this.directionsLocalized = !1;
	}
	static async getConfigElement() {
		return await Promise.resolve().then(() => (Nu(), Au)), document.createElement("hourly-weather-editor");
	}
	static getStubConfig() {
		return {};
	}
	localize(e, t = "", n = "") {
		return (!this.localizer || this.localizerSettingsChanged) && (this.localizer = Co(this.config?.language, this.hass?.locale?.language), this.localizerLastSettings.configuredLanguage = this.config?.language, this.localizerLastSettings.haServerLanguage = this.hass?.locale?.language, this.labelsLocalized = !1, this.directionsLocalized = !1), this.localizer(e, t, n);
	}
	get localizerSettingsChanged() {
		return this.localizerLastSettings.configuredLanguage !== this.config?.language || this.localizerLastSettings.haServerLanguage !== this.hass?.locale?.language;
	}
	get labels() {
		return (!this.labelsLocalized || this.localizerSettingsChanged) && (this._labels = Object.fromEntries(Object.entries($n).map(([e, t]) => [e, this.localize(t)])), this.labelsLocalized = !0), this._labels;
	}
	get directions() {
		return (!this.directionsLocalized || this.localizerSettingsChanged) && (this._directions = Object.values(nr).map((e) => this.localize(e)), this._directions.push(this._directions[0]), this.directionsLocalized = !0), this._directions;
	}
	unsubscribeForecastEvents() {
		this.subscribedToForecast && (this.subscribedToForecast.then((e) => e()), this.subscribedToForecast = void 0);
	}
	async subscribeToForecastEvents() {
		if (this.unsubscribeForecastEvents(), !this.isConnected || !this.hass || !this.config || !this.config.entity || !this.hassSupportsForecastEvents() || !this.config.entity.startsWith("weather.")) return;
		let e = this.getIdealForecastType();
		this.subscribedToForecast = this.hass.connection.subscribeMessage((e) => this.forecastEvent = e, {
			type: "weather/subscribe_forecast",
			forecast_type: e,
			entity_id: this.config.entity
		});
	}
	getIdealForecastType() {
		if (this.config?.forecast_type) return this.config.forecast_type;
		if (!this.config?.entity) return "hourly";
		let e = this.hass.states[this.config.entity];
		if (!e) return "hourly";
		let t = e.attributes.supported_features;
		return !t || t & 2 ? "hourly" : t & 4 ? "twice_daily" : "daily";
	}
	setConfig(e) {
		if (!e) throw Error(this.localize("common.invalid_configuration"));
		if (!e.entity) throw Error(this.localize("errors.missing_entity"));
		if (e.label_spacing) {
			let t = parseInt(e.label_spacing, 10);
			if (!Number.isNaN(t) && t < 1) throw Error(this.localize("errors.must_be_positive_int"));
		}
		e.test_gui && E().setEditMode(!0), this.config = {
			name: this.localize("common.title"),
			...e
		}, this.triggerConfigRender();
	}
	triggerConfigRender() {
		if (!this.hass?.connection) {
			this.configRenderPending = !0;
			return;
		}
		this.renderedConfig = this.renderConfig();
	}
	async renderConfig() {
		let { config: e } = this;
		return e && {
			...e,
			num_segments: await this.renderTemplate(e?.num_segments),
			offset: await this.renderTemplate(e?.offset),
			label_spacing: await this.renderTemplate(e?.label_spacing),
			name: await this.renderTemplate(e?.name)
		};
	}
	async renderTemplate(e) {
		return !e || typeof e != "string" || !e.includes("{{") ? e : new Promise((t) => {
			this.hass.connection.subscribeMessage((e) => t(e.result), {
				type: "render_template",
				template: e
			});
		});
	}
	connectedCallback() {
		super.connectedCallback(), this.hasUpdated && this.subscribeToForecastEvents();
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this.unsubscribeForecastEvents();
	}
	shouldUpdate(e) {
		if (!this.config) return !1;
		if (e.has("hass")) {
			let t = e.get("hass");
			if (t && this.hass && JSON.stringify(t.locale) !== JSON.stringify(this.hass.locale)) return !0;
		}
		return o(this, e, !1);
	}
	updated(e) {
		super.updated(e), this.hass?.connection && this.configRenderPending && (this.configRenderPending = !1, this.triggerConfigRender()), (!this.subscribedToForecast || e.has("config") && this.config?.entity !== e.get("config")?.entity) && this.subscribeToForecastEvents();
	}
	getForecast() {
		let e = !this.forecastEvent?.forecast && this.hassSupportsForecastEvents();
		return {
			forecast: this.forecastEvent?.forecast ?? this.hass?.states[this.config.entity]?.attributes.forecast,
			pending: e
		};
	}
	hassSupportsForecastEvents() {
		return !!this.hass?.services?.weather?.get_forecasts || !!this.hass?.services?.weather?.get_forecast;
	}
	render() {
		return R`${Kn(this.renderCore(), R``)}`;
	}
	async renderCore() {
		let e = await this.renderedConfig;
		if (!e) return;
		let t = e.entity, n = this.hass.states[t], { forecast: r, pending: i } = this.getForecast(), o = n.attributes.wind_speed_unit ?? "", s = n.attributes.precipitation_unit ?? "", c = parseInt(e.num_segments ?? e.num_hours ?? "12", 10), l = parseInt(e.offset ?? "0", 10), u = parseInt(e.label_spacing ?? "2", 10), d = !r || !r.length, f = e.icon_fill, p = !!e.hide_minutes, m = !!e.round_temperatures;
		if (c < 1) return await this._showError(this.localize("errors.offset_must_be_positive_int", "offset", "num_segments"));
		if (l < 0) return await this._showError(this.localize("errors.offset_must_be_positive_int"));
		if (!d && c > r.length - l) return i ? void 0 : await this._showError(this.localize("errors.too_many_segments_requested"));
		if (u < 1) return await this._showError(this.localize("errors.offset_must_be_positive_int", "offset", "label_spacing"));
		if (f) {
			let t = e.icon_fill === "full", n = e.icon_fill === "single", r = Number(e.icon_fill);
			if (!t && !n && !(Number.isInteger(r) && r > 0)) return await this._showError(this.localize("errors.invalid_value_icon_fill"));
		}
		let h = e.show_wind;
		if (typeof h == "boolean" && (h = h ? "true" : "false"), d) return i ? void 0 : R`
        <ha-card
          .header=${e.name}
          @action=${this._handleAction}
          .actionHandler=${Qn({
			hasHold: a(e.hold_action),
			hasDoubleClick: a(e.double_tap_action)
		})}
          tabindex="0"
          .label=${`Hourly Weather: ${e.entity || "No Entity Defined"}`}
        >
          <div class="card-content">
            <h3>${this.localize("errors.forecast_not_available")}</h3>
            <p>${this.localize("errors.check_entity")}</p>
          </div>
        </ha-card>`;
		let g = this.getConditionListFromForecast(r, c, l), _ = this.getTemperatures(r, c, l, p, m), v = this.getWind(r, c, l, o, p), y = this.getPrecipitation(r, c, l, s, p, u), b = this.getColorSettings(e.colors);
		return R`
      <ha-card
        .header=${e.name}
        @action=${this._handleAction}
        .actionHandler=${Qn({
			hasHold: a(e.hold_action),
			hasDoubleClick: a(e.double_tap_action)
		})}
        tabindex="0"
        .label=${`Hourly Weather: ${e.entity || "No Entity Defined"}`}
      >
        <div class="card-content">
          ${b.warnings.length ? this._showWarning(this.localize("errors.invalid_colors") + " " + b.warnings.join(", ")) : ""}
          <!-- @ts-ignore -->
          <weather-bar
            .conditions=${g}
            .temperatures=${_}
            .wind=${v}
            .precipitation=${y}
            .icons=${!!e.icons}
            .icon_map=${e.icon_map}
            .colors=${b.validColors}
            .hide_hours=${!!e.hide_hours}
            .hide_temperatures=${!!e.hide_temperatures}
            .hide_bar=${!!e.hide_bar}
            .icon_fill=${e.icon_fill}
            .show_wind=${h}
            .show_precipitation_amounts=${!!e.show_precipitation_amounts}
            .show_precipitation_probability=${!!e.show_precipitation_probability}
            .show_date=${e.show_date}
            .label_spacing=${u}
            .labels=${this.labels}></weather-bar>
        </div>
      </ha-card>
    `;
	}
	getConditionListFromForecast(e, t, n) {
		let r = this.getDisplayCondition(e[n]), i = 0, a = [[r, 1]];
		for (let o = n + 1; o < t + n; o++) {
			let t = this.getDisplayCondition(e[o]);
			t === r ? a[i][1]++ : (a.push([t, 1]), i++, r = t);
		}
		return a;
	}
	getDisplayCondition(e) {
		let t = tr[e.condition];
		if (!t) return e.condition;
		let { latitude: n, longitude: r } = this.hass?.config ?? {};
		if (typeof n != "number" || typeof r != "number") return e.condition;
		let i = new Date(e.datetime);
		if (Number.isNaN(i.getTime())) return e.condition;
		let [a, o] = t;
		return Go(i, n, r) ? a : o;
	}
	getTemperatures(e, t, n, r, i) {
		let a = [];
		for (let o = n; o < t + n; o++) {
			let t = e[o], n = new Date(t.datetime), s = i && !Number.isNaN(t.temperature) ? Math.round(t.temperature) : t.temperature;
			a.push({
				date: l(n, this.hass.locale),
				hour: this.formatHour(n, this.hass.locale, r),
				temperature: g(s, this.hass.locale)
			});
		}
		return a;
	}
	getPrecipitation(e, t, n, r, i, a) {
		let o = [];
		for (let s = 0; s < t; s++) {
			let c = e[n + s];
			if (s % a === 0) {
				let l = e.slice(n + s, Math.min(n + s + a, n + t)), u = l.reduce((e, t) => e + (Number(t.precipitation) || 0), 0), d = 100 * (1 - l.reduce((e, t) => e * (1 - (Number(t.precipitation_probability) || 0) / 100), 1)), f = Math.round(d);
				o.push({
					hour: this.formatHour(new Date(c.datetime), this.hass.locale, i),
					precipitationAmount: u > 0 ? `${g(u, this.hass.locale)} ${r}`.trim() : "",
					precipitationProbability: f > 0 ? `${g(f, this.hass.locale)}%` : "",
					precipitationProbabilityText: f > 0 ? this.localize("card.chance_of_precipitation", "{0}", String(f)) : ""
				});
			} else o.push({
				hour: this.formatHour(new Date(c.datetime), this.hass.locale, i),
				precipitationAmount: "",
				precipitationProbability: "",
				precipitationProbabilityText: ""
			});
		}
		return o;
	}
	getWind(e, t, n, r, i) {
		let a = [];
		for (let o = n; o < t + n; o++) {
			let t = e[o], n = "-", s = "";
			t.wind_speed > 0 && (n = `${Math.round(t.wind_speed)} ${r}`.trim(), s = this.formatWindDir(t.wind_bearing)), a.push({
				hour: this.formatHour(new Date(t.datetime), this.hass.locale, i),
				windSpeed: n,
				windSpeedRawMS: this.getWindSpeedMS(t.wind_speed, r),
				windDirection: s,
				windDirectionRaw: t.wind_bearing
			});
		}
		return a;
	}
	formatWindDir(e) {
		if (typeof e == "string") {
			let t = e.toLowerCase();
			return t in nr ? this.localize(nr[t]) : e;
		}
		return this.directions[Math.floor((e + 11.25) / 22.5)];
	}
	getWindSpeedMS(e, t) {
		switch (t) {
			case "m/s": return e;
			case "mph": return e * .44704;
			case "km/h": return e * .27777777777778;
			case "ft/s": return e * .3048;
			case "kt":
			case "kn": return e * .51444444444444;
		}
		return -1;
	}
	formatHour(e, t, n) {
		let r = f(e, t);
		return n || r.includes("AM") || r.includes("PM") ? r.replace(":00", "") : r;
	}
	getColorSettings(e) {
		if (!e) return {
			validColors: void 0,
			warnings: []
		};
		let t = /* @__PURE__ */ new Map(), n = [];
		return Object.entries(e).forEach(([e, r]) => {
			this.isValidColorDefinition(e, r) ? t.set(e, Pu.toColorObject(r)) : n.push(`${e}: ${JSON.stringify(r, null, 2)}`);
		}), {
			validColors: t,
			warnings: n
		};
	}
	isValidColorDefinition(e, t) {
		if (!(e in er)) return !1;
		if (typeof t == "string") {
			if (!Pu.isValidColor(t)) return !1;
		} else if (!t.background && !t.foreground || t.background && !Pu.isValidColor(t.background) || t.foreground && !Pu.isValidColor(t.foreground)) return !1;
		return !0;
	}
	static isValidColor(e) {
		return !!(Te(e) || Pu.isValidColorVar(e));
	}
	static isValidCustomPropertyName(e) {
		if (typeof e != "string" || !e.startsWith("--")) return !1;
		let t = e.slice(2);
		return t.length === 0 || /^-[0-9]/.test(t) || /^[0-9]/.test(t) ? !1 : /^[A-Za-z0-9_-]+$/.test(t);
	}
	static isValidColorVar(e) {
		if (typeof e != "string") return !1;
		let t = e.trim();
		if (!t.startsWith("var(") || !t.endsWith(")")) return !1;
		let [n, r] = t.slice(4, -1).trim().split(","), i = n.trim();
		if (!Pu.isValidCustomPropertyName(i)) return !1;
		let a = r?.trim();
		return !(a && !Pu.isValidColor(a));
	}
	static toColorObject(e) {
		return typeof e == "string" ? { background: e } : e;
	}
	_handleAction(e) {
		this.hass && this.config && e.detail.action && T(this, this.hass, this.config, e.detail.action);
	}
	_showWarning(e) {
		return R` <hui-warning>${e}</hui-warning> `;
	}
	async _showError(e) {
		await new Promise((e) => setTimeout(e, 0));
		let t = document.createElement("hui-error-card");
		return t.setConfig({
			type: "error",
			error: e,
			origConfig: this.config
		}), R` ${t} `;
	}
	static get styles() {
		return Vt``;
	}
};
Q([H({ attribute: !1 })], Iu.prototype, "hass", void 0), Q([bn()], Iu.prototype, "config", void 0), Q([bn()], Iu.prototype, "renderedConfig", void 0), Q([bn()], Iu.prototype, "forecastEvent", void 0), Q([bn()], Iu.prototype, "subscribedToForecast", void 0), Iu = Pu = Q([hn("hourly-weather")], Iu);
//#endregion
export { Iu as HourlyWeatherCard };
