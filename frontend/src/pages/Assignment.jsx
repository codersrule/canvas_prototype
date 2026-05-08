import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useRoute } from "wouter";
import { useAuth } from "../contexts/AuthContext.jsx";
import { api } from "../api/client.js";

const USE_API = true;

function AssignmentBreadcrumb({ course, assignment }) {
  return (
    <nav className="mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center flex-wrap gap-x-2 gap-y-1 text-sm text-gray-600">
        <li>
          <Link href="/">Dashboard</Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link href={`/course/${course.id}`}>{course.code}</Link>
        </li>
        <li aria-hidden="true">/</li>
        <li className="font-medium text-gray-900">{assignment.title}</li>
      </ol>
    </nav>
  );
}

function getGradeColorClass(grade, total) {
  const pct = total > 0 ? (grade / total) * 100 : 0;
  if (pct >= 90) return "text-green-600";
  if (pct >= 80) return "text-gray-700";
  if (pct >= 70) return "text-yellow-600";
  return "text-red-600";
}

function SubmissionModal({ course, assignment, onClose, onSubmitted }) {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setFileName(file ? file.name : null);
  };

  const handleSubmit = async () => {
    if (!text.trim() && !fileName) return;
    await api.submitAssignment(course.id, assignment.id, {
      text: text.trim() || null,
      fileName: fileName || null,
    });
    onSubmitted();
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  useEffect(() => {
    const onEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="submission-modal-title"
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <h2
            id="submission-modal-title"
            className="text-xl font-semibold text-gray-900"
          >
            Submit Assignment
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              {assignment.title}
            </h3>
            <p className="text-sm text-gray-600">
              {course.code} • Due: {assignment.dueDate}
            </p>
          </div>

          <div className="mb-6">
            <label
              htmlFor="submission-text"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Text Submission
            </label>
            <textarea
              id="submission-text"
              rows={8}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
              placeholder="Type your response here..."
            />
            <p className="text-xs text-gray-500 mt-1">
              You can paste your work or type directly into this box.
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload File (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <svg
                className="w-12 h-12 text-gray-400 mx-auto mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <input
                key={fileInputKey}
                type="file"
                id="submission-file"
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.zip,.py,.java,.cpp,.c,.js"
                onChange={handleFileChange}
              />
              <label htmlFor="submission-file" className="cursor-pointer">
                <span className="text-gray-700 hover:text-gray-800 font-medium">
                  Choose a file
                </span>
                <span className="text-gray-600"> or drag and drop</span>
              </label>
              <p className="text-xs text-gray-500 mt-2">
                PDF, Word, Text, Code, or ZIP files
              </p>
            </div>
            {fileName && (
              <div className="mt-2 flex items-center gap-2 p-2 bg-gray-100 border border-gray-200 rounded-lg">
                <svg
                  className="w-5 h-5 text-gray-700 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="flex-1 text-sm truncate">{fileName}</span>
                <button
                  type="button"
                  onClick={() => {
                    setFileName(null);
                    setFileInputKey((k) => k + 1);
                  }}
                  className="text-red-600 hover:text-red-700 p-1"
                  aria-label="Remove file"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
            <svg
              className="w-5 h-5 text-amber-600 shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-amber-900">
                Before you submit
              </p>
              <p className="text-xs text-amber-800 mt-1">
                Make sure you've reviewed your work. You cannot edit your
                submission after submitting.
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!text.trim() && !fileName}
            className="px-5 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            Submit Assignment
          </button>
        </div>
      </div>
    </div>
  );
}

function AssignmentNotFound({ course }) {
  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md p-12 text-center max-w-2xl mx-auto mt-20">
        <svg
          className="w-24 h-24 text-gray-400 mx-auto mb-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Assignment not found</p>
        <div className="flex flex-wrap justify-center gap-3">
          {course && (
            <Link href={`/course/${course.id}/assignments`}>
              <a className="inline-block px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                Back to Assignments
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
  );
}

function mergeApiAssignmentWithStores(apiAssignment, courseId, studentId) {
  if (!apiAssignment) return apiAssignment;
  return apiAssignment;
}

export function AssignmentPage() {
  const [, params] = useRoute("/course/:courseId/assignment/:assignmentId");
  const courseId = params?.courseId;
  const assignmentId = params?.assignmentId;

  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [apiCourse, setApiCourse] = useState(null);
  const [apiError, setApiError] = useState(null);

  const { user } = useAuth();
  const studentId = user?.studentId;

  useEffect(() => {
    if (!USE_API || !courseId) return;
    setApiError(null);
    api
      .getCourse(courseId)
      .then(setApiCourse)
      .catch((e) => setApiError(e.message));
  }, [USE_API, courseId]);

  const { course, assignment, effective } = useMemo(() => {
    if (!courseId) return { course: null, assignment: null, effective: null };
    if (USE_API) {
      if (apiError || !apiCourse) {
        const fallbackCourse = apiError ? null : undefined;
        return { course: fallbackCourse, assignment: null, effective: null };
      }
      const merged = {
        ...apiCourse,
        assignments: (apiCourse.assignments || []).map((a) =>
          mergeApiAssignmentWithStores(a, courseId, studentId),
        ),
      };
      const baseAssignments = merged.assignments || [];
      const allAssignments = baseAssignments;
      const a = allAssignments.find(
        (x) => String(x.id) === String(assignmentId),
      );
      const eff = a || null;
      return { course: merged, assignment: a, effective: eff };
    }
    return { course: null, assignment: null, effective: null };
  }, [courseId, assignmentId, USE_API, apiCourse, apiError, studentId]);

  const onSubmitted = useCallback(() => {
    setToast("Assignment submitted successfully!");
    setRefresh((r) => r + 1);
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  if (USE_API && apiCourse === null && !apiError) {
    return (
      <div className="p-6">
        <div className="flex justify-center py-12 text-gray-500">Loading…</div>
      </div>
    );
  }

  if (USE_API && apiError) {
    return <AssignmentNotFound course={null} />;
  }

  if (!course || !assignment) return <AssignmentNotFound course={course} />;

  const isSubmitted = effective?.submitted;
  const submission = effective?.submission;
  const grade = effective?.grade;
  const points = effective?.points;

  return (
    <div className="p-6">
      <AssignmentBreadcrumb course={course} assignment={effective} />

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className={`bg-linear-to-r ${course.color} p-6 text-white`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="text-sm opacity-90 mb-1">{course.code}</div>
              <h1 className="text-2xl font-bold">{effective.title}</h1>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{points}</div>
              <div className="text-sm opacity-90">points</div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-200">
            <div>
              <div className="text-sm text-gray-600 mb-1">Due Date</div>
              <div className="text-lg font-semibold text-gray-900">
                {assignment.dueDate}
              </div>
            </div>
            <div className="text-right">
              {isSubmitted ? (
                grade != null ? (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Your Grade</div>
                    <div
                      className={`text-3xl font-bold ${getGradeColorClass(grade, points)}`}
                    >
                      {grade}/{points}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {((grade / points) * 100).toFixed(1)}%
                    </div>
                  </div>
                ) : (
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                    Submitted – Pending Grading
                  </span>
                )
              ) : (
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  Not Submitted
                </span>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Instructions
            </h2>
            <div className="prose prose-sm max-w-none text-gray-700">
              {assignment.description ||
                "No description provided for this assignment."}
            </div>
          </div>

          {isSubmitted ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex gap-4">
              <svg
                className="w-6 h-6 text-green-600 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  Assignment Submitted
                </h3>
                <p className="text-sm text-green-800 mb-3">
                  {submission?.submittedAt
                    ? `You submitted this assignment on ${new Date(submission.submittedAt).toLocaleString()}.`
                    : "You have submitted this assignment."}
                </p>
                {submission?.text && (
                  <div className="bg-white border border-green-200 rounded-lg p-4 mb-3">
                    <div className="text-xs font-medium text-gray-600 mb-2">
                      Your Submission:
                    </div>
                    <div className="text-sm text-gray-900 whitespace-pre-wrap">
                      {submission.text}
                    </div>
                  </div>
                )}
                {submission?.fileName && (
                  <div className="flex items-center text-sm text-green-800 gap-2">
                    <svg
                      className="w-4 h-4 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                      />
                    </svg>
                    <span className="truncate">
                      File: {submission.fileName}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Submit Your Work
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                Submit your assignment before the due date to receive credit.
              </p>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                Submit Assignment
              </button>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/course/${course.id}/assignments`}>
              <a className="inline-block px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                Back to Assignments
              </a>
            </Link>
            <Link href={`/course/${course.id}`}>
              <a className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Back to Course
              </a>
            </Link>
          </div>
        </div>
      </div>

      {modalOpen && (
        <SubmissionModal
          course={course}
          assignment={assignment}
          onClose={() => setModalOpen(false)}
          onSubmitted={onSubmitted}
        />
      )}

      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-gray-900 text-white rounded-lg shadow-lg text-sm font-medium z-50 animate-in fade-in duration-200"
          role="status"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
