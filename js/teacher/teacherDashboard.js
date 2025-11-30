/**
 * teacher/teacherDashboard.js
 * Teacher dashboard rendering functions
 */

import { getCurrentUser } from '../core/roleManager.js';
import { getCourseById } from '../shared/courseData.js';
import { escapeHtml } from '../core/utils.js';
import {
    getStudentsByCourse,
    getCourseAnalytics,
    getPendingGrading,
    getTotalPendingCount
} from './teacherData.js';

/* ======================== TEACHER DASHBOARD ======================== */

export function RenderTeacherDashboard(appContainer) {
    const user = getCurrentUser();
    const teachingCourses = user.getTeachingCourses();
    const courses = teachingCourses.map(id => getCourseById(id)).filter(c => c);
    const totalPending = getTotalPendingCount();

    appContainer.innerHTML = `
        <div class="p-6 fade-in">
            <!-- Welcome Banner -->
            <div class="bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl p-6 mb-6 shadow-md">
                <h1 class="text-2xl md:text-3xl font-bold mb-2">Welcome, ${escapeHtml(user.name)}! 👋</h1>
                <p class="text-purple-100">Teaching ${courses.length} courses • ${totalPending} assignments pending review</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Main Content -->
                <div class="lg:col-span-2 space-y-6">
                    <!-- Quick Stats -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="bg-white rounded-lg shadow-md p-5">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm text-gray-600">Total Students</p>
                                    <p class="text-3xl font-bold text-gray-900 mt-1">
                                        ${courses.reduce((sum, c) => {
        const analytics = getCourseAnalytics(c.id);
        return sum + (analytics?.totalStudents || 0);
    }, 0)}
                                    </p>
                                </div>
                                <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div class="bg-white rounded-lg shadow-md p-5">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm text-gray-600">Pending Grading</p>
                                    <p class="text-3xl font-bold text-orange-600 mt-1">${totalPending}</p>
                                </div>
                                <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                    <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div class="bg-white rounded-lg shadow-md p-5">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm text-gray-600">Avg Attendance</p>
                                    <p class="text-3xl font-bold text-green-600 mt-1">
                                        ${courses.length > 0 ? (courses.reduce((sum, c) => {
        const analytics = getCourseAnalytics(c.id);
        return sum + (analytics?.attendanceRate || 0);
    }, 0) / courses.length).toFixed(0) : 0}%
                                    </p>
                                </div>
                                <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- My Courses -->
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h2 class="text-xl font-semibold mb-4 text-gray-700">My Courses</h2>
                        <div class="space-y-4">
                            ${courses.map(course => {
        const analytics = getCourseAnalytics(course.id);
        const pending = getPendingGrading(course.id).length;
        return `
                                    <div class="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer"
                                         onclick="window.location.hash='#/teacher/course/${course.id}'">
                                        <div class="flex items-center justify-between">
                                            <div class="flex-1">
                                                <div class="flex items-center gap-3">
                                                    <div class="w-12 h-12 bg-gradient-to-r ${course.color} rounded-lg flex items-center justify-center text-white font-bold">
                                                        ${course.code.split(' ')[0]}
                                                    </div>
                                                    <div>
                                                        <h3 class="font-semibold text-gray-900">${escapeHtml(course.code)} - ${escapeHtml(course.name)}</h3>
                                                        <p class="text-sm text-gray-600">${analytics?.totalStudents || 0} students • ${course.term}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="flex items-center gap-4">
                                                ${pending > 0 ? `
                                                    <span class="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
                                                        ${pending} to grade
                                                    </span>
                                                ` : ''}
                                                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                `;
    }).join('')}
                        </div>
                    </div>

                    <!-- Recent Activity -->
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h2 class="text-xl font-semibold mb-4 text-gray-700">Recent Activity</h2>
                        <div class="space-y-4">
                            ${courses.flatMap(course => {
        const analytics = getCourseAnalytics(course.id);
        return (analytics?.recentActivity || []).map(activity => `
                                    <div class="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
                                        <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                            ${activity.type === 'submission' ? '📝' : activity.type === 'grade' ? '✅' : '💬'}
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <p class="text-sm text-gray-900">${activity.message}</p>
                                            <p class="text-xs text-gray-500 mt-1">${course.code} • ${activity.time}</p>
                                        </div>
                                    </div>
                                `);
    }).slice(0, 5).join('')}
                        </div>
                    </div>
                </div>

                <!-- Sidebar -->
                <div class="space-y-6">
                    <!-- Quick Actions -->
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h3 class="text-lg font-semibold mb-4 text-gray-700">Quick Actions</h3>
                        <div class="space-y-2">
                            <button class="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                </svg>
                                Create Announcement
                            </button>
                            <button class="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Create Assignment
                            </button>
                            <button class="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Schedule Office Hours
                            </button>
                        </div>
                    </div>

                    <!-- Pending Reviews -->
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h3 class="text-lg font-semibold mb-4 text-gray-700">Pending Reviews</h3>
                        ${totalPending > 0 ? `
                            <div class="space-y-3">
                                ${courses.flatMap(course => {
        return getPendingGrading(course.id).map(item => `
                                        <div class="border-l-4 border-orange-500 pl-3 py-2 bg-orange-50 rounded-r">
                                            <p class="text-sm font-medium text-gray-900">${escapeHtml(item.studentName)}</p>
                                            <p class="text-xs text-gray-600 mt-1">${course.code} • ${escapeHtml(item.assignmentName)}</p>
                                            <p class="text-xs text-orange-600 mt-1">${item.timeAgo}</p>
                                        </div>
                                    `);
    }).slice(0, 5).join('')}
                            </div>
                            <button class="w-full mt-4 text-center text-purple-600 text-sm font-medium hover:text-purple-700"
                                    onclick="window.location.hash='#/teacher/grading'">
                                View All (${totalPending})
                            </button>
                        ` : `
                            <p class="text-sm text-gray-500 text-center py-4">
                                All caught up! 🎉
                            </p>
                        `}
                    </div>

                    <!-- Upcoming Deadlines -->
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h3 class="text-lg font-semibold mb-4 text-gray-700">Upcoming Deadlines</h3>
                        <div class="space-y-3">
                            ${courses.flatMap(course => {
        const analytics = getCourseAnalytics(course.id);
        return (analytics?.upcomingDeadlines || []).map(deadline => `
                                    <div class="pb-3 border-b border-gray-100 last:border-0">
                                        <p class="text-sm font-medium text-gray-900">${escapeHtml(deadline.assignment)}</p>
                                        <p class="text-xs text-gray-600 mt-1">${course.code}</p>
                                        <div class="flex items-center justify-between mt-2">
                                            <span class="text-xs text-red-600">${deadline.dueDate}</span>
                                            <span class="text-xs text-gray-500">${deadline.submitted}/${deadline.total} submitted</span>
                                        </div>
                                        <div class="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                            <div class="bg-green-500 h-1.5 rounded-full" style="width: ${(deadline.submitted / deadline.total * 100).toFixed(0)}%"></div>
                                        </div>
                                    </div>
                                `);
    }).slice(0, 4).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/* ======================== TEACHER COURSE VIEW ======================== */

export function renderTeacherCourse(appContainer, params) {
    const { id, tab = 'overview' } = params;
    const course = getCourseById(parseInt(id));

    if (!course) {
        // Simple 404 for now
        appContainer.innerHTML = '<div class="p-6"><h1 class="text-2xl font-bold">Course not found</h1></div>';
        return;
    }

    const analytics = getCourseAnalytics(course.id);
    const students = getStudentsByCourse(course.id);
    const pending = getPendingGrading(course.id);

    appContainer.innerHTML = `
        <div class="p-6 fade-in">
            <!-- Breadcrumb -->
            <nav class="mb-4 text-sm text-gray-600">
                <a href="#/teacher/dashboard" class="hover:text-purple-600">Teacher Dashboard</a>
                <span class="mx-2">/</span>
                <span class="text-gray-900 font-medium">${escapeHtml(course.code)}</span>
            </nav>

            <!-- Course Header -->
            <div class="bg-gradient-to-r ${course.color} text-white rounded-xl p-6 mb-6 shadow-md">
                <div class="flex items-center justify-between">
                    <div>
                        <div class="text-sm opacity-90 mb-1">${escapeHtml(course.code)} • ${escapeHtml(course.term)}</div>
                        <h1 class="text-2xl md:text-3xl font-bold mb-2">${escapeHtml(course.name)}</h1>
                        <p class="text-white text-opacity-90">${analytics?.totalStudents || 0} students enrolled</p>
                    </div>
                    <button class="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors">
                        Course Settings
                    </button>
                </div>
            </div>

            <!-- Tabs -->
            <div class="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
                <nav class="flex border-b">
                    ${teacherCourseTabLink(id, 'overview', tab, 'Overview')}
                    ${teacherCourseTabLink(id, 'students', tab, 'Students')}
                    ${teacherCourseTabLink(id, 'grading', tab, 'Grading')}
                    ${teacherCourseTabLink(id, 'analytics', tab, 'Analytics')}
                    ${teacherCourseTabLink(id, 'content', tab, 'Content')}
                </nav>
            </div>

            <!-- Tab Content -->
            <div id="teacher-course-content">
                ${renderTeacherCourseTab(course, tab, analytics, students, pending)}
            </div>
        </div>
    `;
}

export function teacherCourseTabLink(courseId, tabName, activeTab, label) {
    const active = activeTab === tabName
        ? 'border-purple-600 text-purple-600'
        : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300';

    return `
        <a href="#/teacher/course/${courseId}/${tabName}"
           class="${active} px-6 py-4 text-sm font-medium border-b-2 transition-colors">
            ${label}
        </a>
    `;
}

export function renderTeacherCourseTab(course, tab, analytics, students, pending) {
    // Import tab renderers from teacherCourseTabs.js
    // For now, return placeholder
    return `<div class="p-6"><p>Tab content for: ${tab}</p><p>This will be implemented by importing from teacherCourseTabs.js</p></div>`;
}
