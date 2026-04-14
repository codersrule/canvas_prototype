import React, { useMemo, useState, useEffect } from 'react'
import { Link, useRoute } from 'wouter'
import { api } from '../api/client.js'

const USE_API = !!import.meta.env.VITE_API_URL
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { getCourseById } from '../data/courseDetails.js'
import {
  getCourseAnalytics,
  getStudentsByCourse,
  getPendingGrading,
  calculateClassStats,
} from '../data/teacherData.js'
import { getFilesByCourseId, getFileTypeLabel } from '../data/filesData.js'
import { getCreatedAssignments } from '../data/createdContentStore.js'
import { setGrade } from '../data/gradeStore.js'
import { getFilePreviewContent, isPdf } from '../data/submissionPreviewData.js'
import { CreateAnnouncementModal } from '../components/CreateAnnouncementModal.jsx'
import { CreateAssignmentModal } from '../components/CreateAssignmentModal.jsx'

const TEACHER_TABS = ['overview', 'students', 'grading', 'analytics', 'content']

function TeacherCourseTabs({ courseId, activeTab }) {
  return (
    <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
      <nav className="flex border-b overflow-x-auto">
        {TEACHER_TABS.map((tab) => {
          const isActive = tab === activeTab
          const label = tab.charAt(0).toUpperCase() + tab.slice(1)
          return (
            <Link key={tab} href={`/teacher/course/${courseId}/${tab}`}>
              <a
                className={`${isActive ? 'border-gray-700 text-gray-700' : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'} px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap`}
              >
                {label}
              </a>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

function OverviewTab({ analytics, pending, onGradeClick, onCreateAnnouncement, onCreateAssignment }) {
  const gradeDist = analytics?.gradeDistribution || {}
  const total = Object.values(gradeDist).reduce((s, c) => s + c, 0)
  const colors = {
    A: 'bg-green-500',
    B: 'bg-gray-600',
    C: 'bg-yellow-500',
    D: 'bg-orange-500',
    F: 'bg-red-500',
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-md p-5">
            <p className="text-sm text-gray-600">Average Grade</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {analytics?.averageGrade || 0}%
            </p>
            <p className="text-xs text-green-600 mt-1">↑ 2.3% from last week</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-5">
            <p className="text-sm text-gray-600">Completion Rate</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {analytics?.assignmentCompletion || 0}%
            </p>
            <p className="text-xs text-gray-600 mt-1">Assignment submissions</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-5">
            <p className="text-sm text-gray-600">Attendance</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {analytics?.attendanceRate || 0}%
            </p>
            <p className="text-xs text-gray-600 mt-1">Class participation</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Grade Distribution</h3>
          <div className="space-y-3">
            {Object.entries(gradeDist).map(([grade, count]) => {
              const pct = total > 0 ? ((count / total) * 100).toFixed(0) : 0
              return (
                <div key={grade}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">Grade {grade}</span>
                    <span className="text-gray-600">
                      {count} students ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${colors[grade] || 'bg-gray-500'} h-2 rounded-full`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Pending Grading</h3>
          {pending?.length ? (
            <div className="space-y-3">
              {pending.slice(0, 5).map((item) => (
                <div key={item.id} className="pb-3 border-b border-gray-100 last:border-0">
                  <p className="text-sm font-medium text-gray-900">{item.studentName}</p>
                  <p className="text-xs text-gray-600 mt-1">{item.assignmentName}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">{item.timeAgo}</span>
                    <button
                      onClick={() => onGradeClick(item)}
                      className="text-xs text-gray-700 hover:text-gray-800 font-medium"
                    >
                      Grade Now
                    </button>
                  </div>
                </div>
              ))}
              <p className="text-center text-sm text-gray-600 mt-4">
                {pending.length} total submissions
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">All caught up! ✓</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Quick Actions</h3>
          <div className="space-y-2">
            <button
              onClick={onCreateAnnouncement}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              Create Announcement
            </button>
            <button
              onClick={onCreateAssignment}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Add Assignment
            </button>
            <Link href="/teacher/inbox">
              <a className="block w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm text-center">
                Message Students
              </a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function StudentsTab({ courseId }) {
  const [search, setSearch] = useState('')
  const allStudents = getStudentsByCourse(String(courseId))
  const students = useMemo(() => {
    if (!search.trim()) return allStudents
    const q = search.toLowerCase().trim()
    return allStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.email && s.email.toLowerCase().includes(q))
    )
  }, [allStudents, search])
  const stats = calculateClassStats(String(courseId))

  const handleExport = () => {
    const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const headers = ['Name', 'Email', 'Current Grade', 'Attendance', 'Submissions', 'Last Active']
    const rows = students.map((s) =>
      [escape(s.name), escape(s.email), s.currentGrade, s.attendance, s.submissions, escape(s.lastActive)].join(',')
    )
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `students-${courseId}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-5">
          <p className="text-sm text-gray-600">Average Grade</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.averageGrade}%</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-5">
          <p className="text-sm text-gray-600">Highest Grade</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.highestGrade}%</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-5">
          <p className="text-sm text-gray-600">Lowest Grade</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.lowestGrade}%</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-5">
          <p className="text-sm text-gray-600">Passing Rate</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.passingRate}%</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center flex-wrap gap-2">
          <h3 className="text-lg font-semibold text-gray-700">Student Roster</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-900"
            />
            <button
              type="button"
              onClick={handleExport}
              className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Export
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attendance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((s) => {
                const gradeColor =
                  s.currentGrade >= 90
                    ? 'text-green-600'
                    : s.currentGrade >= 80
                    ? 'text-blue-600'
                    : s.currentGrade >= 70
                    ? 'text-yellow-600'
                    : 'text-red-600'
                return (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold">
                          {s.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{s.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {s.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-semibold ${gradeColor}`}>
                        {s.currentGrade}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {s.attendance}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {s.submissions}/12
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {s.lastActive}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link href="/teacher/inbox">
                        <a className="text-gray-700 hover:text-gray-800 font-medium">
                          View Details
                        </a>
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function GradingTab({ pending, onGradeClick }) {
  const [sortBy, setSortBy] = useState('date')
  const [assignmentFilter, setAssignmentFilter] = useState('all')

  const assignments = useMemo(() => {
    const ids = new Set()
    pending?.forEach((p) => ids.add(p.assignmentName))
    return [...ids].sort()
  }, [pending])

  const filteredAndSorted = useMemo(() => {
    let list = pending || []
    if (assignmentFilter !== 'all') {
      list = list.filter((p) => p.assignmentName === assignmentFilter)
    }
    if (sortBy === 'assignment') {
      list = [...list].sort((a, b) =>
        (a.assignmentName || '').localeCompare(b.assignmentName || '')
      )
    } else {
      list = [...list].sort((a, b) => {
        const aHour = (a.timeAgo || '').match(/(\d+)\s*hours?/)?.[1] ?? 999
        const bHour = (b.timeAgo || '').match(/(\d+)\s*hours?/)?.[1] ?? 999
        return Number(aHour) - Number(bHour)
      })
    }
    return list
  }, [pending, assignmentFilter, sortBy])

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-4 flex justify-between items-center flex-wrap gap-2">
        <h3 className="text-lg font-semibold text-gray-700">
          Grading Queue ({filteredAndSorted.length} items)
        </h3>
        <div className="flex gap-2">
          <select
            value={assignmentFilter}
            onChange={(e) => setAssignmentFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-900"
          >
            <option value="all">All Assignments</option>
            {assignments.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-900"
          >
            <option value="date">Sort by: Date</option>
            <option value="assignment">Sort by: Assignment</option>
          </select>
        </div>
      </div>

      {filteredAndSorted.length > 0 ? (
        <div className="space-y-4">
          {filteredAndSorted.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {item.studentName.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{item.studentName}</h4>
                    <p className="text-sm text-gray-600 mt-1">{item.assignmentName}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">{item.timeAgo}</span>
                      <span className="flex items-center gap-1">
                        {item.files?.length || 0} file(s)
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onGradeClick(item)}
                  className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  Grade Now
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">All Caught Up!</h3>
          <p className="text-gray-600">No submissions pending grading</p>
        </div>
      )}
    </div>
  )
}

function GradingModal({ item, course, onClose, onSave }) {
  const allAssignments = [...(course?.assignments || []), ...getCreatedAssignments(course?.id || 0)]
  const assignment = allAssignments.find((a) => a.id === item.assignmentId)
  const maxPoints = assignment?.points ?? 100

  const [gradeValue, setGradeValue] = useState('')
  const [feedback, setFeedback] = useState('')
  const [toast, setToast] = useState(false)
  const [viewingFileIndex, setViewingFileIndex] = useState(null)
  const [previewFullscreen, setPreviewFullscreen] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const gradeNum = parseFloat(gradeValue, 10)
    if (Number.isNaN(gradeNum) || gradeNum < 0 || gradeNum > maxPoints) return
    onSave(item, gradeNum, feedback.trim())
    setToast(true)
    setTimeout(() => {
      setToast(false)
      onClose()
    }, 800)
  }

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  useEffect(() => {
    const onEscape = (e) => {
      if (e.key === 'Escape') {
        if (previewFullscreen) setPreviewFullscreen(false)
        else onClose()
      }
    }
    window.addEventListener('keydown', onEscape)
    return () => window.removeEventListener('keydown', onEscape)
  }, [onClose, previewFullscreen])

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="grading-modal-title"
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 id="grading-modal-title" className="text-lg font-semibold text-gray-900">
            Grade Submission
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto flex-1">
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-900">{item.studentName}</p>
              <p className="text-sm text-gray-600 mt-0.5">{item.assignmentName}</p>
              <p className="text-xs text-gray-500 mt-1">{item.submittedDate}</p>
            </div>

            {item.files?.length ? (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-600 mb-2">Submitted files</p>
                <ul className="text-sm text-gray-800 space-y-2">
                  {item.files.map((f, i) => (
                    <li key={i} className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-lg">
                      <span className="min-w-0 truncate flex-1">{f}</span>
                      <button
                        type="button"
                        onClick={() => {
                        setViewingFileIndex(viewingFileIndex === i ? null : i)
                        if (viewingFileIndex === i) setPreviewFullscreen(false)
                      }}
                        className="shrink-0 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded transition-colors"
                      >
                        {viewingFileIndex === i ? 'Hide' : 'View'}
                      </button>
                    </li>
                  ))}
                </ul>
                {viewingFileIndex !== null && item.files[viewingFileIndex] && (
                  <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
                    <div className="px-3 py-2 bg-gray-100 border-b border-gray-200 flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-gray-700 truncate">
                        {item.files[viewingFileIndex]}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setPreviewFullscreen(true)}
                          className="p-1.5 text-gray-500 hover:text-gray-700 rounded transition-colors"
                          title="Fullscreen"
                          aria-label="Fullscreen"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                        setViewingFileIndex(null)
                        setPreviewFullscreen(false)
                      }}
                          className="p-1.5 text-gray-500 hover:text-gray-700 rounded transition-colors"
                          aria-label="Close preview"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-900 overflow-x-auto max-h-48 overflow-y-auto">
                      {isPdf(item.files[viewingFileIndex]) ? (
                        <p className="text-sm text-gray-300">
                          PDF document. In production, a document viewer would display the file here.
                          Use Download to save and open externally.
                        </p>
                      ) : (
                        <pre className="text-xs text-gray-300 font-mono whitespace-pre">
                          {getFilePreviewContent(item.files[viewingFileIndex]) || '(No preview available)'}
                        </pre>
                      )}
                    </div>
                  </div>
                )}

                {previewFullscreen && viewingFileIndex !== null && item.files[viewingFileIndex] && (
                  <div
                    className="fixed inset-0 z-[60] bg-gray-900 flex flex-col"
                    role="dialog"
                    aria-label="File preview (fullscreen)"
                  >
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700 shrink-0">
                      <span className="text-sm font-medium text-gray-200 truncate">
                        {item.files[viewingFileIndex]}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPreviewFullscreen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-200 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Exit fullscreen
                      </button>
                    </div>
                    <div className="flex-1 overflow-auto p-6">
                      {isPdf(item.files[viewingFileIndex]) ? (
                        <p className="text-base text-gray-300 max-w-2xl">
                          PDF document. In production, a document viewer would display the file here.
                          Use Download to save and open externally.
                        </p>
                      ) : (
                        <pre className="text-sm text-gray-300 font-mono whitespace-pre max-w-4xl">
                          {getFilePreviewContent(item.files[viewingFileIndex]) || '(No preview available)'}
                        </pre>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            <div className="mb-4">
              <label htmlFor="grade-input" className="block text-sm font-medium text-gray-700 mb-1">
                Grade (out of {maxPoints})
              </label>
              <input
                id="grade-input"
                type="number"
                min={0}
                max={maxPoints}
                step={0.5}
                value={gradeValue}
                onChange={(e) => setGradeValue(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                placeholder={`0–${maxPoints}`}
                required
              />
            </div>

            <div>
              <label htmlFor="feedback-input" className="block text-sm font-medium text-gray-700 mb-1">
                Feedback (optional)
              </label>
              <textarea
                id="feedback-input"
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-y"
                placeholder="Add comments for the student..."
              />
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!gradeValue || parseFloat(gradeValue, 10) < 0 || parseFloat(gradeValue, 10) > maxPoints}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Save Grade
            </button>
          </div>
        </form>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-gray-900 text-white rounded-lg shadow-lg text-sm font-medium z-[60]">
          Grade saved
        </div>
      )}
    </div>
  )
}

function PlaceholderTab({ title }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      <p className="text-sm text-gray-500 mt-2">Coming soon.</p>
    </div>
  )
}

const GRADE_COLORS = {
  A: '#22c55e',
  B: '#3b82f6',
  C: '#eab308',
  D: '#f97316',
  F: '#ef4444',
}

function AnalyticsTab({ course, analytics }) {
  const gradeDist = analytics?.gradeDistribution || {}
  const barData = Object.entries(gradeDist).map(([grade, count]) => ({
    name: `Grade ${grade}`,
    grade,
    count,
  }))

  const pieData = [
    { name: 'Submitted', value: analytics?.assignmentCompletion || 0, color: '#22c55e' },
    { name: 'Pending', value: 100 - (analytics?.assignmentCompletion || 0), color: '#94a3b8' },
  ].filter((d) => d.value > 0)

  const upcomingDeadlines = analytics?.upcomingDeadlines || []
  const perf = analytics?.performanceMetrics || {}

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-5">
          <p className="text-sm text-gray-600">Average Grade</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{analytics?.averageGrade || 0}%</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-5">
          <p className="text-sm text-gray-600">Completion Rate</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{analytics?.assignmentCompletion || 0}%</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-5">
          <p className="text-sm text-gray-600">Attendance</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{analytics?.attendanceRate || 0}%</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-5">
          <p className="text-sm text-gray-600">Active Students</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {analytics?.activeStudents || 0}
            <span className="text-sm font-normal text-gray-500">/ {analytics?.totalStudents || 0}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Grade Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={GRADE_COLORS[entry.grade] || '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Assignment Completion</h3>
          <div className="h-64">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `${v}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">No data</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Upcoming Deadlines</h3>
          {upcomingDeadlines.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={upcomingDeadlines.map((d) => ({
                    name: d.assignment?.slice(0, 20) + (d.assignment?.length > 20 ? '…' : ''),
                    submitted: d.submitted,
                    total: d.total,
                    pct: d.total > 0 ? Math.round((d.submitted / d.total) * 100) : 0,
                  }))}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value, name) =>
                      name === 'pct' ? [`${value}%`, 'Submitted'] : [value, name]
                    }
                  />
                  <Bar dataKey="pct" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="pct" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No upcoming deadlines</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Performance Metrics</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Avg. time to complete</span>
              <span className="font-medium text-gray-900">{perf.averageTimeToComplete || '—'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Submission rate</span>
              <span className="font-medium text-gray-900">{perf.submissionRate || '—'}%</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Late submissions</span>
              <span className="font-medium text-gray-900">{perf.lateSubmissions || '—'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Resubmissions</span>
              <span className="font-medium text-gray-900">{perf.resubmissions || '—'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ContentTab({ course }) {
  const files = getFilesByCourseId(course.id)

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Course Files</h3>
          <p className="text-sm text-gray-500 mt-1">
            {files.length} file{files.length !== 1 ? 's' : ''} in this course
          </p>
        </div>
        <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium">
          Upload
        </button>
      </div>

      {files.length ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modified</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {files.map((file) => (
                <tr key={file.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-900">{file.name}</span>
                      {file.folder && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{file.folder}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{getFileTypeLabel(file.type)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{file.size}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{file.updatedAt}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-gray-700 hover:text-gray-800 text-sm font-medium mr-3">Download</button>
                    <button className="text-gray-500 hover:text-gray-700 text-sm">⋮</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No files yet</h3>
          <p className="text-gray-600 mb-4">Upload course materials for your students.</p>
          <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium">
            Upload Files
          </button>
        </div>
      )}
    </div>
  )
}

export function TeacherCoursePage() {
  const [matchBase, paramsBase] = useRoute('/teacher/course/:id')
  const [matchTab, paramsTab] = useRoute('/teacher/course/:id/:tab')
  const [gradingItem, setGradingItem] = useState(null)
  const [gradedIds, setGradedIds] = useState(() => new Set())
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false)
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false)
  const [apiCourse, setApiCourse] = useState(null)
  const [apiError, setApiError] = useState(null)

  const courseIdStr = (matchTab ? paramsTab.id : paramsBase?.id) ?? null
  const courseId = useMemo(() => {
    if (!courseIdStr) return null
    if (USE_API) return courseIdStr
    const num = Number(courseIdStr)
    return Number.isNaN(num) ? null : num
  }, [courseIdStr])

  useEffect(() => {
    if (!USE_API || !courseIdStr) return
    setApiError(null)
    api
      .getCourse(courseIdStr)
      .then(setApiCourse)
      .catch((e) => setApiError(e.message))
  }, [USE_API, courseIdStr])

  const course = useMemo(() => {
    if (courseId == null) return null
    if (USE_API) {
      if (apiError || !apiCourse) return null
      return apiCourse
    }
    return getCourseById(courseId)
  }, [courseId, USE_API, apiCourse, apiError])

  const activeTab = matchTab ? paramsTab.tab : 'overview'
  const analytics = course ? getCourseAnalytics(String(course.id)) : null
  const rawPending = course ? getPendingGrading(String(course.id)) : []
  const pending = rawPending.filter((p) => !gradedIds.has(p.id))

  const handleGradeClick = (item) => setGradingItem(item)
  const handleGradingClose = () => setGradingItem(null)
  const handleGradingSave = (item, grade, feedback) => {
    setGrade(course.id, item.assignmentId, item.studentId, grade, feedback)
    setGradedIds((prev) => new Set(prev).add(item.id))
  }

  if (USE_API && apiCourse === null && !apiError) {
    return (
      <div className="p-6">
        <div className="flex justify-center py-12 text-gray-500">Loading…</div>
      </div>
    )
  }

  if (USE_API && apiError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-700 rounded-lg p-4 mb-6">{apiError}</div>
        <Link href="/teacher">
          <a className="text-gray-700 hover:underline">Back to Dashboard</a>
        </Link>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-4">Course not found</h1>
          <Link href="/teacher">
            <a className="text-gray-700 hover:underline">Back to Dashboard</a>
          </Link>
        </div>
      </div>
    )
  }

  let content = null
  if (activeTab === 'overview') content = (
      <OverviewTab
        analytics={analytics}
        pending={pending}
        onGradeClick={handleGradeClick}
        onCreateAnnouncement={() => setAnnouncementModalOpen(true)}
        onCreateAssignment={() => setAssignmentModalOpen(true)}
      />
    )
  else if (activeTab === 'students') content = <StudentsTab courseId={course.id} />
  else if (activeTab === 'grading') content = <GradingTab pending={pending} onGradeClick={handleGradeClick} />
  else if (activeTab === 'analytics') content = <AnalyticsTab course={course} analytics={analytics} />
  else if (activeTab === 'content') content = <ContentTab course={course} />
  else content = <OverviewTab analytics={analytics} pending={pending} />

  return (
    <div className="p-6">
      <nav className="mb-4 text-sm text-gray-600">
        <Link href="/teacher">
          <a className="hover:text-gray-700">Teacher Dashboard</a>
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">{course.code}</span>
      </nav>

      <div className={`bg-gradient-to-r ${course.color} text-white rounded-xl p-6 mb-6 shadow-md`}>
        <div>
          <div className="text-sm opacity-90 mb-1">
            {course.code} • {course.term}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{course.name}</h1>
          <p className="text-white text-opacity-90">
            {analytics?.totalStudents || 0} students enrolled
          </p>
        </div>
      </div>

      <TeacherCourseTabs courseId={course.id} activeTab={activeTab} />
      {content}

      {gradingItem && (
        <GradingModal
          item={gradingItem}
          course={course}
          onClose={handleGradingClose}
          onSave={handleGradingSave}
        />
      )}

      {announcementModalOpen && (
        <CreateAnnouncementModal
          courseId={course.id}
          onClose={() => setAnnouncementModalOpen(false)}
        />
      )}

      {assignmentModalOpen && (
        <CreateAssignmentModal
          courseId={course.id}
          onClose={() => setAssignmentModalOpen(false)}
        />
      )}
    </div>
  )
}

