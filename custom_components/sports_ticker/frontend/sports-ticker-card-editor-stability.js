const SPORTS_TICKER_EDITOR_STABILITY_VERSION = "0.2.0";

const stableStringify = (value) => {
  if (value === undefined) return "undefined";
  try {
    const keys = Object.keys(value || {}).sort();
    return JSON.stringify(value, keys);
  } catch (_err) {
    return String(value);
  }
};

const installStableSportsTickerEditor = () => {
  const BaseEditor = customElements.get("sports-ticker-card-editor");
  const CardClass = customElements.get("sports-ticker-card");
  if (!BaseEditor || !CardClass) return false;

  if (!customElements.get("sports-ticker-card-editor-stable")) {
    class StableSportsTickerCardEditor extends BaseEditor {
      constructor() {
        super();
        this._stableAvailabilitySignature = "";
        this._stableConfigSignature = "";
      }

      set hass(hass) {
        this._hass = hass;
        const signature = typeof this._availableSports === "function"
          ? this._availableSports().map(([key, sport]) => `${key}:${sport.entity}`).join("|")
          : "";
        const firstRender = !this.shadowRoot || !this.shadowRoot.childNodes.length;
        if (firstRender || signature !== this._stableAvailabilitySignature) {
          this._stableAvailabilitySignature = signature;
          this._render?.();
        }
      }

      setConfig(config) {
        const next = { ...(config || {}) };
        const signature = stableStringify(next);
        const firstRender = !this.shadowRoot || !this.shadowRoot.childNodes.length;
        this._config = next;
        if (firstRender || signature !== this._stableConfigSignature) {
          this._stableConfigSignature = signature;
          this._render?.();
        }
      }

      _emit(next) {
        this._config = next;
        this._stableConfigSignature = stableStringify(next);
        this.dispatchEvent(new CustomEvent("config-changed", {
          detail: { config: next },
          bubbles: true,
          composed: true,
        }));
        this._render?.();
      }
    }

    customElements.define("sports-ticker-card-editor-stable", StableSportsTickerCardEditor);
  }

  CardClass.getConfigElement = async () => document.createElement("sports-ticker-card-editor-stable");
  console.info(
    `%c SPORTS-TICKER-EDITOR-STABILITY %c v${SPORTS_TICKER_EDITOR_STABILITY_VERSION} `,
    "background:#444;color:#fff;font-weight:700",
    "background:#eee;color:#444",
  );
  return true;
};

Promise.all([
  customElements.whenDefined("sports-ticker-card"),
  customElements.whenDefined("sports-ticker-card-editor"),
]).then(installStableSportsTickerEditor);
