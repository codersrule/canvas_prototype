import { coursesData } from "./data.js";

export function buildCalendarEvents() {
    const events = [];

    coursesData.forEach(course => {
        course.assignments.forEach(a => {
            events.push({
                id: a.id,
                courseId: course.id,
                title: a.title,
                date: a.dueDate,         // YYYY-MM-DD
                time: a.time || null,    // NEW: "10:30a", "6p", etc.
                type: "assignment",
                color: course.color
            });
        });

        if (course.events) {
            course.events.forEach(e => {
                events.push({
                    id: e.id,
                    courseId: course.id,
                    title: e.title,
                    type: e.type,
                    date: e.date,
                    time: e.time || null,
                    color: course.color
                });
            });
        }
    });

    return events;
}

