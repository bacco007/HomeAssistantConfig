(() => {
    const render = (el, widget, { getColorStyle }) => {
        const props = widget.props || {};
        const text = props.text || "";
        const placeholder = props.placeholder || "Enter text...";

        el.innerHTML = "";
        el.style.display = "flex";
        el.style.flexDirection = "column";
        el.style.boxSizing = "border-box";
        el.style.backgroundColor = "#fff";
        el.style.border = "1px solid #999";
        el.style.borderRadius = "3px";
        el.style.padding = "5px";
        el.style.overflow = "hidden";

        // Text content or placeholder
        const content = document.createElement("div");
        content.style.flex = "1";
        content.style.fontFamily = "Roboto, sans-serif";
        content.style.fontSize = "14px";
        content.style.overflow = "hidden";
        content.style.textOverflow = "ellipsis";

        if (text) {
            content.textContent = text;
            content.style.color = "#000";
        } else {
            content.textContent = placeholder;
            content.style.color = "#ccc";
        }

        el.appendChild(content);

        // Cursor indicator
        const cursor = document.createElement("div");
        cursor.style.width = "1px";
        cursor.style.height = "14px";
        cursor.style.backgroundColor = "#000";
        cursor.style.position = "absolute";
        cursor.style.left = "6px";
        cursor.style.top = "6px";
        el.style.position = "relative";
        el.appendChild(cursor);
    };

    const registerFeature = () => {
        if (window.FeatureRegistry) {
            window.FeatureRegistry.register("lvgl_textarea", { render });
            return true;
        }
        return false;
    };

    if (!registerFeature()) {
        setTimeout(() => {
            if (!registerFeature()) {
                console.error("[lvgl_textarea] FeatureRegistry not found!");
            }
        }, 100);
    }
})();
