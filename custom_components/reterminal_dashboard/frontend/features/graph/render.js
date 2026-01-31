(() => {
    const render = (el, widget, { getColorStyle }) => {
        const props = widget.props || {};
        const entityId = widget.entity_id || "";
        const borderEnabled = props.border !== false;
        const color = props.color || "black";
        const colorStyle = getColorStyle(color);

        el.style.boxSizing = "border-box";
        el.style.backgroundColor = "#ffffff";
        // el.style.position = "relative"; // REMOVED: Breaks absolute positioning in editor
        el.style.overflow = "hidden";

        if (borderEnabled) {
            el.style.border = "2px solid " + colorStyle;
        }

        // Create SVG for the graph
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        svg.setAttribute("viewBox", `0 0 ${widget.width} ${widget.height}`);
        svg.style.display = "block";

        // Draw internal grid
        if (typeof window.drawInternalGrid === 'function') {
            window.drawInternalGrid(svg, widget.width, widget.height, props.x_grid, props.y_grid);
        }

        // Generate mock data
        const minVal = parseFloat(props.min_value) || 0;
        const maxVal = parseFloat(props.max_value) || 100;
        let points = [];
        if (typeof window.generateMockData === 'function') {
            points = window.generateMockData(widget.width, widget.height, minVal, maxVal);
        }

        // Create polyline
        const polyline = document.createElementNS(svgNS, "polyline");
        const pointsStr = points.map(p => `${p.x},${p.y}`).join(" ");
        polyline.setAttribute("points", pointsStr);
        polyline.setAttribute("fill", "none");
        polyline.setAttribute("stroke", colorStyle);
        const thickness = parseInt(props.line_thickness || 3, 10);
        polyline.setAttribute("stroke-width", thickness);
        polyline.setAttribute("stroke-linejoin", "round");

        const lineType = props.line_type || "SOLID";
        if (lineType === "DASHED") {
            polyline.setAttribute("stroke-dasharray", "5,5");
        } else if (lineType === "DOTTED") {
            polyline.setAttribute("stroke-dasharray", "2,2");
        }

        svg.appendChild(polyline);
        el.appendChild(svg);

        // Draw smart axis labels (outside border)
        // el is not yet added to canvas when render() is called, so we defer this
        if (typeof window.drawSmartAxisLabels === 'function') {
            const widgetId = widget.id;
            setTimeout(() => {
                const canvas = document.getElementById("canvas");
                // Only add labels if this widget still exists in the DOM (prevents stale labels after layout switch)
                const widgetStillExists = canvas && canvas.querySelector(`[data-id="${widgetId}"]`);
                if (canvas && widgetStillExists) {
                    window.drawSmartAxisLabels(canvas, widget.x, widget.y, widget.width, widget.height, minVal, maxVal, props.duration);
                }
            }, 0);
        }

        // Add label if no entity selected OR if title is set
        if (widget.title) {
            const label = document.createElement("div");
            label.style.position = "absolute";
            label.style.top = "2px";
            label.style.left = "50%";
            label.style.transform = "translateX(-50%)";
            label.style.fontSize = "10px";
            label.style.color = colorStyle;
            label.style.backgroundColor = "rgba(255,255,255,0.7)";
            label.style.padding = "0 4px";
            label.style.borderRadius = "2px";
            label.style.whiteSpace = "nowrap";
            label.textContent = widget.title;
            el.appendChild(label);
        } else if (!entityId) {
            const label = document.createElement("div");
            label.style.position = "absolute";
            label.style.top = "50%";
            label.style.left = "50%";
            label.style.transform = "translate(-50%, -50%)";
            label.style.fontSize = "10px";
            label.style.color = "#999";
            label.style.backgroundColor = "rgba(255,255,255,0.8)";
            label.style.padding = "2px 6px";
            label.textContent = "graph (No Entity)";
            el.appendChild(label);
        }
    };

    if (window.FeatureRegistry) {
        window.FeatureRegistry.register("graph", { render });
    }
})();
