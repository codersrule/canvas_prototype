import React, { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { coursesData } from "../data/classroomData.js";
import { api } from "../api/client.js";

const USE_API = !!import.meta.env.VITE_API_URL;

function CourseCard({ course }) {
  return (
    <Link href={`/course/${course.id}`}>
      <a
        className="course-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
        aria-label={`Open ${course.name}`}
      >
        <div
          className={`h-32 bg-gradient-to-r ${course.color} p-4 text-white flex flex-col justify-between`}
        >
          <div className="text-sm opacity-90">{course.code}</div>
          <div className="text-lg font-semibold line-clamp-2">{course.name}</div>
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

function AddCourseCard({ course, onAdd, adding }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div
        className={`h-32 bg-gradient-to-r ${course.color} p-4 text-white flex flex-col justify-between`}
      >
        <div className="text-sm opacity-90">{course.code}</div>
        <div className="text-lg font-semibold line-clamp-2">{course.name}</div>
      </div>
      <div className="p-4 flex justify-between items-center">
        <span className="text-sm text-gray-600 truncate">{course.professor}</span>
        <button
          type="button"
          onClick={() => onAdd(course.id)}
          disabled={adding}
          className="shrink-0 ml-2 px-4 py-2 bg-gray-700 text-white text-sm font-medium rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {adding ? "Adding…" : "Add"}
        </button>
      </div>
    </div>
  );
}

export function CoursesPage() {
  const [courses, setCourses] = useState(USE_API ? null : coursesData);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [addSearch, setAddSearch] = useState("");
  const [available, setAvailable] = useState([]);
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    if (!USE_API) return;
    api
      .getCourses()
      .then(setCourses)
      .catch((e) => setError(e.message));
  }, []);

  const fetchAvailable = () => {
    if (!USE_API) return;
    api.getAvailableCourses(addSearch).then(setAvailable).catch(() => setAvailable([]));
  };

  useEffect(() => {
    if (!USE_API) return;
    const t = setTimeout(fetchAvailable, 300);
    return () => clearTimeout(t);
  }, [USE_API, addSearch]);

  const handleAdd = async (courseId) => {
    if (!USE_API) return;
    setAddingId(courseId);
    try {
      await api.enrollInCourse(courseId);
      setCourses((prev) => {
        const added = available.find((c) => c.id === courseId);
        return added ? [...(prev || []), added] : prev;
      });
      setAvailable((prev) => prev.filter((c) => c.id !== courseId));
    } catch (e) {
      // optional: show toast
    } finally {
      setAddingId(null);
    }
  };

  const list = USE_API ? courses : coursesData;
  const filtered = useMemo(() => {
    if (!search.trim()) return list || [];
    const q = search.toLowerCase().trim();
    return (list || []).filter(
      (c) =>
        (c.code && c.code.toLowerCase().includes(q)) ||
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.professor && c.professor.toLowerCase().includes(q))
    );
  }, [list, search]);

  if (USE_API && courses === null && !error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Courses</h1>
        <div className="flex justify-center py-12">
          <div className="animate-pulse text-gray-500">Loading courses…</div>
        </div>
      </div>
    );
  }

  if (USE_API && error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Courses</h1>
        <div className="bg-red-50 text-red-700 rounded-lg p-4 mb-6">{error}</div>
        <Link href="/">
          <a className="text-gray-700 hover:underline">Back to Dashboard</a>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
        <div className="relative">
          <input
            type="search"
            placeholder="Search your courses…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none bg-white text-gray-900 placeholder:text-gray-500"
            aria-label="Search courses"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
        {filtered.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-gray-500 mb-10">
          {search ? "No courses match your search." : "You have no courses yet."}
        </p>
      )}

      {USE_API && (
        <section className="border-t border-gray-200 pt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add a Course</h2>
          <p className="text-sm text-gray-600 mb-4">
            Search for available courses and add them to your list.
          </p>
          <div className="relative max-w-md mb-6">
            <input
              type="search"
              placeholder="Search course code, name, or professor…"
              value={addSearch}
              onChange={(e) => setAddSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none bg-white text-gray-900 placeholder:text-gray-500"
              aria-label="Search available courses"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {available.map((course) => (
              <AddCourseCard
                key={course.id}
                course={course}
                onAdd={handleAdd}
                adding={addingId === course.id}
              />
            ))}
          </div>
          {available.length === 0 && addSearch && (
            <p className="text-gray-500">No available courses match your search.</p>
          )}
          {available.length === 0 && !addSearch && (
            <p className="text-gray-500">All available courses are already in your list.</p>
          )}
        </section>
      )}
    </div>
  );
}
