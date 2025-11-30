/**
 * student/studentDashboard.js
 * Student dashboard view and related functionality
 */

import { renderCourses, renderTodos, renderAnnouncements } from '../shared/ui.js';
import { stateManager } from '../core/stateManager.js';

export class StudentDashboard {
    constructor(appContainer) {
        this.appContainer = appContainer;
    }

    render() {
        const { courses, todos, announcements } = stateManager.getState();

        this.appContainer.innerHTML = `
            <div class="p-6 fade-in">
                <!-- Welcome Banner -->
                <div class="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl p-6 mb-6 shadow-md">
                    <h1 class="text-2xl md:text-3xl font-bold mb-2">Welcome back, Sadiq Haruna!</h1>
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
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                                <h3 class="text-lg font-semibold text-gray-700">To Do</h3>
                            </div>
                            <div id="todos-container" class="space-y-4">
                                ${renderTodos(todos)}
                            </div>
                            <a href="#" class="block text-center text-blue-500 text-sm mt-4 hover:underline">View All</a>
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
                            <a href="#" class="block text-center text-blue-500 text-sm mt-4 hover:underline">View All</a>
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

        this.attachEventListeners();
    }

    attachEventListeners() {
        // Attach course card click handlers
        const courseCards = this.appContainer.querySelectorAll('.course-card');
        courseCards.forEach(card => {
            card.addEventListener('click', () => {
                const courseId = card.dataset.courseId;
                window.location.hash = `#/course/${courseId}`;
            });
        });
    }
}
