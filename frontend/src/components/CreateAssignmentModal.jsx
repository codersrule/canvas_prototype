import React, { useState } from "react";
import { addAssignment } from "../data/createdContentStore.js";
import { api } from "../api/client.js";

const USE_API = !!import.meta.env.VITE_API_URL;

export function CreateAssignmentModal({ courseId, courses, onClose, onSaved }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [points, setPoints] = useState("100");
  const [selectedCourseId, setSelectedCourseId] = useState(
    courseId ?? courses?.[0]?.id ?? null,
  );
  const [toast, setToast] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const effectiveCourseId = courseId ?? selectedCourseId;
  const showCourseSelect = !courseId && courses?.length > 1;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !effectiveCourseId) return;
    setError(null);
    setSaving(true);

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      // datetime-local gives "YYYY-MM-DDTHH:mm" — append Z so it round-trips as UTC
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      points: points ? parseInt(points, 10) : 100,
    };

    try {
      if (USE_API) {
        await api.createAssignment(effectiveCourseId, payload);
      } else {
        // Offline / dev fallback: write to in-memory store so student view
        // still picks it up within the same session.
        addAssignment(effectiveCourseId, payload);
      }

      setToast(true);
      setTimeout(() => {
        setToast(false);
        onSaved?.();
        onClose();
      }, 600);
    } catch (err) {
      setError(err.message || "Failed to create assignment");
    } finally {
      setSaving(false);
    }
  };

  const handleBackdrop = (e) => e.target === e.currentTarget && onClose();

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-assignment-title"
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2
            id="create-assignment-title"
            className="text-lg font-semibold text-gray-900"
          >
            Add Assignment
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
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

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {showCourseSelect && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course
                </label>
                <select
                  value={selectedCourseId ?? ""}
                  onChange={(e) => setSelectedCourseId(e.target.value || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                  required
                >
                  {courses?.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.code} – {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                placeholder="Assignment title"
                maxLength={200}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 resize-y"
                placeholder="Assignment instructions..."
                maxLength={5000}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due date & time
                </label>
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Points
                </label>
                <input
                  type="number"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  min={0}
                  max={10000}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                  placeholder="100"
                />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || saving}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 font-medium"
            >
              {saving ? "Creating…" : "Create Assignment"}
            </button>
          </div>
        </form>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-gray-900 text-white rounded-lg text-sm font-medium z-60">
          Assignment created
        </div>
      )}
    </div>
  );
}
