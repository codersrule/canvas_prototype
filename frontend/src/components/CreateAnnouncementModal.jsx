import React, { useState } from "react";
import { api } from "../api/client.js";

export function CreateAnnouncementModal({
  courseId,
  courses,
  onClose,
  onSaved,
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
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

    try {
      await api.createAnnouncement(effectiveCourseId, {
        title: title.trim(),
        content: content.trim() || undefined,
      });

      setToast(true);
      setTimeout(() => {
        setToast(false);
        onSaved?.();
        onClose();
      }, 600);
    } catch (err) {
      setError(err.message || "Failed to post announcement");
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
      aria-labelledby="create-announcement-title"
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2
            id="create-announcement-title"
            className="text-lg font-semibold text-gray-900"
          >
            Create Announcement
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
                placeholder="Announcement title"
                maxLength={200}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 resize-y"
                placeholder="Write your announcement..."
                maxLength={10000}
              />
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
              {saving ? "Posting…" : "Post Announcement"}
            </button>
          </div>
        </form>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-gray-900 text-white rounded-lg text-sm font-medium z-60">
          Announcement posted
        </div>
      )}
    </div>
  );
}
