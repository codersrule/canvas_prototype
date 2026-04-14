/**
 * Client-side store for teacher-assigned grades.
 * Persists grades so students can see them on assignment and grades views.
 * Key: (courseId, assignmentId, studentId)
 */

const key = (courseId, assignmentId, studentId) =>
  `${courseId}-${assignmentId}-${studentId}`

const store = Object.create(null)

export function getGrade(courseId, assignmentId, studentId) {
  return store[key(courseId, assignmentId, studentId)] ?? null
}

export function setGrade(courseId, assignmentId, studentId, grade, feedback = '') {
  store[key(courseId, assignmentId, studentId)] = { grade, feedback }
}
