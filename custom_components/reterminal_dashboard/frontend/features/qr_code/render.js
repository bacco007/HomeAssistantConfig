(function () {
    function render(element, widget, helpers) {
        const props = widget.props || {};
        const value = props.value || "https://esphome.io";
        const color = props.color || "black";
        const ecc = props.ecc || "LOW";

        element.style.boxSizing = "border-box";
        element.style.display = "flex";
        element.style.alignItems = "flex-start";
        element.style.justifyContent = "flex-start";
        // element.style.backgroundColor = "#fff"; // Removed to allow transparency
        element.style.overflow = "hidden";
        element.style.padding = "0";
        element.innerHTML = "";

        // Map ECC to qrcode-generator type
        const eccMap = { "LOW": "L", "MEDIUM": "M", "QUARTILE": "Q", "HIGH": "H" };
        const eccLevel = eccMap[ecc] || "L";

        // Check if qrcode library is available
        if (typeof qrcode === "undefined") {
            element.innerHTML = '<div style="color:#999;font-size:10px;text-align:center;">QR Library<br>Loading...</div>';
            return;
        }

        try {
            // Generate real QR code (type 0 = auto-detect size)
            const qr = qrcode(0, eccLevel);
            qr.addData(value);
            qr.make();

            // Get module count and auto-calculate scale to fit widget
            // This matches how ESPHome will render it
            const moduleCount = qr.getModuleCount();
            const availableSize = Math.min(widget.width, widget.height);
            const cellSize = Math.max(1, Math.floor(availableSize / moduleCount));
            const qrSize = cellSize * moduleCount;

            // Create canvas for QR code
            const canvas = document.createElement("canvas");
            canvas.width = qrSize;
            canvas.height = qrSize;
            canvas.style.imageRendering = "pixelated";

            const ctx = canvas.getContext("2d");
            // ctx.fillStyle = "#fff"; // Removed default white background
            // ctx.fillRect(0, 0, qrSize, qrSize);

            // Draw QR code modules
            const fillColor = color === "white" ? "#fff" : "#000";
            ctx.fillStyle = fillColor;

            for (let row = 0; row < moduleCount; row++) {
                for (let col = 0; col < moduleCount; col++) {
                    if (qr.isDark(row, col)) {
                        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
                    }
                }
            }

            element.appendChild(canvas);

            // Store calculated scale in props for yaml export to use
            // This ensures ESPHome renders at the same size
            widget.props._calculatedScale = cellSize;

        } catch (e) {
            element.innerHTML = '<div style="color:#c00;font-size:10px;text-align:center;">QR Error:<br>' + e.message + '</div>';
        }
    }

    if (window.FeatureRegistry) {
        window.FeatureRegistry.register("qr_code", { render });
    }
})();
