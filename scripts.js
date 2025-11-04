// Global JavaScript functions
document.addEventListener('DOMContentLoaded', () => {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));

    // Sidebar toggle functionality
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('custom-sidebar');
    const mainContent = document.querySelector('main');

    if (sidebarToggle && sidebar && mainContent) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('-translate-x-full');
            sidebar.classList.toggle('md:translate-x-0');
            mainContent.classList.toggle('md:ml-64');
        });
    }

    // Course card click handlers
    document.querySelectorAll('.course-card').forEach(card => {
        card.addEventListener('click', function() {
            // In a real app, this would navigate to the course page
            console.log('Navigating to course page');
        });
    });
});

// Notification count update
function updateNotificationCount(count) {
    const badge = document.getElementById('notification-badge');
    if (badge) {
        badge.textContent = count;
        badge.classList.toggle('hidden', count === 0);
    }
}

// Example: Update notification count
// updateNotificationCount(3);