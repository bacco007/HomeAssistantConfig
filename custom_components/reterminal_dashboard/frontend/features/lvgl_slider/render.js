(() => {
    const render = (el, widget, { getColorStyle }) => {
        const props = widget.props || {};
        const fgColor = getColorStyle(props.color || "black");
        const bgColor = getColorStyle(props.bg_color || "gray");
        const borderWidth = props.border_width || 2;
        const isVertical = props.vertical || false;

        el.innerHTML = "";
        el.style.display = "flex";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";

        const min = props.min || 0;
        const max = props.max || 100;
        const val = props.value !== undefined ? props.value : 30;
        const range = max - min;
        const pct = Math.max(0, Math.min(100, ((val - min) / (range || 1)) * 100));

        // Track container
        const trackC = document.createElement("div");
        trackC.style.position = "relative";
        trackC.style.backgroundColor = bgColor;
        trackC.style.borderRadius = "10px";

        if (isVertical) {
            // Vertical slider
            trackC.style.width = "30%";
            trackC.style.height = "100%";
            el.style.flexDirection = "column";
        } else {
            // Horizontal slider
            trackC.style.width = "100%";
            trackC.style.height = "30%";
        }

        el.appendChild(trackC);

        // Indicator (Active part of track)
        const indicator = document.createElement("div");
        indicator.style.position = "absolute";
        indicator.style.backgroundColor = fgColor;
        indicator.style.borderRadius = "10px";

        if (isVertical) {
            // Vertical: fill from bottom
            indicator.style.left = "0";
            indicator.style.bottom = "0";
            indicator.style.width = "100%";
            indicator.style.height = `${pct}%`;
        } else {
            // Horizontal: fill from left
            indicator.style.left = "0";
            indicator.style.top = "0";
            indicator.style.height = "100%";
            indicator.style.width = `${pct}%`;
        }
        trackC.appendChild(indicator);

        // Knob
        const knob = document.createElement("div");
        const knobSize = isVertical ? widget.width * 0.8 : widget.height * 0.8;
        knob.style.width = `${knobSize}px`;
        knob.style.height = `${knobSize}px`;
        knob.style.backgroundColor = fgColor;
        knob.style.border = `${borderWidth}px solid white`;
        knob.style.borderRadius = "50%";
        knob.style.position = "absolute";

        if (isVertical) {
            // Center knob on the top of the indicator (vertical)
            knob.style.left = `calc(50% - ${knobSize / 2}px)`;
            knob.style.bottom = `calc(${pct}% - ${knobSize / 2}px)`;
        } else {
            // Center knob on the end of the indicator (horizontal)
            knob.style.left = `calc(${pct}% - ${knobSize / 2}px)`;
            knob.style.top = `calc(50% - ${knobSize / 2}px)`;
        }

        trackC.appendChild(knob);
    };

    if (window.FeatureRegistry) {
        window.FeatureRegistry.register("lvgl_slider", { render });
    }
})();
