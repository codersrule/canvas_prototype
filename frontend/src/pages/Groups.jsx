import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'wouter'
import { MOCK_GROUPS } from '../data/groupsData.js'
import { api } from '../api/client.js'

const USE_API = !!import.meta.env.VITE_API_URL

function GroupCard({ group, courseHref }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{group.name}</h3>
          <p className="text-sm text-gray-700 mt-1">{group.course}</p>
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{group.description}</p>
          <p className="text-xs text-gray-500 mt-3">{group.members} members</p>
        </div>
        {courseHref ? (
          <Link href={courseHref}>
            <a className="shrink-0 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium">
              View Course
            </a>
          </Link>
        ) : (
          <span className="shrink-0 px-4 py-2 bg-gray-300 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed">
            View Course
          </span>
        )}
      </div>
    </div>
  )
}

export function GroupsPage() {
  const [apiCourses, setApiCourses] = useState(null)

  useEffect(() => {
    if (!USE_API) return
    api.getCourses().then(setApiCourses).catch(() => setApiCourses([]))
  }, [])

  const courseIdByCode = useMemo(() => {
    const map = {}
    const list = USE_API && apiCourses ? apiCourses : []
    list.forEach((c) => {
      if (c.code) map[c.code] = c.id
    })
    return map
  }, [USE_API, apiCourses])

  const groupsWithHrefs = useMemo(
    () =>
      MOCK_GROUPS.map((group) => {
        const href = USE_API
          ? (courseIdByCode[group.course] ? `/course/${courseIdByCode[group.course]}` : null)
          : `/course/${group.courseId}`
        return { ...group, courseHref: href }
      }),
    [USE_API, courseIdByCode]
  )

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">My Groups</h1>
      <p className="text-gray-600 mb-6">
        Study groups and collaborative spaces for your courses.
      </p>

      {MOCK_GROUPS.length > 0 ? (
        <div className="space-y-4">
          {groupsWithHrefs.map((group) => (
            <GroupCard key={group.id} group={group} courseHref={group.courseHref} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No groups yet</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            You haven&apos;t joined any groups. Your instructor may create groups for projects or
            discussions.
          </p>
        </div>
      )}
    </div>
  )
}
