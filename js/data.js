/**
 * Data configuration for EduVerse Dashboard
 * This file contains all the static data used in the application
 */

export const coursesData = [
    {
        id: 1,
        code: 'ICS 31',
        name: 'Introduction to Programming',
        professor: 'Prof. Pattis',
        assignments: 3,
        color: 'from-blue-500 to-blue-600'
    },
    {
        id: 2,
        code: 'MATH 2D',
        name: 'Multivariable Calculus',
        professor: 'Prof. Smith',
        assignments: 2,
        color: 'from-green-500 to-green-600'
    },
    {
        id: 3,
        code: 'WRITING 39B',
        name: 'Critical Reading & Rhetoric',
        professor: 'Prof. Johnson',
        assignments: 1,
        color: 'from-orange-500 to-orange-600'
    },
    {
        id: 4,
        code: 'ICS 6B',
        name: 'Boolean Algebra & Logic',
        professor: 'Prof. Klefstad',
        assignments: 2,
        color: 'from-purple-500 to-purple-600'
    },
    {
        id: 5,
        code: 'PHYSICS 7C',
        name: 'Classical Mechanics',
        professor: 'Prof. Davis',
        assignments: 1,
        color: 'from-red-500 to-red-600'
    },
    {
        id: 6,
        code: 'HUMCORE 1A',
        name: 'Humanities Core Course',
        professor: 'Prof. Williams',
        assignments: 4,
        color: 'from-teal-500 to-teal-600'
    }
];

export const todosData = [
    {
        id: 1,
        courseCode: 'ICS 31',
        title: 'Assignment 3: Lists and Tuples',
        dueDate: 'Nov 5 at 11:59pm',
        priority: 'high'
    },
    {
        id: 2,
        courseCode: 'MATH 2D',
        title: 'Homework 7: Double Integrals',
        dueDate: 'Nov 6 at 11:59pm',
        priority: 'high'
    },
    {
        id: 3,
        courseCode: 'WRITING 39B',
        title: 'Essay Draft 2',
        dueDate: 'Nov 8 at 11:59pm',
        priority: 'medium'
    }
];

export const announcementsData = [
    {
        id: 1,
        title: 'Midterm Exam Schedule',
        courseCode: 'ICS 31',
        timestamp: '2 hours ago',
        read: false
    },
    {
        id: 2,
        title: 'Office Hours Update',
        courseCode: 'MATH 2D',
        timestamp: '5 hours ago',
        read: false
    },
    {
        id: 3,
        title: 'Guest Lecture This Week',
        courseCode: 'HUMCORE 1A',
        timestamp: '1 day ago',
        read: true
    }
];

export const userData = {
    name: 'Peter Anteater',
    initials: 'PA',
    avatar: null,
    semester: 'Fall 2025'
};