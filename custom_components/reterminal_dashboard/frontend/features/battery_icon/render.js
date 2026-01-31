(() => {
    const render = (el, widget, { getColorStyle }) => {
        const props = widget.props || {};
        let iconCode = "F0079"; // Default full battery
        let size = props.size || 24;
        const color = props.color || "black";

        let batteryLevel = 75; // Default preview

        if (props.fit_icon_to_frame) {
            const padding = 4;
            const maxDim = Math.max(8, Math.min((widget.width || 0) - padding * 2, (widget.height || 0) - padding * 2));
            size = Math.round(maxDim);
        }

        // TODO: Fetch state if available
        if (window.AppState && window.AppState.entityStates && widget.entity_id) {
            const stateObj = window.AppState.entityStates[widget.entity_id];
            if (stateObj && stateObj.state !== undefined) {
                const val = parseFloat(stateObj.state);
                if (!isNaN(val)) {
                    batteryLevel = val;
                }
            }
        }

        // Icon Logic
        if (batteryLevel <= 10) iconCode = "F007A";
        else if (batteryLevel <= 20) iconCode = "F007B";
        else if (batteryLevel <= 30) iconCode = "F007C";
        else if (batteryLevel <= 40) iconCode = "F007D";
        else if (batteryLevel <= 50) iconCode = "F007E";
        else if (batteryLevel <= 60) iconCode = "F007F";
        else if (batteryLevel <= 70) iconCode = "F0080";
        else if (batteryLevel <= 80) iconCode = "F0081";
        else if (batteryLevel <= 90) iconCode = "F0082";
        else iconCode = "F0079";

        // Convert Hex to Char
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

        // Battery Percentage Label
        const pctLabel = document.createElement("div");
        pctLabel.style.fontSize = (props.font_size || 12) + "px";
        pctLabel.style.marginTop = "2px";
        pctLabel.textContent = Math.round(batteryLevel) + "%";
        el.appendChild(pctLabel);
    };

    if (window.FeatureRegistry) {
        window.FeatureRegistry.register("battery_icon", { render });
    }
})();
