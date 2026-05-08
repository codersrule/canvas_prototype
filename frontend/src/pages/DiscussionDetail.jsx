import React, { useState, useEffect, useMemo } from 'react'
import { Link, useRoute } from 'wouter'
import { useAuth } from '../contexts/AuthContext.jsx'
import { api } from '../api/client.js'

const USE_API = true

function DiscussionNotFound({ course }) {
  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md p-12 text-center max-w-2xl mx-auto mt-20">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Discussion not found</h1>
        <div className="flex flex-wrap justify-center gap-3">
          {course && (
            <Link href={`/course/${course.id}/discussions`}>
              <a className="inline-block px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                Back to Discussions
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

function formatTimeAgo(dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now - d
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return dateStr
}

function CommentThread({ comment, depth = 0, onReply }) {
  const [repliesVisible, setRepliesVisible] = useState(true)
  const [showReplyInput, setShowReplyInput] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [localReplies, setLocalReplies] = useState(comment.replies || [])

  const hasReplies = localReplies.length > 0
  const replyCount = localReplies.length

  const handleSubmitReply = (e) => {
    e.preventDefault()
    if (!replyText.trim()) return
    const newReply = {
      id: Date.now(),
      author: 'You',
      authorInitials: 'U',
      text: replyText.trim(),
      postedAt: new Date().toISOString(),
      likes: 0,
      replyCount: 0,
      replies: [],
    }
    setLocalReplies((prev) => [...prev, newReply])
    setReplyText('')
    setShowReplyInput(false)
    onReply?.()
  }

  return (
    <div className={`flex gap-3 ${depth > 0 ? 'mt-4' : 'mt-6 first:mt-0'}`}>
      <div className="shrink-0">
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium text-sm">
          {comment.authorInitials || comment.author?.split(' ').map((n) => n[0]).join('')?.slice(0, 2) || '?'}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
          <span className="text-sm font-semibold text-gray-900">{comment.author}</span>
          <span className="text-xs text-gray-500">{formatTimeAgo(comment.postedAt)}</span>
        </div>
        <p className="text-sm text-gray-800 mt-0.5 whitespace-pre-wrap">{comment.text}</p>
        <div className="flex items-center gap-4 mt-1">
          <button
            type="button"
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm py-1 px-0"
          >
            <span className="sr-only">Like</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            {comment.likes > 0 && <span>{comment.likes}</span>}
          </button>
          <button
            type="button"
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm py-1 px-0"
          >
            <span className="sr-only">Dislike</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setShowReplyInput((v) => !v)}
            className="text-gray-500 hover:text-gray-700 text-sm font-medium py-1 px-0"
          >
            Reply
          </button>
        </div>

        {showReplyInput && (
          <form onSubmit={handleSubmitReply} className="mt-4 flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium text-sm shrink-0">
              {(comment.authorInitials || 'U').charAt(0)}
            </div>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Add a reply..."
                className="flex-1 border-b border-gray-300 py-1 px-0 text-sm focus:outline-none focus:border-gray-600"
                autoFocus
              />
              <button
                type="submit"
                disabled={!replyText.trim()}
                className="text-gray-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reply
              </button>
              <button
                type="button"
                onClick={() => { setShowReplyInput(false); setReplyText('') }}
                className="text-gray-500 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {hasReplies && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setRepliesVisible((v) => !v)}
              className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-700 font-medium mb-2"
            >
              <svg
                className={`w-5 h-5 transition-transform ${repliesVisible ? 'rotate-90' : ''}`}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
              </svg>
              {repliesVisible ? 'Hide' : 'View'} {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
            </button>
            {repliesVisible && (
              <div className="border-l-2 border-gray-200 pl-4 ml-2">
                {localReplies.map((r) => (
                  <CommentThread key={r.id} comment={r} depth={depth + 1} onReply={onReply} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function DiscussionDetailPage() {
  const { user } = useAuth()
  const [, params] = useRoute('/course/:courseId/discussion/:discussionId')
  const courseId = params?.courseId
  const discussionId = params?.discussionId

  const [sortBy, setSortBy] = useState('newest')
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [apiCourse, setApiCourse] = useState(null)
  const [apiDiscussion, setApiDiscussion] = useState(null)
  const [apiError, setApiError] = useState(null)

  useEffect(() => {
    if (!USE_API || !courseId) return
    setApiError(null)
    Promise.all([api.getCourse(courseId), api.getDiscussion(courseId, discussionId)])
      .then(([course, discussion]) => {
        setApiCourse(course)
        setApiDiscussion(discussion)
        setComments(discussion.comments || [])
      })
      .catch((e) => setApiError(e.message))
  }, [USE_API, courseId, discussionId])

  const { course, discussion } = useMemo(() => {
    if (!courseId) return { course: null, discussion: null }
    if (USE_API) {
      if (apiError || !apiCourse) return { course: apiError ? null : undefined, discussion: null }
      return { course: apiCourse, discussion: apiDiscussion }
    }
    return { course: null, discussion: null }
  }, [courseId, USE_API, apiCourse, apiDiscussion, apiError])

  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === 'top') return (b.likes || 0) - (a.likes || 0)
    return new Date(b.postedAt) - new Date(a.postedAt)
  })

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    const comment = await api.addDiscussionComment(courseId, discussionId, {
      text: newComment.trim(),
    })
    setComments((prev) => [comment, ...prev])
    setNewComment('')
  }

  if (USE_API && apiCourse === null && !apiError) {
    return (
      <div className="p-6">
        <div className="flex justify-center py-12 text-gray-500">Loading…</div>
      </div>
    )
  }

  if (USE_API && apiError) return <DiscussionNotFound course={null} />

  if (!course || !discussion) return <DiscussionNotFound course={course} />

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <nav className="mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center flex-wrap gap-x-2 gap-y-1 text-sm text-gray-600">
          <li><Link href="/">Dashboard</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href={`/course/${course.id}`}>{course.code}</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href={`/course/${course.id}/discussions`}>Discussions</Link></li>
          <li aria-hidden="true">/</li>
          <li className="font-medium text-gray-900 truncate max-w-[200px]" title={discussion.title}>{discussion.title}</li>
        </ol>
      </nav>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold text-lg shrink-0">
              {discussion.author.split(' ').map((n) => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{discussion.title}</h1>
              <p className="text-sm text-gray-500 mt-1">{discussion.author} • {discussion.postedAt}</p>
            </div>
          </div>

          <div className="mt-6 prose prose-sm max-w-none text-gray-700">
            <p>
              This is a discussion thread. Use the comments below to ask questions, share ideas, and
              collaborate with your classmates and instructor.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSortBy('newest')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                sortBy === 'newest' ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Newest first
            </button>
            <button
              type="button"
              onClick={() => setSortBy('top')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                sortBy === 'top' ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Top comments
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <form onSubmit={handleAddComment} className="flex gap-3 p-4 border-b border-gray-200">
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium text-sm shrink-0">
              {user?.initials || 'U'}
            </div>
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 border-b border-transparent py-2 px-0 text-sm focus:outline-none focus:border-gray-400 border-b-2"
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="text-gray-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Comment
            </button>
          </form>

          <div className="divide-y divide-gray-100">
            {sortedComments.map((c) => (
              <div key={c.id} className="px-4 py-2">
                <CommentThread comment={c} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
