/**
 * Store for teacher-created announcements and assignments (mock, session-only).
 * Merges with course data when displaying to students.
 */

let nextAnnouncementId = 1000
let nextAssignmentId = 1000

const announcementsByCourse = Object.create(null)
const assignmentsByCourse = Object.create(null)

export function addAnnouncement(courseId, { title, content }) {
  const id = nextAnnouncementId++
  const item = {
    id,
    title,
    content: content || '',
    date: 'Just now',
    postedAt: new Date().toISOString(),
    authorName: 'Prof. Sarah Chen',
    authorInitials: 'SC',
    sections: 1,
  }
  if (!announcementsByCourse[courseId]) announcementsByCourse[courseId] = []
  announcementsByCourse[courseId].push(item)
  return item
}

export function getCreatedAnnouncements(courseId) {
  return announcementsByCourse[courseId] || []
}

export function addAssignment(courseId, { title, description, dueDate, points }) {
  const id = nextAssignmentId++
  const item = {
    id,
    title: title || 'Untitled Assignment',
    description: description || '',
    dueDate: dueDate || 'TBD',
    points: points ? parseInt(points, 10) : 100,
    submitted: false,
    grade: null,
  }
  if (!assignmentsByCourse[courseId]) assignmentsByCourse[courseId] = []
  assignmentsByCourse[courseId].push(item)
  return item
}

export function getCreatedAssignments(courseId) {
  return assignmentsByCourse[courseId] || []
}
