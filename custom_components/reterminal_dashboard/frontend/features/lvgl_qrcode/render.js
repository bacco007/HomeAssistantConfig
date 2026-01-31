(() => {
    const render = (el, widget, { getColorStyle }) => {
        const props = widget.props || {};
        const fgColor = getColorStyle(props.color || "black");
        const bgColor = getColorStyle(props.bg_color || "white");

        el.innerHTML = "";
        el.style.backgroundColor = bgColor;
        el.style.display = "flex";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";

        const text = props.text || "https://esphome.io";

        try {
            // Use the global qrcode generator if available (loaded in editor.html)
            if (window.qrcode) {
                const typeNumber = 0;
                const errorCorrectionLevel = 'L';
                const qr = qrcode(typeNumber, errorCorrectionLevel);
                qr.addData(text);
                qr.make();

                // Create SVG tag properly
                // The library returns an IMG tag string typically, or we can use createSvgTag
                const svgString = qr.createSvgTag(widget.props.scale || 4, 0);
                // We need to inject this SVG and color it
                const helper = document.createElement('div');
                helper.innerHTML = svgString;
                const svg = helper.querySelector('svg');
                if (svg) {
                    svg.style.width = "100%";
                    svg.style.height = "100%";
                    // Color hack: The library usually produces black paths. 
                    // We can force fill on the rects or paths.
                    // Actually simpler to just use a placeholder if library coloring is hard
                    svg.style.fill = fgColor;
                }
                el.appendChild(helper.firstChild); // Append the SVG
            } else {
                el.textContent = "QR";
                el.style.outline = "2px solid " + fgColor;
            }
        } catch (e) {
            console.error("QR Render error", e);
            el.textContent = "QR Error";
        }
    };

    if (window.FeatureRegistry) {
        window.FeatureRegistry.register("lvgl_qrcode", { render });
    }
})();
