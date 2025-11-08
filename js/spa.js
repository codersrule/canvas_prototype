/**
 * js/spa.js
 * Single Page Application (SPA) Main Entry Point for EduVerse
 * - Renders into <main id="main-content">
 * - Uses sidebar links with data-page to navigate
 * - Hash-based routing (#/..., #/course/:id/...)
 */

import { coursesData, todosData, announcementsData, userData } from './data.js';
import { getCourseById, calculateCurrentGrade, getPendingAssignments, getCompletedModulesCount } from './courseData.js';
import { stateManager } from './state.js';
import { renderCourses, renderTodos, renderAnnouncements, updateNotificationBadge, showToast } from './ui.js';
import { escapeHtml, getElement, addEventListenerSafe, isMobile } from './utils.js';

/* ------------------------------ SPA Router ------------------------------ */

class SPARouter {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.appContainer = null;
        this.elements = {};
        this.navMap = {
            dashboard: '/',

            courses: '/courses',
            calendar: '/calendar',
            inbox: '/inbox',
            grades: '/grades',
            groups: '/groups',
            settings: '/settings'
        };
    }

    register(path, handler) {
        this.routes.set(path, handler);
    }

    navigate(path, pushHash = true) {
        try {
            // Normalize - ensure it starts with '#'
            if (!path.startsWith('#')) {
                path = `#${path}`;
            }

            if (pushHash && window.location.hash !== path) {
                window.location.hash = path;
                // hashchange listener will call navigate again; prevent double-run
                return;
            }

            const { route, params } = this.parseRoute(path);

            const handler = this.routes.get(route) || this.routes.get('404');
            if (handler) {
                // Close mobile sidebar when navigating
                this.closeMobileSidebar();

                // Update active nav
                this.updateActiveNavLink(route);

                // Render
                handler(params);

                // Update document title
                this.updatePageTitle(route, params);

                this.currentRoute = { route, params, path };
            }
        } catch (err) {
            console.error('Navigation error:', err);
            const fallback = this.routes.get('404');
            if (fallback) fallback();
        }
    }

    parseRoute(hash) {
        // Strip leading '#'
        let path = hash.replace(/^#/, '');

        // Root
        if (path === '' || path === '/') {
            return { route: '/', params: {} };
        }

        // Course route: /course/123 or /course/123/grades
        const m = path.match(/^\/course\/(\d+)(?:\/([^/]+))?$/);
        if (m) {
            return {
                route: '/course/:id',
                params: {
                    id: parseInt(m[1], 10),
                    tab: m[2] || 'home'
                }
            };
        }

        // Direct routes
        return { route: path, params: {} };
    }

    updateActiveNavLink(route) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            const page = link.getAttribute('data-page');
            const shouldActivate = (
                (route === '/' && page === 'dashboard') ||
                (route === '/courses' && page === 'courses') ||
                (route === '/calendar' && page === 'calendar') ||
                (route === '/inbox' && page === 'inbox') ||
                (route === '/grades' && page === 'grades') ||
                (route === '/groups' && page === 'groups') ||
                (route === '/settings' && page === 'settings')
            );

            if (shouldActivate) {
                link.classList.add('active', 'bg-blue-800');
                link.setAttribute('aria-current', 'page');
            } else {
                link.classList.remove('active', 'bg-blue-800');
                link.removeAttribute('aria-current');
            }
        });
    }

    updatePageTitle(route, params) {
        let title = 'EduVerse';
        if (route === '/course/:id' && params?.id) {
            const course = getCourseById(params.id);
            if (course) title = `${course.code} - ${course.name} | EduVerse`;
        } else if (route === '/courses') title = 'All Courses | EduVerse';
        else if (route === '/calendar') title = 'Calendar | EduVerse';
        else if (route === '/inbox') title = 'Inbox | EduVerse';
        else if (route === '/grades') title = 'Grades | EduVerse';
        else if (route === '/groups') title = 'Groups | EduVerse';
        else if (route === '/settings') title = 'Settings | EduVerse';

        document.title = title;
    }

    closeMobileSidebar() {
        const { sidebar, sidebarBackdrop } = this.elements;
        if (isMobile() && sidebar) {
            sidebar.classList.add('-translate-x-full');
            if (sidebarBackdrop) {
                sidebarBackdrop.classList.add('opacity-0', 'pointer-events-none');
            }
        }
    }

    init(appContainer, elements) {
        this.appContainer = appContainer;
        this.elements = elements;

        // Handle hash changes
        window.addEventListener('hashchange', () => {
            this.navigate(window.location.hash, false);
        });

        // Initial route
        const initial = window.location.hash || '#/';
        this.navigate(initial, false);
    }
}

/* ---------------------------- View Renderer ----------------------------- */

class ViewRenderer {
    constructor(appContainer) {
        this.appContainer = appContainer;
    }

    /* ------------------------------ Dashboard ------------------------------ */
    renderDashboard() {
        const { courses, todos, announcements } = stateManager.getState();

        this.appContainer.innerHTML = `
            <div class="p-6 fade-in">
                <!-- Welcome Banner -->
                <div class="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl p-6 mb-6 shadow-md">
                    <h1 class="text-2xl md:text-3xl font-bold mb-2">Welcome back, Peter Anteater! 🐜</h1>
                    <p class="text-blue-100">You have 5 assignments due this week</p>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Left Column - Courses -->
                    <div class="lg:col-span-2">
                        <h2 class="text-xl font-semibold mb-4 text-gray-700">My Courses - Fall 2025</h2>
                        <div id="courses-container" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            ${renderCourses(courses)}
                        </div>
                    </div>

                    <!-- Right Column - Widgets -->
                    <div class="space-y-6">
                        <!-- To-Do Widget -->
                        <div class="bg-white rounded-lg shadow-md p-6">
                            <div class="flex items-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" class="text-blue-500 mr-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H9m0 0a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                                <h3 class="text-lg font-semibold text-gray-700">To Do</h3>
                            </div>
                            <div id="todos-container" class="space-y-4">
                                ${renderTodos(todos)}
                            </div>
                            <a href="#/assignments" class="block text-center text-blue-500 text-sm mt-4 hover:underline">View All</a>
                        </div>

                        <!-- Announcements Widget -->
                        <div class="bg-white rounded-lg shadow-md p-6">
                            <div class="flex items-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" class="text-blue-500 mr-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                </svg>
                                <h3 class="text-lg font-semibold text-gray-700">Recent Announcements</h3>
                            </div>
                            <div id="announcements-container" class="space-y-4">
                                ${renderAnnouncements(announcements)}
                            </div>
                            <a href="#/announcements" class="block text-center text-blue-500 text-sm mt-4 hover:underline">View All</a>
                        </div>

                        <!-- Calendar Widget -->
                        <div class="bg-white rounded-lg shadow-md p-6">
                            <div class="flex items-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" class="text-blue-500 mr-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <h3 class="text-lg font-semibold text-gray-700">November 2025</h3>
                            </div>
                            <div class="grid grid-cols-7 gap-1 text-center text-sm">
                                <div class="font-semibold text-gray-500 py-2">S</div>
                                <div class="font-semibold text-gray-500 py-2">M</div>
                                <div class="font-semibold text-gray-500 py-2">T</div>
                                <div class="font-semibold text-gray-500 py-2">W</div>
                                <div class="font-semibold text-gray-500 py-2">T</div>
                                <div class="font-semibold text-gray-500 py-2">F</div>
                                <div class="font-semibold text-gray-500 py-2">S</div>

                                <div class="py-2"></div>
                                <div class="py-2"></div>
                                <div class="py-2"></div>
                                <div class="py-2"></div>
                                <div class="py-2"></div>
                                <div class="py-2"></div>
                                <div class="py-2">1</div>

                                <div class="py-2 bg-blue-500 text-white rounded-full">2</div>
                                <div class="py-2">3</div>
                                <div class="py-2">4</div>
                                <div class="py-2 bg-yellow-100 rounded-full">5</div>
                                <div class="py-2 bg-yellow-100 rounded-full">6</div>
                                <div class="py-2">7</div>
                                <div class="py-2 bg-yellow-100 rounded-full">8</div>

                                <div class="py-2">9</div>
                                <div class="py-2">10</div>
                                <div class="py-2">11</div>
                                <div class="py-2">12</div>
                                <div class="py-2">13</div>
                                <div class="py-2">14</div>
                                <div class="py-2">15</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.attachCourseCardListeners();
    }

    attachCourseCardListeners() {
        const cards = this.appContainer.querySelectorAll('.course-card');
        cards.forEach(card => {
            addEventListenerSafe(card, 'click', (e) => {
                e.preventDefault();
                const id = card.getAttribute('data-course-id');
                window.location.hash = `#/course/${id}`;
            });
            addEventListenerSafe(card, 'keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const id = card.getAttribute('data-course-id');
                    window.location.hash = `#/course/${id}`;
                }
            });
        });
    }

    /* ------------------------------ Course View ----------------------------- */

    renderCourse(params) {
        const courseId = params.id;
        const activeTab = params.tab || 'home';
        const course = getCourseById(courseId);

        if (!course) {
            this.render404();
            return;
        }

        const currentGrade = calculateCurrentGrade(course);
        const pendingAssignments = getPendingAssignments(course);
        const completedModules = getCompletedModulesCount(course);

        this.appContainer.innerHTML = `
            <div class="p-6 fade-in">
                <!-- Breadcrumb -->
                <nav class="mb-6" aria-label="Breadcrumb">
                    <ol class="flex items-center space-x-2 text-sm text-gray-600">
                        <li><a href="#/" class="hover:text-blue-600">Dashboard</a></li>
                        <li><svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg></li>
                        <li class="text-gray-900 font-medium">${escapeHtml(course.code)}</li>
                    </ol>
                </nav>

                <!-- Course Header -->
                <div class="bg-gradient-to-r ${course.color} text-white rounded-xl p-6 mb-6 shadow-md">
                    <div class="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div class="mb-4 md:mb-0">
                            <div class="text-sm opacity-90 mb-1">${escapeHtml(course.code)} • ${escapeHtml(course.term)}</div>
                            <h1 class="text-2xl md:text-3xl font-bold mb-2">${escapeHtml(course.name)}</h1>
                            <p class="text-blue-100">${escapeHtml(course.professor)}</p>
                        </div>
                        <div class="grid grid-cols-3 gap-4 text-center">
                            <div class="bg-white bg-opacity-20 rounded-lg p-3">
                                <div class="text-2xl font-bold">${currentGrade !== null ? currentGrade + '%' : 'N/A'}</div>
                                <div class="text-xs opacity-90">Current Grade</div>
                            </div>
                            <div class="bg-white bg-opacity-20 rounded-lg p-3">
                                <div class="text-2xl font-bold">${pendingAssignments.length}</div>
                                <div class="text-xs opacity-90">Pending</div>
                            </div>
                            <div class="bg-white bg-opacity-20 rounded-lg p-3">
                                <div class="text-2xl font-bold">${completedModules}/${course.modules.length}</div>
                                <div class="text-xs opacity-90">Modules</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Course Tabs -->
                <div class="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
                    <nav class="flex border-b" role="tablist" aria-label="Course sections">
                        ${this.tabLink(courseId, 'home', activeTab)}
                        ${this.tabLink(courseId, 'assignments', activeTab)}
                        ${this.tabLink(courseId, 'modules', activeTab)}
                        ${this.tabLink(courseId, 'grades', activeTab)}
                        ${this.tabLink(courseId, 'people', activeTab)}
                    </nav>
                </div>

                <!-- Tab Content -->
                <div id="course-tab-content">
                    ${this.renderCourseTab(course, activeTab)}
                </div>
            </div>
        `;
    }

    tabLink(courseId, tab, activeTab) {
        const active = activeTab === tab
            ? 'active border-blue-600 text-blue-600'
            : 'border-transparent text-gray-600';
        const label = tab.charAt(0).toUpperCase() + tab.slice(1);
        return `
            <a href="#/course/${courseId}/${tab}"
               class="course-tab ${active} px-6 py-4 text-sm font-medium border-b-2 hover:bg-gray-50 focus:outline-none">
                ${label}
            </a>`;
    }

    renderCourseTab(course, tab) {
        switch (tab) {
            case 'home': return this.renderCourseHomeTab(course);
            case 'assignments': return this.renderCourseAssignmentsTab(course);
            case 'modules': return this.renderCourseModulesTab(course);
            case 'grades': return this.renderCourseGradesTab(course);
            case 'people': return this.renderCoursePeopleTab(course);
            default: return this.renderCourseHomeTab(course);
        }
    }

    renderCourseHomeTab(course) {
        return `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2 space-y-6">
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h2 class="text-xl font-semibold mb-4 text-gray-700">Course Information</h2>
                        <div class="space-y-3 text-sm">
                            <div class="flex items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-3 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <div class="font-medium text-gray-700">Description</div>
                                    <div class="text-gray-600">${escapeHtml(course.description)}</div>
                                </div>
                            </div>
                            <div class="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <div>
                                    <span class="font-medium text-gray-700">Schedule:</span>
                                    <span class="text-gray-600 ml-2">${escapeHtml(course.time)}</span>
                                </div>
                            </div>
                            <div class="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <div>
                                    <span class="font-medium text-gray-700">Location:</span>
                                    <span class="text-gray-600 ml-2">${escapeHtml(course.location)}</span>
                                </div>
                            </div>
                            <div class="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <span class="font-medium text-gray-700">Office Hours:</span>
                                    <span class="text-gray-600 ml-2">${escapeHtml(course.officeHours)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    ${course.announcements?.length ? `
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h2 class="text-xl font-semibold mb-4 text-gray-700">Recent Announcements</h2>
                        <div class="space-y-4">
                            ${course.announcements.map(ann => `
                                <div class="border-b border-gray-100 pb-4 last:border-0">
                                    <div class="font-medium text-gray-900 mb-1">${escapeHtml(ann.title)}</div>
                                    <div class="text-sm text-gray-600 mb-2">${escapeHtml(ann.content)}</div>
                                    <div class="text-xs text-gray-500">${escapeHtml(ann.date)}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>` : ''}
                </div>

                <div class="space-y-6">
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h3 class="text-lg font-semibold mb-4 text-gray-700">Upcoming Assignments</h3>
                        ${getPendingAssignments(course).length ? `
                            <div class="space-y-3">
                                ${getPendingAssignments(course).slice(0, 3).map(assign => `
                                    <div class="border-l-4 border-red-500 pl-3 py-2">
                                        <div class="text-sm font-medium text-gray-900">${escapeHtml(assign.title)}</div>
                                        <div class="text-xs text-red-600">Due: ${escapeHtml(assign.dueDate)}</div>
                                        <div class="text-xs text-gray-500">${assign.points} points</div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : '<p class="text-gray-500 text-sm">No upcoming assignments</p>'}
                    </div>

                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h3 class="text-lg font-semibold mb-4 text-gray-700">Quick Links</h3>
                        <div class="space-y-2">
                            <a href="#" class="block text-sm text-blue-600 hover:underline">Syllabus</a>
                            <a href="#" class="block text-sm text-blue-600 hover:underline">Course Materials</a>
                            <a href="#" class="block text-sm text-blue-600 hover:underline">Discussion Forum</a>
                            <a href="#" class="block text-sm text-blue-600 hover:underline">Zoom Meetings</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderCourseAssignmentsTab(course) {
        const pending = course.assignments.filter(a => !a.submitted);
        const completed = course.assignments.filter(a => a.submitted);

        return `
            <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-xl font-semibold mb-6 text-gray-700">Assignments</h2>

                ${pending.length ? `
                    <div class="mb-10">
                        <h3 class="text-lg font-medium text-gray-700 mb-4">Upcoming</h3>
                        <div class="space-y-4">
                            ${pending.map(assign => `
                                <div class="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                                    <div class="flex justify-between items-start">
                                        <div class="flex-1">
                                            <h4 class="font-medium text-gray-900">${escapeHtml(assign.title)}</h4>
                                            <div class="flex items-center flex-wrap gap-4 mt-2 text-sm text-gray-600">
                                                <span class="flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Due: ${escapeHtml(assign.dueDate)}
                                                </span>
                                                <span>${assign.points} points</span>
                                                <span class="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">Pending</span>
                                            </div>
                                        </div>
                                        <div class="text-right">
                                            ${assign.grade != null
            ? `<span class="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Graded</span>
                                                   <div class="text-2xl font-bold text-green-600 mt-2">${assign.grade}/${assign.points}</div>`
            : `<span class="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">Not Graded</span>`
        }
                                        </div>
                                    </div>
                                    <button class="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                                        Start Assignment
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : `
                    <p class="text-gray-500">No upcoming assignments.</p>
                `}

                ${completed.length ? `
                    <div>
                        <h3 class="text-lg font-medium text-gray-700 mb-4">Completed</h3>
                        <div class="space-y-4">
                            ${completed.map(assign => `
                                <div class="border border-gray-200 rounded-lg p-4">
                                    <div class="flex justify-between items-start">
                                        <div class="flex-1">
                                            <h4 class="font-medium text-gray-900">${escapeHtml(assign.title)}</h4>
                                            <div class="flex items-center flex-wrap gap-4 mt-2 text-sm text-gray-600">
                                                <span>Submitted</span>
                                                <span>${assign.points} points</span>
                                                <span class="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Completed</span>
                                            </div>
                                        </div>
                                        <div class="text-right">
                                            ${assign.grade != null
            ? `<span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Graded</span>
                                                   <div class="text-2xl font-bold text-green-600 mt-2">${assign.grade}/${assign.points}</div>`
            : `<span class="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Not Graded</span>`
        }
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderCourseModulesTab(course) {
        return `
            <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-xl font-semibold mb-6 text-gray-700">Course Modules</h2>
                <div class="space-y-3">
                    ${course.modules.map(module => `
                        <div class="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center flex-1">
                                    ${module.completed ? `
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    ` : `
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    `}
                                    <div>
                                        <h3 class="font-medium text-gray-900">${escapeHtml(module.title)}</h3>
                                        <p class="text-sm text-gray-600">${module.items} items</p>
                                    </div>
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderCourseGradesTab(course) {
        const currentGrade = calculateCurrentGrade(course);

        return `
            <div class="bg-white rounded-lg shadow-md p-6">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-xl font-semibold text-gray-700">Grades</h2>
                    <div class="text-right">
                        <div class="text-sm text-gray-600">Current Grade</div>
                        <div class="text-3xl font-bold ${currentGrade >= 90 ? 'text-green-600' : currentGrade >= 80 ? 'text-blue-600' : 'text-yellow-600'}">
                            ${currentGrade !== null ? currentGrade + '%' : 'N/A'}
                        </div>
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assignment</th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Points</th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Grade</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            ${course.assignments.map(assign => `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-4 py-4 text-sm text-gray-900">${escapeHtml(assign.title)}</td>
                                    <td class="px-4 py-4 text-center">
                                        ${assign.submitted
            ? '<span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Submitted</span>'
            : '<span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Pending</span>'}
                                    </td>
                                    <td class="px-4 py-4 text-center text-sm text-gray-600">${assign.points}</td>
                                    <td class="px-4 py-4 text-center">
                                        ${assign.grade !== null
            ? `<span class="text-lg font-semibold ${assign.grade/assign.points >= 0.9 ? 'text-green-600' : 'text-blue-600'}">${assign.grade}</span>`
            : '<span class="text-gray-400">—</span>'}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    renderCoursePeopleTab(course) {
        const lastNameInitial = course.professor.split(' ')[1]?.charAt(0) || 'P';
        return `
            <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-xl font-semibold mb-6 text-gray-700">People</h2>

                <div class="mb-8">
                    <h3 class="text-lg font-medium text-gray-700 mb-4">Instructor</h3>
                    <div class="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                        <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                            ${escapeHtml(lastNameInitial)}
                        </div>
                        <div>
                            <div class="font-medium text-gray-900">${escapeHtml(course.professor)}</div>
                            <div class="text-sm text-gray-600">Instructor</div>
                            <div class="text-sm text-blue-600 hover:underline cursor-pointer mt-1">Send message</div>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 class="text-lg font-medium text-gray-700 mb-4">Students (150)</h3>
                    <div class="text-sm text-gray-600">
                        <p class="mb-4">View all students enrolled in this course.</p>
                        <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            View Class List
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Renders the All Courses page
     */
    renderCoursesPage() {
        const { courses } = stateManager.getState();

        this.appContainer.innerHTML = `
        <div class="p-6 fade-in">
            <h1 class="text-2xl font-bold text-gray-800 mb-6">All Courses</h1>

            <!-- Filters -->
            <div class="bg-white rounded-lg shadow-md p-4 mb-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <!-- Search -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
                        <input 
                            type="text" 
                            id="course-search" 
                            placeholder="Search by course name or code..." 
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                    </div>

                    <!-- Term Filter -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Term</label>
                        <select 
                            id="course-term-filter"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">All Terms</option>
                            <option value="Fall 2025">Fall 2025</option>
                            <option value="Spring 2025">Spring 2025</option>
                        </select>
                    </div>

                    <!-- Department Filter -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Department</label>
                        <select 
                            id="course-department-filter"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">All Departments</option>
                            ${[...new Set(courses.map(c => c.code.split(' ')[0]))]
            .map(dept => `<option value="${dept}">${dept}</option>`)
            .join('')}
                        </select>
                    </div>
                </div>
            </div>

            <!-- Results -->
            <div id="courses-list" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                ${renderCourses(courses)}
            </div>
        </div>
    `;

        this.attachCourseCardListeners();
        this.setupCoursesPageFilters();
    }

    /**
     * Setup filters for the Courses page
     */
    setupCoursesPageFilters() {
        const searchInput = document.getElementById('course-search');
        const termSelect = document.getElementById('course-term-filter');
        const deptSelect = document.getElementById('course-department-filter');
        const container = document.getElementById('courses-list');

        const applyFilters = () => {
            const { courses } = stateManager.getState();
            const search = searchInput.value.toLowerCase();
            const term = termSelect.value;
            const dept = deptSelect.value;

            const filtered = courses.filter(c => {
                const matchesSearch =
                    c.name.toLowerCase().includes(search) ||
                    c.code.toLowerCase().includes(search);

                const matchesTerm = term ? c.term === term : true;
                const matchesDept = dept ? c.code.startsWith(dept) : true;

                return matchesSearch && matchesTerm && matchesDept;
            });

            container.innerHTML = renderCourses(filtered);
            this.attachCourseCardListeners();
        };

        searchInput.addEventListener('input', applyFilters);
        termSelect.addEventListener('change', applyFilters);
        deptSelect.addEventListener('change', applyFilters);
    }


    /* --------------------------------- Misc -------------------------------- */

    render404() {
        this.appContainer.innerHTML = `
            <div class="p-6 fade-in">
                <div class="bg-white rounded-lg shadow-md p-12 text-center max-w-2xl mx-auto mt-20">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-24 h-24 text-gray-400 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h1 class="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <p class="text-xl text-gray-600 mb-8">Page not found</p>
                    <a href="#/" class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Back to Dashboard
                    </a>
                </div>
            </div>
        `;
    }

    renderComingSoon(title) {
        this.appContainer.innerHTML = `
            <div class="p-6 fade-in">
                <div class="bg-white rounded-lg shadow-md p-12 text-center max-w-2xl mx-auto mt-20">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-24 h-24 text-blue-500 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h1 class="text-3xl font-bold text-gray-900 mb-4">${escapeHtml(title)}</h1>
                    <p class="text-lg text-gray-600 mb-8">This feature is coming soon!</p>
                    <a href="#/" class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Back to Dashboard
                    </a>
                </div>
            </div>
        `;
    }
}

/* ------------------------------- Main App -------------------------------- */

class SPAApp {
    constructor() {
        this.router = new SPARouter();
        this.renderer = null;
        this.elements = {};
    }

    init() {
        try {
            // Cache elements
            this.cacheElements();

            // Initialize state
            this.initializeState();

            // Renderer binds to #main-content
            const appContainer = getElement('main-content');
            this.renderer = new ViewRenderer(appContainer);

            // Register routes
            this.registerRoutes();

            // Event listeners
            this.setupEventListeners();

            // Router
            this.router.init(appContainer, this.elements);
        } catch (err) {
            console.error('Error initializing SPA:', err);
        }
    }

    cacheElements() {
        this.elements = {
            sidebarToggle: getElement('sidebar-toggle'),
            sidebar: getElement('sidebar'),
            sidebarBackdrop: getElement('sidebar-backdrop'),
            notificationBtn: getElement('notification-btn'),
            notificationBadge: getElement('notification-badge'),
            main: getElement('main-content')
        };
    }

    initializeState() {
        stateManager.setCourses(coursesData);
        stateManager.setTodos(todosData);
        stateManager.setAnnouncements(announcementsData);
        stateManager.setUser(userData);

        const unread = announcementsData.filter(a => !a.read).length;
        stateManager.updateNotificationCount(unread);
        updateNotificationBadge(this.elements.notificationBadge, unread);
    }

    registerRoutes() {
        // Dashboard
        this.router.register('/', () => this.renderer.renderDashboard());

        // Course detail
        this.router.register('/course/:id', (params) => this.renderer.renderCourse(params));

        // Other pages (coming soon)
        this.router.register('/courses', () => this.renderer.renderCoursesPage());
        this.router.register('/calendar', () => this.renderer.renderComingSoon('Calendar'));
        this.router.register('/inbox', () => this.renderer.renderComingSoon('Inbox'));
        this.router.register('/grades', () => this.renderer.renderComingSoon('Grades'));
        this.router.register('/groups', () => this.renderer.renderComingSoon('Groups'));
        this.router.register('/settings', () => this.renderer.renderComingSoon('Settings'));

        // 404
        this.router.register('404', () => this.renderer.render404());
    }

    setupEventListeners() {
        const { sidebarToggle, sidebarBackdrop, sidebar, notificationBtn } = this.elements;

        // Sidebar toggle
        if (sidebarToggle) {
            addEventListenerSafe(sidebarToggle, 'click', () => {
                this.toggleSidebar();
                const expanded = sidebar?.classList.contains('-translate-x-full') ? 'false' : 'true';
                sidebarToggle.setAttribute('aria-expanded', expanded);
            });
        }

        // Sidebar backdrop
        if (sidebarBackdrop) {
            addEventListenerSafe(sidebarBackdrop, 'click', () => this.closeSidebar());
        }

        // Notification button
        if (notificationBtn) {
            addEventListenerSafe(notificationBtn, 'click', () => {
                showToast('Notifications feature coming soon!', 'info');
            });
        }

        // Window resize (ensure desktop shows sidebar)
        addEventListenerSafe(window, 'resize', () => {
            if (!isMobile() && sidebar) {
                sidebar.classList.remove('-translate-x-full');
                if (sidebarBackdrop) {
                    sidebarBackdrop.classList.add('opacity-0', 'pointer-events-none');
                }
            }
        });

        // Sidebar nav links (data-page mapping)
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            addEventListenerSafe(link, 'click', (e) => {
                const page = link.getAttribute('data-page');
                if (!page) return;
                e.preventDefault();
                const map = this.router.navMap || {};
                const route = map[page] || '/';
                this.router.navigate(`#${route}`);
            });
        });
    }

    toggleSidebar() {
        const { sidebar, sidebarBackdrop } = this.elements;
        if (sidebar && sidebarBackdrop) {
            sidebar.classList.toggle('-translate-x-full');
            sidebarBackdrop.classList.toggle('opacity-0');
            sidebarBackdrop.classList.toggle('pointer-events-none');
        }
    }

    closeSidebar() {
        const { sidebar, sidebarBackdrop } = this.elements;
        if (sidebar && sidebarBackdrop) {
            sidebar.classList.add('-translate-x-full');
            sidebarBackdrop.classList.add('opacity-0', 'pointer-events-none');
        }
    }
}

/* ------------------------- Bootstrapping on DOMReady ------------------------- */

document.addEventListener('DOMContentLoaded', () => {
    const app = new SPAApp();
    app.init();

    // Expose for debugging in console
    window.spa = app;
});

export default SPAApp;
