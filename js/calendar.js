import { courseDetails } from "./courseData.js";

export function buildCalendarEvents() {
    const events = [];

    // Iterate through all courses in courseDetails
    Object.values(courseDetails).forEach(course => {
        // Add assignments as events
        if (course.assignments) {
            course.assignments.forEach(assignment => {
                // Parse the date string (e.g., "Nov 5 at 11:59pm")
                const normalizedDate = normalizeDate(assignment.dueDate);

                if (normalizedDate) {
                    events.push({
                        id: `assignment-${course.id}-${assignment.id}`,
                        courseId: course.id,
                        assignmentId: assignment.id,
                        title: assignment.title,
                        date: normalizedDate,
                        type: "assignment",
                        color: course.color,
                        points: assignment.points,
                        submitted: assignment.submitted
                    });
                }
            });
        }

        // Add course events if they exist
        if (course.events) {
            course.events.forEach(event => {
                const normalizedDate = normalizeDate(event.date);

                if (normalizedDate) {
                    events.push({
                        id: `event-${course.id}-${event.id}`,
                        courseId: course.id,
                        title: event.title,
                        type: event.type || "event",
                        date: normalizedDate,
                        color: course.color,
                        time: event.time || null
                    });
                }
            });
        }
    });

    return events;
}

// Helper function to normalize various date formats to YYYY-MM-DD
function normalizeDate(dateStr) {
    // If already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr;
    }

    // Try to parse "Nov 5 at 11:59pm" or "Oct 15 at 11:59pm" format
    try {
        // Add current year if not present
        const dateWithYear = dateStr.includes('2025') ? dateStr : `${dateStr} 2025`;
        const parsed = new Date(dateWithYear);

        if (!isNaN(parsed.getTime())) {
            const year = parsed.getFullYear();
            const month = String(parsed.getMonth() + 1).padStart(2, '0');
            const day = String(parsed.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
    } catch (e) {
        console.warn('Could not parse date:', dateStr);
    }

    return null;
}
