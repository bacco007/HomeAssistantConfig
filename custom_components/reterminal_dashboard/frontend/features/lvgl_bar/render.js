(() => {
    const render = (el, widget, { getColorStyle }) => {
        const props = widget.props || {};
        const fgColor = getColorStyle(props.color || "black");
        const bgColor = getColorStyle(props.bg_color || "gray");

        el.innerHTML = "";
        el.style.backgroundColor = bgColor;
        el.style.borderRadius = "4px";
        el.style.overflow = "hidden";
        el.style.position = "relative";

        const min = props.min || 0;
        const max = props.max || 100;
        const val = props.value !== undefined ? props.value : 50;
        const range = max - min;
        const pct = Math.max(0, Math.min(100, ((val - min) / (range || 1)) * 100));

        const bar = document.createElement("div");
        bar.style.position = "absolute";
        bar.style.left = "0";
        bar.style.top = "0";
        bar.style.height = "100%";
        bar.style.width = `${pct}%`;
        bar.style.backgroundColor = fgColor;

        el.appendChild(bar);
    };

    if (window.FeatureRegistry) {
        window.FeatureRegistry.register("lvgl_bar", { render });
    }
})();
