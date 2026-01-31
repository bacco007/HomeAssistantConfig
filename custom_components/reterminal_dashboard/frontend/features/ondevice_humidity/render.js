(() => {
    const render = (el, widget, { getColorStyle }) => {
        const props = widget.props || {};
        const color = props.color || "black";
        let iconSize = props.size || 32;
        const fontSize = props.font_size || 16;
        const labelFontSize = props.label_font_size || 12;
        const unit = props.unit || "%";
        const showLabel = props.show_label !== false;
        const precision = props.precision ?? 0;

        let humidity = 45; // Default preview value

        // Fit icon to frame if enabled
        if (props.fit_icon_to_frame) {
            const padding = 4;
            const maxDim = Math.max(8, Math.min((widget.width || 0) - padding * 2, ((widget.height || 0) / 2) - padding));
            iconSize = Math.round(maxDim);
        }

        // Fetch live state from HA entity if using external sensor
        if (!props.is_local_sensor && widget.entity_id) {
            if (window.AppState && window.AppState.entityStates) {
                const stateObj = window.AppState.entityStates[widget.entity_id];
                if (stateObj && stateObj.state !== undefined) {
                    const val = parseFloat(stateObj.state);
                    if (!isNaN(val)) {
                        humidity = val;
                    }
                }
            }
        }

        // Dynamic water/humidity icon based on level
        // MDI Icons: water-percent (F058E), water-outline (F0E7A), water (F058C)
        let iconCode;
        if (humidity <= 30) {
            iconCode = "F0E7A"; // water-outline (low)
        } else if (humidity <= 60) {
            iconCode = "F058E"; // water-percent (normal)
        } else {
            iconCode = "F058C"; // water (high)
        }

        // Convert Hex to Char for MDI font (strip "F" prefix like battery_icon does)
        const cp = 0xf0000 + parseInt(iconCode.slice(1), 16);
        const ch = String.fromCodePoint(cp);

        el.style.display = "flex";
        el.style.flexDirection = "column";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";
        el.style.color = getColorStyle(color);

        // Icon
        const iconEl = document.createElement("div");
        iconEl.textContent = ch;
        iconEl.style.fontSize = `${iconSize}px`;
        iconEl.style.fontFamily = "MDI, system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
        iconEl.style.lineHeight = "1";
        el.appendChild(iconEl);

        // Humidity value
        const valueEl = document.createElement("div");
        valueEl.style.fontSize = `${fontSize}px`;
        valueEl.style.fontWeight = "500";
        valueEl.style.marginTop = "2px";
        valueEl.textContent = humidity.toFixed(precision) + unit;
        el.appendChild(valueEl);

        // Label
        if (showLabel) {
            const labelEl = document.createElement("div");
            labelEl.style.fontSize = `${labelFontSize}px`;
            labelEl.style.opacity = "0.7";
            labelEl.style.marginTop = "1px";
            labelEl.textContent = "Humidity";
            el.appendChild(labelEl);
        }
    };

    if (window.FeatureRegistry) {
        window.FeatureRegistry.register("ondevice_humidity", { render });
    }
})();
