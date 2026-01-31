/**
 * Generates a unique ID for widgets.
 * @returns {string} The generated ID.
 */
function generateId() {
    return 'w_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * Debounces a function.
 * @param {Function} func - The function to debounce.
 * @param {number} wait - The wait time in milliseconds.
 * @returns {Function} The debounced function.
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Deep clones an object.
 * @param {Object} obj - The object to clone.
 * @returns {Object} The cloned object.
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
