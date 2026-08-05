//#region \0rolldown/runtime.js
var e = Object.defineProperty, t = (e, t, n) => () => {
	if (n) throw n[0];
	try {
		return e && (t = e(e = 0)), t;
	} catch (e) {
		throw n = [e], e;
	}
}, n = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), r = (t, n) => {
	let r = {};
	for (var i in t) e(r, i, {
		get: t[i],
		enumerable: !0
	});
	return n || e(r, Symbol.toStringTag, { value: "Module" }), r;
};
//#endregion
//#region node_modules/custom-card-helpers/dist/index.m.js
function i() {
	return (i = Object.assign || function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}).apply(this, arguments);
}
function a(e) {
	return e.substr(0, e.indexOf("."));
}
function o(e) {
	return e !== void 0 && e.action !== "none";
}
function s(e, t, n) {
	if (t.has("config") || n) return !0;
	if (e.config.entity) {
		var r = t.get("hass");
		return !r || r.states[e.config.entity] !== e.hass.states[e.config.entity];
	}
	return !1;
}
var c, l, u, d, f, p, m, h, g, _, v, y, b, x, S, C, w, T, E, D, O = t((() => {
	u = function(e, t) {
		return d(t).format(e);
	}, d = function(e) {
		return new Intl.DateTimeFormat(e.language, {
			day: "numeric",
			month: "short"
		});
	}, (function(e) {
		e.language = "language", e.system = "system", e.comma_decimal = "comma_decimal", e.decimal_comma = "decimal_comma", e.space_comma = "space_comma", e.none = "none";
	})(c || (c = {})), function(e) {
		e.language = "language", e.system = "system", e.am_pm = "12", e.twenty_four = "24";
	}(l || (l = {})), f = function(e) {
		if (e.time_format === l.language || e.time_format === l.system) {
			var t = e.time_format === l.language ? e.language : void 0, n = (/* @__PURE__ */ new Date()).toLocaleString(t);
			return n.includes("AM") || n.includes("PM");
		}
		return e.time_format === l.am_pm;
	}, p = function(e, t) {
		return m(t).format(e);
	}, m = function(e) {
		return new Intl.DateTimeFormat(e.language, {
			hour: "numeric",
			minute: "2-digit",
			hour12: f(e)
		});
	}, h = function(e) {
		switch (e.number_format) {
			case c.comma_decimal: return ["en-US", "en"];
			case c.decimal_comma: return [
				"de",
				"es",
				"it"
			];
			case c.space_comma: return [
				"fr",
				"sv",
				"cs"
			];
			case c.system: return;
			default: return e.language;
		}
	}, g = function(e, t) {
		return t === void 0 && (t = 2), Math.round(e * 10 ** t) / 10 ** t;
	}, _ = function(e, t, n) {
		var r = t ? h(t) : void 0;
		if (Number.isNaN = Number.isNaN || function e(t) {
			return typeof t == "number" && e(t);
		}, t?.number_format !== c.none && !Number.isNaN(Number(e)) && Intl) try {
			return new Intl.NumberFormat(r, v(e, n)).format(Number(e));
		} catch (t) {
			return console.error(t), new Intl.NumberFormat(void 0, v(e, n)).format(Number(e));
		}
		return typeof e == "string" ? e : g(e, n?.maximumFractionDigits).toString() + (n?.style === "currency" ? " " + n.currency : "");
	}, v = function(e, t) {
		var n = i({ maximumFractionDigits: 2 }, t);
		if (typeof e != "string") return n;
		if (!t || !t.minimumFractionDigits && !t.maximumFractionDigits) {
			var r = e.indexOf(".") > -1 ? e.split(".")[1].length : 0;
			n.minimumFractionDigits = r, n.maximumFractionDigits = r;
		}
		return n;
	}, y = [
		"closed",
		"locked",
		"off"
	], b = function(e, t, n, r) {
		r = r || {}, n = n ?? {};
		var i = new Event(t, {
			bubbles: r.bubbles === void 0 || r.bubbles,
			cancelable: !!r.cancelable,
			composed: r.composed === void 0 || r.composed
		});
		return i.detail = n, e.dispatchEvent(i), i;
	}, x = function(e) {
		b(window, "haptic", e);
	}, S = function(e, t, n) {
		n === void 0 && (n = !1), n ? history.replaceState(null, "", t) : history.pushState(null, "", t), b(window, "location-changed", { replace: n });
	}, C = function(e, t, n) {
		n === void 0 && (n = !0);
		var r, i = a(t), o = i === "group" ? "homeassistant" : i;
		switch (i) {
			case "lock":
				r = n ? "unlock" : "lock";
				break;
			case "cover":
				r = n ? "open_cover" : "close_cover";
				break;
			default: r = n ? "turn_on" : "turn_off";
		}
		return e.callService(o, r, { entity_id: t });
	}, w = function(e, t) {
		return C(e, t, y.includes(e.states[t].state));
	}, T = function(e, t, n, r) {
		if (r || (r = { action: "more-info" }), !r.confirmation || r.confirmation.exemptions && r.confirmation.exemptions.some(function(e) {
			return e.user === t.user.id;
		}) || (x("warning"), confirm(r.confirmation.text || "Are you sure you want to " + r.action + "?"))) switch (r.action) {
			case "more-info":
				(n.entity || n.camera_image) && b(e, "hass-more-info", { entityId: n.entity ? n.entity : n.camera_image });
				break;
			case "navigate":
				r.navigation_path && S(0, r.navigation_path);
				break;
			case "url":
				r.url_path && window.open(r.url_path);
				break;
			case "toggle":
				n.entity && (w(t, n.entity), x("success"));
				break;
			case "call-service":
				if (!r.service) return void x("failure");
				var i = r.service.split(".", 2);
				t.callService(i[0], i[1], r.service_data, r.target), x("success");
				break;
			case "fire-dom-event": b(e, "ll-custom", r);
		}
	}, E = function(e, t, n, r) {
		var i;
		r === "double_tap" && n.double_tap_action ? i = n.double_tap_action : r === "hold" && n.hold_action ? i = n.hold_action : r === "tap" && n.tap_action && (i = n.tap_action), T(e, t, n, i);
	}, D = function() {
		var e = document.querySelector("home-assistant");
		if (e = (e = (e = (e = (e = (e = (e = (e = e && e.shadowRoot) && e.querySelector("home-assistant-main")) && e.shadowRoot) && e.querySelector("app-drawer-layout partial-panel-resolver")) && e.shadowRoot || e) && e.querySelector("ha-panel-lovelace")) && e.shadowRoot) && e.querySelector("hui-root")) {
			var t = e.lovelace;
			return t.current_view = e.___curView, t;
		}
		return null;
	};
})), k = /* @__PURE__ */ n(((e) => {
	var t = e && e.__read || function(e, t) {
		var n = typeof Symbol == "function" && e[Symbol.iterator];
		if (!n) return e;
		var r = n.call(e), i, a = [], o;
		try {
			for (; (t === void 0 || t-- > 0) && !(i = r.next()).done;) a.push(i.value);
		} catch (e) {
			o = { error: e };
		} finally {
			try {
				i && !i.done && (n = r.return) && n.call(r);
			} finally {
				if (o) throw o.error;
			}
		}
		return a;
	};
	Object.defineProperty(e, "__esModule", { value: !0 }), e.parseRGB = void 0, e.parseRGB = function(e) {
		var n = t(e.replace(/((rgba)|(rgb))|\(|\)|\s/g, "").split(","), 4);
		return {
			red: n[0],
			green: n[1],
			blue: n[2],
			alpha: n[3] ?? ""
		};
	};
})), A = /* @__PURE__ */ n(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.validateFunctionalRGB = void 0;
	var t = k();
	e.validateFunctionalRGB = function(e) {
		var n = e.replace(/((rgba)|(rgb))|\(|\)|\s/g, "").split(",").length, r = e.startsWith("rgba("), i = n === 3 || n === 4;
		if (!e.startsWith(r ? "rgba(" : "rgb(") || !e.endsWith(")") || !i) return !1;
		var a = t.parseRGB(e), o = parseFloat(a.red), s = parseFloat(a.green), c = parseFloat(a.blue), l = [
			a.red,
			a.green,
			a.blue
		], u = l.every(function(e) {
			return e.endsWith("%");
		}), d = l.every(function(e) {
			return e.match(/[0-9]|\./g)?.length === e.length;
		});
		if (!d && !u) return !1;
		if (u) {
			var f = !isNaN(o) && o >= 0 && o <= 100, p = !isNaN(s) && s >= 0 && s <= 100, m = !isNaN(c) && c >= 0 && c <= 100;
			if (!f || !p || !m) return !1;
		} else if (d) {
			var f = !isNaN(o) && o >= 0 && o <= 255, p = !isNaN(s) && s >= 0 && s <= 255, m = !isNaN(c) && c >= 0 && c <= 255;
			if (!f || !p || !m) return !1;
		} else return !1;
		if (r && a.alpha) {
			var h = parseFloat(a.alpha);
			if (isNaN(h) || a.alpha?.endsWith("%") && (h < 0 || h > 100) || !a.alpha?.endsWith("%") && (h > 1 || h < 0)) return !1;
		}
		return !0;
	};
})), j = /* @__PURE__ */ n(((e) => {
	var t = e && e.__read || function(e, t) {
		var n = typeof Symbol == "function" && e[Symbol.iterator];
		if (!n) return e;
		var r = n.call(e), i, a = [], o;
		try {
			for (; (t === void 0 || t-- > 0) && !(i = r.next()).done;) a.push(i.value);
		} catch (e) {
			o = { error: e };
		} finally {
			try {
				i && !i.done && (n = r.return) && n.call(r);
			} finally {
				if (o) throw o.error;
			}
		}
		return a;
	}, n = e && e.__spread || function() {
		for (var e = [], n = 0; n < arguments.length; n++) e = e.concat(t(arguments[n]));
		return e;
	};
	Object.defineProperty(e, "__esModule", { value: !0 }), e.validateHexRGB = void 0, e.validateHexRGB = function(e) {
		return !(!e.startsWith("#") || (e = e.toUpperCase().slice(1), e.length !== 6 && e.length !== 3) || !n(e).every(function(e) {
			return e.search(/[0-9A-F]/g) !== -1;
		}));
	};
})), M = /* @__PURE__ */ n(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.isValidRGB = void 0;
	var t = A(), n = j();
	e.isValidRGB = function(e) {
		if (typeof e != "string") throw Error("'rgbString' must be a string");
		return e.startsWith("#") ? n.validateHexRGB(e) : t.validateFunctionalRGB(e);
	};
})), N = /* @__PURE__ */ n(((e) => {
	var t = e && e.__read || function(e, t) {
		var n = typeof Symbol == "function" && e[Symbol.iterator];
		if (!n) return e;
		var r = n.call(e), i, a = [], o;
		try {
			for (; (t === void 0 || t-- > 0) && !(i = r.next()).done;) a.push(i.value);
		} catch (e) {
			o = { error: e };
		} finally {
			try {
				i && !i.done && (n = r.return) && n.call(r);
			} finally {
				if (o) throw o.error;
			}
		}
		return a;
	};
	Object.defineProperty(e, "__esModule", { value: !0 }), e.parseHSL = void 0, e.parseHSL = function(e) {
		var n = t(e.replace(/((hsla)|(hsl))|\(|\)|\s/g, "").split(","), 4);
		return {
			hue: n[0],
			saturation: n[1],
			lightness: n[2],
			alpha: n[3] ?? ""
		};
	};
})), ee = /* @__PURE__ */ n(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.isValidHSL = void 0;
	var t = N();
	e.isValidHSL = function(e) {
		if (typeof e != "string") throw Error("'hslString' must be a string");
		var n = e.replace(/((hsla)|(hsl))|\(|\)|\s/g, "").split(",").length, r = e.startsWith("hsla("), i = n === 3 || n === 4;
		if (!e.startsWith(r ? "hsla(" : "hsl(") || !e.endsWith(")") || !i) return !1;
		var a = t.parseHSL(e), o = a.hue, s = a.saturation, c = a.lightness, l = a.alpha, u = parseFloat(o);
		if (u > 360 || u < 0) return !1;
		var d = parseFloat(s);
		if (d > 100 || d < 0) return !1;
		var f = parseFloat(c);
		if (f > 100 || f < 0 || isNaN(parseFloat(o.replace(/(deg|rad|grad|turn)$/, ""))) || !s.endsWith("%") && d !== 0 || isNaN(parseFloat(s.replace(/%$/, ""))) || !c.endsWith("%") && f !== 0 || isNaN(parseFloat(c.replace(/%$/, "")))) return !1;
		if (r && l) {
			var p = l, m = parseFloat(l);
			if (p.endsWith("%")) {
				if (m > 100 || m < 0) return !1;
			} else if (m > 1 || m < 0) return !1;
		}
		return !0;
	};
})), P = /* @__PURE__ */ n(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.validCSSColorNames = void 0, e.validCSSColorNames = /* @__PURE__ */ "black.silver.gray.white.maroon.red.purple.green.lime.olive.yellow.navy.blue.teal.aqua.orange.aliceblue.antiquewhite.aquamarine.azure.beige.bisque.blanchedalmond.blueviolet.brown.burlywood.cadetblue.chartreuse.chocolate.coral.cornflowerblue.cornsilk.crimson.cyan.darkblue.darkcyan.darkgoldenrod.darkgray.darkgreen.darkgrey.darkkhaki.darkmagenta.darkolivegreen.darkorange.darkorchid.darkred.darksalmon.darkseagreen.darkslateblue.darkslategray.darkslategrey.darkturquoise.darkviolet.deeppink.deepskyblue.dimgray.dimgrey.dodgerblue.firebrick.floralwhite.forestgreen.gainsboro.ghostwhite.gold.goldenrod.greenyellow.grey.honeydew.hotpink.indianred.indigo.ivory.khaki.lavender.lavenderblush.lawngreen.lemonchiffon.lightblue.lightcoral.lightcyan.lightgoldenrodyellow.lightgray.lightgreen.lightgrey.lightpink.lightsalmon.lightseagreen.lightskyblue.lightslategray.lightslategrey.lightsteelblue.lightyellow.limegreen.linen.magenta.fuchsia.mediumaquamarine.mediumblue.mediumorchid.mediumpurple.mediumseagreen.mediumslateblue.mediumspringgreen.mediumturquoise.mediumvioletred.midnightblue.mintcream.mistyrose.moccasin.navajowhite.oldlace.olivedrab.orangered.orchid.palegoldenrod.palegreen.paleturquoise.palevioletred.papayawhip.peachpuff.peru.pink.plum.powderblue.rosybrown.royalblue.saddlebrown.salmon.sandybrown.seagreen.seashell.sienna.skyblue.slateblue.slategray.slategrey.snow.springgreen.steelblue.tan.thistle.tomato.turquoise.violet.wheat.whitesmoke.yellowgreen.rebeccapurple".split(".");
})), te = /* @__PURE__ */ n(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.isValidColorName = void 0;
	var t = P();
	e.isValidColorName = function(e) {
		if (typeof e != "string") throw Error("'colorName' must be a string");
		return e ? t.validCSSColorNames.includes(e.toLowerCase()) : !1;
	};
})), F = /* @__PURE__ */ n(((e) => {
	var t = e && e.__createBinding || (Object.create ? (function(e, t, n, r) {
		r === void 0 && (r = n), Object.defineProperty(e, r, {
			enumerable: !0,
			get: function() {
				return t[n];
			}
		});
	}) : (function(e, t, n, r) {
		r === void 0 && (r = n), e[r] = t[n];
	})), n = e && e.__exportStar || function(e, n) {
		for (var r in e) r !== "default" && !Object.prototype.hasOwnProperty.call(n, r) && t(n, e, r);
	};
	Object.defineProperty(e, "__esModule", { value: !0 }), n(M(), e), n(ee(), e), n(te(), e);
})), I, ne, re, ie, ae, oe, se, L, ce = t((() => {
	I = globalThis, ne = I.ShadowRoot && (I.ShadyCSS === void 0 || I.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, re = Symbol(), ie = /* @__PURE__ */ new WeakMap(), ae = class {
		constructor(e, t, n) {
			if (this._$cssResult$ = !0, n !== re) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
			this.cssText = e, this.t = t;
		}
		get styleSheet() {
			let e = this.o, t = this.t;
			if (ne && e === void 0) {
				let n = t !== void 0 && t.length === 1;
				n && (e = ie.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), n && ie.set(t, e));
			}
			return e;
		}
		toString() {
			return this.cssText;
		}
	}, oe = (e) => new ae(typeof e == "string" ? e : e + "", void 0, re), se = (e, t) => {
		if (ne) e.adoptedStyleSheets = t.map(((e) => e instanceof CSSStyleSheet ? e : e.styleSheet));
		else for (let n of t) {
			let t = document.createElement("style"), r = I.litNonce;
			r !== void 0 && t.setAttribute("nonce", r), t.textContent = n.cssText, e.appendChild(t);
		}
	}, L = ne ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((e) => {
		let t = "";
		for (let n of e.cssRules) t += n.cssText;
		return oe(t);
	})(e) : e;
})), le, ue, de, fe, pe, me, he, R, ge, _e, ve, z, ye, be, xe, Se, Ce = t((() => {
	ce(), {is: ue, defineProperty: de, getOwnPropertyDescriptor: fe, getOwnPropertyNames: pe, getOwnPropertySymbols: me, getPrototypeOf: he} = Object, R = globalThis, ge = R.trustedTypes, _e = ge ? ge.emptyScript : "", ve = R.reactiveElementPolyfillSupport, z = (e, t) => e, ye = {
		toAttribute(e, t) {
			switch (t) {
				case Boolean:
					e = e ? _e : null;
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
	}, be = (e, t) => !ue(e, t), xe = {
		attribute: !0,
		type: String,
		converter: ye,
		reflect: !1,
		useDefault: !1,
		hasChanged: be
	}, (le = Symbol).metadata ?? (le.metadata = Symbol("metadata")), R.litPropertyMetadata ?? (R.litPropertyMetadata = /* @__PURE__ */ new WeakMap()), Se = class extends HTMLElement {
		static addInitializer(e) {
			this._$Ei(), (this.l ?? (this.l = [])).push(e);
		}
		static get observedAttributes() {
			return this.finalize(), this._$Eh && [...this._$Eh.keys()];
		}
		static createProperty(e, t = xe) {
			if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
				let n = Symbol(), r = this.getPropertyDescriptor(e, n, t);
				r !== void 0 && de(this.prototype, e, r);
			}
		}
		static getPropertyDescriptor(e, t, n) {
			let { get: r, set: i } = fe(this.prototype, e) ?? {
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
			return this.elementProperties.get(e) ?? xe;
		}
		static _$Ei() {
			if (this.hasOwnProperty(z("elementProperties"))) return;
			let e = he(this);
			e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
		}
		static finalize() {
			if (this.hasOwnProperty(z("finalized"))) return;
			if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(z("properties"))) {
				let e = this.properties, t = [...pe(e), ...me(e)];
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
				for (let e of n) t.unshift(L(e));
			} else e !== void 0 && t.push(L(e));
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
			return se(e, this.constructor.elementStyles), e;
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
				let i = (n.converter?.toAttribute === void 0 ? ye : n.converter).toAttribute(t, n.type);
				this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
			}
		}
		_$AK(e, t) {
			let n = this.constructor, r = n._$Eh.get(e);
			if (r !== void 0 && this._$Em !== r) {
				let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? ye : e.converter;
				this._$Em = r;
				let a = i.fromAttribute(t, e.type);
				this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
			}
		}
		requestUpdate(e, t, n) {
			if (e !== void 0) {
				let r = this.constructor, i = this[e];
				if (n ?? (n = r.getPropertyOptions(e)), !((n.hasChanged ?? be)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(r._$Eu(e, n)))) return;
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
	}, Se.elementStyles = [], Se.shadowRootOptions = { mode: "open" }, Se[z("elementProperties")] = /* @__PURE__ */ new Map(), Se[z("finalized")] = /* @__PURE__ */ new Map(), ve?.({ ReactiveElement: Se }), (R.reactiveElementVersions ?? (R.reactiveElementVersions = [])).push("2.1.1");
}));
//#endregion
//#region node_modules/lit-html/lit-html.js
function we(e, t) {
	if (!Fe(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return Oe === void 0 ? t : Oe.createHTML(t);
}
function Te(e, t, n = e, r) {
	if (t === U) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = Pe(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ?? (n._$Co = []))[r] = i), i !== void 0 && (t = Te(e, i._$AS(e, t.values), i, r)), t;
}
var Ee, De, Oe, ke, B, Ae, je, Me, Ne, Pe, Fe, Ie, Le, Re, ze, Be, Ve, He, Ue, We, Ge, V, H, U, W, Ke, qe, Je, Ye, Xe, Ze, Qe, $e, et, tt, nt, rt, it, at, ot = t((() => {
	Ee = globalThis, De = Ee.trustedTypes, Oe = De ? De.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, ke = "$lit$", B = `lit$${Math.random().toFixed(9).slice(2)}$`, Ae = "?" + B, je = `<${Ae}>`, Me = document, Ne = () => Me.createComment(""), Pe = (e) => e === null || typeof e != "object" && typeof e != "function", Fe = Array.isArray, Ie = (e) => Fe(e) || typeof e?.[Symbol.iterator] == "function", Le = "[ 	\n\f\r]", Re = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, ze = /-->/g, Be = />/g, Ve = RegExp(`>|${Le}(?:([^\\s"'>=/]+)(${Le}*=${Le}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), He = /'/g, Ue = /"/g, We = /^(?:script|style|textarea|title)$/i, Ge = (e) => (t, ...n) => ({
		_$litType$: e,
		strings: t,
		values: n
	}), V = Ge(1), H = Ge(2), Ge(3), U = Symbol.for("lit-noChange"), W = Symbol.for("lit-nothing"), Ke = /* @__PURE__ */ new WeakMap(), qe = Me.createTreeWalker(Me, 129), Je = (e, t) => {
		let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = Re;
		for (let t = 0; t < n; t++) {
			let n = e[t], s, c, l = -1, u = 0;
			for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === Re ? c[1] === "!--" ? o = ze : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = Ve) : (We.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = Ve) : o = Be : o === Ve ? c[0] === ">" ? (o = i ?? Re, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? Ve : c[3] === "\"" ? Ue : He) : o === Ue || o === He ? o = Ve : o === ze || o === Be ? o = Re : (o = Ve, i = void 0);
			let d = o === Ve && e[t + 1].startsWith("/>") ? " " : "";
			a += o === Re ? n + je : l >= 0 ? (r.push(s), n.slice(0, l) + ke + n.slice(l) + B + d) : n + B + (l === -2 ? t : d);
		}
		return [we(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
	}, Ye = class e {
		constructor({ strings: t, _$litType$: n }, r) {
			let i;
			this.parts = [];
			let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = Je(t, n);
			if (this.el = e.createElement(l, r), qe.currentNode = this.el.content, n === 2 || n === 3) {
				let e = this.el.content.firstChild;
				e.replaceWith(...e.childNodes);
			}
			for (; (i = qe.nextNode()) !== null && c.length < s;) {
				if (i.nodeType === 1) {
					if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(ke)) {
						let t = u[o++], n = i.getAttribute(e).split(B), r = /([.?@])?(.*)/.exec(t);
						c.push({
							type: 1,
							index: a,
							name: r[2],
							strings: n,
							ctor: r[1] === "." ? $e : r[1] === "?" ? et : r[1] === "@" ? tt : Qe
						}), i.removeAttribute(e);
					} else e.startsWith(B) && (c.push({
						type: 6,
						index: a
					}), i.removeAttribute(e));
					if (We.test(i.tagName)) {
						let e = i.textContent.split(B), t = e.length - 1;
						if (t > 0) {
							i.textContent = De ? De.emptyScript : "";
							for (let n = 0; n < t; n++) i.append(e[n], Ne()), qe.nextNode(), c.push({
								type: 2,
								index: ++a
							});
							i.append(e[t], Ne());
						}
					}
				} else if (i.nodeType === 8) if (i.data === Ae) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(B, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += B.length - 1;
				}
				a++;
			}
		}
		static createElement(e, t) {
			let n = Me.createElement("template");
			return n.innerHTML = e, n;
		}
	}, Xe = class {
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
			let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? Me).importNode(t, !0);
			qe.currentNode = r;
			let i = qe.nextNode(), a = 0, o = 0, s = n[0];
			for (; s !== void 0;) {
				if (a === s.index) {
					let t;
					s.type === 2 ? t = new Ze(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new nt(i, this, e)), this._$AV.push(t), s = n[++o];
				}
				a !== s?.index && (i = qe.nextNode(), a++);
			}
			return qe.currentNode = Me, r;
		}
		p(e) {
			let t = 0;
			for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
		}
	}, Ze = class e {
		get _$AU() {
			return this._$AM?._$AU ?? this._$Cv;
		}
		constructor(e, t, n, r) {
			this.type = 2, this._$AH = W, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
			e = Te(this, e, t), Pe(e) ? e === W || e == null || e === "" ? (this._$AH !== W && this._$AR(), this._$AH = W) : e !== this._$AH && e !== U && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? Ie(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
		}
		O(e) {
			return this._$AA.parentNode.insertBefore(e, this._$AB);
		}
		T(e) {
			this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
		}
		_(e) {
			this._$AH !== W && Pe(this._$AH) ? this._$AA.nextSibling.data = e : this.T(Me.createTextNode(e)), this._$AH = e;
		}
		$(e) {
			let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = Ye.createElement(we(n.h, n.h[0]), this.options)), n);
			if (this._$AH?._$AD === r) this._$AH.p(t);
			else {
				let e = new Xe(r, this), n = e.u(this.options);
				e.p(t), this.T(n), this._$AH = e;
			}
		}
		_$AC(e) {
			let t = Ke.get(e.strings);
			return t === void 0 && Ke.set(e.strings, t = new Ye(e)), t;
		}
		k(t) {
			Fe(this._$AH) || (this._$AH = [], this._$AR());
			let n = this._$AH, r, i = 0;
			for (let a of t) i === n.length ? n.push(r = new e(this.O(Ne()), this.O(Ne()), this, this.options)) : r = n[i], r._$AI(a), i++;
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
	}, Qe = class {
		get tagName() {
			return this.element.tagName;
		}
		get _$AU() {
			return this._$AM._$AU;
		}
		constructor(e, t, n, r, i) {
			this.type = 1, this._$AH = W, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = W;
		}
		_$AI(e, t = this, n, r) {
			let i = this.strings, a = !1;
			if (i === void 0) e = Te(this, e, t, 0), a = !Pe(e) || e !== this._$AH && e !== U, a && (this._$AH = e);
			else {
				let r = e, o, s;
				for (e = i[0], o = 0; o < i.length - 1; o++) s = Te(this, r[n + o], t, o), s === U && (s = this._$AH[o]), a || (a = !Pe(s) || s !== this._$AH[o]), s === W ? e = W : e !== W && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
			}
			a && !r && this.j(e);
		}
		j(e) {
			e === W ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
		}
	}, $e = class extends Qe {
		constructor() {
			super(...arguments), this.type = 3;
		}
		j(e) {
			this.element[this.name] = e === W ? void 0 : e;
		}
	}, et = class extends Qe {
		constructor() {
			super(...arguments), this.type = 4;
		}
		j(e) {
			this.element.toggleAttribute(this.name, !!e && e !== W);
		}
	}, tt = class extends Qe {
		constructor(e, t, n, r, i) {
			super(e, t, n, r, i), this.type = 5;
		}
		_$AI(e, t = this) {
			if ((e = Te(this, e, t, 0) ?? W) === U) return;
			let n = this._$AH, r = e === W && n !== W || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== W && (n === W || r);
			r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
		}
		handleEvent(e) {
			typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
		}
	}, nt = class {
		constructor(e, t, n) {
			this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
		}
		get _$AU() {
			return this._$AM._$AU;
		}
		_$AI(e) {
			Te(this, e);
		}
	}, rt = {
		M: ke,
		P: B,
		A: Ae,
		C: 1,
		L: Je,
		R: Xe,
		D: Ie,
		V: Te,
		I: Ze,
		H: Qe,
		N: et,
		U: tt,
		B: $e,
		F: nt
	}, it = Ee.litHtmlPolyfillSupport, it?.(Ye, Ze), (Ee.litHtmlVersions ?? (Ee.litHtmlVersions = [])).push("3.3.1"), at = (e, t, n) => {
		let r = n?.renderBefore ?? t, i = r._$litPart$;
		if (i === void 0) {
			let e = n?.renderBefore ?? null;
			r._$litPart$ = i = new Ze(t.insertBefore(Ne(), e), e, void 0, n ?? {});
		}
		return i._$AI(e), i;
	};
})), st, ct, lt, ut, dt, ft, pt, mt, ht, gt = t((() => {
	st = globalThis, ct = st.ShadowRoot && (st.ShadyCSS === void 0 || st.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, lt = Symbol(), ut = /* @__PURE__ */ new WeakMap(), dt = class {
		constructor(e, t, n) {
			if (this._$cssResult$ = !0, n !== lt) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
			this.cssText = e, this.t = t;
		}
		get styleSheet() {
			let e = this.o, t = this.t;
			if (ct && e === void 0) {
				let n = t !== void 0 && t.length === 1;
				n && (e = ut.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), n && ut.set(t, e));
			}
			return e;
		}
		toString() {
			return this.cssText;
		}
	}, ft = (e) => new dt(typeof e == "string" ? e : e + "", void 0, lt), pt = (e, ...t) => {
		let n = e.length === 1 ? e[0] : t.reduce(((t, n, r) => t + ((e) => {
			if (!0 === e._$cssResult$) return e.cssText;
			if (typeof e == "number") return e;
			throw Error("Value passed to 'css' function must be a 'css' function result: " + e + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
		})(n) + e[r + 1]), e[0]);
		return new dt(n, e, lt);
	}, mt = (e, t) => {
		if (ct) e.adoptedStyleSheets = t.map(((e) => e instanceof CSSStyleSheet ? e : e.styleSheet));
		else for (let n of t) {
			let t = document.createElement("style"), r = st.litNonce;
			r !== void 0 && t.setAttribute("nonce", r), t.textContent = n.cssText, e.appendChild(t);
		}
	}, ht = ct ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((e) => {
		let t = "";
		for (let n of e.cssRules) t += n.cssText;
		return ft(t);
	})(e) : e;
})), _t, vt, yt, bt, xt, St, Ct, wt, Tt, Et, Dt, Ot, kt, At, jt, Mt, Nt = t((() => {
	gt(), {is: vt, defineProperty: yt, getOwnPropertyDescriptor: bt, getOwnPropertyNames: xt, getOwnPropertySymbols: St, getPrototypeOf: Ct} = Object, wt = globalThis, Tt = wt.trustedTypes, Et = Tt ? Tt.emptyScript : "", Dt = wt.reactiveElementPolyfillSupport, Ot = (e, t) => e, kt = {
		toAttribute(e, t) {
			switch (t) {
				case Boolean:
					e = e ? Et : null;
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
	}, At = (e, t) => !vt(e, t), jt = {
		attribute: !0,
		type: String,
		converter: kt,
		reflect: !1,
		useDefault: !1,
		hasChanged: At
	}, (_t = Symbol).metadata ?? (_t.metadata = Symbol("metadata")), wt.litPropertyMetadata ?? (wt.litPropertyMetadata = /* @__PURE__ */ new WeakMap()), Mt = class extends HTMLElement {
		static addInitializer(e) {
			this._$Ei(), (this.l ?? (this.l = [])).push(e);
		}
		static get observedAttributes() {
			return this.finalize(), this._$Eh && [...this._$Eh.keys()];
		}
		static createProperty(e, t = jt) {
			if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
				let n = Symbol(), r = this.getPropertyDescriptor(e, n, t);
				r !== void 0 && yt(this.prototype, e, r);
			}
		}
		static getPropertyDescriptor(e, t, n) {
			let { get: r, set: i } = bt(this.prototype, e) ?? {
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
			return this.elementProperties.get(e) ?? jt;
		}
		static _$Ei() {
			if (this.hasOwnProperty(Ot("elementProperties"))) return;
			let e = Ct(this);
			e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
		}
		static finalize() {
			if (this.hasOwnProperty(Ot("finalized"))) return;
			if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Ot("properties"))) {
				let e = this.properties, t = [...xt(e), ...St(e)];
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
				for (let e of n) t.unshift(ht(e));
			} else e !== void 0 && t.push(ht(e));
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
			return mt(e, this.constructor.elementStyles), e;
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
				let i = (n.converter?.toAttribute === void 0 ? kt : n.converter).toAttribute(t, n.type);
				this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
			}
		}
		_$AK(e, t) {
			let n = this.constructor, r = n._$Eh.get(e);
			if (r !== void 0 && this._$Em !== r) {
				let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? kt : e.converter;
				this._$Em = r;
				let a = i.fromAttribute(t, e.type);
				this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
			}
		}
		requestUpdate(e, t, n) {
			if (e !== void 0) {
				let r = this.constructor, i = this[e];
				if (n ?? (n = r.getPropertyOptions(e)), !((n.hasChanged ?? At)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(r._$Eu(e, n)))) return;
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
	}, Mt.elementStyles = [], Mt.shadowRootOptions = { mode: "open" }, Mt[Ot("elementProperties")] = /* @__PURE__ */ new Map(), Mt[Ot("finalized")] = /* @__PURE__ */ new Map(), Dt?.({ ReactiveElement: Mt }), (wt.reactiveElementVersions ?? (wt.reactiveElementVersions = [])).push("2.1.1");
})), Pt, Ft, It, Lt = t((() => {
	Nt(), Nt(), ot(), ot(), Pt = globalThis, Ft = class extends Mt {
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
			this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = at(t, this.renderRoot, this.renderOptions);
		}
		connectedCallback() {
			super.connectedCallback(), this._$Do?.setConnected(!0);
		}
		disconnectedCallback() {
			super.disconnectedCallback(), this._$Do?.setConnected(!1);
		}
		render() {
			return U;
		}
	}, Ft._$litElement$ = !0, Ft.finalized = !0, Pt.litElementHydrateSupport?.({ LitElement: Ft }), It = Pt.litElementPolyfillSupport, It?.({ LitElement: Ft }), (Pt.litElementVersions ?? (Pt.litElementVersions = [])).push("4.2.1");
})), Rt = t((() => {})), zt = t((() => {
	Ce(), ot(), Lt(), Rt();
})), Bt, Vt = t((() => {
	Bt = (e) => (t, n) => {
		n === void 0 ? customElements.define(e, t) : n.addInitializer((() => {
			customElements.define(e, t);
		}));
	};
}));
//#endregion
//#region node_modules/lit/node_modules/@lit/reactive-element/decorators/property.js
function G(e) {
	return (t, n) => typeof n == "object" ? Ut(e, t, n) : ((e, t, n) => {
		let r = t.hasOwnProperty(n);
		return t.constructor.createProperty(n, e), r ? Object.getOwnPropertyDescriptor(t, n) : void 0;
	})(e, t, n);
}
var Ht, Ut, Wt = t((() => {
	Ce(), Ht = {
		attribute: !0,
		type: String,
		converter: ye,
		reflect: !1,
		hasChanged: be
	}, Ut = (e = Ht, t, n) => {
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
function Gt(e) {
	return G({
		...e,
		state: !0,
		attribute: !1
	});
}
var Kt = t((() => {
	Wt();
})), qt = t((() => {})), Jt = t((() => {})), Yt = t((() => {})), Xt = t((() => {})), Zt = t((() => {})), Qt = t((() => {})), $t = t((() => {
	Vt(), Wt(), Kt(), qt(), Jt(), Yt(), Xt(), Zt(), Qt();
}));
//#endregion
//#region node_modules/lit-html/directive-helpers.js
O();
var en = F();
zt(), $t(), ot();
var { I: tn } = rt, nn = (e) => e === null || typeof e != "object" && typeof e != "function", rn = (e) => e.strings === void 0, an = {
	ATTRIBUTE: 1,
	CHILD: 2,
	PROPERTY: 3,
	BOOLEAN_ATTRIBUTE: 4,
	EVENT: 5,
	ELEMENT: 6
}, on = (e) => (...t) => ({
	_$litDirective$: e,
	values: t
}), sn = class {
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
}, cn = (e, t) => {
	let n = e._$AN;
	if (n === void 0) return !1;
	for (let e of n) e._$AO?.(t, !1), cn(e, t);
	return !0;
}, ln = (e) => {
	let t, n;
	do {
		if ((t = e._$AM) === void 0) break;
		n = t._$AN, n.delete(e), e = t;
	} while (n?.size === 0);
}, un = (e) => {
	for (let t; t = e._$AM; e = t) {
		let n = t._$AN;
		if (n === void 0) t._$AN = n = /* @__PURE__ */ new Set();
		else if (n.has(e)) break;
		n.add(e), pn(t);
	}
};
function dn(e) {
	this._$AN === void 0 ? this._$AM = e : (ln(this), this._$AM = e, un(this));
}
function fn(e, t = !1, n = 0) {
	let r = this._$AH, i = this._$AN;
	if (i !== void 0 && i.size !== 0) if (t) if (Array.isArray(r)) for (let e = n; e < r.length; e++) cn(r[e], !1), ln(r[e]);
	else r != null && (cn(r, !1), ln(r));
	else cn(this, e);
}
var pn = (e) => {
	e.type == an.CHILD && (e._$AP ?? (e._$AP = fn), e._$AQ ?? (e._$AQ = dn));
}, mn = class extends sn {
	constructor() {
		super(...arguments), this._$AN = void 0;
	}
	_$AT(e, t, n) {
		super._$AT(e, t, n), un(this), this.isConnected = e._$AU;
	}
	_$AO(e, t = !0) {
		e !== this.isConnected && (this.isConnected = e, e ? this.reconnected?.() : this.disconnected?.()), t && (cn(this, e), ln(this));
	}
	setValue(e) {
		if (rn(this._$Ct)) this._$Ct._$AI(e, this);
		else {
			let t = [...this._$Ct._$AH];
			t[this._$Ci] = e, this._$Ct._$AI(t, this, 0);
		}
	}
	disconnected() {}
	reconnected() {}
}, hn = class {
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
}, gn = class {
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
ot();
var _n = (e) => !nn(e) && typeof e.then == "function", vn = 1073741823, yn = on(class extends mn {
	constructor() {
		super(...arguments), this._$Cwt = vn, this._$Cbt = [], this._$CK = new hn(this), this._$CX = new gn();
	}
	render(...e) {
		return e.find(((e) => !_n(e))) ?? U;
	}
	update(e, t) {
		let n = this._$Cbt, r = n.length;
		this._$Cbt = t;
		let i = this._$CK, a = this._$CX;
		this.isConnected || this.disconnected();
		for (let e = 0; e < t.length && !(e > this._$Cwt); e++) {
			let o = t[e];
			if (!_n(o)) return this._$Cwt = e, o;
			e < r && o === n[e] || (this._$Cwt = vn, r = 0, Promise.resolve(o).then((async (e) => {
				for (; a.get();) await a.get();
				let t = i.deref();
				if (t !== void 0) {
					let n = t._$Cbt.indexOf(o);
					n > -1 && n < t._$Cwt && (t._$Cwt = n, t.setValue(e));
				}
			})));
		}
		return U;
	}
	disconnected() {
		this._$CK.disconnect(), this._$CX.pause();
	}
	reconnected() {
		this._$CK.reconnect(this), this._$CX.resume();
	}
}), bn = "6.9.0", xn = "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.maxTouchPoints > 0, Sn = class extends HTMLElement {
	constructor() {
		super(), this.holdTime = 500, this.held = !1, this.ripple = document.createElement("mwc-ripple");
	}
	connectedCallback() {
		Object.assign(this.style, {
			position: "absolute",
			width: xn ? "100px" : "50px",
			height: xn ? "100px" : "50px",
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
			n.preventDefault(), !(["touchend", "touchcancel"].includes(n.type) && this.timer === void 0) && (clearTimeout(this.timer), this.stopAnimation(), this.timer = void 0, this.held ? b(e, "action", { action: "hold" }) : t.hasDoubleClick ? n.type === "click" && n.detail < 2 || !this.dblClickTimeout ? this.dblClickTimeout = window.setTimeout(() => {
				this.dblClickTimeout = void 0, b(e, "action", { action: "tap" });
			}, 250) : (clearTimeout(this.dblClickTimeout), this.dblClickTimeout = void 0, b(e, "action", { action: "double_tap" })) : b(e, "action", { action: "tap" }));
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
customElements.define("action-handler-hourly-weather", Sn);
var Cn = () => {
	let e = document.body;
	if (e.querySelector("action-handler-hourly-weather")) return e.querySelector("action-handler-hourly-weather");
	let t = document.createElement("action-handler-hourly-weather");
	return e.appendChild(t), t;
}, wn = (e, t) => {
	let n = Cn();
	n && n.bind(e, t);
}, Tn = on(class extends sn {
	update(e, [t]) {
		return wn(e.element, t), U;
	}
	render(e) {}
}), En = {
	"clear-night": "conditions.clear",
	cloudy: "conditions.cloudy",
	fog: "conditions.fog",
	hail: "conditions.hail",
	lightning: "conditions.thunderstorm",
	"lightning-rainy": "conditions.thunderstorm",
	partlycloudy: "conditions.partlyCloudy",
	pouring: "conditions.heavyRain",
	rainy: "conditions.rain",
	snowy: "conditions.snow",
	"snowy-rainy": "conditions.mixedPrecip",
	sunny: "conditions.sunny",
	windy: "conditions.windy",
	"windy-variant": "conditions.windy",
	exceptional: "conditions.clear"
}, Dn = {
	"clear-night": "weather-night",
	cloudy: "cloudy",
	fog: "fog",
	hail: "hail",
	lightning: "lightning",
	"lightning-rainy": "lightning-rainy",
	partlycloudy: "weather-partly-cloudy",
	pouring: "pouring",
	rainy: "rainy",
	snowy: "snowy",
	"snowy-rainy": "snowy-rainy",
	sunny: "sunny",
	windy: "windy",
	"windy-variant": "windy-variant",
	exceptional: "alert-outline"
}, On = {
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
}, kn = {
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
}, An = /* @__PURE__ */ r({
	card: () => In,
	common: () => jn,
	conditions: () => Pn,
	default: () => Ln,
	direction: () => Fn,
	editor: () => Mn,
	errors: () => Nn
}), jn, Mn, Nn, Pn, Fn, In, Ln, Rn = t((() => {
	jn = {
		version: "Версия",
		title: "Времето по часове",
		title_card: "Карта с времето по часове",
		description: "Карта, която визуализира почасово метеорологичните условия във вид на лента.",
		invalid_configuration: "Невалидна конфигурация"
	}, Mn = {
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
	}, Nn = {
		missing_entity: "entity липсва в конфигурацията",
		too_many_segments_requested: "Задали сте твърде много сегменти с прогнози в num_segments. Трябва да бъдат <= от броя сегменти във forecast entity.",
		must_be_int: "Трябва да бъде четно число по-голямо или равно на 2",
		invalid_colors: "Следните цветове в конфигурацията Ви са невалидни:",
		must_be_positive_int: "Трябва да е положително число",
		offset_must_be_positive_int: "Отместването трябва да е положително число",
		forecast_not_available: "Не е налична прогноза",
		check_entity: "Проверете конфигурираното forecast entity.",
		invalid_value_icon_fill: "icon_fill трябва да бъде или положително цяло число, или едно от 'single' или 'full'"
	}, Pn = {
		clear: "Ясно",
		cloudy: "Облачно",
		fog: "Мъгла",
		hail: "Градушка",
		thunderstorm: "Гръмотевична буря",
		partlyCloudy: "Частична облачност",
		heavyRain: "Проливен дъжд",
		rain: "Дъжд",
		snow: "Сняг",
		mixedPrecip: "Смесен валеж",
		sunny: "Слънчево",
		windy: "Ветровито"
	}, Fn = {
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
	}, In = { chance_of_precipitation: "{0}% вероятност за валежи" }, Ln = {
		common: jn,
		editor: Mn,
		errors: Nn,
		conditions: Pn,
		direction: Fn,
		card: In
	};
})), zn = /* @__PURE__ */ r({
	card: () => Gn,
	common: () => Bn,
	conditions: () => Un,
	default: () => Kn,
	direction: () => Wn,
	editor: () => Vn,
	errors: () => Hn
}), Bn, Vn, Hn, Un, Wn, Gn, Kn, qn = t((() => {
	Bn = {
		version: "Verze",
		title: "Hodinnová předpověď",
		title_card: "Karta Hodinnová předpověď",
		description: "Karta zobrazující hodinovou předpověď v řádku.",
		invalid_configuration: "Neplatná konfigurace"
	}, Vn = {
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
	}, Hn = {
		missing_entity: "Hodnota 'entity' nebyla zadána",
		too_many_segments_requested: "Je nastaveno příliš mnoho dílků předpovědi v 'num_segments'. Hodnota musí být <= počtu hodnot v zadané entitě.",
		must_be_int: "Hodnota musí být kladné sudé celé číslo",
		invalid_colors: "Následující hodnoty v konfiguraci jsou neplatné:",
		must_be_positive_int: "Hodnota musí být kladné celé číslo",
		offset_must_be_positive_int: "Hodnota 'offset' musí být kladné celé číslo",
		forecast_not_available: "Předpověď není dostupná",
		check_entity: "Zkontrolujte zadanou entity předpovědi.",
		invalid_value_icon_fill: "icon_fill musí být buď kladné celé číslo, nebo jedno z 'single'; nebo 'full';"
	}, Un = {
		clear: "Jasno",
		cloudy: "Oblačno",
		fog: "Mlha",
		hail: "Kroupy",
		thunderstorm: "Bouřka",
		partlyCloudy: "Polojasno",
		heavyRain: "Silný déšť",
		rain: "Déšť",
		snow: "Sníh",
		mixedPrecip: "Smíšené srážky",
		sunny: "Slunečno",
		windy: "Větrno"
	}, Wn = {
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
	}, Gn = { chance_of_precipitation: "{0}% šance srážek" }, Kn = {
		common: Bn,
		editor: Vn,
		errors: Hn,
		conditions: Un,
		direction: Wn,
		card: Gn
	};
})), Jn = /* @__PURE__ */ r({
	card: () => er,
	common: () => Yn,
	conditions: () => Qn,
	default: () => tr,
	direction: () => $n,
	editor: () => Xn,
	errors: () => Zn
}), Yn, Xn, Zn, Qn, $n, er, tr, nr = t((() => {
	Yn = {
		version: "Version",
		title: "Time Vejr",
		title_card: "Time Vejr Kort",
		description: "Et kort som viser vejret hver time som en linje.",
		invalid_configuration: "Ugyldig konfiguration"
	}, Xn = {
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
	}, Zn = {
		missing_entity: "entitet mangler i konfiguration",
		too_many_segments_requested: "For mange segmenter forespurgt i num_segments. Skal være mindre eller lig antal segmenter i vejrudsigtsentiteten.",
		must_be_int: "Skal være et heltal størrere end eller lig 2",
		invalid_colors: "Føglende farver i din konfiguration er ugyldige:",
		must_be_positive_int: "Skal være et positivt heltal",
		offset_must_be_positive_int: "offset skal være et positivt heltal",
		forecast_not_available: "Vejrudsigt ikke tilgængelig",
		check_entity: "Kontroller den definerede vejrudsigtsentitet.",
		invalid_value_icon_fill: "icon_fill skal enten være et positivt heltal eller et af 'single' eller 'full'"
	}, Qn = {
		clear: "Klart",
		cloudy: "Skyet",
		fog: "Tåge",
		hail: "Hagl",
		thunderstorm: "Torden",
		partlyCloudy: "Delvist overskyet",
		heavyRain: "Kraftig regn",
		rain: "Regn",
		snow: "Sne",
		mixedPrecip: "Blandet nedbør",
		sunny: "Sol",
		windy: "Blæsende"
	}, $n = {
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
	}, er = { chance_of_precipitation: "{0}% risiko for nedbør" }, tr = {
		common: Yn,
		editor: Xn,
		errors: Zn,
		conditions: Qn,
		direction: $n,
		card: er
	};
})), rr = /* @__PURE__ */ r({
	card: () => lr,
	common: () => ir,
	conditions: () => sr,
	default: () => ur,
	direction: () => cr,
	editor: () => ar,
	errors: () => or
}), ir, ar, or, sr, cr, lr, ur, dr = t((() => {
	ir = {
		version: "Version",
		title: "Stündliches Wetterbedingungen",
		title_card: "Stündliche Wetterbedingungen",
		description: "Diese Karte stellt stündliche Wetterbedingungen als Balken dar.",
		invalid_configuration: "Ungültige Konfiguration"
	}, ar = {
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
	}, or = {
		missing_entity: "Keine Wetter-Entität festgelegt",
		must_be_int: "Muss eine gerade ganze Zahl größer oder gleich 2 sein.",
		invalid_colors: "Die folgenden Farben in Ihrer Konfiguration sind ungültig:",
		must_be_positive_int: "Muss eine positive Ganzzahl sein",
		too_many_segments_requested: "Zu viele Prognosesegmente in num_segments angefordert. Muss <= Anzahl der Segmente in der Prognoseentität sein.",
		offset_must_be_positive_int: "offset muss eine positive Ganzzahl sein",
		forecast_not_available: "Prognose nicht verfügbar",
		check_entity: "Überprüfen Sie die konfigurierte Prognoseentität.",
		invalid_value_icon_fill: "icon_fill muss entweder eine positive Ganzzahl oder einer der Werte 'single' oder 'full' sein."
	}, sr = {
		clear: "Klar",
		cloudy: "Bewölkt",
		fog: "Nebel",
		hail: "Hagel",
		thunderstorm: "Gewitter",
		partlyCloudy: "Teilweise bewölkt",
		heavyRain: "Platzregen",
		rain: "Regen",
		snow: "Schnee",
		mixedPrecip: "Gemischter Niederschlag",
		sunny: "Sonnig",
		windy: "Windig"
	}, cr = {
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
	}, lr = { chance_of_precipitation: "{0}% Niederschlagswahrscheinlichkeit" }, ur = {
		common: ir,
		editor: ar,
		errors: or,
		conditions: sr,
		direction: cr,
		card: lr
	};
})), fr = /* @__PURE__ */ r({
	card: () => vr,
	common: () => pr,
	conditions: () => gr,
	default: () => yr,
	direction: () => _r,
	editor: () => mr,
	errors: () => hr
}), pr, mr, hr, gr, _r, vr, yr, br = t((() => {
	pr = {
		version: "Version",
		title: "Hourly Weather",
		title_card: "Hourly Weather Card",
		description: "A card to render hourly weather conditions as a bar.",
		invalid_configuration: "Invalid configuration"
	}, mr = {
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
	}, hr = {
		missing_entity: "entity is missing in configuration",
		too_many_segments_requested: "Too many forecast segments requested in num_segments. Must be <= number of segments in forecast entity.",
		must_be_int: "Must be an even integer greater than or equal to 2",
		invalid_colors: "The following colors in your configuration are invalid:",
		must_be_positive_int: "Must be a positive integer",
		offset_must_be_positive_int: "offset must be a positive integer",
		forecast_not_available: "Forecast not available",
		check_entity: "Check the configured forecast entity.",
		invalid_value_icon_fill: "icon_fill must be either a positive integer or one of 'single' or 'full'"
	}, gr = {
		clear: "Clear",
		cloudy: "Cloudy",
		fog: "Fog",
		hail: "Hail",
		thunderstorm: "Thunderstorm",
		partlyCloudy: "Partly cloudy",
		heavyRain: "Heavy rain",
		rain: "Rain",
		snow: "Snow",
		mixedPrecip: "Mixed precip",
		sunny: "Sunny",
		windy: "Windy"
	}, _r = {
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
	}, vr = { chance_of_precipitation: "{0}% chance of precipitation" }, yr = {
		common: pr,
		editor: mr,
		errors: hr,
		conditions: gr,
		direction: _r,
		card: vr
	};
})), xr = /* @__PURE__ */ r({
	card: () => Dr,
	common: () => Sr,
	conditions: () => Tr,
	default: () => Or,
	direction: () => Er,
	editor: () => Cr,
	errors: () => wr
}), Sr, Cr, wr, Tr, Er, Dr, Or, kr = t((() => {
	Sr = {
		version: "Versión",
		title: "Tiempo por hora",
		title_card: "Tarjeta de Tiempo por hora",
		description: "Una tarjeta para mostrar las condiciones climáticas cada hora en una barra.",
		invalid_configuration: "Configuración inválida"
	}, Cr = {
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
	}, wr = {
		missing_entity: "falta la entidad en la configuración",
		must_be_int: "Debe ser un entero mayor o igual a 2",
		invalid_colors: "Los siguientes colores en su configuración no son válidos:",
		must_be_positive_int: "Debe ser un entero positivo",
		too_many_segments_requested: "Se solicitaron demasiados segmentos de pronóstico en num_segments. Debe ser <= número de segmentos en la entidad de pronóstico.",
		offset_must_be_positive_int: "offset debe ser un número entero positivo",
		forecast_not_available: "Pronóstico no disponible",
		check_entity: "Verifique la entidad de pronóstico configurada.",
		invalid_value_icon_fill: "icon_fill debe ser un número entero positivo o uno de los valores 'single' o 'full'"
	}, Tr = {
		clear: "Despejado",
		cloudy: "Nublado",
		fog: "Niebla",
		hail: "Granizo",
		thunderstorm: "Tormenta electrica",
		partlyCloudy: "Parcialmente nublado",
		heavyRain: "Tormenta",
		rain: "Lluvia",
		snow: "Nieve",
		mixedPrecip: "Chaparrones dispersos",
		sunny: "Soleado",
		windy: "Ventoso"
	}, Er = {
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
	}, Dr = { chance_of_precipitation: "{0}% probabilidad de precipitación" }, Or = {
		common: Sr,
		editor: Cr,
		errors: wr,
		conditions: Tr,
		direction: Er,
		card: Dr
	};
})), Ar = /* @__PURE__ */ r({
	card: () => Ir,
	common: () => jr,
	conditions: () => Pr,
	default: () => Lr,
	direction: () => Fr,
	editor: () => Mr,
	errors: () => Nr
}), jr, Mr, Nr, Pr, Fr, Ir, Lr, Rr = t((() => {
	jr = {
		version: "Version",
		title: "Prévisions météo par heure",
		title_card: "Prévisions météo par heure",
		description: "Une carte pour afficher les prévisions météo par heure sur une ligne.",
		invalid_configuration: "Configuration invalide"
	}, Mr = {
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
	}, Nr = {
		missing_entity: "Entité manquante dans la configuration",
		must_be_int: "Doit être un nombre entier pair supérieur ou égal à 2",
		invalid_colors: "Les couleurs suivantes dans votre configuration ne sont pas valides\xA0:",
		must_be_positive_int: "Doit être un entier positif",
		too_many_segments_requested: "Trop de segments de prévision demandés dans num_segments. Doit être <= au nombre de segments de l'entité de prévision.",
		offset_must_be_positive_int: "offset doit être un entier positif",
		forecast_not_available: "Prévision non disponible",
		check_entity: "Vérifiez l'entité de prévision configurée.",
		invalid_value_icon_fill: "icon_fill doit être soit un entier positif, soit l'un des nombres 'single' ou 'full'"
	}, Pr = {
		clear: "Dégagé",
		cloudy: "Nuageux",
		fog: "Brouillard",
		hail: "Grêle",
		thunderstorm: "Orage",
		partlyCloudy: "Éclaircies",
		heavyRain: "Averses",
		rain: "Pluie",
		snow: "Neige",
		mixedPrecip: "Neigeux, pluvieux",
		sunny: "Ensoleillé",
		windy: "Venteux"
	}, Fr = {
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
	}, Ir = { chance_of_precipitation: "{0}% probabilité de précipitations" }, Lr = {
		common: jr,
		editor: Mr,
		errors: Nr,
		conditions: Pr,
		direction: Fr,
		card: Ir
	};
})), zr = /* @__PURE__ */ r({
	card: () => Gr,
	common: () => Br,
	conditions: () => Ur,
	default: () => Kr,
	direction: () => Wr,
	editor: () => Vr,
	errors: () => Hr
}), Br, Vr, Hr, Ur, Wr, Gr, Kr, qr = t((() => {
	Br = {
		version: "Verzió",
		title: "Óránkénti időjárás",
		title_card: "Óránkénti időjárás kártya",
		description: "Egy kártya, amely az óránkénti időjárási viszonyokat egy sávban jeleníti meg",
		invalid_configuration: "Érvénytelen konfiguráció"
	}, Vr = {
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
	}, Hr = {
		missing_entity: "az entitás hiányzik a konfigurációból",
		too_many_segments_requested: "Túl sok előrejelzési órát adtak meg a num_segments-ben. <= az előrejelző egységben lévő órák száma.",
		must_be_int: "Páros egész számnak kell lennie, amely nagyobb vagy egyenlő 2-nél.",
		invalid_colors: "A konfigurációdban a következő színek érvénytelenek:",
		must_be_positive_int: "Pozitív egész szám kell legyen",
		offset_must_be_positive_int: "offset pozitív egész számnak kell lennie",
		forecast_not_available: "Előrejelzés nem elérhető",
		check_entity: "Ellenőrizze a beállított előrejelző egységet.",
		invalid_value_icon_fill: "Az ikon_kitöltésének pozitív egésznek vagy az 'single' vagy 'full'"
	}, Ur = {
		clear: "Tiszta",
		cloudy: "Felhős",
		fog: "Ködös",
		hail: "Jégeső",
		thunderstorm: "Vihar",
		partlyCloudy: "Részben felhős",
		heavyRain: "Heves eső",
		rain: "Esős",
		snow: "Havazás",
		mixedPrecip: "Havas eső",
		sunny: "Napos",
		windy: "Szeles"
	}, Wr = {
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
	}, Gr = { chance_of_precipitation: "{0}% a csapadék valószínűsége" }, Kr = {
		common: Br,
		editor: Vr,
		errors: Hr,
		conditions: Ur,
		direction: Wr,
		card: Gr
	};
})), Jr = /* @__PURE__ */ r({
	card: () => ei,
	common: () => Yr,
	conditions: () => Qr,
	default: () => ti,
	direction: () => $r,
	editor: () => Xr,
	errors: () => Zr
}), Yr, Xr, Zr, Qr, $r, ei, ti, ni = t((() => {
	Yr = {
		version: "Versione",
		title: "Previsione Meteo Oraria",
		title_card: "Scheda Meteo Oraria",
		description: "Una scheda per rappresentare le condizioni meteorologiche orarie come una barra.",
		invalid_configuration: "Configurazione Non Valida"
	}, Xr = {
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
	}, Zr = {
		missing_entity: "entità mancante nella configurazione",
		must_be_int: "Deve essere un numero intero pari, maggiore o uguale a 2",
		invalid_colors: "I seguenti colori nella tua configurazione non sono validi:",
		must_be_positive_int: "Deve essere un numero intero positivo",
		too_many_segments_requested: "Troppi segmenti di previsione richiesti in num_segments. Deve essere <= numero di segmenti nell'entità di previsione.",
		offset_must_be_positive_int: "offset deve essere un numero intero positivo",
		forecast_not_available: "Previsione non disponibile",
		check_entity: "Controllare l'entità di previsione configurata.",
		invalid_value_icon_fill: "icon_fill deve essere un numero intero positivo o uno dei valori 'single' o 'full'"
	}, Qr = {
		clear: "Limpido",
		cloudy: "Nuvoloso",
		fog: "Nebbia",
		hail: "Grandine",
		thunderstorm: "Temporale",
		partlyCloudy: "Parzialmente Nuvoloso",
		heavyRain: "Acquazzone",
		rain: "Pioggia",
		snow: "Neve",
		mixedPrecip: "Precipitazioni Miste",
		sunny: "Soleggiato",
		windy: "Ventoso"
	}, $r = {
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
	}, ei = { chance_of_precipitation: "{0}% possibilità di precipitazioni" }, ti = {
		common: Yr,
		editor: Xr,
		errors: Zr,
		conditions: Qr,
		direction: $r,
		card: ei
	};
})), ri = /* @__PURE__ */ r({
	card: () => li,
	common: () => ii,
	conditions: () => si,
	default: () => ui,
	direction: () => ci,
	editor: () => ai,
	errors: () => oi
}), ii, ai, oi, si, ci, li, ui, di = t((() => {
	ii = {
		version: "Versjon",
		invalid_configuration: "Ikke gyldig konfiguration",
		title: "Timelig vær",
		title_card: "Timevis værkort",
		description: "Et kort for å gjengi værforhold hver time som en bar."
	}, ai = {
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
	}, oi = {
		missing_entity: "entity mangler i konfigurasjonen",
		must_be_int: "Må være et jevnt heltall større enn eller lik 2",
		invalid_colors: "Følgende farger i konfigurasjonen din er ugyldige:",
		must_be_positive_int: "Må være et positivt heltall",
		too_many_segments_requested: "For mange prognosesegmenter er forespurt i num_segments. Må være <= antall segmenter i prognoseenheten.",
		offset_must_be_positive_int: "offset må være et positivt heltall",
		forecast_not_available: "Værvarsel er ikke tilgjengelig",
		check_entity: "Sjekk den konfigurerte prognoseenheten.",
		invalid_value_icon_fill: "icon_fill må enten være et positivt heltall eller et av 'single' eller 'full'"
	}, si = {
		clear: "Klar",
		cloudy: "Skyet",
		fog: "Tåke",
		hail: "Hagl",
		thunderstorm: "Tordenvær",
		partlyCloudy: "Delvis skyet",
		heavyRain: "Mye regn",
		rain: "Regn",
		snow: "Snø",
		mixedPrecip: "Blandet nedbør",
		sunny: "Solfylt",
		windy: "Vindfullt"
	}, ci = {
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
	}, li = { chance_of_precipitation: "{0}% sjanse for nedbør" }, ui = {
		common: ii,
		editor: ai,
		errors: oi,
		conditions: si,
		direction: ci,
		card: li
	};
})), fi = /* @__PURE__ */ r({
	card: () => vi,
	common: () => pi,
	conditions: () => gi,
	default: () => yi,
	direction: () => _i,
	editor: () => mi,
	errors: () => hi
}), pi, mi, hi, gi, _i, vi, yi, bi = t((() => {
	pi = {
		version: "Versjon",
		invalid_configuration: "Ikkje gyldeg konfiguasjon",
		title: "Timelig vær",
		title_card: "Timevis værkort",
		description: "Eit kort for å gjengje verforhold kvar time som ein bar."
	}, mi = {
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
	}, hi = {
		missing_entity: "entity manglar i konfigurasjonen",
		must_be_int: "Må være et jevnt heiltal større enn eller lik 2",
		invalid_colors: "Følgande fargar i konfigurasjonen din er ugyldege:",
		must_be_positive_int: "Må vere eit positivt heiltal",
		too_many_segments_requested: "For mange prognosesegment er førespurt i num_segments. Må vere <= antall segment i prognoseeininga.",
		offset_must_be_positive_int: "offset må vere eit positivt heiltal",
		forecast_not_available: "Vervarsel er ikkje tilgjengeleg",
		check_entity: "Sjekk den konfigurerte prognoseeininga.",
		invalid_value_icon_fill: "icon_fill må enten være et positivt heltall eller et av 'single' eller 'full'"
	}, gi = {
		clear: "Klart",
		cloudy: "Skya",
		fog: "Tåke",
		hail: "Hagl",
		thunderstorm: "Tordenvær",
		partlyCloudy: "Delvis skya",
		heavyRain: "Mykje regn",
		rain: "Regn",
		snow: "Snø",
		mixedPrecip: "Blanda nedbør",
		sunny: "Sol",
		windy: "Vindfullt"
	}, _i = {
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
	}, vi = { chance_of_precipitation: "{0}% sjanse for nedbør" }, yi = {
		common: pi,
		editor: mi,
		errors: hi,
		conditions: gi,
		direction: _i,
		card: vi
	};
})), xi = /* @__PURE__ */ r({
	card: () => Di,
	common: () => Si,
	conditions: () => Ti,
	default: () => Oi,
	direction: () => Ei,
	editor: () => Ci,
	errors: () => wi
}), Si, Ci, wi, Ti, Ei, Di, Oi, ki = t((() => {
	Si = {
		version: "Versie",
		title: "Weer per uur",
		title_card: "Weerkaart per uur",
		description: "Een kaart om de weersomstandigheden per uur weer te geven als een bar.",
		invalid_configuration: "Ongeldige configuratie"
	}, Ci = {
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
	}, wi = {
		missing_entity: "entiteit ontbreekt in configuratie",
		too_many_segments_requested: "Te veel prognosesegmenten aangevraagd in num_segments. Moet <= aantal segmenten in prognose-entiteit zijn.",
		must_be_int: "Moet een even geheel getal zijn groter of gelijk aan 2",
		invalid_colors: "De volgende kleuren in uw configuratie zijn ongeldig:",
		must_be_positive_int: "Moet een positief geheel getal zijn",
		offset_must_be_positive_int: "offset moet een positief geheel getal zijn",
		forecast_not_available: "Prognose niet beschikbaar",
		check_entity: "Controleer de geconfigureerde prognose-entiteit.",
		invalid_value_icon_fill: "icon_fill moet een positief geheel getal zijn of een van de 'single'; of 'full'"
	}, Ti = {
		clear: "Helder",
		cloudy: "Bewolkt",
		fog: "Mist",
		hail: "Hagel",
		thunderstorm: "Onweersbui",
		partlyCloudy: "Half bewolkt",
		heavyRain: "Zware regen",
		rain: "Regen",
		snow: "Sneeuw",
		mixedPrecip: "Gemengde neerslag",
		sunny: "Zonnig",
		windy: "Winderig"
	}, Ei = {
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
	}, Di = { chance_of_precipitation: "{0}% kans op neerslag" }, Oi = {
		common: Si,
		editor: Ci,
		errors: wi,
		conditions: Ti,
		direction: Ei,
		card: Di
	};
})), Ai = /* @__PURE__ */ r({
	card: () => Ii,
	common: () => ji,
	conditions: () => Pi,
	default: () => Li,
	direction: () => Fi,
	editor: () => Mi,
	errors: () => Ni
}), ji, Mi, Ni, Pi, Fi, Ii, Li, Ri = t((() => {
	ji = {
		version: "Wersja",
		title: "Pogoda godzinowa",
		title_card: "Pogoda godzinowa",
		description: "Karta w formie wykresu słupkowego dla pogody godzinowej",
		invalid_configuration: "Nieprawiłowa konfiguracja"
	}, Mi = {
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
	}, Ni = {
		missing_entity: "encja nie istnieje",
		must_be_int: "Musi być parzystą liczbą całkowitą większą lub równą 2",
		invalid_colors: "Następujące kolory w Twojej konfiguracji są nieprawidłowe:",
		must_be_positive_int: "Musi być dodatnią liczbą całkowitą",
		too_many_segments_requested: "Zażądano zbyt wielu segmentów prognozy w num_segments. Musi wynosić <= liczba segmentów w elemencie prognozy.",
		offset_must_be_positive_int: "offset musi być dodatnią liczbą całkowitą",
		forecast_not_available: "Prognoza niedostępna",
		check_entity: "Sprawdź skonfigurowaną encję prognozy.",
		invalid_value_icon_fill: "icon_fill musi być dodatnią liczbą całkowitą lub jedną z wartości 'single' lub 'full'"
	}, Pi = {
		clear: "Bezchmurnie",
		cloudy: "Pochmurnie",
		fog: "Mgła",
		hail: "Grad",
		thunderstorm: "Burza",
		partlyCloudy: "Częściowe zachmurzenie",
		heavyRain: "Ulewa",
		rain: "Deszcz",
		snow: "Śnieg",
		mixedPrecip: "Mieszane opady",
		sunny: "Słonecznie",
		windy: "Wietrznie"
	}, Fi = {
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
	}, Ii = { chance_of_precipitation: "{0}% szans na opady" }, Li = {
		common: ji,
		editor: Mi,
		errors: Ni,
		conditions: Pi,
		direction: Fi,
		card: Ii
	};
})), zi = /* @__PURE__ */ r({
	card: () => Gi,
	common: () => Bi,
	conditions: () => Ui,
	default: () => Ki,
	direction: () => Wi,
	editor: () => Vi,
	errors: () => Hi
}), Bi, Vi, Hi, Ui, Wi, Gi, Ki, qi = t((() => {
	Bi = {
		version: "Versão",
		title: "Tempo de hora em hora",
		title_card: "Tempo de hora em hora",
		description: "Um cartão para mostrar as condições meteorológicas de hora em hora como uma barra.",
		invalid_configuration: "Configuração Inválida"
	}, Vi = {
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
	}, Hi = {
		missing_entity: "A entidade não existe na configuração",
		must_be_int: "Deve ser um número inteiro par maior ou igual a 2",
		invalid_colors: "As seguintes cores em sua configuração são inválidas:",
		must_be_positive_int: "Deve ser um número inteiro positivo",
		too_many_segments_requested: "Muitos segmentos de previsão solicitados em num_segments. Deve ser <= número de segmentos na entidade de previsão.",
		offset_must_be_positive_int: "offset deve ser um número inteiro positivo",
		forecast_not_available: "Previsão não disponível",
		check_entity: "Verifique a entidade de previsão configurada.",
		invalid_value_icon_fill: "icon_fill deve ser um número inteiro positivo ou um dos valores 'single' ou 'full'"
	}, Ui = {
		clear: "Limpo",
		cloudy: "Nublado",
		fog: "Nevoeiro",
		hail: "Granizo",
		thunderstorm: "Trovoada",
		partlyCloudy: "Pouco nublado",
		heavyRain: "Chuva forte",
		rain: "Chuva",
		snow: "Neve",
		mixedPrecip: "Precipitação mista",
		sunny: "Sol",
		windy: "Vento"
	}, Wi = {
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
	}, Gi = { chance_of_precipitation: "{0}% chance de chuva" }, Ki = {
		common: Bi,
		editor: Vi,
		errors: Hi,
		conditions: Ui,
		direction: Wi,
		card: Gi
	};
})), Ji = /* @__PURE__ */ r({
	card: () => ea,
	common: () => Yi,
	conditions: () => Qi,
	default: () => ta,
	direction: () => $i,
	editor: () => Xi,
	errors: () => Zi
}), Yi, Xi, Zi, Qi, $i, ea, ta, na = t((() => {
	Yi = {
		version: "Versão",
		title: "Tempo de hora em hora",
		title_card: "Cartão meteorológico por hora",
		description: "Um cartão para renderizar as condições climáticas horárias como uma barra.",
		invalid_configuration: "Configuração inválida"
	}, Xi = {
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
	}, Zi = {
		missing_entity: "entidade está faltando na configuração",
		too_many_segments_requested: "Muitos segmentos de previsão solicitados em num_segments. Deve ser <= número de segmentos na entidade de previsão.",
		must_be_int: "Deve ser um número inteiro par maior ou igual a 2",
		invalid_colors: "As seguintes cores em sua configuração são inválidas:",
		must_be_positive_int: "Deve ser um número inteiro positivo",
		offset_must_be_positive_int: "offset deve ser um número inteiro positivo",
		forecast_not_available: "Previsão não disponível",
		check_entity: "Verifique a entidade de previsão configurada.",
		invalid_value_icon_fill: "icon_fill deve ser um número inteiro positivo ou um dos valores 'single' ou 'full'"
	}, Qi = {
		clear: "Claro",
		cloudy: "Nublado",
		fog: "Névoa",
		hail: "Granizo",
		thunderstorm: "Tempestade",
		partlyCloudy: "Parcialmente nublado",
		heavyRain: "Chuva pesada",
		rain: "Chuva",
		snow: "Neve",
		mixedPrecip: "Precipitação mista",
		sunny: "Ensolarado",
		windy: "Ventania"
	}, $i = {
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
	}, ea = { chance_of_precipitation: "{0}% chance de precipitação" }, ta = {
		common: Yi,
		editor: Xi,
		errors: Zi,
		conditions: Qi,
		direction: $i,
		card: ea
	};
})), ra = /* @__PURE__ */ r({
	card: () => la,
	common: () => ia,
	conditions: () => sa,
	default: () => ua,
	direction: () => ca,
	editor: () => aa,
	errors: () => oa
}), ia, aa, oa, sa, ca, la, ua, da = t((() => {
	ia = {
		version: "Версия",
		title: "Почасовая погода",
		title_card: "Карточка почасовой погоды",
		description: "Карточка для отображения почасовых условий погоды в виде полосы.",
		invalid_configuration: "Недопустимая конфигурация"
	}, aa = {
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
	}, oa = {
		missing_entity: "Отсутствует сущность в конфигурации",
		too_many_segments_requested: "Запрошено слишком много сегментов в num_segments. Должно быть <= количества сегментов в сущности прогноза.",
		must_be_int: "Должно быть четным целым числом, большим или равным 2",
		invalid_colors: "Следующие цвета в вашей конфигурации недопустимы:",
		must_be_positive_int: "Должно быть положительным целым числом",
		offset_must_be_positive_int: "Смещение должно быть положительным целым числом",
		forecast_not_available: "Прогноз недоступен",
		check_entity: "Проверьте настроенную сущность прогноза.",
		invalid_value_icon_fill: "icon_fill должен быть либо положительным целым числом, либо одним из значений 'single' или 'full'"
	}, sa = {
		clear: "Ясно",
		cloudy: "Облачно",
		fog: "Туман",
		hail: "Град",
		thunderstorm: "Гроза",
		partlyCloudy: "Частичная облачность",
		heavyRain: "Сильный дождь",
		rain: "Дождь",
		snow: "Снег",
		mixedPrecip: "Смешанные осадки",
		sunny: "Солнечно",
		windy: "Ветрено"
	}, ca = {
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
	}, la = { chance_of_precipitation: "Вероятность осадков: {0}%" }, ua = {
		common: ia,
		editor: aa,
		errors: oa,
		conditions: sa,
		direction: ca,
		card: la
	};
})), fa = /* @__PURE__ */ r({
	card: () => va,
	common: () => pa,
	conditions: () => ga,
	default: () => ya,
	direction: () => _a,
	editor: () => ma,
	errors: () => ha
}), pa, ma, ha, ga, _a, va, ya, ba = t((() => {
	pa = {
		version: "Verzia",
		title: "Hodinové počasie",
		title_card: "Hodinové Weather Card",
		description: "Karta na vykreslenie hodinových poveternostných podmienok ako pruh.",
		invalid_configuration: "Neplatná konfigurácia"
	}, ma = {
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
	}, ha = {
		missing_entity: "v konfigurácii chýba entita",
		too_many_segments_requested: "Príliš veľa segmentov prognózy požadovaných v num_segments. Musí byť <= počet segmentov v entite prognózy.",
		must_be_int: "Musí byť párne celé číslo väčšie alebo rovné 2",
		invalid_colors: "Nasledujúce farby vo vašej konfigurácii sú neplatné:",
		must_be_positive_int: "Musí to byť kladné celé číslo",
		offset_must_be_positive_int: "offset musí byť kladné celé číslo",
		forecast_not_available: "Predpoveď nie je k dispozícii",
		check_entity: "Skontrolujte nakonfigurovanú entitu predpovede.",
		invalid_value_icon_fill: "icon_fill musí byť buď kladné celé číslo alebo jedno z 'single'; alebo 'full';"
	}, ga = {
		clear: "Čisté",
		cloudy: "Zamračené",
		fog: "Hmla",
		hail: "Ľadovec",
		thunderstorm: "Búrka",
		partlyCloudy: "Čiastočne zamračené",
		heavyRain: "Hustý dážď",
		rain: "Dážď",
		snow: "Sneh",
		mixedPrecip: "Zmiešené",
		sunny: "Slnečno",
		windy: "Veterno"
	}, _a = {
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
	}, va = { chance_of_precipitation: "{0}% možnosť zrážok" }, ya = {
		common: pa,
		editor: ma,
		errors: ha,
		conditions: ga,
		direction: _a,
		card: va
	};
})), xa = /* @__PURE__ */ r({
	card: () => Da,
	common: () => Sa,
	conditions: () => Ta,
	default: () => Oa,
	direction: () => Ea,
	editor: () => Ca,
	errors: () => wa
}), Sa, Ca, wa, Ta, Ea, Da, Oa, ka = t((() => {
	Sa = {
		version: "Sürüm",
		title: "Saatlik Hava Durumu",
		title_card: "Saatlik Hava Durumu Kartı",
		description: "Saatlik hava koşullarını çubuk grafik olarak gösteren bir kart.",
		invalid_configuration: "Geçersiz yapılandırma"
	}, Ca = {
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
	}, wa = {
		missing_entity: "Yapılandırmada varlık eksik",
		too_many_segments_requested: "İstenen tahmin dilimi sayısı çok fazla. num_segments değeri, tahmin varlığındaki dilim sayısından fazla olamaz.",
		must_be_int: "2 veya daha büyük çift bir tam sayı olmalı",
		invalid_colors: "Yapılandırmanızdaki geçersiz renkler:",
		must_be_positive_int: "Pozitif bir tam sayı olmalı",
		offset_must_be_positive_int: "offset pozitif bir tam sayı olmalı",
		forecast_not_available: "Tahmin mevcut değil",
		check_entity: "Yapılandırılmış tahmin varlığını kontrol edin.",
		invalid_value_icon_fill: "icon_fill değeri pozitif bir tam sayı ya da 'single' veya 'full' olmalıdır"
	}, Ta = {
		clear: "Açık",
		cloudy: "Bulutlu",
		fog: "Sisli",
		hail: "Dolu",
		thunderstorm: "Gök gürültülü fırtına",
		partlyCloudy: "Parçalı bulutlu",
		heavyRain: "Şiddetli yağmur",
		rain: "Yağmur",
		snow: "Kar",
		mixedPrecip: "Karışık yağış",
		sunny: "Güneşli",
		windy: "Rüzgarlı"
	}, Ea = {
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
	}, Da = { chance_of_precipitation: "%{0} yağış olasılığı" }, Oa = {
		common: Sa,
		editor: Ca,
		errors: wa,
		conditions: Ta,
		direction: Ea,
		card: Da
	};
})), Aa = /* @__PURE__ */ r({
	card: () => Ia,
	common: () => ja,
	conditions: () => Pa,
	default: () => La,
	direction: () => Fa,
	editor: () => Ma,
	errors: () => Na
}), ja, Ma, Na, Pa, Fa, Ia, La, Ra = t((() => {
	ja = {
		version: "Версія",
		title: "Погодинний прогноз погоди",
		title_card: "Картка погодинного прогнозу погоди",
		description: "Картка для відображення погодинних умов погоди у вигляді діаграми.",
		invalid_configuration: "Недійсна конфігурація"
	}, Ma = {
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
	}, Na = {
		missing_entity: "відсутня сутність в конфігурації",
		too_many_segments_requested: "Запитано забагато сегментів прогнозу в num_segments. Має бути <= кількості сегментів в сутності прогнозу.",
		must_be_int: "Має бути парним цілим числом більшим або рівним 2",
		invalid_colors: "Наступні кольори у вашій конфігурації недійсні:",
		must_be_positive_int: "Має бути додатнім цілим числом",
		offset_must_be_positive_int: "offset має бути додатнім цілим числом",
		forecast_not_available: "Прогноз недоступний",
		check_entity: "Перевірте налаштовану сутність прогнозу.",
		invalid_value_icon_fill: "icon_fill має бути додатнім цілим числом або одним з 'single' чи 'full'"
	}, Pa = {
		clear: "Ясно",
		cloudy: "Хмарно",
		fog: "Туман",
		hail: "Град",
		thunderstorm: "Гроза",
		partlyCloudy: "Частково хмарно",
		heavyRain: "Сильний дощ",
		rain: "Дощ",
		snow: "Сніг",
		mixedPrecip: "Змішані опади",
		sunny: "Сонячно",
		windy: "Вітряно"
	}, Fa = {
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
	}, Ia = { chance_of_precipitation: "{0}% ймовірність опадів" }, La = {
		common: ja,
		editor: Ma,
		errors: Na,
		conditions: Pa,
		direction: Fa,
		card: Ia
	};
})), za = /* @__PURE__ */ r({
	card: () => Ga,
	common: () => Ba,
	conditions: () => Ua,
	default: () => Ka,
	direction: () => Wa,
	editor: () => Va,
	errors: () => Ha
}), Ba, Va, Ha, Ua, Wa, Ga, Ka, qa = t((() => {
	Ba = {
		version: "版本",
		title: "逐小时天气",
		title_card: "逐小时天气卡片",
		description: "一个用于显示逐小时天气状况的卡片。",
		invalid_configuration: "无效的配置"
	}, Va = {
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
	}, Ha = {
		missing_entity: "配置中缺少实体",
		too_many_segments_requested: "在num_segments中请求的预测段过多。必须 <= 预测实体中的段数。",
		must_be_int: "必须是大于或等于2的偶数",
		invalid_colors: "配置中的以下颜色无效：",
		must_be_positive_int: "必须是正整数",
		offset_must_be_positive_int: "偏移必须是正整数",
		forecast_not_available: "预测不可用",
		check_entity: "检查配置的预测实体。",
		invalid_value_icon_fill: "icon_fill 必须是正整数,或者是'single'或'full'之一"
	}, Ua = {
		clear: "晴朗",
		cloudy: "多云",
		fog: "雾",
		hail: "冰雹",
		thunderstorm: "雷暴",
		partlyCloudy: "局部多云",
		heavyRain: "大雨",
		rain: "雨",
		snow: "雪",
		mixedPrecip: "雨夹雪",
		sunny: "晴天",
		windy: "有风"
	}, Wa = {
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
	}, Ga = { chance_of_precipitation: "{0}%的降雨概率" }, Ka = {
		common: Ba,
		editor: Va,
		errors: Ha,
		conditions: Ua,
		direction: Wa,
		card: Ga
	};
}));
//#endregion
//#region src/localize/localize.ts
function Ja(e, t) {
	return function(n, r = "", i = "") {
		let a = (e || localStorage.getItem("selectedLanguage") || t || "en").replace(/['"]+/g, "").replace("-", "_"), o;
		try {
			o = n.split(".").reduce((e, t) => e[t], Ya[a]);
		} catch {
			o = n.split(".").reduce((e, t) => e[t], Ya.en);
		}
		return o === void 0 && (o = n.split(".").reduce((e, t) => e[t], Ya.en)), r !== "" && i !== "" && (o = o.replace(r, i)), o;
	};
}
var Ya, Xa = t((() => {
	Rn(), qn(), nr(), dr(), br(), kr(), Rr(), qr(), ni(), di(), bi(), ki(), Ri(), qi(), na(), da(), ba(), ka(), Ra(), qa(), Ya = {
		bg: An,
		cs: zn,
		da: Jn,
		de: rr,
		en: fr,
		es: xr,
		fr: Ar,
		hu: zr,
		it: Jr,
		nb: ri,
		nn_NO: fi,
		nl: xi,
		pl: Ai,
		pt: zi,
		pt_BR: Ji,
		ru: ra,
		sk: fa,
		tr: xa,
		uk: Aa,
		zh: za
	};
}));
Xa(), ot();
var Za = "important", Qa = " !important", $a = on(class extends sn {
	constructor(e) {
		if (super(e), e.type !== an.ATTRIBUTE || e.name !== "style" || e.strings?.length > 2) throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.");
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
				let t = typeof r == "string" && r.endsWith(Qa);
				e.includes("-") || t ? n.setProperty(e, t ? r.slice(0, -11) : r, t ? Za : "") : n[e] = r;
			}
		}
		return U;
	}
}), eo = "bottom", to = "right", no = "left", ro = "auto", io = [
	"top",
	eo,
	to,
	no
], ao = "start", oo = "clippingParents", so = "viewport", co = "popper", lo = "reference", uo = /*#__PURE__*/ io.reduce(function(e, t) {
	return e.concat([t + "-" + ao, t + "-end"]);
}, []), fo = /*#__PURE__*/ [].concat(io, [ro]).reduce(function(e, t) {
	return e.concat([
		t,
		t + "-" + ao,
		t + "-end"
	]);
}, []), po = [
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
function K(e) {
	return e ? (e.nodeName || "").toLowerCase() : null;
}
//#endregion
//#region node_modules/@popperjs/core/lib/dom-utils/getWindow.js
function q(e) {
	if (e == null) return window;
	if (e.toString() !== "[object Window]") {
		var t = e.ownerDocument;
		return t && t.defaultView || window;
	}
	return e;
}
//#endregion
//#region node_modules/@popperjs/core/lib/dom-utils/instanceOf.js
function mo(e) {
	return e instanceof q(e).Element || e instanceof Element;
}
function J(e) {
	return e instanceof q(e).HTMLElement || e instanceof HTMLElement;
}
function ho(e) {
	return typeof ShadowRoot > "u" ? !1 : e instanceof q(e).ShadowRoot || e instanceof ShadowRoot;
}
//#endregion
//#region node_modules/@popperjs/core/lib/modifiers/applyStyles.js
function go(e) {
	var t = e.state;
	Object.keys(t.elements).forEach(function(e) {
		var n = t.styles[e] || {}, r = t.attributes[e] || {}, i = t.elements[e];
		!J(i) || !K(i) || (Object.assign(i.style, n), Object.keys(r).forEach(function(e) {
			var t = r[e];
			t === !1 ? i.removeAttribute(e) : i.setAttribute(e, t === !0 ? "" : t);
		}));
	});
}
function _o(e) {
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
			!J(r) || !K(r) || (Object.assign(r.style, a), Object.keys(i).forEach(function(e) {
				r.removeAttribute(e);
			}));
		});
	};
}
var vo = {
	name: "applyStyles",
	enabled: !0,
	phase: "write",
	fn: go,
	effect: _o,
	requires: ["computeStyles"]
};
//#endregion
//#region node_modules/@popperjs/core/lib/utils/getBasePlacement.js
function Y(e) {
	return e.split("-")[0];
}
//#endregion
//#region node_modules/@popperjs/core/lib/utils/math.js
var yo = Math.max, bo = Math.min, xo = Math.round;
//#endregion
//#region node_modules/@popperjs/core/lib/utils/userAgent.js
function So() {
	var e = navigator.userAgentData;
	return e != null && e.brands && Array.isArray(e.brands) ? e.brands.map(function(e) {
		return e.brand + "/" + e.version;
	}).join(" ") : navigator.userAgent;
}
//#endregion
//#region node_modules/@popperjs/core/lib/dom-utils/isLayoutViewport.js
function Co() {
	return !/^((?!chrome|android).)*safari/i.test(So());
}
//#endregion
//#region node_modules/@popperjs/core/lib/dom-utils/getBoundingClientRect.js
function wo(e, t, n) {
	t === void 0 && (t = !1), n === void 0 && (n = !1);
	var r = e.getBoundingClientRect(), i = 1, a = 1;
	t && J(e) && (i = e.offsetWidth > 0 && xo(r.width) / e.offsetWidth || 1, a = e.offsetHeight > 0 && xo(r.height) / e.offsetHeight || 1);
	var o = (mo(e) ? q(e) : window).visualViewport, s = !Co() && n, c = (r.left + (s && o ? o.offsetLeft : 0)) / i, l = (r.top + (s && o ? o.offsetTop : 0)) / a, u = r.width / i, d = r.height / a;
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
function To(e) {
	var t = wo(e), n = e.offsetWidth, r = e.offsetHeight;
	return Math.abs(t.width - n) <= 1 && (n = t.width), Math.abs(t.height - r) <= 1 && (r = t.height), {
		x: e.offsetLeft,
		y: e.offsetTop,
		width: n,
		height: r
	};
}
//#endregion
//#region node_modules/@popperjs/core/lib/dom-utils/contains.js
function Eo(e, t) {
	var n = t.getRootNode && t.getRootNode();
	if (e.contains(t)) return !0;
	if (n && ho(n)) {
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
function Do(e) {
	return q(e).getComputedStyle(e);
}
//#endregion
//#region node_modules/@popperjs/core/lib/dom-utils/isTableElement.js
function Oo(e) {
	return [
		"table",
		"td",
		"th"
	].indexOf(K(e)) >= 0;
}
//#endregion
//#region node_modules/@popperjs/core/lib/dom-utils/getDocumentElement.js
function ko(e) {
	return ((mo(e) ? e.ownerDocument : e.document) || window.document).documentElement;
}
//#endregion
//#region node_modules/@popperjs/core/lib/dom-utils/getParentNode.js
function Ao(e) {
	return K(e) === "html" ? e : e.assignedSlot || e.parentNode || (ho(e) ? e.host : null) || ko(e);
}
//#endregion
//#region node_modules/@popperjs/core/lib/dom-utils/getOffsetParent.js
function jo(e) {
	return !J(e) || Do(e).position === "fixed" ? null : e.offsetParent;
}
function Mo(e) {
	var t = /firefox/i.test(So());
	if (/Trident/i.test(So()) && J(e) && Do(e).position === "fixed") return null;
	var n = Ao(e);
	for (ho(n) && (n = n.host); J(n) && ["html", "body"].indexOf(K(n)) < 0;) {
		var r = Do(n);
		if (r.transform !== "none" || r.perspective !== "none" || r.contain === "paint" || ["transform", "perspective"].indexOf(r.willChange) !== -1 || t && r.willChange === "filter" || t && r.filter && r.filter !== "none") return n;
		n = n.parentNode;
	}
	return null;
}
function No(e) {
	for (var t = q(e), n = jo(e); n && Oo(n) && Do(n).position === "static";) n = jo(n);
	return n && (K(n) === "html" || K(n) === "body" && Do(n).position === "static") ? t : n || Mo(e) || t;
}
//#endregion
//#region node_modules/@popperjs/core/lib/utils/getMainAxisFromPlacement.js
function Po(e) {
	return ["top", "bottom"].indexOf(e) >= 0 ? "x" : "y";
}
//#endregion
//#region node_modules/@popperjs/core/lib/utils/within.js
function Fo(e, t, n) {
	return yo(e, bo(t, n));
}
function Io(e, t, n) {
	var r = Fo(e, t, n);
	return r > n ? n : r;
}
//#endregion
//#region node_modules/@popperjs/core/lib/utils/getFreshSideObject.js
function Lo() {
	return {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0
	};
}
//#endregion
//#region node_modules/@popperjs/core/lib/utils/mergePaddingObject.js
function Ro(e) {
	return Object.assign({}, Lo(), e);
}
//#endregion
//#region node_modules/@popperjs/core/lib/utils/expandToHashMap.js
function zo(e, t) {
	return t.reduce(function(t, n) {
		return t[n] = e, t;
	}, {});
}
//#endregion
//#region node_modules/@popperjs/core/lib/modifiers/arrow.js
var Bo = function(e, t) {
	return e = typeof e == "function" ? e(Object.assign({}, t.rects, { placement: t.placement })) : e, Ro(typeof e == "number" ? zo(e, io) : e);
};
function Vo(e) {
	var t, n = e.state, r = e.name, i = e.options, a = n.elements.arrow, o = n.modifiersData.popperOffsets, s = Y(n.placement), c = Po(s), l = ["left", "right"].indexOf(s) >= 0 ? "height" : "width";
	if (!(!a || !o)) {
		var u = Bo(i.padding, n), d = To(a), f = c === "y" ? "top" : no, p = c === "y" ? eo : to, m = n.rects.reference[l] + n.rects.reference[c] - o[c] - n.rects.popper[l], h = o[c] - n.rects.reference[c], g = No(a), _ = g ? c === "y" ? g.clientHeight || 0 : g.clientWidth || 0 : 0, v = m / 2 - h / 2, y = u[f], b = _ - d[l] - u[p], x = _ / 2 - d[l] / 2 + v, S = Fo(y, x, b), C = c;
		n.modifiersData[r] = (t = {}, t[C] = S, t.centerOffset = S - x, t);
	}
}
function Ho(e) {
	var t = e.state, n = e.options.element, r = n === void 0 ? "[data-popper-arrow]" : n;
	r != null && (typeof r == "string" && (r = t.elements.popper.querySelector(r), !r) || Eo(t.elements.popper, r) && (t.elements.arrow = r));
}
var Uo = {
	name: "arrow",
	enabled: !0,
	phase: "main",
	fn: Vo,
	effect: Ho,
	requires: ["popperOffsets"],
	requiresIfExists: ["preventOverflow"]
};
//#endregion
//#region node_modules/@popperjs/core/lib/utils/getVariation.js
function Wo(e) {
	return e.split("-")[1];
}
//#endregion
//#region node_modules/@popperjs/core/lib/modifiers/computeStyles.js
var Go = {
	top: "auto",
	right: "auto",
	bottom: "auto",
	left: "auto"
};
function Ko(e, t) {
	var n = e.x, r = e.y, i = t.devicePixelRatio || 1;
	return {
		x: xo(n * i) / i || 0,
		y: xo(r * i) / i || 0
	};
}
function qo(e) {
	var t, n = e.popper, r = e.popperRect, i = e.placement, a = e.variation, o = e.offsets, s = e.position, c = e.gpuAcceleration, l = e.adaptive, u = e.roundOffsets, d = e.isFixed, f = o.x, p = f === void 0 ? 0 : f, m = o.y, h = m === void 0 ? 0 : m, g = typeof u == "function" ? u({
		x: p,
		y: h
	}) : {
		x: p,
		y: h
	};
	p = g.x, h = g.y;
	var _ = o.hasOwnProperty("x"), v = o.hasOwnProperty("y"), y = no, b = "top", x = window;
	if (l) {
		var S = No(n), C = "clientHeight", w = "clientWidth";
		if (S === q(n) && (S = ko(n), Do(S).position !== "static" && s === "absolute" && (C = "scrollHeight", w = "scrollWidth")), S = S, i === "top" || (i === "left" || i === "right") && a === "end") {
			b = eo;
			var T = d && S === x && x.visualViewport ? x.visualViewport.height : S[C];
			h -= T - r.height, h *= c ? 1 : -1;
		}
		if (i === "left" || (i === "top" || i === "bottom") && a === "end") {
			y = to;
			var E = d && S === x && x.visualViewport ? x.visualViewport.width : S[w];
			p -= E - r.width, p *= c ? 1 : -1;
		}
	}
	var D = Object.assign({ position: s }, l && Go), O = u === !0 ? Ko({
		x: p,
		y: h
	}, q(n)) : {
		x: p,
		y: h
	};
	if (p = O.x, h = O.y, c) {
		var k;
		return Object.assign({}, D, (k = {}, k[b] = v ? "0" : "", k[y] = _ ? "0" : "", k.transform = (x.devicePixelRatio || 1) <= 1 ? "translate(" + p + "px, " + h + "px)" : "translate3d(" + p + "px, " + h + "px, 0)", k));
	}
	return Object.assign({}, D, (t = {}, t[b] = v ? h + "px" : "", t[y] = _ ? p + "px" : "", t.transform = "", t));
}
function Jo(e) {
	var t = e.state, n = e.options, r = n.gpuAcceleration, i = r === void 0 || r, a = n.adaptive, o = a === void 0 || a, s = n.roundOffsets, c = s === void 0 || s, l = {
		placement: Y(t.placement),
		variation: Wo(t.placement),
		popper: t.elements.popper,
		popperRect: t.rects.popper,
		gpuAcceleration: i,
		isFixed: t.options.strategy === "fixed"
	};
	t.modifiersData.popperOffsets != null && (t.styles.popper = Object.assign({}, t.styles.popper, qo(Object.assign({}, l, {
		offsets: t.modifiersData.popperOffsets,
		position: t.options.strategy,
		adaptive: o,
		roundOffsets: c
	})))), t.modifiersData.arrow != null && (t.styles.arrow = Object.assign({}, t.styles.arrow, qo(Object.assign({}, l, {
		offsets: t.modifiersData.arrow,
		position: "absolute",
		adaptive: !1,
		roundOffsets: c
	})))), t.attributes.popper = Object.assign({}, t.attributes.popper, { "data-popper-placement": t.placement });
}
var Yo = {
	name: "computeStyles",
	enabled: !0,
	phase: "beforeWrite",
	fn: Jo,
	data: {}
}, Xo = { passive: !0 };
function Zo(e) {
	var t = e.state, n = e.instance, r = e.options, i = r.scroll, a = i === void 0 || i, o = r.resize, s = o === void 0 || o, c = q(t.elements.popper), l = [].concat(t.scrollParents.reference, t.scrollParents.popper);
	return a && l.forEach(function(e) {
		e.addEventListener("scroll", n.update, Xo);
	}), s && c.addEventListener("resize", n.update, Xo), function() {
		a && l.forEach(function(e) {
			e.removeEventListener("scroll", n.update, Xo);
		}), s && c.removeEventListener("resize", n.update, Xo);
	};
}
var Qo = {
	name: "eventListeners",
	enabled: !0,
	phase: "write",
	fn: function() {},
	effect: Zo,
	data: {}
}, $o = {
	left: "right",
	right: "left",
	bottom: "top",
	top: "bottom"
};
function es(e) {
	return e.replace(/left|right|bottom|top/g, function(e) {
		return $o[e];
	});
}
//#endregion
//#region node_modules/@popperjs/core/lib/utils/getOppositeVariationPlacement.js
var ts = {
	start: "end",
	end: "start"
};
function ns(e) {
	return e.replace(/start|end/g, function(e) {
		return ts[e];
	});
}
//#endregion
//#region node_modules/@popperjs/core/lib/dom-utils/getWindowScroll.js
function rs(e) {
	var t = q(e);
	return {
		scrollLeft: t.pageXOffset,
		scrollTop: t.pageYOffset
	};
}
//#endregion
//#region node_modules/@popperjs/core/lib/dom-utils/getWindowScrollBarX.js
function is(e) {
	return wo(ko(e)).left + rs(e).scrollLeft;
}
//#endregion
//#region node_modules/@popperjs/core/lib/dom-utils/getViewportRect.js
function as(e, t) {
	var n = q(e), r = ko(e), i = n.visualViewport, a = r.clientWidth, o = r.clientHeight, s = 0, c = 0;
	if (i) {
		a = i.width, o = i.height;
		var l = Co();
		(l || !l && t === "fixed") && (s = i.offsetLeft, c = i.offsetTop);
	}
	return {
		width: a,
		height: o,
		x: s + is(e),
		y: c
	};
}
//#endregion
//#region node_modules/@popperjs/core/lib/dom-utils/getDocumentRect.js
function os(e) {
	var t = ko(e), n = rs(e), r = e.ownerDocument?.body, i = yo(t.scrollWidth, t.clientWidth, r ? r.scrollWidth : 0, r ? r.clientWidth : 0), a = yo(t.scrollHeight, t.clientHeight, r ? r.scrollHeight : 0, r ? r.clientHeight : 0), o = -n.scrollLeft + is(e), s = -n.scrollTop;
	return Do(r || t).direction === "rtl" && (o += yo(t.clientWidth, r ? r.clientWidth : 0) - i), {
		width: i,
		height: a,
		x: o,
		y: s
	};
}
//#endregion
//#region node_modules/@popperjs/core/lib/dom-utils/isScrollParent.js
function ss(e) {
	var t = Do(e), n = t.overflow, r = t.overflowX, i = t.overflowY;
	return /auto|scroll|overlay|hidden/.test(n + i + r);
}
//#endregion
//#region node_modules/@popperjs/core/lib/dom-utils/getScrollParent.js
function cs(e) {
	return [
		"html",
		"body",
		"#document"
	].indexOf(K(e)) >= 0 ? e.ownerDocument.body : J(e) && ss(e) ? e : cs(Ao(e));
}
//#endregion
//#region node_modules/@popperjs/core/lib/dom-utils/listScrollParents.js
function ls(e, t) {
	t === void 0 && (t = []);
	var n = cs(e), r = n === e.ownerDocument?.body, i = q(n), a = r ? [i].concat(i.visualViewport || [], ss(n) ? n : []) : n, o = t.concat(a);
	return r ? o : o.concat(ls(Ao(a)));
}
//#endregion
//#region node_modules/@popperjs/core/lib/utils/rectToClientRect.js
function us(e) {
	return Object.assign({}, e, {
		left: e.x,
		top: e.y,
		right: e.x + e.width,
		bottom: e.y + e.height
	});
}
//#endregion
//#region node_modules/@popperjs/core/lib/dom-utils/getClippingRect.js
function ds(e, t) {
	var n = wo(e, !1, t === "fixed");
	return n.top += e.clientTop, n.left += e.clientLeft, n.bottom = n.top + e.clientHeight, n.right = n.left + e.clientWidth, n.width = e.clientWidth, n.height = e.clientHeight, n.x = n.left, n.y = n.top, n;
}
function fs(e, t, n) {
	return t === "viewport" ? us(as(e, n)) : mo(t) ? ds(t, n) : us(os(ko(e)));
}
function ps(e) {
	var t = ls(Ao(e)), n = ["absolute", "fixed"].indexOf(Do(e).position) >= 0 && J(e) ? No(e) : e;
	return mo(n) ? t.filter(function(e) {
		return mo(e) && Eo(e, n) && K(e) !== "body";
	}) : [];
}
function ms(e, t, n, r) {
	var i = t === "clippingParents" ? ps(e) : [].concat(t), a = [].concat(i, [n]), o = a[0], s = a.reduce(function(t, n) {
		var i = fs(e, n, r);
		return t.top = yo(i.top, t.top), t.right = bo(i.right, t.right), t.bottom = bo(i.bottom, t.bottom), t.left = yo(i.left, t.left), t;
	}, fs(e, o, r));
	return s.width = s.right - s.left, s.height = s.bottom - s.top, s.x = s.left, s.y = s.top, s;
}
//#endregion
//#region node_modules/@popperjs/core/lib/utils/computeOffsets.js
function hs(e) {
	var t = e.reference, n = e.element, r = e.placement, i = r ? Y(r) : null, a = r ? Wo(r) : null, o = t.x + t.width / 2 - n.width / 2, s = t.y + t.height / 2 - n.height / 2, c;
	switch (i) {
		case "top":
			c = {
				x: o,
				y: t.y - n.height
			};
			break;
		case eo:
			c = {
				x: o,
				y: t.y + t.height
			};
			break;
		case to:
			c = {
				x: t.x + t.width,
				y: s
			};
			break;
		case no:
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
	var l = i ? Po(i) : null;
	if (l != null) {
		var u = l === "y" ? "height" : "width";
		switch (a) {
			case ao:
				c[l] = c[l] - (t[u] / 2 - n[u] / 2);
				break;
			case "end": c[l] = c[l] + (t[u] / 2 - n[u] / 2);
		}
	}
	return c;
}
//#endregion
//#region node_modules/@popperjs/core/lib/utils/detectOverflow.js
function gs(e, t) {
	t === void 0 && (t = {});
	var n = t, r = n.placement, i = r === void 0 ? e.placement : r, a = n.strategy, o = a === void 0 ? e.strategy : a, s = n.boundary, c = s === void 0 ? oo : s, l = n.rootBoundary, u = l === void 0 ? so : l, d = n.elementContext, f = d === void 0 ? co : d, p = n.altBoundary, m = p !== void 0 && p, h = n.padding, g = h === void 0 ? 0 : h, _ = Ro(typeof g == "number" ? zo(g, io) : g), v = f === "popper" ? lo : co, y = e.rects.popper, b = e.elements[m ? v : f], x = ms(mo(b) ? b : b.contextElement || ko(e.elements.popper), c, u, o), S = wo(e.elements.reference), C = hs({
		reference: S,
		element: y,
		strategy: "absolute",
		placement: i
	}), w = us(Object.assign({}, y, C)), T = f === "popper" ? w : S, E = {
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
function _s(e, t) {
	t === void 0 && (t = {});
	var n = t, r = n.placement, i = n.boundary, a = n.rootBoundary, o = n.padding, s = n.flipVariations, c = n.allowedAutoPlacements, l = c === void 0 ? fo : c, u = Wo(r), d = u ? s ? uo : uo.filter(function(e) {
		return Wo(e) === u;
	}) : io, f = d.filter(function(e) {
		return l.indexOf(e) >= 0;
	});
	f.length === 0 && (f = d);
	var p = f.reduce(function(t, n) {
		return t[n] = gs(e, {
			placement: n,
			boundary: i,
			rootBoundary: a,
			padding: o
		})[Y(n)], t;
	}, {});
	return Object.keys(p).sort(function(e, t) {
		return p[e] - p[t];
	});
}
//#endregion
//#region node_modules/@popperjs/core/lib/modifiers/flip.js
function vs(e) {
	if (Y(e) === "auto") return [];
	var t = es(e);
	return [
		ns(e),
		t,
		ns(t)
	];
}
function ys(e) {
	var t = e.state, n = e.options, r = e.name;
	if (!t.modifiersData[r]._skip) {
		for (var i = n.mainAxis, a = i === void 0 || i, o = n.altAxis, s = o === void 0 || o, c = n.fallbackPlacements, l = n.padding, u = n.boundary, d = n.rootBoundary, f = n.altBoundary, p = n.flipVariations, m = p === void 0 || p, h = n.allowedAutoPlacements, g = t.options.placement, _ = Y(g) === g, v = c || (_ || !m ? [es(g)] : vs(g)), y = [g].concat(v).reduce(function(e, n) {
			return e.concat(Y(n) === "auto" ? _s(t, {
				placement: n,
				boundary: u,
				rootBoundary: d,
				padding: l,
				flipVariations: m,
				allowedAutoPlacements: h
			}) : n);
		}, []), b = t.rects.reference, x = t.rects.popper, S = /* @__PURE__ */ new Map(), C = !0, w = y[0], T = 0; T < y.length; T++) {
			var E = y[T], D = Y(E), O = Wo(E) === ao, k = ["top", eo].indexOf(D) >= 0, A = k ? "width" : "height", j = gs(t, {
				placement: E,
				boundary: u,
				rootBoundary: d,
				altBoundary: f,
				padding: l
			}), M = k ? O ? to : no : O ? eo : "top";
			b[A] > x[A] && (M = es(M));
			var N = es(M), ee = [];
			if (a && ee.push(j[D] <= 0), s && ee.push(j[M] <= 0, j[N] <= 0), ee.every(function(e) {
				return e;
			})) {
				w = E, C = !1;
				break;
			}
			S.set(E, ee);
		}
		if (C) for (var P = m ? 3 : 1, te = function(e) {
			var t = y.find(function(t) {
				var n = S.get(t);
				if (n) return n.slice(0, e).every(function(e) {
					return e;
				});
			});
			if (t) return w = t, "break";
		}, F = P; F > 0 && te(F) !== "break"; F--);
		t.placement !== w && (t.modifiersData[r]._skip = !0, t.placement = w, t.reset = !0);
	}
}
var bs = {
	name: "flip",
	enabled: !0,
	phase: "main",
	fn: ys,
	requiresIfExists: ["offset"],
	data: { _skip: !1 }
};
//#endregion
//#region node_modules/@popperjs/core/lib/modifiers/hide.js
function xs(e, t, n) {
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
function Ss(e) {
	return [
		"top",
		to,
		eo,
		no
	].some(function(t) {
		return e[t] >= 0;
	});
}
function Cs(e) {
	var t = e.state, n = e.name, r = t.rects.reference, i = t.rects.popper, a = t.modifiersData.preventOverflow, o = gs(t, { elementContext: "reference" }), s = gs(t, { altBoundary: !0 }), c = xs(o, r), l = xs(s, i, a), u = Ss(c), d = Ss(l);
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
var ws = {
	name: "hide",
	enabled: !0,
	phase: "main",
	requiresIfExists: ["preventOverflow"],
	fn: Cs
};
//#endregion
//#region node_modules/@popperjs/core/lib/modifiers/offset.js
function Ts(e, t, n) {
	var r = Y(e), i = ["left", "top"].indexOf(r) >= 0 ? -1 : 1, a = typeof n == "function" ? n(Object.assign({}, t, { placement: e })) : n, o = a[0], s = a[1];
	return o = o || 0, s = (s || 0) * i, ["left", "right"].indexOf(r) >= 0 ? {
		x: s,
		y: o
	} : {
		x: o,
		y: s
	};
}
function Es(e) {
	var t = e.state, n = e.options, r = e.name, i = n.offset, a = i === void 0 ? [0, 0] : i, o = fo.reduce(function(e, n) {
		return e[n] = Ts(n, t.rects, a), e;
	}, {}), s = o[t.placement], c = s.x, l = s.y;
	t.modifiersData.popperOffsets != null && (t.modifiersData.popperOffsets.x += c, t.modifiersData.popperOffsets.y += l), t.modifiersData[r] = o;
}
var Ds = {
	name: "offset",
	enabled: !0,
	phase: "main",
	requires: ["popperOffsets"],
	fn: Es
};
//#endregion
//#region node_modules/@popperjs/core/lib/modifiers/popperOffsets.js
function Os(e) {
	var t = e.state, n = e.name;
	t.modifiersData[n] = hs({
		reference: t.rects.reference,
		element: t.rects.popper,
		strategy: "absolute",
		placement: t.placement
	});
}
var ks = {
	name: "popperOffsets",
	enabled: !0,
	phase: "read",
	fn: Os,
	data: {}
};
//#endregion
//#region node_modules/@popperjs/core/lib/utils/getAltAxis.js
function As(e) {
	return e === "x" ? "y" : "x";
}
//#endregion
//#region node_modules/@popperjs/core/lib/modifiers/preventOverflow.js
function js(e) {
	var t = e.state, n = e.options, r = e.name, i = n.mainAxis, a = i === void 0 || i, o = n.altAxis, s = o !== void 0 && o, c = n.boundary, l = n.rootBoundary, u = n.altBoundary, d = n.padding, f = n.tether, p = f === void 0 || f, m = n.tetherOffset, h = m === void 0 ? 0 : m, g = gs(t, {
		boundary: c,
		rootBoundary: l,
		padding: d,
		altBoundary: u
	}), _ = Y(t.placement), v = Wo(t.placement), y = !v, b = Po(_), x = As(b), S = t.modifiersData.popperOffsets, C = t.rects.reference, w = t.rects.popper, T = typeof h == "function" ? h(Object.assign({}, t.rects, { placement: t.placement })) : h, E = typeof T == "number" ? {
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
			var k = b === "y" ? "top" : no, A = b === "y" ? eo : to, j = b === "y" ? "height" : "width", M = S[b], N = M + g[k], ee = M - g[A], P = p ? -w[j] / 2 : 0, te = v === "start" ? C[j] : w[j], F = v === "start" ? -w[j] : -C[j], I = t.elements.arrow, ne = p && I ? To(I) : {
				width: 0,
				height: 0
			}, re = t.modifiersData["arrow#persistent"] ? t.modifiersData["arrow#persistent"].padding : Lo(), ie = re[k], ae = re[A], oe = Fo(0, C[j], ne[j]), se = y ? C[j] / 2 - P - oe - ie - E.mainAxis : te - oe - ie - E.mainAxis, L = y ? -C[j] / 2 + P + oe + ae + E.mainAxis : F + oe + ae + E.mainAxis, ce = t.elements.arrow && No(t.elements.arrow), le = ce ? b === "y" ? ce.clientTop || 0 : ce.clientLeft || 0 : 0, ue = D?.[b] ?? 0, de = M + se - ue - le, fe = M + L - ue, pe = Fo(p ? bo(N, de) : N, M, p ? yo(ee, fe) : ee);
			S[b] = pe, O[b] = pe - M;
		}
		if (s) {
			var me = b === "x" ? "top" : no, he = b === "x" ? eo : to, R = S[x], ge = x === "y" ? "height" : "width", _e = R + g[me], ve = R - g[he], z = ["top", no].indexOf(_) !== -1, ye = D?.[x] ?? 0, be = z ? _e : R - C[ge] - w[ge] - ye + E.altAxis, xe = z ? R + C[ge] + w[ge] - ye - E.altAxis : ve, Se = p && z ? Io(be, R, xe) : Fo(p ? be : _e, R, p ? xe : ve);
			S[x] = Se, O[x] = Se - R;
		}
		t.modifiersData[r] = O;
	}
}
var Ms = {
	name: "preventOverflow",
	enabled: !0,
	phase: "main",
	fn: js,
	requiresIfExists: ["offset"]
};
//#endregion
//#region node_modules/@popperjs/core/lib/dom-utils/getHTMLElementScroll.js
function Ns(e) {
	return {
		scrollLeft: e.scrollLeft,
		scrollTop: e.scrollTop
	};
}
//#endregion
//#region node_modules/@popperjs/core/lib/dom-utils/getNodeScroll.js
function Ps(e) {
	return e === q(e) || !J(e) ? rs(e) : Ns(e);
}
//#endregion
//#region node_modules/@popperjs/core/lib/dom-utils/getCompositeRect.js
function Fs(e) {
	var t = e.getBoundingClientRect(), n = xo(t.width) / e.offsetWidth || 1, r = xo(t.height) / e.offsetHeight || 1;
	return n !== 1 || r !== 1;
}
function Is(e, t, n) {
	n === void 0 && (n = !1);
	var r = J(t), i = J(t) && Fs(t), a = ko(t), o = wo(e, i, n), s = {
		scrollLeft: 0,
		scrollTop: 0
	}, c = {
		x: 0,
		y: 0
	};
	return (r || !r && !n) && ((K(t) !== "body" || ss(a)) && (s = Ps(t)), J(t) ? (c = wo(t, !0), c.x += t.clientLeft, c.y += t.clientTop) : a && (c.x = is(a))), {
		x: o.left + s.scrollLeft - c.x,
		y: o.top + s.scrollTop - c.y,
		width: o.width,
		height: o.height
	};
}
//#endregion
//#region node_modules/@popperjs/core/lib/utils/orderModifiers.js
function Ls(e) {
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
function Rs(e) {
	var t = Ls(e);
	return po.reduce(function(e, n) {
		return e.concat(t.filter(function(e) {
			return e.phase === n;
		}));
	}, []);
}
//#endregion
//#region node_modules/@popperjs/core/lib/utils/debounce.js
function zs(e) {
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
function Bs(e) {
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
var Vs = {
	placement: "bottom",
	modifiers: [],
	strategy: "absolute"
};
function Hs() {
	return ![...arguments].some(function(e) {
		return !(e && typeof e.getBoundingClientRect == "function");
	});
}
function Us(e) {
	e === void 0 && (e = {});
	var t = e, n = t.defaultModifiers, r = n === void 0 ? [] : n, i = t.defaultOptions, a = i === void 0 ? Vs : i;
	return function(e, t, n) {
		n === void 0 && (n = a);
		var i = {
			placement: "bottom",
			orderedModifiers: [],
			options: Object.assign({}, Vs, a),
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
					reference: mo(e) ? ls(e) : e.contextElement ? ls(e.contextElement) : [],
					popper: ls(t)
				};
				var s = Rs(Bs([].concat(r, i.options.modifiers)));
				return i.orderedModifiers = s.filter(function(e) {
					return e.enabled;
				}), l(), c.update();
			},
			forceUpdate: function() {
				if (!s) {
					var e = i.elements, t = e.reference, n = e.popper;
					if (Hs(t, n)) {
						i.rects = {
							reference: Is(t, No(n), i.options.strategy === "fixed"),
							popper: To(n)
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
			update: zs(function() {
				return new Promise(function(e) {
					c.forceUpdate(), e(i);
				});
			}),
			destroy: function() {
				u(), s = !0;
			}
		};
		if (!Hs(e, t)) return c;
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
var Ws = /*#__PURE__*/ Us({ defaultModifiers: [
	Qo,
	ks,
	Yo,
	vo,
	Ds,
	bs,
	Ms,
	Uo,
	ws
] }), Gs = "tippy-box", Ks = "tippy-content", qs = "tippy-backdrop", Js = "tippy-arrow", Ys = "tippy-svg-arrow", Xs = {
	passive: !0,
	capture: !0
}, Zs = function() {
	return document.body;
};
function Qs(e, t, n) {
	return Array.isArray(e) ? e[t] ?? (Array.isArray(n) ? n[t] : n) : e;
}
function $s(e, t) {
	var n = {}.toString.call(e);
	return n.indexOf("[object") === 0 && n.indexOf(t + "]") > -1;
}
function ec(e, t) {
	return typeof e == "function" ? e.apply(void 0, t) : e;
}
function tc(e, t) {
	if (t === 0) return e;
	var n;
	return function(r) {
		clearTimeout(n), n = setTimeout(function() {
			e(r);
		}, t);
	};
}
function nc(e) {
	return e.split(/\s+/).filter(Boolean);
}
function rc(e) {
	return [].concat(e);
}
function ic(e, t) {
	e.indexOf(t) === -1 && e.push(t);
}
function ac(e) {
	return e.filter(function(t, n) {
		return e.indexOf(t) === n;
	});
}
function oc(e) {
	return e.split("-")[0];
}
function sc(e) {
	return [].slice.call(e);
}
function cc(e) {
	return Object.keys(e).reduce(function(t, n) {
		return e[n] !== void 0 && (t[n] = e[n]), t;
	}, {});
}
function lc() {
	return document.createElement("div");
}
function uc(e) {
	return ["Element", "Fragment"].some(function(t) {
		return $s(e, t);
	});
}
function dc(e) {
	return $s(e, "NodeList");
}
function fc(e) {
	return $s(e, "MouseEvent");
}
function pc(e) {
	return !!(e && e._tippy && e._tippy.reference === e);
}
function mc(e) {
	return uc(e) ? [e] : dc(e) ? sc(e) : Array.isArray(e) ? e : sc(document.querySelectorAll(e));
}
function hc(e, t) {
	e.forEach(function(e) {
		e && (e.style.transitionDuration = t + "ms");
	});
}
function gc(e, t) {
	e.forEach(function(e) {
		e && e.setAttribute("data-state", t);
	});
}
function _c(e) {
	var t, n = rc(e)[0];
	return n != null && (t = n.ownerDocument) != null && t.body ? n.ownerDocument : document;
}
function vc(e, t) {
	var n = t.clientX, r = t.clientY;
	return e.every(function(e) {
		var t = e.popperRect, i = e.popperState, a = e.props.interactiveBorder, o = oc(i.placement), s = i.modifiersData.offset;
		if (!s) return !0;
		var c = o === "bottom" ? s.top.y : 0, l = o === "top" ? s.bottom.y : 0, u = o === "right" ? s.left.x : 0, d = o === "left" ? s.right.x : 0, f = t.top - r + c > a, p = r - t.bottom - l > a, m = t.left - n + u > a, h = n - t.right - d > a;
		return f || p || m || h;
	});
}
function yc(e, t, n) {
	var r = t + "EventListener";
	["transitionend", "webkitTransitionEnd"].forEach(function(t) {
		e[r](t, n);
	});
}
function bc(e, t) {
	for (var n = t; n;) {
		if (e.contains(n)) return !0;
		n = n.getRootNode == null ? void 0 : n.getRootNode()?.host;
	}
	return !1;
}
var X = { isTouch: !1 }, xc = 0;
function Sc() {
	X.isTouch || (X.isTouch = !0, window.performance && document.addEventListener("mousemove", Cc));
}
function Cc() {
	var e = performance.now();
	e - xc < 20 && (X.isTouch = !1, document.removeEventListener("mousemove", Cc)), xc = e;
}
function wc() {
	var e = document.activeElement;
	if (pc(e)) {
		var t = e._tippy;
		e.blur && !t.state.isVisible && e.blur();
	}
}
function Tc() {
	document.addEventListener("touchstart", Sc, Xs), window.addEventListener("blur", wc);
}
var Ec = typeof window < "u" && typeof document < "u" && !!window.msCrypto, Z = Object.assign({
	appendTo: Zs,
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
}), Dc = Object.keys(Z), Oc = function(e) {
	Object.keys(e).forEach(function(t) {
		Z[t] = e[t];
	});
};
function kc(e) {
	var t = (e.plugins || []).reduce(function(t, n) {
		var r = n.name, i = n.defaultValue;
		return r && (t[r] = e[r] === void 0 ? Z[r] ?? i : e[r]), t;
	}, {});
	return Object.assign({}, e, t);
}
function Ac(e, t) {
	return (t ? Object.keys(kc(Object.assign({}, Z, { plugins: t }))) : Dc).reduce(function(t, n) {
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
function jc(e, t) {
	var n = Object.assign({}, t, { content: ec(t.content, [e]) }, t.ignoreAttributes ? {} : Ac(e, t.plugins));
	return n.aria = Object.assign({}, Z.aria, n.aria), n.aria = {
		expanded: n.aria.expanded === "auto" ? t.interactive : n.aria.expanded,
		content: n.aria.content === "auto" ? t.interactive ? null : "describedby" : n.aria.content
	}, n;
}
var Mc = function() {
	return "innerHTML";
};
function Nc(e, t) {
	e[Mc()] = t;
}
function Pc(e) {
	var t = lc();
	return e === !0 ? t.className = Js : (t.className = Ys, uc(e) ? t.appendChild(e) : Nc(t, e)), t;
}
function Fc(e, t) {
	uc(t.content) ? (Nc(e, ""), e.appendChild(t.content)) : typeof t.content != "function" && (t.allowHTML ? Nc(e, t.content) : e.textContent = t.content);
}
function Ic(e) {
	var t = e.firstElementChild, n = sc(t.children);
	return {
		box: t,
		content: n.find(function(e) {
			return e.classList.contains(Ks);
		}),
		arrow: n.find(function(e) {
			return e.classList.contains(Js) || e.classList.contains(Ys);
		}),
		backdrop: n.find(function(e) {
			return e.classList.contains(qs);
		})
	};
}
function Lc(e) {
	var t = lc(), n = lc();
	n.className = Gs, n.setAttribute("data-state", "hidden"), n.setAttribute("tabindex", "-1");
	var r = lc();
	r.className = Ks, r.setAttribute("data-state", "hidden"), Fc(r, e.props), t.appendChild(n), n.appendChild(r), i(e.props, e.props);
	function i(n, r) {
		var i = Ic(t), a = i.box, o = i.content, s = i.arrow;
		r.theme ? a.setAttribute("data-theme", r.theme) : a.removeAttribute("data-theme"), typeof r.animation == "string" ? a.setAttribute("data-animation", r.animation) : a.removeAttribute("data-animation"), r.inertia ? a.setAttribute("data-inertia", "") : a.removeAttribute("data-inertia"), a.style.maxWidth = typeof r.maxWidth == "number" ? r.maxWidth + "px" : r.maxWidth, r.role ? a.setAttribute("role", r.role) : a.removeAttribute("role"), (n.content !== r.content || n.allowHTML !== r.allowHTML) && Fc(o, e.props), r.arrow ? s ? n.arrow !== r.arrow && (a.removeChild(s), a.appendChild(Pc(r.arrow))) : a.appendChild(Pc(r.arrow)) : s && a.removeChild(s);
	}
	return {
		popper: t,
		onUpdate: i
	};
}
Lc.$$tippy = !0;
var Rc = 1, zc = [], Bc = [];
function Vc(e, t) {
	var n = jc(e, Object.assign({}, Z, kc(cc(t)))), r, i, a, o = !1, s = !1, c = !1, l = !1, u, d, f, p = [], m = tc(de, n.interactiveDebounce), h, g = Rc++, _ = null, v = ac(n.plugins), y = {
		id: g,
		reference: e,
		popper: lc(),
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
		clearDelayTimeouts: xe,
		setProps: Se,
		setContent: Ce,
		show: we,
		hide: Te,
		hideWithInteractivity: Ee,
		enable: ye,
		disable: be,
		unmount: De,
		destroy: Oe
	};
	/* istanbul ignore if */
	if (!n.render) return y;
	var b = n.render(y), x = b.popper, S = b.onUpdate;
	x.setAttribute("data-tippy-root", ""), x.id = "tippy-" + y.id, y.popper = x, e._tippy = y, x._tippy = y;
	var C = v.map(function(e) {
		return e.fn(y);
	}), w = e.hasAttribute("aria-expanded");
	return ce(), P(), M(), N("onCreate", [y]), n.showOnCreate && ve(), x.addEventListener("mouseenter", function() {
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
		return e ? _c(e) : document;
	}
	function A() {
		return Ic(x);
	}
	function j(e) {
		return y.state.isMounted && !y.state.isVisible || X.isTouch || u && u.type === "focus" ? 0 : Qs(y.props.delay, +!e, Z.delay);
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
	function ee() {
		var t = y.props.aria;
		if (t.content) {
			var n = "aria-" + t.content, r = x.id;
			rc(y.props.triggerTarget || e).forEach(function(e) {
				var t = e.getAttribute(n);
				if (y.state.isVisible) e.setAttribute(n, t ? t + " " + r : r);
				else {
					var i = t && t.replace(r, "").trim();
					i ? e.setAttribute(n, i) : e.removeAttribute(n);
				}
			});
		}
	}
	function P() {
		w || !y.props.aria.expanded || rc(y.props.triggerTarget || e).forEach(function(e) {
			y.props.interactive ? e.setAttribute("aria-expanded", y.state.isVisible && e === O() ? "true" : "false") : e.removeAttribute("aria-expanded");
		});
	}
	function te() {
		k().removeEventListener("mousemove", m), zc = zc.filter(function(e) {
			return e !== m;
		});
	}
	function F(t) {
		if (!(X.isTouch && (c || t.type === "mousedown"))) {
			var n = t.composedPath && t.composedPath()[0] || t.target;
			if (!(y.props.interactive && bc(x, n))) {
				if (rc(y.props.triggerTarget || e).some(function(e) {
					return bc(e, n);
				})) {
					if (X.isTouch || y.state.isVisible && y.props.trigger.indexOf("click") >= 0) return;
				} else N("onClickOutside", [y, t]);
				y.props.hideOnClick === !0 && (y.clearDelayTimeouts(), y.hide(), s = !0, setTimeout(function() {
					s = !1;
				}), y.state.isMounted || ie());
			}
		}
	}
	function I() {
		c = !0;
	}
	function ne() {
		c = !1;
	}
	function re() {
		var e = k();
		e.addEventListener("mousedown", F, !0), e.addEventListener("touchend", F, Xs), e.addEventListener("touchstart", ne, Xs), e.addEventListener("touchmove", I, Xs);
	}
	function ie() {
		var e = k();
		e.removeEventListener("mousedown", F, !0), e.removeEventListener("touchend", F, Xs), e.removeEventListener("touchstart", ne, Xs), e.removeEventListener("touchmove", I, Xs);
	}
	function ae(e, t) {
		se(e, function() {
			!y.state.isVisible && x.parentNode && x.parentNode.contains(x) && t();
		});
	}
	function oe(e, t) {
		se(e, t);
	}
	function se(e, t) {
		var n = A().box;
		function r(e) {
			e.target === n && (yc(n, "remove", r), t());
		}
		if (e === 0) return t();
		yc(n, "remove", d), yc(n, "add", r), d = r;
	}
	function L(t, n, r) {
		r === void 0 && (r = !1), rc(y.props.triggerTarget || e).forEach(function(e) {
			e.addEventListener(t, n, r), p.push({
				node: e,
				eventType: t,
				handler: n,
				options: r
			});
		});
	}
	function ce() {
		E() && (L("touchstart", ue, { passive: !0 }), L("touchend", fe, { passive: !0 })), nc(y.props.trigger).forEach(function(e) {
			if (e !== "manual") switch (L(e, ue), e) {
				case "mouseenter":
					L("mouseleave", fe);
					break;
				case "focus":
					L(Ec ? "focusout" : "blur", pe);
					break;
				case "focusin": L("focusout", pe);
			}
		});
	}
	function le() {
		p.forEach(function(e) {
			var t = e.node, n = e.eventType, r = e.handler, i = e.options;
			t.removeEventListener(n, r, i);
		}), p = [];
	}
	function ue(e) {
		var t = !1;
		if (!(!y.state.isEnabled || me(e) || s)) {
			var n = u?.type === "focus";
			u = e, h = e.currentTarget, P(), !y.state.isVisible && fc(e) && zc.forEach(function(t) {
				return t(e);
			}), e.type === "click" && (y.props.trigger.indexOf("mouseenter") < 0 || o) && y.props.hideOnClick !== !1 && y.state.isVisible ? t = !0 : ve(e), e.type === "click" && (o = !t), t && !n && z(e);
		}
	}
	function de(e) {
		var t = e.target, r = O().contains(t) || x.contains(t);
		e.type === "mousemove" && r || vc(_e().concat(x).map(function(e) {
			var t = e._tippy.popperInstance?.state;
			return t ? {
				popperRect: e.getBoundingClientRect(),
				popperState: t,
				props: n
			} : null;
		}).filter(Boolean), e) && (te(), z(e));
	}
	function fe(e) {
		if (!(me(e) || y.props.trigger.indexOf("click") >= 0 && o)) {
			if (y.props.interactive) {
				y.hideWithInteractivity(e);
				return;
			}
			z(e);
		}
	}
	function pe(e) {
		y.props.trigger.indexOf("focusin") < 0 && e.target !== O() || y.props.interactive && e.relatedTarget && x.contains(e.relatedTarget) || z(e);
	}
	function me(e) {
		return X.isTouch ? E() !== e.type.indexOf("touch") >= 0 : !1;
	}
	function he() {
		R();
		var t = y.props, n = t.popperOptions, r = t.placement, i = t.offset, a = t.getReferenceClientRect, o = t.moveTransition, s = D() ? Ic(x).arrow : null, c = a ? {
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
		}), l.push.apply(l, n?.modifiers || []), y.popperInstance = Ws(c, x, Object.assign({}, n, {
			placement: r,
			onFirstUpdate: f,
			modifiers: l
		}));
	}
	function R() {
		y.popperInstance && (y.popperInstance.destroy(), y.popperInstance = null);
	}
	function ge() {
		var e = y.props.appendTo, t, n = O();
		t = y.props.interactive && e === Zs || e === "parent" ? n.parentNode : ec(e, [n]), t.contains(x) || t.appendChild(x), y.state.isMounted = !0, he();
	}
	function _e() {
		return sc(x.querySelectorAll("[data-tippy-root]"));
	}
	function ve(e) {
		y.clearDelayTimeouts(), e && N("onTrigger", [y, e]), re();
		var t = j(!0), n = T(), i = n[0], a = n[1];
		X.isTouch && i === "hold" && a && (t = a), t ? r = setTimeout(function() {
			y.show();
		}, t) : y.show();
	}
	function z(e) {
		if (y.clearDelayTimeouts(), N("onUntrigger", [y, e]), !y.state.isVisible) {
			ie();
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
	function ye() {
		y.state.isEnabled = !0;
	}
	function be() {
		y.hide(), y.state.isEnabled = !1;
	}
	function xe() {
		clearTimeout(r), clearTimeout(i), cancelAnimationFrame(a);
	}
	function Se(t) {
		if (!y.state.isDestroyed) {
			N("onBeforeUpdate", [y, t]), le();
			var n = y.props, r = jc(e, Object.assign({}, n, cc(t), { ignoreAttributes: !0 }));
			y.props = r, ce(), n.interactiveDebounce !== r.interactiveDebounce && (te(), m = tc(de, r.interactiveDebounce)), n.triggerTarget && !r.triggerTarget ? rc(n.triggerTarget).forEach(function(e) {
				e.removeAttribute("aria-expanded");
			}) : r.triggerTarget && e.removeAttribute("aria-expanded"), P(), M(), S && S(n, r), y.popperInstance && (he(), _e().forEach(function(e) {
				requestAnimationFrame(e._tippy.popperInstance.forceUpdate);
			})), N("onAfterUpdate", [y, t]);
		}
	}
	function Ce(e) {
		y.setProps({ content: e });
	}
	function we() {
		var e = y.state.isVisible, t = y.state.isDestroyed, n = !y.state.isEnabled, r = X.isTouch && !y.props.touch, i = Qs(y.props.duration, 0, Z.duration);
		if (!(e || t || n || r) && !O().hasAttribute("disabled") && (N("onShow", [y], !1), y.props.onShow(y) !== !1)) {
			if (y.state.isVisible = !0, D() && (x.style.visibility = "visible"), M(), re(), y.state.isMounted || (x.style.transition = "none"), D()) {
				var a = A(), o = a.box, s = a.content;
				hc([o, s], 0);
			}
			f = function() {
				var e;
				if (!(!y.state.isVisible || l)) {
					if (l = !0, x.offsetHeight, x.style.transition = y.props.moveTransition, D() && y.props.animation) {
						var t = A(), n = t.box, r = t.content;
						hc([n, r], i), gc([n, r], "visible");
					}
					ee(), P(), ic(Bc, y), (e = y.popperInstance) == null || e.forceUpdate(), N("onMount", [y]), y.props.animation && D() && oe(i, function() {
						y.state.isShown = !0, N("onShown", [y]);
					});
				}
			}, ge();
		}
	}
	function Te() {
		var e = !y.state.isVisible, t = y.state.isDestroyed, n = !y.state.isEnabled, r = Qs(y.props.duration, 1, Z.duration);
		if (!(e || t || n) && (N("onHide", [y], !1), y.props.onHide(y) !== !1)) {
			if (y.state.isVisible = !1, y.state.isShown = !1, l = !1, o = !1, D() && (x.style.visibility = "hidden"), te(), ie(), M(!0), D()) {
				var i = A(), a = i.box, s = i.content;
				y.props.animation && (hc([a, s], r), gc([a, s], "hidden"));
			}
			ee(), P(), y.props.animation ? D() && ae(r, y.unmount) : y.unmount();
		}
	}
	function Ee(e) {
		k().addEventListener("mousemove", m), ic(zc, m), m(e);
	}
	function De() {
		y.state.isVisible && y.hide(), y.state.isMounted && (R(), _e().forEach(function(e) {
			e._tippy.unmount();
		}), x.parentNode && x.parentNode.removeChild(x), Bc = Bc.filter(function(e) {
			return e !== y;
		}), y.state.isMounted = !1, N("onHidden", [y]));
	}
	function Oe() {
		y.state.isDestroyed || (y.clearDelayTimeouts(), y.unmount(), le(), delete e._tippy, y.state.isDestroyed = !0, N("onDestroy", [y]));
	}
}
function Hc(e, t) {
	t === void 0 && (t = {});
	var n = Z.plugins.concat(t.plugins || []);
	Tc();
	var r = Object.assign({}, t, { plugins: n }), i = mc(e).reduce(function(e, t) {
		var n = t && Vc(t, r);
		return n && e.push(n), e;
	}, []);
	return uc(e) ? i[0] : i;
}
//#endregion
//#region src/lib/svg-wind-barbs/index.ts
Hc.defaultProps = Z, Hc.setDefaultProps = Oc, Hc.currentInput = X, Object.assign({}, vo, { effect: function(e) {
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
} }), Hc.setDefaultProps({ render: Lc }), zt();
var Uc = H`<path class="svg-wb-fill" d="M125,120c2.762,0,5,2.239,5,5c0,2.762-2.238,5-5,5c-2.761,0-5-2.238-5-5C120,122.239,122.239,120,125,120z"/><path fill="none" class="svg-wb-stroke" stroke-width="2" d="M125,115c5.523,0,10,4.477,10,10c0,5.523-4.477,10-10,10 c-5.523,0-10-4.477-10-10C115,119.477,119.477,115,125,115z "/>`, Wc = H`<path class="svg-wb" d="M125,112V76 M125,125l7-12.1h-14L125,125z"/>`, Gc = H`<path class="svg-wb" d="M125,112V76 M125,89l7-7 M125,125l7-12.1h-14L125,125z"/>`, Kc = H`<path class="svg-wb" d="M125,112V89 M125,89l14-14 M125,125l7-12.1h-14L125,125z"/>`, qc = H`<path class="svg-wb" d="M125,112V89 M125,89l14-14 M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>`, Jc = H`<path class="svg-wb" d="M125,112V89 M125,89l14-14 M125,100l14-14 M125,125l7-12.1h-14L125,125z"/>`, Yc = H`<path class="svg-wb" d="M125,112V79 M125,79l14-14 M125,90l14-14 M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>`, Xc = H`<path class="svg-wb" d="M125,112V79 M125,79l14-14 M125,90l14-14 M125,100l14-14 M125,125l7-12.1h-14L125,125z"/>`, Zc = H`<path class="svg-wb" d="M125,112V69 M125,69l14-14 M125,80l14-14 M125,90l14-14 M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>`, Qc = H`<path class="svg-wb" d="M125,112V69 M125,69l14-14 M125,80l14-14 M125,90l14-14 M125,100l14-14 M125,125l7-12.1h-14L125,125z"/>`, $c = H`<path class="svg-wb" d="M125,112V59 M125,59l14-14 M125,70l14-14 M125,80l14-14 M125,90l14-14 M125,100l7-7 M125,125l7-12.1h-14 L125,125z"/>`, el = H`<path class="svg-wb" d="M125,112V76 M125,76h14l-14,14V76z M125,125l7-12.1h-14L125,125z"/>`, tl = H`<path class="svg-wb" d="M125,112V76 M125,76h14l-14,14V76z M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>`, nl = H`<path class="svg-wb" d="M125,112V76 M125,76h14l-14,14V76z M125,100l14-14 M125,125l7-12.1h-14L125,125z"/>`, rl = H`<path class="svg-wb" d="M125,112V66 M125,66h14l-14,14V66z M125,90l14-14 M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>`, il = H`<path class="svg-wb" d="M125,112V66 M125,66h14l-14,14V66z M125,90l14-14 M125,100l14-14 M125,125l7-12.1h-14L125,125z"/>`, al = H`<path class="svg-wb" d="M125,112V56 M125,56h14l-14,14V56z M125,80l14-14 M125,90l14-14 M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>`, ol = H`<path class="svg-wb" d="M125,112V56 M125,56h14l-14,14V56z M125,80l14-14 M125,90l14-14 M125,100l14-14 M125,125l7-12.1h-14L125,125z"/>`, sl = H`<path class="svg-wb" d="M125,112V46 M125,46h14l-14,14V46z M125,70l14-14 M125,80l14-14 M125,90l14-14 M125,100l7-7 M125,125l7-12.1 h-14L125,125z"/>`, cl = H`<path class="svg-wb" d="M125,112V46 M125,46h14l-14,14V46z M125,70l14-14 M125,80l14-14 M125,90l14-14 M125,100l14-14 M125,125l7-12.1 h-14L125,125z"/>`, ll = H`<path class="svg-wb" d="M125,112V36 M125,36h14l-14,14V36z M125,60l14-14 M125,70l14-14 M125,80l14-14 M125,90l14-14 M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>`, ul = H`<path class="svg-wb" d="M125,112V62 M125,62h14l-14,14V62z M125,76h14l-14,14V76z M125,125l7-12.1h-14L125,125z"/>`, dl = H`<path class="svg-wb" d="M125,112V62 M125,62h14l-14,14V62z M125,76h14l-14,14V76z M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>`, fl = H`<path class="svg-wb" d="M125,112V62 M125,62h14l-14,14V62z M125,76h14l-14,14V76z M125,100l14-14 M125,125l7-12.1h-14L125,125z"/>`, pl = H`<path class="svg-wb" d="M125,112V52 M125,52h14l-14,14V52z M125,66h14l-14,14V66z M125,90l14-14 M125,100l7-7 M125,125l7-12.1h-14 L125,125z"/>`, ml = H`<path class="svg-wb" d="M125,112V52 M125,52h14l-14,14V52z M125,66h14l-14,14V66z M125,90l14-14 M125,100l14-14 M125,125l7-12.1h-14 L125,125z"/>`, hl = H`<path class="svg-wb" d="M125,112V42 M125,42h14l-14,14V42z M125,56h14l-14,14V56z M125,80l14-14 M125,90l14-14 M125,100l7-7 M125,125 l7-12.1h-14L125,125z"/>`, gl = H`<path class="svg-wb" d="M125,112V42 M125,42h14l-14,14V42z M125,56h14l-14,14V56z M125,80l14-14 M125,90l14-14 M125,100l14-14 M125,125 l7-12.1h-14L125,125z"/>`, _l = H`<path class="svg-wb" d="M125,112V32 M125,32h14l-14,14V32z M125,46h14l-14,14V46z M125,70l14-14 M125,80l14-14 M125,90l14-14 M125,100 l7-7 M125,125l7-12.1h-14L125,125z"/>`, vl = H`<path class="svg-wb" d="M125,112V32 M125,32h14l-14,14V32z M125,46h14l-14,14V46z M125,70l14-14 M125,80l14-14 M125,90l14-14 M125,100 l14-14 M125,125l7-12.1h-14L125,125z"/>`, yl = H`<path class="svg-wb" d="M125,112V22 M125,22h14l-14,14V22z M125,36h14l-14,14V36z M125,60l14-14 M125,70l14-14 M125,80l14-14 M125,90 l14-14 M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>`, bl = H`<path class="svg-wb" d="M125,112V48 M125,48h14l-14,14V48z M125,62h14l-14,14V62z M125,76h14l-14,14V76z M125,125l7-12.1h-14L125,125z"/>`, xl = H`<path class="svg-wb" d="M125,112V48 M125,48h14l-14,14V48z M125,62h14l-14,14V62z M125,76h14l-14,14V76z M125,100l7-7 M125,125l7-12.1 h-14L125,125z"/>`, Sl = H`<path class="svg-wb" d="M125,112V48 M125,48h14l-14,14V48z M125,62h14l-14,14V62z M125,76h14l-14,14V76z M125,100l14-14 M125,125 l7-12.1h-14L125,125z"/>`, Cl = H`<path class="svg-wb" d="M125,112V38 M125,38h14l-14,14V38z M125,52h14l-14,14V52z M125,66h14l-14,14V66z M125,90l14-14 M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>`, wl = H`<path class="svg-wb" d="M125,112V38 M125,38h14l-14,14V38z M125,52h14l-14,14V52z M125,66h14l-14,14V66z M125,90l14-14 M125,100l14-14 M125,125l7-12.1h-14L125,125z"/>`, Tl = H`<path class="svg-wb" d="M125,112V28 M125,28h14l-14,14V28z M125,42h14l-14,14V42z M125,56h14l-14,14V56z M125,80l14-14 M125,90l14-14 M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>`, El = H`<path class="svg-wb" d="M125,112V28 M125,28h14l-14,14V28z M125,42h14l-14,14V42z M125,56h14l-14,14V56z M125,80l14-14 M125,90l14-14 M125,100l14-14 M125,125l7-12.1h-14L125,125z"/>`, Dl = H`<path class="svg-wb" d="M125,112V18 M125,18h14l-14,14V18z M125,32h14l-14,14V32z M125,46h14l-14,14V46z M125,70l14-14 M125,80l14-14 M125,90l14-14 M125,100l7-7 M125,125l7-12.1h-14L125,125z"/>`, Ol = H`<path class="svg-wb" d="M125,112V18 M125,18h14l-14,14V18z M125,32h14l-14,14V32z M125,46h14l-14,14V46z M125,70l14-14 M125,80l14-14 M125,90l14-14 M125,100l14-14 M125,125l7-12.1h-14L125,125z"/>`;
function kl(e) {
	return e <= 0 || e < 1 ? Uc : e < 2.5 ? Wc : e < 5 ? Gc : e < 7.5 ? Kc : e < 10 ? qc : e < 12.5 ? Jc : e < 15 ? Yc : e < 17.5 ? Xc : e < 20 ? Zc : e < 22.5 ? Qc : e < 25 ? $c : e < 27.5 ? el : e < 30 ? tl : e < 32.5 ? nl : e < 35 ? rl : e < 37.5 ? il : e < 40 ? al : e < 42.5 ? ol : e < 45 ? sl : e < 47.5 ? cl : e < 50 ? ll : e < 52.5 ? ul : e < 55 ? dl : e < 57.5 ? fl : e < 60 ? pl : e < 62.5 ? ml : e < 65 ? hl : e < 67.5 ? gl : e < 70 ? _l : e < 72.5 ? vl : e < 75 ? yl : e < 77.5 ? bl : e < 80 ? xl : e < 82.5 ? Sl : e < 85 ? Cl : e < 87.5 ? wl : e < 90 ? Tl : e < 92.5 ? El : e < 95 ? Dl : e < 97.5 ? Ol : Uc;
}
//#endregion
//#region \0@oxc-project+runtime@0.142.0/helpers/esm/decorate.js
function Q(e, t, n, r) {
	var i = arguments.length, a = i < 3 ? t : r === null ? r = Object.getOwnPropertyDescriptor(t, n) : r, o;
	if (typeof Reflect == "object" && typeof Reflect.decorate == "function") a = Reflect.decorate(e, t, n, r);
	else for (var s = e.length - 1; s >= 0; s--) (o = e[s]) && (a = (i < 3 ? o(a) : i > 3 ? o(t, n, a) : o(t, n)) || a);
	return i > 3 && a && Object.defineProperty(t, n, a), a;
}
var Al = t((() => {}));
zt(), Al();
var jl, Ml = ".tippy-box[data-animation=fade][data-state=hidden]{opacity:0}[data-tippy-root]{max-width:calc(100vw - 10px)}.tippy-box{position:relative;background-color:#333;color:#fff;border-radius:4px;font-size:14px;line-height:1.4;white-space:normal;outline:0;transition-property:transform,visibility,opacity}.tippy-box[data-placement^=top]>.tippy-arrow{bottom:0}.tippy-box[data-placement^=top]>.tippy-arrow:before{bottom:-7px;left:0;border-width:8px 8px 0;border-top-color:initial;transform-origin:center top}.tippy-box[data-placement^=bottom]>.tippy-arrow{top:0}.tippy-box[data-placement^=bottom]>.tippy-arrow:before{top:-7px;left:0;border-width:0 8px 8px;border-bottom-color:initial;transform-origin:center bottom}.tippy-box[data-placement^=left]>.tippy-arrow{right:0}.tippy-box[data-placement^=left]>.tippy-arrow:before{border-width:8px 0 8px 8px;border-left-color:initial;right:-7px;transform-origin:center left}.tippy-box[data-placement^=right]>.tippy-arrow{left:0}.tippy-box[data-placement^=right]>.tippy-arrow:before{left:-7px;border-width:8px 8px 8px 0;border-right-color:initial;transform-origin:center right}.tippy-box[data-inertia][data-state=visible]{transition-timing-function:cubic-bezier(.54,1.5,.38,1.11)}.tippy-arrow{width:16px;height:16px;color:#333}.tippy-arrow:before{content:\"\";position:absolute;border-color:transparent;border-style:solid}.tippy-content{position:relative;padding:5px 9px;z-index:1}", $ = class extends Ft {
	constructor(...e) {
		super(...e), this.conditions = [], this.temperatures = [], this.wind = [], this.precipitation = [], this.icons = !1, this.icon_map = void 0, this.colors = void 0, this.hide_hours = !1, this.hide_temperatures = !1, this.hide_bar = !1, this.icon_fill = "single", this.show_wind = "false", this.show_precipitation_amounts = !1, this.show_precipitation_probability = !1, this.show_date = "false", this.label_spacing = 2, this.labels = En, this.tips = [];
	}
	render() {
		let e = [], t = 1;
		if (!this.hide_bar) for (let n of this.conditions) {
			let r = this.labels[n[0]], i = this.icon_map?.[n[0]];
			i || (i = Dn[n[0]], i = i === n[0] ? "mdi:weather-" + i : "mdi:" + i);
			let a = [];
			if (!this.icons) a.push(V`<span class="condition-label">${r}</span>`);
			else {
				let e;
				e = !this.icon_fill || this.icon_fill === "single" ? n[1] : this.icon_fill === "full" ? 1 : Math.max(Number(this.icon_fill) || 0, 1);
				let t = 1;
				for (let r = 0; r < n[1]; r += e) {
					let n = {
						gridColumnStart: String(t),
						gridColumnEnd: String(t += e * 2)
					};
					a.push(V`<span class="condition-icon" style=${$a(n)}><ha-icon icon=${i}></ha-icon></span>`);
				}
			}
			let o = {
				gridColumnStart: String(t),
				gridColumnEnd: String(t += n[1] * 2)
			};
			e.push(V`
          <div class=${n[0]} style=${$a(o)} data-tippy-content=${r}>
            ${a}
          </div>
        `);
		}
		let n = this.show_wind ?? "", r = [], i = null;
		for (let e = 0; e < this.temperatures.length; e += 1) {
			let t = e % this.label_spacing !== 0, a = this.hide_hours || t, o = this.hide_temperatures || t, s = (n === "true" || n.includes("speed")) && !t, c = (n === "true" || n.includes("direction")) && !t, l = n.includes("barb") && !t, u = this.show_precipitation_amounts && !t, d = this.show_precipitation_probability && !t, { hour: f, date: p, temperature: m } = this.temperatures[e], h = null;
			!t && this.show_date && this.show_date !== "false" && (this.show_date === "all" ? h = p : this.show_date === "boundary" && (i === p ? h = V`&nbsp;` : (h = p, i = p)));
			let { windSpeed: g, windSpeedRawMS: _, windDirection: v, windDirectionRaw: y } = this.wind[e], b = [], x = typeof y == "number" ? y : kn[y?.toLowerCase()];
			l && x !== void 0 && (b.push(V`<span title=${`${g} ${v}`}>
          ${this.getWindBarb(_, x)}
        </span>`), (s || c) && b.push(V`<br>`)), s && b.push(V`${g}`), s && c && b.push(V`<br>`), c && b.push(V`${v}`);
			let { precipitationAmount: S, precipitationProbability: C, precipitationProbabilityText: w } = this.precipitation[e], T = [];
			u && T.push(V`${S}`), u && d && T.push(V`<br>`), d && T.push(V`<span title=${w}>${C}</span>`), r.push(V`
        <div class="bar-block">
          <div class="bar-block-left"></div>
          <div class="bar-block-right"></div>
          <div class="bar-block-bottom">
            <div class="date">${h}</div>
            <div class="hour">${a ? null : f}</div>
            <div class="temperature">${o ? null : V`${m}&deg;`}</div>
            <div class="wind">${b}</div>
            <div class="precipitation">${T}</div>
          </div>
        </div>
      `);
		}
		let a = null;
		return this.colors && (a = this.getColorStyles(this.colors)), V`
      <div class="main">
        ${a ?? null}
        ${this.hide_bar ? null : V`<div class="bar">${e}</div>`}
        <div class="axes">${r}</div>
      </div>
    `;
	}
	update(e) {
		super.update(e), this.tips.forEach((e) => e.destroy()), this.tips = Hc(this.renderRoot.querySelectorAll(".bar > div"), {
			appendTo: this.renderRoot.firstElementChild || void 0,
			touch: "hold"
		});
	}
	getColorStyles(e) {
		if (!e || e.size === 0) return null;
		let t = [];
		for (let [n, r] of e.entries()) r.background && t.push(`--color-${n}: ${r.background};`), r.foreground && t.push(`--color-${n}-foreground: ${r.foreground};`);
		return V`<style>
      .main > .bar {
        ${ft(t.join(" "))}
      }
    </style>`;
	}
	getWindBarb(e, t) {
		let n = { transform: `rotate(${t}deg)` };
		return V`<svg xmlns="http://www.w3.org/2000/svg" viewBox="70 40 120 120" class="barb" style=${$a(n)}>
      ${kl(e)}
    </svg>`;
	}
};
jl = $, jl.styles = [ft(Ml), pt`
    .main {
      --color-clear-night: #111;
      --color-cloudy: #777777;
      --color-fog: var(--color-cloudy);
      --color-hail: #2b5174;
      --color-lightning: var(--color-rainy);
      --color-lightning-rainy: var(--color-rainy);
      --color-partlycloudy: #b3dbff;
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
  `], Q([G({ type: Array })], $.prototype, "conditions", void 0), Q([G({ type: Array })], $.prototype, "temperatures", void 0), Q([G({ type: Array })], $.prototype, "wind", void 0), Q([G({ type: Array })], $.prototype, "precipitation", void 0), Q([G({ type: Boolean })], $.prototype, "icons", void 0), Q([G({ type: Object })], $.prototype, "icon_map", void 0), Q([G({ attribute: !1 })], $.prototype, "colors", void 0), Q([G({ type: Boolean })], $.prototype, "hide_hours", void 0), Q([G({ type: Boolean })], $.prototype, "hide_temperatures", void 0), Q([G({ type: Boolean })], $.prototype, "hide_bar", void 0), Q([G({ type: String })], $.prototype, "icon_fill", void 0), Q([G({ type: String })], $.prototype, "show_wind", void 0), Q([G({ type: Boolean })], $.prototype, "show_precipitation_amounts", void 0), Q([G({ type: Boolean })], $.prototype, "show_precipitation_probability", void 0), Q([G({ type: String })], $.prototype, "show_date", void 0), Q([G({ type: Number })], $.prototype, "label_spacing", void 0), Q([G({ type: Object })], $.prototype, "labels", void 0);
//#endregion
//#region node_modules/@lit/reactive-element/css-tag.js
var Nl, Pl, Fl, Il = t((() => {
	Nl = window, Pl = Nl.ShadowRoot && (Nl.ShadyCSS === void 0 || Nl.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Fl = (e, t) => {
		Pl ? e.adoptedStyleSheets = t.map(((e) => e instanceof CSSStyleSheet ? e : e.styleSheet)) : t.forEach(((t) => {
			let n = document.createElement("style"), r = Nl.litNonce;
			r !== void 0 && n.setAttribute("nonce", r), n.textContent = t.cssText, e.appendChild(n);
		}));
	};
}));
//#endregion
//#region node_modules/@lit-labs/scoped-registry-mixin/scoped-registry-mixin.js
function Ll(e) {
	return class extends e {
		createRenderRoot() {
			let e = this.constructor, { registry: t, elementDefinitions: n, shadowRootOptions: r } = e;
			n && !t && (e.registry = new CustomElementRegistry(), Object.entries(n).forEach((([t, n]) => e.registry.define(t, n))));
			let i = this.renderOptions.creationScope = this.attachShadow({
				...r,
				customElements: e.registry
			});
			return Fl(i, this.constructor.elementStyles), i;
		}
	};
}
var Rl = t((() => {
	Il();
})), zl = /* @__PURE__ */ r({ HourlyWeatherCardEditor: () => Vl }), Bl, Vl, Hl = t((() => {
	zt(), O(), Rl(), $t(), Al(), Vl = (Bl = class extends Ll(Ft) {
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
			if (!this.hass || !this._helpers) return V``;
			let e = Ja(this._config?.language, this.hass?.locale?.language), t = this.getSchema(e);
			return V`
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
			}), "num_hours" in t && "num_segments" in t && delete t.num_hours, this._config = t, b(this, "config-changed", { config: this._config });
		}
	}, Bl.styles = pt`
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
  `, Bl), Q([G({ attribute: !1 })], Vl.prototype, "hass", void 0), Q([Gt()], Vl.prototype, "_config", void 0), Q([Gt()], Vl.prototype, "_helpers", void 0), Vl = Q([Bt("hourly-weather-editor")], Vl);
}));
O(), zt(), $t(), Xa(), Al();
var Ul;
customElements.define("weather-bar", $);
var Wl = Ja(void 0, void 0);
console.info(`%c  HOURLY-WEATHER-CARD \n%c  ${Wl("common.version")} ${bn}    `, "color: orange; font-weight: bold; background: black", "color: white; font-weight: bold; background: dimgray"), window.customCards = window.customCards || [], window.customCards.push({
	type: "hourly-weather",
	name: Wl("common.title_card"),
	description: Wl("common.description")
});
var Gl = Ul = class extends Ft {
	constructor(...e) {
		super(...e), this.configRenderPending = !1, this.localizer = void 0, this.localizerLastSettings = {
			configuredLanguage: void 0,
			haServerLanguage: void 0
		}, this._labels = En, this.labelsLocalized = !1, this._directions = Object.keys(On), this.directionsLocalized = !1;
	}
	static async getConfigElement() {
		return await Promise.resolve().then(() => (Hl(), zl)), document.createElement("hourly-weather-editor");
	}
	static getStubConfig() {
		return {};
	}
	localize(e, t = "", n = "") {
		return (!this.localizer || this.localizerSettingsChanged) && (this.localizer = Ja(this.config?.language, this.hass?.locale?.language), this.localizerLastSettings.configuredLanguage = this.config?.language, this.localizerLastSettings.haServerLanguage = this.hass?.locale?.language, this.labelsLocalized = !1, this.directionsLocalized = !1), this.localizer(e, t, n);
	}
	get localizerSettingsChanged() {
		return this.localizerLastSettings.configuredLanguage !== this.config?.language || this.localizerLastSettings.haServerLanguage !== this.hass?.locale?.language;
	}
	get labels() {
		return (!this.labelsLocalized || this.localizerSettingsChanged) && (this._labels = Object.fromEntries(Object.entries(En).map(([e, t]) => [e, this.localize(t)])), this.labelsLocalized = !0), this._labels;
	}
	get directions() {
		return (!this.directionsLocalized || this.localizerSettingsChanged) && (this._directions = Object.values(On).map((e) => this.localize(e)), this._directions.push(this._directions[0]), this.directionsLocalized = !0), this._directions;
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
		e.test_gui && D().setEditMode(!0), this.config = {
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
		return s(this, e, !1);
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
		return V`${yn(this.renderCore(), V``)}`;
	}
	async renderCore() {
		let e = await this.renderedConfig;
		if (!e) return;
		let t = e.entity, n = this.hass.states[t], { forecast: r, pending: i } = this.getForecast(), a = n.attributes.wind_speed_unit ?? "", s = n.attributes.precipitation_unit ?? "", c = parseInt(e.num_segments ?? e.num_hours ?? "12", 10), l = parseInt(e.offset ?? "0", 10), u = parseInt(e.label_spacing ?? "2", 10), d = !r || !r.length, f = e.icon_fill, p = !!e.hide_minutes, m = !!e.round_temperatures;
		if (c < 1) return await this._showError(this.localize("errors.offset_must_be_positive_int", "offset", "num_segments"));
		if (l < 0) return await this._showError(this.localize("errors.offset_must_be_positive_int"));
		if (!d && c > r.length - l) return i ? void 0 : await this._showError(this.localize("errors.too_many_segments_requested"));
		if (u < 1) return await this._showError(this.localize("errors.offset_must_be_positive_int", "offset", "label_spacing"));
		if (f) {
			let t = e.icon_fill === "full", n = e.icon_fill === "single", r = Number(e.icon_fill);
			if (!t && !n && !(Number.isInteger(r) && r > 0)) return await this._showError(this.localize("errors.invalid_value_icon_fill"));
		}
		let h = e.show_wind;
		if (typeof h == "boolean" && (h = h ? "true" : "false"), d) return i ? void 0 : V`
        <ha-card
          .header=${e.name}
          @action=${this._handleAction}
          .actionHandler=${Tn({
			hasHold: o(e.hold_action),
			hasDoubleClick: o(e.double_tap_action)
		})}
          tabindex="0"
          .label=${`Hourly Weather: ${e.entity || "No Entity Defined"}`}
        >
          <div class="card-content">
            <h3>${this.localize("errors.forecast_not_available")}</h3>
            <p>${this.localize("errors.check_entity")}</p>
          </div>
        </ha-card>`;
		let g = this.getConditionListFromForecast(r, c, l), _ = this.getTemperatures(r, c, l, p, m), v = this.getWind(r, c, l, a, p), y = this.getPrecipitation(r, c, l, s, p), b = this.getColorSettings(e.colors);
		return V`
      <ha-card
        .header=${e.name}
        @action=${this._handleAction}
        .actionHandler=${Tn({
			hasHold: o(e.hold_action),
			hasDoubleClick: o(e.double_tap_action)
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
		let r = e[n].condition, i = 0, a = [[r, 1]];
		for (let o = n + 1; o < t + n; o++) {
			let t = e[o].condition;
			t === r ? a[i][1]++ : (a.push([t, 1]), i++, r = t);
		}
		return a;
	}
	getTemperatures(e, t, n, r, i) {
		let a = [];
		for (let o = n; o < t + n; o++) {
			let t = e[o], n = new Date(t.datetime), s = i && !Number.isNaN(t.temperature) ? Math.round(t.temperature) : t.temperature;
			a.push({
				date: u(n, this.hass.locale),
				hour: this.formatHour(n, this.hass.locale, r),
				temperature: _(s, this.hass.locale)
			});
		}
		return a;
	}
	getPrecipitation(e, t, n, r, i) {
		let a = [];
		for (let o = n; o < t + n; o++) {
			let t = e[o], n = "";
			t.precipitation > 0 && (n = `${_(t.precipitation, this.hass.locale)} ${r}`.trim());
			let s = "", c = "";
			t.precipitation_probability > 0 && (s = `${_(t.precipitation_probability, this.hass.locale)}%`.trim(), c = this.localize("card.chance_of_precipitation", "{0}", String(t.precipitation_probability))), a.push({
				hour: this.formatHour(new Date(t.datetime), this.hass.locale, i),
				precipitationAmount: n,
				precipitationProbability: s,
				precipitationProbabilityText: c
			});
		}
		return a;
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
			return t in On ? this.localize(On[t]) : e;
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
		let r = p(e, t);
		return n || r.includes("AM") || r.includes("PM") ? r.replace(":00", "") : r;
	}
	getColorSettings(e) {
		if (!e) return {
			validColors: void 0,
			warnings: []
		};
		let t = /* @__PURE__ */ new Map(), n = [];
		return Object.entries(e).forEach(([e, r]) => {
			this.isValidColorDefinition(e, r) ? t.set(e, Ul.toColorObject(r)) : n.push(`${e}: ${JSON.stringify(r, null, 2)}`);
		}), {
			validColors: t,
			warnings: n
		};
	}
	isValidColorDefinition(e, t) {
		if (!(e in Dn)) return !1;
		if (typeof t == "string") {
			if (!Ul.isValidColor(t)) return !1;
		} else if (!t.background && !t.foreground || t.background && !Ul.isValidColor(t.background) || t.foreground && !Ul.isValidColor(t.foreground)) return !1;
		return !0;
	}
	static isValidColor(e) {
		return !!((0, en.isValidRGB)(e) || (0, en.isValidColorName)(e) || (0, en.isValidHSL)(e) || Ul.isValidColorVar(e));
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
		if (!Ul.isValidCustomPropertyName(i)) return !1;
		let a = r?.trim();
		return !(a && !Ul.isValidColor(a));
	}
	static toColorObject(e) {
		return typeof e == "string" ? { background: e } : e;
	}
	_handleAction(e) {
		this.hass && this.config && e.detail.action && E(this, this.hass, this.config, e.detail.action);
	}
	_showWarning(e) {
		return V` <hui-warning>${e}</hui-warning> `;
	}
	async _showError(e) {
		await new Promise((e) => setTimeout(e, 0));
		let t = document.createElement("hui-error-card");
		return t.setConfig({
			type: "error",
			error: e,
			origConfig: this.config
		}), V` ${t} `;
	}
	static get styles() {
		return pt``;
	}
};
Q([G({ attribute: !1 })], Gl.prototype, "hass", void 0), Q([Gt()], Gl.prototype, "config", void 0), Q([Gt()], Gl.prototype, "renderedConfig", void 0), Q([Gt()], Gl.prototype, "forecastEvent", void 0), Q([Gt()], Gl.prototype, "subscribedToForecast", void 0), Gl = Ul = Q([Bt("hourly-weather")], Gl);
//#endregion
export { Gl as HourlyWeatherCard };
