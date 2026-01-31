(function() {
    function render(element, widget, helpers) {
        const props = widget.props || {};
        const format = props.format || "time_date";
        const timeFontSize = props.time_font_size || 28;
        const dateFontSize = props.date_font_size || 16;
        const fontFamily = props.font_family || "Roboto";
        const color = props.color || "black";
        const colorValue = helpers.getColorStyle(color);

        element.style.display = "flex";
        element.style.flexDirection = "column";
        element.style.alignItems = "center";
        element.style.justifyContent = "flex-start"; // Top aligned
        element.style.color = colorValue;
        element.style.fontFamily = fontFamily + ", sans-serif";

        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        const dateStr = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

        if (format === "time_only" || format === "time_date") {
            const timeEl = document.createElement("div");
            timeEl.textContent = timeStr;
            timeEl.style.fontSize = timeFontSize + "px";
            timeEl.style.fontWeight = "bold";
            element.appendChild(timeEl);
        }

        if (format === "date_only" || format === "time_date") {
            const dateEl = document.createElement("div");
            dateEl.textContent = dateStr;
            dateEl.style.fontSize = dateFontSize + "px";
            dateEl.style.marginTop = (format === "time_date") ? "4px" : "0";
            element.appendChild(dateEl);
        }
    }

    if (window.FeatureRegistry) {
        window.FeatureRegistry.register("datetime", { render });
    }
})();
