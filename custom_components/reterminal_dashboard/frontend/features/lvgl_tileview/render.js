(() => {
    const render = (el, widget, { getColorStyle }) => {
        const props = widget.props || {};

        el.innerHTML = "";
        el.style.display = "grid";
        el.style.gridTemplateColumns = "1fr 1fr";
        el.style.gridTemplateRows = "1fr 1fr";
        el.style.gap = "2px";
        el.style.boxSizing = "border-box";
        el.style.backgroundColor = getColorStyle(props.bg_color || "white");
        el.style.border = "1px solid #333";
        el.style.padding = "2px";

        // Draw 4 placeholder tiles
        for (let i = 0; i < 4; i++) {
            const tile = document.createElement("div");
            tile.style.backgroundColor = "#f0f0f0";
            tile.style.border = "1px dashed #999";
            tile.style.display = "flex";
            tile.style.alignItems = "center";
            tile.style.justifyContent = "center";
            tile.style.fontSize = "10px";
            tile.style.fontFamily = "Roboto, sans-serif";
            tile.style.color = "#666";
            tile.textContent = `Tile ${i}`;
            el.appendChild(tile);
        }
    };

    const registerFeature = () => {
        if (window.FeatureRegistry) {
            window.FeatureRegistry.register("lvgl_tileview", { render });
            return true;
        }
        return false;
    };

    if (!registerFeature()) {
        setTimeout(() => {
            if (!registerFeature()) {
                console.error("[lvgl_tileview] FeatureRegistry not found!");
            }
        }, 100);
    }
})();
