(() => {
    const render = (el, widget, { getColorStyle }) => {
        const props = widget.props || {};
        const color = getColorStyle(props.color || "white");
        const borderColor = getColorStyle(props.border_color || "gray");
        const borderWidth = props.border_width || 1;
        const radius = props.radius || 0;

        el.innerHTML = "";
        el.style.boxSizing = "border-box";
        el.style.backgroundColor = color;
        el.style.border = `${borderWidth}px solid ${borderColor}`;
        el.style.borderRadius = `${radius}px`;
    };

    const registerFeature = () => {
        if (window.FeatureRegistry) {
            window.FeatureRegistry.register("lvgl_obj", { render });
            return true;
        }
        return false;
    };

    if (!registerFeature()) {
        setTimeout(() => {
            if (!registerFeature()) {
                console.error("[lvgl_obj] FeatureRegistry not found!");
            }
        }, 100);
    }
})();
