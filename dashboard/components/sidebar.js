// Sidebar Component

export class Sidebar {
    constructor() {
        this.navItems = document.querySelectorAll('.nav-item');
        this.pages = {
            dashboard: document.querySelector('.content-wrapper'),
            // Other pages will be separate HTMLs or hidden sections
        };
    }

    init() {
        this.bindEvents();
        this.highlightActivePage();
    }

    bindEvents() {
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const page = item.dataset.page;
                this.handleNavigation(page, item);
            });
        });
    }

    handleNavigation(page, activeItem) {
        const routes = {
            'dashboard': 'index.html',
            'documents': '../pages/documents/index.html',
            'recent': '../pages/recent/index.html',
            'favorites': '../pages/favorites/index.html',
            'collections': '../pages/collections/index.html',
            'settings': '../pages/settings/index.html',
            'help': '../pages/help/index.html',
            'statistics': '../pages/stats/index.html',
            'donate': '../pages/donate/index.html'
        };

        if (page === 'dashboard') {
            // If we are already on dashboard, just active class (handled by default on load)
            // But if we were elsewhere, we'd navigate. Since this JS is only ON dashboard, 
            // clicking dashboard just stays here.
            this.setActiveItem(activeItem);
        } else if (routes[page]) {
            window.location.href = routes[page];
        } else {
            // For incomplete sections
            console.log(`Page ${page} not implemented yet`);
            // Optional: Show "Coming Soon" toast
            if (window.notifications) window.notifications.info('Coming soon!');
        }
    }

    setActiveItem(item) {
        this.navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
    }

    highlightActivePage() {
        // Check URL or simple state to highlight active item
        // Default is dashboard which is hardcoded in HTML for now
    }
}
