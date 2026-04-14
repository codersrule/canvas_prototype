/**
 * Helpers for announcement display. Normalizes announcements that may have
 * extended fields (authorName, postedAt, sections) or only legacy (date, content).
 */

const SNIPPET_LENGTH = 120

function getInitials(name) {
  if (!name || typeof name !== 'string') return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function formatPostedAt(announcement) {
  if (announcement.postedAt) {
    const d = new Date(announcement.postedAt)
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }
  return announcement.date || '—'
}

function stripBold(text) {
  if (!text || typeof text !== 'string') return ''
  return text.replace(/\*\*([^*]+)\*\*/g, '$1')
}

/**
 * @param {Object} course - course object with professor
 * @param {Object} announcement - raw announcement
 * @returns normalized announcement with authorName, authorInitials, authorRole, authorEmail, authorTitle, sections, postedAtFormatted, contentSnippet
 */
export function normalizeAnnouncement(course, announcement) {
  const authorName = announcement.authorName ?? course?.professor ?? 'Instructor'
  const authorInitials = announcement.authorInitials ?? getInitials(authorName)
  const sections = announcement.sections ?? 1
  const postedAtFormatted = formatPostedAt(announcement)
  const rawContent = announcement.content || ''
  const plainContent = stripBold(rawContent)
  const contentSnippet =
    plainContent.length <= SNIPPET_LENGTH
      ? plainContent
      : plainContent.slice(0, SNIPPET_LENGTH).trim() + '...'

  return {
    ...announcement,
    authorName,
    authorInitials,
    authorRole: announcement.authorRole ?? 'AUTHOR | TEACHER',
    authorEmail: announcement.authorEmail ?? '',
    authorTitle: announcement.authorTitle ?? '',
    signatureLine: announcement.signatureLine ?? authorName,
    sections,
    postedAtFormatted,
    contentSnippet,
    plainContent
  }
}

/**
 * Parse content that may contain **bold** markers into segments for rendering.
 */
export function getContentSegments(content) {
  if (!content || typeof content !== 'string') return [{ type: 'text', value: content || '' }]
  const segments = []
  let lastIndex = 0
  const re = /\*\*([^*]+)\*\*/g
  let m
  while ((m = re.exec(content)) !== null) {
    if (m.index > lastIndex) {
      segments.push({ type: 'text', value: content.slice(lastIndex, m.index) })
    }
    segments.push({ type: 'bold', value: m[1] })
    lastIndex = m.index + m[0].length
  }
  if (lastIndex < content.length) {
    segments.push({ type: 'text', value: content.slice(lastIndex) })
  }
  return segments.length ? segments : [{ type: 'text', value: content }]
}
