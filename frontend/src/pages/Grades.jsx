import React, { useMemo, useState, useEffect } from 'react'
import { Link } from 'wouter'
import { useAuth } from '../contexts/AuthContext.jsx'
import { api } from '../api/client.js'

const USE_API = true

function calculateCourseGrade(assignments) {
  if (!assignments || assignments.length === 0) return null
  const graded = assignments.filter(
    (a) => a.submitted && a.grade != null && a.grade !== undefined,
  )
  if (!graded.length) return null
  const total = graded.reduce((sum, a) => sum + a.grade, 0)
  const max = graded.reduce((sum, a) => sum + a.points, 0)
  return (total / max) * 100
}

function getCompletionPercentage(assignments) {
  if (!assignments || assignments.length === 0) return 0
  const submitted = assignments.filter((a) => a.submitted).length
  return Math.round((submitted / assignments.length) * 100)
}

function getLetterGrade(percentage) {
  if (percentage == null) return 'N/A'
  if (percentage >= 90) return 'A'
  if (percentage >= 80) return 'B'
  if (percentage >= 70) return 'C'
  if (percentage >= 60) return 'D'
  return 'F'
}

function getGradeClass(letterGrade) {
  const map = {
    A: 'grade-a',
    B: 'grade-b',
    C: 'grade-c',
    D: 'grade-d',
    F: 'grade-f',
    'N/A': 'grade-pending',
  }
  return map[letterGrade] || 'grade-pending'
}

function gradeToGPA(percentage) {
  if (percentage >= 93) return 4.0
  if (percentage >= 90) return 3.7
  if (percentage >= 87) return 3.3
  if (percentage >= 83) return 3.0
  if (percentage >= 80) return 2.7
  if (percentage >= 77) return 2.3
  if (percentage >= 73) return 2.0
  if (percentage >= 70) return 1.7
  if (percentage >= 67) return 1.3
  if (percentage >= 63) return 1.0
  if (percentage >= 60) return 0.7
  return 0.0
}

export function GradesPage() {
  const { user } = useAuth()
  const studentId = user?.studentId
  const [expanded, setExpanded] = useState(() => new Set())
  const [apiCourses, setApiCourses] = useState(null)
  const [apiCourseDetails, setApiCourseDetails] = useState(() => ({}))
  const [apiError, setApiError] = useState(null)

  useEffect(() => {
    api
      .getCourses()
      .then(setApiCourses)
      .catch((e) => setApiError(e.message))
  }, [])

  useEffect(() => {
    if (!apiCourses?.length) return
    apiCourses.forEach((c) => {
      api
        .getCourse(c.id)
        .then((detail) => {
          setApiCourseDetails((prev) => ({ ...prev, [c.id]: detail }))
        })
        .catch(() => {})
    })
  }, [apiCourses])

  const courseSummaries = useMemo(() => {
    const courses = Array.isArray(apiCourses) ? apiCourses : []
    return courses.map((c) => {
      const details = apiCourseDetails[c.id]
      const effectiveAssignments = details?.assignments || []
      const current = effectiveAssignments.length
        ? calculateCourseGrade(effectiveAssignments)
        : null
      return { course: c, details, effectiveAssignments, currentGrade: current }
    })
  }, [apiCourses, apiCourseDetails])

  const validGrades = courseSummaries
    .filter((c) => c.currentGrade != null)
    .map((c) => c.currentGrade)

  const overallGPA =
    validGrades.length > 0
      ? (
          validGrades.reduce((sum, g) => sum + gradeToGPA(g), 0) / validGrades.length
        ).toFixed(2)
      : '0.00'

  const overallAverage =
    validGrades.length > 0
      ? (
          validGrades.reduce((sum, g) => sum + g, 0) / validGrades.length
        ).toFixed(1)
      : '0.0'

  const { completedAssignments, totalAssignments } = useMemo(() => {
    let completed = 0
    let total = 0
    courseSummaries.forEach(({ effectiveAssignments }) => {
      total += effectiveAssignments.length
      completed += effectiveAssignments.filter((a) => a.submitted).length
    })
    return { completedAssignments: completed, totalAssignments: total }
  }, [courseSummaries])

  const toggleCourse = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="grades-page p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Grades</h1>
        <p className="text-gray-600">View your grades and academic progress</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="mb-2">
            <p className="text-sm text-gray-600">Overall GPA</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{overallGPA}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="mb-2">
            <p className="text-sm text-gray-600">Average Grade</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{overallAverage}%</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="mb-2">
            <p className="text-sm text-gray-600">Completed</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {completedAssignments}/{totalAssignments}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="mb-2">
            <p className="text-sm text-gray-600">Courses</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{courseSummaries.length}</p>
        </div>
      </div>

      <div className="space-y-4">
        {courseSummaries.map(({ course, details, effectiveAssignments, currentGrade }) => {
          if (!details) return null
          const isExpanded = expanded.has(course.id)
          const letter = getLetterGrade(currentGrade)
          const gradeClass = getGradeClass(letter)
          const completion = getCompletionPercentage(effectiveAssignments)
          return (
            <div
              key={course.id}
              className="course-grade-card bg-white rounded-lg shadow-md overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleCourse(course.id)}
                className="w-full text-left course-grade-header p-5 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className={`w-1 h-16 bg-gradient-to-b ${course.color} rounded-full`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {course.code}
                        </h3>
                        <span className={`grade-badge ${gradeClass}`}>
                          {currentGrade != null
                            ? `${currentGrade.toFixed(1)}% (${letter})`
                            : 'N/A'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{course.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {course.professor}
                      </p>
                    </div>
                    <div className="hidden md:block w-48">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{completion}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`progress-bar bg-gradient-to-r ${course.color} h-2 rounded-full`}
                          style={{ width: `${completion}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-200">
                  <div className="p-5 space-y-2">
                    {effectiveAssignments.map((assignment) => {
                      const isSubmitted = assignment.submitted
                      const grade = assignment.grade
                      const percentage =
                        grade != null ? (grade / assignment.points) * 100 : null

                      let badge = null
                      if (isSubmitted && grade != null) {
                        const letterLocal = getLetterGrade(percentage)
                        const cls = getGradeClass(letterLocal)
                        badge = (
                          <span className={`grade-badge ${cls}`}>
                            {grade}/{assignment.points} (
                            {percentage != null ? percentage.toFixed(0) : '-'}
                            %)
                          </span>
                        )
                      } else if (isSubmitted) {
                        badge = (
                          <span className="grade-badge grade-pending">
                            Submitted - Pending
                          </span>
                        )
                      } else {
                        badge = (
                          <span className="grade-badge grade-pending">
                            Not Submitted
                          </span>
                        )
                      }

                      return (
                        <Link
                          key={assignment.id}
                          href={`/course/${course.id}/assignment/${assignment.id}`}
                        >
                          <a className="block grade-item p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <h4 className="font-medium text-gray-900">
                                    {assignment.title}
                                  </h4>
                                  {badge}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <span>Due: {assignment.dueDate}</span>
                                  <span>{assignment.points} points</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-gray-900">
                                    {grade != null ? getLetterGrade(percentage) : '-'}
                                  </div>
                                  {percentage != null && (
                                    <div className="text-xs text-gray-500">
                                      {percentage.toFixed(1)}%
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </a>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

