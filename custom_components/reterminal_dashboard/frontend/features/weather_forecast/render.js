(() => {
    const render = (el, widget, { getColorStyle }) => {
        const props = widget.props || {};
        const layout = props.layout || "horizontal";
        const days = Math.min(7, Math.max(1, parseInt(props.days, 10) || 5));
        const iconSize = parseInt(props.icon_size, 10) || 32;
        const tempFontSize = parseInt(props.temp_font_size, 10) || 14;
        const dayFontSize = parseInt(props.day_font_size, 10) || 12;
        const showHighLow = props.show_high_low !== false;
        const colorStyle = getColorStyle(props.color || "black");
        const fontFamily = (props.font_family || "Roboto") + ", sans-serif";

        // Weather icon codes for preview
        const weatherIcons = [
            { code: "F0599", condition: "sunny" },      // Today
            { code: "F0595", condition: "partlycloudy" }, // Day 1
            { code: "F0597", condition: "rainy" },       // Day 2
            { code: "F0590", condition: "cloudy" },      // Day 3
            { code: "F0595", condition: "partlycloudy" }  // Day 4
        ];

        // Mock day names
        const dayNames = ["Today", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const mockTemps = [
            { high: 24, low: 18 },
            { high: 20, low: 14 },
            { high: 22, low: 15 },
            { high: 19, low: 13 },
            { high: 18, low: 12 },
            { high: 21, low: 15 },
            { high: 23, low: 16 }
        ];

        // Clear element
        el.innerHTML = "";
        el.style.display = "flex";
        el.style.flexDirection = layout === "vertical" ? "column" : "row";
        el.style.alignItems = "flex-start";
        el.style.justifyContent = "flex-start";
        el.style.gap = layout === "vertical" ? "4px" : "0px";
        el.style.overflow = "hidden";

        // Calculate item dimensions
        const itemWidth = layout === "horizontal" ? Math.floor(widget.width / days) : widget.width;
        const itemHeight = layout === "vertical" ? Math.floor(widget.height / days) : widget.height;

        for (let i = 0; i < days; i++) {
            const dayDiv = document.createElement("div");
            dayDiv.style.display = "flex";
            dayDiv.style.flexDirection = "column";
            dayDiv.style.alignItems = "center";
            dayDiv.style.justifyContent = "flex-start";
            dayDiv.style.width = `${itemWidth}px`;
            dayDiv.style.minHeight = layout === "vertical" ? `${itemHeight}px` : "auto";
            dayDiv.style.color = colorStyle;
            dayDiv.style.fontFamily = fontFamily;

            // Day name
            const dayLabel = document.createElement("div");
            dayLabel.style.fontSize = `${dayFontSize}px`;
            dayLabel.style.fontWeight = "400";
            dayLabel.style.marginBottom = "2px";
            dayLabel.textContent = dayNames[i] || `D${i}`;
            dayDiv.appendChild(dayLabel);

            // Weather icon
            const iconDiv = document.createElement("div");
            const iconData = weatherIcons[i % weatherIcons.length];
            const cp = 0xf0000 + parseInt(iconData.code.slice(1), 16);
            iconDiv.innerText = String.fromCodePoint(cp);
            iconDiv.style.fontSize = `${iconSize}px`;
            iconDiv.style.fontFamily = "MDI, system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
            iconDiv.style.lineHeight = "1.1";
            dayDiv.appendChild(iconDiv);

            // Temperature
            const tempDiv = document.createElement("div");
            tempDiv.style.fontSize = `${tempFontSize}px`;
            tempDiv.style.fontWeight = "400";
            const temp = mockTemps[i % mockTemps.length];
            if (showHighLow) {
                tempDiv.textContent = `${temp.high}°/${temp.low}°`;
            } else {
                tempDiv.textContent = `${temp.high}°`;
            }
            dayDiv.appendChild(tempDiv);

            el.appendChild(dayDiv);
        }

        // Show entity warning if no entity selected
        if (!widget.entity_id) {
            const warning = document.createElement("div");
            warning.style.position = "absolute";
            warning.style.bottom = "2px";
            warning.style.right = "4px";
            warning.style.fontSize = "9px";
            warning.style.color = "#888";
            warning.textContent = "⚠ No weather entity";
            el.style.position = "relative";
            el.appendChild(warning);
        }
    };

    // Register with FeatureRegistry
    const registerFeature = () => {
        if (window.FeatureRegistry) {
            window.FeatureRegistry.register("weather_forecast", { render });
            return true;
        }
        return false;
    };

    if (!registerFeature()) {
        setTimeout(() => {
            if (!registerFeature()) {
                console.error("[weather_forecast/render.js] FeatureRegistry not found!");
            }
        }, 100);
    }
})();
