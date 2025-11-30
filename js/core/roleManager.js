/**
 * Role Management System for EduVerse
 * Handles user roles (student, teacher, admin) and permissions
 */

export const ROLES = {
    STUDENT: 'student',
    TEACHER: 'teacher',
    ADMIN: 'admin'
};

export const PERMISSIONS = {
    // Student permissions
    VIEW_COURSES: 'view_courses',
    SUBMIT_ASSIGNMENTS: 'submit_assignments',
    VIEW_GRADES: 'view_grades',
    PARTICIPATE_DISCUSSIONS: 'participate_discussions',

    // Teacher permissions
    MANAGE_COURSES: 'manage_courses',
    GRADE_ASSIGNMENTS: 'grade_assignments',
    CREATE_ANNOUNCEMENTS: 'create_announcements',
    VIEW_STUDENT_PROGRESS: 'view_student_progress',
    MANAGE_MODULES: 'manage_modules',

    // Admin permissions
    MANAGE_USERS: 'manage_users',
    MANAGE_SYSTEM: 'manage_system',
    VIEW_ANALYTICS: 'view_analytics'
};

// Role-based permissions mapping
const ROLE_PERMISSIONS = {
    [ROLES.STUDENT]: [
        PERMISSIONS.VIEW_COURSES,
        PERMISSIONS.SUBMIT_ASSIGNMENTS,
        PERMISSIONS.VIEW_GRADES,
        PERMISSIONS.PARTICIPATE_DISCUSSIONS
    ],
    [ROLES.TEACHER]: [
        PERMISSIONS.VIEW_COURSES,
        PERMISSIONS.MANAGE_COURSES,
        PERMISSIONS.GRADE_ASSIGNMENTS,
        PERMISSIONS.CREATE_ANNOUNCEMENTS,
        PERMISSIONS.VIEW_STUDENT_PROGRESS,
        PERMISSIONS.MANAGE_MODULES,
        PERMISSIONS.VIEW_ANALYTICS
    ],
    [ROLES.ADMIN]: Object.values(PERMISSIONS) // All permissions
};

/**
 * User class to manage current user state
 */
class User {
    constructor(userData) {
        this.id = userData.id;
        this.name = userData.name;
        this.email = userData.email;
        this.role = userData.role || ROLES.STUDENT;
        this.initials = userData.initials;
        this.avatar = userData.avatar || null;

        // Teacher-specific data
        this.teachingCourses = userData.teachingCourses || [];
        this.department = userData.department || null;
    }

    /**
     * Check if user has a specific permission
     */
    hasPermission(permission) {
        const permissions = ROLE_PERMISSIONS[this.role] || [];
        return permissions.includes(permission);
    }

    /**
     * Check if user has a specific role
     */
    hasRole(role) {
        return this.role === role;
    }

    /**
     * Check if user is a teacher
     */
    isTeacher() {
        return this.role === ROLES.TEACHER || this.role === ROLES.ADMIN;
    }

    /**
     * Check if user is a student
     */
    isStudent() {
        return this.role === ROLES.STUDENT;
    }

    /**
     * Check if user is an admin
     */
    isAdmin() {
        return this.role === ROLES.ADMIN;
    }

    /**
     * Get user's teaching courses
     */
    getTeachingCourses() {
        return this.teachingCourses;
    }

    /**
     * Check if user teaches a specific course
     */
    teachesCourse(courseId) {
        return this.teachingCourses.includes(courseId);
    }
}

/**
 * Role Manager - manages user roles and switching
 */
class RoleManager {
    constructor() {
        this.currentUser = null;
        this.loadUser();
    }

    /**
     * Load user from localStorage or set default
     */
    loadUser() {
        const savedUser = localStorage.getItem('eduverse_current_user');
        if (savedUser) {
            this.currentUser = new User(JSON.parse(savedUser));
        } else {
            // Default student user
            this.setUser({
                id: 1,
                name: 'Sadiq Haruna',
                email: 'peter@uci.edu',
                initials: 'PA',
                role: ROLES.STUDENT
            });
        }
    }

    /**
     * Save user to localStorage
     */
    saveUser() {
        if (this.currentUser) {
            localStorage.setItem('eduverse_current_user', JSON.stringify({
                id: this.currentUser.id,
                name: this.currentUser.name,
                email: this.currentUser.email,
                role: this.currentUser.role,
                initials: this.currentUser.initials,
                avatar: this.currentUser.avatar,
                teachingCourses: this.currentUser.teachingCourses,
                department: this.currentUser.department
            }));
        }
    }

    /**
     * Set current user
     */
    setUser(userData) {
        this.currentUser = new User(userData);
        this.saveUser();
    }

    /**
     * Get current user
     */
    getUser() {
        return this.currentUser;
    }

    /**
     * Switch user role (for demo/testing purposes)
     */
    switchRole(role) {
        if (this.currentUser && Object.values(ROLES).includes(role)) {
            this.currentUser.role = role;

            // Add teaching courses if switching to teacher
            if (role === ROLES.TEACHER) {
                this.currentUser.teachingCourses = [1, 2, 3]; // Sample courses
                this.currentUser.department = 'Computer Science';
            }

            this.saveUser();
            return true;
        }
        return false;
    }

    /**
     * Switch to predefined teacher account
     */
    switchToTeacher() {
        this.setUser({
            id: 100,
            name: 'Prof. Sarah Chen',
            email: 'schen@uci.edu',
            initials: 'SC',
            role: ROLES.TEACHER,
            teachingCourses: [1, 2, 3, 4, 5, 6],
            department: 'Computer Science',
            avatar: null
        });
    }

    /**
     * Switch to predefined student account
     */
    switchToStudent() {
        this.setUser({
            id: 1,
            name: 'Sadiq Haruna',
            email: 'peter@uci.edu',
            initials: 'PA',
            role: ROLES.STUDENT,
            avatar: null
        });
    }

    /**
     * Check if current user has permission
     */
    hasPermission(permission) {
        return this.currentUser ? this.currentUser.hasPermission(permission) : false;
    }

    /**
     * Check if current user has role
     */
    hasRole(role) {
        return this.currentUser ? this.currentUser.hasRole(role) : false;
    }
}

// Create and export singleton instance
export const roleManager = new RoleManager();

/**
 * Helper function to get current user
 */
export const getCurrentUser = () => {
    return roleManager.getUser();
};

/**
 * Helper function to check permission
 */
export const hasPermission = (permission) => {
    return roleManager.hasPermission(permission);
};

/**
 * Helper function to check role
 */
export const hasRole = (role) => {
    return roleManager.hasRole(role);
};

/**
 * Helper function to check if user is teacher
 */
export const isTeacher = () => {
    const user = roleManager.getUser();
    return user ? user.isTeacher() : false;
};

/**
 * Helper function to check if user is student
 */
export const isStudent = () => {
    const user = roleManager.getUser();
    return user ? user.isStudent() : false;
};