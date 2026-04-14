/**
 * Teacher Data - Student information, analytics, and class management
 */

// Sample student data for courses
export const studentsData = {
    // ICS 31 Students
    1: [
        {
            id: 1,
            name: 'Peter Anteater',
            email: 'panteater@uci.edu',
            avatar: null,
            currentGrade: 91.5,
            assignments: {
                1: 95,
                2: 88,
                3: null,
                4: null
            },
            attendance: 95,
            lastActive: '2 hours ago',
            submissions: 2
        },
        {
            id: 2,
            name: 'Alice Johnson',
            email: 'ajohnson@uci.edu',
            avatar: null,
            currentGrade: 87.3,
            assignments: {
                1: 92,
                2: 85,
                3: 84,
                4: null
            },
            attendance: 88,
            lastActive: '1 day ago',
            submissions: 3
        },
        {
            id: 3,
            name: 'Bob Martinez',
            email: 'bmartinez@uci.edu',
            avatar: null,
            currentGrade: 78.5,
            assignments: {
                1: 75,
                2: 80,
                3: null,
                4: null
            },
            attendance: 92,
            lastActive: '3 hours ago',
            submissions: 2
        },
        {
            id: 4,
            name: 'Carol Wang',
            email: 'cwang@uci.edu',
            avatar: null,
            currentGrade: 94.2,
            assignments: {
                1: 98,
                2: 95,
                3: 89,
                4: null
            },
            attendance: 100,
            lastActive: '30 minutes ago',
            submissions: 3
        },
        {
            id: 5,
            name: 'David Kim',
            email: 'dkim@uci.edu',
            avatar: null,
            currentGrade: 82.7,
            assignments: {
                1: 85,
                2: 78,
                3: 85,
                4: null
            },
            attendance: 85,
            lastActive: '5 hours ago',
            submissions: 3
        }
    ],
    // MATH 2D Students
    2: [
        {
            id: 6,
            name: 'Emma Davis',
            email: 'edavis@uci.edu',
            avatar: null,
            currentGrade: 89.5,
            assignments: {
                1: 88,
                2: 92,
                3: null
            },
            attendance: 90,
            lastActive: '1 hour ago',
            submissions: 2
        },
        {
            id: 7,
            name: 'Frank Lee',
            email: 'flee@uci.edu',
            avatar: null,
            currentGrade: 76.3,
            assignments: {
                1: 72,
                2: 80,
                3: null
            },
            attendance: 78,
            lastActive: '2 days ago',
            submissions: 2
        },
        {
            id: 8,
            name: 'Grace Chen',
            email: 'gchen@uci.edu',
            avatar: null,
            currentGrade: 92.8,
            assignments: {
                1: 95,
                2: 90,
                3: 93
            },
            attendance: 95,
            lastActive: '45 minutes ago',
            submissions: 3
        }
    ]
};

/**
 * Get students for a specific course
 */
export const getStudentsByCourse = (courseId) => {
    return studentsData[courseId] || [];
};

/**
 * Get student by ID
 */
export const getStudentById = (studentId) => {
    for (const courseStudents of Object.values(studentsData)) {
        const student = courseStudents.find(s => s.id === studentId);
        if (student) return student;
    }
    return null;
};

/**
 * Course analytics data
 */
export const courseAnalytics = {
    1: { // ICS 31
        totalStudents: 150,
        activeStudents: 142,
        averageGrade: 85.4,
        assignmentCompletion: 78,
        attendanceRate: 88,
        gradeDistribution: {
            'A': 35,
            'B': 58,
            'C': 42,
            'D': 10,
            'F': 5
        },
        recentActivity: [
            { type: 'submission', student: 'Peter Anteater', assignment: 'Assignment 2', time: '2 hours ago' },
            { type: 'grade', student: 'Alice Johnson', assignment: 'Assignment 3', time: '3 hours ago' },
            { type: 'discussion', student: 'Carol Wang', topic: 'Week 4 Discussion', time: '5 hours ago' }
        ],
        upcomingDeadlines: [
            { assignment: 'Assignment 3', assignmentId: 3, dueDate: 'Nov 5 at 11:59pm', submitted: 45, total: 150 },
            { assignment: 'Assignment 4', assignmentId: 4, dueDate: 'Nov 19 at 11:59pm', submitted: 12, total: 150 }
        ],
        performanceMetrics: {
            averageTimeToComplete: '4.5 hours',
            submissionRate: 92,
            lateSubmissions: 8,
            resubmissions: 15
        }
    },
    2: { // MATH 2D
        totalStudents: 120,
        activeStudents: 115,
        averageGrade: 82.1,
        assignmentCompletion: 85,
        attendanceRate: 90,
        gradeDistribution: {
            'A': 28,
            'B': 52,
            'C': 30,
            'D': 8,
            'F': 2
        },
        recentActivity: [
            { type: 'submission', student: 'Emma Davis', assignment: 'Homework 6', time: '1 hour ago' },
            { type: 'submission', student: 'Grace Chen', assignment: 'Homework 7', time: '4 hours ago' }
        ],
        upcomingDeadlines: [
            { assignment: 'Homework 7', assignmentId: 3, dueDate: 'Nov 6 at 11:59pm', submitted: 38, total: 120 }
        ],
        performanceMetrics: {
            averageTimeToComplete: '5.2 hours',
            submissionRate: 88,
            lateSubmissions: 12,
            resubmissions: 8
        }
    },
    3: {
        totalStudents: 25,
        activeStudents: 24,
        averageGrade: 84,
        assignmentCompletion: 75,
        attendanceRate: 92,
        gradeDistribution: { 'A': 8, 'B': 10, 'C': 5, 'D': 1, 'F': 1 },
        recentActivity: [],
        upcomingDeadlines: [
            { assignment: 'Essay Draft 2', assignmentId: 2, dueDate: 'Nov 8 at 11:59pm', submitted: 5, total: 25 }
        ],
        performanceMetrics: {}
    },
    4: {
        totalStudents: 80,
        activeStudents: 78,
        averageGrade: 79,
        assignmentCompletion: 82,
        attendanceRate: 88,
        gradeDistribution: { 'A': 15, 'B': 30, 'C': 25, 'D': 7, 'F': 3 },
        recentActivity: [],
        upcomingDeadlines: [
            { assignment: 'Problem Set 4: Circuit Design', assignmentId: 2, dueDate: 'Nov 10 at 11:59pm', submitted: 12, total: 80 }
        ],
        performanceMetrics: {}
    },
    5: {
        totalStudents: 95,
        activeStudents: 90,
        averageGrade: 81,
        assignmentCompletion: 80,
        attendanceRate: 85,
        gradeDistribution: { 'A': 20, 'B': 35, 'C': 28, 'D': 8, 'F': 4 },
        recentActivity: [],
        upcomingDeadlines: [
            { assignment: 'Problem Set 5: Rotational Motion', assignmentId: 2, dueDate: 'Nov 12 at 11:59pm', submitted: 8, total: 95 }
        ],
        performanceMetrics: {}
    },
    6: {
        totalStudents: 40,
        activeStudents: 38,
        averageGrade: 83,
        assignmentCompletion: 78,
        attendanceRate: 90,
        gradeDistribution: { 'A': 12, 'B': 15, 'C': 10, 'D': 2, 'F': 1 },
        recentActivity: [],
        upcomingDeadlines: [
            { assignment: 'Reading Response 5', assignmentId: 2, dueDate: 'Nov 15 at 11:59pm', submitted: 3, total: 40 }
        ],
        performanceMetrics: {}
    }
};

const defaultAnalytics = {
    totalStudents: 0,
    activeStudents: 0,
    averageGrade: 0,
    assignmentCompletion: 0,
    attendanceRate: 0,
    gradeDistribution: {},
    recentActivity: [],
    upcomingDeadlines: [],
    performanceMetrics: {},
};

/**
 * Get analytics for a course
 */
export const getCourseAnalytics = (courseId) => {
    const raw = courseAnalytics[courseId];
    if (raw) return raw;
    return { ...defaultAnalytics };
};

/**
 * Pending grading queue
 */
export const pendingGrading = {
    1: [ // ICS 31
        {
            id: 1,
            studentId: 1,
            studentName: 'Peter Anteater',
            assignmentId: 3,
            assignmentName: 'Assignment 3: Lists and Tuples',
            submittedDate: 'Nov 4 at 10:30pm',
            timeAgo: '12 hours ago',
            files: ['assignment3_panteater.py'],
            status: 'pending'
        },
        {
            id: 2,
            studentId: 2,
            studentName: 'Alice Johnson',
            assignmentId: 3,
            assignmentName: 'Assignment 3: Lists and Tuples',
            submittedDate: 'Nov 4 at 11:45pm',
            timeAgo: '11 hours ago',
            files: ['assignment3_alice.py', 'readme.txt'],
            status: 'pending'
        },
        {
            id: 3,
            studentId: 4,
            studentName: 'Carol Wang',
            assignmentId: 3,
            assignmentName: 'Assignment 3: Lists and Tuples',
            submittedDate: 'Nov 5 at 9:15am',
            timeAgo: '2 hours ago',
            files: ['lists_tuples.py'],
            status: 'pending'
        }
    ],
    2: [ // MATH 2D
        {
            id: 4,
            studentId: 6,
            studentName: 'Emma Davis',
            assignmentId: 3,
            assignmentName: 'Homework 7: Double Integrals',
            submittedDate: 'Nov 5 at 8:00am',
            timeAgo: '3 hours ago',
            files: ['homework7.pdf'],
            status: 'pending'
        }
    ]
};

/**
 * Get pending grading for a course
 */
export const getPendingGrading = (courseId) => {
    return pendingGrading[courseId] || [];
};

/**
 * Teacher announcements drafts
 */
export const announcementDrafts = [
    {
        id: 1,
        courseId: 1,
        title: 'Midterm Review Session',
        content: 'I will be holding a midterm review session next week...',
        status: 'draft',
        lastEdited: '1 day ago'
    }
];

/**
 * Get total pending grading count
 */
export const getTotalPendingCount = () => {
    return Object.values(pendingGrading).reduce((sum, items) => sum + items.length, 0);
};

/**
 * Get upcoming deadlines across all courses for dashboard (7 days, up to 20 items)
 */
export const getUpcomingDeadlinesForDashboard = (courses) => {
    const year = new Date().getFullYear() || 2025;
    const all = [];

    courses.forEach((course) => {
        const analytics = getCourseAnalytics(String(course.id));
        const total = analytics.totalStudents || 0;
        const deadlines = analytics.upcomingDeadlines || [];
        deadlines.forEach((d) => {
            all.push({
                ...d,
                course,
                courseId: course.id,
                assignmentId: d.assignmentId,
            });
        });
        if (course.assignments) {
            course.assignments.forEach((a) => {
                const inAnalytics = deadlines.some(
                    (d) => d.assignmentId === a.id || d.assignment === a.title
                );
                if (!inAnalytics) {
                    all.push({
                        assignment: a.title,
                        assignmentId: a.id,
                        dueDate: a.dueDate,
                        submitted: 0,
                        total,
                        course,
                        courseId: course.id,
                    });
                }
            });
        }
    });

    all.sort((a, b) => {
        const da = new Date((a.dueDate || '') + ' ' + year);
        const db = new Date((b.dueDate || '') + ' ' + year);
        return da.getTime() - db.getTime();
    });
    return all.slice(0, 20);
};

/**
 * Calculate class statistics
 */
export const calculateClassStats = (courseId) => {
    const students = getStudentsByCourse(courseId);

    if (students.length === 0) {
        return {
            averageGrade: 0,
            highestGrade: 0,
            lowestGrade: 0,
            medianGrade: 0,
            passingRate: 0
        };
    }

    const grades = students.map(s => s.currentGrade).filter(g => g !== null);
    const sortedGrades = [...grades].sort((a, b) => a - b);

    return {
        averageGrade: (grades.reduce((sum, g) => sum + g, 0) / grades.length).toFixed(1),
        highestGrade: Math.max(...grades),
        lowestGrade: Math.min(...grades),
        medianGrade: sortedGrades[Math.floor(sortedGrades.length / 2)],
        passingRate: ((grades.filter(g => g >= 60).length / grades.length) * 100).toFixed(1)
    };
};