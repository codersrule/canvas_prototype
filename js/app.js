/**
 * Main application entry point for EduVerse Dashboard
 */

import { coursesData, todosData, announcementsData, userData } from './data.js';
import { stateManager } from './state.js';
import { renderCourses, renderTodos, renderAnnouncements, updateNotificationBadge } from './ui.js';
import { setupEventListeners } from './events.js';
import { getElement } from './utils.js';

/**
 * Main application class
 */
class EduVerseApp {
    constructor() {
        this.elements = {};
        this.initialized = false;
    }

    /**
     * Initializes the application
     */
    async init() {
        try {
            console.log('Initializing EduVerse Dashboard...');

            // Get DOM elements
            this.cacheElements();

            // Validate required elements
            if (!this.validateElements()) {
                throw new Error('Required DOM elements not found');
            }

            // Initialize state
            this.initializeState();

            // Render initial content
            this.renderContent();

            // Setup event listeners
            setupEventListeners(this.elements);

            // Subscribe to state changes
            this.subscribeToStateChanges();

            this.initialized = true;
            console.log('EduVerse Dashboard initialized successfully');

        } catch (error) {
            console.error('Error initializing application:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    }

    /**
     * Caches DOM element references
     */
    cacheElements() {
        this.elements = {
            sidebarToggle: getElement('sidebar-toggle'),
            sidebar: getElement('sidebar'),
            sidebarBackdrop: getElement('sidebar-backdrop'),
            mainContent: getElement('main-content'),
            notificationBtn: getElement('notification-btn'),
            notificationBadge: getElement('notification-badge'),
            coursesContainer: getElement('courses-container'),
            todosContainer: getElement('todos-container'),
            announcementsContainer: getElement('announcements-container')
        };
    }

    /**
     * Validates that required elements exist
     * @returns {boolean} True if all required elements exist
     */
    validateElements() {
        const required = [
            'sidebar',
            'coursesContainer',
            'todosContainer',
            'announcementsContainer'
        ];

        for (const key of required) {
            if (!this.elements[key]) {
                console.error(`Required element not found: ${key}`);
                return false;
            }
        }

        return true;
    }

    /**
     * Initializes application state
     */
    initializeState() {
        stateManager.setCourses(coursesData);
        stateManager.setTodos(todosData);
        stateManager.setAnnouncements(announcementsData);
        stateManager.setUser(userData);

        // Calculate initial notification count
        const unreadAnnouncements = announcementsData.filter(a => !a.read).length;
        stateManager.updateNotificationCount(unreadAnnouncements);
    }

    /**
     * Renders all content
     */
    renderContent() {
        const { courses, todos, announcements } = stateManager.getState();

        try {
            // Render courses
            if (this.elements.coursesContainer) {
                this.elements.coursesContainer.innerHTML = renderCourses(courses);
            }

            // Render todos
            if (this.elements.todosContainer) {
                this.elements.todosContainer.innerHTML = renderTodos(todos);
            }

            // Render announcements
            if (this.elements.announcementsContainer) {
                this.elements.announcementsContainer.innerHTML = renderAnnouncements(announcements);
            }

            // Update notification badge
            this.updateNotificationUI();

        } catch (error) {
            console.error('Error rendering content:', error);
        }
    }

    /**
     * Updates notification UI
     */
    updateNotificationUI() {
        const { notificationCount } = stateManager.getState();
        updateNotificationBadge(this.elements.notificationBadge, notificationCount);
    }

    /**
     * Subscribes to state changes
     */
    subscribeToStateChanges() {
        stateManager.subscribe((newState, prevState) => {
            // Update notification badge if count changed
            if (newState.notificationCount !== prevState.notificationCount) {
                this.updateNotificationUI();
            }

            // Re-render announcements if they changed
            if (newState.announcements !== prevState.announcements) {
                this.elements.announcementsContainer.innerHTML =
                    renderAnnouncements(newState.announcements);
            }

            // Re-render todos if they changed
            if (newState.todos !== prevState.todos) {
                this.elements.todosContainer.innerHTML =
                    renderTodos(newState.todos);
            }

            // Re-render courses if they changed
            if (newState.courses !== prevState.courses) {
                this.elements.coursesContainer.innerHTML =
                    renderCourses(newState.courses);
            }
        });
    }

    /**
     * Shows error message to user
     * @param {string} message - Error message
     */
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50';
        errorDiv.textContent = message;
        errorDiv.setAttribute('role', 'alert');

        document.body.appendChild(errorDiv);

        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    /**
     * Destroys the application (cleanup)
     */
    destroy() {
        if (!this.initialized) return;

        console.log('Destroying EduVerse Dashboard...');

        // Clear all content
        Object.values(this.elements).forEach(element => {
            if (element && element.innerHTML !== undefined) {
                element.innerHTML = '';
            }
        });

        this.initialized = false;
        console.log('EduVerse Dashboard destroyed');
    }
}

/**
 * Initialize app when DOM is ready
 */
const initApp = () => {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            const app = new EduVerseApp();
            app.init().then(r => {
                // TODO: process promise returned
            });

            // Expose app instance for debugging
            window.eduVerseApp = app;
        });
    } else {
        const app = new EduVerseApp();
        app.init().then(r => {
            // TODO: process promise returned
        });

        // Expose app instance for debugging
        window.eduVerseApp = app;
    }
};

// Start the application
initApp();

export default EduVerseApp;