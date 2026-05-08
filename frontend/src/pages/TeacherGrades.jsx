import React, { useMemo, useState, useEffect } from "react";
import { Link } from "wouter";
import { api } from "../api/client.js";

export function TeacherGradesPage() {
  const [apiCourses, setApiCourses] = useState(null);
  const [analyticsByCourse, setAnalyticsByCourse] = useState({});
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    api
      .getCourses("teacher")
      .then((courses) => {
        setApiCourses(courses);
        return Promise.all(
          courses.map((course) =>
            api
              .getCourseAnalytics(course.id)
              .then((analytics) => [course.id, analytics])
              .catch(() => [course.id, null]),
          ),
        );
      })
      .then((entries) => {
        if (entries) setAnalyticsByCourse(Object.fromEntries(entries));
      })
      .catch((e) => setApiError(e.message));
  }, []);

  const courses = useMemo(() => {
    return apiCourses || [];
  }, [apiCourses]);

  const totalPending = 0;

  return (
    <div className="p-6">
      {apiError && (
        <div className="bg-red-50 text-red-700 rounded-lg p-4 mb-6">
          {apiError}
        </div>
      )}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Grades</h1>
        <p className="text-sm text-gray-600 mt-1">
          Overview of grades across your courses • {totalPending} assignments
          pending review
        </p>
      </div>

      <div className="space-y-4">
        {courses.map((course) => {
          const analytics = analyticsByCourse[course.id] || {};
          const pending = 0;
          const avg = analytics.averageGrade ?? 0;
          const dist = analytics.gradeDistribution || {};
          const totalStudents = analytics.totalStudents || 0;

          return (
            <Link
              key={course.id}
              href={`/teacher/course/${course.id}/analytics`}
            >
              <a className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200 hover:border-gray-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold bg-linear-to-r ${course.color || "from-gray-500 to-gray-600"}`}
                    >
                      {course.code?.split(" ")[0] || "?"}
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900">
                        {course.code} - {course.name}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {totalStudents} students • {course.term}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {typeof avg === "number" ? avg.toFixed(1) : avg}%
                    </p>
                    <p className="text-xs text-gray-500">Average grade</p>
                    {pending > 0 && (
                      <span className="inline-block mt-2 px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">
                        {pending} to grade
                      </span>
                    )}
                  </div>
                </div>
                {Object.keys(dist).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex gap-4 flex-wrap">
                      {["A", "B", "C", "D", "F"].map((g) => (
                        <span key={g} className="text-sm text-gray-600">
                          {g}: {dist[g] || 0}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </a>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
