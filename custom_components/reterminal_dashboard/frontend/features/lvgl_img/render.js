(() => {
    const render = (el, widget, { getColorStyle }) => {
        const props = widget.props || {};
        const pColor = getColorStyle(props.color || "black");

        el.innerHTML = "";
        el.style.border = "1px dashed #ccc";
        el.style.display = "flex";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";
        el.style.overflow = "hidden";
        el.style.color = pColor;
        el.style.backgroundColor = "#f0f0f0";

        const src = props.src || "symbol_image";

        // If it's a known symbol or just text
        const label = document.createElement("div");
        label.style.textAlign = "center";

        if (props.rotation) {
            label.style.transform = `rotate(${props.rotation * 0.1}deg)`;
        }

        if (src.includes("/") || src.includes(".")) {
            label.textContent = "IMG: " + src;
        } else {
            label.textContent = "Symbol: " + src;
        }

        label.style.fontSize = "12px";
        el.appendChild(label);
    };

    if (window.FeatureRegistry) {
        window.FeatureRegistry.register("lvgl_img", { render });
    }
})();
