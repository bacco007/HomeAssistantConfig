(function() {
    function render(element, widget, helpers) {
        const props = widget.props || {};
        const showLabel = props.show_label !== false;
        const showPct = props.show_percentage !== false;
        const barHeight = props.bar_height || 15;
        const borderWidth = props.border_width || 1;
        const color = props.color || "black";
        const colorValue = helpers.getColorStyle(color);

        element.style.display = "flex";
        element.style.flexDirection = "column";
        element.style.color = colorValue;

        const labelRow = document.createElement("div");
        labelRow.style.display = "flex";
        labelRow.style.justifyContent = "space-between";
        labelRow.style.marginBottom = "2px";
        labelRow.style.fontSize = "12px";
        labelRow.style.fontFamily = "Roboto, sans-serif";

        if (showLabel && (widget.title || showPct)) {
            if (widget.title) {
                const l = document.createElement("span");
                l.textContent = widget.title;
                labelRow.appendChild(l);
            }
            if (showPct) {
                const p = document.createElement("span");
                p.textContent = "50%";
                if (!widget.title) {
                    // If no title, align left? Or keep right?
                    // Legacy code: if pct only, it prints at x (left).
                    // But if both, pct is at right.
                    // Let's just append.
                }
                labelRow.appendChild(p);
            }
            element.appendChild(labelRow);
        }

        const barContainer = document.createElement("div");
        barContainer.style.height = barHeight + "px";
        barContainer.style.width = "100%";
        barContainer.style.border = `${borderWidth}px solid ${colorValue}`;
        barContainer.style.position = "relative";

        const barFill = document.createElement("div");
        barFill.style.height = "100%";
        barFill.style.width = "50%";
        barFill.style.backgroundColor = colorValue;

        barContainer.appendChild(barFill);
        element.appendChild(barContainer);
    }

    if (window.FeatureRegistry) {
        window.FeatureRegistry.register("progress_bar", { render });
    }
})();
