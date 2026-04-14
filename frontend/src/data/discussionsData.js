/**
 * Mock discussion threads per course.
 */

export const DISCUSSIONS_BY_COURSE = {
  1: [
    {
      id: 1,
      title: 'Introduce Yourself',
      author: 'Prof. Pattis',
      postedAt: 'Aug 28, 2025',
      replies: 42,
      unread: false,
    },
    {
      id: 2,
      title: 'Week 4 Discussion - Lists and Tuples',
      author: 'Carol Wang',
      postedAt: 'Oct 22, 2025',
      replies: 18,
      unread: true,
    },
    {
      id: 3,
      title: 'Assignment 3 Tips',
      author: 'Peter Anteater',
      postedAt: 'Nov 2, 2025',
      replies: 8,
      unread: false,
    },
  ],
  2: [
    {
      id: 1,
      title: 'Double Integrals Help',
      author: 'Emma Davis',
      postedAt: 'Oct 30, 2025',
      replies: 15,
      unread: false,
    },
  ],
}

export function getDiscussionsByCourseId(courseId) {
  return DISCUSSIONS_BY_COURSE[courseId] || []
}

export function getDiscussionById(courseId, discussionId) {
  const discussions = getDiscussionsByCourseId(courseId)
  return discussions.find((d) => String(d.id) === String(discussionId)) || null
}
