import React, { useState, useMemo, useEffect } from "react";
import { Link, useRoute } from "wouter";
import { useAuth } from "../contexts/AuthContext.jsx";
import { api } from "../api/client.js";
import { normalizeAnnouncement } from "../data/announcements.js";

const USE_API = true;

function calculateCurrentGrade(course) {
  const graded = (course.assignments || []).filter((a) => a.grade != null);
  if (!graded.length) return null;
  const total = graded.reduce(
    (sum, a) => sum + (a.grade / (a.points || 100)) * 100,
    0,
  );
  return Math.round(total / graded.length);
}

function getPendingAssignments(course) {
  return (course.assignments || []).filter((a) => !a.submitted);
}

function getCompletedModulesCount(course) {
  return (course.modules || []).filter((m) => m.completed).length;
}

function getEffectiveAssignmentForStudent(_courseId, _assignmentId, assignment) {
  return assignment;
}

function getModuleItemIcon(type) {
  if (type === "assignment") return "Assignment";
  if (type === "quiz") return "Quiz";
  if (type === "file") return "File";
  return "Page";
}

function getModuleItemColor(type) {
  if (type === "assignment") return "text-orange-600";
  if (type === "quiz") return "text-purple-600";
  if (type === "file") return "text-blue-600";
  return "text-gray-600";
}

function getFileIcon() {
  return "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z";
}

function getFileTypeLabel(type) {
  return String(type || "file").split("/").pop().toUpperCase();
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDueDate(dueDate) {
  if (!dueDate) return "No due date";
  const d = new Date(dueDate);
  if (isNaN(d.getTime())) return dueDate; // fallback for legacy string values
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function Breadcrumb({ course }) {
  return (
    <nav className="mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-sm text-gray-600">
        <li>
          <Link href="/">Dashboard</Link>
        </li>
        <li>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </li>
        <li className="text-gray-900 font-medium">{course.code}</li>
      </ol>
    </nav>
  );
}

function CourseHeader({ course }) {
  const currentGrade = calculateCurrentGrade(course);
  const pendingAssignments = getPendingAssignments(course);
  const completedModules = getCompletedModulesCount(course);

  return (
    <div
      className={`bg-linear-to-r ${course.color} text-white rounded-xl p-6 mb-6 shadow-md`}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="mb-4 md:mb-0">
          <div className="text-sm opacity-90 mb-1">
            {course.code} • {course.term}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{course.name}</h1>
          <p className="text-gray-300">{course.professor}</p>
        </div>
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-4 md:gap-6 text-center">
          <Link href={`/course/${course.id}/grades`}>
            <a className="hover:opacity-90 transition-opacity">
              <div className="text-2xl font-bold">
                {currentGrade !== null ? `${currentGrade}%` : "N/A"}
              </div>
              <div className="text-xs opacity-90">Current Grade</div>
            </a>
          </Link>
          <span className="text-white/60 font-light" aria-hidden>
            |
          </span>
          <Link href={`/course/${course.id}/assignments`}>
            <a className="hover:opacity-90 transition-opacity">
              <div className="text-2xl font-bold">
                {pendingAssignments.length}
              </div>
              <div className="text-xs opacity-90">Pending</div>
            </a>
          </Link>
          <span className="text-white/60 font-light" aria-hidden>
            |
          </span>
          <Link href={`/course/${course.id}/modules`}>
            <a className="hover:opacity-90 transition-opacity">
              <div className="text-2xl font-bold">
                {completedModules}/{course.modules.length}
              </div>
              <div className="text-xs opacity-90">Modules</div>
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}

const TABS = [
  "home",
  "announcements",
  "discussions",
  "assignments",
  "modules",
  "syllabus",
  "files",
  "grades",
  "people",
];

function CourseTabs({ courseId, activeTab }) {
  return (
    <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
      <nav
        className="flex border-b overflow-x-auto"
        role="tablist"
        aria-label="Course sections"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          const label =
            tab === "home"
              ? "Home"
              : tab.charAt(0).toUpperCase() + tab.slice(1).replace("-", " ");
          return (
            <Link key={tab} href={`/course/${courseId}/${tab}`}>
              <a
                className={`course-tab px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? "border-gray-700 text-gray-700"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                {label}
              </a>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function HomeTab({ course }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Course Information
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 mr-3 text-gray-600 shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <div className="font-medium text-gray-700">Description</div>
                <div className="text-gray-600">{course.description}</div>
              </div>
            </div>
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 mr-3 text-gray-600"
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
              <div>
                <span className="font-medium text-gray-700">Schedule:</span>
                <span className="text-gray-600 ml-2">{course.time}</span>
              </div>
            </div>
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 mr-3 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 111.314 0z"
                />
              </svg>
              <div>
                <span className="font-medium text-gray-700">Location:</span>
                <span className="text-gray-600 ml-2">{course.location}</span>
              </div>
            </div>
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 mr-3 text-gray-600"
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
              <div>
                <span className="font-medium text-gray-700">Office Hours:</span>
                <span className="text-gray-600 ml-2">{course.officeHours}</span>
              </div>
            </div>
          </div>
        </div>

        {course.announcements?.length ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Recent Announcements
            </h2>
            <div className="space-y-4">
              {course.announcements.slice(0, 2).map((announcement) => (
                <Link
                  key={announcement.id}
                  href={`/course/${course.id}/announcement/${announcement.id}`}
                >
                  <a className="block border-l-4 border-gray-600 pl-4 py-2 hover:bg-gray-50 rounded-r transition-colors">
                    <div className="font-medium text-gray-900">
                      {announcement.title}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {announcement.date}
                    </div>
                  </a>
                </Link>
              ))}
            </div>
            <Link href={`/course/${course.id}/announcements`}>
              <a className="block text-center text-gray-700 text-sm mt-4 hover:underline">
                View All Announcements →
              </a>
            </Link>
          </div>
        ) : null}
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Quick Links
          </h3>
          <div className="space-y-2">
            <Link href={`/course/${course.id}/announcements`}>
              <a className="block px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-gray-700">
                Announcements
              </a>
            </Link>
            <Link href={`/course/${course.id}/discussions`}>
              <a className="block px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-gray-700">
                Discussions
              </a>
            </Link>
            <Link href={`/course/${course.id}/assignments`}>
              <a className="block px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-gray-700">
                Assignments
              </a>
            </Link>
            <Link href={`/course/${course.id}/modules`}>
              <a className="block px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-gray-700">
                Modules
              </a>
            </Link>
            <Link href={`/course/${course.id}/syllabus`}>
              <a className="block px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-gray-700">
                Syllabus
              </a>
            </Link>
            <Link href={`/course/${course.id}/files`}>
              <a className="block px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-gray-700">
                Files
              </a>
            </Link>
            <Link href={`/course/${course.id}/grades`}>
              <a className="block px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-gray-700">
                Grades
              </a>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Course Stats
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Credits</span>
              <span className="font-medium text-gray-900">
                {course.credits}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Term</span>
              <span className="font-medium text-gray-900">{course.term}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Assignments</span>
              <span className="font-medium text-gray-900">
                {course.assignments?.length || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Modules</span>
              <span className="font-medium text-gray-900">
                {course.modules.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnnouncementsTab({ course }) {
  const list = course.announcements || [];
  if (!list.length) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            No Announcements Yet
          </h2>
          <p className="text-gray-600">
            There are no announcements for this course at the moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="divide-y divide-gray-200">
          {list.map((announcement) => {
            const norm = normalizeAnnouncement(course, announcement);
            return (
              <div
                key={announcement.id}
                className="flex gap-4 p-6 hover:bg-gray-50/50 transition-colors"
              >
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gray-200 border border-gray-200 flex items-center justify-center text-gray-700 font-semibold text-base">
                    {norm.authorInitials}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/course/${course.id}/announcement/${announcement.id}`}
                  >
                    <a className="block group">
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                        {announcement.title}
                      </h3>
                    </a>
                  </Link>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {norm.sections} Section{norm.sections !== 1 ? "s" : ""}
                  </p>
                  <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                    {norm.contentSnippet}
                  </p>
                  <Link
                    href={`/course/${course.id}/announcement/${announcement.id}#reply`}
                  >
                    <a className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-gray-700 hover:text-gray-800 underline">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                        />
                      </svg>
                      Reply
                    </a>
                  </Link>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-gray-500">Posted on:</p>
                  <p className="text-sm text-gray-700 mt-0.5">
                    {norm.postedAtFormatted}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DiscussionsTab({ course }) {
  const discussions = course.discussions || [];

  if (!discussions.length) {
    return (
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
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No discussions yet
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Course discussions will appear here when your instructor creates them.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="divide-y divide-gray-200">
        {discussions.map((d) => (
          <Link key={d.id} href={`/course/${course.id}/discussion/${d.id}`}>
            <a className="flex gap-4 p-6 hover:bg-gray-50/50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-gray-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900">{d.title}</h3>
                <p className="text-sm text-gray-600 mt-0.5">
                  {d.author} • {d.postedAt} • {d.replies}{" "}
                  {d.replies === 1 ? "reply" : "replies"}
                </p>
              </div>
              {d.unread && (
                <span
                  className="shrink-0 w-2 h-2 rounded-full bg-gray-700 mt-2"
                  title="Unread"
                />
              )}
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}

function AssignmentsTab({ course, studentId }) {
  const allAssignments = course.assignments || [];
  const effectiveFor = (a) =>
    getEffectiveAssignmentForStudent(course.id, a.id, a, studentId);
  const pendingAssignments = allAssignments.filter(
    (a) => !effectiveFor(a).submitted,
  );
  const submittedAssignments = allAssignments.filter(
    (a) => effectiveFor(a).submitted,
  );

  if (!pendingAssignments.length && !submittedAssignments.length) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-20 h-20 mx-auto text-gray-300 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No Assignments
        </h3>
        <p className="text-gray-600">
          There are no assignments for this course yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {pendingAssignments.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Upcoming Assignments ({pendingAssignments.length})
          </h2>
          <div className="space-y-4">
            {pendingAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="border border-red-200 bg-red-50 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {assignment.title}
                    </h3>
                    <p className="text-sm text-red-600 mt-1 flex items-center">
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
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Due: {formatDueDate(assignment.dueDate)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {assignment.points} points
                    </p>
                  </div>
                  <Link
                    href={`/course/${course.id}/assignment/${assignment.id}`}
                  >
                    <a className="inline-block px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium">
                      Start Assignment
                    </a>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {submittedAssignments.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Submitted Assignments ({submittedAssignments.length})
          </h2>
          <div className="space-y-4">
            {submittedAssignments.map((assignment) => {
              const effective = getEffectiveAssignmentForStudent(
                course.id,
                assignment.id,
                assignment,
                studentId,
              );
              const percentage =
                effective.grade != null
                  ? Math.round((effective.grade / effective.points) * 100)
                  : null;
              return (
                <Link
                  key={assignment.id}
                  href={`/course/${course.id}/assignment/${assignment.id}`}
                >
                  <a className="block border border-green-200 bg-green-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {effective.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Submitted • {formatDueDate(assignment.dueDate)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {effective.points} points
                        </p>
                      </div>
                      <div className="text-right">
                        {effective.grade != null ? (
                          <>
                            <div
                              className={`text-2xl font-bold ${
                                effective.grade / effective.points >= 0.9
                                  ? "text-green-600"
                                  : "text-gray-700"
                              }`}
                            >
                              {effective.grade}/{effective.points}
                            </div>
                            <div className="text-sm text-gray-600">
                              {percentage}%
                            </div>
                          </>
                        ) : (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                            Pending Grade
                          </span>
                        )}
                      </div>
                    </div>
                  </a>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ModulesTab({ course }) {
  const [openModules, setOpenModules] = useState(() => new Set());
  const allModuleIds = course.modules.map((m) => m.id);
  const allExpanded =
    allModuleIds.length > 0 && allModuleIds.every((id) => openModules.has(id));

  const toggle = (id) => {
    setOpenModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    setOpenModules(new Set(allModuleIds));
  };

  const collapseAll = () => {
    setOpenModules(new Set());
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-700">Course Modules</h2>
        <button
          type="button"
          onClick={allExpanded ? collapseAll : expandAll}
          className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          {allExpanded ? "Collapse All" : "Expand All"}
        </button>
      </div>

      <div className="space-y-3">
        {course.modules.map((module) => {
          const items = module.items || [];
          const hasItems = items.length > 0;
          const isOpen = openModules.has(module.id);
          return (
            <div
              key={module.id}
              className="bg-gray-100 rounded-lg shadow-sm overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggle(module.id)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-200/60 transition-colors"
              >
                <svg
                  className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-90" : ""
                  }`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                </svg>
                <span className="flex-1 font-medium text-gray-800">
                  {module.title}
                </span>
              </button>
              <div
                className={`${isOpen ? "" : "hidden"} border-t border-gray-200`}
              >
                {hasItems ? (
                  <div className="p-4 bg-gray-50">
                    <div className="space-y-2">
                      {items.map((item) => {
                        const Icon = () => (
                          <span
                            className={`${getModuleItemColor(
                              item.type,
                            )} mr-3 inline-flex items-center justify-center`}
                            dangerouslySetInnerHTML={{
                              __html: getModuleItemIcon(item.type),
                            }}
                          />
                        );
                        const metadata = [];
                        if (item.duration) metadata.push(item.duration);
                        if (item.pages) metadata.push(`${item.pages} pages`);
                        if (item.points) metadata.push(`${item.points} pts`);
                        if (item.dueDate) metadata.push(`Due: ${item.dueDate}`);
                        return (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-shadow cursor-pointer group"
                          >
                            <div className="flex items-center flex-1">
                              <div className="mr-3">
                                {item.completed ? (
                                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                    <svg
                                      className="w-4 h-4 text-white"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="3"
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-gray-500 transition-colors" />
                                )}
                              </div>
                              <Icon />
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <h4
                                    className={`font-medium text-gray-900 ${
                                      item.completed
                                        ? "line-through text-gray-500"
                                        : ""
                                    }`}
                                  >
                                    {item.title}
                                  </h4>
                                  <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded capitalize">
                                    {item.type}
                                  </span>
                                </div>
                                {metadata.length > 0 && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {metadata.join(" • ")}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded transition-colors">
                                {item.type === "video"
                                  ? "Play"
                                  : item.type === "file"
                                    ? "Download"
                                    : item.completed
                                      ? "View"
                                      : "Start"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-12 h-12 mx-auto mb-3 text-gray-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p>No content items available yet</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SyllabusTab({ course, studentId }) {
  const schedule = (course.modules || []).map((m, idx) => ({
    week: idx + 1,
    title: m.title,
    status: m.completed ? "Completed" : "Upcoming",
  }));

  const allAssignments = course.assignments || [];
  const upcoming = allAssignments
    .filter(
      (a) =>
        !getEffectiveAssignmentForStudent(course.id, a.id, a, studentId)
          .submitted,
    )
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900">Syllabus</h2>
        <p className="text-sm text-gray-600 mt-1">
          Course overview, expectations, and week-by-week schedule.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Course Description
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {course.description || "No course description available."}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Weekly Schedule
            </h3>
            {schedule.length ? (
              <div className="space-y-3">
                {schedule.map((item) => (
                  <div
                    key={item.week}
                    className="flex items-center justify-between gap-4 p-4 rounded-lg border border-gray-200"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        Week {item.week}:{" "}
                        <span className="font-medium text-gray-800">
                          {item.title}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.status === "Completed"
                          ? "Covered in class"
                          : "Planned topic (subject to change)"}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-xs font-medium px-3 py-1 rounded-full ${
                        item.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                No schedule available yet.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Course Info
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Instructor</span>
                <span className="font-medium text-gray-900 text-right">
                  {course.professor}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Term</span>
                <span className="font-medium text-gray-900 text-right">
                  {course.term}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Credits</span>
                <span className="font-medium text-gray-900 text-right">
                  {course.credits}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Time</span>
                <span className="font-medium text-gray-900 text-right">
                  {course.time}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Location</span>
                <span className="font-medium text-gray-900 text-right">
                  {course.location}
                </span>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-500">
                  Office Hours
                </p>
                <p className="text-sm text-gray-900 mt-1">
                  {course.officeHours}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Upcoming Due Dates
            </h3>
            {upcoming.length ? (
              <div className="space-y-3">
                {upcoming.map((a) => (
                  <Link
                    key={a.id}
                    href={`/course/${course.id}/assignment/${a.id}`}
                  >
                    <a className="block p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">
                        {a.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Due: {formatDueDate(a.dueDate)}
                      </p>
                    </a>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">No upcoming assignments.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FileRow({ file }) {
  const iconPath = getFileIcon(file.type);
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors group">
      <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
        <svg
          className="w-5 h-5 text-red-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d={iconPath}
          />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {file.name}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {getFileTypeLabel(file.type)} • {file.size} • {file.updatedAt}
          {file.folder && ` • ${file.folder}`}
        </p>
      </div>
      <button className="shrink-0 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
        Download
      </button>
    </div>
  );
}

function FilesTab({ course }) {
  const files = course.files || [];
  const byFolder = files.reduce((acc, f) => {
    const key = f.folder || "(None)";
    if (!acc[key]) acc[key] = [];
    acc[key].push(f);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900">Course Files</h2>
        <p className="text-sm text-gray-600 mt-1">
          Documents, slides, and resources for this course.
        </p>
      </div>

      {files.length ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-6">
            {Object.entries(byFolder).map(([folder, items]) => (
              <div key={folder}>
                {folder !== "(None)" && (
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    {folder}
                  </h3>
                )}
                <div className="space-y-2">
                  {items.map((file) => (
                    <FileRow key={file.id} file={file} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <svg
            className="w-16 h-16 mx-auto text-gray-300 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No files yet
          </h3>
          <p className="text-gray-600">
            Course files will appear here when the instructor adds them.
          </p>
        </div>
      )}
    </div>
  );
}

function GradesTab({ course, studentId }) {
  const allAssignments = course.assignments || [];
  const assignmentsWithEffective = allAssignments.map((a) =>
    getEffectiveAssignmentForStudent(course.id, a.id, a, studentId),
  );
  const currentGrade = calculateCurrentGrade(course);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-700">Grades</h2>
        <div className="text-right">
          <div className="text-sm text-gray-600">Current Grade</div>
          <div
            className={`text-3xl font-bold ${
              currentGrade >= 90
                ? "text-green-600"
                : currentGrade >= 80
                  ? "text-gray-700"
                  : "text-yellow-600"
            }`}
          >
            {currentGrade !== null ? `${currentGrade}%` : "N/A"}
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Assignment
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Points
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Grade
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {assignmentsWithEffective.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 text-sm text-gray-900">{a.title}</td>
                <td className="px-4 py-4 text-center">
                  {a.submitted ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Submitted
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      Pending
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 text-center text-sm text-gray-600">
                  {a.points}
                </td>
                <td className="px-4 py-4 text-center">
                  {a.grade != null ? (
                    <span
                      className={`text-lg font-semibold ${
                        a.grade / a.points >= 0.9
                          ? "text-green-600"
                          : "text-gray-700"
                      }`}
                    >
                      {a.grade}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PeopleTab({ course }) {
  const lastNameInitial = course.professor.split(" ")[1]?.charAt(0) || "P";
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6 text-gray-700">People</h2>
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Instructor</h3>
        <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {lastNameInitial}
          </div>
          <div>
            <div className="font-medium text-gray-900">{course.professor}</div>
            <div className="text-sm text-gray-600">Instructor</div>
            <div className="text-sm text-gray-700 hover:underline cursor-pointer mt-1">
              Send message
            </div>
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-medium text-gray-700 mb-4">
          Students (150)
        </h3>
        <div className="text-sm text-gray-600">
          <p className="mb-4">View all students enrolled in this course.</p>
          <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
            View Class List
          </button>
        </div>
      </div>
    </div>
  );
}

function mergeApiCourseWithStores(apiCourse, studentId) {
  if (!apiCourse) return apiCourse;
  let assignments = apiCourse.assignments;
  if (assignments) {
    assignments = assignments.map((a) =>
      getEffectiveAssignmentForStudent(
        apiCourse.id,
        a.id,
        { ...a, submitted: false, grade: null },
        studentId,
      ),
    );
  }
  let announcements = apiCourse.announcements;
  if (announcements?.length) {
    announcements = announcements.map((a) => ({
      ...a,
      date: a.postedAt
        ? new Date(a.postedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "—",
    }));
  }
  return {
    ...apiCourse,
    assignments: assignments || [],
    announcements: announcements || [],
  };
}

export function CoursePage() {
  const { user } = useAuth();
  const studentId = user?.studentId;
  const [matchBase, paramsBase] = useRoute("/course/:id");
  const [matchTab, paramsTab] = useRoute("/course/:id/:tab");

  const courseId = useMemo(() => {
    const idStr = (matchTab ? paramsTab.id : paramsBase?.id) ?? null;
    return idStr || null;
  }, [matchBase, matchTab, paramsBase, paramsTab]);

  const [apiCourse, setApiCourse] = useState(null);
  const [apiError, setApiError] = useState(null);

  const activeTab = matchTab ? paramsTab.tab : "home";

  useEffect(() => {
    if (!USE_API || !courseId) return;
    setApiError(null);
    api
      .getCourse(courseId)
      .then(setApiCourse)
      .catch((e) => setApiError(e.message));
  }, [USE_API, courseId, activeTab]);
  const course = useMemo(() => {
    if (!courseId) return null;
    if (USE_API) {
      if (apiError) return null;
      if (!apiCourse) return null;
      return mergeApiCourseWithStores(apiCourse, studentId);
    }
    return null;
  }, [courseId, USE_API, apiCourse, apiError, studentId]);

  if (!courseId) {
    return (
      <div className="p-6">
        <div className="text-gray-600">Invalid course.</div>
      </div>
    );
  }

  if (USE_API && apiCourse === null && !apiError) {
    return (
      <div className="p-6">
        <div className="flex justify-center py-12">
          <div className="animate-pulse text-gray-500">Loading course…</div>
        </div>
      </div>
    );
  }

  if (USE_API && apiError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-700 rounded-lg p-4 mb-6">
          {apiError}
        </div>
        <Link href="/courses">
          <a className="text-gray-700 hover:underline">Back to Courses</a>
        </Link>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-md p-12 text-center max-w-2xl mx-auto mt-20">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Course not found
          </h1>
          <Link href="/">
            <a className="inline-block px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
              Back to Dashboard
            </a>
          </Link>
        </div>
      </div>
    );
  }

  let content = null;
  switch (activeTab) {
    case "home":
      content = <HomeTab course={course} />;
      break;
    case "announcements":
      content = <AnnouncementsTab course={course} />;
      break;
    case "discussions":
      content = <DiscussionsTab course={course} />;
      break;
    case "assignments":
      content = <AssignmentsTab course={course} studentId={studentId} />;
      break;
    case "modules":
      content = <ModulesTab course={course} />;
      break;
    case "syllabus":
      content = <SyllabusTab course={course} studentId={studentId} />;
      break;
    case "files":
      content = <FilesTab course={course} />;
      break;
    case "grades":
      content = <GradesTab course={course} studentId={studentId} />;
      break;
    case "people":
      content = <PeopleTab course={course} />;
      break;
    default:
      content = <HomeTab course={course} />;
  }

  return (
    <div className="p-6">
      <Breadcrumb course={course} />
      <CourseHeader course={course} />
      <CourseTabs courseId={course.id} activeTab={activeTab} />
      <div>{content}</div>
    </div>
  );
}
