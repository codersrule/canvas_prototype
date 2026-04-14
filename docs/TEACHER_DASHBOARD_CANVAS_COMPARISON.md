# Teacher Dashboard: Deep Feature Comparison

**Canvas Reference:** [UCI Canvas](https://canvas.eee.uci.edu/) (Instructure Canvas LMS)  
**Prototype:** canvas_prototype Teacher Dashboard (`/teacher`)  
**Date:** February 11, 2026

---

## 1. Executive Summary

The prototype’s teacher dashboard provides a single view with core stats, course list, quick actions, and recent activity. Canvas (UCI) offers multiple dashboard layouts, richer sidebar components, and more instructor-specific features. This document compares each area in detail.

---

## 2. Dashboard Layout & Views

| Feature | Canvas (UCI) | Prototype | Gap |
|---------|---------------|------------|-----|
| **View options** | Card View, List View, Recent Activity View (toggle via ⋮ menu) | Single fixed layout | **High** – No view switching |
| **Card View** | Course cards with color, nickname, course code, term; activity icons (Assignments, Announcements, Discussions, Files) with unread counts | N/A | **High** |
| **List View** | Compact list of courses with links | N/A | **Medium** |
| **Recent Activity View** | Global activity stream; sidebar shows courses by code | Prototype has “Recent Activity” but it’s a small list, not a full feed | **Medium** |
| **Course favorites** | Only favorited courses in Card View; can star/unstar | All teaching courses shown; no favorites | **Medium** |
| **Card customization** | Nickname, color, drag-and-drop order | Fixed course cards; no customization | **Low** |

### Canvas References

- [Canvas Dashboard: Card, List & Recent Activity Views](https://unanswered.io/guide/canvas-dashboard-views)
- [How do I view my favorite courses in the Card View Dashboard as an instructor?](https://community.canvaslms.com/t5/Instructor-Guide/How-do-I-view-my-favorite-courses-in-the-Card-View-Dashboard-as/ta-p/803)

---

## 3. Welcome / Header Banner

| Feature | Canvas (UCI) | Prototype | Gap |
|---------|---------------|------------|-----|
| **Welcome message** | Personalized greeting | ✅ "Welcome, {name}!" | None |
| **Summary stats** | Varies by view | ✅ "Teaching X courses • Y assignments pending review" | None |
| **Course count** | Shown in context | ✅ | None |
| **Pending grading** | In sidebar To Do | ✅ In header and stat cards | None |

---

## 4. Stat Cards / Metrics

| Feature | Canvas (UCI) | Prototype | Gap |
|---------|---------------|------------|-----|
| **Total Students** | Shown in course context | ✅ | None |
| **Pending Grading** | To Do list in sidebar; clickable → SpeedGrader | ✅ Stat card; clickable → grading tab | None |
| **Avg Attendance** | Roll Call Attendance (if enabled) | ✅ Shown | None |
| **Course-specific stats** | Per-course in Card View | Aggregated only | **Low** |
| **Other metrics** | View Grades (sidebar), Start New Course (if permitted) | Not present | **Medium** |

---

## 5. Sidebar (To Do List & Coming Up)

| Feature | Canvas (UCI) | Prototype | Gap |
|---------|---------------|------------|-----|
| **To Do list** | All items requiring grading; assignment name, course, points, due date | ✅ "Pending Reviews" – similar; shows student, course, assignment | **Low** – Canvas shows more detail per item |
| **To Do scope** | All active courses | ✅ All teaching courses | None |
| **To Do click** | Links to SpeedGrader / grade entry | ✅ Links to grading tab | None |
| **Coming Up** | Assignments/events due in next 7 days; up to 20 items ordered by date | ✅ "Upcoming Deadlines" – similar; shows assignment, course, due date, submitted/total | **Low** – Canvas shows more items (20 vs 4) |
| **Coming Up scope** | 7 days; all item types | Limited to 4 items; assignment-focused | **Medium** |
| **View Grades** | Button in sidebar | Not present | **Medium** |
| **Start a New Course** | Button (if admin permissions) | Not present | **Low** |
| **Course identification** | Course codes/custom nicknames on each item | ✅ Course code shown | None |

### Canvas References

- [How do I use the To Do list and sidebar in the Dashboard as an instructor?](https://community.canvaslms.com/t5/Canvas-Basics-Guide/How-do-I-use-the-To-Do-list-and-sidebar-in-the-Dashboard-as-an-instructor/ta-p/618753)
- [Canvas Guides – To Do and Sidebar](https://guides.instructure.com/m/4152/l/719658-how-do-i-use-the-to-do-list-and-sidebar-in-the-dashboard-as-an-instructor)

---

## 6. My Courses / Course List

| Feature | Canvas (UCI) | Prototype | Gap |
|---------|---------------|------------|-----|
| **Course list** | Card View or List View; sidebar links | ✅ "My Courses" – list of cards | None |
| **Course card content** | Name, code, term, activity icons | ✅ Code, name, students, term | **Low** – No activity icons |
| **Unread indicators** | Assignments, Announcements, Discussions, Files | Not present | **Medium** |
| **Link to course** | ✅ | ✅ `/teacher/course/:id` | None |
| **Pending badge** | In To Do | ✅ "X to grade" badge on card | None |
| **Course color** | Customizable per card | ✅ Gradient from course | None |

---

## 7. Recent Activity

| Feature | Canvas (UCI) | Prototype | Gap |
|---------|---------------|------------|-----|
| **Activity stream** | Full feed; submissions, grades, feedback, announcements, discussions | ✅ List of recent activity (submissions, grades, discussions) | **Medium** – Canvas is richer |
| **Activity types** | Submissions, grades, feedback, announcements, discussion replies | Submissions, grades, discussions | **Low** |

---

## 8. Quick Actions

| Feature | Canvas (UCI) | Prototype | Gap |
|---------|---------------|------------|-----|
| **Create Announcement** | From course or global | ✅ Modal | None |
| **Create Assignment** | From course or global | ✅ Modal | None |
| **Schedule Office Hours** | Via Calendar or settings | ✅ Links to `/teacher/settings` | **Low** – Settings may not have office hours UI |
| **Other quick actions** | Start New Course, View Grades, etc. | Not present | **Medium** |

---

## 9. Upcoming Deadlines

| Feature | Canvas (UCI) | Prototype | Gap |
|---------|---------------|------------|-----|
| **Display** | Coming Up section (7 days, 20 items) | ✅ Upcoming Deadlines; 4 items | **Medium** – Fewer items |
| **Content** | Assignment name, course, due date, points | ✅ Assignment, course, due date, submitted/total | **Low** |
| **Progress bar** | Not in Coming Up | ✅ Submission progress bar | Prototype has extra |
| **Clickable** | Links to assignment | Not clickable | **Low** |

---

## 10. Global Navigation

| Feature | Canvas (UCI) | Prototype | Gap |
|---------|---------------|------------|-----|
| **Left sidebar** | Account, Dashboard, Courses, Groups, Calendar, Inbox, History, Help | Dashboard, Inbox, Calendar, Settings, Log out | **Low** – Different set |
| **Courses** | All courses dropdown | Via Dashboard | **Low** |
| **Account** | Profile, settings, notifications | Settings | **Low** |
| **Help** | Canvas help | Not present | **Low** |

### Canvas Reference

- [How do I use the global navigation menu as an instructor?](https://guides.instructure.com/m/4152/l/719650-how-do-i-use-the-global-navigation-menu-as-an-instructor)

---

## 11. Data & API

| Feature | Canvas (UCI) | Prototype | Gap |
|---------|---------------|------------|-----|
| **Data source** | Real LMS; Canvas API | Mock data (`teacherData.js`, `courseDetails`); optional API | **High** |
| **Teacher courses** | From enrollment | `TEACHING_COURSES` or `api.getCourses('teacher')` | **Medium** – API path exists |
| **Analytics** | Built-in analytics | Mock `getCourseAnalytics` | **High** |
| **Real-time** | Live updates | Static mock | **High** |

---

## 12. Feature Parity Summary

| Category | Canvas | Prototype | Parity |
|----------|--------|-----------|--------|
| Dashboard views | 3 (Card, List, Recent Activity) | 1 | ~33% |
| Welcome banner | ✅ | ✅ | 100% |
| Stat cards | To Do, Coming Up, View Grades | Students, Pending, Attendance | ~70% |
| Sidebar To Do | ✅ Full grading list | ✅ Pending Reviews | ~85% |
| Sidebar Coming Up | ✅ 7 days, 20 items | ✅ 4 items | ~50% |
| My Courses | ✅ | ✅ | ~80% |
| Recent Activity | ✅ | ✅ | ~70% |
| Quick Actions | ✅ | ✅ | ~80% |
| Course customization | ✅ | ❌ | 0% |
| View Grades | ✅ | ❌ | 0% |
| Start New Course | ✅ | ❌ | 0% |

---

## 13. Recommended Implementation Priorities

### High priority ✅ Implemented

1. ~~**View switching**~~ – Card View, List View, Recent Activity View added.
2. ~~**Coming Up expansion**~~ – Up to 20 items; merged from all courses.
3. ~~**View Grades**~~ – Sidebar link and Quick Action to `/teacher/grades`.

### Medium priority ✅ Implemented

4. ~~**Course favorites**~~ – Star/unstar; Card View shows favorited courses.
5. ~~**Activity icons**~~ – Assignments and Announcements counts with icons on course cards.
6. ~~**Upcoming Deadlines clickable**~~ – Each item links to course grading tab.

### Lower priority (not yet implemented)

7. **Card customization** – Nickname, color, drag-and-drop.
8. **Start New Course** – If admin permissions.
9. **Help** – Link to help or docs.

---

## 14. References

- [UCI Canvas](https://canvas.eee.uci.edu/) – Login page (UCInetID required)
- [Canvas Instructor Dashboard – To Do and Sidebar](https://guides.instructure.com/m/4152/l/719658-how-do-i-use-the-to-do-list-and-sidebar-in-the-dashboard-as-an-instructor)
- [Canvas Dashboard Views](https://unanswered.io/guide/canvas-dashboard-views)
- [Canvas Global Navigation Menu](https://guides.instructure.com/m/4152/l/719650-how-do-i-use-the-global-navigation-menu-as-an-instructor)
- [Canvas 2024 Release Notes](https://community.canvaslms.com/t5/Canvas-Releases-Q-A/Features-Q-amp-A-Canvas-Release-Notes-2024-07-20/m-p/606870)

---

*End of Teacher Dashboard Canvas Comparison.*
