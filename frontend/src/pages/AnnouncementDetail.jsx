import React, { useState, useEffect, useMemo } from 'react'
import { Link, useRoute } from 'wouter'
import { getCourseById } from '../data/courseDetails.js'
import { normalizeAnnouncement, getContentSegments } from '../data/announcements.js'
import { getCreatedAnnouncements } from '../data/createdContentStore.js'
import { api } from '../api/client.js'

const USE_API = !!import.meta.env.VITE_API_URL

function AnnouncementNotFound({ course }) {
  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md p-12 text-center max-w-2xl mx-auto mt-20">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Announcement not found</h1>
        <div className="flex flex-wrap justify-center gap-3">
          {course && (
            <Link href={`/course/${course.id}/announcements`}>
              <a className="inline-block px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                Back to Announcements
              </a>
            </Link>
          )}
          <Link href="/">
            <a className="inline-block px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
              Back to Dashboard
            </a>
          </Link>
        </div>
      </div>
    </div>
  )
}

function ReplyForm({ onCancel, onSubmit }) {
  const [text, setText] = useState('')
  const [wordCount, setWordCount] = useState(0)

  useEffect(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    setWordCount(words)
  }, [text])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    onSubmit({ text: text.trim() })
    setText('')
  }

  return (
    <div className="mt-10 pt-8 border-t border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a reply</h3>
      <form onSubmit={handleSubmit}>
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
          <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50">
            <button type="button" className="p-2 rounded hover:bg-gray-200" title="Bold" aria-label="Bold">
              <span className="font-bold text-sm">B</span>
            </button>
            <button type="button" className="p-2 rounded hover:bg-gray-200 italic" title="Italic" aria-label="Italic">
              <span className="text-sm">I</span>
            </button>
            <button type="button" className="p-2 rounded hover:bg-gray-200" title="Underline" aria-label="Underline">
              <span className="text-sm underline">U</span>
            </button>
            <span className="self-center text-xs text-gray-500 ml-2">{wordCount} words</span>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            className="w-full p-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0 resize-y min-h-[160px]"
            placeholder="Type your reply here..."
          />
        </div>
        <div className="flex items-center gap-4 mt-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            Attach
          </button>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!text.trim()}
            className="px-5 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            Reply
          </button>
        </div>
      </form>
    </div>
  )
}

export function AnnouncementDetailPage() {
  const [, params] = useRoute('/course/:courseId/announcement/:announcementId')
  const courseId = params?.courseId
  const announcementId = params?.announcementId

  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replies, setReplies] = useState([])
  const [toast, setToast] = useState(null)
  const [apiCourse, setApiCourse] = useState(null)
  const [apiError, setApiError] = useState(null)

  useEffect(() => {
    if (!USE_API || !courseId) return
    setApiError(null)
    api
      .getCourse(courseId)
      .then(setApiCourse)
      .catch((e) => setApiError(e.message))
  }, [USE_API, courseId])

  const { course, announcement } = useMemo(() => {
    if (!courseId) return { course: null, announcement: null }
    if (USE_API) {
      if (apiError || !apiCourse) return { course: apiError ? null : undefined, announcement: null }
      const baseAnnouncements = apiCourse.announcements || []
      const created = getCreatedAnnouncements(apiCourse.id)
      const all = [...baseAnnouncements, ...created]
      const a = all.find((x) => String(x.id) === String(announcementId))
      return { course: apiCourse, announcement: a }
    }
    const c = getCourseById(parseInt(courseId, 10))
    const base = c?.announcements || []
    const created = getCreatedAnnouncements(c?.id || 0)
    const all = [...base, ...created]
    const a = all.find((x) => String(x.id) === String(announcementId))
    return { course: c, announcement: a }
  }, [courseId, announcementId, USE_API, apiCourse, apiError])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])

  if (USE_API && apiCourse === null && !apiError) {
    return (
      <div className="p-6">
        <div className="flex justify-center py-12 text-gray-500">Loading…</div>
      </div>
    )
  }

  if (USE_API && apiError) return <AnnouncementNotFound course={null} />

  if (!course || !announcement) return <AnnouncementNotFound course={course} />

  const norm = normalizeAnnouncement(course, announcement)
  const segments = getContentSegments(announcement.content || '')

  useEffect(() => {
    if (window.location.hash === '#reply') setShowReplyForm(true)
  }, [])

  const handleReplySubmit = (payload) => {
    setReplies((prev) => [...prev, { id: Date.now(), ...payload, at: new Date().toISOString() }])
    setShowReplyForm(false)
    setToast('Reply sent.')
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <nav className="mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center flex-wrap gap-x-2 gap-y-1 text-sm text-gray-600">
          <li><Link href="/">Dashboard</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href={`/course/${course.id}`}>{course.code}</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href={`/course/${course.id}/announcements`}>Announcements</Link></li>
          <li aria-hidden="true">/</li>
          <li className="font-medium text-gray-900 truncate max-w-[200px]" title={announcement.title}>{announcement.title}</li>
        </ol>
      </nav>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 sm:p-8">
          {/* Top: author + meta + actions */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold text-lg shrink-0">
                {norm.authorInitials}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{norm.authorName}</p>
                <p className="text-sm text-gray-500">{norm.authorRole}</p>
                <p className="text-sm text-gray-500 mt-0.5">Posted {norm.postedAtFormatted}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                aria-label="Bookmark"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                aria-label="More options"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-6 mb-4">
            {announcement.title}
          </h1>

          {/* Body with optional bold segments */}
          <div className="prose prose-gray max-w-none text-gray-700 whitespace-pre-line">
            {segments.map((seg, i) =>
              seg.type === 'bold' ? (
                <strong key={i}>{seg.value}</strong>
              ) : (
                <span key={i}>{seg.value}</span>
              )
            )}
          </div>

          {/* Signature */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-gray-700">
              – {norm.signatureLine}
              {norm.authorEmail && (
                <>
                  <br />
                  <a href={`mailto:${norm.authorEmail}`} className="text-gray-700 hover:underline">
                    {norm.authorEmail}
                  </a>
                </>
              )}
            </p>
          </div>

          {/* Reply button (centered) */}
          {!showReplyForm && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setShowReplyForm(true)}
                className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
              >
                Reply
              </button>
            </div>
          )}

          {/* Reply form */}
          {showReplyForm && (
            <ReplyForm
              onCancel={() => setShowReplyForm(false)}
              onSubmit={handleReplySubmit}
            />
          )}

        </div>
      </div>

      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-gray-900 text-white rounded-lg shadow-lg text-sm font-medium z-50"
          role="status"
        >
          {toast}
        </div>
      )}
    </div>
  )
}
