(() => {
    const render = (el, widget, { getColorStyle }) => {
        const props = widget.props || {};
        const checked = props.checked || false;
        const bgColor = getColorStyle(props.bg_color || "gray");
        const indicatorColor = getColorStyle(props.color || "blue");
        const knobColor = getColorStyle(props.knob_color || "white");
        const width = widget.width || 60;
        const height = widget.height || 30;

        el.innerHTML = "";
        el.style.display = "flex";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";
        el.style.boxSizing = "border-box";

        // Track
        const track = document.createElement("div");
        track.style.width = `${width}px`;
        track.style.height = `${height}px`;
        track.style.borderRadius = `${height / 2}px`;
        track.style.backgroundColor = checked ? indicatorColor : bgColor;
        track.style.position = "relative";
        track.style.transition = "background-color 0.2s";

        // Knob
        const knob = document.createElement("div");
        const knobSize = height - 4;
        knob.style.width = `${knobSize}px`;
        knob.style.height = `${knobSize}px`;
        knob.style.borderRadius = "50%";
        knob.style.backgroundColor = knobColor;
        knob.style.position = "absolute";
        knob.style.top = "2px";
        knob.style.left = checked ? `${width - knobSize - 2}px` : "2px";
        knob.style.boxShadow = "0 1px 3px rgba(0,0,0,0.3)";
        knob.style.transition = "left 0.2s";

        track.appendChild(knob);
        el.appendChild(track);
    };

    const registerFeature = () => {
        if (window.FeatureRegistry) {
            window.FeatureRegistry.register("lvgl_switch", { render });
            return true;
        }
        return false;
    };

    if (!registerFeature()) {
        setTimeout(() => {
            if (!registerFeature()) {
                console.error("[lvgl_switch] FeatureRegistry not found!");
            }
        }, 100);
    }
})();
