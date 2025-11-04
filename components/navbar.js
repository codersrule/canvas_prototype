class CustomNavbar extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                nav {
                    height: 64px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                }
                
                .notification-badge {
                    top: -0.5rem;
                    right: -0.5rem;
                    font-size: 0.6rem;
                    min-width: 1.25rem;
                    height: 1.25rem;
                }
                
                @media (max-width: 768px) {
                    .logo-text {
                        display: none;
                    }
                }
            </style>
            <nav class="fixed w-full bg-blue-600 text-white z-50 px-4 flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <button id="sidebar-toggle" class="md:hidden focus:outline-none">
                        <i data-feather="menu" class="w-6 h-6"></i>
                    </button>
                    <a href="#" class="flex items-center">
                        <i data-feather="book-open" class="w-6 h-6 mr-2"></i>
                        <span class="logo-text text-xl font-bold">EduVerse</span>
                    </a>
                </div>
                
                <div class="flex items-center space-x-4">
                    <button class="relative p-2 rounded-full hover:bg-blue-500 focus:outline-none">
                        <i data-feather="bell" class="w-5 h-5"></i>
                        <span id="notification-badge" class="notification-badge absolute bg-red-500 rounded-full flex items-center justify-center hidden">3</span>
                    </button>
                    
                    <div class="flex items-center space-x-2">
                        <div class="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-blue-600 font-bold">PA</div>
                        <span class="hidden md:inline">Peter Anteater</span>
                    </div>
                </div>
            </nav>
        `;
    }
}

customElements.define('custom-navbar', CustomNavbar);