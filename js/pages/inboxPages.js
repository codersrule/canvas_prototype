/**
 * pages/inboxPage.js
 * Mobile-Responsive Inbox Page - FIXED VERSION
 * Gmail-style messaging interface with mobile optimization
 */

import { escapeHtml } from '../core/utils.js';
import {
    getInboxConversations,
    getConversationById,
    getInboxCourses,
    markAsRead,
    toggleConversationStar,
    addMessage,
    deleteConversations
} from '../shared/inboxData.js';

export class InboxPage {
    constructor(appContainer) {
        this.appContainer = appContainer;
        this.conversations = [];
        this.selectedConversationId = null;
        this.checkedConversationIds = new Set();
        this.filters = {
            course: 'all',
            folder: 'inbox',
            search: ''
        };

        // Mobile state
        this.mobileView = 'list'; // 'list' or 'detail'
        this.isMobile = window.innerWidth < 768;

        // Bind methods
        this.handleResize = this.handleResize.bind(this);
    }

    render() {
        // Update mobile state
        this.isMobile = window.innerWidth < 768;

        // Load conversations
        this.conversations = getInboxConversations();
        this.filterConversations();

        this.appContainer.innerHTML = `
            <div class="inbox-page h-full flex flex-col bg-gray-50">
                ${this.renderHeader()}
                ${this.renderContent()}
            </div>

            <style>
                .inbox-page {
                    height: calc(100vh - 64px);
                }

                /* Conversation List Styles */
                .conversation-item {
                    transition: all 0.15s ease;
                    cursor: pointer;
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

                /* Star Button */
                .star-btn {
                    transition: color 0.15s ease;
                }

                .star-btn:hover {
                    color: #fbbf24;
                }

                .star-btn.starred {
                    color: #fbbf24;
                    fill: #fbbf24;
                }

                /* Message Count Badge */
                .message-count {
                    background-color: #1f2937;
                    color: white;
                    font-size: 0.75rem;
                    font-weight: 600;
                    padding: 0.125rem 0.5rem;
                    border-radius: 9999px;
                    min-width: 1.5rem;
                    text-align: center;
                }

                /* Custom Scrollbar */
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }

                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(0, 0, 0, 0.2);
                    border-radius: 3px;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: rgba(0, 0, 0, 0.3);
                }

                /* Avatar Styles */
                .avatar-circle {
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    font-size: 0.875rem;
                }

                /* Mobile Styles */
                @media (max-width: 767px) {
                    .inbox-page {
                        height: calc(100vh - 56px);
                    }

                    .mobile-list-view .conversation-list-panel {
                        display: flex !important;
                    }

                    .mobile-list-view .message-detail-panel {
                        display: none !important;
                    }

                    .mobile-detail-view .conversation-list-panel {
                        display: none !important;
                    }

                    .mobile-detail-view .message-detail-panel {
                        display: flex !important;
                    }

                    .mobile-back-btn {
                        display: flex !important;
                    }

                    .desktop-header-actions {
                        display: none !important;
                    }

                    /* Hide some elements on mobile */
                    .mobile-hide {
                        display: none !important;
                    }
                }

                @media (min-width: 768px) {
                    .mobile-back-btn {
                        display: none !important;
                    }
                }

                /* Reply Textarea */
                .reply-textarea {
                    resize: vertical;
                    min-height: 80px;
                }

                /* Empty State */
                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    color: #9ca3af;
                }

                /* Action Button Styles */
                .action-btn {
                    transition: all 0.15s ease;
                }

                .action-btn:hover {
                    background-color: #f3f4f6;
                }

                .action-btn:active {
                    background-color: #e5e7eb;
                }
            </style>
        `;

        this.attachEventListeners();

        // Add resize listener
        window.addEventListener('resize', this.handleResize);
    }

    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth < 768;

        // Re-render if mobile state changed
        if (wasMobile !== this.isMobile) {
            this.render();
        }
    }

    renderHeader() {
        const selectedCount = this.checkedConversationIds.size;
        const courses = getInboxCourses();

        return `
            <div class="inbox-header bg-white border-b border-gray-200 flex-shrink-0">
                <!-- Mobile Back Button (shown only in detail view) -->
                ${this.mobileView === 'detail' ? `
                    <div class="mobile-back-btn hidden p-3 border-b border-gray-200">
                        <button onclick="window.inboxPage.showMobileList()" 
                                class="flex items-center gap-2 text-blue-600 font-medium">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Inbox
                        </button>
                    </div>
                ` : ''}

                <!-- Desktop/List View Header -->
                ${this.mobileView === 'list' || !this.isMobile ? `
                    <div class="p-3 md:p-4 space-y-3">
                        <!-- Filters Row -->
                        <div class="flex flex-wrap gap-2 md:gap-3">
                            <!-- Course Filter -->
                            <select id="course-filter" 
                                    class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 md:flex-none md:min-w-[180px]">
                                <option value="all">All Courses</option>
                                ${courses.map(course => `
                                    <option value="${escapeHtml(course.name)}">${escapeHtml(course.name)}</option>
                                `).join('')}
                            </select>

                            <!-- Folder Filter -->
                            <select id="folder-filter" 
                                    class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 md:flex-none md:min-w-[150px]">
                                <option value="inbox">Inbox</option>
                                <option value="sent">Sent</option>
                                <option value="archived">Archived</option>
                                <option value="starred">Starred</option>
                            </select>

                            <!-- Search -->
                            <div class="flex-1 md:flex-none md:min-w-[250px]">
                                <input type="text" 
                                       id="inbox-search" 
                                       placeholder="Search messages..." 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                        </div>

                        <!-- Actions Row (Desktop) -->
                        <div class="desktop-header-actions flex items-center justify-between gap-2">
                            <div class="flex items-center gap-2">
                                ${selectedCount > 0 ? `
                                    <button onclick="window.inboxPage.deleteSelected()" 
                                            class="action-btn px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Delete (${selectedCount})
                                    </button>
                                    <button onclick="window.inboxPage.archiveSelected()" 
                                            class="action-btn px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-1">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                        </svg>
                                        Archive
                                    </button>
                                ` : `
                                    <span class="text-sm text-gray-600">${this.conversations.length} conversation${this.conversations.length !== 1 ? 's' : ''}</span>
                                `}
                            </div>

                            <button onclick="window.inboxPage.composeMessage()" 
                                    class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                </svg>
                                <span class="mobile-hide">Compose</span>
                            </button>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderContent() {
        const viewClass = this.isMobile ?
            (this.mobileView === 'list' ? 'mobile-list-view' : 'mobile-detail-view') : '';

        return `
            <div class="inbox-content flex flex-1 overflow-hidden ${viewClass}">
                ${this.renderConversationList()}
                ${this.renderMessageDetail()}
            </div>
        `;
    }

    renderConversationList() {
        return `
            <div class="conversation-list-panel w-full md:w-96 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
                <div class="conversation-list flex-1 overflow-y-auto custom-scrollbar">
                    ${this.conversations.length > 0 ?
            this.conversations.map(conv => this.renderConversationItem(conv)).join('') :
            `<div class="empty-state p-8 text-center text-gray-400">
                            <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <p class="text-sm">No conversations found</p>
                        </div>`
        }
                </div>
            </div>
        `;
    }

    renderConversationItem(conversation) {
        const isSelected = this.selectedConversationId === conversation.id;
        const isChecked = this.checkedConversationIds.has(conversation.id);
        const isUnread = conversation.unread;
        const isStarred = conversation.starred;

        return `
            <div class="conversation-item ${isSelected ? 'selected' : ''} ${isUnread ? 'unread' : ''} 
                        border-b border-gray-100 p-3"
                 data-conversation-id="${conversation.id}">
                <div class="flex items-start gap-2 md:gap-3">
                    <!-- Checkbox (desktop only) -->
                    <input type="checkbox" 
                           class="conversation-checkbox mt-1 flex-shrink-0 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mobile-hide"
                           data-conversation-id="${conversation.id}"
                           ${isChecked ? 'checked' : ''}
                           onclick="event.stopPropagation(); window.inboxPage.toggleCheckbox('${conversation.id}')">

                    <!-- Avatar -->
                    <div class="avatar-circle w-10 h-10 rounded-full bg-blue-500 text-white">
                        ${this.getInitials(conversation.participants[0])}
                    </div>

                    <!-- Content -->
                    <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between gap-2 mb-1">
                            <div class="conversation-participants text-sm text-gray-900 truncate">
                                ${escapeHtml(this.formatParticipants(conversation.participants))}
                            </div>
                            <div class="flex items-center gap-2 flex-shrink-0">
                                <span class="text-xs text-gray-500 whitespace-nowrap">
                                    ${escapeHtml(this.formatDate(conversation.date))}
                                </span>
                            </div>
                        </div>

                        <div class="conversation-subject text-sm text-gray-900 mb-1 truncate">
                            ${escapeHtml(conversation.subject)}
                        </div>

                        <div class="flex items-center justify-between gap-2">
                            <div class="conversation-preview text-xs text-gray-600 truncate flex-1">
                                ${escapeHtml(conversation.preview)}
                            </div>
                            
                            <div class="flex items-center gap-2 flex-shrink-0">
                                ${conversation.messageCount > 1 ?
            `<span class="message-count">${conversation.messageCount}</span>` :
            ''
        }
                                <button class="star-btn ${isStarred ? 'starred' : ''}" 
                                        data-conversation-id="${conversation.id}"
                                        onclick="event.stopPropagation(); window.inboxPage.toggleStar('${conversation.id}')">
                                    <svg class="w-4 h-4" fill="${isStarred ? 'currentColor' : 'none'}" 
                                         stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        ${conversation.course ? `
                            <div class="mt-2">
                                <span class="inline-block text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                    ${escapeHtml(conversation.course)}
                                </span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    renderMessageDetail() {
        if (!this.selectedConversationId) {
            return `
                <div class="message-detail-panel hidden md:flex flex-1 items-center justify-center bg-white">
                    <div class="empty-state text-center">
                        <svg class="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <p class="text-lg font-medium text-gray-900 mb-2">No Conversation Selected</p>
                        <p class="text-sm text-gray-500">Select a conversation to view messages</p>
                    </div>
                </div>
            `;
        }

        const conversation = getConversationById(this.selectedConversationId);
        if (!conversation) return '';

        return `
            <div class="message-detail-panel hidden md:flex flex-col w-full bg-white">
                <!-- Message Header -->
                <div class="message-header p-3 md:p-4 border-b border-gray-200 flex-shrink-0">
                    <h2 class="text-lg md:text-xl font-semibold text-gray-900 mb-1">${escapeHtml(conversation.subject)}</h2>
                    <p class="text-sm text-gray-600">${escapeHtml(this.formatParticipants(conversation.participants))}</p>
                </div>

                <!-- Messages -->
                <div class="messages-container flex-1 overflow-y-auto custom-scrollbar p-3 md:p-6 space-y-4 md:space-y-6">
                    ${conversation.messages.map(msg => this.renderMessage(msg)).join('')}
                </div>

                <!-- Reply Section -->
                <div class="reply-section p-3 md:p-4 border-t border-gray-200 flex-shrink-0">
                    <textarea id="reply-input" 
                              placeholder="Type your reply..." 
                              class="reply-textarea w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                    <div class="flex justify-between items-center mt-3">
                        <div class="flex gap-2">
                            <button class="action-btn p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="Attach file">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                            </button>
                        </div>
                        <button onclick="window.inboxPage.sendReply()" 
                                class="px-4 md:px-6 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                            Send
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderMessage(message) {
        return `
            <div class="message">
                <div class="flex items-start gap-3">
                    <div class="avatar-circle w-10 h-10 rounded-full bg-purple-500 text-white flex-shrink-0">
                        ${this.getInitials(message.sender)}
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-baseline gap-2 mb-1 flex-wrap">
                            <span class="font-semibold text-gray-900 text-sm">${escapeHtml(message.sender)}</span>
                            <span class="text-xs text-gray-500">${escapeHtml(this.formatMessageDate(message.date))}</span>
                        </div>
                        <div class="text-sm text-gray-700 whitespace-pre-wrap break-words">${escapeHtml(message.body)}</div>
                    </div>
                </div>
            </div>
        `;
    }

    // Mobile-specific methods
    showMobileList() {
        this.mobileView = 'list';
        this.selectedConversationId = null;
        this.render();
    }

    showMobileDetail(conversationId) {
        this.selectConversation(conversationId);
        if (this.isMobile) {
            this.mobileView = 'detail';
            this.render();
        }
    }

    // Helper methods
    getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    formatParticipants(participants) {
        if (participants.length === 1) return participants[0];
        if (participants.length === 2) return participants.join(', ');
        return `${participants[0]}, ${participants[1]} +${participants.length - 2}`;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        } else if (diffDays < 7) {
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    }

    formatMessageDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    }

    filterConversations() {
        let filtered = getInboxConversations();

        // Apply course filter
        if (this.filters.course !== 'all') {
            filtered = filtered.filter(c => c.course === this.filters.course);
        }

        // Apply folder filter
        if (this.filters.folder === 'starred') {
            filtered = filtered.filter(c => c.starred);
        }

        // Apply search filter
        if (this.filters.search) {
            const search = this.filters.search.toLowerCase();
            filtered = filtered.filter(c =>
                c.subject.toLowerCase().includes(search) ||
                c.participants.some(p => p.toLowerCase().includes(search)) ||
                c.preview.toLowerCase().includes(search)
            );
        }

        this.conversations = filtered;
    }

    selectConversation(conversationId) {
        this.selectedConversationId = conversationId;
        markAsRead(conversationId);

        if (!this.isMobile) {
            this.render();
        }
    }

    toggleCheckbox(conversationId) {
        if (this.checkedConversationIds.has(conversationId)) {
            this.checkedConversationIds.delete(conversationId);
        } else {
            this.checkedConversationIds.add(conversationId);
        }
        this.render();
    }

    toggleStar(conversationId) {
        toggleConversationStar(conversationId);
        this.render();
    }

    sendReply() {
        const input = document.getElementById('reply-input');
        if (!input || !input.value.trim()) return;

        const message = {
            sender: 'You',
            body: input.value,
            date: new Date().toISOString()
        };

        addMessage(this.selectedConversationId, message);
        input.value = '';
        this.render();
    }

    deleteSelected() {
        if (this.checkedConversationIds.size === 0) return;

        if (confirm(`Delete ${this.checkedConversationIds.size} conversation(s)?`)) {
            deleteConversations(Array.from(this.checkedConversationIds));
            this.checkedConversationIds.clear();
            this.render();
        }
    }

    archiveSelected() {
        this.checkedConversationIds.clear();
        this.render();
    }

    composeMessage() {
        alert('Compose message feature coming soon!');
    }

    attachEventListeners() {
        // Make methods available globally
        window.inboxPage = this;

        // Conversation item clicks
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const conversationId = item.dataset.conversationId;
                this.showMobileDetail(conversationId);
            });
        });

        // Filter changes
        const courseFilter = document.getElementById('course-filter');
        if (courseFilter) {
            courseFilter.value = this.filters.course;
            courseFilter.addEventListener('change', (e) => {
                this.filters.course = e.target.value;
                this.filterConversations();
                this.render();
            });
        }

        const folderFilter = document.getElementById('folder-filter');
        if (folderFilter) {
            folderFilter.value = this.filters.folder;
            folderFilter.addEventListener('change', (e) => {
                this.filters.folder = e.target.value;
                this.filterConversations();
                this.render();
            });
        }

        // Search with debounce
        const searchInput = document.getElementById('inbox-search');
        if (searchInput) {
            searchInput.value = this.filters.search;
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.filters.search = e.target.value;
                    this.filterConversations();
                    this.render();
                }, 300);
            });
        }
    }

    destroy() {
        window.removeEventListener('resize', this.handleResize);
        delete window.inboxPage;
    }
}
