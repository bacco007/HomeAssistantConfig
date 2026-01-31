(() => {
    const render = (el, widget, { getColorStyle }) => {
        const props = widget.props || {};
        const pColor = getColorStyle(props.color || "black");

        // Clear
        el.innerHTML = "";
        el.style.backgroundColor = "white";
        el.style.border = `1px solid ${pColor}`;
        el.style.display = "flex";
        el.style.flexDirection = "column";

        // Title
        const title = document.createElement("div");
        title.style.textAlign = "center";
        title.style.fontSize = "12px";
        title.style.color = pColor;
        title.textContent = props.title || "Chart";
        el.appendChild(title);

        // Chart Area (SVG)
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.style.flex = "1";
        svg.style.width = "100%";
        // svg.style.height = "100%"; // Flex handles it
        el.appendChild(svg);

        // Grid (simple)
        for (let i = 1; i < 4; i++) {
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", "0%");
            line.setAttribute("y1", `${i * 25}%`);
            line.setAttribute("x2", "100%");
            line.setAttribute("y2", `${i * 25}%`);
            line.setAttribute("stroke", "#eee");
            line.setAttribute("stroke-width", "1");
            svg.appendChild(line);
        }

        // Data Line (Mock sine wave)
        const points = [];
        const w = widget.width;
        const h = widget.height - 15; // approximate
        for (let i = 0; i <= 10; i++) {
            const x = (i / 10) * 100; // percent
            const y = 50 + Math.sin(i) * 30; // percent
            points.push(`${x},${y}`);
        }

        const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        polyline.setAttribute("points", points.join(" "));
        polyline.setAttribute("fill", "none");
        polyline.setAttribute("stroke", pColor);
        polyline.setAttribute("stroke-width", "2");
        // Convert percentage points to viewBox if needed, but percentages work in SVG 
        // actually points="x,y" are usually user units. Let's use % logic carefully or viewbox.
        // Simplest: just use coordinate mapping 0-100 logic and a viewBox.
        svg.setAttribute("viewBox", "0 0 100 100");
        svg.setAttribute("preserveAspectRatio", "none");

        svg.appendChild(polyline);
    };

    if (window.FeatureRegistry) {
        window.FeatureRegistry.register("lvgl_chart", { render });
    }
})();
