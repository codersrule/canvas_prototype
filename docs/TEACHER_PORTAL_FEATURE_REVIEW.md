# Teacher Portal Feature Review

**Date:** February 11, 2026  
**Scope:** React frontend teacher routes, Teacher Dashboard, Teacher Course, Teacher Settings, and related components

---

## 1. Executive Summary

The teacher portal provides Dashboard, Course detail (Overview, Students, Grading, Analytics, Content), Create Announcement/Assignment modals, Grading modal, and Settings. All data is **mock-only** — no API integration. Teacher Inbox and Calendar reuse the student pages. Several buttons and links are non-functional, and API mode is not supported for teachers.

---

## 2. Routes & Navigation

| Route | Component | Status |
|-------|-----------|--------|
| `/teacher` | TeacherDashboardPage | ✅ |
| `/teacher/inbox` | InboxPage (shared with student) | ⚠️ See 5.1 |
| `/teacher/calendar` | CalendarPage (shared with student) | ⚠️ See 5.1 |
| `/teacher/settings` | TeacherSettingsPage | ✅ |
| `/teacher/course/:id` | TeacherCoursePage | ⚠️ See 6.1 |
| `/teacher/course/:id/:tab` | TeacherCoursePage | ⚠️ See 6.1 |

**Sidebar (teacher mode):** Dashboard, Inbox, Calendar, Settings, Log out.

---

## 3. Teacher Dashboard (`TeacherDashboard.jsx`)

### 3.1 Implemented

- Welcome banner with teacher name (`useAuth()`)
- Stat boxes: Total Students, Pending Grading (clickable → grading), Avg Attendance
- My Courses: links to `/teacher/course/:id`
- Recent Activity: mock activity feed
- Quick Actions: Create Announcement, Create Assignment, Schedule Office Hours (→ `/teacher/settings`)
- Pending Reviews: list with "View All" → grading
- Upcoming Deadlines: progress bars

### 3.2 Gaps

| Issue | Severity | Description |
|-------|----------|-------------|
| Mock-only; no API | **High** | Uses `TEACHING_COURSES = [1,2,3,4,5,6]` and `getCourseById(id)`. When API is enabled, teacher courses from backend (e.g. `ics31`, `math2d`) are never fetched. |
| Schedule Office Hours → Settings | Low | Links to `/teacher/settings`. Settings has no "Schedule Office Hours" UI — just notifications, display, profile. |
| Recent Activity not clickable | Low | Items are static; no link to submission, grade, or discussion. |
| Upcoming Deadlines not clickable | Low | No link to assignment or grading queue. |
| Courses 3–6 have no analytics | Medium | `courseAnalytics` and `pendingGrading` only have data for courses 1 and 2. Courses 3–6 show zeros/empty. |

---

## 4. Teacher Course (`TeacherCourse.jsx`)

### 4.1 Tabs

| Tab | Behavior | Notes |
|-----|----------|-------|
| Overview | Stats, grade distribution, pending grading, quick actions | ✅ |
| Students | Roster with stats (avg, highest, lowest, passing rate) | ⚠️ See 4.2 |
| Grading | Queue of pending submissions; "Grade Now" opens modal | ✅ |
| Analytics | Recharts: grade distribution, completion pie, deadlines bar, metrics | ✅ |
| Content | Files tab (mock files, empty state) | ✅ |

### 4.2 Critical Gaps

| Issue | Severity | Description |
|-------|----------|-------------|
| **courseId always parsed as Number** | **High** | `courseId = Number(idStr)`. For `/teacher/course/ics31`, `Number("ics31")` → `NaN` → `getCourseById(NaN)` → `null` → "Course not found". Teacher course page does not work in API mode. |
| **No API fetch for course** | **High** | Always uses `getCourseById(courseId)` from `courseDetails`. No `api.getCourse(id)` for teachers. |
| Message Students | Medium | Button has no `onClick` or handler. |
| Course Settings | Medium | Button in banner has no `onClick` or link. |
| View Details (Students) | Low | "View Details" per student does nothing. |
| Search students | Low | Input is `disabled`. |
| Export (Students) | Low | Button does not export. |
| Grading filters | Low | "All Assignments" and "Sort by: Date" selects are `disabled`. |

### 4.3 Grading Modal

- Persists grades via `gradeStore.setGrade()` — students see them. ✅
- Preview of submitted files (text/code). ✅
- Feedback text area. ✅

### 4.4 Create Modals

- **CreateAnnouncementModal** / **CreateAssignmentModal**: Use `createdContentStore.addAnnouncement` / `addAssignment` with `effectiveCourseId`. Course select uses `Number(e.target.value)` — would fail for string IDs. Modals are session-only; no API persistence.

---

## 5. Teacher Inbox & Calendar

### 5.1 Shared with Student

- `/teacher/inbox` → same `InboxPage` as student (mock conversations).
- `/teacher/calendar` → same `CalendarPage` as student (assignments from `courseDetails`).

**Gaps:** No teacher-specific view. Teacher might expect inbox filtered by "messages from students" or calendar showing teaching schedule. Currently identical to student experience.

---

## 6. Teacher Settings (`TeacherSettings.jsx`)

### 6.1 Implemented

- Profile: name, email (read-only, from `teacherUser`)
- Notifications: email, push, submission alerts, grading reminders, student messages, digest frequency
- Display: timezone, language, dark mode
- Persists to `localStorage` under `classroom_teacher_settings`

### 6.2 Gaps

| Issue | Severity | Description |
|-------|----------|-------------|
| Hardcoded user | Medium | Uses `teacherUser` (Prof. Sarah Chen), not `useAuth()`. Logged-in teacher name is ignored. |
| No Schedule Office Hours | Low | "Schedule Office Hours" link from dashboard goes here, but there is no office hours section. |
| Profile not editable | Low | Display name and email are disabled. |
| No API sync | Medium | All settings are local-only. |

---

## 7. Data Flow Summary

| Source | Scope | Used By | API |
|--------|-------|---------|-----|
| `courseDetails` / `getCourseById` | Course detail | Dashboard, Course | No |
| `teacherData.js` | Analytics, students, pending grading | Dashboard, Course | No |
| `createdContentStore` | Announcements, assignments | Create modals, Course | No |
| `gradeStore` | Grades | Grading modal, student views | No |
| `filesData` | File metadata | Content tab | No |

**No teacher-specific API routes** in the backend. Auth supports teacher role, but courses are fetched via the same `/api/courses` and `/api/courses/:id` used for students. Teacher enrollment exists in seed (teacher enrolled in `ics31`, `math2d`) but the frontend never calls the API for teacher mode.

---

## 8. API Mode vs Mock Mode

| Area | Mock Mode | API Mode |
|------|-----------|----------|
| Dashboard courses | `getCourseById(1..6)` | Same — API never used |
| Course detail | `getCourseById(id)` | Fails for string IDs (e.g. `ics31`) |
| Analytics, students, grading | `teacherData` (courses 1, 2 only) | Same |
| Create announcement/assignment | `createdContentStore` | Same; course select breaks for string IDs |

---

## 9. Non-Functional or Placeholder Elements

| Element | Location | Status |
|---------|----------|--------|
| Message Students | Overview quick actions | No handler |
| Course Settings | Course banner | No handler |
| View Details | Students tab | No handler |
| Search students | Students tab | `disabled` |
| Export | Students tab | No export logic |
| Grading filters | Grading tab | `disabled` |
| Schedule Office Hours | Settings | No UI; link goes to settings page |

---

## 10. Recommended Fix Order

1. ~~**Teacher Course: API mode**~~ ✅ FIXED — Fetches `api.getCourse(courseId)` when USE_API; supports string IDs.
2. ~~**Teacher Dashboard: API courses**~~ ✅ FIXED — Fetches `api.getCourses('teacher')` when USE_API.
3. ~~**Teacher Settings: use `useAuth()`**~~ ✅ FIXED — Uses logged-in user for profile display.
4. ~~**Create modals: string course IDs**~~ ✅ FIXED — Course select supports string and numeric IDs.
5. ~~**teacherData: courses 3–6**~~ ✅ FIXED — `getCourseAnalytics` returns default object when no data.
6. ~~**Message Students**~~ ✅ FIXED — Links to `/teacher/inbox`.
7. ~~**Course Settings**~~ ✅ FIXED — Links to `/teacher/settings`.
8. ~~**Schedule Office Hours**~~ ✅ FIXED — Section added in Teacher Settings.
9. ~~**Students tab**~~ ✅ FIXED — Search enabled, Export CSV, View Details → Inbox.
10. ~~**Grading tab**~~ ✅ FIXED — Assignment filter and sort selects enabled.

---

## 11. Summary Table

| Area | Status | Notes |
|------|--------|-------|
| Dashboard | ⚠️ | Mock-only; no API; Schedule Office Hours misleading |
| Course (Overview) | ⚠️ | Mock-only; Message Students, Course Settings non-functional |
| Course (Students) | ⚠️ | Search disabled; Export/View Details non-functional |
| Course (Grading) | ✅ | Works; grades persisted via gradeStore |
| Course (Analytics) | ✅ | Recharts; mock data |
| Course (Content) | ✅ | Files tab |
| Inbox | ⚠️ | Same as student; no teacher-specific view |
| Calendar | ⚠️ | Same as student |
| Settings | ⚠️ | Hardcoded user; no office hours |
| API integration | ❌ | None for teacher |

---

*End of Teacher Portal Feature Review.*
