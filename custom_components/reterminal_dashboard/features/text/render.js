(function() {
    function render(element, widget, helpers) {
        const props = widget.props || {};
        const color = props.color || "black";
        const colorValue = helpers.getColorStyle(color);
        const opacityVal = parseInt(props.opacity != null ? props.opacity : 100, 10);
        const opacity = Math.max(0, Math.min(100, isNaN(opacityVal) ? 100 : opacityVal)) / 100;

        const fontSize = props.font_size || 20;
        const fontFamily = props.font_family || "Inter";
        const fontWeight = props.font_weight || 400;
        const fontStyle = props.italic ? "italic" : "normal";
        const textAlign = props.text_align || "TOP_LEFT";

        element.style.display = "flex";
        element.style.flexDirection = "column";
        element.style.boxSizing = "border-box";

        element.style.fontSize = fontSize + "px";
        element.style.fontFamily = fontFamily + ", sans-serif";
        element.style.fontWeight = String(fontWeight);
        element.style.fontStyle = fontStyle;
        element.style.color = colorValue;
        element.style.opacity = opacity;
        element.style.whiteSpace = "pre-wrap";
        element.style.overflow = "hidden";
        element.style.lineHeight = "1.2";

        // Horizontal Alignment
        if (textAlign.includes("CENTER")) {
            element.style.textAlign = "center";
            element.style.alignItems = "center";
        } else if (textAlign.includes("RIGHT")) {
            element.style.textAlign = "right";
            element.style.alignItems = "flex-end";
        } else {
            element.style.textAlign = "left";
            element.style.alignItems = "flex-start";
        }

        // Vertical Alignment
        if (textAlign.startsWith("CENTER")) {
            element.style.justifyContent = "center";
        } else if (textAlign.startsWith("BOTTOM")) {
            element.style.justifyContent = "flex-end";
        } else {
            element.style.justifyContent = "flex-start";
        }

        element.textContent = props.text || widget.title || "Text";
    }

    // Register with FeatureRegistry
    if (window.FeatureRegistry) {
        window.FeatureRegistry.register('text', { render: render });
    }
})();
