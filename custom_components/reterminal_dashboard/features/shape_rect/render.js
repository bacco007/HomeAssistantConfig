(function() {
    function render(element, widget, helpers) {
        const props = widget.props || {};
        const color = props.color || "black";
        const borderWidth = parseInt(props.border_width != null ? props.border_width : 1, 10);
        const fill = !!props.fill;
        const opacityVal = parseInt(props.opacity != null ? props.opacity : 100, 10);
        const opacity = Math.max(0, Math.min(100, isNaN(opacityVal) ? 100 : opacityVal)) / 100;

        const colorValue = helpers.getColorStyle(color);

        element.style.boxSizing = "border-box";
        element.style.border = borderWidth > 0 ? borderWidth + "px solid " + colorValue : "none";
        element.style.backgroundColor = fill ? colorValue : "transparent";
        element.style.opacity = fill ? opacity : 1;
    }

    // Register with FeatureRegistry
    if (window.FeatureRegistry) {
        window.FeatureRegistry.register('shape_rect', { render: render });
    }
})();
