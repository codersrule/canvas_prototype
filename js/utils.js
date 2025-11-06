/**
 * Utility functions for EduVerse Dashboard
 */

/**
 * Escapes HTML to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} Escaped HTML
 */
export const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

/**
 * Debounce a function call
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Throttles a function call
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit = 300) => {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
};

/**
 * Gets an element by ID safely
 * @param {string} id - Element ID
 * @returns {HTMLElement|null} Element or null
 */
export const getElement = (id) => {
    try {
        return document.getElementById(id);
    } catch (error) {
        console.error(`Error getting element with id: ${id}`, error);
        return null;
    }
};

/**
 * Gets multiple elements safely
 * @param {string} selector - CSS selector
 * @returns {NodeList} NodeList of elements
 */
export const getElements = (selector) => {
    try {
        return document.querySelectorAll(selector);
    } catch (error) {
        console.error(`Error getting elements with selector: ${selector}`, error);
        return [];
    }
};

/**
 * Adds event listener with error handling
 * @param {HTMLElement} element - Element to attach listener to
 * @param {string} event - Event name
 * @param {Function} handler - Event handler
 * @param {object} options - Event listener options
 */
export const addEventListenerSafe = (element, event, handler, options = {}) => {
    if (!element) {
        console.warn(`Cannot add event listener: element is null`);
        return;
    }

    try {
        element.addEventListener(event, handler, options);
    } catch (error) {
        console.error(`Error adding event listener for ${event}:`, error);
    }
};

/**
 * Formats a date string
 * @param {string} dateString - Date string to format
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateString;
    }
};

/**
 * Checks if device is mobile
 * @returns {boolean} True if mobile device
 */
export const isMobile = () => {
    return window.innerWidth < 768;
};

/**
 * Checks if element is visible in viewport
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} True if visible
 */
export const isInViewport = (element) => {
    if (!element) return false;

    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
};

/**
 * Smoothly scrolls to an element
 * @param {HTMLElement|string} target - Element or selector to scroll to
 * @param {number} offset - Offset from top in pixels
 */
export const scrollToElement = (target, offset = 0) => {
    const element = typeof target === 'string'
        ? document.querySelector(target)
        : target;

    if (!element) return;

    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
};

/**
 * Generates a unique ID
 * @returns {string} Unique ID
 */
export const generateId = () => {
    return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Local storage helpers with error handling
 */
export const storage = {
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error reading from localStorage: ${key}`, error);
            return defaultValue;
        }
    },

    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error writing to localStorage: ${key}`, error);
            return false;
        }
    },

    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing from localStorage: ${key}`, error);
            return false;
        }
    }
};