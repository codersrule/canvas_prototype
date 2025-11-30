/**
 * UI rendering functions for EduVerse Dashboard
 */

import { escapeHtml } from '../core/utils.js';

/**
 * Renders course cards
 * @param {Array} courses - Array of course objects
 * @returns {string} HTML string
 */
export const renderCourses = (courses) => {
    return courses.map(course => `
        <div class="course-card bg-white rounded-lg shadow-md overflow-hidden fade-in" 
             data-course-id="${course.id}" 
             role="button" 
             tabindex="0" 
             aria-label="Open ${escapeHtml(course.name)}">
            <div class="h-32 bg-gradient-to-r ${course.color} p-4 text-white flex flex-col justify-between">
                <div class="text-sm opacity-90">${escapeHtml(course.code)}</div>
                <div class="text-lg font-semibold line-clamp-2">${escapeHtml(course.name)}</div>
            </div>
            <div class="p-4">
                <div class="flex justify-between text-sm text-gray-600">
                    <span class="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        ${course.assignments} assignment${course.assignments !== 1 ? 's' : ''}
                    </span>
                    <span class="text-truncate">${escapeHtml(course.professor)}</span>
                </div>
            </div>
        </div>
    `).join('');
};

/**
 * Renders todo items
 * @param {Array} todos - Array of todo objects
 * @returns {string} HTML string
 */
export const renderTodos = (todos) => {
    return todos.map((todo, index) => `
        <div class="fade-in ${index < todos.length - 1 ? 'border-b border-gray-100 pb-4' : 'pb-2'}">
            <div class="text-xs font-semibold text-blue-500 mb-1">${escapeHtml(todo.courseCode)}</div>
            <div class="text-sm text-gray-700 mb-1">${escapeHtml(todo.title)}</div>
            <div class="text-xs text-red-500 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Due: ${escapeHtml(todo.dueDate)}
            </div>
        </div>
    `).join('');
};

/**
 * Renders announcement items
 * @param {Array} announcements - Array of announcement objects
 * @returns {string} HTML string
 */
export const renderAnnouncements = (announcements) => {
    return announcements.map((announcement, index) => `
        <div class="fade-in ${index < announcements.length - 1 ? 'border-b border-gray-100 pb-4' : 'pb-2'}">
            <div class="text-sm font-semibold text-blue-500 mb-1 flex items-center justify-between">
                <span>${escapeHtml(announcement.title)}</span>
                ${!announcement.read ? '<span class="w-2 h-2 bg-blue-500 rounded-full"></span>' : ''}
            </div>
            <div class="text-xs text-gray-500 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                ${escapeHtml(announcement.courseCode)} - ${escapeHtml(announcement.timestamp)}
            </div>
        </div>
    `).join('');
};

/**
 * Shows a toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of notification (success, error, info)
 * @param {number} duration - Duration in milliseconds
 */
export const showToast = (message, type = 'info', duration = 3000) => {
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }

    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500'
    };

    const toast = document.createElement('div');
    toast.className = `toast-notification fixed bottom-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 fade-in`;
    toast.textContent = message;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';

        setTimeout(() => {
            toast.remove();
        }, 300);
    }, duration);
};

/**
 * Shows a loading spinner on an element
 * @param {HTMLElement} element - Element to show spinner on
 * @param {boolean} show - Whether to show or hide
 */
export const toggleLoadingSpinner = (element, show = true) => {
    if (!element) return;

    if (show) {
        element.classList.add('loading');
        const spinner = document.createElement('div');
        spinner.className = 'spinner absolute inset-0 flex items-center justify-center bg-white bg-opacity-75';
        spinner.innerHTML = `
            <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        `;
        element.style.position = 'relative';
        element.appendChild(spinner);
    } else {
        element.classList.remove('loading');
        const spinner = element.querySelector('.spinner');
        if (spinner) {
            spinner.remove();
        }
    }
};

/**
 * Updates notification badge count
 * @param {HTMLElement} badge - Badge element
 * @param {number} count - Notification count
 */
export const updateNotificationBadge = (badge, count) => {
    if (!badge) return;

    badge.textContent = count;
    badge.classList.toggle('hidden', count === 0);

    // Add animation
    if (count > 0) {
        badge.style.animation = 'none';
        setTimeout(() => {
            badge.style.animation = 'fadeIn 0.3s ease-in-out';
        }, 10);
    }
};

/**
 * Highlights navigation link
 * @param {string} page - Page identifier
 */
export const setActiveNavLink = (page) => {
    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
        const linkPage = link.dataset.page;
        if (linkPage === page) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        } else {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        }
    });
};

/**
 * Creates an empty state message
 * @param {string} message - Message to display
 * @param {string} icon - SVG icon HTML
 * @returns {string} HTML string
 */
export const createEmptyState = (message, icon = '') => {
    return `
        <div class="flex flex-col items-center justify-center py-8 text-gray-400">
            ${icon}
            <p class="mt-4 text-sm">${escapeHtml(message)}</p>
        </div>
    `;
};