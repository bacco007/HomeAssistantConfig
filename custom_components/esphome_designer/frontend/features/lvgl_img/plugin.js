/**
 * LVGL Image Plugin
 */

const render = (el, widget, { getColorStyle }) => {
    const props = widget.props || {};
    const pColor = getColorStyle(props.color || "black");

    el.innerHTML = "";
    el.style.overflow = "visible"; // Allow resize handles to be seen

    // Create wrapper for content clipping and styling
    const content = document.createElement("div");
    content.style.width = "100%";
    content.style.height = "100%";
    content.style.overflow = "hidden";
    content.style.border = "1px dashed #ccc";
    content.style.display = "flex";
    content.style.alignItems = "center";
    content.style.justifyContent = "center";
    content.style.color = pColor;
    content.style.backgroundColor = "#f0f0f0";
    content.style.boxSizing = "border-box"; // Ensure border doesn't overflow

    el.appendChild(content);

    const src = props.src || "symbol_image";

    const label = document.createElement("div");
    label.style.textAlign = "center";

    if (props.rotation) {
        label.style.transform = `rotate(${props.rotation * 0.1}deg)`;
    }

    if (src.includes("/") || src.includes(".")) {
        label.textContent = "IMG: " + src;
    } else {
        label.textContent = "Symbol: " + src;
    }

    label.style.fontSize = "12px";
    content.appendChild(label);
};

const exportLVGL = (w, { common, convertColor }) => {
    const p = w.props || {};
    let src = (p.src || p.path || p.url || "symbol_image");
    return {
        image: {
            ...common,
            src: src,
            angle: (p.rotation || 0),
            pivot_x: (p.pivot_x || 0),
            pivot_y: (p.pivot_y || 0),
            image_recolor: convertColor(p.color),
            image_recolor_opa: "cover"
        }
    };
};

export default {
    id: "lvgl_img",
    name: "Image (lv)",
    category: "LVGL",
    defaults: {
        src: "symbol_image",
        rotation: 0,
        color: "black",
        pivot_x: 0,
        pivot_y: 0,
        scale: 256
    },
    render,
    exportLVGL
};
