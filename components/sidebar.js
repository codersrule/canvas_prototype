class CustomSidebar extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                aside {
                    width: 16rem;
                    box-shadow: 2px 0 4px rgba(0, 0, 0, 0.05);
                }
                
                .nav-link {
                    transition: all 0.2s ease;
                }
                
                .nav-link:hover {
                    background-color: rgba(255, 255, 255, 0.1);
                }
                
                .nav-link.active {
                    background-color: rgba(255, 255, 255, 0.15);
                    border-left: 4px solid white;
                }
                
                @media (max-width: 768px) {
                    aside {
                        transform: translateX(-100%);
                    }
                }
            </style>
            <aside class="fixed top-16 left-0 h-screen bg-blue-700 text-white pt-4 transform -translate-x-full md:translate-x-0 z-40 overflow-y-auto">
                <div class="space-y-1 px-4">
                    <a href="#" class="nav-link active flex items-center space-x-3 px-4 py-3 rounded-lg">
                        <i data-feather="home" class="w-5 h-5"></i>
                        <span>Dashboard</span>
                    </a>
                    
                    <a href="#" class="nav-link flex items-center space-x-3 px-4 py-3 rounded-lg">
                        <i data-feather="book" class="w-5 h-5"></i>
                        <span>Courses</span>
                    </a>
                    
                    <a href="#" class="nav-link flex items-center space-x-3 px-4 py-3 rounded-lg">
                        <i data-feather="calendar" class="w-5 h-5"></i>
                        <span>Calendar</span>
                    </a>
                    
                    <a href="#" class="nav-link flex items-center space-x-3 px-4 py-3 rounded-lg">
                        <i data-feather="mail" class="w-5 h-5"></i>
                        <span>Inbox</span>
                    </a>
                    
                    <a href="#" class="nav-link flex items-center space-x-3 px-4 py-3 rounded-lg">
                        <i data-feather="award" class="w-5 h-5"></i>
                        <span>Grades</span>
                    </a>
                    
                    <a href="#" class="nav-link flex items-center space-x-3 px-4 py-3 rounded-lg">
                        <i data-feather="users" class="w-5 h-5"></i>
                        <span>Groups</span>
                    </a>
                    
                    <a href="#" class="nav-link flex items-center space-x-3 px-4 py-3 rounded-lg">
                        <i data-feather="settings" class="w-5 h-5"></i>
                        <span>Settings</span>
                    </a>
                </div>
            </aside>
        `;
    }
}

customElements.define('custom-sidebar', CustomSidebar);