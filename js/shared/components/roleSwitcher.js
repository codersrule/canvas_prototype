/**
 * Role Switcher Component
 * Allows switching between student/teacher views
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
            dropdown.classList.add('hidden');
            window.location.hash = '#/teacher/dashboard';
            window.location.reload(); // Reload to apply role change
        });
    }

    // Initial display update
    updateUserDisplay();
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

// Export for use in other modules
export { initRoleSwitcher, updateUserDisplay };