(function() {
    function render(element, widget, helpers) {
        const props = widget.props || {};
        const value = props.value || "https://esphome.io";
        const scale = parseInt(props.scale || 2, 10);
        const color = props.color || "black";
        const colorValue = helpers.getColorStyle(color);
        
        element.style.boxSizing = "border-box";
        element.style.display = "flex";
        element.style.alignItems = "center";
        element.style.justifyContent = "center";
        element.style.backgroundColor = color === "black" ? "#fff" : "#333";
        element.style.border = "1px dashed #aaa";
        element.style.overflow = "hidden";
        
        // Create a simplified QR code preview
        const container = document.createElement("div");
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.alignItems = "center";
        container.style.justifyContent = "center";
        container.style.width = "100%";
        container.style.height = "100%";
        container.style.padding = "4px";
        
        // QR code visual representation (simplified pattern)
        const qrSize = Math.min(widget.width, widget.height) - 16;
        const qrPreview = document.createElement("div");
        qrPreview.style.width = qrSize + "px";
        qrPreview.style.height = qrSize + "px";
        qrPreview.style.backgroundColor = "#fff";
        qrPreview.style.border = "2px solid " + colorValue;
        qrPreview.style.position = "relative";
        qrPreview.style.display = "grid";
        qrPreview.style.gridTemplateColumns = "repeat(7, 1fr)";
        qrPreview.style.gridTemplateRows = "repeat(7, 1fr)";
        qrPreview.style.gap = "1px";
        qrPreview.style.padding = "2px";
        
        // Create a QR-like pattern (finder patterns at corners)
        const pattern = [
            1,1,1,0,1,1,1,
            1,0,1,0,1,0,1,
            1,1,1,0,1,1,1,
            0,0,0,0,0,0,0,
            1,1,1,0,1,0,1,
            1,0,1,0,0,1,0,
            1,1,1,0,1,0,1
        ];
        
        pattern.forEach((filled) => {
            const cell = document.createElement("div");
            cell.style.backgroundColor = filled ? colorValue : "#fff";
            qrPreview.appendChild(cell);
        });
        
        container.appendChild(qrPreview);
        
        // Label showing the value (truncated)
        const label = document.createElement("div");
        label.style.fontSize = "9px";
        label.style.color = "#666";
        label.style.marginTop = "4px";
        label.style.maxWidth = "100%";
        label.style.overflow = "hidden";
        label.style.textOverflow = "ellipsis";
        label.style.whiteSpace = "nowrap";
        label.style.textAlign = "center";
        const displayValue = value.length > 25 ? value.substring(0, 22) + "..." : value;
        label.textContent = displayValue;
        container.appendChild(label);
        
        // Scale indicator
        const scaleLabel = document.createElement("div");
        scaleLabel.style.fontSize = "8px";
        scaleLabel.style.color = "#999";
        scaleLabel.textContent = "Scale: " + scale + "x";
        container.appendChild(scaleLabel);
        
        element.innerHTML = "";
        element.appendChild(container);
    }

    if (window.FeatureRegistry) {
        window.FeatureRegistry.register("qr_code", { render });
    }
})();
