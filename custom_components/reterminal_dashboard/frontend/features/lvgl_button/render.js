(() => {
    const render = (el, widget, { getColorStyle }) => {
        const props = widget.props || {};

        // Clear element
        el.innerHTML = "";

        // Container style
        el.style.display = "flex";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";
        el.style.boxSizing = "border-box";

        // Button style
        el.style.backgroundColor = getColorStyle(props.bg_color || "white");
        el.style.border = `${props.border_width || 2}px solid ${getColorStyle(props.color || "black")}`;
        el.style.borderRadius = `${props.radius || 5}px`;

        // Button Text
        const text = document.createElement("span");
        text.textContent = props.text || "BTN";
        text.style.color = getColorStyle(props.color || "black");
        text.style.fontFamily = "Roboto, sans-serif";
        text.style.fontSize = "14px";
        text.style.pointerEvents = "none"; // Let clicks pass to widget container

        el.appendChild(text);
    };

    // Register with FeatureRegistry
    const registerFeature = () => {
        if (window.FeatureRegistry) {
            window.FeatureRegistry.register("lvgl_button", { render });
            return true;
        }
        return false;
    };

    if (!registerFeature()) {
        setTimeout(() => {
            if (!registerFeature()) {
                console.error("[lvgl_button] FeatureRegistry not found!");
            }
        }, 100);
    }
})();
