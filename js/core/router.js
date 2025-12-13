/**
 * core/router.js
 * Hash-based SPA Router - Updated with Tab Support and Fixed Active State
 */

export class SPARouter {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.appContainer = null;
        this.elements = {};
        this.navMap = {
            dashboard: '/',
            courses: '/courses',
            calendar: '/calendar',
            inbox: '/inbox',
            grades: '/grades',
            groups: '/groups',
            settings: '/settings'
        };
    }

    register(path, handler) {
        this.routes.set(path, handler);
    }

    navigate(path, pushHash = true) {
        try {
            // Normalize - ensure it starts with '#'
            if (!path.startsWith('#')) {
                path = `#${path}`;
            }

            // Update hash if needed
            if (pushHash && window.location.hash !== path) {
                window.location.hash = path;
            }

            // Extract route and params
            const route = path.replace('#', '');
            const { handler, params } = this.match(route);

            if (handler) {
                this.currentRoute = route;
                handler(params);
                this.updateActiveNavLink(route);

                // Close mobile sidebar if open
                if (this.elements.sidebar) {
                    this.elements.sidebar.classList.add('-translate-x-full');
                }
                if (this.elements.sidebarBackdrop) {
                    this.elements.sidebarBackdrop.classList.add('opacity-0', 'pointer-events-none');
                }

                // Scroll to top
                window.scrollTo(0, 0);
            } else {
                // 404
                const notFoundHandler = this.routes.get('404');
                if (notFoundHandler) {
                    notFoundHandler();
                }
            }
        } catch (error) {
            console.error('Routing error:', error);
        }
    }

    match(route) {
        // Direct match
        if (this.routes.has(route)) {
            return { handler: this.routes.get(route), params: {} };
        }

        // Dynamic route matching
        for (const [pattern, handler] of this.routes) {
            const regex = this.pathToRegex(pattern);
            const match = route.match(regex);

            if (match) {
                const params = this.extractParams(pattern, match);
                return { handler, params };
            }
        }

        return { handler: null, params: {} };
    }

    pathToRegex(path) {
        // Convert /course/:id/tab/:tabname to regex
        const pattern = path
            .replace(/\//g, '\\/')
            .replace(/:([^\/]+)/g, '([^/]+)');
        return new RegExp(`^${pattern}$`);
    }

    extractParams(pattern, match) {
        const params = {};
        const keys = pattern.match(/:([^\/]+)/g);

        if (keys) {
            keys.forEach((key, index) => {
                const paramName = key.substring(1);
                params[paramName] = match[index + 1];
            });
        }

        // Extract query params
        const queryString = window.location.hash.split('?')[1];
        if (queryString) {
            const urlParams = new URLSearchParams(queryString);
            urlParams.forEach((value, key) => {
                params[key] = value;
            });
        }

        return params;
    }

    updateActiveNavLink(route) {
        const links = document.querySelectorAll('.nav-link');

        // First, remove active class from ALL links
        links.forEach(link => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        });

        // Then, add active class to the matching link
        links.forEach(link => {
            const page = link.getAttribute('data-page');
            const expectedRoute = this.navMap[page];

            if (!expectedRoute) return;

            // Special handling for different route types
            let isActive = false;

            if (expectedRoute === '/') {
                // Dashboard: exact match only
                isActive = route === '/';
            } else if (route.startsWith('/course/')) {
                // Course routes: activate 'courses' nav item
                isActive = page === 'courses';
            } else if (route.startsWith('/teacher/')) {
                // Teacher routes: activate 'dashboard' nav item
                isActive = page === 'dashboard';
            } else {
                // All other routes: exact match or starts with
                isActive = route === expectedRoute || route.startsWith(expectedRoute + '/');
            }

            if (isActive) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            }
        });
    }

    init(appContainer, elements) {
        this.appContainer = appContainer;
        this.elements = elements;

        // Listen to hash changes
        window.addEventListener('hashchange', () => {
            this.navigate(window.location.hash, false);
        });

        // Initial route
        const initialHash = window.location.hash || '#/';
        this.navigate(initialHash, false);
    }
}
