/**
 * Grades data for EduVerse Dashboard
 * Contains grade information aggregated from courseData
 */

import { courseDetails, calculateCurrentGrade } from './courseData.js';

/**
 * Builds comprehensive grades data from all courses
 * @returns {Array} Array of grade entries
 */
export const buildGradesData = () => {
    const grades = [];

    Object.values(courseDetails).forEach(course => {
        if (course.assignments) {
            course.assignments.forEach(assignment => {
                grades.push({
                    id: `${course.id}-${assignment.id}`,
                    courseId: course.id,
                    assignmentId: assignment.id,
                    courseName: course.name,
                    courseCode: course.code,
                    courseColor: course.color,
                    assignmentTitle: assignment.title,
                    dueDate: assignment.dueDate,
                    points: assignment.points,
                    submitted: assignment.submitted,
                    grade: assignment.grade,
                    percentage: assignment.grade !== null ? Math.round((assignment.grade / assignment.points) * 100) : null,
                    status: getAssignmentStatus(assignment)
                });
            });
        }
    });

    return grades;
};

/**
 * Gets status of an assignment
 * @param {object} assignment - Assignment object
 * @returns {string} Status (graded, pending, missing)
 */
const getAssignmentStatus = (assignment) => {
    if (assignment.grade !== null) {
        return 'graded';
    } else if (assignment.submitted) {
        return 'pending';
    } else {
        return 'missing';
    }
};

/**
 * Calculates overall GPA from all courses
 * @returns {number} GPA on 4.0 scale
 */
export const calculateOverallGPA = () => {
    const courses = Object.values(courseDetails);
    const grades = courses.map(course => calculateCurrentGrade(course)).filter(g => g !== null);

    if (grades.length === 0) return 0;

    const avgPercentage = grades.reduce((sum, g) => sum + g, 0) / grades.length;
    return ((avgPercentage / 100) * 4).toFixed(2);
};

/**
 * Calculates average score across all graded assignments
 * @returns {number} Average percentage
 */
export const calculateAverageScore = () => {
    const allGrades = buildGradesData()
        .filter(g => g.grade !== null)
        .map(g => g.percentage);

    if (allGrades.length === 0) return 0;

    return (allGrades.reduce((sum, g) => sum + g, 0) / allGrades.length).toFixed(1);
};

/**
 * Gets count of graded vs total assignments
 * @returns {object} Object with graded and total counts
 */
export const getGradedCount = () => {
    const allGrades = buildGradesData();
    const graded = allGrades.filter(g => g.grade !== null).length;
    const total = allGrades.length;

    return { graded, total };
};

/**
 * Gets grades grouped by course
 * @returns {object} Grades grouped by course ID
 */
export const getGradesByCourse = () => {
    const grades = buildGradesData();
    const grouped = {};

    grades.forEach(grade => {
        if (!grouped[grade.courseId]) {
            grouped[grade.courseId] = [];
        }
        grouped[grade.courseId].push(grade);
    });

    return grouped;
};

/**
 * Filters grades by status
 * @param {string} status - Status to filter by
 * @returns {Array} Filtered grades
 */
export const filterByStatus = (status) => {
    if (status === 'all') return buildGradesData();
    return buildGradesData().filter(g => g.status === status);
};

/**
 * Filters grades by course
 * @param {number} courseId - Course ID to filter by
 * @returns {Array} Filtered grades
 */
export const filterByCourse = (courseId) => {
    if (courseId === 'all') return buildGradesData();
    return buildGradesData().filter(g => g.courseId === parseInt(courseId));
};

/**
 * Searches grades by assignment title
 * @param {string} query - Search query
 * @returns {Array} Filtered grades
 */
export const searchGrades = (query) => {
    if (!query) return buildGradesData();

    const lowerQuery = query.toLowerCase();
    return buildGradesData().filter(g =>
        g.assignmentTitle.toLowerCase().includes(lowerQuery) ||
        g.courseName.toLowerCase().includes(lowerQuery) ||
        g.courseCode.toLowerCase().includes(lowerQuery)
    );
};

/**
 * Sorts grades by a given field
 * @param {Array} grades - Grades array
 * @param {string} field - Field to sort by
 * @param {boolean} ascending - Sort direction
 * @returns {Array} Sorted grades
 */
export const sortGrades = (grades, field, ascending = true) => {
    const sorted = [...grades].sort((a, b) => {
        let aVal, bVal;

        switch (field) {
            case 'assignment':
                aVal = a.assignmentTitle.toLowerCase();
                bVal = b.assignmentTitle.toLowerCase();
                break;
            case 'course':
                aVal = a.courseName.toLowerCase();
                bVal = b.courseName.toLowerCase();
                break;
            case 'dueDate':
                aVal = new Date(a.dueDate + ' 2025');
                bVal = new Date(b.dueDate + ' 2025');
                break;
            case 'status':
                aVal = a.status;
                bVal = b.status;
                break;
            case 'grade':
                aVal = a.percentage !== null ? a.percentage : -1;
                bVal = b.percentage !== null ? b.percentage : -1;
                break;
            default:
                return 0;
        }

        if (aVal < bVal) return ascending ? -1 : 1;
        if (aVal > bVal) return ascending ? 1 : -1;
        return 0;
    });

    return sorted;
};