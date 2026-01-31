(function() {
    function render(element, widget, helpers) {
        const props = widget.props || {};
        const { getColorStyle } = helpers;

        const label = props.title || "";
        const valueFormat = props.value_format || "label_value";
        const labelFontSize = parseInt(props.label_font_size || 14, 10);
        const valueFontSize = parseInt(props.value_font_size || 20, 10);
        const fontFamily = props.font_family || "Inter";
        const fontWeight = parseInt(props.font_weight || 400, 10);
        const precision = parseInt(props.precision != null ? props.precision : -1, 10);
        const unit = props.unit || "";
        const color = props.color || "black";
        const colorStyle = getColorStyle(color);

        // Mock value for preview
        let displayValue = "123.4";
        if (precision >= 0) {
            displayValue = parseFloat(displayValue).toFixed(precision);
        }
        if (unit) {
            displayValue += unit;
        } else if (props.entity_id && props.entity_id.includes("temperature")) {
            displayValue += "°C";
        }

        element.style.display = "flex";
        element.style.flexDirection = "column";
        element.style.justifyContent = "center";
        element.style.color = colorStyle;
        element.style.fontFamily = fontFamily + ", sans-serif";
        element.style.fontWeight = String(fontWeight);
        element.style.whiteSpace = "nowrap";

        // Helper for alignment
        const getTextAlign = (align) => {
            if (align === "TOP_CENTER") return "center";
            if (align === "TOP_RIGHT") return "right";
            return "left";
        };

        const textAlign = props.text_align || "TOP_LEFT";
        const labelAlign = props.label_align || textAlign;
        const valueAlign = props.value_align || textAlign;

        element.innerHTML = "";

        if (valueFormat === "label_newline_value" && label) {
            const container = document.createElement("div");
            container.style.display = "flex";
            container.style.flexDirection = "column";
            container.style.width = "100%";

            const labelDiv = document.createElement("div");
            labelDiv.style.fontSize = labelFontSize + "px";
            labelDiv.style.textAlign = getTextAlign(labelAlign);
            labelDiv.textContent = label;

            const valueDiv = document.createElement("div");
            valueDiv.style.fontSize = valueFontSize + "px";
            valueDiv.style.textAlign = getTextAlign(valueAlign);
            valueDiv.textContent = displayValue;

            container.appendChild(labelDiv);
            container.appendChild(valueDiv);
            element.appendChild(container);
        } else if (valueFormat === "label_value" && label) {
            const div = document.createElement("div");
            div.style.fontSize = valueFontSize + "px";
            div.style.textAlign = getTextAlign(valueAlign);
            div.style.width = "100%";
            div.textContent = `${label}: ${displayValue}`;
            element.appendChild(div);
        } else {
            // value_only or no label
            const div = document.createElement("div");
            div.style.fontSize = valueFontSize + "px";
            div.style.textAlign = getTextAlign(valueAlign);
            div.style.width = "100%";
            div.textContent = displayValue;
            element.appendChild(div);
        }
    }

    if (window.FeatureRegistry) {
        window.FeatureRegistry.register("sensor_text", { render });
    }
})();
