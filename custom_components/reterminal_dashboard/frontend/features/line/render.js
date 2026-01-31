(() => {
    const render = (el, widget, { getColorStyle }) => {
        const props = widget.props || {};

        const orientation = props.orientation || "horizontal";
        const strokeWidth = props.stroke_width || 1;

        if (orientation === "vertical") {
            el.style.width = `${strokeWidth}px`;
            el.style.height = `${widget.height}px`;
        } else {
            el.style.width = `${widget.width}px`;
            el.style.height = `${strokeWidth}px`;
        }
        el.style.backgroundColor = getColorStyle(props.color);

    };

    if (window.FeatureRegistry) {
        window.FeatureRegistry.register("line", { render });
    }
})();
