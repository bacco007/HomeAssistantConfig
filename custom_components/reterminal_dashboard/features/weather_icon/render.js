/**
 * Weather Icon widget renderer for canvas.
 * Displays weather condition icons based on entity state.
 */
(function () {
    // Default weather icon mapping (same as generator.py)
    const WEATHER_ICON_MAP = {
        "clear-night": "F0594",
        "cloudy": "F0590",
        "exceptional": "F0026",
        "fog": "F0591",
        "hail": "F0592",
        "lightning": "F0593",
        "lightning-rainy": "F067E",
        "partlycloudy": "F0595",
        "pouring": "F0596",
        "rainy": "F0597",
        "snowy": "F0598",
        "snowy-rainy": "F067F",
        "sunny": "F0599",
        "windy": "F059D",
        "windy-variant": "F059E",
    };

    function render(element, widget, helpers) {
        const props = widget.props || {};
        const size = parseInt(props.size || 48, 10) || 48;
        const color = props.color || "black";
        const colorStyle = helpers.getColorStyle(color);

        // Get weather state from entity or use default
        let iconCode = "F0591"; // Default: fog/weather icon

        if (widget.entity_id && helpers.entityStates) {
            const state = helpers.entityStates[widget.entity_id];
            if (state && state.state) {
                const weatherState = state.state.toLowerCase();
                iconCode = WEATHER_ICON_MAP[weatherState] || "F0591";
            }
        }

        // Convert icon code to Unicode character
        const hex = iconCode.match(/^F[0-9A-F]{4}$/i) ? iconCode : "F0591";
        const codepoint = 0xf0000 + parseInt(hex.slice(1), 16);
        const iconChar = String.fromCodePoint(codepoint);

        // Style the element
        element.classList.add("mdi-icon-preview");
        element.style.fontFamily = "MDI, system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
        element.style.fontSize = size + "px";
        element.style.lineHeight = "1";
        element.style.color = colorStyle;
        element.style.display = "flex";
        element.style.alignItems = "center";
        element.style.justifyContent = "center";

        element.textContent = iconChar;
    }

    // Register with FeatureRegistry
    if (window.FeatureRegistry) {
        window.FeatureRegistry.register("weather_icon", { render });
    }
})();
