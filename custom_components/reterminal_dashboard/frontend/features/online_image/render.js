(() => {
    const render = (el, widget, { getColorStyle }) => {
        const props = widget.props || {};
        const url = props.url || props.path || "";
        const invert = !!props.invert;

        el.style.boxSizing = "border-box";
        el.style.backgroundColor = "#f5f5f5";
        el.style.display = "flex";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";
        el.style.overflow = "hidden";
        el.style.color = "#666";

        // Clear previous content
        el.innerText = "";
        el.style.backgroundImage = "";

        if (url) {
            const img = document.createElement("img");
            img.style.maxWidth = "100%";
            img.style.maxHeight = "100%";
            img.style.objectFit = "contain";
            img.draggable = false;

            if (invert) {
                img.style.filter = "invert(1)";
            }

            img.onerror = () => {
                el.innerHTML = "<div style='text-align:center;color:#666;font-size:11px;padding:8px;line-height:1.4;'>" +
                    "🖼️<br/><strong>Online Image</strong><br/>" +
                    "<span style='color:#999;font-size:9px;'>" +
                    (invert ? "(inverted) " : "") +
                    "Load Failed</span></div>";
            };

            img.onload = () => {
                // Overlay info
                const filename = url.split("/").pop();
                const overlay = document.createElement("div");
                overlay.style.position = "absolute";
                overlay.style.bottom = "2px";
                overlay.style.right = "2px";
                overlay.style.background = "rgba(0,0,0,0.6)";
                overlay.style.color = "white";
                overlay.style.padding = "2px 4px";
                overlay.style.fontSize = "8px";
                overlay.style.borderRadius = "2px";
                overlay.textContent = filename;
                // el.style.position = "relative"; // REMOVED: Breaks absolute positioning
                el.appendChild(overlay);
            };

            img.src = url;
            el.appendChild(img);
        } else {
            const placeholder = document.createElement("div");
            placeholder.style.textAlign = "center";
            placeholder.style.color = "#aaa";
            placeholder.style.fontSize = "11px";
            placeholder.innerHTML = "🖼️<br/>Online Image<br/><span style='font-size:9px;color:#ccc;'>Enter URL in properties →</span>";
            el.appendChild(placeholder);
        }
    };

    if (window.FeatureRegistry) {
        window.FeatureRegistry.register("online_image", { render });
    }
})();
