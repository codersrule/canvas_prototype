# Classroom Feature Gap Analysis

Thorough code review against `CANVAS_FEATURE_COMPARISON.md` and the current implementation.  
**Last updated:** Feb 11, 2026

---

## 1. Critical Gaps (Bugs & Broken Flows)

### ~~1.1 Assignment page: teacher-created assignments show "Not found"~~ ✅ FIXED
**Resolved:** Assignment page now merges `getCreatedAssignments` when resolving the assignment.

---

### ~~1.2 Teacher grades are not persisted; students never see them~~ ✅ FIXED
**Location:** `frontend/src/pages/TeacherCourse.jsx`

**Issue:** The grading modal's `onSave` only adds the submission ID to `gradedIds` (component state). The grade and feedback are passed to `onSave(item.id, gradeNum, feedback)` but `handleGradingSave` ignores them. Grades are lost on navigation or refresh. Students never see teacher-assigned grades.

**Resolved:** Added `gradeStore.js` with `setGrade` / `getGrade` keyed by `(courseId, assignmentId, studentId)`. Grading modal persists grades; `getEffectiveAssignmentForStudent` merges them. Students (studentId 1) see grades on Assignment page, Assignments tab, Syllabus tab, and Grades tab.

---

## 2. Missing Features (vs. CANVAS_FEATURE_COMPARISON)

### ~~2.1 Groups page – no route~~ ✅ FIXED
**Resolved:** Added `/groups` route and `GroupsPage` with mock "My groups" list (group cards with course link).

---

### ~~2.2 Discussions tab – not in student Course~~ ✅ FIXED
**Resolved:** Added "Discussions" tab with mock threads (title, author, date, reply count, unread). Quick Links on Home includes Discussions.

---

### ~~2.3 Teacher Analytics – still a placeholder~~ ✅ FIXED
**Resolved:** Analytics tab now shows Recharts: grade distribution bar chart, completion pie chart, upcoming deadlines bar chart, and performance metrics.

---

## 3. UX / Polish Gaps

### ~~3.1 Navbar "Classroom" is not clickable~~ ✅ FIXED
**Resolved:** Classroom is now a Link to `/` (student) or `/teacher` (teacher).

---

### ~~3.2 Teacher dashboard uses hardcoded user~~ ✅ FIXED
**Resolved:** Teacher dashboard uses `useAuth()` to display the logged-in teacher's name.

---

### 3.3 Forgot password is non-functional
**Location:** `frontend/src/pages/Login.jsx` – button shows `alert('Password reset coming soon.')`

**Status:** Acceptable for a prototype, but should be replaced by a real flow or a dedicated "Forgot password" page when ready.

---

## 4. Implemented Features (Reference)

| Feature | Status |
|--------|--------|
| Student: Dashboard, Courses, Course (all tabs), Assignment detail + submission | ✅ |
| Student: Calendar, Inbox, Grades, Settings | ✅ |
| Student: Syllabus, Files tabs in Course | ✅ |
| Teacher: Dashboard, Course (Overview, Students, Grading, Content) | ✅ |
| Teacher: Create announcement / assignment modals | ✅ |
| Teacher: Grading modal (UI; grade not persisted) | ⚠️ See 1.2 |
| Teacher: Settings | ✅ |
| Auth: Login (split student/teacher), logout | ✅ |
| Notifications dropdown | ✅ |
| Announcement detail + reply | ✅ |
| Assignment submission (student) | ✅ |

---

## 5. Suggested Fix Order

1. ~~**Assignment page lookup** (1.1)~~ ✅
2. ~~**Grade persistence** (1.2)~~ ✅
3. ~~**Groups page** (2.1)~~ ✅
4. ~~**Navbar home link** (3.1)~~ ✅
5. ~~**Teacher dashboard user** (3.2)~~ ✅
6. ~~**Discussions tab** (2.2)~~ ✅
7. ~~**Teacher Analytics** (2.3)~~ ✅
