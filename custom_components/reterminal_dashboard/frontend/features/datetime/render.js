(() => {
    const render = (el, widget, { getColorStyle }) => {
        const props = widget.props || {};
        const format = props.format || "time_date";
        const timeFontSize = props.time_font_size || 28;
        const dateFontSize = props.date_font_size || 16;
        const fontStyle = props.italic ? "italic" : "normal";
        const fontFamily = (props.font_family || "Roboto") + ", sans-serif";
        const colorStyle = getColorStyle(props.color);

        // Clear and setup container
        el.innerHTML = "";
        el.style.display = "flex";
        el.style.display = "flex";
        el.style.flexDirection = "column";

        // Handle Alignment
        const align = props.text_align || "CENTER";
        if (align.includes("LEFT")) {
            el.style.alignItems = "flex-start";
            el.style.textAlign = "left";
        } else if (align.includes("RIGHT")) {
            el.style.alignItems = "flex-end";
            el.style.textAlign = "right";
        } else {
            el.style.alignItems = "center";
            el.style.textAlign = "center";
        }
        el.style.justifyContent = "center"; // Vertical alignment always center for now as it fills the box


        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

        if (format === "time_only") {
            const timeEl = document.createElement("div");
            timeEl.style.fontSize = `${timeFontSize}px`;
            timeEl.style.fontWeight = "bold";
            timeEl.style.fontStyle = fontStyle;
            timeEl.style.fontFamily = fontFamily;
            timeEl.style.color = colorStyle;
            timeEl.textContent = timeStr;
            el.appendChild(timeEl);
        } else if (format === "date_only") {
            const dateEl = document.createElement("div");
            dateEl.style.fontSize = `${dateFontSize}px`;
            dateEl.style.fontStyle = fontStyle;
            dateEl.style.fontFamily = fontFamily;
            dateEl.style.color = colorStyle;
            dateEl.textContent = dateStr;
            el.appendChild(dateEl);
        } else if (format === "weekday_day_month") {
            const dateEl = document.createElement("div");
            dateEl.style.fontSize = `${dateFontSize}px`;
            dateEl.style.fontStyle = fontStyle;
            dateEl.style.fontFamily = fontFamily;
            dateEl.style.color = colorStyle;

            // "Monday 08 December" format
            const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
            const dayNum = String(now.getDate()).padStart(2, '0');
            const monthName = now.toLocaleDateString('en-US', { month: 'long' });
            dateEl.textContent = `${dayName} ${dayNum} ${monthName}`;

            el.appendChild(dateEl);
        } else {
            const timeEl = document.createElement("div");
            timeEl.style.fontSize = `${timeFontSize}px`;
            timeEl.style.fontWeight = "bold";
            timeEl.style.fontStyle = fontStyle;
            timeEl.style.fontFamily = fontFamily;
            timeEl.style.color = colorStyle;
            timeEl.textContent = timeStr;

            const dateEl = document.createElement("div");
            dateEl.style.fontSize = `${dateFontSize}px`;
            dateEl.style.marginTop = "2px";
            dateEl.style.fontStyle = fontStyle;
            dateEl.style.fontFamily = fontFamily;
            dateEl.style.color = colorStyle;
            dateEl.textContent = dateStr;

            el.appendChild(timeEl);
            el.appendChild(dateEl);
        }
    };

    // Register with FeatureRegistry - try immediately and with delay for HA loading
    const registerFeature = () => {
        if (window.FeatureRegistry) {
            window.FeatureRegistry.register("datetime", { render });
            return true;
        }
        return false;
    };

    if (!registerFeature()) {
        setTimeout(() => {
            if (!registerFeature()) {
                console.error("[datetime/render.js] FeatureRegistry not found!");
            }
        }, 100);
    }
})();
