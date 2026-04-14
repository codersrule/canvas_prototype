# Canvas LMS vs Classroom – Feature Comparison

Comparison of [UCI Canvas](https://canvas.eee.uci.edu/) (Instructure Canvas LMS) with the current Classroom (canvas_prototype) implementation. Use this to decide what to build next.

---

## 1. What Classroom Has Today

### Student experience
| Area | Status | Notes |
|------|--------|--------|
| **Dashboard** | ✅ | Welcome banner, course cards, To Do, announcements, mini calendar |
| **All Courses** | ✅ | Grid of course cards → course detail |
| **Course – Home** | ✅ | Course info, quick links to Assignments/Announcements/Modules |
| **Course – Announcements** | ✅ | List of announcements with date/content |
| **Course – Assignments** | ✅ | List only (Upcoming / Submitted); **no assignment detail or submission** |
| **Course – Modules** | ✅ | Module list with progress, expandable items (read-only) |
| **Course – Grades** | ✅ | Per-course grade breakdown |
| **Course – People** | ✅ | Roster list |
| **Calendar** | ✅ | Month view, prev/next, assignments, “Upcoming assignments” list |
| **Inbox** | ✅ | Gmail-style list + message detail + reply, filters |
| **Grades (global)** | ✅ | GPA-style stats, per-course collapsible cards |
| **Groups** | 🔗 Sidebar only | Link exists; **no route or page** → “Page coming soon” |
| **Settings** | 🔗 Sidebar only | Link exists; **no route or page** → “Page coming soon” |

### Teacher experience
| Area | Status | Notes |
|------|--------|--------|
| **Teacher Dashboard** | ✅ | Welcome, stats (students, pending grading, attendance), My Courses, recent activity, pending reviews, deadlines |
| **Teacher Course – Overview** | ✅ | Metrics, grade distribution, pending grading list, quick actions (buttons only) |
| **Teacher Course – Students** | ✅ | Roster, class stats |
| **Teacher Course – Grading** | ✅ | Queue list; “Grade Now” is **UI only** (no grading flow) |
| **Teacher Course – Analytics** | ⚠️ Placeholder | “Analytics coming soon” |
| **Teacher Course – Content** | ⚠️ Placeholder | “Content management coming soon” |
| **Teacher Inbox** | ✅ | Same Inbox under `/teacher/inbox` |
| **Teacher Calendar** | ✅ | Same Calendar under `/teacher/calendar` |
| **Teacher Settings** | ⚠️ Placeholder | “Teacher settings coming soon” |

### Cross-cutting
- **Auth** | None (mock user/role by URL: `/teacher` = teacher).
- **Notifications** | Bell in navbar (badge “3”) – **no dropdown or real data**.
- **Assignment detail & submission** | Exists in legacy `js/student/assignmentView.js`; **not ported to React** – no `/course/:id/assignment/:aid` or submit flow in frontend.

---

## 2. Canvas LMS Features (Reference)

Based on [Canvas guides](https://guides.instructure.com/) and [feature documentation](https://community.canvaslms.com/t5/Canvas-Resource-Documents/Canvas-Feature-Option-Summary/ta-p/531316):

### Content & communication
- Announcements, **Discussions**, **Chat**
- **Pages** (wiki-style), **Files**
- Inbox (conversations)
- **Conferences** (e.g. virtual meetings)
- **Collaborations** (e.g. Google Docs)

### Learning & assessment
- **Assignments** with full **submission workflow** (upload, text, URLs, etc.)
- **Quizzes** / New Quizzes
- **Rubrics** for grading
- **Gradebook** and Grades
- **Peer review**
- **Mastery paths**, **annotation assignments**

### Organization & planning
- **Modules** (sequential/organized content)
- **Calendar** (and **Scheduler**)
- **Groups** (group sets, group assignments)
- **Syllabus** (syllabus page)
- **Course analytics** (instructor)

### Other
- **Rich Content Editor (RCE)** for descriptions/announcements
- **Notifications** (per-channel preferences)
- **ePortfolios**, **LTI** tools, **DocViewer**, **Roll Call Attendance**, etc.

---

## 3. Gap Analysis – What to Implement

### High priority (core Canvas parity)

| Feature | Canvas | Classroom | Action |
|--------|--------|----------|--------|
| **Assignment detail page** | Full assignment view, instructions, due date, points | Only list in course Assignments tab | Add route `/course/:courseId/assignment/:assignmentId` and Assignment page (instructions, submit button). |
| **Assignment submission** | Upload file, text entry, etc. | “Start Assignment” does nothing; legacy JS has it | Port submission flow from `js/student/assignmentView.js` into React (mock submit + success state). |
| **Student Settings** | Profile, notifications, etc. | Link only, no page | Add `/settings` route and a simple Settings page (e.g. profile + notification prefs). |
| **Groups** | Group sets, group assignments, group pages | Link only | Add `/groups` route and a simple Groups page (e.g. “My groups” list or “Coming soon”). |

### Medium priority (better parity)

| Feature | Canvas | Classroom | Action |
|--------|--------|----------|--------|
| **Syllabus** | Dedicated syllabus page/tab in course | Not present | Add “Syllabus” tab or section in Course (e.g. from `course.description` + schedule). |
| **Files** | Course files / user files | Only mentioned in teacher Content (placeholder) | Add “Files” tab in course (student) and/or Content (teacher) with mock file list. |
| **Discussions** | Per-course discussions | Only in teacher activity type “discussion” | Add “Discussions” tab in course with mock threads, or a single placeholder. |
| **Notifications UI** | Dropdown with list and preferences | Bell with badge only | Add notifications dropdown (mock list) and link to Settings for preferences. |
| **Teacher: Grade submission** | SpeedGrader / grade entry | “Grade Now” button only | Add grading modal or page: open submission, enter grade/feedback, save (mock). |
| **Teacher: Create announcement / assignment** | Full create flow | Buttons only | Add simple “Create announcement” and “Add assignment” modals or pages (mock save). |

### Lower priority (nice to have)

| Feature | Canvas | Classroom | Action |
|--------|--------|----------|--------|
| **Quizzes** | Quizzes / New Quizzes | None | Add “Quizzes” tab or assignment type and a simple take-quiz view (mock). |
| **Rubrics** | Attach to assignments | None | Show rubric on assignment detail; optional rubric editor for teacher. |
| **Pages** | Wiki-style pages | None | Add “Pages” tab with mock page list and one page view. |
| **Conferences / Chat** | Virtual meetings, chat | None | Placeholder or link-out. |
| **Analytics (teacher)** | Course/student analytics | Placeholder | Replace with simple charts (e.g. Recharts) using existing teacher data. |
| **Content (teacher)** | Modules/files management | Placeholder | Replace with minimal “Content” view (e.g. list modules/assignments to reorder). |

---

## 4. Suggested Implementation Order

1. **Assignment detail + submission (student)**  
   - New route and page; “Start Assignment” → open assignment; mock submit (file/text) and show “Submitted” state.

2. **Student Settings**  
   - `/settings` page: profile (name, email), notification preferences (mock).

3. **Groups page**  
   - `/groups` route: “My groups” or “Coming soon” so sidebar link doesn’t 404.

4. **Notifications dropdown**  
   - Bell opens a dropdown with mock notifications; optional “Mark as read”.

5. **Teacher: Grading flow**  
   - “Grade Now” opens a grading view/modal; enter grade and optional comment; mock save and refresh pending list.

6. **Syllabus**  
   - Add Syllabus to course (tab or Home section) using existing course data.

7. **Files / Discussions**  
   - Add as course tabs with mock data or placeholders.

8. **Teacher: Create announcement / assignment**  
   - Simple forms that append to mock data (or local state) and show in lists.

---

## 5. Technical Notes

- **Data**: Student/teacher and course data live in `frontend/src/data/` (and re-exports from repo `js/`). Assignment submission in the prototype can stay in-memory or in a small mock store keyed by `courseId` and `assignmentId`.
- **Routing**: All routes are in `frontend/src/App.jsx` (Wouter). Add `/course/:courseId/assignment/:assignmentId`, `/settings`, and `/groups` as needed.
- **Original assignment flow**: Full UI and submit logic are in `js/student/assignmentView.js`; use that as the spec when porting to React.

---

*Last updated from current codebase and Canvas feature set. UCI Canvas login: [canvas.eee.uci.edu](https://canvas.eee.uci.edu/).*
