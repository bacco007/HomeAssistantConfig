(() => {
    const render = (el, widget, { getColorStyle }) => {
        const props = widget.props || {};

        // Clear element
        el.innerHTML = "";

        // Default Alignment for container
        el.style.display = "flex";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";

        // Alignment Helper
        const applyAlign = (align, element = el) => {
            if (!align) return;
            if (align.includes("LEFT")) element.style.justifyContent = "flex-start";
            else if (align.includes("RIGHT")) element.style.justifyContent = "flex-end";
            else element.style.justifyContent = "center";

            if (align.includes("TOP")) element.style.alignItems = "flex-start";
            else if (align.includes("BOTTOM")) element.style.alignItems = "flex-end";
            else element.style.alignItems = "center";
        };

        applyAlign(props.text_align || "TOP_LEFT");

        // Create text body element (like legacy version)
        const body = document.createElement("div");
        body.style.color = getColorStyle(props.color);
        body.style.fontSize = `${props.font_size || props.value_font_size || 20}px`;
        body.style.fontFamily = (props.font_family || "Roboto") + ", sans-serif";
        body.style.fontWeight = String(props.font_weight || 400);
        body.style.fontStyle = props.italic ? "italic" : "normal";
        body.textContent = props.text || widget.title || "Text";

        el.appendChild(body);
    };

    // Register with FeatureRegistry - try immediately and with delay for HA loading
    const registerFeature = () => {
        if (window.FeatureRegistry) {
            window.FeatureRegistry.register("text", { render });
            window.FeatureRegistry.register("label", { render });
            return true;
        }
        return false;
    };

    if (!registerFeature()) {
        // Retry after a short delay in case FeatureRegistry loads later
        setTimeout(() => {
            if (!registerFeature()) {
                console.error("[text/render.js] FeatureRegistry not found!");
            }
        }, 100);
    }
})();
