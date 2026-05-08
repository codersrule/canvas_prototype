import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";

function formatParticipants(participants) {
  if (participants.length === 1) return participants[0];
  if (participants.length === 2) return participants.join(", ");
  return `${participants[0]}, ${participants[1]} +${participants.length - 2}`;
}

function formatDateShort(dateValue) {
  const date = new Date(dateValue);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  if (diffDays < 7) {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatMessageDate(dateValue) {
  const date = new Date(dateValue);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function InboxPage() {
  const [allConversations, setAllConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [courseFilter, setCourseFilter] = useState("all");
  const [folderFilter, setFolderFilter] = useState("inbox");
  const [search, setSearch] = useState("");
  const [replyText, setReplyText] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getInbox()
      .then((rows) => {
        setAllConversations(rows);
        setSelectedId((current) => current ?? rows[0]?.id ?? null);
      })
      .catch((e) => setError(e.message));
  }, []);

  const courses = useMemo(() => {
    const names = new Set(
      allConversations.map((c) => c.course).filter(Boolean),
    );
    return [...names].map((name) => ({ id: name, name }));
  }, [allConversations]);

  const conversations = useMemo(() => {
    let list = allConversations;
    if (courseFilter !== "all") {
      list = list.filter((c) => c.course === courseFilter);
    }
    if (folderFilter === "starred") {
      list = list.filter((c) => c.starred);
    }
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.subject.toLowerCase().includes(s) ||
          c.preview.toLowerCase().includes(s) ||
          c.participants.some((p) => p.toLowerCase().includes(s)),
      );
    }
    return list;
  }, [allConversations, courseFilter, folderFilter, search]);

  const selectedConversation = selectedId
    ? allConversations.find((c) => c.id === selectedId)
    : null;

  const onSelectConversation = (id) => {
    setSelectedId(id);
    setAllConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: false } : c)),
    );
    api.markConversationRead(id).catch(() => {});
  };

  const onToggleStar = (id) => {
    setAllConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, starred: !c.starred } : c)),
    );
    api.toggleConversationStar(id).catch(() => {});
  };

  const onSendReply = async () => {
    if (!selectedConversation || !replyText.trim()) return;
    const body = replyText.trim();
    setReplyText("");
    try {
      const message = await api.addMessage(selectedConversation.id, body);
      setAllConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversation.id
            ? {
                ...c,
                preview: message.body,
                date: message.date,
                messages: [...c.messages, message],
              }
            : c,
        ),
      );
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 shrink-0 p-3 md:p-4 space-y-3">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex flex-wrap gap-2 md:gap-3">
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 flex-1 md:flex-none md:min-w-[180px] bg-white text-gray-900"
          >
            <option value="all">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={folderFilter}
            onChange={(e) => setFolderFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 flex-1 md:flex-none md:min-w-[150px] bg-white text-gray-900"
          >
            <option value="inbox">Inbox</option>
            <option value="starred">Starred</option>
          </select>
          <div className="flex-1 md:flex-none md:min-w-[250px]">
            <input
              type="text"
              placeholder="Search messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white text-gray-900 placeholder:text-gray-500"
            />
          </div>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {conversations.length} conversation
            {conversations.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-full md:w-96 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                <svg
                  className="w-16 h-16 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293L7.293 13.293A1 1 0 006.586 13H4"
                  />
                </svg>
                <p className="text-sm">No conversations found</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const isSelected = selectedId === conv.id;
                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => onSelectConversation(conv.id)}
                    className={`w-full text-left border-b border-gray-100 p-3 conversation-item ${
                      isSelected
                        ? "bg-gray-50 border-l-4 border-l-gray-600"
                        : "bg-white"
                    } ${conv.unread ? "font-semibold" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-600 text-white flex items-center justify-center font-semibold text-sm">
                        {getInitials(conv.participants[0])}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="text-sm truncate">
                            {formatParticipants(conv.participants)}
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatDateShort(conv.date)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-900 mb-1 truncate">
                          {conv.subject}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-xs text-gray-600 truncate flex-1">
                            {conv.preview}
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleStar(conv.id);
                            }}
                            className={`star-btn ${
                              conv.starred ? "text-yellow-400" : "text-gray-400"
                            }`}
                          >
                            <svg
                              className="w-4 h-4"
                              fill={conv.starred ? "currentColor" : "none"}
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.575 9.101C1.792 8.53 2.194 7.29 3.163 7.29h4.914a1 1 0 00.951-.69l1.519-4.674z"
                              />
                            </svg>
                          </button>
                        </div>
                        {conv.course && (
                          <div className="mt-2">
                            <span className="inline-block text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded">
                              {conv.course}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="hidden md:flex flex-col flex-1 bg-white">
          {!selectedConversation ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <svg
                  className="w-20 h-20 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  No Conversation Selected
                </p>
                <p className="text-sm text-gray-500">
                  Select a conversation to view messages
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  {selectedConversation.subject}
                </h2>
                <p className="text-sm text-gray-600">
                  {formatParticipants(selectedConversation.participants)}
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedConversation.messages.map((m) => (
                  <div key={m.id} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-600 text-white flex items-center justify-center font-semibold text-sm">
                      {getInitials(m.sender)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-gray-900 text-sm">
                          {m.sender}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatMessageDate(m.date)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap wrap-break-word">
                        {m.body}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-200">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 resize-y min-h-[80px]"
                />
                <div className="flex justify-end mt-3">
                  <button
                    type="button"
                    onClick={onSendReply}
                    className="px-4 py-2 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600 flex items-center gap-2"
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
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                    Send
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
