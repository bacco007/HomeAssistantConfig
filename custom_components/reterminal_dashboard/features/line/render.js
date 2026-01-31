(function() {
    function render(element, widget, helpers) {
        const props = widget.props || {};
        const color = props.color || "black";
        const strokeWidth = parseInt(props.stroke_width || 1, 10);
        const colorValue = helpers.getColorStyle(color);
        const orientation = props.orientation || "horizontal";

        element.style.boxSizing = "border-box";
        element.style.backgroundColor = colorValue;

        // Use explicit orientation property to determine display
        if (orientation === "vertical") {
            // Vertical line: width is stroke thickness, height is line length
            element.style.width = strokeWidth + "px";
            element.style.height = (widget.height || 100) + "px";
        } else {
            // Horizontal line: height is stroke thickness, width is line length
            element.style.height = strokeWidth + "px";
            element.style.width = (widget.width || 100) + "px";
        }
    }

    if (window.FeatureRegistry) {
        window.FeatureRegistry.register("line", { render });
    }
})();
