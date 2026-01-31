(() => {
    const render = (el, widget, { getColorStyle }) => {
        const props = widget.props || {};

        let iconCode = "F0595"; // Default
        let size = props.size || 24;
        const color = props.color || "black";

        const code = (props.code || "").trim().toUpperCase();
        if (code && code.match(/^F[0-9A-F]{4}$/i)) {
            iconCode = code;
        }

        if (props.fit_icon_to_frame) {
            const padding = 4;
            const maxDim = Math.max(8, Math.min((widget.width || 0) - padding * 2, (widget.height || 0) - padding * 2));
            size = Math.round(maxDim);
        }

        // Convert Hex to Char
        const cp = 0xf0000 + parseInt(iconCode.slice(1), 16);
        const ch = String.fromCodePoint(cp);

        el.innerText = ch;
        el.style.fontSize = `${size}px`;
        el.style.color = getColorStyle(color);
        el.style.fontFamily = "MDI, system-ui, -apple-system, BlinkMacSystemFont, -sans-serif";
        el.style.lineHeight = "1";
        el.style.display = "flex";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";
    };

    if (window.FeatureRegistry) {
        window.FeatureRegistry.register("icon", { render });
    }
})();
