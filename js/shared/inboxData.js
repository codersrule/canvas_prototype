/**
 * shared/inboxData.js
 * Inbox Data - Conversations and Messages
 * Provides mock data for inbox functionality
 */

/**
 * Mock inbox conversations data
 */
export const inboxConversations = [
    {
        id: '1',
        participants: ['Sadiq Haruna', 'Quoc Viet P Dang'],
        subject: 'Scored less than 5 on Career Services Office Hours (Mandatory)',
        preview: 'Hello Sir, Yes, I attended career servi...',
        date: new Date('2025-12-10T15:23:00'),
        unread: true,
        starred: false,
        messageCount: 2,
        course: 'ECPS 294 - F25: MECPS PROSEMINAR (15290)',
        messages: [
            {
                id: 'm1',
                sender: 'Sadiq Haruna',
                date: new Date('2025-12-10T15:23:00'),
                body: 'Hello Sir,\n\nYes, I attended career services. I have submitted a screenshot of my appointment to the assignment portal.\n\nThank you'
            },
            {
                id: 'm2',
                sender: 'Quoc Viet P Dang',
                date: new Date('2025-12-10T14:39:00'),
                body: 'Hello All,\n\nI\'m sure most of you actually went to career services office hours this quarter. Please post something to show you went: if you didn\'t take a selfie, it\'s fine; just post a screenshot of your reservation or a follow-up email.\n\nSame for any other events/workshops you attended but didn\'t take a selfie - just upload something that shows you went & we will adjust the score accordingly.\n\nQV'
            }
        ]
    },
    {
        id: '2',
        participants: ['Chaoran Yuan', 'Rainer Doemer', 'Bradley Chu'],
        subject: 'Assignment #1 Questions',
        preview: 'Hi Ray, 1. My understanding is that the...',
        date: new Date('2025-09-30T10:15:00'),
        unread: true,
        starred: false,
        messageCount: 2,
        course: 'EECS 224 - Advanced Computer Architecture',
        messages: [
            {
                id: 'm3',
                sender: 'Chaoran Yuan',
                date: new Date('2025-09-30T10:15:00'),
                body: 'Hi Ray,\n\n1. My understanding is that the assignment requires us to implement the cache coherence protocol. Could you clarify if we need to handle all edge cases or just the basic protocol?\n\n2. For the performance evaluation, should we use the provided traces or generate our own?\n\nThanks!'
            },
            {
                id: 'm4',
                sender: 'Rainer Doemer',
                date: new Date('2025-09-29T16:20:00'),
                body: 'Hi everyone,\n\nPlease feel free to post any questions about Assignment #1 here. I\'ll monitor this thread regularly.\n\nBest,\nRay'
            }
        ]
    },
    {
        id: '3',
        participants: ['Allen Dai', 'Bradley Chu', 'Kelly Xiao', 'Shiv'],
        subject: 'discord',
        preview: 'not sure if we have discord yet but here...',
        date: new Date('2025-09-27T09:30:00'),
        unread: false,
        starred: false,
        messageCount: 1,
        course: 'CS 132 - Computer Networks',
        messages: [
            {
                id: 'm5',
                sender: 'Allen Dai',
                date: new Date('2025-09-27T09:30:00'),
                body: 'not sure if we have discord yet but here is the link: https://discord.gg/cs132study\n\nFeel free to join! We can use this for study groups and assignment discussions.'
            }
        ]
    },
    {
        id: '4',
        participants: ['Allen Dai', 'Bradley Chu', 'Kelly Xiao', 'Shiv'],
        subject: 'discord',
        preview: 'Not sure if we have discord here is one:...',
        date: new Date('2025-09-27T09:25:00'),
        unread: false,
        starred: false,
        messageCount: 1,
        course: 'CS 132 - Computer Networks',
        messages: [
            {
                id: 'm6',
                sender: 'Allen Dai',
                date: new Date('2025-09-27T09:25:00'),
                body: 'Not sure if we have discord here is one: https://discord.gg/cs132backup\n\nBackup link in case the other one expires.'
            }
        ]
    },
    {
        id: '5',
        participants: ['Allen Dai', 'Bradley Chu', 'Kelly Xiao', 'Shiv'],
        subject: 'discord',
        preview: 'Not sure if we have a discord already bu...',
        date: new Date('2025-09-27T09:20:00'),
        unread: false,
        starred: false,
        messageCount: 1,
        course: 'CS 132 - Computer Networks',
        messages: [
            {
                id: 'm7',
                sender: 'Allen Dai',
                date: new Date('2025-09-27T09:20:00'),
                body: 'Not sure if we have a discord already but here\'s a link if anyone wants to join. Let me know if it works!'
            }
        ]
    },
    {
        id: '6',
        participants: ['Prof. Pattis', 'Sadiq Haruna'],
        subject: 'Re: Assignment 3 Extension Request',
        preview: 'Thank you for reaching out. I understand...',
        date: new Date('2025-11-03T14:20:00'),
        unread: false,
        starred: true,
        messageCount: 3,
        course: 'ICS 31 - Introduction to Programming',
        messages: [
            {
                id: 'm8',
                sender: 'Prof. Pattis',
                date: new Date('2025-11-03T14:20:00'),
                body: 'Thank you for reaching out. I understand you have multiple deadlines this week. I can grant you a 48-hour extension on Assignment 3.\n\nThe new due date will be November 7th at 11:59 PM.\n\nBest,\nProf. Pattis'
            },
            {
                id: 'm9',
                sender: 'Sadiq Haruna',
                date: new Date('2025-11-03T10:15:00'),
                body: 'Dear Prof. Pattis,\n\nI hope this email finds you well. I\'m writing to request a 48-hour extension on Assignment 3 due to overlapping deadlines with my other courses this week.\n\nI\'ve already started the assignment and have completed the first two problems. I just need a bit more time to ensure I submit quality work on the remaining problems.\n\nThank you for your consideration.\n\nBest regards,\nPeter'
            },
            {
                id: 'm10',
                sender: 'Prof. Pattis',
                date: new Date('2025-11-02T09:00:00'),
                body: 'Reminder: Assignment 3 is due this Friday, November 5th at 11:59 PM. Please make sure to test your code thoroughly before submission.\n\nIf you have any questions, please don\'t hesitate to reach out during office hours or via email.'
            }
        ]
    }
];

/**
 * Get all inbox conversations
 */
export const getInboxConversations = () => {
    return inboxConversations;
};

/**
 * Get conversation by ID
 */
export const getConversationById = (id) => {
    return inboxConversations.find(conv => conv.id === id);
};

/**
 * Get courses for filter dropdown
 */
export const getInboxCourses = () => {
    const uniqueCourses = [...new Set(inboxConversations.map(conv => conv.course).filter(c => c))];
    return uniqueCourses.map((courseName, index) => ({
        id: index + 1,
        name: courseName
    }));
};

/**
 * Get unread count
 */
export const getUnreadCount = () => {
    return inboxConversations.filter(conv => conv.unread).length;
};

/**
 * Mark conversation as read
 */
export const markAsRead = (conversationId) => {
    const conv = inboxConversations.find(c => c.id === conversationId);
    if (conv) {
        conv.unread = false;
    }
};

/**
 * Toggle star on conversation
 */
export const toggleConversationStar = (conversationId) => {
    const conv = inboxConversations.find(c => c.id === conversationId);
    if (conv) {
        conv.starred = !conv.starred;
    }
};

/**
 * Add message to conversation
 */
export const addMessage = (conversationId, message) => {
    const conv = inboxConversations.find(c => c.id === conversationId);
    if (conv) {
        conv.messages.push({
            id: 'm' + Date.now(),
            ...message,
            date: message.date || new Date()
        });
        conv.date = message.date || new Date();
        conv.preview = message.body.substring(0, 50) + '...';
        conv.messageCount = conv.messages.length;
    }
};

/**
 * Delete conversations
 */
export const deleteConversations = (conversationIds) => {
    conversationIds.forEach(id => {
        const index = inboxConversations.findIndex(c => c.id === id);
        if (index !== -1) {
            inboxConversations.splice(index, 1);
        }
    });
};
