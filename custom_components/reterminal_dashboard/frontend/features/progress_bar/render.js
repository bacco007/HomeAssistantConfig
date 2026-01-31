(function () {
    function render(el, widget, tools) {
        const props = widget.props || {};
        const { getColorStyle } = tools;
        const entityId = widget.entity_id || "";
        const label = widget.title || "";
        const showLabel = props.show_label !== false && props.show_label !== "false";
        const showPercentage = props.show_percentage !== false && props.show_percentage !== "false";
        const barHeight = props.bar_height || 15;
        const borderWidth = props.border_width || 1;
        const color = props.color || "black";
        const colorStyle = getColorStyle(color);

        // Get sensor value (0-100 range expected)
        let percentValue = 50; // Default for preview
        
        if (window.AppState && window.AppState.entityStates && entityId) {
            const state = window.AppState.entityStates[entityId];
            if (state !== undefined && state !== null) {
                const numVal = parseFloat(String(state).replace(/[^0-9.-]/g, ''));
                if (!isNaN(numVal)) {
                    percentValue = Math.max(0, Math.min(100, numVal));
                }
            }
        }

        el.innerHTML = "";
        el.style.display = "flex";
        el.style.flexDirection = "column";
        el.style.justifyContent = "center";
        el.style.gap = "4px";
        el.style.color = colorStyle;

        // Label row with label on left and percentage on right (like legacy)
        if (showLabel && (label || showPercentage)) {
            const labelRow = document.createElement("div");
            labelRow.style.display = "flex";
            labelRow.style.justifyContent = "space-between";
            labelRow.style.alignItems = "center";
            labelRow.style.fontSize = "12px";
            labelRow.style.paddingBottom = "2px";
            labelRow.style.width = "100%";

            if (label) {
                const labelSpan = document.createElement("span");
                labelSpan.textContent = label;
                labelRow.appendChild(labelSpan);
            }

            if (showPercentage) {
                const pctSpan = document.createElement("span");
                pctSpan.textContent = Math.round(percentValue) + "%";
                labelRow.appendChild(pctSpan);
            }

            el.appendChild(labelRow);
        }

        // Bar Container
        const barContainer = document.createElement("div");
        barContainer.style.width = "100%";
        barContainer.style.height = `${barHeight}px`;
        barContainer.style.border = `${borderWidth}px solid ${colorStyle}`;
        barContainer.style.borderRadius = "2px";
        barContainer.style.position = "relative";
        barContainer.style.overflow = "hidden";
        barContainer.style.backgroundColor = color === "white" ? "#000" : "#fff";

        // Bar Fill
        const barFill = document.createElement("div");
        barFill.style.width = `${percentValue}%`;
        barFill.style.height = "100%";
        barFill.style.backgroundColor = colorStyle;
        barFill.style.transition = "width 0.3s ease";

        barContainer.appendChild(barFill);
        el.appendChild(barContainer);
    }

    // Register with FeatureRegistry - try immediately and with delay for HA loading
    const registerFeature = () => {
        if (window.FeatureRegistry) {
            window.FeatureRegistry.register("progress_bar", { render });
            return true;
        }
        return false;
    };

    if (!registerFeature()) {
        setTimeout(() => {
            if (!registerFeature()) {
                console.error("[progress_bar/render.js] FeatureRegistry not found!");
            }
        }, 100);
    }
})();
