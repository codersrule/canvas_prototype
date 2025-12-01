/**
 * shared/components/roleSwitcher.js
 * Role Switcher Component - Updated with Dynamic Sidebar
 * Allows switching between student/teacher views and updates sidebar navigation
 */

import { getCurrentUser, roleManager } from "../../core/roleManager.js";

/**
 * Initialize role switcher functionality
 */
function initRoleSwitcher() {
    const switcherBtn = document.getElementById('role-switcher-btn');
    const dropdown = document.getElementById('role-switcher-dropdown');
    const switchToStudent = document.getElementById('switch-to-student');
    const switchToTeacher = document.getElementById('switch-to-teacher');

    // Toggle dropdown
    if (switcherBtn && dropdown) {
        switcherBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('hidden');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && !switcherBtn.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });
    }

    // Switch to student
    if (switchToStudent) {
        switchToStudent.addEventListener('click', () => {
            roleManager.switchToStudent();
            updateUserDisplay();
            updateSidebarNavigation(); // Update sidebar
            dropdown.classList.add('hidden');
            window.location.hash = '#/';
            window.location.reload(); // Reload to apply role change
        });
    }

    // Switch to teacher
    if (switchToTeacher) {
        switchToTeacher.addEventListener('click', () => {
            roleManager.switchToTeacher();
            updateUserDisplay();
            updateSidebarNavigation(); // Update sidebar
            dropdown.classList.add('hidden');
            window.location.hash = '#/teacher/dashboard';
            window.location.reload(); // Reload to apply role change
        });
    }

    // Initial display update
    updateUserDisplay();
    updateSidebarNavigation(); // Initialize sidebar on load
}

/**
 * Update user display based on current role
 */
function updateUserDisplay() {
    const user = getCurrentUser();

    if (!user) {
        console.warn('No user found in roleManager');
        return;
    }

    // Update avatar
    const avatar = document.getElementById('user-avatar');
    if (avatar) {
        avatar.textContent = user.initials;
        avatar.className = user.isTeacher()
            ? 'w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center text-white font-bold text-sm'
            : 'w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm';
    }

    // Update name
    const userName = document.getElementById('user-name');
    if (userName) userName.textContent = user.name;

    // Update role
    const userRole = document.getElementById('user-role');
    if (userRole) {
        userRole.textContent = user.isTeacher() ? 'Teacher' : 'Student';
    }

    // Update dropdown info
    const dropdownName = document.getElementById('dropdown-user-name');
    if (dropdownName) dropdownName.textContent = user.name;

    const dropdownEmail = document.getElementById('dropdown-user-email');
    if (dropdownEmail) dropdownEmail.textContent = user.email;

    // Highlight active role
    const studentBtn = document.getElementById('switch-to-student');
    const teacherBtn = document.getElementById('switch-to-teacher');

    if (user.isStudent()) {
        studentBtn?.classList.add('bg-blue-50', 'border-2', 'border-blue-500');
        teacherBtn?.classList.remove('bg-purple-50', 'border-2', 'border-purple-500');
    } else {
        teacherBtn?.classList.add('bg-purple-50', 'border-2', 'border-purple-500');
        studentBtn?.classList.remove('bg-blue-50', 'border-2', 'border-blue-500');
    }
}

/**
 * Update sidebar navigation based on current role
 */
function updateSidebarNavigation() {
    const user = getCurrentUser();
    if (!user) return;

    const sidebar = document.querySelector('#sidebar nav');
    if (!sidebar) {
        console.warn('Sidebar navigation not found');
        return;
    }

    // Define navigation items for each role
    const studentNav = [
        {
            label: 'Dashboard',
            icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />`,
            page: 'dashboard'
        },
        {
            label: 'Courses',
            icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />`,
            page: 'courses'
        },
        {
            label: 'Calendar',
            icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />`,
            page: 'calendar'
        },
        {
            label: 'Inbox',
            icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />`,
            page: 'inbox'
        },
        {
            label: 'Grades',
            icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />`,
            page: 'grades'
        },
        {
            label: 'Groups',
            icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />`,
            page: 'groups'
        },
        {
            label: 'Settings',
            icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />`,
            page: 'settings'
        }
    ];

    const teacherNav = [
        {
            label: 'Dashboard',
            icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />`,
            page: 'dashboard'
        },
        {
            label: 'My Courses',
            icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />`,
            page: 'courses'
        },
        {
            label: 'Grading',
            icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />`,
            page: 'grading'
        },
        {
            label: 'Students',
            icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />`,
            page: 'students'
        },
        {
            label: 'Analytics',
            icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />`,
            page: 'analytics'
        },
        {
            label: 'Calendar',
            icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />`,
            page: 'calendar'
        },
        {
            label: 'Settings',
            icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />`,
            page: 'settings'
        }
    ];

    // Select navigation based on role
    const navItems = user.isTeacher() ? teacherNav : studentNav;

    // Generate HTML
    const navHTML = navItems.map(item => `
        <a href="#" class="nav-link flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors" data-page="${item.page}">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                ${item.icon}
            </svg>
            <span>${item.label}</span>
        </a>
    `).join('');

    // Update sidebar
    sidebar.innerHTML = navHTML;

    // Re-attach event listeners to new nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const page = link.getAttribute('data-page');
            if (!page) return;
            e.preventDefault();

            // Determine route based on role and page
            let route = '/';
            if (user.isTeacher()) {
                if (page === 'dashboard') route = '/teacher/dashboard';
                else if (page === 'courses') route = '/teacher/dashboard'; // Could be /teacher/courses
                else if (page === 'grading') route = '/teacher/dashboard'; // Placeholder
                else if (page === 'students') route = '/teacher/dashboard'; // Placeholder
                else if (page === 'analytics') route = '/teacher/dashboard'; // Placeholder
                else route = `/${page}`;
            } else {
                if (page === 'dashboard') route = '/';
                else route = `/${page}`;
            }

            window.location.hash = `#${route}`;
        });
    });

    // Set active state on current page
    updateActiveNavLink();
}

/**
 * Update active nav link based on current route
 */
function updateActiveNavLink() {
    const currentHash = window.location.hash;
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.classList.remove('active', 'bg-blue-800');
        link.removeAttribute('aria-current');
    });

    // Find matching link
    navLinks.forEach(link => {
        const page = link.getAttribute('data-page');

        if (
            (currentHash === '#/' && page === 'dashboard') ||
            (currentHash.includes('/courses') && page === 'courses') ||
            (currentHash.includes('/calendar') && page === 'calendar') ||
            (currentHash.includes('/inbox') && page === 'inbox') ||
            (currentHash.includes('/grades') && page === 'grades') ||
            (currentHash.includes('/groups') && page === 'groups') ||
            (currentHash.includes('/settings') && page === 'settings') ||
            (currentHash.includes('/teacher/dashboard') && page === 'dashboard') ||
            (currentHash.includes('/grading') && page === 'grading') ||
            (currentHash.includes('/students') && page === 'students') ||
            (currentHash.includes('/analytics') && page === 'analytics')
        ) {
            link.classList.add('active', 'bg-blue-800');
            link.setAttribute('aria-current', 'page');
        }
    });
}

// Export for use in other modules
export { initRoleSwitcher, updateUserDisplay, updateSidebarNavigation };
