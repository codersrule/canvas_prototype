/**
 * API client for Classroom backend.
 * Uses VITE_API_URL in production; falls back to mock data when API is unavailable.
 *
 * On Render (or any static host): set VITE_API_URL to your Web Service URL
 * (e.g. https://your-api.onrender.com) in the static site's **Environment** so it
 * is available at **build** time, then redeploy.
 */

const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:3001"
).replace(/\/$/, "");

function getToken() {
  try {
    const auth = localStorage.getItem("classroom_auth");
    if (!auth) return null;
    const parsed = JSON.parse(auth);
    return parsed.token ?? null;
  } catch {
    return null;
  }
}

function networkErrorMessage() {
  const prod = import.meta.env.PROD;
  const pointsToLocal =
    API_BASE.includes("localhost") || API_BASE.includes("127.0.0.1");
  if (prod && pointsToLocal) {
    return `Cannot reach the API at ${API_BASE}. In production, set environment variable VITE_API_URL to your Render Web Service URL (https://your-api.onrender.com) on the static site, then redeploy so the build embeds it.`;
  }
  return `Cannot reach the API at ${API_BASE}. Confirm the backend is running on Render, the URL is correct, and use HTTPS for both site and API.`;
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch (e) {
    const msg =
      e?.message === "Failed to fetch"
        ? networkErrorMessage()
        : e?.message || "Network error";
    throw new Error(msg);
  }

  if (res.status === 401) {
    localStorage.removeItem("classroom_auth");
    throw new Error("Session expired");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    // validate middleware returns { errors: [{field, message}] }; other routes return { error: 'string' }
    if (body.errors && Array.isArray(body.errors)) {
      throw new Error(
        body.errors.map((e) => e.message).join(", ") ||
          `Request failed: ${res.status}`,
      );
    }
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  return res.json().catch(() => ({}));
}

export const api = {
  async login(email, password) {
    return request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async getMe() {
    return request("/api/auth/me");
  },

  async getCourses(role) {
    const qs = role === "teacher" ? "?role=teacher" : "";
    return request(`/api/courses${qs}`);
  },

  async getCourse(id) {
    return request(`/api/courses/${id}`);
  },

  async getAvailableCourses(query = "") {
    const qs = query ? `?q=${encodeURIComponent(query)}` : "";
    return request(`/api/courses/available${qs}`);
  },

  async enrollInCourse(courseId) {
    return request(`/api/courses/${courseId}/enroll`, { method: "POST" });
  },

  async createAssignment(courseId, { title, description, dueDate, points }) {
    return request(`/api/courses/${courseId}/assignments`, {
      method: "POST",
      body: JSON.stringify({ title, description, dueDate, points }),
    });
  },

  // Multipart version used when files are attached
  async createAssignmentForm(courseId, formData) {
    const token = getToken();
    const headers = {
      ...(token && { Authorization: `Bearer ${token}` }),
      // Do NOT set Content-Type — browser sets it with the multipart boundary
    };
    let res;
    try {
      res = await fetch(`${API_BASE}/api/courses/${courseId}/assignments`, {
        method: "POST",
        headers,
        body: formData,
      });
    } catch (e) {
      const msg =
        e?.message === "Failed to fetch"
          ? networkErrorMessage()
          : e?.message || "Network error";
      throw new Error(msg);
    }
    if (res.status === 401) {
      localStorage.removeItem("classroom_auth");
      throw new Error("Session expired");
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      if (body.errors && Array.isArray(body.errors)) {
        throw new Error(
          body.errors.map((e) => e.message).join(", ") ||
            `Request failed: ${res.status}`,
        );
      }
      throw new Error(body.error || `Request failed: ${res.status}`);
    }
    return res.json().catch(() => ({}));
  },

  async createAnnouncement(courseId, { title, content }) {
    return request(`/api/courses/${courseId}/announcements`, {
      method: "POST",
      body: JSON.stringify({ title, content }),
    });
  },

  async getDashboard() {
    return request("/api/dashboard");
  },

  async getNotifications(role) {
    const qs = role === "teacher" ? "?role=teacher" : "";
    return request(`/api/notifications${qs}`);
  },

  async getGroups() {
    return request("/api/groups");
  },

  async getInbox() {
    return request("/api/inbox");
  },

  async markConversationRead(id) {
    return request(`/api/inbox/${id}/read`, { method: "PATCH" });
  },

  async toggleConversationStar(id) {
    return request(`/api/inbox/${id}/star`, { method: "PATCH" });
  },

  async addMessage(conversationId, body) {
    return request(`/api/inbox/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ body }),
    });
  },

  async getCoursePeople(courseId) {
    return request(`/api/courses/${courseId}/people`);
  },

  async getCourseFiles(courseId) {
    return request(`/api/courses/${courseId}/files`);
  },

  async getCourseDiscussions(courseId) {
    return request(`/api/courses/${courseId}/discussions`);
  },

  async getDiscussion(courseId, discussionId) {
    return request(`/api/courses/${courseId}/discussions/${discussionId}`);
  },

  async addDiscussionComment(courseId, discussionId, { text, parentId }) {
    return request(`/api/courses/${courseId}/discussions/${discussionId}/comments`, {
      method: "POST",
      body: JSON.stringify({ text, parentId }),
    });
  },

  async submitAssignment(courseId, assignmentId, { text, fileName }) {
    return request(`/api/courses/${courseId}/assignments/${assignmentId}/submission`, {
      method: "POST",
      body: JSON.stringify({ text, fileName }),
    });
  },

  async getCourseAnalytics(courseId) {
    return request(`/api/courses/${courseId}/analytics`);
  },
};
