# Codebase Review: Dead Code & Architecture Flaws

**Date:** February 11, 2026  
**Scope:** canvas_prototype-1 (frontend, backend)  
**Status:** Legacy app removed (Feb 2026). React app is the sole entry point.

---

## 1. Executive Summary

The legacy SPA (`index.html`, `js/app.js`) and all legacy-only modules have been removed. The React app (`frontend/`) is now the sole entry point. Remaining `js/` files (courseData, moduleData, inboxData, teacherData) are shared data modules used by the React frontend.

---

## 2. Dead Code

### 2.1 Files Never Imported

| File | Type | Recommendation |
|------|------|----------------|
| `frontend/src/data/mockData.js` | Unused | **Delete** – Exports `portfolioSeries`, `positions`, `marketMovers` (stock/portfolio data); unrelated to LMS; never imported |
| `frontend/src/components/ui/button.jsx` | Unused component | **Delete or use** – Never imported; consider using in forms or remove |
| `frontend/src/components/ui/card.jsx` | Unused component | **Delete or use** – Never imported |
| `frontend/src/components/ui/input.jsx` | Unused component | **Delete or use** – Never imported |
| `js/teacher/teacherDashboard-class.js` | Legacy duplicate | **Delete** – `teacherDashboard.js` is used instead; class-based version is orphaned |
| `js/teacher/teacherCourseTabs.js` | Legacy | **Review** – Exports render functions; `teacherDashboard.js` does not import; may be dead or intended for future use |

### 2.2 Unused Exports

| File | Unused Export(s) | Notes |
|------|------------------|-------|
| `js/shared/ui.js` | `toggleLoadingSpinner`, `setActiveNavLink`, `createEmptyState` | Only used by legacy; verify before removing |
| `js/core/roleManager.js` | `isTeacher` | Imported in `js/app.js` but never used |
| `frontend/src/data/inboxData.js` | `inboxConversations`, `getUnreadCount`, `deleteConversations` | Re-exported but `Inbox.jsx` uses different functions |

### 2.3 Unused Imports

| File | Unused Import |
|------|---------------|
| `js/app.js` | `isTeacher` from `./core/roleManager.js` |

---

## 3. Architecture Flaws

### 3.1 Hardcoded Absolute Paths (Critical)

The React frontend re-exports from `js/` using **machine-specific absolute paths**:

| File | Current Path | Issue |
|------|--------------|-------|
| `frontend/src/data/courseDetails.js` | `'/Users/sadiqharuna/Desktop/Projects/canvas_prototype-1/js/shared/courseData.js'` | Breaks on other machines, CI, deployments |
| `frontend/src/data/moduleData.js` | `'/Users/sadiqharuna/Desktop/Projects/canvas_prototype-1/js/shared/moduleData.js'` | Same |
| `frontend/src/data/inboxData.js` | `'/Users/sadiqharuna/Desktop/Projects/canvas_prototype-1/js/shared/inboxData.js'` | Same |
| `frontend/src/data/teacherData.js` | `'/Users/sadiqharuna/Desktop/Projects/canvas_prototype-1/js/teacher/teacherData.js'` | Same |

**Fix:** Use relative paths, e.g. `'../../../js/shared/courseData.js'` (from `frontend/src/data/`), or add a Vite alias for `@legacy` pointing to `js/`.

### 3.2 Duplicate Data Sources

| Data | Legacy Source | React Source | Issue |
|------|---------------|--------------|-------|
| Courses, todos, announcements, user | `js/shared/data.js` | `frontend/src/data/classroomData.js` | **Duplicated** – Two separate copies; changes must be made in both |
| Course details | `js/shared/courseData.js` | Re-export via `courseDetails.js` | Single source; re-export is fine |

**Recommendation:** Either (a) have `classroomData.js` import from `js/shared/data.js` and re-export, or (b) consolidate into one canonical location.

### 3.3 Dual Entry Points

| Entry | File | Served By |
|-------|------|-----------|
| Legacy SPA | `index.html` → `js/app.js` | Unknown (static server?) |
| React app | `frontend/index.html` → `frontend/src/main.jsx` | Vite dev server |

**Issue:** Two separate UIs; unclear which is primary. Legacy and React share some `js/` modules but have different routing, state, and UX.

**Recommendation:** Document which entry point is canonical. If React is primary, consider deprecating legacy or moving it behind a flag.

### 3.4 ID Type Mismatch

- **Mock data:** Numeric IDs (1, 2, 3, …)
- **Backend/API:** String IDs (e.g. `ics31`, `math2d`)
- **Risk:** `getCourseById(parseInt("ics31"))` → `NaN` → `null` → "Course not found" in API mode

**Recommendation:** Support both numeric and string IDs in `getCourseById`, or normalize API responses to match mock shape.

### 3.5 Inconsistent API/Mock Switching

- Some pages check `USE_API = !!import.meta.env.VITE_API_URL` and fetch from API
- Others hardcode `TEACHING_COURSES = [1,2,3,4,5,6]` and `getCourseById`
- Teacher flows often ignore API even when `USE_API` is true

**Recommendation:** Centralize API/mock logic; ensure all pages respect `USE_API`.

---

## 4. Data Flow Summary

```
Legacy (js/app.js)
├── js/shared/data.js          → coursesData, todosData, announcementsData, userData
├── js/shared/courseData.js    → courseDetails, getCourseById
├── js/shared/moduleData.js    → moduleItems, getModuleItems, ...
├── js/shared/inboxData.js     → inbox
├── js/shared/calendar.js      → buildCalendarEvents
├── js/teacher/teacherData.js  → analytics, pending grading
└── js/teacher/teacherDashboard.js

React (frontend/src)
├── classroomData.js           → coursesData, todosData, announcementsData, userData (DUPLICATE)
├── courseDetails.js           → re-export from js/shared/courseData.js
├── moduleData.js              → re-export from js/shared/moduleData.js
├── inboxData.js               → re-export from js/shared/inboxData.js
├── teacherData.js             → re-export from js/teacher/teacherData.js
└── React-only: announcements.js, discussionsData.js, filesData.js, gradeStore.js,
    submissionStore.js, createdContentStore.js, submissionPreviewData.js,
    groupsData.js, notificationsData.js
```

---

## 5. Recommended Fix Order

### High priority

1. **Replace absolute paths** – Use relative paths or Vite alias in `courseDetails.js`, `moduleData.js`, `inboxData.js`, `teacherData.js`.
2. **Remove dead mockData.js** – Delete `frontend/src/data/mockData.js`.
3. **Remove unused import** – Drop `isTeacher` from `js/app.js` or use it.

### Medium priority

4. **Consolidate classroomData** – Have React import from `js/shared/data.js` or vice versa; avoid duplication.
5. **Remove or use UI components** – Delete `button.jsx`, `card.jsx`, `input.jsx` if unused, or integrate them.
6. **Remove teacherDashboard-class.js** – If `teacherDashboard.js` is the only teacher entry, delete the class version.

### Lower priority

7. **Audit teacherCourseTabs.js** – Determine if it is used; remove or wire up.
8. **Clean unused exports** – Trim `ui.js`, `roleManager.js`, `inboxData.js` exports.
9. **Document entry points** – Clarify legacy vs React and migration path.

---

## 6. Files to Modify (Quick Reference)

| Action | File(s) |
|--------|---------|
| Fix paths | `frontend/src/data/courseDetails.js`, `moduleData.js`, `inboxData.js`, `teacherData.js` |
| Delete | `frontend/src/data/mockData.js`, `js/teacher/teacherDashboard-class.js` |
| Edit | `js/app.js` (remove unused `isTeacher` import) |
| Consider delete | `frontend/src/components/ui/button.jsx`, `card.jsx`, `input.jsx` |

---

*End of Codebase Review.*
