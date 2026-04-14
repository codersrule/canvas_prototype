/**
 * Client-side store for assignment submissions.
 * Overrides assignment.submitted and assignment.submission when present,
 * so the UI reflects submissions made in this session without mutating shared course data.
 */

import { getGrade as getStoredGrade } from './gradeStore.js'

const key = (courseId, assignmentId) => `${courseId}-${assignmentId}`

const store = Object.create(null)

export function getSubmission(courseId, assignmentId) {
  return store[key(courseId, assignmentId)] ?? null
}

export function setSubmission(courseId, assignmentId, data) {
  store[key(courseId, assignmentId)] = data
}

/**
 * Returns the effective assignment: base assignment merged with any stored submission.
 * @param {string|number} courseId
 * @param {string|number} assignmentId
 * @param {Object} assignment - assignment from course data
 */
export function getEffectiveAssignment(courseId, assignmentId, assignment) {
  const stored = getSubmission(String(courseId), String(assignmentId))
  if (!stored) return assignment
  return {
    ...assignment,
    submitted: stored.submitted,
    submission: stored.submission ?? assignment.submission,
  }
}

/**
 * Returns the effective assignment with teacher-assigned grade merged in (for student view).
 * @param {string|number} courseId
 * @param {string|number} assignmentId
 * @param {Object} assignment - assignment from course data
 * @param {number} [studentId] - student ID from auth; when present, merges stored grade
 */
export function getEffectiveAssignmentForStudent(courseId, assignmentId, assignment, studentId) {
  let effective = getEffectiveAssignment(courseId, assignmentId, assignment)
  if (studentId) {
    const stored = getStoredGrade(String(courseId), String(assignmentId), studentId)
    if (stored) {
      effective = { ...effective, grade: stored.grade, submitted: true }
    }
  }
  return effective
}
