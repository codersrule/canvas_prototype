/**
 * Mock course files. Keyed by course ID.
 */

const FILES_BY_COURSE = {
  1: [
    { id: 1, name: 'Syllabus.pdf', type: 'pdf', size: '245 KB', updatedAt: 'Aug 28, 2025', folder: null },
    { id: 2, name: 'Week 1 Slides - Introduction.pdf', type: 'pdf', size: '1.2 MB', updatedAt: 'Sep 2, 2025', folder: null },
    { id: 3, name: 'Python Cheat Sheet.pdf', type: 'pdf', size: '156 KB', updatedAt: 'Sep 5, 2025', folder: null },
    { id: 4, name: 'Assignment 1 Instructions.pdf', type: 'pdf', size: '89 KB', updatedAt: 'Oct 1, 2025', folder: null },
    { id: 5, name: 'Sample Code - Variables.py', type: 'code', size: '4 KB', updatedAt: 'Sep 10, 2025', folder: 'Resources' },
    { id: 6, name: 'Lab 1 Starter.zip', type: 'zip', size: '32 KB', updatedAt: 'Sep 12, 2025', folder: 'Resources' },
  ],
  2: [
    { id: 1, name: 'MATH 2D Syllabus.pdf', type: 'pdf', size: '312 KB', updatedAt: 'Aug 25, 2025', folder: null },
    { id: 2, name: 'Chapter 14 Notes.pdf', type: 'pdf', size: '2.4 MB', updatedAt: 'Oct 5, 2025', folder: null },
    { id: 3, name: 'Homework 5 Problems.pdf', type: 'pdf', size: '98 KB', updatedAt: 'Oct 15, 2025', folder: null },
    { id: 4, name: 'Formula Sheet.docx', type: 'doc', size: '56 KB', updatedAt: 'Sep 20, 2025', folder: 'Handouts' },
  ],
  3: [
    { id: 1, name: 'Course Syllabus - WRITING 39B.pdf', type: 'pdf', size: '178 KB', updatedAt: 'Aug 30, 2025', folder: null },
    { id: 2, name: 'MLA Formatting Guide.pdf', type: 'pdf', size: '412 KB', updatedAt: 'Sep 1, 2025', folder: null },
    { id: 3, name: 'Essay 1 Prompt.docx', type: 'doc', size: '45 KB', updatedAt: 'Oct 5, 2025', folder: null },
  ],
  4: [
    { id: 1, name: 'ICS 6B Syllabus.pdf', type: 'pdf', size: '201 KB', updatedAt: 'Aug 26, 2025', folder: null },
    { id: 2, name: 'Logic Gates Reference.pdf', type: 'pdf', size: '890 KB', updatedAt: 'Oct 1, 2025', folder: null },
  ],
  5: [
    { id: 1, name: 'PHYSICS 7C Syllabus.pdf', type: 'pdf', size: '267 KB', updatedAt: 'Aug 27, 2025', folder: null },
  ],
  6: [
    { id: 1, name: 'HUMCORE 1A Syllabus.pdf', type: 'pdf', size: '334 KB', updatedAt: 'Aug 29, 2025', folder: null },
    { id: 2, name: 'Reading List - Fall 2025.docx', type: 'doc', size: '72 KB', updatedAt: 'Sep 3, 2025', folder: null },
  ],
}

const FILE_ICONS = {
  pdf: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  doc: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
  docx: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
  zip: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
  code: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
  default: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
}

export function getFilesByCourseId(courseId) {
  const files = FILES_BY_COURSE[courseId] || []
  return files.sort((a, b) => {
    if (a.folder !== b.folder) {
      if (!a.folder) return -1
      if (!b.folder) return 1
      return a.folder.localeCompare(b.folder)
    }
    return a.name.localeCompare(b.name)
  })
}

export function getFileIcon(type) {
  return FILE_ICONS[type] || FILE_ICONS.default
}

export function getFileTypeLabel(type) {
  const labels = { pdf: 'PDF', doc: 'Word', docx: 'Word', zip: 'ZIP', code: 'Code' }
  return labels[type] || (type || 'File').toUpperCase()
}
