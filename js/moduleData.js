/**
 * Enhanced Module Data Structure
 * Add this to your courseData.js to enhance existing modules with detailed content
 */

// Sample enhanced module structure with items
export const moduleItems = {
    // ICS 31 - Course ID 1
    1: {
        1: [ // Module ID 1
            { id: 1, type: 'page', title: 'Welcome to ICS 31', completed: true, points: null },
            { id: 2, type: 'video', title: 'Introduction to Programming', duration: '15:30', completed: true, points: null },
            { id: 3, type: 'reading', title: 'Chapter 1: Getting Started', pages: 12, completed: true, points: null },
            { id: 4, type: 'assignment', title: 'Quiz 1: Python Basics', completed: true, points: 10, dueDate: 'Oct 8' },
            { id: 5, type: 'discussion', title: 'Introduce Yourself', completed: true, points: 5 }
        ],
        2: [ // Module ID 2
            { id: 1, type: 'video', title: 'Variables and Data Types', duration: '20:15', completed: true, points: null },
            { id: 2, type: 'video', title: 'Working with Strings', duration: '18:45', completed: true, points: null },
            { id: 3, type: 'reading', title: 'Chapter 2: Data Types', pages: 15, completed: true, points: null },
            { id: 4, type: 'file', title: 'Code Examples - Variables.py', completed: true, points: null },
            { id: 5, type: 'assignment', title: 'Lab 1: Variables Practice', completed: true, points: 20, dueDate: 'Oct 12' },
            { id: 6, type: 'quiz', title: 'Quiz 2: Data Types', completed: true, points: 10, dueDate: 'Oct 14' }
        ],
        3: [ // Module ID 3
            { id: 1, type: 'video', title: 'If Statements', duration: '22:30', completed: true, points: null },
            { id: 2, type: 'video', title: 'For Loops', duration: '25:00', completed: true, points: null },
            { id: 3, type: 'video', title: 'While Loops', duration: '20:00', completed: true, points: null },
            { id: 4, type: 'reading', title: 'Chapter 3: Control Flow', pages: 20, completed: true, points: null },
            { id: 5, type: 'file', title: 'Loop Examples.py', completed: true, points: null },
            { id: 6, type: 'assignment', title: 'Lab 2: Control Structures', completed: true, points: 25, dueDate: 'Oct 22' },
            { id: 7, type: 'quiz', title: 'Quiz 3: Loops', completed: true, points: 15, dueDate: 'Oct 25' }
        ],
        4: [ // Module ID 4
            { id: 1, type: 'video', title: 'Defining Functions', duration: '18:20', completed: false, points: null },
            { id: 2, type: 'video', title: 'Parameters and Arguments', duration: '22:15', completed: false, points: null },
            { id: 3, type: 'video', title: 'Return Values', duration: '16:45', completed: false, points: null },
            { id: 4, type: 'reading', title: 'Chapter 4: Functions', pages: 18, completed: false, points: null },
            { id: 5, type: 'assignment', title: 'Lab 3: Function Practice', completed: false, points: 30, dueDate: 'Nov 5' },
            { id: 6, type: 'quiz', title: 'Quiz 4: Functions', completed: false, points: 15, dueDate: 'Nov 7' }
        ],
        5: [ // Module ID 5
            { id: 1, type: 'video', title: 'Introduction to Lists', duration: '25:00', completed: false, points: null },
            { id: 2, type: 'video', title: 'List Methods', duration: '20:30', completed: false, points: null },
            { id: 3, type: 'video', title: 'Tuples Explained', duration: '15:45', completed: false, points: null },
            { id: 4, type: 'reading', title: 'Chapter 5: Lists and Tuples', pages: 22, completed: false, points: null },
            { id: 5, type: 'file', title: 'List Examples.py', completed: false, points: null },
            { id: 6, type: 'assignment', title: 'Lab 4: Lists Practice', completed: false, points: 30, dueDate: 'Nov 12' },
            { id: 7, type: 'quiz', title: 'Quiz 5: Lists', completed: false, points: 15, dueDate: 'Nov 14' },
            { id: 8, type: 'assignment', title: 'Project: Data Processing', completed: false, points: 50, dueDate: 'Nov 19' }
        ]
    },
    // MATH 2D - Course ID 2
    2: {
        1: [
            { id: 1, type: 'video', title: 'Vector Basics', duration: '30:00', completed: true, points: null },
            { id: 2, type: 'video', title: 'Dot Product', duration: '25:15', completed: true, points: null },
            { id: 3, type: 'video', title: 'Cross Product', duration: '28:30', completed: true, points: null },
            { id: 4, type: 'reading', title: 'Chapter 12: Vectors', pages: 25, completed: true, points: null },
            { id: 5, type: 'assignment', title: 'Problem Set 12', completed: true, points: 40, dueDate: 'Oct 15' },
            { id: 6, type: 'quiz', title: 'Quiz: Vectors', completed: true, points: 20, dueDate: 'Oct 18' },
            { id: 7, type: 'file', title: 'Vector Practice Problems.pdf', completed: true, points: null },
            { id: 8, type: 'discussion', title: 'Vector Applications', completed: true, points: 10 }
        ],
        2: [
            { id: 1, type: 'video', title: 'Vector Functions', duration: '32:00', completed: true, points: null },
            { id: 2, type: 'video', title: 'Derivatives of Vector Functions', duration: '28:45', completed: true, points: null },
            { id: 3, type: 'video', title: 'Arc Length', duration: '25:20', completed: true, points: null },
            { id: 4, type: 'reading', title: 'Chapter 13: Vector Functions', pages: 22, completed: true, points: null },
            { id: 5, type: 'assignment', title: 'Problem Set 13', completed: true, points: 40, dueDate: 'Oct 22' },
            { id: 6, type: 'quiz', title: 'Quiz: Vector Functions', completed: true, points: 20, dueDate: 'Oct 25' },
            { id: 7, type: 'file', title: 'Lecture Notes 13.pdf', completed: true, points: null }
        ],
        3: [
            { id: 1, type: 'video', title: 'Partial Derivatives', duration: '35:00', completed: false, points: null },
            { id: 2, type: 'video', title: 'Chain Rule', duration: '30:15', completed: false, points: null },
            { id: 3, type: 'video', title: 'Gradient', duration: '28:30', completed: false, points: null },
            { id: 4, type: 'video', title: 'Directional Derivatives', duration: '32:00', completed: false, points: null },
            { id: 5, type: 'reading', title: 'Chapter 14: Partial Derivatives', pages: 30, completed: false, points: null },
            { id: 6, type: 'assignment', title: 'Problem Set 14', completed: false, points: 45, dueDate: 'Nov 5' },
            { id: 7, type: 'quiz', title: 'Quiz: Partial Derivatives', completed: false, points: 20, dueDate: 'Nov 8' },
            { id: 8, type: 'file', title: 'Practice Problems 14.pdf', completed: false, points: null },
            { id: 9, type: 'discussion', title: 'Applications Discussion', completed: false, points: 10 }
        ],
        4: [
            { id: 1, type: 'video', title: 'Double Integrals', duration: '40:00', completed: false, points: null },
            { id: 2, type: 'video', title: 'Triple Integrals', duration: '38:30', completed: false, points: null },
            { id: 3, type: 'video', title: 'Polar Coordinates', duration: '35:15', completed: false, points: null },
            { id: 4, type: 'reading', title: 'Chapter 15: Multiple Integrals', pages: 35, completed: false, points: null },
            { id: 5, type: 'assignment', title: 'Problem Set 15', completed: false, points: 50, dueDate: 'Nov 15' },
            { id: 6, type: 'quiz', title: 'Quiz: Multiple Integrals', completed: false, points: 25, dueDate: 'Nov 18' },
            { id: 7, type: 'file', title: 'Integration Examples.pdf', completed: false, points: null },
            { id: 8, type: 'discussion', title: 'Integration Techniques', completed: false, points: 10 }
        ]
    }
};

/**
 * Gets module items for a specific course and module
 * @param {number} courseId - Course ID
 * @param {number} moduleId - Module ID
 * @returns {Array} Array of module items
 */
export const getModuleItems = (courseId, moduleId) => {
    return moduleItems[courseId]?.[moduleId] || [];
};

/**
 * Gets icon for module item type
 * @param {string} type - Item type
 * @returns {string} SVG icon HTML
 */
export const getModuleItemIcon = (type) => {
    const icons = {
        video: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>`,
        reading: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>`,
        assignment: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>`,
        quiz: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>`,
        page: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>`,
        file: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>`,
        discussion: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>`
    };
    return icons[type] || icons.page;
};

/**
 * Gets color class for module item type
 * @param {string} type - Item type
 * @returns {string} Tailwind color class
 */
export const getModuleItemColor = (type) => {
    const colors = {
        video: 'text-purple-600',
        reading: 'text-blue-600',
        assignment: 'text-red-600',
        quiz: 'text-green-600',
        page: 'text-gray-600',
        file: 'text-orange-600',
        discussion: 'text-teal-600'
    };
    return colors[type] || 'text-gray-600';
};
