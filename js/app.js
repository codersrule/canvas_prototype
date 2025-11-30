/**
 * js/app.js
 * Main Application Entry Point - Updated with Course Tabs
 * Maintains existing modular architecture, adds 6-tab course page from spa.js
 */

// Core modules
import { SPARouter } from './core/router.js';
import { stateManager } from './core/stateManager.js';
import { escapeHtml, getElement, addEventListenerSafe, isMobile } from './core/utils.js';

// Shared modules
import { coursesData, todosData, announcementsData, userData } from './shared/data.js';
import { courseDetails, getCourseById, calculateCurrentGrade, getPendingAssignments, getCompletedModulesCount } from './shared/courseData.js';
import { updateNotificationBadge, showToast } from './shared/ui.js';
import { getModuleItems, getModuleItemIcon, getModuleItemColor } from './shared/moduleData.js';

// Student modules
import { StudentDashboard } from './student/studentDashboard.js';

// Teacher modules
import { RenderTeacherDashboard, renderTeacherCourse } from './teacher/teacherDashboard.js';

// Components
import { initRoleSwitcher, updateUserDisplay } from './shared/components/roleSwitcher.js';

// Role management
import { roleManager, getCurrentUser, isTeacher } from './core/roleManager.js';

/* ------------------------------- Main App -------------------------------- */

class EduVerseApp {
    constructor() {
        this.router = new SPARouter();
        this.studentDashboard = null;
        this.elements = {};
    }

    init() {
        try {
            // Cache DOM elements
            this.cacheElements();

            // Initialize state
            this.initializeState();

            // Initialize modules
            const appContainer = getElement('main-content');
            this.studentDashboard = new StudentDashboard(appContainer);

            // Register routes
            this.registerRoutes();

            // Setup event listeners
            this.setupEventListeners();

            // Initialize router
            this.router.init(appContainer, this.elements);

            console.log('✅ EduVerse App initialized successfully');
        } catch (err) {
            console.error('❌ Error initializing EduVerse App:', err);
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
        // Student routes
        this.router.register('/', () => this.studentDashboard.render());
        this.router.register('/courses', () => this.renderCoursesPage());
        this.router.register('/course/:id', (params) => this.renderCoursePage(params));
        this.router.register('/course/:id/:tab', (params) => this.renderCoursePage(params));
        this.router.register('/calendar', () => this.renderCalendarPage());
        this.router.register('/grades', () => this.renderGradesPage());

        // Teacher routes
        this.router.register('/teacher/dashboard', () => {
            const appContainer = this.elements.main;
            RenderTeacherDashboard(appContainer);
        });
        this.router.register('/teacher/course/:id', (params) => {
            const appContainer = this.elements.main;
            renderTeacherCourse(appContainer, params);
        });
        this.router.register('/teacher/course/:id/:tab', (params) => {
            const appContainer = this.elements.main;
            renderTeacherCourse(appContainer, params);
        });

        // Other routes
        this.router.register('/inbox', () => this.renderComingSoon('Inbox'));
        this.router.register('/groups', () => this.renderComingSoon('Groups'));
        this.router.register('/settings', () => this.renderComingSoon('Settings'));

        // 404
        this.router.register('404', () => this.render404());
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

        // Window resize
        addEventListenerSafe(window, 'resize', () => {
            if (!isMobile() && sidebar) {
                sidebar.classList.remove('-translate-x-full');
                if (sidebarBackdrop) {
                    sidebarBackdrop.classList.add('opacity-0', 'pointer-events-none');
                }
            }
        });

        // Sidebar nav links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            addEventListenerSafe(link, 'click', (e) => {
                const page = link.getAttribute('data-page');
                if (!page) return;
                e.preventDefault();
                const route = this.router.navMap[page] || '/';
                this.router.navigate(`#${route}`);
            });
        });

        // Global toggleModule function for module expansion
        window.toggleModule = (courseId, moduleId) => {
            const content = document.getElementById(`module-content-${moduleId}`);
            const arrow = content?.previousElementSibling?.querySelector('.module-arrow');

            if (content && arrow) {
                const isHidden = content.classList.contains('hidden');

                if (isHidden) {
                    content.classList.remove('hidden');
                    arrow.style.transform = 'rotate(180deg)';
                } else {
                    content.classList.add('hidden');
                    arrow.style.transform = 'rotate(0deg)';
                }
            }
        };

        // Initialize role switcher
        initRoleSwitcher();
        updateUserDisplay();
    }

    /* ======================== PAGE RENDERERS ======================== */

    renderCoursesPage() {
        const appContainer = this.elements.main;
        const { courses } = stateManager.getState();

        appContainer.innerHTML = `
            <div class="p-6 fade-in">
                <h1 class="text-3xl font-bold text-gray-900 mb-6">All Courses</h1>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    ${courses.map(course => `
                        <div class="course-card bg-white rounded-lg shadow-md overflow-hidden fade-in hover:shadow-xl transition-shadow cursor-pointer" 
                             data-course-id="${course.id}" 
                             onclick="window.location.hash='#/course/${course.id}'"
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
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderCoursePage(params) {
        const appContainer = this.elements.main;
        const courseId = parseInt(params.id);
        const activeTab = params.tab || 'home';
        const course = getCourseById(courseId);

        if (!course) {
            this.render404();
            return;
        }

        const currentGrade = calculateCurrentGrade(course);
        const pendingAssignments = getPendingAssignments(course);
        const completedModules = getCompletedModulesCount(course);

        appContainer.innerHTML = `
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
                    <nav class="flex border-b overflow-x-auto" role="tablist" aria-label="Course sections">
                        ${this.renderTabLink(courseId, 'home', activeTab, 'Home')}
                        ${this.renderTabLink(courseId, 'announcements', activeTab, 'Announcements')}
                        ${this.renderTabLink(courseId, 'assignments', activeTab, 'Assignments')}
                        ${this.renderTabLink(courseId, 'modules', activeTab, 'Modules')}
                        ${this.renderTabLink(courseId, 'grades', activeTab, 'Grades')}
                        ${this.renderTabLink(courseId, 'people', activeTab, 'People')}
                    </nav>
                </div>

                <!-- Tab Content -->
                <div id="course-tab-content">
                    ${this.renderCourseTab(course, activeTab)}
                </div>
            </div>
        `;
    }

    renderTabLink(courseId, tab, activeTab, label) {
        const active = activeTab === tab
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300';

        return `
            <a href="#/course/${courseId}/${tab}"
               class="course-tab ${active} px-6 py-4 text-sm font-medium border-b-2 focus:outline-none whitespace-nowrap transition-colors">
                ${label}
            </a>`;
    }

    renderCourseTab(course, tab) {
        switch (tab) {
            case 'home': return this.renderHomeTab(course);
            case 'announcements': return this.renderAnnouncementsTab(course);
            case 'assignments': return this.renderAssignmentsTab(course);
            case 'modules': return this.renderModulesTab(course);
            case 'grades': return this.renderGradesTab(course);
            case 'people': return this.renderPeopleTab(course);
            default: return this.renderHomeTab(course);
        }
    }

    /* ======================== TAB RENDERERS ======================== */

    renderHomeTab(course) {
        return `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2 space-y-6">
                    <!-- Course Information -->
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

                    ${course.announcements && course.announcements.length > 0 ? `
                        <div class="bg-white rounded-lg shadow-md p-6">
                            <h2 class="text-xl font-semibold mb-4 text-gray-700">Recent Announcements</h2>
                            <div class="space-y-4">
                                ${course.announcements.slice(0, 2).map(announcement => `
                                    <div class="border-l-4 border-blue-500 pl-4 py-2">
                                        <div class="font-medium text-gray-900">${escapeHtml(announcement.title)}</div>
                                        <div class="text-sm text-gray-600 mt-1">${escapeHtml(announcement.date)}</div>
                                    </div>
                                `).join('')}
                            </div>
                            <a href="#/course/${course.id}/announcements" class="block text-center text-blue-600 text-sm mt-4 hover:underline">
                                View All Announcements →
                            </a>
                        </div>
                    ` : ''}
                </div>

                <!-- Sidebar -->
                <div class="space-y-6">
                    <!-- Quick Links -->
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h3 class="text-lg font-semibold mb-4 text-gray-700">Quick Links</h3>
                        <div class="space-y-2">
                            <a href="#/course/${course.id}/assignments" class="block px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-gray-700">
                                📝 Assignments
                            </a>
                            <a href="#/course/${course.id}/modules" class="block px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-gray-700">
                                📚 Modules
                            </a>
                            <a href="#/course/${course.id}/grades" class="block px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-gray-700">
                                📊 Grades
                            </a>
                        </div>
                    </div>

                    <!-- Course Stats -->
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h3 class="text-lg font-semibold mb-4 text-gray-700">Course Stats</h3>
                        <div class="space-y-3 text-sm">
                            <div class="flex justify-between">
                                <span class="text-gray-600">Credits</span>
                                <span class="font-medium text-gray-900">${course.credits}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Term</span>
                                <span class="font-medium text-gray-900">${escapeHtml(course.term)}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Total Assignments</span>
                                <span class="font-medium text-gray-900">${course.assignments.length}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Total Modules</span>
                                <span class="font-medium text-gray-900">${course.modules.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderAnnouncementsTab(course) {
        return `
            <div class="space-y-6">
                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-xl font-semibold text-gray-700">Course Announcements</h2>
                    </div>
                    <p class="text-sm text-gray-600">Stay updated with the latest course information and updates</p>
                </div>

                <div class="space-y-4">
                    ${course.announcements && course.announcements.length > 0 ?
            course.announcements.map((announcement, index) => `
                            <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                <div class="bg-gradient-to-r ${course.color} p-4">
                                    <div class="flex items-start justify-between">
                                        <div class="flex items-center space-x-3">
                                            <div class="bg-white bg-opacity-20 p-2 rounded-lg">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 class="text-lg font-semibold text-white">${escapeHtml(announcement.title)}</h3>
                                                <div class="flex items-center space-x-4 text-sm text-white text-opacity-90 mt-1">
                                                    <span class="flex items-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        ${escapeHtml(announcement.date)}
                                                    </span>
                                                    <span class="flex items-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                        ${escapeHtml(course.professor)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="p-6">
                                    <div class="prose max-w-none text-gray-700">
                                        <p class="text-base leading-relaxed whitespace-pre-line">${escapeHtml(announcement.content)}</p>
                                    </div>
                                    ${index === 0 ? '<span class="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full mt-4">Latest</span>' : ''}
                                </div>
                            </div>
                        `).join('')
            : `
                        <div class="bg-white rounded-lg shadow-md p-12 text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                            </svg>
                            <h3 class="text-xl font-semibold text-gray-700 mb-2">No Announcements Yet</h3>
                            <p class="text-gray-600">There are no announcements for this course at the moment.</p>
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    renderAssignmentsTab(course) {
        const pendingAssignments = course.assignments.filter(a => !a.submitted);
        const submittedAssignments = course.assignments.filter(a => a.submitted);

        return `
            <div class="space-y-6">
                ${pendingAssignments.length > 0 ? `
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h2 class="text-xl font-semibold mb-4 text-gray-700">
                            Upcoming Assignments (${pendingAssignments.length})
                        </h2>
                        <div class="space-y-4">
                            ${pendingAssignments.map(assignment => `
                                <div class="border border-red-200 bg-red-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div class="flex items-center justify-between">
                                        <div class="flex-1">
                                            <h3 class="font-semibold text-gray-900">${escapeHtml(assignment.title)}</h3>
                                            <p class="text-sm text-red-600 mt-1 flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Due: ${escapeHtml(assignment.dueDate)}
                                            </p>
                                            <p class="text-sm text-gray-600 mt-1">${assignment.points} points</p>
                                        </div>
                                        <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                                            Start Assignment
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${submittedAssignments.length > 0 ? `
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h2 class="text-xl font-semibold mb-4 text-gray-700">
                            Submitted Assignments (${submittedAssignments.length})
                        </h2>
                        <div class="space-y-4">
                            ${submittedAssignments.map(assignment => `
                                <div class="border border-green-200 bg-green-50 rounded-lg p-4">
                                    <div class="flex items-center justify-between">
                                        <div class="flex-1">
                                            <h3 class="font-semibold text-gray-900">${escapeHtml(assignment.title)}</h3>
                                            <p class="text-sm text-gray-600 mt-1">
                                                Submitted • ${escapeHtml(assignment.dueDate)}
                                            </p>
                                            <p class="text-sm text-gray-600">${assignment.points} points</p>
                                        </div>
                                        <div class="text-right">
                                            ${assignment.grade !== null ? `
                                                <div class="text-2xl font-bold ${assignment.grade/assignment.points >= 0.9 ? 'text-green-600' : 'text-blue-600'}">
                                                    ${assignment.grade}/${assignment.points}
                                                </div>
                                                <div class="text-sm text-gray-600">${Math.round((assignment.grade/assignment.points)*100)}%</div>
                                            ` : `
                                                <span class="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                                                    Pending Grade
                                                </span>
                                            `}
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${pendingAssignments.length === 0 && submittedAssignments.length === 0 ? `
                    <div class="bg-white rounded-lg shadow-md p-12 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 class="text-xl font-semibold text-gray-700 mb-2">No Assignments</h3>
                        <p class="text-gray-600">There are no assignments for this course yet.</p>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderModulesTab(course) {
        return `
            <div class="bg-white rounded-lg shadow-md overflow-hidden">
                <div class="p-6 border-b border-gray-200">
                    <h2 class="text-xl font-semibold text-gray-700">Course Modules</h2>
                    <p class="text-sm text-gray-600 mt-1">Progress through your course content</p>
                </div>

                <div class="divide-y divide-gray-200">
                    ${course.modules.map(module => this.renderModule(course, module)).join('')}
                </div>
            </div>
        `;
    }

    renderModule(course, module) {
        const moduleItems = getModuleItems(course.id, module.id);
        const hasItems = moduleItems && moduleItems.length > 0;

        return `
            <div class="module-item">
                <div class="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                     onclick="toggleModule(${course.id}, ${module.id})">
                    <div class="flex items-center justify-between">
                        <div class="flex-1">
                            <h3 class="font-semibold text-gray-900 text-lg">${escapeHtml(module.title)}</h3>
                            <div class="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                <span class="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    ${module.items} items
                                </span>
                                ${hasItems ? `
                                    <span class="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        ${moduleItems.filter(item => item.completed).length}/${moduleItems.length} completed
                                    </span>
                                ` : ''}
                            </div>
                        </div>

                        <div class="flex items-center space-x-2">
                            ${module.completed ?
            '<span class="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Complete</span>'
            : '<span class="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">In Progress</span>'
        }
                            <svg class="w-5 h-5 text-gray-400 transition-transform duration-200 module-arrow" 
                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div class="module-content hidden border-t border-gray-200" id="module-content-${module.id}">
                    ${hasItems ? `
                        <div class="p-4 bg-gray-50">
                            <div class="space-y-2">
                                ${moduleItems.map((item, itemIndex) => this.renderModuleItem(course, module, item, itemIndex)).join('')}
                            </div>
                        </div>
                    ` : `
                        <div class="p-8 text-center text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p>No content items available yet</p>
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    renderModuleItem(course, module, item, index) {
        const icon = getModuleItemIcon(item.type);
        const colorClass = getModuleItemColor(item.type);

        let metadata = [];
        if (item.duration) metadata.push(item.duration);
        if (item.pages) metadata.push(`${item.pages} pages`);
        if (item.points) metadata.push(`${item.points} pts`);
        if (item.dueDate) metadata.push(`Due: ${item.dueDate}`);

        return `
            <div class="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-shadow cursor-pointer group">
                <div class="flex items-center flex-1">
                    <div class="mr-3">
                        ${item.completed ? `
                            <div class="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        ` : `
                            <div class="w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-blue-500 transition-colors"></div>
                        `}
                    </div>

                    <div class="${colorClass} mr-3">
                        ${icon}
                    </div>

                    <div class="flex-1">
                        <div class="flex items-center">
                            <h4 class="font-medium text-gray-900 ${item.completed ? 'line-through text-gray-500' : ''}">
                                ${escapeHtml(item.title)}
                            </h4>
                            <span class="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded capitalize">
                                ${item.type}
                            </span>
                        </div>
                        ${metadata.length > 0 ? `
                            <div class="text-xs text-gray-500 mt-1">
                                ${metadata.join(' • ')}
                            </div>
                        ` : ''}
                    </div>
                </div>

                <div class="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    ${item.type === 'assignment' || item.type === 'quiz' ? `
                        <button class="px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors">
                            ${item.completed ? 'View' : 'Start'}
                        </button>
                    ` : item.type === 'video' ? `
                        <button class="px-3 py-1 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded transition-colors">
                            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            </svg>
                            Play
                        </button>
                    ` : item.type === 'file' ? `
                        <button class="px-3 py-1 text-sm font-medium text-orange-600 hover:bg-orange-50 rounded transition-colors">
                            Download
                        </button>
                    ` : `
                        <button class="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded transition-colors">
                            Open
                        </button>
                    `}
                </div>
            </div>
        `;
    }

    renderGradesTab(course) {
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

    renderPeopleTab(course) {
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

    renderCalendarPage() {
        const appContainer = this.elements.main;
        const { calendar } = stateManager.getState();

        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];

        const month = calendar.month;
        const year = calendar.year;
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const assignments = [];
        Object.values(courseDetails).forEach(course => {
            if (course.assignments) {
                course.assignments.forEach(assignment => {
                    const dueDate = new Date(assignment.dueDate + ' ' + year);
                    if (dueDate.getMonth() === month) {
                        assignments.push({
                            day: dueDate.getDate(),
                            title: assignment.title,
                            course: course.code,
                            color: course.color
                        });
                    }
                });
            }
        });

        let calendarHTML = '';
        let day = 1;

        for (let week = 0; week < 6; week++) {
            calendarHTML += '<div class="grid grid-cols-7 gap-1">';

            for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
                if ((week === 0 && dayOfWeek < firstDay) || day > daysInMonth) {
                    calendarHTML += '<div class="aspect-square p-2 border border-gray-200"></div>';
                } else {
                    const dayAssignments = assignments.filter(a => a.day === day);
                    const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

                    calendarHTML += `
                        <div class="aspect-square p-2 border border-gray-200 hover:bg-gray-50 ${isToday ? 'bg-blue-50 border-blue-500' : ''}">
                            <div class="text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'}">${day}</div>
                            ${dayAssignments.length > 0 ? `
                                <div class="mt-1 space-y-1">
                                    ${dayAssignments.map(a => `
                                        <div class="text-xs bg-gradient-to-r ${a.color} text-white rounded px-1 py-0.5 truncate" title="${escapeHtml(a.title)}">
                                            ${escapeHtml(a.course)}
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                    `;
                    day++;
                }
            }

            calendarHTML += '</div>';
            if (day > daysInMonth) break;
        }

        appContainer.innerHTML = `
            <div class="p-6 fade-in">
                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h1 class="text-2xl font-bold text-gray-900">${monthNames[month]} ${year}</h1>
                        <div class="flex gap-2">
                            <button onclick="window.eduverse.prevMonth()" 
                                    class="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button onclick="window.eduverse.nextMonth()" 
                                    class="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div class="grid grid-cols-7 gap-1 mb-2">
                        <div class="text-center font-semibold text-gray-600 py-2">Sun</div>
                        <div class="text-center font-semibold text-gray-600 py-2">Mon</div>
                        <div class="text-center font-semibold text-gray-600 py-2">Tue</div>
                        <div class="text-center font-semibold text-gray-600 py-2">Wed</div>
                        <div class="text-center font-semibold text-gray-600 py-2">Thu</div>
                        <div class="text-center font-semibold text-gray-600 py-2">Fri</div>
                        <div class="text-center font-semibold text-gray-600 py-2">Sat</div>
                    </div>

                    ${calendarHTML}
                </div>

                <div class="mt-6 bg-white rounded-lg shadow-md p-6">
                    <h2 class="text-xl font-semibold mb-4 text-gray-700">Upcoming Assignments</h2>
                    <div class="space-y-3">
                        ${assignments.sort((a, b) => a.day - b.day).map(assignment => `
                            <div class="border-l-4 border-blue-500 pl-4 py-2">
                                <div class="font-medium text-gray-900">${escapeHtml(assignment.title)}</div>
                                <div class="text-sm text-gray-600">${escapeHtml(assignment.course)} • ${monthNames[month]} ${assignment.day}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderGradesPage() {
        const appContainer = this.elements.main;

        const courses = Object.values(courseDetails);
        let totalPoints = 0;
        let earnedPoints = 0;
        let totalAssignments = 0;
        let completedAssignments = 0;

        courses.forEach(course => {
            course.assignments.forEach(assignment => {
                totalAssignments++;
                totalPoints += assignment.points;
                if (assignment.grade !== null) {
                    completedAssignments++;
                    earnedPoints += assignment.grade;
                }
            });
        });

        const overallGrade = totalPoints > 0 ? ((earnedPoints / totalPoints) * 100).toFixed(1) : 0;

        appContainer.innerHTML = `
            <div class="p-6 fade-in">
                <h1 class="text-3xl font-bold text-gray-900 mb-6">Grades</h1>

                <!-- Overall Stats -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <div class="text-sm text-gray-600 mb-1">Overall Grade</div>
                        <div class="text-3xl font-bold text-blue-600">${overallGrade}%</div>
                    </div>
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <div class="text-sm text-gray-600 mb-1">Completed</div>
                        <div class="text-3xl font-bold text-green-600">${completedAssignments}/${totalAssignments}</div>
                    </div>
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <div class="text-sm text-gray-600 mb-1">Total Points</div>
                        <div class="text-3xl font-bold text-purple-600">${earnedPoints}/${totalPoints}</div>
                    </div>
                </div>

                <!-- Course Grades -->
                <div class="space-y-6">
                    ${courses.map(course => {
            const courseAssignments = course.assignments.filter(a => a.grade !== null);
            const courseTotalPoints = courseAssignments.reduce((sum, a) => sum + a.points, 0);
            const courseEarnedPoints = courseAssignments.reduce((sum, a) => sum + a.grade, 0);
            const courseGrade = courseTotalPoints > 0 ? ((courseEarnedPoints / courseTotalPoints) * 100).toFixed(1) : '--';

            return `
                            <div class="bg-white rounded-lg shadow-md overflow-hidden">
                                <div class="bg-gradient-to-r ${course.color} p-4 text-white">
                                    <div class="flex items-center justify-between">
                                        <div>
                                            <div class="text-sm opacity-90">${escapeHtml(course.code)}</div>
                                            <div class="text-xl font-bold">${escapeHtml(course.name)}</div>
                                        </div>
                                        <div class="text-3xl font-bold">${courseGrade}%</div>
                                    </div>
                                </div>
                                <div class="p-6">
                                    <div class="space-y-3">
                                        ${course.assignments.map(assignment => `
                                            <div class="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                                <div class="flex-1">
                                                    <div class="font-medium text-gray-900">${escapeHtml(assignment.title)}</div>
                                                    <div class="text-sm text-gray-600 mt-1">
                                                        ${assignment.submitted ?
                (assignment.grade !== null ?
                        `Graded • ${escapeHtml(assignment.dueDate)}` :
                        `Submitted • ${escapeHtml(assignment.dueDate)}`
                ) :
                `Not submitted • Due ${escapeHtml(assignment.dueDate)}`
            }
                                                    </div>
                                                </div>
                                                <div class="text-right">
                                                    ${assignment.grade !== null ?
                `<div class="text-2xl font-bold ${assignment.grade >= assignment.points * 0.9 ? 'text-green-600' : assignment.grade >= assignment.points * 0.7 ? 'text-yellow-600' : 'text-red-600'}">${assignment.grade}/${assignment.points}</div>
                                                         <div class="text-sm text-gray-600">${((assignment.grade / assignment.points) * 100).toFixed(1)}%</div>`
                :
                `<div class="text-gray-400">--/${assignment.points}</div>`
            }
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;
    }

    renderComingSoon(title) {
        const appContainer = this.elements.main;
        appContainer.innerHTML = `
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

    render404() {
        const appContainer = this.elements.main;
        appContainer.innerHTML = `
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

    /* ======================== CALENDAR NAVIGATION ======================== */

    prevMonth() {
        stateManager.decrementMonth();
        this.renderCalendarPage();
    }

    nextMonth() {
        stateManager.incrementMonth();
        this.renderCalendarPage();
    }

    /* ======================== SIDEBAR METHODS ======================== */

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

/* ------------------------- Bootstrap on DOM Ready ------------------------- */

document.addEventListener('DOMContentLoaded', () => {
    const app = new EduVerseApp();
    app.init();

    // Expose for debugging and calendar navigation
    window.eduverse = app;
});

export default EduVerseApp;
