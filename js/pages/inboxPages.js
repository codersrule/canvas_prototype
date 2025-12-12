/**
 * pages/inboxPage.js
 * Inbox Page View for EduVerse Dashboard
 * Integrated with existing security and state management
 */

import { escapeHtml } from '../core/utils.js';
import { getCurrentUser } from '../core/roleManager.js';
import { getInboxConversations, getInboxCourses } from '../shared/inboxData.js';

export class InboxPage {
    constructor(appContainer) {
        this.appContainer = appContainer;
        this.state = {
            conversations: [],
            selectedConversationId: null,
            checkedConversationIds: new Set(),
            filters: {
                course: '',
                folder: 'inbox',
                search: ''
            }
        };
        this.searchTimeout = null;
    }

    /**
     * Render the inbox page
     */
    render() {
        // Load conversations
        this.state.conversations = getInboxConversations();

        // Render main layout
        this.appContainer.innerHTML = this.getMainHTML();

        // Setup event listeners
        this.setupEventListeners();

        // Populate course filter
        this.populateCourseFilter();

        // Render conversation list
        this.renderConversationList();

        // Render empty message thread
        this.renderMessageThread();
    }

    /**
     * Get main HTML structure
     */
    getMainHTML() {
        return `
            <div class="inbox-page fade-in">
                <!-- Header -->
                <header class="inbox-header bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between gap-4">
                    <div class="flex items-center gap-3">
                        <select id="inbox-course-filter" class="inbox-filter-dropdown px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                            <option value="">All Courses</option>
                        </select>
                        <select id="inbox-folder-filter" class="inbox-filter-dropdown px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                            <option value="inbox">Inbox</option>
                            <option value="sent">Sent</option>
                            <option value="archived">Archived</option>
                            <option value="starred">Starred</option>
                        </select>
                    </div>
                    <div class="flex-1 max-w-2xl">
                        <div class="relative">
                            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.35-4.35"></path>
                            </svg>
                            <input type="text" 
                                   id="inbox-search-input" 
                                   class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
                                   placeholder="Search...">
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button class="inbox-icon-btn p-2 rounded-lg hover:bg-gray-100" title="Compose" id="compose-btn">
                            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <button class="inbox-icon-btn p-2 rounded-lg hover:bg-gray-100" title="Reply" id="reply-btn">
                            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                        </button>
                        <button class="inbox-icon-btn p-2 rounded-lg hover:bg-gray-100" title="Archive" id="archive-btn">
                            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                        </button>
                        <button class="inbox-icon-btn p-2 rounded-lg hover:bg-gray-100" title="Delete" id="delete-btn">
                            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </header>

                <!-- Main Content Container -->
                <div class="inbox-main flex h-[calc(100vh-10rem)]">
                    <!-- Conversation List -->
                    <aside class="inbox-sidebar w-96 bg-white border-r border-gray-200 overflow-y-auto">
                        <div id="conversation-list" class="divide-y divide-gray-100">
                            <!-- Conversations will be rendered here -->
                        </div>
                    </aside>

                    <!-- Message Thread -->
                    <main class="inbox-content flex-1 bg-white overflow-y-auto">
                        <div id="message-thread">
                            <!-- Message thread will be rendered here -->
                        </div>
                    </main>
                </div>
            </div>

            <style>
                .inbox-page {
                    margin: -1.5rem;
                    height: calc(100vh - 4rem);
                    display: flex;
                    flex-direction: column;
                }
                
                .inbox-header {
                    flex-shrink: 0;
                }
                
                .inbox-main {
                    flex: 1;
                    overflow: hidden;
                }
                
                .inbox-sidebar::-webkit-scrollbar,
                .inbox-content::-webkit-scrollbar {
                    width: 8px;
                }
                
                .inbox-sidebar::-webkit-scrollbar-track,
                .inbox-content::-webkit-scrollbar-track {
                    background: #f3f4f6;
                }
                
                .inbox-sidebar::-webkit-scrollbar-thumb,
                .inbox-content::-webkit-scrollbar-thumb {
                    background: #d1d5db;
                    border-radius: 4px;
                }
                
                .inbox-sidebar::-webkit-scrollbar-thumb:hover,
                .inbox-content::-webkit-scrollbar-thumb:hover {
                    background: #9ca3af;
                }
                
                .conversation-item {
                    cursor: pointer;
                    transition: background-color 0.15s;
                }
                
                .conversation-item:hover {
                    background-color: #f9fafb;
                }
                
                .conversation-item.selected {
                    background-color: #dbeafe;
                    border-left: 4px solid #3b82f6;
                }
                
                .conversation-item.unread .conversation-subject,
                .conversation-item.unread .conversation-participants {
                    font-weight: 600;
                }
                
                .conversation-star {
                    color: #d1d5db;
                    transition: color 0.2s;
                }
                
                .conversation-star:hover {
                    color: #fbbf24;
                }
                
                .conversation-star.starred {
                    color: #fbbf24;
                }
            </style>
        `;
    }

    /**
     * Populate course filter dropdown
     */
    populateCourseFilter() {
        const filterEl = document.getElementById('inbox-course-filter');
        if (!filterEl) return;

        const courses = getInboxCourses();
        const options = courses.map(course =>
            `<option value="${escapeHtml(course.name)}">${escapeHtml(course.name)}</option>`
        ).join('');

        filterEl.innerHTML = '<option value="">All Courses</option>' + options;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Course filter
        const courseFilter = document.getElementById('inbox-course-filter');
        if (courseFilter) {
            courseFilter.addEventListener('change', (e) => {
                this.state.filters.course = e.target.value;
                this.renderConversationList();
            });
        }

        // Folder filter
        const folderFilter = document.getElementById('inbox-folder-filter');
        if (folderFilter) {
            folderFilter.addEventListener('change', (e) => {
                this.state.filters.folder = e.target.value;
                this.renderConversationList();
            });
        }

        // Search input (debounced)
        const searchInput = document.getElementById('inbox-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.state.filters.search = e.target.value;
                    this.renderConversationList();
                }, 300);
            });
        }

        // Action buttons
        const deleteBtn = document.getElementById('delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.handleDelete());
        }

        const archiveBtn = document.getElementById('archive-btn');
        if (archiveBtn) {
            archiveBtn.addEventListener('click', () => this.handleArchive());
        }

        const composeBtn = document.getElementById('compose-btn');
        if (composeBtn) {
            composeBtn.addEventListener('click', () => this.handleCompose());
        }

        // Conversation list (use event delegation)
        const conversationList = document.getElementById('conversation-list');
        if (conversationList) {
            conversationList.addEventListener('click', (e) => {
                const conversationItem = e.target.closest('.conversation-item');
                if (!conversationItem) return;

                const conversationId = conversationItem.dataset.conversationId;
                const action = e.target.closest('[data-action]')?.dataset.action;

                if (action === 'check') {
                    e.stopPropagation();
                    this.toggleCheck(conversationId);
                } else if (action === 'star') {
                    e.stopPropagation();
                    this.toggleStar(conversationId);
                } else {
                    this.selectConversation(conversationId);
                }
            });
        }
    }

    /**
     * Get filtered conversations
     */
    getFilteredConversations() {
        return this.state.conversations.filter(conv => {
            // Course filter
            if (this.state.filters.course && conv.course !== this.state.filters.course) {
                return false;
            }

            // Folder filter
            if (this.state.filters.folder === 'starred' && !conv.starred) {
                return false;
            }

            // Search filter
            if (this.state.filters.search) {
                const searchLower = this.state.filters.search.toLowerCase();
                const searchableText = [
                    conv.subject,
                    conv.participants.join(' '),
                    conv.preview
                ].join(' ').toLowerCase();

                if (!searchableText.includes(searchLower)) {
                    return false;
                }
            }

            return true;
        });
    }

    /**
     * Render conversation list
     */
    renderConversationList() {
        const listEl = document.getElementById('conversation-list');
        if (!listEl) return;

        const conversations = this.getFilteredConversations();

        if (conversations.length === 0) {
            listEl.innerHTML = `
                <div class="flex flex-col items-center justify-center py-16 text-gray-400">
                    <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p class="text-sm">No conversations found</p>
                </div>
            `;
            return;
        }

        listEl.innerHTML = conversations.map(conv => this.renderConversationItem(conv)).join('');
    }

    /**
     * Render single conversation item
     */
    renderConversationItem(conv) {
        const isSelected = this.state.selectedConversationId === conv.id;
        const isChecked = this.state.checkedConversationIds.has(conv.id);
        const initials = this.getInitials(conv.participants[0]);
        const formattedDate = this.formatDate(conv.date);

        return `
            <div class="conversation-item ${isSelected ? 'selected' : ''} ${conv.unread ? 'unread' : ''} flex px-4 py-3" 
                 data-conversation-id="${escapeHtml(conv.id)}">
                <div class="flex-shrink-0 mr-3 pt-1">
                    <input type="checkbox" 
                           ${isChecked ? 'checked' : ''}
                           data-action="check"
                           class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                           aria-label="Select conversation">
                </div>
                <div class="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-semibold text-sm flex-shrink-0 mr-3">
                    ${escapeHtml(initials)}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between mb-1">
                        <span class="text-xs text-gray-500">${escapeHtml(formattedDate)}</span>
                        ${conv.messageCount > 1 ? `
                            <span class="inline-flex items-center justify-center min-w-[20px] h-5 px-2 bg-gray-800 text-white text-xs font-semibold rounded-full">
                                ${conv.messageCount}
                            </span>
                        ` : ''}
                    </div>
                    <div class="text-sm text-gray-900 truncate conversation-participants mb-1">
                        ${conv.participants.map(p => escapeHtml(p)).join(', ')}
                    </div>
                    <div class="text-sm text-gray-900 truncate conversation-subject mb-1">
                        ${escapeHtml(conv.subject)}
                    </div>
                    <div class="text-sm text-gray-500 truncate">
                        ${escapeHtml(conv.preview)}
                    </div>
                    <div class="flex items-center justify-between mt-2">
                        <button class="conversation-star ${conv.starred ? 'starred' : ''} p-1" 
                                data-action="star"
                                aria-label="${conv.starred ? 'Unstar' : 'Star'} conversation">
                            <svg class="w-4 h-4" fill="${conv.starred ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render message thread
     */
    renderMessageThread() {
        const threadEl = document.getElementById('message-thread');
        if (!threadEl) return;

        const conversation = this.state.conversations.find(c => c.id === this.state.selectedConversationId);

        if (!conversation) {
            threadEl.innerHTML = `
                <div class="flex flex-col items-center justify-center h-full text-gray-400">
                    <svg class="w-32 h-32 mb-6" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    <p class="text-lg font-medium text-gray-600">No Conversations Selected</p>
                </div>
            `;
            return;
        }

        threadEl.innerHTML = `
            <!-- Thread Header -->
            <div class="border-b border-gray-200 p-6 bg-white sticky top-0 z-10">
                <div class="flex items-center justify-between mb-2">
                    <h2 class="text-xl font-semibold text-gray-900">${escapeHtml(conversation.subject)}</h2>
                    <div class="flex gap-2">
                        <button class="p-2 rounded-lg hover:bg-gray-100" title="Back" onclick="document.getElementById('message-thread').querySelector('.thread-back')?.click()">
                            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Messages -->
            <div class="p-6 space-y-6">
                ${conversation.messages.map(msg => this.renderMessage(msg, conversation)).join('')}
            </div>

            <!-- Reply Area -->
            <div class="border-t border-gray-200 p-6 bg-gray-50">
                <textarea id="reply-textarea" 
                          class="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
                          rows="4" 
                          placeholder="Reply to this conversation..."></textarea>
                <div class="flex items-center justify-between mt-3">
                    <button class="p-2 rounded-lg hover:bg-gray-200" title="Attach file">
                        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                    </button>
                    <div class="flex gap-2">
                        <button class="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">
                            Cancel
                        </button>
                        <button id="send-reply-btn" 
                                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Send
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Setup send button handler
        const sendBtn = document.getElementById('send-reply-btn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.handleSendReply());
        }
    }

    /**
     * Render single message
     */
    renderMessage(msg, conversation) {
        const initials = this.getInitials(msg.sender);
        const formattedBody = escapeHtml(msg.body).replace(/\n/g, '<br>');

        return `
            <div class="flex gap-3">
                <div class="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-semibold text-sm flex-shrink-0">
                    ${escapeHtml(initials)}
                </div>
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="font-semibold text-gray-900">${escapeHtml(msg.sender)}</span>
                        <span class="text-xs text-gray-500">${conversation.course}</span>
                        <span class="text-xs text-gray-500">•</span>
                        <span class="text-xs text-gray-500">${this.formatDate(msg.date)}</span>
                    </div>
                    <div class="text-gray-700 leading-relaxed">
                        ${formattedBody}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Select conversation
     */
    selectConversation(conversationId) {
        this.state.selectedConversationId = conversationId;

        // Mark as read
        const conv = this.state.conversations.find(c => c.id === conversationId);
        if (conv) {
            conv.unread = false;
        }

        this.renderConversationList();
        this.renderMessageThread();
    }

    /**
     * Toggle checkbox
     */
    toggleCheck(conversationId) {
        if (this.state.checkedConversationIds.has(conversationId)) {
            this.state.checkedConversationIds.delete(conversationId);
        } else {
            this.state.checkedConversationIds.add(conversationId);
        }
        this.renderConversationList();
    }

    /**
     * Toggle star
     */
    toggleStar(conversationId) {
        const conv = this.state.conversations.find(c => c.id === conversationId);
        if (conv) {
            conv.starred = !conv.starred;
            this.renderConversationList();
        }
    }

    /**
     * Handle delete
     */
    handleDelete() {
        if (this.state.checkedConversationIds.size === 0) {
            alert('Please select conversations to delete');
            return;
        }

        if (confirm(`Delete ${this.state.checkedConversationIds.size} conversation(s)?`)) {
            this.state.conversations = this.state.conversations.filter(
                conv => !this.state.checkedConversationIds.has(conv.id)
            );
            this.state.checkedConversationIds.clear();

            if (this.state.selectedConversationId &&
                !this.state.conversations.find(c => c.id === this.state.selectedConversationId)) {
                this.state.selectedConversationId = null;
            }

            this.renderConversationList();
            this.renderMessageThread();
        }
    }

    /**
     * Handle archive
     */
    handleArchive() {
        if (this.state.checkedConversationIds.size === 0) {
            alert('Please select conversations to archive');
            return;
        }

        console.log('Archiving conversations:', Array.from(this.state.checkedConversationIds));

        this.state.conversations = this.state.conversations.filter(
            conv => !this.state.checkedConversationIds.has(conv.id)
        );
        this.state.checkedConversationIds.clear();

        this.renderConversationList();
        this.renderMessageThread();
    }

    /**
     * Handle compose
     */
    handleCompose() {
        alert('Compose feature coming soon!');
    }

    /**
     * Handle send reply
     */
    handleSendReply() {
        const textarea = document.getElementById('reply-textarea');
        if (!textarea) return;

        const messageBody = textarea.value.trim();
        if (!messageBody) {
            alert('Please enter a message');
            return;
        }

        const conversation = this.state.conversations.find(c => c.id === this.state.selectedConversationId);
        if (!conversation) return;

        const user = getCurrentUser();
        const newMessage = {
            id: 'm' + Date.now(),
            sender: user.name,
            date: new Date(),
            body: messageBody
        };

        conversation.messages.push(newMessage);
        conversation.date = newMessage.date;
        conversation.preview = messageBody.substring(0, 50) + '...';

        textarea.value = '';
        this.renderMessageThread();
    }

    /**
     * Get initials from name
     */
    getInitials(name) {
        if (!name) return '?';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    /**
     * Format date
     */
    formatDate(date) {
        const d = new Date(date);
        const now = new Date();
        const diffTime = Math.abs(now - d);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        } else if (diffDays < 365) {
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } else {
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
    }
}
