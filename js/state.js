/**
 * State management for EduVerse Dashboard
 */

import { storage } from './utils.js';

class StateManager {
    constructor() {
        this.state = {
            sidebarOpen: false,
            notificationCount: 3,
            currentPage: 'dashboard',
            courses: [],
            todos: [],
            announcements: [],
            user: null
        };

        this.listeners = [];
        this.loadState();
    }

    /**
     * Loads state from localStorage
     */
    loadState() {
        const savedState = storage.get('eduverse_state');
        if (savedState) {
            this.state = { ...this.state, ...savedState };
        }
    }

    /**
     * Saves state to localStorage
     */
    saveState() {
        const stateToSave = {
            notificationCount: this.state.notificationCount,
            currentPage: this.state.currentPage
        };
        storage.set('eduverse_state', stateToSave);
    }

    /**
     * Gets current state
     * @returns {object} Current state
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Updates state and notifies listeners
     * @param {object} updates - State updates
     */
    setState(updates) {
        const prevState = { ...this.state };
        this.state = { ...this.state, ...updates };

        // Notify listeners
        this.listeners.forEach(listener => {
            listener(this.state, prevState);
        });

        // Save to localStorage
        this.saveState();
    }

    /**
     * Subscribes to state changes
     * @param {Function} listener - Listener function
     * @returns {Function} Unsubscribe function
     */
    subscribe(listener) {
        this.listeners.push(listener);

        // Return unsubscribe function
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    /**
     * Toggles sidebar state
     */
    toggleSidebar() {
        this.setState({ sidebarOpen: !this.state.sidebarOpen });
    }

    /**
     * Closes sidebar
     */
    closeSidebar() {
        if (this.state.sidebarOpen) {
            this.setState({ sidebarOpen: false });
        }
    }

    /**
     * Updates notification count
     * @param {number} count - New notification count
     */
    updateNotificationCount(count) {
        this.setState({ notificationCount: count });
    }

    /**
     * Sets current page
     * @param {string} page - Page identifier
     */
    setCurrentPage(page) {
        this.setState({ currentPage: page });
    }

    /**
     * Sets courses data
     * @param {Array} courses - Array of course objects
     */
    setCourses(courses) {
        this.setState({ courses });
    }

    /**
     * Sets todos data
     * @param {Array} todos - Array of todo objects
     */
    setTodos(todos) {
        this.setState({ todos });
    }

    /**
     * Sets announcements data
     * @param {Array} announcements - Array of announcement objects
     */
    setAnnouncements(announcements) {
        this.setState({ announcements });
    }

    /**
     * Sets user data
     * @param {object} user - User object
     */
    setUser(user) {
        this.setState({ user });
    }

    /**
     * Marks an announcement as read
     * @param {number} announcementId - Announcement ID
     */
    markAnnouncementAsRead(announcementId) {
        const announcements = this.state.announcements.map(a =>
            a.id === announcementId ? { ...a, read: true } : a
        );
        this.setAnnouncements(announcements);

        // Update notification count
        const unreadCount = announcements.filter(a => !a.read).length;
        this.updateNotificationCount(unreadCount);
    }

    /**
     * Adds a new todo
     * @param {object} todo - Todo object
     */
    addTodo(todo) {
        const todos = [...this.state.todos, { ...todo, id: Date.now() }];
        this.setTodos(todos);
    }

    /**
     * Removes a todo
     * @param {number} todoId - Todo ID
     */
    removeTodo(todoId) {
        const todos = this.state.todos.filter(t => t.id !== todoId);
        this.setTodos(todos);
    }

    /**
     * Toggles todo completion
     * @param {number} todoId - Todo ID
     */
    toggleTodoComplete(todoId) {
        const todos = this.state.todos.map(t =>
            t.id === todoId ? { ...t, completed: !t.completed } : t
        );
        this.setTodos(todos);
    }
}

// Create and export singleton instance
export const stateManager = new StateManager();