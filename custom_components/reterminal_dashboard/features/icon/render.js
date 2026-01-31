(function() {
    function render(element, widget, helpers) {
        const props = widget.props || {};
        const code = (props.code || "").trim().toUpperCase();
        const sizeManual = parseInt(props.size || 40, 10) || 40;
        const hex = code && code.match(/^F[0-9A-F]{4}$/i) ? code : "F0595";
        const cp = 0xf0000 + parseInt(hex.slice(1), 16);
        const ch = String.fromCodePoint(cp);

        const color = props.color || "black";
        const colorStyle = helpers.getColorStyle(color);

        const fit = !!props.fit_icon_to_frame;
        element.classList.add("mdi-icon-preview");
        element.style.fontFamily = "MDI, system-ui, -apple-system, BlinkMacSystemFont, -sans-serif";
        element.style.lineHeight = "1";
        element.style.color = colorStyle;

        if (fit) {
            const padding = 4;
            const maxW = Math.max(8, (widget.width || 0) - padding * 2);
            const maxH = Math.max(8, (widget.height || 0) - padding * 2);
            const size = Math.max(8, Math.min(maxW, maxH));
            element.style.display = "flex";
            element.style.alignItems = "center";
            element.style.justifyContent = "center";
            element.style.fontSize = size + "px";
        } else {
            element.style.fontSize = sizeManual + "px";
            element.style.display = "block"; // Default display
        }

        element.textContent = ch;
    }

    if (window.FeatureRegistry) {
        window.FeatureRegistry.register("icon", { render });
    }
})();
