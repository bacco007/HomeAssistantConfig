(function() {
    function render(element, widget, helpers) {
        const props = widget.props || {};
        const { getColorStyle } = helpers;

        const title = props.title || "";
        const duration = props.duration || "1h";
        const xGrid = props.x_grid || "";
        const yGrid = props.y_grid || "";
        const lineType = props.line_type || "SOLID";
        const lineThickness = parseInt(props.line_thickness || 3, 10);
        const continuous = props.continuous !== false; // Default true
        const color = props.color || "black";
        const colorStyle = getColorStyle(color);
        const showBorder = props.border !== false; // Default true

        // Dimensions
        const width = widget.width || 100;
        const height = widget.height || 100;

        // Create SVG container
        element.innerHTML = "";
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        svg.style.overflow = "visible"; // Allow labels to spill out
        element.appendChild(svg);

        // Border
        if (showBorder) {
            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("x", 0);
            rect.setAttribute("y", 0);
            rect.setAttribute("width", width);
            rect.setAttribute("height", height);
            rect.setAttribute("fill", "none");
            rect.setAttribute("stroke", colorStyle);
            rect.setAttribute("stroke-width", "1");
            svg.appendChild(rect);
        }

        // Grid
        drawInternalGrid(svg, width, height, xGrid, yGrid);

        // Mock Data Line
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        // Generate some random-looking but consistent data points
        let d = `M 0 ${height / 2}`;
        for (let i = 1; i <= 10; i++) {
            const x = (i / 10) * width;
            const y = (height / 2) + Math.sin(i) * (height / 4);
            d += ` L ${x} ${y}`;
        }

        path.setAttribute("d", d);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", colorStyle);
        path.setAttribute("stroke-width", lineThickness);

        if (lineType === "DASHED") {
            path.setAttribute("stroke-dasharray", "4,4");
        } else if (lineType === "DOTTED") {
            path.setAttribute("stroke-dasharray", "1,2");
        }

        svg.appendChild(path);

        // Title
        if (title) {
            const titleEl = document.createElement("div");
            titleEl.style.position = "absolute";
            titleEl.style.top = "2px";
            titleEl.style.left = "4px";
            titleEl.style.fontSize = "10px";
            titleEl.style.color = colorStyle;
            titleEl.textContent = title;
            element.appendChild(titleEl);
        }

        // Axis Labels
        if (props.entity_id) {
            const minVal = parseFloat(props.min_value) || 0;
            const maxVal = parseFloat(props.max_value) || 100;
            drawSmartAxisLabels(element, 0, 0, width, height, minVal, maxVal, duration);
        } else {
            // No entity placeholder
            const ph = document.createElement("div");
            ph.style.position = "absolute";
            ph.style.top = "50%";
            ph.style.left = "50%";
            ph.style.transform = "translate(-50%, -50%)";
            ph.style.fontSize = "10px";
            ph.style.color = "#aaa";
            ph.textContent = "No Entity";
            element.appendChild(ph);
        }
    }

    function drawInternalGrid(svg, width, height, xGridStr, yGridStr) {
        const gridGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        gridGroup.setAttribute("stroke", "rgba(0,0,0,0.1)");
        gridGroup.setAttribute("stroke-dasharray", "2,2");
        gridGroup.setAttribute("stroke-width", "1");

        const xLines = 4;
        const yLines = 4;

        for (let i = 1; i < xLines; i++) {
            const x = (i / xLines) * width;
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", x);
            line.setAttribute("y1", 0);
            line.setAttribute("x2", x);
            line.setAttribute("y2", height);
            gridGroup.appendChild(line);
        }

        for (let i = 1; i < yLines; i++) {
            const y = (i / yLines) * height;
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", 0);
            line.setAttribute("y1", y);
            line.setAttribute("x2", width);
            line.setAttribute("y2", y);
            gridGroup.appendChild(line);
        }

        svg.appendChild(gridGroup);
    }

    function drawSmartAxisLabels(container, x, y, width, height, min, max, durationStr) {
        // Y-Axis Labels (Left of graph)
        const range = max - min;
        const steps = 4;

        for (let i = 0; i <= steps; i++) {
            const val = min + (range * (i / steps));
            const labelY = y + height - ((i / steps) * height);

            const div = document.createElement("div");
            div.style.position = "absolute";
            div.style.right = "102%"; // Position to left of graph
            div.style.top = `${labelY - 6}px`; // Center vertically
            div.style.fontSize = "10px";
            div.style.color = "#666";
            div.style.textAlign = "right";
            div.style.whiteSpace = "nowrap";
            div.textContent = val.toFixed(1);
            container.appendChild(div);
        }

        // X-Axis Labels (Below graph)
        const durationSec = parseDuration(durationStr);
        const xSteps = 2;

        for (let i = 0; i <= xSteps; i++) {
            const ratio = i / xSteps;
            const labelX = x + (width * ratio);

            let labelText = "";
            if (i === xSteps) labelText = "Now";
            else {
                const timeAgo = durationSec * (1 - ratio);
                if (timeAgo >= 3600) labelText = `-${(timeAgo / 3600).toFixed(1)}h`;
                else if (timeAgo >= 60) labelText = `-${(timeAgo / 60).toFixed(0)}m`;
                else labelText = `-${timeAgo.toFixed(0)}s`;
            }

            const div = document.createElement("div");
            div.style.position = "absolute";
            div.style.left = `${labelX}px`;
            div.style.top = "102%"; // Below graph
            div.style.fontSize = "10px";
            div.style.color = "#666";
            div.style.transform = "translateX(-50%)";
            div.style.whiteSpace = "nowrap";
            div.textContent = labelText;
            container.appendChild(div);
        }
    }

    function parseDuration(str) {
        if (!str) return 3600;
        const match = str.match(/^(\d+)([a-z]+)$/i);
        if (!match) return 3600;
        const val = parseInt(match[1], 10);
        const unit = match[2].toLowerCase();
        if (unit.startsWith("s")) return val;
        if (unit.startsWith("m")) return val * 60;
        if (unit.startsWith("h")) return val * 3600;
        if (unit.startsWith("d")) return val * 86400;
        return 3600;
    }

    if (window.FeatureRegistry) {
        window.FeatureRegistry.register("graph", { render });
    }
})();
