(() => {
    const render = (el, widget, { getColorStyle }) => {
        const props = widget.props || {};
        const color = props.color || "black";
        const iconSize = props.icon_size || 24;

        el.style.display = "flex";
        el.style.alignItems = "center";
        el.style.justifyContent = "space-around";
        el.style.padding = "0 10px";
        el.style.boxSizing = "border-box";
        el.style.color = getColorStyle(color);
        el.style.overflow = "hidden";

        if (props.show_background) {
            el.style.backgroundColor = getColorStyle(props.background_color || "gray");
            el.style.borderRadius = (props.border_radius || 8) + "px";
        } else {
            el.style.backgroundColor = "transparent";
            el.style.borderRadius = "0";
        }

        const buttons = [];

        if (props.show_prev !== false) {
            buttons.push({ type: 'prev', icon: 'F0141' });
        }
        if (props.show_home !== false) {
            buttons.push({ type: 'home', icon: 'F02DC' });
        }
        if (props.show_next !== false) {
            buttons.push({ type: 'next', icon: 'F0142' });
        }

        el.innerHTML = "";

        buttons.forEach(btn => {
            const icon = document.createElement("span");
            const cp = parseInt(btn.icon, 16);
            icon.innerText = String.fromCodePoint(cp);
            icon.style.fontFamily = "'Material Design Icons', system-ui, -sans-serif";
            icon.style.fontSize = iconSize + "px";
            icon.style.lineHeight = "1";
            icon.style.cursor = "pointer";
            icon.style.padding = "5px";
            icon.style.transition = "transform 0.1s";

            icon.onmousedown = () => icon.style.transform = "scale(0.9)";
            icon.onmouseup = () => icon.style.transform = "scale(1)";
            icon.onmouseleave = () => icon.style.transform = "scale(1)";

            el.appendChild(icon);
        });
    };

    if (window.FeatureRegistry) {
        window.FeatureRegistry.register("template_nav_bar", { render });
    }
})();
