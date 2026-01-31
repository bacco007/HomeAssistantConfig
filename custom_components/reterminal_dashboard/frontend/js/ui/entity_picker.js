// Entity Picker UI
// Ported from editor.js

function openEntityPickerForWidget(widget, inputEl, callback) {
    if (typeof hasHaBackend !== 'function' || !hasHaBackend()) {
        console.warn("Entity Picker: No HA backend detected.");
        return;
    }

    const container = document.getElementById("propertiesPanel") || document.body;
    const existing = document.querySelector(".entity-picker-overlay");
    if (existing) {
        existing.remove();
    }

    const overlay = document.createElement("div");
    overlay.className = "entity-picker-overlay";

    const header = document.createElement("div");
    header.className = "entity-picker-header";
    header.textContent = "Pick Home Assistant entity";

    const closeBtn = document.createElement("button");
    closeBtn.className = "btn btn-secondary";
    closeBtn.textContent = "×";
    closeBtn.style.padding = "0 4px";
    closeBtn.style.fontSize = "9px";
    closeBtn.type = "button";
    closeBtn.addEventListener("click", () => {
        overlay.remove();
    });

    const headerRight = document.createElement("div");
    headerRight.style.display = "flex";
    headerRight.style.alignItems = "center";
    headerRight.style.gap = "4px";
    headerRight.appendChild(closeBtn);

    const headerWrap = document.createElement("div");
    headerWrap.style.display = "flex";
    headerWrap.style.justifyContent = "space-between";
    headerWrap.style.alignItems = "center";
    headerWrap.style.gap = "4px";
    headerWrap.appendChild(header);
    headerWrap.appendChild(headerRight);

    const searchRow = document.createElement("div");
    searchRow.style.display = "flex";
    searchRow.style.gap = "4px";
    searchRow.style.alignItems = "center";

    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.className = "prop-input";
    searchInput.placeholder = "Search name or entity_id";
    searchInput.style.flex = "1";

    const domainSelect = document.createElement("select");
    domainSelect.className = "prop-input";
    domainSelect.style.width = "80px";
    ["all", "sensor", "binary_sensor", "light", "switch", "fan", "cover", "climate", "media_player", "input_number", "number", "input_boolean", "input_text", "input_select", "weather", "scene", "script", "button", "input_button"].forEach((d) => {
        const opt = document.createElement("option");
        opt.value = d;
        opt.textContent = d;
        domainSelect.appendChild(opt);
    });

    searchRow.appendChild(searchInput);
    searchRow.appendChild(domainSelect);

    const list = document.createElement("div");
    list.className = "entity-picker-list";

    overlay.appendChild(headerWrap);
    overlay.appendChild(searchRow);
    overlay.appendChild(list);
    container.appendChild(overlay);

    function renderList(entities) {
        list.innerHTML = "";
        if (!entities || entities.length === 0) {
            const empty = document.createElement("div");
            empty.style.color = "var(--muted)";
            empty.style.fontSize = "var(--fs-xs)";
            empty.textContent = "No entities match.";
            list.appendChild(empty);
            return;
        }
        entities.forEach((e) => {
            const row = document.createElement("div");
            row.className = "entity-picker-row";

            const name = document.createElement("div");
            name.className = "entity-picker-name";
            name.textContent = e.name || e.entity_id;

            const meta = document.createElement("div");
            meta.className = "entity-picker-meta";
            meta.textContent = `${e.entity_id} · ${e.domain}`;

            row.appendChild(name);
            row.appendChild(meta);

            row.addEventListener("click", () => {
                // If callback provided, call it with entity_id
                if (callback) {
                    callback(e.entity_id);
                }

                // Update input element if provided
                if (inputEl) {
                    inputEl.value = e.entity_id;
                }

                // Update widget if provided
                if (widget && window.AppState) {
                    // Update entity_id and title
                    window.AppState.updateWidget(widget.id, {
                        entity_id: e.entity_id,
                        title: e.name || e.entity_id || ""
                    });

                    // Automate Graph settings based on attributes
                    if (widget.type === "graph" && e.attributes) {
                        const attrs = e.attributes;
                        const updates = {};
                        if (attrs.unit_of_measurement === "%") {
                            if (!widget.props.min_value) updates.min_value = "0";
                            if (!widget.props.max_value) updates.max_value = "100";
                        }
                        if (attrs.min !== undefined && !widget.props.min_value) updates.min_value = String(attrs.min);
                        if (attrs.max !== undefined && !widget.props.max_value) updates.max_value = String(attrs.max);

                        if (Object.keys(updates).length > 0) {
                            const newProps = { ...widget.props, ...updates };
                            window.AppState.updateWidget(widget.id, { props: newProps });
                        }
                    }

                    // Automate Unit for Sensor Text AND auto-detect text sensors
                    if (widget.type === "sensor_text") {
                        const newProps = { ...widget.props };

                        // Auto-populate unit from attributes if available
                        // Check both attributes.unit_of_measurement and top-level unit (API returns both)
                        console.log(`[entity_picker] Unit detection for ${e.entity_id}:`, {
                            hasAttributes: !!e.attributes,
                            attrUnit: e.attributes?.unit_of_measurement,
                            topLevelUnit: e.unit
                        });
                        if (e.attributes && e.attributes.unit_of_measurement) {
                            newProps.unit = e.attributes.unit_of_measurement;
                            console.log(`[entity_picker] Set unit from attributes: "${newProps.unit}"`);
                        } else if (e.unit) {
                            // Fallback to top-level unit field (from ha_api.js)
                            newProps.unit = e.unit;
                            console.log(`[entity_picker] Set unit from top-level: "${newProps.unit}"`);
                        } else {
                            console.log(`[entity_picker] No unit found for entity`);
                        }

                        // Auto-detect text sensor: if state is non-numeric, mark as text sensor
                        // This helps handle sensor.* entities that return text values
                        const stateVal = e.state;
                        const isExplicitTextDomain = e.entity_id.startsWith("weather.") || e.entity_id.startsWith("text_sensor.");

                        if (isExplicitTextDomain) {
                            // Explicit text domain - always mark as text sensor
                            newProps.is_text_sensor = true;
                        } else if (stateVal !== undefined && stateVal !== null && stateVal !== "") {
                            // Check if state value is non-numeric
                            const numVal = parseFloat(stateVal);
                            const isTextValue = isNaN(numVal);
                            if (isTextValue) {
                                newProps.is_text_sensor = true;
                                console.log(`[entity_picker] Auto-detected text sensor: ${e.entity_id} (state: "${stateVal}")`);
                            } else {
                                // Explicitly set to false for numeric sensors
                                newProps.is_text_sensor = false;
                            }
                        }

                        window.AppState.updateWidget(widget.id, { props: newProps });
                    }
                }

                overlay.remove();
            });

            list.appendChild(row);
        });
    }

    // Load entities using global fetchEntityStates from ha_api.js
    if (typeof fetchEntityStates === 'function') {
        fetchEntityStates().then((entities) => {
            if (!entities || entities.length === 0) {
                renderList([]);
                return;
            }

            function applyFilter() {
                const q = (searchInput.value || "").toLowerCase();
                const dom = domainSelect.value;
                const filtered = entities.filter((e) => {
                    // Extract domain from entity_id if not present
                    const domain = e.domain || e.entity_id.split('.')[0];

                    if (dom !== "all" && domain !== dom) {
                        return false;
                    }
                    if (!q) return true;
                    const hay = `${e.entity_id} ${e.name || ""}`.toLowerCase();
                    return hay.includes(q);
                });
                renderList(filtered);
            }

            searchInput.addEventListener("input", applyFilter);
            domainSelect.addEventListener("change", applyFilter);

            // Initial render
            applyFilter();
        });
    } else {
        console.error("fetchEntityStates not found. Ensure ha_api.js is loaded.");
        renderList([]);
    }
}

// Expose globally
window.openEntityPickerForWidget = openEntityPickerForWidget;
