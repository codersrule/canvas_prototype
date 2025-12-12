/**
 * student/studentDashboard.js
 * Student dashboard view and related functionality
 * Updated with proper lifecycle management, error handling, and calendar integration
 */

import { renderCourses, renderTodos, renderAnnouncements } from '../shared/ui.js';
import { stateManager } from '../core/stateManager.js';
import { buildCalendarEvents } from '../shared/calendar.js';
import { escapeHtml } from '../core/utils.js';

export class StudentDashboard {
    constructor(appContainer) {
        this.appContainer = appContainer;
        this.listeners = []; // Track event listeners for cleanup
        this.stateUnsubscribe = null; // Track state subscription
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
    }

    /**
     * Main render method with error handling
     */
    render() {
        try {
            const state = stateManager.getState();
            this.appContainer.innerHTML = this.getTemplate(state);
            this.attachEventListeners();
            this.subscribeToStateChanges();
        } catch (error) {
            console.error('Error rendering student dashboard:', error);
            this.renderError(error);
        }
    }

    /**
     * Get the dashboard template
     */
    getTemplate(state) {
        const { courses, todos, announcements, user } = state;
        const userName = user?.name || 'Student';

        // Count upcoming assignments
        const upcomingCount = todos.filter(todo => {
            const dueDate = new Date(todo.dueDate);
            const oneWeek = new Date();
            oneWeek.setDate(oneWeek.getDate() + 7);
            return dueDate <= oneWeek;
        }).length;

        return `
            <div class="p-6 fade-in">
                <!-- Welcome Banner -->
                <div class="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl p-6 mb-6 shadow-md">
                    <h1 class="text-2xl md:text-3xl font-bold mb-2">Welcome back, ${escapeHtml(userName)}!</h1>
                    <p class="text-blue-100">You have ${upcomingCount} assignment${upcomingCount !== 1 ? 's' : ''} due this week</p>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Left Column - Courses -->
                    <div class="lg:col-span-2">
                        <div class="flex items-center justify-between mb-4">
                            <h2 class="text-xl font-semibold text-gray-700">My Courses - Fall 2025</h2>
                            <button 
                                id="refresh-courses-btn" 
                                class="text-blue-600 hover:text-blue-700 transition-colors"
                                aria-label="Refresh courses">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        </div>
                        <div id="courses-container" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            ${courses.length > 0 ? renderCourses(courses) : this.getEmptyCoursesState()}
                        </div>
                    </div>

                    <!-- Right Column - Widgets -->
                    <div class="space-y-6">
                        <!-- To-Do Widget -->
                        <div class="bg-white rounded-lg shadow-md p-6">
                            <div class="flex items-center justify-between mb-4">
                                <div class="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="text-blue-500 mr-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                    </svg>
                                    <h3 class="text-lg font-semibold text-gray-700">To Do</h3>
                                </div>
                                ${todos.length > 0 ? `<span class="text-xs font-medium text-gray-500">${todos.length} item${todos.length !== 1 ? 's' : ''}</span>` : ''}
                            </div>
                            <div id="todos-container" class="space-y-4">
                                ${todos.length > 0 ? renderTodos(todos) : this.getEmptyTodosState()}
                            </div>
                            ${todos.length > 0 ? '<a href="#/assignments" class="block text-center text-blue-500 text-sm mt-4 hover:underline">View All</a>' : ''}
                        </div>

                        <!-- Announcements Widget -->
                        <div class="bg-white rounded-lg shadow-md p-6">
                            <div class="flex items-center justify-between mb-4">
                                <div class="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="text-blue-500 mr-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                    </svg>
                                    <h3 class="text-lg font-semibold text-gray-700">Recent Announcements</h3>
                                </div>
                                ${announcements.filter(a => !a.read).length > 0 ? `
                                    <span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                        ${announcements.filter(a => !a.read).length} new
                                    </span>
                                ` : ''}
                            </div>
                            <div id="announcements-container" class="space-y-4">
                                ${announcements.length > 0 ? renderAnnouncements(announcements) : this.getEmptyAnnouncementsState()}
                            </div>
                            ${announcements.length > 0 ? '<a href="#/inbox" class="block text-center text-blue-500 text-sm mt-4 hover:underline">View All</a>' : ''}
                        </div>

                        <!-- Calendar Widget -->
                        ${this.renderCalendarWidget()}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render interactive calendar widget
     */
    renderCalendarWidget() {
        const calendarState = stateManager.getState().calendar || {
            month: this.currentMonth,
            year: this.currentYear
        };

        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];

        const month = calendarState.month;
        const year = calendarState.year;
        const today = new Date();

        // Get events from calendar module
        const events = buildCalendarEvents();

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Create calendar grid
        let calendarDays = '';
        let dayCount = 1;

        // Previous month padding
        for (let i = 0; i < firstDay; i++) {
            calendarDays += '<div class="py-2 text-gray-300"></div>';
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const hasEvent = events.some(e => e.date === dateStr);

            let classes = 'py-2 cursor-pointer hover:bg-gray-100 rounded-full transition-colors';
            if (isToday) {
                classes = 'py-2 bg-blue-500 text-white rounded-full font-semibold';
            } else if (hasEvent) {
                classes = 'py-2 bg-yellow-100 rounded-full hover:bg-yellow-200 transition-colors';
            }

            calendarDays += `<div class="${classes}" data-date="${dateStr}">${day}</div>`;
        }

        return `
            <div class="bg-white rounded-lg shadow-md p-6">
                <div class="flex items-center justify-between mb-4">
                    <button id="prev-month-btn" class="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Previous month">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h3 class="text-lg font-semibold text-gray-700">${monthNames[month]} ${year}</h3>
                    <button id="next-month-btn" class="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Next month">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
                <div class="grid grid-cols-7 gap-1 text-center text-sm">
                    <div class="font-semibold text-gray-500 py-2">S</div>
                    <div class="font-semibold text-gray-500 py-2">M</div>
                    <div class="font-semibold text-gray-500 py-2">T</div>
                    <div class="font-semibold text-gray-500 py-2">W</div>
                    <div class="font-semibold text-gray-500 py-2">T</div>
                    <div class="font-semibold text-gray-500 py-2">F</div>
                    <div class="font-semibold text-gray-500 py-2">S</div>
                    ${calendarDays}
                </div>
                <div class="mt-4 pt-4 border-t border-gray-200">
                    <a href="#/calendar" class="block text-center text-blue-500 text-sm hover:underline">View Full Calendar</a>
                </div>
            </div>
        `;
    }

    /**
     * Empty state templates
     */
    getEmptyCoursesState() {
        return `
            <div class="col-span-full flex flex-col items-center justify-center py-12 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p class="text-sm">No courses enrolled yet</p>
                <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    Browse Courses
                </button>
            </div>
        `;
    }

    getEmptyTodosState() {
        return `
            <div class="flex flex-col items-center justify-center py-6 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-sm">All caught up! 🎉</p>
            </div>
        `;
    }

    getEmptyAnnouncementsState() {
        return `
            <div class="flex flex-col items-center justify-center py-6 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p class="text-sm">No new announcements</p>
            </div>
        `;
    }

    /**
     * Attach event listeners with tracking for cleanup
     */
    attachEventListeners() {
        // Cleanup existing listeners first
        this.cleanup();

        // Course card navigation
        const courseCards = this.appContainer.querySelectorAll('.course-card');
        courseCards.forEach(card => {
            const handler = this.handleCourseClick.bind(this);
            card.addEventListener('click', handler);
            card.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handler(e);
                }
            });
            this.listeners.push({ element: card, event: 'click', handler });
        });

        // Refresh courses button
        const refreshBtn = this.appContainer.querySelector('#refresh-courses-btn');
        if (refreshBtn) {
            const handler = this.handleRefreshCourses.bind(this);
            refreshBtn.addEventListener('click', handler);
            this.listeners.push({ element: refreshBtn, event: 'click', handler });
        }

    }

    /**
     * Event Handlers
     */
    handleCourseClick(event) {
        const card = event.currentTarget;
        const courseId = card.dataset.courseId;
        if (courseId) {
            window.location.hash = `#/course/${courseId}`;
        }
    }

    handleRefreshCourses(event) {
        event.preventDefault();
        const button = event.currentTarget;

        // Add loading state
        button.classList.add('animate-spin');
        button.disabled = true;

        // Simulate refresh (in real app, this would fetch from API)
        setTimeout(() => {
            button.classList.remove('animate-spin');
            button.disabled = false;

            // Show feedback
            this.showToast('Courses refreshed', 'success');
        }, 1000);
    }

    handlePrevMonth(event) {
        event.preventDefault();
        stateManager.decrementMonth();
        this.updateCalendar();
    }

    handleNextMonth(event) {
        event.preventDefault();
        stateManager.incrementMonth();
        this.updateCalendar();
    }

    handleDayClick(event) {
        const date = event.currentTarget.dataset.date;
        if (date) {
            // Navigate to calendar view with selected date
            window.location.hash = `#/calendar?date=${date}`;
        }
    }

    /**
     * Update calendar without full re-render
     */
    updateCalendar() {
        const calendarWidget = this.appContainer.querySelector('.bg-white.rounded-lg.shadow-md.p-6:last-of-type');
        if (calendarWidget) {
            const oldHTML = calendarWidget.innerHTML;
            calendarWidget.innerHTML = this.renderCalendarWidget().replace(/<div class="bg-white.*?>(.*)<\/div>/s, '$1');

            // Re-attach calendar event listeners
            this.attachCalendarListeners();
        }
    }

    /**
     * Attach only calendar-related listeners
     */
    attachCalendarListeners() {
        const prevMonthBtn = this.appContainer.querySelector('#prev-month-btn');
        const nextMonthBtn = this.appContainer.querySelector('#next-month-btn');

        if (prevMonthBtn) {
            const handler = this.handlePrevMonth.bind(this);
            prevMonthBtn.addEventListener('click', handler);
            this.listeners.push({ element: prevMonthBtn, event: 'click', handler });
        }

        if (nextMonthBtn) {
            const handler = this.handleNextMonth.bind(this);
            nextMonthBtn.addEventListener('click', handler);
            this.listeners.push({ element: nextMonthBtn, event: 'click', handler });
        }

        const calendarDays = this.appContainer.querySelectorAll('[data-date]');
        calendarDays.forEach(day => {
            const handler = this.handleDayClick.bind(this);
            day.addEventListener('click', handler);
            this.listeners.push({ element: day, event: 'click', handler });
        });
    }

    /**
     * Subscribe to state changes for reactive updates
     */
    subscribeToStateChanges() {
        // Unsubscribe from previous subscription if exists
        if (this.stateUnsubscribe) {
            this.stateUnsubscribe();
        }

        // Subscribe to relevant state changes
        this.stateUnsubscribe = stateManager.subscribe((newState, prevState) => {
            // Update specific sections without full re-render
            if (newState.courses !== prevState.courses) {
                this.updateCoursesSection(newState.courses);
            }

            if (newState.todos !== prevState.todos) {
                this.updateTodosSection(newState.todos);
            }

            if (newState.announcements !== prevState.announcements) {
                this.updateAnnouncementsSection(newState.announcements);
            }

            if (newState.calendar !== prevState.calendar) {
                this.updateCalendar();
            }
        });
    }

    /**
     * Partial update methods for efficiency
     */
    updateCoursesSection(courses) {
        const container = this.appContainer.querySelector('#courses-container');
        if (container) {
            container.innerHTML = courses.length > 0 ? renderCourses(courses) : this.getEmptyCoursesState();
            // Re-attach course card listeners
            const courseCards = container.querySelectorAll('.course-card');
            courseCards.forEach(card => {
                const handler = this.handleCourseClick.bind(this);
                card.addEventListener('click', handler);
                this.listeners.push({ element: card, event: 'click', handler });
            });
        }
    }

    updateTodosSection(todos) {
        const container = this.appContainer.querySelector('#todos-container');
        if (container) {
            container.innerHTML = todos.length > 0 ? renderTodos(todos) : this.getEmptyTodosState();
        }
    }

    updateAnnouncementsSection(announcements) {
        const container = this.appContainer.querySelector('#announcements-container');
        if (container) {
            container.innerHTML = announcements.length > 0 ? renderAnnouncements(announcements) : this.getEmptyAnnouncementsState();
        }
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        // Import and use the toast from ui.js if available
        if (typeof showToast === 'function') {
            showToast(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }

    /**
     * Render error state
     */
    renderError(error) {
        this.appContainer.innerHTML = `
            <div class="p-6 fade-in">
                <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 class="text-xl font-semibold text-red-800 mb-2">Something went wrong</h2>
                    <p class="text-red-600 mb-4">We couldn't load the dashboard. Please try again.</p>
                    <button 
                        onclick="window.location.reload()" 
                        class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        Reload Page
                    </button>
                    ${process.env.NODE_ENV === 'development' ? `
                        <details class="mt-4 text-left">
                            <summary class="cursor-pointer text-sm text-red-700">Error Details</summary>
                            <pre class="mt-2 p-4 bg-red-100 rounded text-xs overflow-auto">${escapeHtml(error.stack || error.message)}</pre>
                        </details>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Cleanup method to remove event listeners and subscriptions
     */
    cleanup() {
        // Remove all tracked event listeners
        this.listeners.forEach(({ element, event, handler }) => {
            if (element && element.removeEventListener) {
                element.removeEventListener(event, handler);
            }
        });
        this.listeners = [];

        // Unsubscribe from state changes
        if (this.stateUnsubscribe) {
            this.stateUnsubscribe();
            this.stateUnsubscribe = null;
        }
    }

    /**
     * Destroy method for complete teardown
     */
    destroy() {
        this.cleanup();
        if (this.appContainer) {
            this.appContainer.innerHTML = '';
        }
    }
}
