/**
 * Configuration file for EduVerse Dashboard
 * Centralized settings and constants
 */

export const config = {
    // Application metadata
    app: {
        name: 'EduVerse',
        version: '2.0.0',
        description: 'Modern Learning Management System Dashboard'
    },

    // Feature flags
    features: {
        notifications: true,
        darkMode: false,
        offlineMode: false,
        analytics: false
    },

    // UI settings
    ui: {
        sidebarWidth: '16rem',
        navbarHeight: '4rem',
        animationDuration: 300,
        toastDuration: 3000,
        maxCoursesPerRow: 3,
        breakpoints: {
            mobile: 768,
            tablet: 1024,
            desktop: 1280
        }
    },

    // API settings (for future backend integration)
    api: {
        baseUrl: '/api',
        timeout: 10000,
        retryAttempts: 3,
        endpoints: {
            courses: '/courses',
            todos: '/todos',
            announcements: '/announcements',
            user: '/user'
        }
    },

    // Storage settings
    storage: {
        prefix: 'eduverse_',
        keys: {
            state: 'state',
            theme: 'theme',
            preferences: 'preferences'
        },
        expirationDays: 30
    },

    // Notification settings
    notifications: {
        maxVisible: 5,
        autoMarkAsRead: true,
        soundEnabled: false,
        desktopNotifications: false
    },

    // Calendar settings
    calendar: {
        firstDayOfWeek: 0, // 0 = Sunday, 1 = Monday
        dateFormat: 'MMM D, YYYY',
        timeFormat: '12h', // '12h' or '24h'
        showWeekNumbers: false
    },

    // Course card settings
    courses: {
        colors: [
            'from-blue-500 to-blue-600',
            'from-green-500 to-green-600',
            'from-orange-500 to-orange-600',
            'from-purple-500 to-purple-600',
            'from-red-500 to-red-600',
            'from-teal-500 to-teal-600',
            'from-indigo-500 to-indigo-600',
            'from-pink-500 to-pink-600',
            'from-yellow-500 to-yellow-600',
            'from-cyan-500 to-cyan-600'
        ],
        defaultColor: 'from-gray-500 to-gray-600'
    },

    // Performance settings
    performance: {
        enableLazyLoading: true,
        debounceDelay: 300,
        throttleDelay: 300,
        virtualScrollThreshold: 50
    },

    // Accessibility settings
    accessibility: {
        enableKeyboardShortcuts: true,
        enableScreenReaderAnnouncements: true,
        highContrastMode: false,
        reducedMotion: false
    },

    // Development settings
    development: {
        debug: false,
        verbose: false,
        mockData: true,
        errorLogging: true
    }
};

/**
 * Gets a configuration value by path
 * @param {string} path - Dot notation path (e.g., 'ui.animationDuration')
 * @param {*} defaultValue - Default value if path not found
 * @returns {*} Configuration value
 */
export const getConfig = (path, defaultValue = null) => {
    const keys = path.split('.');
    let value = config;

    for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
            value = value[key];
        } else {
            return defaultValue;
        }
    }

    return value;
};

/**
 * Sets a configuration value by path
 * @param {string} path - Dot notation path
 * @param {*} value - Value to set
 * @returns {boolean} Success status
 */
export const setConfig = (path, value) => {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let target = config;

    for (const key of keys) {
        if (!(key in target)) {
            target[key] = {};
        }
        target = target[key];
    }

    target[lastKey] = value;
    return true;
};

/**
 * Checks if a feature is enabled
 * @param {string} featureName - Name of the feature
 * @returns {boolean} True if enabled
 */
export const isFeatureEnabled = (featureName) => {
    return getConfig(`features.${featureName}`, false);
};

/**
 * Gets color for course based on index
 * @param {number} index - Course index
 * @returns {string} Tailwind gradient class
 */
export const getCourseColor = (index) => {
    const colors = getConfig('courses.colors', []);
    const defaultColor = getConfig('courses.defaultColor');

    if (colors.length === 0) return defaultColor;
    return colors[index % colors.length] || defaultColor;
};

/**
 * Validates configuration on startup
 * @returns {boolean} True if valid
 */
export const validateConfig = () => {
    try {
        // Check required fields
        if (!config.app.name) {
            console.error('Config validation failed: app.name is required');
            return false;
        }

        // Check UI breakpoints are in order
        const { mobile, tablet, desktop } = config.ui.breakpoints;
        if (mobile >= tablet || tablet >= desktop) {
            console.error('Config validation failed: breakpoints must be in ascending order');
            return false;
        }

        console.log('Configuration validated successfully');
        return true;
    } catch (error) {
        console.error('Config validation error:', error);
        return false;
    }
};

// Validate config on load
if (config.development.debug) {
    validateConfig();
}

export default config;