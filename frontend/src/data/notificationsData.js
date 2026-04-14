/**
 * Mock notifications for the navbar bell dropdown.
 */

export const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: 'grade',
    title: 'Assignment graded',
    message: 'ICS 31: Assignment 1: Variables and Expressions — You received 95/100',
    timeAgo: '2 hours ago',
    read: false,
    link: '/course/1/assignments',
  },
  {
    id: 2,
    type: 'announcement',
    title: 'New announcement',
    message: 'MATH 2D: Office Hours Update',
    timeAgo: '5 hours ago',
    read: false,
    link: '/course/2/announcements',
  },
  {
    id: 3,
    type: 'inbox',
    title: 'New message',
    message: 'Prof. Pattis sent you a message',
    timeAgo: '1 day ago',
    read: false,
    link: '/inbox',
  },
  {
    id: 4,
    type: 'assignment',
    title: 'Assignment due soon',
    message: 'ICS 31: Assignment 3: Lists and Tuples due Nov 5',
    timeAgo: '2 days ago',
    read: true,
    link: '/course/1/assignment/3',
  },
]
