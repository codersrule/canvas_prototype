/**
 * pages/gradesPage.js
 * Grades Page View with Collapsible Course Cards
 * Displays student grades organized by course with expandable sections
 */

import { escapeHtml } from '../core/utils.js';
import { coursesData } from '../shared/data.js';
import { courseDetails } from '../shared/courseData.js';

export class GradesPage {
    constructor(appContainer) {
        this.appContainer = appContainer;
        this.expandedCourses = new Set(); // Track which courses are expanded
    }

    /**
     * Render the grades page
     */
    render() {
        this.appContainer.innerHTML = `
            <div class="grades-page p-6 fade-in">
                <!-- Header -->
                <div class="mb-6">
                    <h1 class="text-3xl font-bold text-gray-900 mb-2">Grades</h1>
                    <p class="text-gray-600">View your grades and academic progress</p>
                </div>

                <!-- Overall Statistics -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    ${this.renderOverallStats()}
                </div>

                <!-- Courses with Grades -->
                <div class="space-y-4">
                    ${this.renderCourseGrades()}
                </div>
            </div>

            <style>
                .course-grade-card {
                    transition: all 0.2s ease;
                }

                .course-grade-card:hover {
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }

                .grade-arrow {
                    transition: transform 0.3s ease;
                }

                .grade-item {
                    transition: background-color 0.15s ease;
                }

                .grade-item:hover {
                    background-color: #f9fafb;
                }

                .grade-badge {
                    font-weight: 600;
                    padding: 0.25rem 0.75rem;
                    border-radius: 0.375rem;
                    font-size: 0.875rem;
                }

                .grade-a { background-color: #d1fae5; color: #065f46; }
                .grade-b { background-color: #dbeafe; color: #1e40af; }
                .grade-c { background-color: #fef3c7; color: #92400e; }
                .grade-d { background-color: #fed7aa; color: #9a3412; }
                .grade-f { background-color: #fee2e2; color: #991b1b; }
                .grade-pending { background-color: #f3f4f6; color: #4b5563; }

                .progress-bar {
                    transition: width 0.3s ease;
                }
            </style>
        `;

        this.attachEventListeners();
    }

    /**
     * Render overall statistics
     */
    renderOverallStats() {
        const courses = coursesData.map(c => {
            const details = courseDetails[c.id];
            return {
                ...c,
                currentGrade: details ? this.calculateCourseGrade(details) : null
            };
        });

        const validGrades = courses.filter(c => c.currentGrade !== null).map(c => c.currentGrade);
        const overallGPA = validGrades.length > 0
            ? (validGrades.reduce((sum, g) => sum + this.gradeToGPA(g), 0) / validGrades.length).toFixed(2)
            : '0.00';

        const overallAverage = validGrades.length > 0
            ? (validGrades.reduce((sum, g) => sum + g, 0) / validGrades.length).toFixed(1)
            : '0.0';

        const completedAssignments = courses.reduce((sum, c) => {
            const details = courseDetails[c.id];
            if (!details || !details.assignments) return sum;
            return sum + details.assignments.filter(a => a.submitted).length;
        }, 0);

        const totalAssignments = courses.reduce((sum, c) => {
            const details = courseDetails[c.id];
            if (!details || !details.assignments) return sum;
            return sum + details.assignments.length;
        }, 0);

        return `
            <div class="bg-white rounded-lg shadow-md p-5">
                <div class="flex items-center justify-between mb-2">
                    <p class="text-sm text-gray-600">Overall GPA</p>
                    <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                </div>
                <p class="text-3xl font-bold text-gray-900">${overallGPA}</p>
            </div>

            <div class="bg-white rounded-lg shadow-md p-5">
                <div class="flex items-center justify-between mb-2">
                    <p class="text-sm text-gray-600">Average Grade</p>
                    <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                </div>
                <p class="text-3xl font-bold text-gray-900">${overallAverage}%</p>
            </div>

            <div class="bg-white rounded-lg shadow-md p-5">
                <div class="flex items-center justify-between mb-2">
                    <p class="text-sm text-gray-600">Completed</p>
                    <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <p class="text-3xl font-bold text-gray-900">${completedAssignments}/${totalAssignments}</p>
            </div>

            <div class="bg-white rounded-lg shadow-md p-5">
                <div class="flex items-center justify-between mb-2">
                    <p class="text-sm text-gray-600">Courses</p>
                    <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                </div>
                <p class="text-3xl font-bold text-gray-900">${courses.length}</p>
            </div>
        `;
    }

    /**
     * Render course grades with collapsible sections
     */
    renderCourseGrades() {
        return coursesData.map(course => {
            const details = courseDetails[course.id];
            if (!details) return '';

            const isExpanded = this.expandedCourses.has(course.id);
            const currentGrade = this.calculateCourseGrade(details);
            const letterGrade = this.getLetterGrade(currentGrade);
            const gradeClass = this.getGradeClass(letterGrade);

            return `
                <div class="course-grade-card bg-white rounded-lg shadow-md overflow-hidden" data-course-id="${course.id}">
                    <!-- Course Header (Clickable) -->
                    <div class="course-grade-header p-5 cursor-pointer hover:bg-gray-50 transition-colors" 
                         onclick="window.toggleCourseGrades(${course.id})">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-4 flex-1">
                                <!-- Course Color Bar -->
                                <div class="w-1 h-16 bg-gradient-to-b ${course.color} rounded-full"></div>
                                
                                <!-- Course Info -->
                                <div class="flex-1">
                                    <div class="flex items-center gap-3 mb-1">
                                        <h3 class="text-lg font-semibold text-gray-900">${escapeHtml(course.code)}</h3>
                                        <span class="grade-badge ${gradeClass}">
                                            ${currentGrade !== null ? `${currentGrade.toFixed(1)}% (${letterGrade})` : 'N/A'}
                                        </span>
                                    </div>
                                    <p class="text-sm text-gray-600">${escapeHtml(course.name)}</p>
                                    <p class="text-xs text-gray-500 mt-1">${escapeHtml(course.professor)}</p>
                                </div>

                                <!-- Grade Progress -->
                                <div class="hidden md:block w-48">
                                    <div class="flex items-center justify-between text-xs text-gray-600 mb-1">
                                        <span>Progress</span>
                                        <span>${this.getCompletionPercentage(details)}%</span>
                                    </div>
                                    <div class="w-full bg-gray-200 rounded-full h-2">
                                        <div class="progress-bar bg-gradient-to-r ${course.color} h-2 rounded-full" 
                                             style="width: ${this.getCompletionPercentage(details)}%"></div>
                                    </div>
                                </div>
                            </div>

                            <!-- Expand Arrow -->
                            <svg class="grade-arrow w-6 h-6 text-gray-400 ml-4 flex-shrink-0" 
                                 style="transform: rotate(${isExpanded ? '180deg' : '0deg'})"
                                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    <!-- Course Grades Content (Collapsible) -->
                    <div class="course-grades-content ${isExpanded ? '' : 'hidden'}" id="course-grades-${course.id}">
                        <div class="border-t border-gray-200">
                            ${this.renderCourseAssignments(course, details)}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Render assignments for a course
     */
    renderCourseAssignments(course, details) {
        if (!details.assignments || details.assignments.length === 0) {
            return `
                <div class="p-6 text-center text-gray-500">
                    <p>No assignments yet</p>
                </div>
            `;
        }

        return `
            <div class="p-5">
                <div class="space-y-2">
                    ${details.assignments.map(assignment => this.renderAssignmentGrade(assignment, course)).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Render individual assignment grade
     */
    renderAssignmentGrade(assignment, course) {
        const isSubmitted = assignment.submitted;
        const grade = assignment.grade;
        const percentage = grade !== null && grade !== undefined ? (grade / assignment.points * 100) : null;

        let statusBadge = '';
        let gradeDisplay = '';

        if (isSubmitted && grade !== null && grade !== undefined) {
            const letterGrade = this.getLetterGrade(percentage);
            const gradeClass = this.getGradeClass(letterGrade);
            statusBadge = `<span class="grade-badge ${gradeClass}">${grade}/${assignment.points} (${percentage.toFixed(0)}%)</span>`;
            gradeDisplay = letterGrade;
        } else if (isSubmitted) {
            statusBadge = `<span class="grade-badge grade-pending">Submitted - Pending</span>`;
            gradeDisplay = '-';
        } else {
            statusBadge = `<span class="grade-badge grade-pending">Not Submitted</span>`;
            gradeDisplay = '-';
        }

        return `
            <div class="grade-item p-4 rounded-lg border border-gray-200">
                <div class="flex items-center justify-between">
                    <div class="flex-1">
                        <div class="flex items-center gap-3 mb-1">
                            <h4 class="font-medium text-gray-900">${escapeHtml(assignment.title)}</h4>
                            ${statusBadge}
                        </div>
                        <div class="flex items-center gap-4 text-sm text-gray-600">
                            <span class="flex items-center gap-1">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Due: ${escapeHtml(assignment.dueDate)}
                            </span>
                            <span class="flex items-center gap-1">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                                ${assignment.points} points
                            </span>
                        </div>
                    </div>

                    <div class="flex items-center gap-4">
                        <div class="text-right">
                            <div class="text-2xl font-bold text-gray-900">${gradeDisplay}</div>
                            ${percentage !== null ? `<div class="text-xs text-gray-500">${percentage.toFixed(1)}%</div>` : ''}
                        </div>
                        
                        ${isSubmitted ? `
                            <button class="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    onclick="window.location.hash='#/course/${course.id}/assignment/${assignment.id}'">
                                View
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Calculate overall course grade
     */
    calculateCourseGrade(courseDetails) {
        if (!courseDetails.assignments || courseDetails.assignments.length === 0) return null;

        const gradedAssignments = courseDetails.assignments.filter(a =>
            a.submitted && a.grade !== null && a.grade !== undefined
        );

        if (gradedAssignments.length === 0) return null;

        const totalPoints = gradedAssignments.reduce((sum, a) => sum + a.grade, 0);
        const maxPoints = gradedAssignments.reduce((sum, a) => sum + a.points, 0);

        return (totalPoints / maxPoints) * 100;
    }

    /**
     * Get completion percentage for a course
     */
    getCompletionPercentage(courseDetails) {
        if (!courseDetails.assignments || courseDetails.assignments.length === 0) return 0;

        const submitted = courseDetails.assignments.filter(a => a.submitted).length;
        return Math.round((submitted / courseDetails.assignments.length) * 100);
    }

    /**
     * Convert numeric grade to letter grade
     */
    getLetterGrade(percentage) {
        if (percentage === null || percentage === undefined) return 'N/A';
        if (percentage >= 90) return 'A';
        if (percentage >= 80) return 'B';
        if (percentage >= 70) return 'C';
        if (percentage >= 60) return 'D';
        return 'F';
    }

    /**
     * Get CSS class for grade badge
     */
    getGradeClass(letterGrade) {
        const gradeClasses = {
            'A': 'grade-a',
            'B': 'grade-b',
            'C': 'grade-c',
            'D': 'grade-d',
            'F': 'grade-f',
            'N/A': 'grade-pending'
        };
        return gradeClasses[letterGrade] || 'grade-pending';
    }

    /**
     * Convert percentage to GPA (4.0 scale)
     */
    gradeToGPA(percentage) {
        if (percentage >= 93) return 4.0;
        if (percentage >= 90) return 3.7;
        if (percentage >= 87) return 3.3;
        if (percentage >= 83) return 3.0;
        if (percentage >= 80) return 2.7;
        if (percentage >= 77) return 2.3;
        if (percentage >= 73) return 2.0;
        if (percentage >= 70) return 1.7;
        if (percentage >= 67) return 1.3;
        if (percentage >= 63) return 1.0;
        if (percentage >= 60) return 0.7;
        return 0.0;
    }

    /**
     * Toggle course grades visibility
     */
    toggleCourseGrades(courseId) {
        const content = document.getElementById(`course-grades-${courseId}`);
        const arrow = document.querySelector(`[data-course-id="${courseId}"] .grade-arrow`);

        if (!content || !arrow) return;

        const isExpanded = !content.classList.contains('hidden');

        if (isExpanded) {
            content.classList.add('hidden');
            arrow.style.transform = 'rotate(0deg)';
            this.expandedCourses.delete(courseId);
        } else {
            content.classList.remove('hidden');
            arrow.style.transform = 'rotate(180deg)';
            this.expandedCourses.add(courseId);
        }
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Make toggleCourseGrades available globally
        window.toggleCourseGrades = (courseId) => this.toggleCourseGrades(courseId);
    }
}
