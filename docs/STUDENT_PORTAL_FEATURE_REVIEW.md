# Student Portal Feature Review

**Date:** February 11, 2026  
**Scope:** React frontend (`frontend/src/`), backend API integration, and data stores

---

## 1. Executive Summary

The student portal provides a functional LMS experience with Dashboard, Courses, Course detail (9 tabs), Assignments, Grades, Calendar, Inbox, Groups, and Settings. It supports two modes: **mock mode** (static `classroomData.js`, `courseDetails`) and **API mode** (backend at `VITE_API_URL`). Several gaps exist, especially around API mode compatibility, dashboard links, and data persistence.

---

## 2. Routes & Navigation

| Route | Component | Status |
|-------|-----------|--------|
| `/` | StudentDashboardPage | ✅ |
| `/courses` | CoursesPage | ✅ |
| `/course/:id` | CoursePage (default: Home tab) | ✅ |
| `/course/:id/:tab` | CoursePage | ✅ |
| `/course/:courseId/assignment/:assignmentId` | AssignmentPage | ⚠️ See 6.2 |
| `/course/:courseId/announcement/:id` | AnnouncementDetailPage | ⚠️ See 6.2 |
| `/course/:courseId/discussion/:id` | DiscussionDetailPage | ⚠️ See 6.2 |
| `/calendar` | CalendarPage | ✅ |
| `/inbox` | InboxPage | ✅ |
| `/grades` | GradesPage | ⚠️ See 6.4 |
| `/groups` | GroupsPage | ✅ |
| `/settings` | StudentSettingsPage | ✅ |

**Navbar & Sidebar:** Classroom logo links to `/` (student) or `/teacher` (teacher). Sidebar links to Dashboard, Courses, Calendar, Inbox, Grades, Groups, Settings. Logout clears auth and redirects to login.

---

## 3. Dashboard (`StudentDashboard.jsx`)

### 3.1 Implemented

- Welcome banner with user name and upcoming assignment count
- **My Courses** grid: links to `/course/{id}` for each enrolled course
- **To Do** section: lists `todosData` (course code, title, due date)
- **Recent Announcements**: lists `announcementsData` (title, course, timestamp)
- **Calendar widget**: links to `/calendar`

### 3.2 Gaps

| Issue | Severity | Description |
|-------|----------|-------------|
| Dashboard uses mock data only | Medium | `coursesData`, `todosData`, `announcementsData` from `classroomData.js`. When API is enabled, enrolled courses are not shown. User name from `userData`, not auth user. |
| To Do items not clickable | Medium | Items are static; no link to assignment or course. |
| Announcements not clickable | Medium | No link to announcement detail or course announcements. |
| To Do "View All" → `/calendar` | Low | Calendar shows due dates but is not assignment-centric. Could link to a dedicated assignments/todos view. |
| Announcements "View All" → `/courses` | Low | Goes to course list, not announcements. |

---

## 4. Courses Page (`Courses.jsx`)

### 4.1 Implemented

- **Mock mode:** Lists `coursesData`, search filters by course code/name
- **API mode:** Fetches `api.getCourses()`, search filters, debounced "Add a Course" search via `api.getAvailableCourses(q)`, enroll via `api.enrollInCourse(id)`
- Course cards link to `/course/{id}`

### 4.2 Gaps

- API errors on load are surfaced but not always prominent.
- No "loading" state for add-course search (only "Adding…" on Add button).
- Enrolled courses in API mode use backend IDs (e.g. `ics31`); course detail page handles API courses correctly.

---

## 5. Course Detail (`Course.jsx`)

### 5.1 Data Resolution

- **Mock mode:** `getCourseById(parseInt(courseId))` from `courseDetails` (numeric IDs).
- **API mode:** `api.getCourse(courseId)` then `mergeApiCourseWithStores(apiCourse, studentId)` — merges `submissionStore` and `gradeStore` for assignments.

### 5.2 Tabs

| Tab | Behavior | Notes |
|-----|----------|-------|
| Home | Course info, recent announcements (2), Quick Links, Course Stats | ✅ |
| Announcements | List with link to detail; merges `getCreatedAnnouncements` | ✅ |
| Discussions | Mock `getDiscussionsByCourseId(course.id)` | ✅ |
| Assignments | Pending & submitted; Start Assignment links; uses `getEffectiveAssignmentForStudent` | ✅ |
| Modules | Expandable modules from `course.modules` | ✅ |
| Syllabus | Assignments + grades from `getEffectiveAssignmentForStudent` | ✅ |
| Files | `getFilesByCourseId(course.id)` | ✅ |
| Grades | Tab content uses `getEffectiveAssignmentForStudent` | ✅ |
| People | Mock roster | ✅ |

### 5.3 Banner Stats

- **Current Grade** → `/course/:id/grades`
- **Pending** → `/course/:id/assignments`
- **Modules** → `/course/:id/modules`

### 5.4 Gaps

- **Discussions, Files, People:** Mock data only; no API integration.
- **Modules:** No progress persistence or API sync.
- **Syllabus:** Date parsing for "Oct 15 at 11:59pm" may be fragile without year in assignment data.

---

## 6. Assignment Flow (`Assignment.jsx`)

### 6.1 Implemented

- Assignment detail: title, points, due date, description
- Submit: text area and file upload (stored in `submissionStore`)
- Grade display when teacher has graded (`gradeStore`)
- Uses `getEffectiveAssignmentForStudent` for submission + grade merge

### 6.2 Critical Gap: Assignment Page in API Mode

**Assignment page always uses `getCourseById(parseInt(courseId))`.** In API mode, course IDs are strings (e.g. `ics31`). `parseInt("ics31")` → `NaN` → `getCourseById(NaN)` → `null` → **"Assignment not found"**.

The same pattern affects:

- **AnnouncementDetailPage:** `getCourseById(parseInt(courseId))`
- **DiscussionDetailPage:** `getCourseById(parseInt(courseId))`

So in API mode, links to `/course/ics31/assignment/a1`, `/course/ics31/announcement/1`, and `/course/ics31/discussion/1` will all show "Not found".

---

## 7. Grades Page (`Grades.jsx`)

### 7.1 Implemented

- Stat boxes: Overall GPA, Average Grade, Completed/Total, Courses count
- Course cards with expand: letter grade, completion %, assignment rows (title, due, points, grade)
- "View" links to assignment (via assignment ID in URL)

### 7.2 Gaps

| Issue | Severity | Description |
|-------|----------|-------------|
| Grades does not use `gradeStore` | **High** | Uses `courseDetails` and `details.assignments` directly. Teacher-assigned grades in `gradeStore` are **not** shown here. |
| Grades does not use API courses | Medium | Uses `coursesData` and `courseDetails[c.id]`; only works with numeric IDs. API-enrolled courses are ignored. |
| Assignments in rows not clickable | Low | "View" exists but assignment rows could be clickable. |

---

## 8. Calendar (`Calendar.jsx`)

### 8.1 Implemented

- Month grid with prev/next
- Assignments from `courseDetails` (all courses) rendered on due dates
- Date parsing: `new Date(\`${assignment.dueDate} ${year}\`)` — e.g. "Oct 15 at 11:59pm 2025"

### 8.2 Gaps

- Uses `courseDetails` only; no API courses.
- Calendar cells show course code badge but are not clickable to assignment.
- "Oct 15 at 11:59pm" without year in data may parse incorrectly for multi-year spans.
- Static "November 2025" on dashboard calendar widget.

---

## 9. Inbox (`Inbox.jsx`)

### 9.1 Implemented

- Conversation list with filters: All Courses, Inbox/Starred, search
- Select conversation → message thread
- Reply: `addMessage(id, { sender, body, date })` (in-memory)
- `markAsRead`, `toggleConversationStar`

### 9.2 Gaps

- No compose/new message flow.
- All data from `inboxData.js`; no API.
- Reply persists only in memory; lost on refresh.

---

## 10. Groups (`Groups.jsx`)

### 10.1 Implemented

- List of `MOCK_GROUPS` with name, course, description, members
- "View Course" → `/course/{group.courseId}` (numeric: 1, 2)

### 10.2 Gaps

- No create/join groups.
- `courseId` is numeric; in API mode `/course/1` may 404 if courses use string IDs.
- No API integration.

---

## 11. Settings (`StudentSettings.jsx`)

### 11.1 Implemented

- Profile: name, email, student ID (read-only display)
- Notifications: toggles for types
- Display: timezone, language, dark mode
- Persists to localStorage

### 11.2 Gaps

- Profile fields not editable; no API sync.
- Notification toggles persist locally but no backend.
- Dark mode toggle exists; theme application may be partial.

---

## 12. Auth Flow (`AuthContext.jsx`, `Login.jsx`)

### 12.1 Implemented

- Login: email + password; split student/teacher via role in response
- Mock: accepts any credentials; `studentId: 1` for students
- API: `api.login()` → stores `{ user, token }` in `localStorage` under `classroom_auth`
- Protected routes redirect to `/login` when unauthenticated
- Logout clears `classroom_auth`

### 12.2 Gaps

- Forgot password shows `alert('Password reset coming soon.')` — placeholder only.

---

## 13. Data Flow Summary

| Store / Source | Scope | Persistence | API Integration |
|----------------|-------|-------------|-----------------|
| `classroomData.js` | courses, todos, announcements, user | Static | None |
| `courseDetails` (courseData.js) | Full course detail (assignments, modules, announcements) | Static | None |
| `submissionStore.js` | Student submissions | In-memory | None |
| `gradeStore.js` | Teacher grades | In-memory | None |
| `createdContentStore.js` | Teacher-created announcements/assignments | In-memory | None |
| `inboxData.js` | Conversations, messages | In-memory (mutations) | None |
| `groupsData.js` | Groups | Static | None |
| API (`VITE_API_URL`) | Login, courses, enroll, course detail | Backend | Used when env set |

---

## 14. Recommended Fix Order

1. ~~**Grades page: merge `gradeStore`**~~ ✅ FIXED — Use `getEffectiveAssignmentForStudent` so teacher-assigned grades appear (same as Assignment/Course tabs).
2. ~~**Assignment / Announcement / Discussion detail in API mode**~~ ✅ FIXED — Fetch course via API when `USE_API`; pages work with string IDs.
3. ~~**Dashboard: API-aware**~~ ✅ FIXED — When API is on, use `api.getCourses()` for My Courses; `useAuth()` for user name; To Do and Announcements clickable with correct links.
4. ~~**Grades & Calendar: API courses**~~ ✅ FIXED — Grades and Calendar fetch API courses and their details in API mode.
5. ~~**Dashboard: clickable To Do & Announcements**~~ ✅ FIXED — Linked to assignment and announcement detail via `courseId`/`assignmentId`/`announcementId` in data.
6. ~~**Dashboard: "View All" targets**~~ ✅ FIXED — To Do → `/calendar`; Announcements → first course's announcements or `/courses`.
7. ~~**Groups: API + ID handling**~~ ✅ FIXED — "View Course" resolves by course code when in API mode.

---

## 15. Summary Table

| Area | Status | Notes |
|------|--------|-------|
| Routes | ✅ | All student routes wired |
| Dashboard | ⚠️ | Mock-only, non-clickable items |
| Courses | ✅ | Mock + API with search/add |
| Course detail | ✅ | 9 tabs; API merged for assignments |
| Assignment page | ⚠️ | Broken in API mode (ID mismatch) |
| Announcement/Discussion detail | ⚠️ | Same API ID issue |
| Grades | ⚠️ | No gradeStore; mock-only |
| Calendar | ⚠️ | Mock-only; date parsing |
| Inbox | ⚠️ | Mock-only; no compose |
| Groups | ⚠️ | Mock-only; ID mismatch |
| Settings | ✅ | Local persistence |
| Auth | ✅ | Mock + API login |

---

*End of Student Portal Feature Review.*
