(() => {
    // Helper used by the main render function
    const drawCalendarPreview = (el, widget, props) => {
        // Simple mock rendering for preview
        const width = widget.width || 400;
        const height = widget.height || 300;

        el.style.width = width + "px";
        el.style.height = height + "px";
        el.style.position = "relative";
        el.style.backgroundColor = props.background_color || "white";
        el.style.color = props.text_color || "black";

        if (props.show_border !== false) {
            el.style.border = `${props.border_width || 2}px solid ${props.border_color || "black"}`;
        }

        // Dynamic Date Data
        const now = new Date();
        const date = now.getDate();
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        const dayNameText = dayNames[now.getDay()];
        const monthYearText = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

        // Header
        const header = document.createElement("div");
        header.style.textAlign = "center";
        header.style.padding = "2px";
        header.style.borderBottom = "1px solid " + (props.text_color || "black");
        // Ensure header doesn't grow too large
        header.style.flexShrink = "0";

        const bigDate = document.createElement("div");
        bigDate.style.fontSize = Math.min((props.font_size_date || 100) / 2, 80) + "px";
        bigDate.style.fontWeight = "100";
        bigDate.style.lineHeight = "0.8";
        bigDate.innerText = date;
        header.appendChild(bigDate);

        const dayName = document.createElement("div");
        dayName.style.fontSize = (props.font_size_day || 24) + "px";
        dayName.style.fontWeight = "bold";
        dayName.innerText = dayNameText;
        header.appendChild(dayName);

        const dateLine = document.createElement("div");
        dateLine.style.fontSize = (props.font_size_grid || 14) + "px";
        dateLine.innerText = monthYearText;
        header.appendChild(dateLine);

        // Flex layout for the main container to push events to bottom if space permits
        el.style.display = "flex";
        el.style.flexDirection = "column";

        el.appendChild(header);

        // Grid Logic
        const grid = document.createElement("div");
        grid.style.display = "grid";
        grid.style.gridTemplateColumns = "repeat(7, 1fr)";
        grid.style.padding = "2px";
        grid.style.gap = "1px";
        grid.style.flexShrink = "0";

        const gridFontSize = (props.font_size_grid || 14) + "px";

        // Day Headers (Mon-Sun)
        ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].forEach(day => {
            const d = document.createElement("div");
            d.innerText = day;
            d.style.textAlign = "center";
            d.style.fontWeight = "bold";
            d.style.fontSize = gridFontSize;
            grid.appendChild(d);
        });

        // Days of Month
        // Calculate correctly:
        // 1. First day of current month
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        // 2. Days in month
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const daysInMonth = lastDay.getDate();

        // 3. Offset (JS getDay: Sun=0, Mon=1... but we want Mon=0...Sun=6)
        let startDay = firstDay.getDay(); // 0=Sun, 1=Mon
        if (startDay === 0) startDay = 7; // Make Sunday 7 temporarily
        startDay -= 1; // Now 0=Mon, ... 6=Sun

        // Empty slots for start offset
        for (let i = 0; i < startDay; i++) {
            grid.appendChild(document.createElement("div"));
        }

        // Day numbers
        for (let i = 1; i <= daysInMonth; i++) {
            const d = document.createElement("div");
            d.innerText = i;
            d.style.textAlign = "center";
            d.style.fontSize = gridFontSize;

            if (i === date) {
                // Highlight today
                d.style.backgroundColor = props.text_color || "black";
                d.style.color = props.background_color || "white";
                d.style.borderRadius = "50%";
                d.style.width = "1.5em";
                d.style.height = "1.5em";
                d.style.lineHeight = "1.5em";
                d.style.margin = "0 auto";
            }
            grid.appendChild(d);
        }
        el.appendChild(grid);

        // Mock Events
        const events = document.createElement("div");
        events.style.padding = "5px";
        events.style.fontSize = (props.font_size_event || 18) + "px";
        events.style.flexGrow = "1"; // Allow events area to fill remaining space
        events.style.overflow = "hidden"; // Clip if too small

        // Generate a few mock events based on 'today'
        events.innerHTML = `
            <div style="margin-bottom:4px;"><b>${date}</b> Meeting with Team</div>
            <div><b>${Math.min(date + 2, daysInMonth)}</b> Dentist Appointment</div>
        `;
        el.appendChild(events);
    };

    const render = (el, widget, tools) => {
        const props = widget.props || {};
        el.innerHTML = "";
        drawCalendarPreview(el, widget, props);
    };

    // Register with FeatureRegistry
    if (window.FeatureRegistry) {
        window.FeatureRegistry.register("calendar", { render });
    } else {
        // Retry in case loaded too early
        setTimeout(() => {
            if (window.FeatureRegistry) {
                window.FeatureRegistry.register("calendar", { render });
            }
        }, 50);
    }
})();
