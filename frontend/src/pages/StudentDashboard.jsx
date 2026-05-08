import React, { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { useAuth } from "../contexts/AuthContext.jsx";
import { api } from "../api/client.js";

function CourseCard({ course }) {
  return (
    <Link href={`/course/${course.id}`}>
      <a
        className="course-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer block"
        aria-label={`Open ${course.name}`}
      >
        <div
          className={`h-32 bg-linear-to-r ${course.color} p-4 text-white flex flex-col justify-between`}
        >
          <div className="text-sm opacity-90">{course.code}</div>
          <div className="text-lg font-semibold line-clamp-2">
            {course.name}
          </div>
        </div>
        <div className="p-4">
          <div className="flex justify-between text-sm text-gray-600">
            <span className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              {course.assignments} assignment
              {course.assignments !== 1 ? "s" : ""}
            </span>
            <span className="truncate">{course.professor}</span>
          </div>
        </div>
      </a>
    </Link>
  );
}

function TodoItem({ todo, isLast }) {
  const content = (
    <>
      <div className="text-xs font-semibold text-gray-600 mb-1">
        {todo.courseCode}
      </div>
      <div className="text-sm text-gray-700 mb-1">{todo.title}</div>
      <div className="text-xs text-red-500 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-3 h-3 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Due: {todo.dueDate}
      </div>
    </>
  );
  const courseId = todo.courseId;
  const href =
    courseId != null && todo.assignmentId != null
      ? `/course/${courseId}/assignment/${todo.assignmentId}`
      : null;
  return (
    <div className={!isLast ? "border-b border-gray-100 pb-4" : "pb-2"}>
      {href ? (
        <Link href={href}>
          <a className="block hover:bg-gray-50 -m-2 p-2 rounded-lg transition-colors">
            {content}
          </a>
        </Link>
      ) : (
        content
      )}
    </div>
  );
}

function AnnouncementItem({ announcement, isLast }) {
  const announcementId = announcement.announcementId ?? announcement.id;
  const courseId = announcement.courseId;
  const href =
    courseId != null && announcementId != null
      ? `/course/${courseId}/announcement/${announcementId}`
      : null;
  const content = (
    <>
      <div className="text-sm font-semibold text-gray-700 mb-1 flex items-center justify-between">
        <span>{announcement.title}</span>
        {!announcement.read && (
          <span className="w-2 h-2 bg-gray-600 rounded-full" />
        )}
      </div>
      <div className="text-xs text-gray-500 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-3 h-3 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        {announcement.courseCode} - {announcement.timestamp}
      </div>
    </>
  );
  return (
    <div className={!isLast ? "border-b border-gray-100 pb-4" : "pb-2"}>
      {href ? (
        <Link href={href}>
          <a className="block hover:bg-gray-50 -m-2 p-2 rounded-lg transition-colors">
            {content}
          </a>
        </Link>
      ) : (
        content
      )}
    </div>
  );
}

export function StudentDashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    api
      .getDashboard()
      .then(setDashboard)
      .catch((e) => setApiError(e.message));
  }, []);

  const courses = dashboard?.courses || [];
  const todos = dashboard?.todos || [];
  const announcements = dashboard?.announcements || [];
  const displayName = user?.name ?? dashboard?.user?.name ?? "Student";
  const upcomingCount = todos.length;
  const semester = dashboard?.semester || "";

  return (
    <div className="p-6">
      <div className="bg-linear-to-r from-gray-700 to-gray-600 text-white rounded-xl p-6 mb-6 shadow-md">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Welcome back, {displayName}!
        </h1>
        <p className="text-gray-300">
          You have {upcomingCount} assignment{upcomingCount !== 1 ? "s" : ""}{" "}
          due this week
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            My Courses{semester ? ` - ${semester}` : ""}
          </h2>
          {apiError && <p className="text-red-600 text-sm mb-4">{apiError}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
            {!courses.length && (
              <p className="text-sm text-gray-500">No courses found.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="text-gray-600 mr-2 w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-700">To Do</h3>
            </div>
            <div className="space-y-4">
              {todos.map((todo, index) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  isLast={index === todos.length - 1}
                />
              ))}
              {!todos.length && (
                <p className="text-sm text-gray-500">No assignments due.</p>
              )}
            </div>
            <Link href="/calendar">
              <a className="block text-center text-gray-700 text-sm mt-4 hover:underline">
                View All
              </a>
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="text-gray-600 mr-2 w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-700">
                Recent Announcements
              </h3>
            </div>
            <div className="space-y-4">
              {announcements.map((a, index) => (
                <AnnouncementItem
                  key={a.id}
                  announcement={a}
                  isLast={index === announcements.length - 1}
                />
              ))}
              {!announcements.length && (
                <p className="text-sm text-gray-500">No announcements yet.</p>
              )}
            </div>
            <Link
              href={
                Array.isArray(courses) && courses.length > 0
                  ? `/course/${courses[0].id}/announcements`
                  : "/courses"
              }
            >
              <a className="block text-center text-gray-700 text-sm mt-4 hover:underline">
                View All
              </a>
            </Link>
          </div>

          <Link href="/calendar">
            <a className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-gray-600 mr-2 w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-700">
                  November 2025
                </h3>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-sm">
                <div className="font-semibold text-gray-500 py-2">S</div>
                <div className="font-semibold text-gray-500 py-2">M</div>
                <div className="font-semibold text-gray-500 py-2">T</div>
                <div className="font-semibold text-gray-500 py-2">W</div>
                <div className="font-semibold text-gray-500 py-2">T</div>
                <div className="font-semibold text-gray-500 py-2">F</div>
                <div className="font-semibold text-gray-500 py-2">S</div>
                <div className="py-2" />
                <div className="py-2" />
                <div className="py-2" />
                <div className="py-2" />
                <div className="py-2" />
                <div className="py-2" />
                <div className="py-2">1</div>
                <div className="py-2 bg-gray-600 text-white rounded-full">
                  2
                </div>
                <div className="py-2">3</div>
                <div className="py-2">4</div>
                <div className="py-2 bg-yellow-100 rounded-full">5</div>
                <div className="py-2 bg-yellow-100 rounded-full">6</div>
                <div className="py-2">7</div>
                <div className="py-2 bg-yellow-100 rounded-full">8</div>
                <div className="py-2">9</div>
                <div className="py-2">10</div>
                <div className="py-2">11</div>
                <div className="py-2">12</div>
                <div className="py-2">13</div>
                <div className="py-2">14</div>
                <div className="py-2">15</div>
              </div>
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
