(() => {
    const render = (el, widget, { getColorStyle }) => {
        const props = widget.props || {};
        let iconCode = "F0928"; // Default: wifi-strength-4 (excellent)
        let size = props.size || 24;
        const color = props.color || "black";
        const showDbm = props.show_dbm !== false;

        let signalLevel = -45; // Default preview (excellent signal)

        // Fetch live state from HA entity if using external sensor
        if (!props.is_local_sensor && widget.entity_id) {
            if (window.AppState && window.AppState.entityStates) {
                const stateObj = window.AppState.entityStates[widget.entity_id];
                if (stateObj && stateObj.state !== undefined) {
                    const val = parseFloat(stateObj.state);
                    if (!isNaN(val)) {
                        signalLevel = val;
                    }
                }
            }
        }

        if (props.fit_icon_to_frame) {
            const padding = 4;
            const maxDim = Math.max(8, Math.min((widget.width || 0) - padding * 2, (widget.height || 0) - padding * 2));
            size = Math.round(maxDim);
        }

        // Icon Logic based on signal strength thresholds (dBm)
        // Excellent: >= -50, Good: >= -60, Fair: >= -75, Weak: >= -100, Alert: < -100
        if (signalLevel >= -50) iconCode = "F0928";      // wifi-strength-4
        else if (signalLevel >= -60) iconCode = "F0925"; // wifi-strength-3
        else if (signalLevel >= -75) iconCode = "F0922"; // wifi-strength-2
        else if (signalLevel >= -100) iconCode = "F091F"; // wifi-strength-1
        else iconCode = "F092B";                          // wifi-strength-alert-outline

        // Convert Hex to Char (MDI uses Private Use Area starting at 0xF0000)
        const cp = 0xf0000 + parseInt(iconCode.slice(1), 16);
        const ch = String.fromCodePoint(cp);

        el.innerText = ch;
        el.style.fontSize = `${size}px`;
        el.style.color = getColorStyle(color);
        el.style.fontFamily = "MDI, system-ui, -apple-system, BlinkMacSystemFont, -sans-serif";
        el.style.lineHeight = "1";
        el.style.display = "flex";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";
        el.style.flexDirection = "column";

        // dBm Label (optional)
        if (showDbm) {
            const dbmLabel = document.createElement("div");
            dbmLabel.style.fontSize = (props.font_size || 12) + "px";
            dbmLabel.style.marginTop = "2px";
            dbmLabel.textContent = Math.round(signalLevel) + "dB";
            el.appendChild(dbmLabel);
        }
    };

    if (window.FeatureRegistry) {
        window.FeatureRegistry.register("wifi_signal", { render });
    }
})();
