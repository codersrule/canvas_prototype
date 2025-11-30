/**
 * teacher/teacherCourseTabs.js
 * Teacher course tab rendering functions
 */

import { escapeHtml } from '../core/utils.js';
import { getStudentsByCourse, getCourseAnalytics, getPendingGrading, calculateClassStats } from './teacherData.js';

/* ======================== TAB RENDERERS ======================== */

export function renderTeacherCourseOverview(course, analytics, pending) {
    return `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Main Stats -->
            <div class="lg:col-span-2 space-y-6">
                <!-- Key Metrics -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-white rounded-lg shadow-md p-5">
                        <p class="text-sm text-gray-600">Average Grade</p>
                        <p class="text-3xl font-bold text-gray-900 mt-1">${analytics?.averageGrade || 0}%</p>
                        <p class="text-xs text-green-600 mt-1">↑ 2.3% from last week</p>
                    </div>
                    <div class="bg-white rounded-lg shadow-md p-5">
                        <p class="text-sm text-gray-600">Completion Rate</p>
                        <p class="text-3xl font-bold text-gray-900 mt-1">${analytics?.assignmentCompletion || 0}%</p>
                        <p class="text-xs text-gray-600 mt-1">Assignment submissions</p>
                    </div>
                    <div class="bg-white rounded-lg shadow-md p-5">
                        <p class="text-sm text-gray-600">Attendance</p>
                        <p class="text-3xl font-bold text-gray-900 mt-1">${analytics?.attendanceRate || 0}%</p>
                        <p class="text-xs text-gray-600 mt-1">Class participation</p>
                    </div>
                </div>

                <!-- Grade Distribution -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h3 class="text-lg font-semibold mb-4 text-gray-700">Grade Distribution</h3>
                    <div class="space-y-3">
                        ${Object.entries(analytics?.gradeDistribution || {}).map(([grade, count]) => {
        const total = Object.values(analytics?.gradeDistribution || {}).reduce((sum, c) => sum + c, 0);
        const percentage = total > 0 ? (count / total * 100).toFixed(0) : 0;
        const colors = {
            'A': 'bg-green-500',
            'B': 'bg-blue-500',
            'C': 'bg-yellow-500',
            'D': 'bg-orange-500',
            'F': 'bg-red-500'
        };
        return `
                                <div>
                                    <div class="flex justify-between text-sm mb-1">
                                        <span class="font-medium text-gray-700">Grade ${grade}</span>
                                        <span class="text-gray-600">${count} students (${percentage}%)</span>
                                    </div>
                                    <div class="w-full bg-gray-200 rounded-full h-2">
                                        <div class="${colors[grade] || 'bg-gray-500'} h-2 rounded-full" style="width: ${percentage}%"></div>
                                    </div>
                                </div>
                            `;
    }).join('')}
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h3 class="text-lg font-semibold mb-4 text-gray-700">Recent Activity</h3>
                    <div class="space-y-3">
                        ${(analytics?.recentActivity || []).map(activity => `
                            <div class="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    ${activity.type === 'submission' ? '📝' : activity.type === 'grade' ? '✅' : '💬'}
                                </div>
                                <div class="flex-1">
                                    <p class="text-sm text-gray-900">${activity.message}</p>
                                    <p class="text-xs text-gray-500 mt-1">${activity.time}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- Sidebar -->
            <div class="space-y-6">
                <!-- Pending Grading -->
                <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
                    <h3 class="text-lg font-semibold mb-4 text-gray-700">Pending Grading</h3>
                    ${pending && pending.length > 0 ? `
                        <div class="space-y-3">
                            ${pending.slice(0, 5).map(item => `
                                <div class="pb-3 border-b border-gray-100 last:border-0">
                                    <p class="text-sm font-medium text-gray-900">${escapeHtml(item.studentName)}</p>
                                    <p class="text-xs text-gray-600 mt-1">${escapeHtml(item.assignmentName)}</p>
                                    <div class="flex items-center justify-between mt-2">
                                        <span class="text-xs text-gray-500">${item.timeAgo}</span>
                                        <button class="text-xs text-purple-600 hover:text-purple-700 font-medium">Grade Now</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <p class="text-center text-sm text-gray-600 mt-4">${pending.length} total submissions</p>
                    ` : `
                        <p class="text-sm text-gray-500 text-center py-4">All caught up! ✓</p>
                    `}
                </div>

                <!-- Upcoming Deadlines -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h3 class="text-lg font-semibold mb-4 text-gray-700">Upcoming Deadlines</h3>
                    <div class="space-y-3">
                        ${(analytics?.upcomingDeadlines || []).map(deadline => `
                            <div class="pb-3 border-b border-gray-100 last:border-0">
                                <p class="text-sm font-medium text-gray-900">${escapeHtml(deadline.assignment)}</p>
                                <p class="text-xs text-red-600 mt-1">${deadline.dueDate}</p>
                                <div class="flex items-center justify-between mt-2">
                                    <span class="text-xs text-gray-500">${deadline.submitted}/${deadline.total}</span>
                                    <div class="w-24 bg-gray-200 rounded-full h-1.5">
                                        <div class="bg-green-500 h-1.5 rounded-full" style="width: ${(deadline.submitted / deadline.total * 100).toFixed(0)}%"></div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h3 class="text-lg font-semibold mb-4 text-gray-700">Quick Actions</h3>
                    <div class="space-y-2">
                        <button class="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                            Create Announcement
                        </button>
                        <button class="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                            Add Assignment
                        </button>
                        <button class="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                            Message Students
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function renderTeacherCourseStudents(course, students) {
    const stats = calculateClassStats(course.id);

    return `
        <div class="space-y-6">
            <!-- Class Stats -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="bg-white rounded-lg shadow-md p-5">
                    <p class="text-sm text-gray-600">Average Grade</p>
                    <p class="text-2xl font-bold text-gray-900 mt-1">${stats.averageGrade}%</p>
                </div>
                <div class="bg-white rounded-lg shadow-md p-5">
                    <p class="text-sm text-gray-600">Highest Grade</p>
                    <p class="text-2xl font-bold text-green-600 mt-1">${stats.highestGrade}%</p>
                </div>
                <div class="bg-white rounded-lg shadow-md p-5">
                    <p class="text-sm text-gray-600">Lowest Grade</p>
                    <p class="text-2xl font-bold text-red-600 mt-1">${stats.lowestGrade}%</p>
                </div>
                <div class="bg-white rounded-lg shadow-md p-5">
                    <p class="text-sm text-gray-600">Passing Rate</p>
                    <p class="text-2xl font-bold text-blue-600 mt-1">${stats.passingRate}%</p>
                </div>
            </div>

            <!-- Student Roster -->
            <div class="bg-white rounded-lg shadow-md overflow-hidden">
                <div class="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 class="text-lg font-semibold text-gray-700">Student Roster</h3>
                    <div class="flex gap-2">
                        <input type="text" placeholder="Search students..." class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm">
                        <button class="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                            Export
                        </button>
                    </div>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Grade</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submissions</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${(students || []).map(student => {
        const gradeColor = student.currentGrade >= 90 ? 'text-green-600' :
            student.currentGrade >= 80 ? 'text-blue-600' :
                student.currentGrade >= 70 ? 'text-yellow-600' : 'text-red-600';
        return `
                                    <tr class="hover:bg-gray-50">
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="flex items-center">
                                                <div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                                                    ${student.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div class="ml-3">
                                                    <p class="text-sm font-medium text-gray-900">${escapeHtml(student.name)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${escapeHtml(student.email)}</td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span class="text-sm font-semibold ${gradeColor}">${student.currentGrade}%</span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${student.attendance}%</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${student.submissions}/12</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${student.lastActive}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm">
                                            <button class="text-purple-600 hover:text-purple-700 font-medium">View Details</button>
                                        </td>
                                    </tr>
                                `;
    }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

export function renderTeacherCourseGrading(course, pending) {
    return `
        <div class="space-y-6">
            <!-- Grading Queue Header -->
            <div class="bg-white rounded-lg shadow-md p-4 flex justify-between items-center">
                <h3 class="text-lg font-semibold text-gray-700">Grading Queue (${pending?.length || 0} items)</h3>
                <div class="flex gap-2">
                    <select class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm">
                        <option>All Assignments</option>
                        <option>Assignment 1</option>
                        <option>Assignment 2</option>
                        <option>Assignment 3</option>
                    </select>
                    <select class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm">
                        <option>Sort by: Date</option>
                        <option>Sort by: Student</option>
                    </select>
                </div>
            </div>

            <!-- Pending Submissions -->
            ${pending && pending.length > 0 ? `
                <div class="space-y-4">
                    ${pending.map(item => `
                        <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                            <div class="flex items-start justify-between">
                                <div class="flex items-start gap-4 flex-1">
                                    <div class="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                                        ${item.studentName.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div class="flex-1">
                                        <h4 class="font-semibold text-gray-900">${escapeHtml(item.studentName)}</h4>
                                        <p class="text-sm text-gray-600 mt-1">${escapeHtml(item.assignmentName)}</p>
                                        <div class="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                            <span class="flex items-center gap-1">
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                ${item.timeAgo}
                                            </span>
                                            <span class="flex items-center gap-1">
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                </svg>
                                                ${item.files?.length || 0} file(s)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
                                    Grade Now
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : `
                <div class="bg-white rounded-lg shadow-md p-12 text-center">
                    <svg class="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">All Caught Up!</h3>
                    <p class="text-gray-600">No submissions pending grading</p>
                </div>
            `}
        </div>
    `;
}

export function renderTeacherCourseAnalytics(course, analytics) {
    return `
        <div class="space-y-6">
            <!-- Performance Metrics -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-lg font-semibold mb-4 text-gray-700">Performance Metrics</h3>
                <div class="space-y-4">
                    ${Object.entries(analytics?.performanceMetrics || {}).map(([key, value]) => {
        const labels = {
            averageTimeToComplete: 'Average Time to Complete',
            submissionRate: 'Submission Rate',
            lateSubmissions: 'Late Submissions',
            resubmissions: 'Resubmissions'
        };
        return `
                            <div>
                                <div class="flex justify-between text-sm mb-1">
                                    <span class="text-gray-700">${labels[key]}</span>
                                    <span class="font-medium text-gray-900">${value}${key.includes('Rate') ? '%' : key.includes('Time') ? ' days' : ''}</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2">
                                    <div class="bg-purple-500 h-2 rounded-full" style="width: ${key.includes('Rate') ? value : Math.min(value * 10, 100)}%"></div>
                                </div>
                            </div>
                        `;
    }).join('')}
                </div>
            </div>

            <!-- Grade Distribution Chart -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-lg font-semibold mb-4 text-gray-700">Grade Distribution</h3>
                <div class="flex items-end justify-around h-64 border-b border-gray-200">
                    ${Object.entries(analytics?.gradeDistribution || {}).map(([grade, count]) => {
        const maxCount = Math.max(...Object.values(analytics?.gradeDistribution || {}));
        const height = (count / maxCount * 100).toFixed(0);
        const colors = {
            'A': 'bg-green-500',
            'B': 'bg-blue-500',
            'C': 'bg-yellow-500',
            'D': 'bg-orange-500',
            'F': 'bg-red-500'
        };
        return `
                            <div class="flex flex-col items-center">
                                <div class="text-sm font-medium text-gray-900 mb-2">${count}</div>
                                <div class="${colors[grade]} w-16 rounded-t transition-all" style="height: ${height}%"></div>
                                <div class="text-sm font-medium text-gray-600 mt-2">${grade}</div>
                            </div>
                        `;
    }).join('')}
                </div>
            </div>

            <!-- Assignment Completion Trends -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-lg font-semibold mb-4 text-gray-700">Assignment Completion Trends</h3>
                <div class="h-64 flex items-center justify-center text-gray-500">
                    <p>Chart showing completion rates over time would go here</p>
                </div>
            </div>
        </div>
    `;
}

export function renderTeacherCourseContent(course) {
    return `
        <div class="space-y-6">
            <!-- Content Header -->
            <div class="bg-white rounded-lg shadow-md p-4 flex justify-between items-center">
                <h3 class="text-lg font-semibold text-gray-700">Course Content</h3>
                <div class="flex gap-2">
                    <button class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                        Add Module
                    </button>
                    <button class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                        Add Assignment
                    </button>
                </div>
            </div>

            <!-- Modules List -->
            <div class="space-y-4">
                ${[1, 2, 3].map(i => `
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-4 flex-1">
                                <svg class="w-5 h-5 text-gray-400 cursor-move" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                                <div class="flex-1">
                                    <h4 class="font-semibold text-gray-900">Module ${i}: Course Topic</h4>
                                    <p class="text-sm text-gray-600 mt-1">5 items • Published</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <button class="p-2 text-gray-600 hover:text-purple-600 transition-colors">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                <button class="p-2 text-gray-600 hover:text-red-600 transition-colors">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}
