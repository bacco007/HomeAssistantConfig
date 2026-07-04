/**
 * LVGL Bar Plugin
 */

const render = (el, widget, { getColorStyle }) => {
    const props = widget.props || {};
    const fgColor = getColorStyle(props.color || "black");
    const bgColor = getColorStyle(props.bg_color || "gray");

    el.innerHTML = "";
    el.style.backgroundColor = bgColor;
    el.style.borderRadius = "4px";
    el.style.overflow = "hidden";

    const min = props.min || 0;
    const max = props.max || 100;
    const val = props.value !== undefined ? props.value : 50;
    const range = max - min;
    const pct = Math.max(0, Math.min(100, ((val - min) / (range || 1)) * 100));
    const hasLabels = !!(props.top_text || props.bottom_text);

    if (!hasLabels) {
        const bar = document.createElement("div");
        bar.style.position = "absolute";
        bar.style.left = "0";
        bar.style.top = "0";
        bar.style.height = "100%";
        bar.style.width = `${pct}%`;
        bar.style.backgroundColor = fgColor;
        el.appendChild(bar);
        return;
    }

    el.style.display = "flex";
    el.style.flexDirection = "column";

    const labelColor = getColorStyle(props.label_color || props.color || "black");
    const addLabel = (text) => {
        if (!text) return;
        const label = document.createElement("div");
        label.textContent = text;
        label.style.flex = "0 0 auto";
        label.style.fontSize = `${props.label_font_size || 12}px`;
        label.style.lineHeight = `${(props.label_font_size || 12) + 2}px`;
        label.style.textAlign = "center";
        label.style.color = labelColor;
        label.style.whiteSpace = "nowrap";
        label.style.overflow = "hidden";
        label.style.textOverflow = "ellipsis";
        el.appendChild(label);
    };

    addLabel(props.top_text);

    const track = document.createElement("div");
    track.style.position = "relative";
    track.style.flex = "1 1 auto";
    track.style.width = "100%";
    track.style.minHeight = "4px";
    track.style.backgroundColor = bgColor;
    track.style.overflow = "hidden";

    const bar = document.createElement("div");
    bar.style.position = "absolute";
    bar.style.left = "0";
    bar.style.top = "0";
    bar.style.height = "100%";
    bar.style.width = `${pct}%`;
    bar.style.backgroundColor = fgColor;

    track.appendChild(bar);
    el.appendChild(track);
    addLabel(props.bottom_text);
};

const exportLVGL = (w, { common, convertColor, getLVGLFont }) => {
    const p = w.props || {};
    let barValue = p.value || 0;
    if (w.entity_id) {
        const safeId = w.entity_id.replace(/[^a-zA-Z0-9_]/g, "_");
        barValue = `!lambda "return id(${safeId}).state;"`;
    }
    const bar = {
        bar: {
            ...common,
            min_value: p.min || 0,
            max_value: p.max || 100,
            value: barValue,
            bg_color: convertColor(p.bg_color || "gray"),
            indicator: { bg_color: convertColor(p.color) },
            start_value: p.mode === "range" ? p.start_value : undefined,
            mode: p.mode
        }
    };

    const topText = String(p.top_text || "").trim();
    const bottomText = String(p.bottom_text || "").trim();
    if (!topText && !bottomText) return bar;

    const labelFontSize = parseInt(p.label_font_size || 12, 10);
    const labelHeight = labelFontSize + 4;
    const topHeight = topText ? labelHeight : 0;
    const bottomHeight = bottomText ? labelHeight : 0;
    const barHeight = Math.max(4, Math.round((w.h || w.height || common.height || 20) - topHeight - bottomHeight));
    const childBar = {
        ...bar.bar,
        id: w.id,
        x: 0,
        y: topHeight,
        width: "100%",
        height: barHeight
    };

    const widgets = [];
    if (topText) {
        widgets.push({
            label: {
                x: 0,
                y: 0,
                width: "100%",
                height: labelHeight,
                text: `"${topText.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`,
                text_align: "CENTER",
                text_font: getLVGLFont("Roboto", labelFontSize, 400),
                text_color: convertColor(p.label_color || p.color || "black")
            }
        });
    }
    widgets.push({ bar: childBar });
    if (bottomText) {
        widgets.push({
            label: {
                x: 0,
                y: topHeight + barHeight,
                width: "100%",
                height: labelHeight,
                text: `"${bottomText.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`,
                text_align: "CENTER",
                text_font: getLVGLFont("Roboto", labelFontSize, 400),
                text_color: convertColor(p.label_color || p.color || "black")
            }
        });
    }

    return {
        obj: {
            ...common,
            id: `${w.id}_bar_group`,
            bg_opa: "transp",
            border_width: 0,
            pad_all: 0,
            widgets
        }
    };
};

const onExportNumericSensors = (context) => {
    const { widgets, isLvgl, pendingTriggers } = context;
    if (!widgets) return;

    for (const w of widgets) {
        if (w.type !== "lvgl_bar") continue;

        const entityId = (w.entity_id || w.props?.entity_id || "").trim();
        if (!entityId) continue;

        if (isLvgl && pendingTriggers) {
            if (!pendingTriggers.has(entityId)) {
                pendingTriggers.set(entityId, new Set());
            }
            pendingTriggers.get(entityId).add(`- lvgl.widget.refresh: ${w.id}`);
        }
    }
};

export default {
    id: "lvgl_bar",
    name: "Bar",
    category: "LVGL",
    defaults: {
        value: 50,
        min: 0,
        max: 100,
        color: "blue",
        bg_color: "gray",
        start_value: 0,
        mode: "normal",
        opa: 255,
        entity_id: "",
        opacity: 255,
        top_text: "",
        bottom_text: "",
        label_color: "black",
        label_font_size: 12
    },
    schema: [
        {
            section: "Content",
            fields: [
                { key: "entity_id", target: "root", label: "Value Entity ID", type: "entity_picker", default: "" }
            ]
        },
        {
            section: "Range",
            fields: [
                { key: "value", label: "Current Value", type: "number", default: 50 },
                { key: "min", label: "Min Value", type: "number", default: 0 },
                { key: "max", label: "Max Value", type: "number", default: 100 },
                { key: "start_value", label: "Start Value (Range)", type: "number", default: 0 },
                { key: "mode", label: "Mode", type: "select", options: ["normal", "symmetrical", "range"], default: "normal" }
            ]
        },
        {
            section: "Labels",
            fields: [
                { key: "top_text", label: "Top Text", type: "text", default: "" },
                { key: "bottom_text", label: "Bottom Text", type: "text", default: "" },
                { key: "label_color", label: "Text Color", type: "color", default: "black" },
                { key: "label_font_size", label: "Text Size", type: "number", default: 12 }
            ]
        },
        {
            section: "Appearance",
            fields: [
                { key: "color", label: "Progress Color", type: "color", default: "blue" },
                { key: "bg_color", label: "Track Color", type: "color", default: "gray" },
                { key: "opa", label: "Opacity (0 - 255)", type: "number", default: 255 },
                { key: "opacity", label: "Opacity (0 - 255)", type: "number", default: 255 }
            ]
        }
    ],
    render,
    exportLVGL,
    onExportNumericSensors
};
