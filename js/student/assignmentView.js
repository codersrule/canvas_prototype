/**
 * student/assignmentView.js
 * Assignment detail view with submission functionality
 */

import { getCourseById } from '../shared/courseData.js';
import { escapeHtml } from '../core/utils.js';
import { showToast } from '../shared/ui.js';
import { stateManager } from '../core/stateManager.js';

export class AssignmentView {
    constructor(appContainer) {
        this.appContainer = appContainer;
    }

    /**
     * Render assignment detail page
     * @param {Object} params - Contains courseId and assignmentId
     */
    render(params) {
        const { courseId, assignmentId } = params;
        const course = getCourseById(parseInt(courseId));

        if (!course) {
            this.render404();
            return;
        }

        const assignment = course.assignments.find(a => a.id === parseInt(assignmentId));
        if (!assignment) {
            this.render404();
            return;
        }

        this.appContainer.innerHTML = `
            <div class="p-6 fade-in">
                <!-- Breadcrumb -->
                <nav class="mb-6" aria-label="Breadcrumb">
                    <ol class="flex items-center space-x-2 text-sm text-gray-600">
                        <li><a href="#/" class="hover:text-blue-600 transition-colors">Dashboard</a></li>
                        <li>
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                            </svg>
                        </li>
                        <li><a href="#/course/${courseId}" class="hover:text-blue-600 transition-colors">${escapeHtml(course.code)}</a></li>
                        <li>
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                            </svg>
                        </li>
                        <li class="font-medium text-gray-900">${escapeHtml(assignment.title)}</li>
                    </ol>
                </nav>

                <!-- Assignment Details -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden">
                    <!-- Header -->
                    <div class="bg-gradient-to-r ${course.color} p-6 text-white">
                        <div class="flex items-center justify-between">
                            <div>
                                <div class="text-sm opacity-90 mb-1">${escapeHtml(course.code)}</div>
                                <h1 class="text-2xl font-bold">${escapeHtml(assignment.title)}</h1>
                            </div>
                            <div class="text-right">
                                <div class="text-3xl font-bold">${assignment.points}</div>
                                <div class="text-sm opacity-90">points</div>
                            </div>
                        </div>
                    </div>

                    <!-- Content -->
                    <div class="p-6">
                        <!-- Due Date & Status -->
                        <div class="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
                            <div>
                                <div class="text-sm text-gray-600 mb-1">Due Date</div>
                                <div class="text-lg font-semibold text-gray-900">${escapeHtml(assignment.dueDate)}</div>
                            </div>
                            <div class="text-right">
                                ${assignment.submitted ? `
                                    ${assignment.grade !== null ? `
                                        <div class="text-sm text-gray-600 mb-1">Your Grade</div>
                                        <div class="text-3xl font-bold ${this.getGradeColor(assignment.grade, assignment.points)}">
                                            ${assignment.grade}/${assignment.points}
                                        </div>
                                        <div class="text-sm text-gray-600 mt-1">
                                            ${((assignment.grade / assignment.points) * 100).toFixed(1)}%
                                        </div>
                                    ` : `
                                        <span class="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                                            Submitted - Pending Grading
                                        </span>
                                    `}
                                ` : `
                                    <span class="px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                                        Not Submitted
                                    </span>
                                `}
                            </div>
                        </div>

                        <!-- Description -->
                        <div class="mb-6">
                            <h2 class="text-lg font-semibold text-gray-900 mb-3">Instructions</h2>
                            <div class="prose prose-sm max-w-none text-gray-700">
                                ${assignment.description || 'No description provided for this assignment.'}
                            </div>
                        </div>

                        <!-- Submission Section -->
                        ${assignment.submitted ? `
                            <div class="bg-green-50 border border-green-200 rounded-lg p-6">
                                <div class="flex items-start">
                                    <svg class="w-6 h-6 text-green-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div class="flex-1">
                                        <h3 class="text-lg font-semibold text-green-900 mb-2">Assignment Submitted</h3>
                                        <p class="text-sm text-green-800 mb-3">
                                            You submitted this assignment${assignment.submission?.submittedAt ? ` on ${new Date(assignment.submission.submittedAt).toLocaleString()}` : ''}.
                                        </p>
                                        ${assignment.submission?.text ? `
                                            <div class="bg-white border border-green-200 rounded p-4 mb-3">
                                                <div class="text-xs font-medium text-gray-600 mb-2">Your Submission:</div>
                                                <div class="text-sm text-gray-900 whitespace-pre-wrap">${escapeHtml(assignment.submission.text)}</div>
                                            </div>
                                        ` : ''}
                                        ${assignment.submission?.fileName ? `
                                            <div class="flex items-center text-sm text-green-800">
                                                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                </svg>
                                                File: ${escapeHtml(assignment.submission.fileName)}
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                        ` : `
                            <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                <h3 class="text-lg font-semibold text-gray-900 mb-3">Submit Your Work</h3>
                                <p class="text-sm text-gray-700 mb-4">
                                    Submit your assignment before the due date to receive credit.
                                </p>
                                <button id="start-assignment-btn" 
                                        class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                    Submit Assignment
                                </button>
                            </div>
                        `}

                        <!-- Action Buttons -->
                        <div class="mt-6 flex gap-3">
                            <a href="#/course/${courseId}/assignments" 
                               class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                                Back to Assignments
                            </a>
                            <a href="#/course/${courseId}" 
                               class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                                Back to Course
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Attach event listener for submission button
        if (!assignment.submitted) {
            const submitBtn = document.getElementById('start-assignment-btn');
            if (submitBtn) {
                submitBtn.addEventListener('click', () => this.openSubmissionModal(course, assignment));
            }
        }
    }

    /**
     * Get color class for grade display
     */
    getGradeColor(grade, total) {
        const percentage = (grade / total) * 100;
        if (percentage >= 90) return 'text-green-600';
        if (percentage >= 80) return 'text-blue-600';
        if (percentage >= 70) return 'text-yellow-600';
        return 'text-red-600';
    }

    /**
     * Open submission modal
     */
    openSubmissionModal(course, assignment) {
        const modal = document.createElement('div');
        modal.id = 'submission-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 fade-in';

        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <!-- Modal Header -->
                <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 class="text-xl font-semibold text-gray-900">Submit Assignment</h2>
                    <button id="close-modal" class="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <!-- Modal Body -->
                <div class="p-6">
                    <div class="mb-6">
                        <h3 class="text-lg font-medium text-gray-900 mb-2">${escapeHtml(assignment.title)}</h3>
                        <p class="text-sm text-gray-600">${escapeHtml(course.code)} • Due: ${escapeHtml(assignment.dueDate)}</p>
                    </div>

                    <!-- Text Entry -->
                    <div class="mb-6">
                        <label for="submission-text" class="block text-sm font-medium text-gray-700 mb-2">
                            Text Submission
                        </label>
                        <textarea id="submission-text" 
                                  rows="8"
                                  class="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                  placeholder="Type your response here..."></textarea>
                        <p class="text-xs text-gray-500 mt-1">You can paste your work or type directly into this box.</p>
                    </div>

                    <!-- File Upload -->
                    <div class="mb-6">
                        <label for="submission-file" class="block text-sm font-medium text-gray-700 mb-2">
                            Upload File (Optional)
                        </label>
                        <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                            <svg class="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <input type="file" 
                                   id="submission-file" 
                                   class="hidden"
                                   accept=".pdf,.doc,.docx,.txt,.zip,.py,.java,.cpp,.c,.js">
                            <label for="submission-file" class="cursor-pointer">
                                <span class="text-blue-600 hover:text-blue-700 font-medium">Choose a file</span>
                                <span class="text-gray-600"> or drag and drop</span>
                            </label>
                            <p class="text-xs text-gray-500 mt-2">PDF, Word, Text, Code, or ZIP files</p>
                        </div>
                        <div id="file-name-display" class="mt-2 text-sm text-gray-700"></div>
                    </div>

                    <!-- Warning -->
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <div class="flex">
                            <svg class="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div>
                                <p class="text-sm font-medium text-yellow-900">Before you submit</p>
                                <p class="text-xs text-yellow-800 mt-1">Make sure you've reviewed your work. You cannot edit your submission after submitting.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Modal Footer -->
                <div class="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
                    <button id="cancel-submit" 
                            class="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                        Cancel
                    </button>
                    <button id="confirm-submit"
                            class="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Submit Assignment
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // File input change handler
        const fileInput = document.getElementById('submission-file');
        const fileDisplay = document.getElementById('file-name-display');
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                fileDisplay.innerHTML = `
                    <div class="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded">
                        <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span class="flex-1 text-sm">${escapeHtml(file.name)}</span>
                        <button onclick="document.getElementById('submission-file').value=''; this.parentElement.parentElement.innerHTML='';" class="text-red-600 hover:text-red-700">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                `;
            }
        });

        // Event listeners
        const closeModal = () => modal.remove();

        document.getElementById('close-modal').addEventListener('click', closeModal);
        document.getElementById('cancel-submit').addEventListener('click', closeModal);
        document.getElementById('confirm-submit').addEventListener('click', () => {
            this.submitAssignment(course, assignment, modal);
        });

        // Close modal on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // Close modal on Escape key
        document.addEventListener('keydown', function escapeHandler(e) {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escapeHandler);
            }
        });
    }

    /**
     * Submit assignment
     */
    submitAssignment(course, assignment, modal) {
        const text = document.getElementById('submission-text').value.trim();
        const file = document.getElementById('submission-file').files[0];

        // Validation
        if (!text && !file) {
            showToast('Please provide either text or upload a file before submitting.', 'error');
            return;
        }

        // Update assignment in courseDetails
        assignment.submitted = true;
        assignment.submission = {
            text,
            fileName: file ? file.name : null,
            submittedAt: new Date().toISOString()
        };

        // Update state - this persists the change
        const courses = stateManager.getState().courses;
        const courseIndex = courses.findIndex(c => c.id === course.id);
        if (courseIndex !== -1) {
            courses[courseIndex] = { ...courses[courseIndex] };
        }
        stateManager.setCourses(courses);

        // Close modal
        modal.remove();

        // Show success message
        showToast('Assignment submitted successfully!', 'success');

        // Re-render the assignment page to show submitted state
        setTimeout(() => {
            this.render({ courseId: course.id, assignmentId: assignment.id });
        }, 100);
    }

    /**
     * Render 404 page
     */
    render404() {
        this.appContainer.innerHTML = `
            <div class="p-6 fade-in">
                <div class="bg-white rounded-lg shadow-md p-12 text-center max-w-2xl mx-auto mt-20">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-24 h-24 text-gray-400 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h1 class="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <p class="text-xl text-gray-600 mb-8">Assignment not found</p>
                    <a href="#/" class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Back to Dashboard
                    </a>
                </div>
            </div>
        `;
    }
}
