import React, { useMemo, useState, useEffect } from "react";
import { Link } from "wouter";
import { getCourseById } from "../data/courseDetails.js";
import {
  getCourseAnalytics,
  getPendingGrading,
  getTotalPendingCount,
  getUpcomingDeadlinesForDashboard,
} from "../data/teacherData.js";
import { CreateAnnouncementModal } from "../components/CreateAnnouncementModal.jsx";
import { CreateAssignmentModal } from "../components/CreateAssignmentModal.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { api } from "../api/client.js";

const USE_API = !!import.meta.env.VITE_API_URL;
const TEACHING_COURSES = [1, 2, 3, 4, 5, 6];
const FAVORITES_KEY = "teacher_dashboard_favorites";

function loadFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return new Set(TEACHING_COURSES.map(String));
    return new Set(JSON.parse(raw));
  } catch {
    return new Set(TEACHING_COURSES.map(String));
  }
}

function saveFavorites(fav) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...fav]));
  } catch {}
}

function buildActivityMessage(activity) {
  if (activity.type === "submission")
    return `${activity.student} submitted ${activity.assignment}`;
  if (activity.type === "grade")
    return `${activity.student} was graded for ${activity.assignment}`;
  if (activity.type === "discussion")
    return `${activity.student} posted in ${activity.topic}`;
  return "Activity";
}

function getCourseActivityCounts(course) {
  const analytics = getCourseAnalytics(String(course.id));
  const assignments = Array.isArray(course.assignments)
    ? course.assignments.length
    : Number(course.assignments || 0);
  const announcements = course.announcements?.length || 0;
  return {
    assignments: Math.min(assignments, 99),
    announcements: Math.min(announcements, 99),
    discussions: 0,
    files: 0,
  };
}

export function TeacherDashboardPage() {
  const { user } = useAuth();
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [apiCourses, setApiCourses] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [dashboardView, setDashboardView] = useState("card"); // card | list | activity
  const [favorites, setFavorites] = useState(loadFavorites);

  useEffect(() => {
    if (!USE_API) return;
    api
      .getCourses("teacher")
      .then(setApiCourses)
      .catch((e) => setApiError(e.message));
  }, []);

  const courses = useMemo(() => {
    if (USE_API && apiCourses) return apiCourses;
    return TEACHING_COURSES.map((id) => getCourseById(id)).filter(Boolean);
  }, [USE_API, apiCourses]);

  const favoritedCourses = useMemo(() => {
    return courses.filter((c) => favorites.has(String(c.id)));
  }, [courses, favorites]);

  const displayCourses =
    dashboardView === "card" ? favoritedCourses : courses;

  const totalPending = USE_API ? 0 : getTotalPendingCount();

  const totalStudents = courses.reduce((sum, c) => {
    const analytics = getCourseAnalytics(String(c.id));
    return sum + (analytics?.totalStudents || 0);
  }, 0);

  const avgAttendance =
    courses.length > 0
      ? (
          courses.reduce((sum, c) => {
            const analytics = getCourseAnalytics(String(c.id));
            return sum + (analytics?.attendanceRate || 0);
          }, 0) / courses.length
        ).toFixed(0)
      : "0";

  const recentActivity = useMemo(
    () =>
      courses
        .flatMap((course) => {
          const analytics = getCourseAnalytics(String(course.id));
          return (analytics?.recentActivity || []).map((a) => ({ ...a, course }));
        })
        .slice(0, 20),
    [courses]
  );

  const pendingItems = courses
    .flatMap((course) =>
      getPendingGrading(String(course.id)).map((p) => ({ ...p, course }))
    )
    .slice(0, 5);

  const upcomingDeadlines = useMemo(
    () => getUpcomingDeadlinesForDashboard(courses),
    [courses]
  );

  const toggleFavorite = (courseId) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      const key = String(courseId);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      saveFavorites(next);
      return next;
    });
  };

  const isLoading = USE_API && apiCourses === null && !apiError;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center py-12 text-gray-500">Loading…</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {apiError && (
        <div className="bg-red-50 text-red-700 rounded-lg p-4 mb-6">{apiError}</div>
      )}
      <div className="bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-xl p-6 mb-6 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Welcome, {user?.name || "Instructor"}!
            </h1>
            <p className="text-gray-300">
              Teaching {courses.length} courses • {totalPending} assignments pending
              review
            </p>
          </div>
          <div className="flex items-center gap-1" role="group" aria-label="Dashboard view">
            <button
              onClick={() => setDashboardView("card")}
              className={`px-3 py-1.5 rounded text-sm ${
                dashboardView === "card"
                  ? "bg-white/20"
                  : "hover:bg-white/10"
              }`}
              title="Card View"
            >
              Card
            </button>
            <button
              onClick={() => setDashboardView("list")}
              className={`px-3 py-1.5 rounded text-sm ${
                dashboardView === "list"
                  ? "bg-white/20"
                  : "hover:bg-white/10"
              }`}
              title="List View"
            >
              List
            </button>
            <button
              onClick={() => setDashboardView("activity")}
              className={`px-3 py-1.5 rounded text-sm ${
                dashboardView === "activity"
                  ? "bg-white/20"
                  : "hover:bg-white/10"
              }`}
              title="Recent Activity View"
            >
              Activity
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-md p-5">
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalStudents}</p>
            </div>
            <Link
              href={
                pendingItems[0]
                  ? `/teacher/course/${pendingItems[0].course.id}/grading`
                  : "/teacher"
              }
            >
              <a className="block bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow">
                <p className="text-sm text-gray-600">Pending Grading</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">
                  {totalPending}
                </p>
              </a>
            </Link>
            <div className="bg-white rounded-lg shadow-md p-5">
              <p className="text-sm text-gray-600">Avg Attendance</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {avgAttendance}%
              </p>
            </div>
          </div>

          {dashboardView === "card" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                My Courses
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayCourses.map((course) => {
                  const analytics = getCourseAnalytics(String(course.id));
                  const pending = getPendingGrading(String(course.id)).length;
                  const counts = getCourseActivityCounts(course);
                  const isFav = favorites.has(String(course.id));
                  return (
                    <div key={course.id} className="relative">
                      <button
                        onClick={() => toggleFavorite(course.id)}
                        className="absolute top-2 right-2 z-10 p-1 rounded-full hover:bg-white/20 text-white"
                        aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
                      >
                        {isFav ? (
                          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        )}
                      </button>
                      <Link href={`/teacher/course/${course.id}`}>
                        <a
                          className={`block rounded-xl p-5 hover:shadow-lg transition-all border-2 bg-gradient-to-r ${course.color || "from-gray-500 to-gray-600"} text-white ${
                            isFav ? "border-transparent" : "border-gray-200"
                          }`}
                        >
                          <h3 className="font-semibold text-lg mb-1">{course.name}</h3>
                          <p className="text-sm opacity-90 mb-3">{course.code} • {course.term}</p>
                          <div className="flex gap-4 text-sm">
                            <span className="flex items-center gap-1" title="Assignments">
                              <svg className="w-4 h-4 opacity-80" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd" />
                              </svg>
                              {counts.assignments}
                            </span>
                            <span className="flex items-center gap-1" title="Announcements">
                              <svg className="w-4 h-4 opacity-80" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" />
                              </svg>
                              {counts.announcements}
                            </span>
                          </div>
                          {pending > 0 && (
                            <span className="inline-block mt-2 px-2 py-0.5 bg-white/20 rounded text-xs">
                              {pending} to grade
                            </span>
                          )}
                        </a>
                      </Link>
                    </div>
                  );
                })}
              </div>
              {displayCourses.length === 0 && (
                <p className="text-sm text-gray-500">Star courses to show them here.</p>
              )}
            </div>
          )}

          {dashboardView === "list" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">My Courses</h2>
              <div className="space-y-2">
                {displayCourses.map((course) => {
                  const analytics = getCourseAnalytics(String(course.id));
                  const pending = getPendingGrading(String(course.id)).length;
                  return (
                    <Link key={course.id} href={`/teacher/course/${course.id}`}>
                      <a className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200">
                        <span className="font-medium text-gray-900">
                          {course.code} - {course.name}
                        </span>
                        <span className="text-sm text-gray-600">
                          {analytics?.totalStudents || 0} students
                          {pending > 0 && (
                            <span className="ml-2 text-orange-600">• {pending} to grade</span>
                          )}
                        </span>
                      </a>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {dashboardView === "activity" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                Recent Activity
              </h2>
              <div className="space-y-4">
                {recentActivity.length ? (
                  recentActivity.map((activity, idx) => (
                    <div
                      key={`${activity.course?.id}-${idx}`}
                      className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          {buildActivityMessage(activity)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.course?.code} • {activity.time}
                        </p>
                      </div>
                      {activity.course && (
                        <Link href={`/teacher/course/${activity.course.id}`}>
                          <a className="text-xs text-gray-600 hover:text-gray-900 shrink-0">
                            View
                          </a>
                        </Link>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No recent activity.</p>
                )}
              </div>
            </div>
          )}

          {dashboardView !== "activity" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                Recent Activity
              </h2>
              <div className="space-y-4">
                {recentActivity.slice(0, 5).map((activity, idx) => (
                  <div
                    key={`${activity.course?.id}-${idx}`}
                    className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        {buildActivityMessage(activity)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.course?.code} • {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
                {recentActivity.length === 0 && (
                  <p className="text-sm text-gray-500">No recent activity.</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => setAnnouncementModalOpen(true)}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Create Announcement
              </button>
              <button
                onClick={() => setAssignmentModalOpen(true)}
                className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Create Assignment
              </button>
              <Link href="/teacher/settings">
                <a className="block w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center">
                  Schedule Office Hours
                </a>
              </Link>
              <Link href="/teacher/grades">
                <a className="block w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center">
                  View Grades
                </a>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              To Do
            </h3>
            {totalPending > 0 ? (
              <>
                <div className="space-y-3">
                  {pendingItems.map((item) => (
                    <Link
                      key={`${item.course.id}-${item.id}`}
                      href={`/teacher/course/${item.course.id}/grading`}
                    >
                      <a className="block border-l-4 border-gray-500 pl-3 py-2 bg-gray-50 rounded-r hover:bg-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {item.studentName}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {item.course.code} • {item.assignmentName}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{item.timeAgo}</p>
                      </a>
                    </Link>
                  ))}
                </div>
                <Link
                  href={
                    pendingItems[0]
                      ? `/teacher/course/${pendingItems[0].course.id}/grading`
                      : "/teacher"
                  }
                >
                  <a className="block w-full mt-4 text-center text-gray-700 text-sm font-medium hover:underline">
                    View All ({totalPending})
                  </a>
                </Link>
              </>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">All caught up!</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              Coming Up
            </h3>
            <div className="space-y-3">
              {upcomingDeadlines.map((deadline) => (
                <Link
                  key={`${deadline.courseId}-${deadline.assignment}-${deadline.dueDate}`}
                  href={`/teacher/course/${deadline.courseId}/grading`}
                >
                  <a className="block pb-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 -mx-2 px-2 py-1 rounded">
                    <p className="text-sm font-medium text-gray-900">
                      {deadline.assignment}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{deadline.course?.code}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-red-600">{deadline.dueDate}</span>
                      <span className="text-xs text-gray-500">
                        {deadline.submitted}/{deadline.total} submitted
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                      <div
                        className="bg-green-500 h-1.5 rounded-full"
                        style={{
                          width: `${deadline.total > 0 ? ((deadline.submitted / deadline.total) * 100).toFixed(0) : 0}%`,
                        }}
                      />
                    </div>
                  </a>
                </Link>
              ))}
              {upcomingDeadlines.length === 0 && (
                <p className="text-sm text-gray-500">No upcoming deadlines.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {announcementModalOpen && (
        <CreateAnnouncementModal
          courses={courses}
          onClose={() => setAnnouncementModalOpen(false)}
        />
      )}

      {assignmentModalOpen && (
        <CreateAssignmentModal
          courses={courses}
          onClose={() => setAssignmentModalOpen(false)}
        />
      )}
    </div>
  );
}
