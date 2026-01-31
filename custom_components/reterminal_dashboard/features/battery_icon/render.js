(function() {
    function render(element, widget, helpers) {
        const props = widget.props || {};
        const size = props.size || 32;
        const color = props.color || "black";
        const colorValue = helpers.getColorStyle(color);

        element.style.display = "flex";
        element.style.flexDirection = "column";
        element.style.alignItems = "center";
        element.style.justifyContent = "center";

        element.style.fontFamily = '"Material Design Icons", sans-serif';
        element.style.fontSize = size + "px";
        element.style.color = colorValue;

        // Battery icon char (e.g. F007E)
        element.textContent = "\uF007E"; // battery-50

        // Add percentage text below
        const pct = document.createElement("div");
        pct.textContent = "50%";
        pct.style.fontFamily = "Roboto, sans-serif";
        pct.style.fontSize = "12px";
        pct.style.marginTop = "2px";
        element.appendChild(pct);
    }

    if (window.FeatureRegistry) {
        window.FeatureRegistry.register("battery_icon", { render });
    }
})();
