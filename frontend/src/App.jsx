import React, { useState, useEffect, useRef } from "react";
import { Route, Switch, Link, useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Mail,
  Award,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import "./App.css";
import { StudentDashboardPage } from "./pages/StudentDashboard.jsx";
import { CoursesPage } from "./pages/Courses.jsx";
import { CoursePage } from "./pages/Course.jsx";
import { CalendarPage } from "./pages/Calendar.jsx";
import { InboxPage } from "./pages/Inbox.jsx";
import { GradesPage } from "./pages/Grades.jsx";
import { GroupsPage } from "./pages/Groups.jsx";
import { StudentSettingsPage } from "./pages/StudentSettings.jsx";
import { TeacherDashboardPage } from "./pages/TeacherDashboard.jsx";
import { TeacherCoursePage } from "./pages/TeacherCourse.jsx";
import { TeacherSettingsPage } from "./pages/TeacherSettings.jsx";
import { TeacherGradesPage } from "./pages/TeacherGrades.jsx";
import { AssignmentPage } from "./pages/Assignment.jsx";
import { AnnouncementDetailPage } from "./pages/AnnouncementDetail.jsx";
import { DiscussionDetailPage } from "./pages/DiscussionDetail.jsx";
import { MOCK_NOTIFICATIONS } from "./data/notificationsData.js";
import { useAuth } from "./contexts/AuthContext.jsx";
import { LoginPage } from "./pages/Login.jsx";

function Navbar({ onToggleSidebar, mode = "student" }) {
  const { user } = useAuth();
  const isTeacher = mode === "teacher";
  const [notifications, setNotifications] = useState(() =>
    MOCK_NOTIFICATIONS.map((n) => ({ ...n })),
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const settingsHref = isTeacher ? "/teacher/settings" : "/settings";

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [dropdownOpen]);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <nav className="fixed w-full bg-gray-800 text-white z-50 px-4 h-16 flex items-center justify-between shadow-md">
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="md:hidden focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 rounded p-2"
          aria-label="Toggle sidebar"
          aria-expanded="false"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <Link href={isTeacher ? "/teacher" : "/"}>
          <a className="text-xl font-bold hidden sm:inline hover:opacity-90 transition-opacity">
            Classroom
          </a>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((o) => !o)}
            className="relative p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white transition-colors"
            aria-label="Notifications"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 overflow-hidden"
              role="menu"
            >
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="text-xs font-medium text-gray-700 hover:text-gray-900"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length ? (
                  notifications.map((n) => (
                    <Link key={n.id} href={n.link}>
                      <a
                        onClick={() => {
                          markAsRead(n.id);
                          setDropdownOpen(false);
                        }}
                        className={`block px-4 py-3 hover:bg-gray-50 transition-colors ${
                          !n.read ? "bg-gray-100" : ""
                        }`}
                      >
                        <p className="text-sm font-medium text-gray-900">
                          {n.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                          {n.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {n.timeAgo}
                        </p>
                      </a>
                    </Link>
                  ))
                ) : (
                  <p className="px-4 py-8 text-sm text-gray-500 text-center">
                    No notifications yet
                  </p>
                )}
              </div>
              <div className="px-4 py-2 border-t border-gray-100">
                <Link href={settingsHref}>
                  <a
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    <Settings className="w-4 h-4" />
                    Notification settings
                  </a>
                </Link>
              </div>
            </div>
          )}
        </div>

        <Link href={isTeacher ? "/teacher/settings" : "/settings"}>
          <a className="flex items-center space-x-2 cursor-pointer hover:opacity-90 transition-opacity px-3 py-2 rounded-lg hover:bg-gray-700">
            <div className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              {user?.initials || (isTeacher ? "SC" : "PA")}
            </div>
            <div className="hidden md:block text-left">
              <div className="font-medium text-sm">
                {user?.name ||
                  (isTeacher ? "Prof. Sarah Chen" : "Sadiq Haruna")}
              </div>
              <div className="text-xs text-gray-300">
                {isTeacher ? "Teacher" : "Student"}
              </div>
            </div>
          </a>
        </Link>
      </div>
    </nav>
  );
}

function Sidebar({ isOpen, onClose, mode = "student", onLogout }) {
  const [location] = useLocation();
  const isTeacher = mode === "teacher";

  const navItems = isTeacher
    ? [
        {
          href: "/teacher",
          label: "Dashboard",
          page: "dashboard",
          icon: LayoutDashboard,
        },
        { href: "/teacher/inbox", label: "Inbox", page: "inbox", icon: Mail },
        {
          href: "/teacher/calendar",
          label: "Calendar",
          page: "calendar",
          icon: Calendar,
        },
        {
          href: "/teacher/grades",
          label: "Grades",
          page: "grades",
          icon: Award,
        },
        {
          href: "/teacher/settings",
          label: "Settings",
          page: "settings",
          icon: Settings,
        },
      ]
    : [
        {
          href: "/",
          label: "Dashboard",
          page: "dashboard",
          icon: LayoutDashboard,
        },
        { href: "/courses", label: "Courses", page: "courses", icon: BookOpen },
        {
          href: "/calendar",
          label: "Calendar",
          page: "calendar",
          icon: Calendar,
        },
        { href: "/inbox", label: "Inbox", page: "inbox", icon: Mail },
        { href: "/grades", label: "Grades", page: "grades", icon: Award },
        { href: "/groups", label: "Groups", page: "groups", icon: Users },
        {
          href: "/settings",
          label: "Settings",
          page: "settings",
          icon: Settings,
        },
      ];

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location]);

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-gray-700 text-white w-40 z-40 overflow-y-auto custom-scrollbar transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        role="complementary"
        aria-label="Sidebar navigation"
      >
        <div className="flex flex-col h-full p-4">
          <div className="space-y-1 flex-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/teacher"
                  ? location === "/teacher"
                  : location === item.href || location.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <a
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg nav-link transition-colors ${
                      isActive
                        ? "bg-gray-600 border-l-4 border-white"
                        : "hover:bg-gray-600/80"
                    }`}
                    onClick={onClose}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span>{item.label}</span>
                  </a>
                </Link>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              onLogout?.();
            }}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg mt-4 transition-colors hover:bg-gray-600/80 text-white"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

function App() {
  const [location, setLocation] = useLocation();
  const { user, logout, ready } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mode =
    user?.role === "teacher" || location.startsWith("/teacher")
      ? "teacher"
      : "student";

  useEffect(() => {
    if (!user) {
      if (location.startsWith("/teacher") && location !== "/teacher/login") {
        setLocation("/teacher/login");
      } else if (location !== "/login" && !location.startsWith("/teacher")) {
        setLocation("/login");
      }
    }
  }, [user, location, setLocation]);

  if (location === "/login") {
    return <LoginPage role="student" />;
  }

  if (location === "/teacher/login") {
    return <LoginPage role="teacher" />;
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin w-8 h-8 border-2 border-gray-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const handleLogout = () => {
    logout();
    setLocation(mode === "teacher" ? "/teacher/login" : "/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar onToggleSidebar={toggleSidebar} mode={mode} />
      <div className="pt-16">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          mode={mode}
          onLogout={handleLogout}
        />
        <main className="ml-0 md:ml-40 min-h-[calc(100vh-4rem)] transition-all duration-300">
          <AnimatePresence mode="wait">
            <motion.div
              key={location}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <Switch>
                <Route path="/">
                  <StudentDashboardPage />
                </Route>
                <Route path="/courses">
                  <CoursesPage />
                </Route>
                <Route path="/course/:courseId/assignment/:assignmentId">
                  <AssignmentPage />
                </Route>
                <Route path="/course/:courseId/announcement/:announcementId">
                  <AnnouncementDetailPage />
                </Route>
                <Route path="/course/:courseId/discussion/:discussionId">
                  <DiscussionDetailPage />
                </Route>
                <Route path="/course/:id">
                  <CoursePage />
                </Route>
                <Route path="/course/:id/:tab">
                  <CoursePage />
                </Route>
                <Route path="/calendar">
                  <CalendarPage />
                </Route>
                <Route path="/inbox">
                  <InboxPage />
                </Route>
                <Route path="/grades">
                  <GradesPage />
                </Route>
                <Route path="/groups">
                  <GroupsPage />
                </Route>
                <Route path="/settings">
                  <StudentSettingsPage />
                </Route>
                <Route path="/teacher">
                  <TeacherDashboardPage />
                </Route>
                <Route path="/teacher/inbox">
                  <InboxPage />
                </Route>
                <Route path="/teacher/calendar">
                  <CalendarPage />
                </Route>
                <Route path="/teacher/settings">
                  <TeacherSettingsPage />
                </Route>
                <Route path="/teacher/grades">
                  <TeacherGradesPage />
                </Route>
                <Route path="/teacher/course/:id">
                  <TeacherCoursePage />
                </Route>
                <Route path="/teacher/course/:id/:tab">
                  <TeacherCoursePage />
                </Route>
                <Route>
                  <div className="flex h-full items-center justify-center text-sm text-gray-500 p-6">
                    Page coming soon
                  </div>
                </Route>
              </Switch>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default App;
