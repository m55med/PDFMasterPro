// Tool Cards Component

export class ToolCards {
    constructor() {
        this.grid = document.getElementById('toolsGrid');
        this.filters = document.querySelectorAll('.filter-btn');
        this.cards = document.querySelectorAll('.tool-card');
    }

    init() {
        if (!this.grid) return;
        this.bindEvents();
    }

    bindEvents() {
        // Tool clicking
        this.cards.forEach(card => {
            card.addEventListener('click', () => {
                const tool = card.dataset.tool;
                this.openTool(tool);
            });
        });

        // Category filtering
        this.filters.forEach(btn => {
            btn.addEventListener('click', () => {
                // Toggle active state
                this.filters.forEach(f => f.classList.remove('active'));
                btn.classList.add('active');

                // Filter
                const category = btn.dataset.category;
                this.filterByCategory(category);
            });
        });

        // Recommended list clicks (Right Sidebar)
        const recommendedList = document.getElementById('recommendedList');
        if (recommendedList) {
            recommendedList.querySelectorAll('li').forEach(item => {
                item.addEventListener('click', () => {
                    const tool = item.dataset.tool;
                    this.openTool(tool);
                });
            });
        }
    }

    openTool(toolName) {
        // Map tool names to their actual paths
        const toolPaths = {
            'merge': '../tools/merge/index.html',
            'split': '../tools/split/index.html',
            'compress': '../tools/compress/index.html',
            'rotate': '../tools/rotate/index.html',
            'protect': '../tools/protect/index.html',
            'unlock': '../tools/unlock/index.html',
            'watermark': '../tools/watermark/index.html',
            'page-numbers': '../tools/page-numbers/index.html',
            'ocr': '../tools/ocr/index.html',
            'jpg-to-pdf': '../tools/convert/jpg-to-pdf.html',
            'pdf-to-jpg': '../tools/convert/pdf-to-jpg.html',
            // Tools to be created
            'word-to-pdf': '../tools/convert/word-to-pdf.html',
            'html-to-pdf': '../tools/convert/html-to-pdf.html',
            'extract-pages': '../tools/extract/index.html',
            'organize': '../tools/organize/index.html',
            'crop': '../tools/crop/index.html',
            'sign': '../tools/sign/index.html',
            'redact': '../tools/redact/index.html',
            'compare': '../tools/compare/index.html',
            'repair': '../tools/repair/index.html',
            'remove-pages': '../tools/remove-pages/index.html'
        };

        const url = toolPaths[toolName];
        if (url) {
            window.location.href = url;
        } else {
            console.warn(`Tool "${toolName}" not found`);
            alert('This tool is coming soon!');
        }
    }

    filterByCategory(category) {
        this.cards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = 'block';
                // Add fade in animation
                card.animate([
                    { opacity: 0, transform: 'scale(0.95)' },
                    { opacity: 1, transform: 'scale(1)' }
                ], { duration: 200, easing: 'ease-out' });
            } else {
                card.style.display = 'none';
            }
        });
    }

    filterTools(query) {
        const term = query.toLowerCase();

        this.cards.forEach(card => {
            const title = card.querySelector('h4').textContent.toLowerCase();
            const desc = card.querySelector('p').textContent.toLowerCase();

            if (title.includes(term) || desc.includes(term)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
}
