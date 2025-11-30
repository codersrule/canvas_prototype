/**
 * Course data for individual course pages
 */

export const courseDetails = {
    1: {
        id: 1,
        code: 'ICS 31',
        name: 'Introduction to Programming',
        professor: 'Prof. Pattis',
        color: 'from-blue-500 to-blue-600',
        description: 'An introduction to the fundamentals of computer programming using Python. Topics include basic data types, control structures, functions, lists, and dictionaries.',
        term: 'Fall 2025',
        credits: 4,
        location: 'ICS 174',
        time: 'MWF 10:00-10:50am',
        officeHours: 'Tuesday 2-4pm, Thursday 3-5pm',
        assignments: [
            { id: 1, title: 'Assignment 1: Variables and Expressions', dueDate: 'Oct 15 at 11:59pm', points: 100, submitted: true, grade: 95 },
            { id: 2, title: 'Assignment 2: Control Flow', dueDate: 'Oct 29 at 11:59pm', points: 100, submitted: true, grade: 88 },
            { id: 3, title: 'Assignment 3: Lists and Tuples', dueDate: 'Nov 5 at 11:59pm', points: 100, submitted: false, grade: null },
            { id: 4, title: 'Assignment 4: Dictionaries', dueDate: 'Nov 19 at 11:59pm', points: 100, submitted: false, grade: null }
        ],
        modules: [
            { id: 1, title: 'Week 1: Introduction to Python', completed: true, items: 5 },
            { id: 2, title: 'Week 2: Variables and Data Types', completed: true, items: 6 },
            { id: 3, title: 'Week 3: Control Structures', completed: true, items: 7 },
            { id: 4, title: 'Week 4: Functions', completed: false, items: 6 },
            { id: 5, title: 'Week 5: Lists and Tuples', completed: false, items: 8 }
        ],
        announcements: [
            { id: 1, title: 'Midterm Exam Schedule', date: '2 hours ago', content: 'The midterm exam will be held on November 15th in our regular classroom.' },
            { id: 2, title: 'Office Hours Change', date: '1 day ago', content: 'This week\'s Thursday office hours moved to Friday 3-5pm.' }
        ]
    },
    2: {
        id: 2,
        code: 'MATH 2D',
        name: 'Multivariable Calculus',
        professor: 'Prof. Smith',
        color: 'from-green-500 to-green-600',
        description: 'Vector geometry, partial derivatives, multiple integrals, line and surface integrals, Green\'s theorem, Stokes\' theorem.',
        term: 'Fall 2025',
        credits: 4,
        location: 'RH 104',
        time: 'TuTh 11:00-12:20pm',
        officeHours: 'Monday 1-3pm, Wednesday 2-4pm',
        assignments: [
            { id: 1, title: 'Homework 5: Partial Derivatives', dueDate: 'Oct 20 at 11:59pm', points: 50, submitted: true, grade: 47 },
            { id: 2, title: 'Homework 6: Chain Rule', dueDate: 'Oct 27 at 11:59pm', points: 50, submitted: true, grade: 45 },
            { id: 3, title: 'Homework 7: Double Integrals', dueDate: 'Nov 6 at 11:59pm', points: 50, submitted: false, grade: null }
        ],
        modules: [
            { id: 1, title: 'Chapter 12: Vectors', completed: true, items: 8 },
            { id: 2, title: 'Chapter 13: Vector Functions', completed: true, items: 7 },
            { id: 3, title: 'Chapter 14: Partial Derivatives', completed: false, items: 9 },
            { id: 4, title: 'Chapter 15: Multiple Integrals', completed: false, items: 8 }
        ],
        announcements: [
            { id: 1, title: 'Office Hours Update', date: '5 hours ago', content: 'Additional office hours added on Fridays 10am-12pm.' }
        ]
    },
    3: {
        id: 3,
        code: 'WRITING 39B',
        name: 'Critical Reading & Rhetoric',
        professor: 'Prof. Johnson',
        color: 'from-orange-500 to-orange-600',
        description: 'Intensive instruction in critical reading and academic writing. Focus on analyzing complex texts and developing arguments.',
        term: 'Fall 2025',
        credits: 4,
        location: 'HIB 100',
        time: 'MWF 1:00-1:50pm',
        officeHours: 'Monday 3-5pm',
        assignments: [
            { id: 1, title: 'Essay 1: Rhetorical Analysis', dueDate: 'Oct 10 at 11:59pm', points: 100, submitted: true, grade: 92 },
            { id: 2, title: 'Essay Draft 2', dueDate: 'Nov 8 at 11:59pm', points: 100, submitted: false, grade: null },
            { id: 3, title: 'Final Research Paper', dueDate: 'Dec 10 at 11:59pm', points: 200, submitted: false, grade: null }
        ],
        modules: [
            { id: 1, title: 'Module 1: Introduction to Rhetoric', completed: true, items: 5 },
            { id: 2, title: 'Module 2: Analyzing Arguments', completed: true, items: 6 },
            { id: 3, title: 'Module 3: Research Methods', completed: false, items: 7 }
        ],
        announcements: []
    },
    4: {
        id: 4,
        code: 'ICS 6B',
        name: 'Boolean Algebra & Logic',
        professor: 'Prof. Klefstad',
        color: 'from-purple-500 to-purple-600',
        description: 'Boolean algebra, logic gates, circuit minimization, sequential circuits, and finite automata.',
        term: 'Fall 2025',
        credits: 4,
        location: 'ICS 180',
        time: 'TuTh 2:00-3:20pm',
        officeHours: 'Wednesday 10am-12pm',
        assignments: [
            { id: 1, title: 'Problem Set 3: Logic Gates', dueDate: 'Oct 25 at 11:59pm', points: 50, submitted: true, grade: 48 },
            { id: 2, title: 'Problem Set 4: Circuit Design', dueDate: 'Nov 10 at 11:59pm', points: 50, submitted: false, grade: null }
        ],
        modules: [
            { id: 1, title: 'Boolean Algebra Fundamentals', completed: true, items: 6 },
            { id: 2, title: 'Logic Gates and Circuits', completed: false, items: 7 },
            { id: 3, title: 'Sequential Circuits', completed: false, items: 8 }
        ],
        announcements: []
    },
    5: {
        id: 5,
        code: 'PHYSICS 7C',
        name: 'Classical Mechanics',
        professor: 'Prof. Davis',
        color: 'from-red-500 to-red-600',
        description: 'Newton\'s laws, work and energy, momentum, rotational motion, oscillations, and gravitation.',
        term: 'Fall 2025',
        credits: 4,
        location: 'PSCB 140',
        time: 'MWF 12:00-12:50pm',
        officeHours: 'Thursday 1-3pm',
        assignments: [
            { id: 1, title: 'Lab Report 3: Pendulum', dueDate: 'Nov 1 at 11:59pm', points: 100, submitted: true, grade: 90 },
            { id: 2, title: 'Problem Set 5: Rotational Motion', dueDate: 'Nov 12 at 11:59pm', points: 50, submitted: false, grade: null }
        ],
        modules: [
            { id: 1, title: 'Newton\'s Laws', completed: true, items: 5 },
            { id: 2, title: 'Energy and Momentum', completed: true, items: 6 },
            { id: 3, title: 'Rotational Motion', completed: false, items: 7 }
        ],
        announcements: []
    },
    6: {
        id: 6,
        code: 'HUMCORE 1A',
        name: 'Humanities Core Course',
        professor: 'Prof. Williams',
        color: 'from-teal-500 to-teal-600',
        description: 'Interdisciplinary approach to human culture through literature, art, philosophy, and history.',
        term: 'Fall 2025',
        credits: 8,
        location: 'HIB 110',
        time: 'TuTh 3:30-4:50pm',
        officeHours: 'Tuesday 1-3pm, Friday 2-4pm',
        assignments: [
            { id: 1, title: 'Reading Response 4', dueDate: 'Nov 3 at 11:59pm', points: 50, submitted: true, grade: 45 },
            { id: 2, title: 'Essay 2: Ancient Greece', dueDate: 'Nov 10 at 11:59pm', points: 100, submitted: false, grade: null },
            { id: 3, title: 'Group Presentation', dueDate: 'Nov 17 at 11:59pm', points: 100, submitted: false, grade: null },
            { id: 4, title: 'Final Paper', dueDate: 'Dec 12 at 11:59pm', points: 200, submitted: false, grade: null }
        ],
        modules: [
            { id: 1, title: 'Ancient Civilizations', completed: true, items: 10 },
            { id: 2, title: 'Classical Greece', completed: false, items: 12 },
            { id: 3, title: 'Roman Empire', completed: false, items: 11 }
        ],
        announcements: [
            { id: 1, title: 'Guest Lecture This Week', date: '1 day ago', content: 'Dr. Sarah Chen will give a guest lecture on Greek philosophy this Thursday.' }
        ]
    }
};

/**
 * Gets course details by ID
 * @param {number} courseId - Course ID
 * @returns {object|null} Course details or null
 */
export const getCourseById = (courseId) => {
    return courseDetails[courseId] || null;
};

/**
 * Calculates current grade for a course
 * @param {object} course - Course object
 * @returns {number|null} Grade percentage or null
 */
export const calculateCurrentGrade = (course) => {
    if (!course || !course.assignments) return null;

    const gradedAssignments = course.assignments.filter(a => a.grade !== null);
    if (gradedAssignments.length === 0) return null;

    const totalPoints = gradedAssignments.reduce((sum, a) => sum + a.points, 0);
    const earnedPoints = gradedAssignments.reduce((sum, a) => sum + a.grade, 0);

    return Math.round((earnedPoints / totalPoints) * 100);
};

/**
 * Gets pending assignments for a course
 * @param {object} course - Course object
 * @returns {Array} Pending assignments
 */
export const getPendingAssignments = (course) => {
    if (!course || !course.assignments) return [];
    return course.assignments.filter(a => !a.submitted);
};

/**
 * Gets completed modules count
 * @param {object} course - Course object
 * @returns {number} Number of completed modules
 */
export const getCompletedModulesCount = (course) => {
    if (!course || !course.modules) return 0;
    return course.modules.filter(m => m.completed).length;
};