/**
 * Registry for client-side feature rendering logic.
 */
class FeatureRegistry {
    static features = new Map();
    static loading = new Set();

    /**
     * Register a feature renderer.
     * @param {string} featureId - The unique ID of the widget type (e.g., 'shape_rect').
     * @param {object} renderer - The renderer object/class.
     */
    static register(featureId, renderer) {
        this.features.set(featureId, renderer);
        console.log(`[FeatureRegistry] Registered: ${featureId}`);
    }

    /**
     * Map of legacy/simple names to feature IDs.
     */
    static aliases = {
        "lvgl_tabview": "lvgl_tabview",
        "lvgl_tileview": "lvgl_tileview",
        "lvgl_led": "lvgl_led",
        "lvgl_spinner": "lvgl_spinner",
        "lvgl_buttonmatrix": "lvgl_buttonmatrix",
        "lvgl_checkbox": "lvgl_checkbox",
        "lvgl_dropdown": "lvgl_dropdown",
        "lvgl_keyboard": "lvgl_keyboard",
        "lvgl_roller": "lvgl_roller",
        "lvgl_spinbox": "lvgl_spinbox",
        "lvgl_switch": "lvgl_switch",
        "lvgl_textarea": "lvgl_textarea",
        "lvgl_obj": "lvgl_obj"
    };

    /**
     * Get a registered feature renderer.
     * @param {string} featureId 
     * @returns {object|undefined}
     */
    static get(featureId) {
        return this.features.get(featureId);
    }

    /**
     * Dynamically load a feature's render.js file.
     * @param {string} featureId 
     */
    static load(featureId) {
        return new Promise(async (resolve, reject) => {
            if (this.features.has(featureId)) {
                resolve(this.features.get(featureId));
                return;
            }
            if (this.loading.has(featureId)) {
                // Simple polling if already loading
                const check = setInterval(() => {
                    if (this.features.has(featureId)) {
                        clearInterval(check);
                        resolve(this.features.get(featureId));
                    }
                }, 50);
                return;
            }

            this.loading.add(featureId);

            // Relative path from frontend/editor.html to features/{featureId}/render.js
            // editor.html is in frontend/
            // features is in ../features/
            // Since we are now in an ES module, we might need to be careful about paths.
            // But dynamic import uses URL relative to the current module or base.
            // If this file is in frontend/feature_registry.js, then ../features is correct.
            const basePath = window.RETERMINAL_BASE_PATH || './features'; // Changed to ./features as it is relative to editor.html
            const path = `${basePath}/${featureId}/render.js`;

            try {
                // Dynamic import is not supported on file:// protocol
                if (window.location.protocol === 'file:') {
                    console.warn(`[FeatureRegistry] Dynamic import not supported on file:// protocol for '${featureId}'. Ensure script is pre-loaded.`);
                    this.loading.delete(featureId);
                    resolve(null);
                    return;
                }

                const module = await import(path);

                // Case 1: ES Module exporting render
                if (module && module.render) {
                    this.register(featureId, { render: module.render });
                    this.loading.delete(featureId);
                    resolve(this.features.get(featureId));
                    return;
                }

                // Case 2: IIFE that registered itself via window.FeatureRegistry (Legacy support)
                // Since we are moving to ES modules, this might not work if FeatureRegistry is not on window.
                // But we can assume new features will use export.

                if (this.features.has(featureId)) {
                    this.loading.delete(featureId);
                    resolve(this.features.get(featureId));
                    return;
                }

                console.warn(`[FeatureRegistry] Module loaded but no render function found for '${featureId}'`);
                this.loading.delete(featureId);
                resolve(null);

            } catch (err) {
                console.warn(`[FeatureRegistry] Could not load feature '${featureId}':`, err);
                this.loading.delete(featureId);
                resolve(null);
            }
        });
    }
}

// Ensure global availability for IIFE registration
window.FeatureRegistry = FeatureRegistry;
