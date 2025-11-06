/**
 * Event handlers for EduVerse Dashboard
 */

import { stateManager } from './state.js';
import { showToast, setActiveNavLink } from './ui.js';
import { isMobile, addEventListenerSafe } from './utils.js';

/**
 * Handles sidebar toggle
 * @param {object} elements - DOM elements
 */
export const handleSidebarToggle = (elements) => {
    const { sidebar, sidebarBackdrop, sidebarToggle } = elements;

    stateManager.toggleSidebar();
    const { sidebarOpen } = stateManager.getState();

    if (sidebarOpen) {
        sidebar.classList.remove('-translate-x-full');
        sidebarBackdrop.classList.remove('opacity-0', 'pointer-events-none');
        sidebarToggle.setAttribute('aria-expanded', 'true');
    } else {
        sidebar.classList.add('-translate-x-full');
        sidebarBackdrop.classList.add('opacity-0', 'pointer-events-none');
        sidebarToggle.setAttribute('aria-expanded', 'false');
    }
};

/**
 * Closes sidebar
 * @param {object} elements - DOM elements
 */
export const closeSidebar = (elements) => {
    const { sidebar, sidebarBackdrop, sidebarToggle } = elements;
    const { sidebarOpen } = stateManager.getState();

    if (sidebarOpen) {
        stateManager.closeSidebar();
        sidebar.classList.add('-translate-x-full');
        sidebarBackdrop.classList.add('opacity-0', 'pointer-events-none');
        sidebarToggle.setAttribute('aria-expanded', 'false');
    }
};

/**
 * Handles course card click
 * @param {Event} event - Click event
 */
export const handleCourseClick = (event) => {
    const card = event.target.closest('.course-card');
    if (!card) return;

    const courseId = parseInt(card.dataset.courseId);
    const { courses } = stateManager.getState();
    const course = courses.find(c => c.id === courseId);

    if (course) {
        console.log(`Opening course: ${course.name}`);
        showToast(`Opening ${course.name}`, 'info');

        // In a real app, this would navigate to the course page
        // window.location.href = `/course/${courseId}`;
    }
};

/**
 * Handles navigation link click
 * @param {Event} event - Click event
 * @param {object} elements - DOM elements
 */
export const handleNavLinkClick = (event, elements) => {
    event.preventDefault();

    const link = event.target.closest('.nav-link');
    if (!link) return;

    const page = link.dataset.page;
    if (!page) return;

    // Update active state
    setActiveNavLink(page);
    stateManager.setCurrentPage(page);

    // Close sidebar on mobile
    if (isMobile()) {
        closeSidebar(elements);
    }

    console.log(`Navigating to ${page} page`);
    showToast(`Navigating to ${page}`, 'info', 2000);
};

/**
 * Handles notification button click
 */
export const handleNotificationClick = () => {
    console.log('Opening notifications');
    showToast('Notifications feature coming soon!', 'info');
};

/**
 * Handles keyboard navigation
 * @param {KeyboardEvent} event - Keyboard event
 * @param {object} elements - DOM elements
 */
export const handleKeyboardNavigation = (event, elements) => {
    // Close sidebar with Escape key
    if (event.key === 'Escape') {
        closeSidebar(elements);
    }

    // Handle Enter/Space on course cards
    if ((event.key === 'Enter' || event.key === ' ') &&
        event.target.classList.contains('course-card')) {
        event.preventDefault();
        handleCourseClick(event);
    }
};

/**
 * Handles window resize
 * @param {object} elements - DOM elements
 */
export const handleResize = (elements) => {
    // Close sidebar on desktop
    if (!isMobile()) {
        const { sidebarOpen } = stateManager.getState();
        if (sidebarOpen) {
            closeSidebar(elements);
        }
    }
};

/**
 * Sets up all event listeners
 * @param {object} elements - DOM elements
 */
export const setupEventListeners = (elements) => {
    const {
        sidebarToggle,
        sidebarBackdrop,
        coursesContainer,
        notificationBtn
    } = elements;

    // Sidebar toggle
    if (sidebarToggle) {
        addEventListenerSafe(sidebarToggle, 'click', () =>
            handleSidebarToggle(elements)
        );
    }

    // Sidebar backdrop (close on click)
    if (sidebarBackdrop) {
        addEventListenerSafe(sidebarBackdrop, 'click', () =>
            closeSidebar(elements)
        );
    }

    // Course cards (using event delegation)
    if (coursesContainer) {
        addEventListenerSafe(coursesContainer, 'click', handleCourseClick);
        addEventListenerSafe(coursesContainer, 'keydown', (e) =>
            handleKeyboardNavigation(e, elements)
        );
    }

    // Navigation links (using event delegation)
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        addEventListenerSafe(link, 'click', (e) =>
            handleNavLinkClick(e, elements)
        );
    });

    // Notification button
    if (notificationBtn) {
        addEventListenerSafe(notificationBtn, 'click', handleNotificationClick);
    }

    // Keyboard navigation
    addEventListenerSafe(document, 'keydown', (e) =>
        handleKeyboardNavigation(e, elements)
    );

    // Window resize
    addEventListenerSafe(window, 'resize', () =>
        handleResize(elements)
    );

    // Prevent default on "View All" links for demo
    const viewAllLinks = document.querySelectorAll('a[href="#"]');
    viewAllLinks.forEach(link => {
        addEventListenerSafe(link, 'click', (e) => {
            e.preventDefault();
            const parent = link.closest('.bg-white');
            const heading = parent?.querySelector('h3')?.textContent;
            showToast(`${heading || 'View All'} feature coming soon!`, 'info');
        });
    });
};

/**
 * Removes all event listeners (cleanup)
 * @param {object} elements - DOM elements
 */
export const cleanupEventListeners = (elements) => {
    // In a real SPA, you would remove listeners here
    // For this demo, we rely on page reload to clean up
    console.log('Cleanup event listeners');
};