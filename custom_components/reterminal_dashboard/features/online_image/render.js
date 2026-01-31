(function() {
    function render(element, widget, helpers) {
        const props = widget.props || {};
        const url = props.url || "";
        const invert = !!props.invert;

        element.style.overflow = "hidden";
        element.style.backgroundColor = "#f0f0f0";
        element.style.display = "flex";
        element.style.alignItems = "center";
        element.style.justifyContent = "center";

        if (url) {
            const img = document.createElement("img");
            img.src = url;
            img.style.width = "100%";
            img.style.height = "100%";
            img.style.objectFit = "contain";
            img.draggable = false;

            if (invert) {
                img.style.filter = "invert(1)";
            }

            img.onerror = () => {
                element.innerHTML = "<div style='text-align:center;color:#666;font-size:10px;padding:4px;'>" +
                    "Remote Image<br/>(Load Failed)</div>";
            };

            element.appendChild(img);
        } else {
            const placeholder = document.createElement("div");
            placeholder.style.textAlign = "center";
            placeholder.style.color = "#aaa";
            placeholder.style.fontSize = "10px";
            placeholder.innerHTML = "Remote Image<br/><span style='font-size:9px;'>Enter URL</span>";
            element.appendChild(placeholder);
        }
    }

    // Register with FeatureRegistry
    if (window.FeatureRegistry) {
        window.FeatureRegistry.register('online_image', { render: render });
    }
})();
