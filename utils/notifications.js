// PDF Master Pro - Toast Notifications System

class NotificationManager {
    constructor() {
        this.container = null;
        this.queue = [];
        this.maxVisible = 3;
        this.defaultDuration = 4000;
    }

    // Initialize notification container
    init() {
        if (this.container) return this;

        this.container = document.createElement('div');
        this.container.className = 'notification-container';
        this.container.innerHTML = '';
        document.body.appendChild(this.container);

        this.injectStyles();

        return this;
    }

    // Inject notification styles
    injectStyles() {
        if (document.getElementById('notification-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
      .notification-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 12px;
        max-width: 380px;
        pointer-events: none;
      }

      .notification {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 14px 16px;
        background: #FFFFFF;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        pointer-events: auto;
        animation: slideIn 0.3s ease;
        border-left: 4px solid;
        max-width: 100%;
      }

      .notification.success {
        border-left-color: #10B981;
      }

      .notification.warning {
        border-left-color: #F59E0B;
      }

      .notification.error {
        border-left-color: #EF4444;
      }

      .notification.info {
        border-left-color: #3B82F6;
      }

      .notification.exiting {
        animation: slideOut 0.3s ease forwards;
      }

      .notification-icon {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .notification.success .notification-icon {
        background: #D1FAE5;
        color: #10B981;
      }

      .notification.warning .notification-icon {
        background: #FEF3C7;
        color: #F59E0B;
      }

      .notification.error .notification-icon {
        background: #FEE2E2;
        color: #EF4444;
      }

      .notification.info .notification-icon {
        background: #DBEAFE;
        color: #3B82F6;
      }

      .notification-content {
        flex: 1;
        min-width: 0;
      }

      .notification-title {
        font-weight: 600;
        font-size: 14px;
        color: #1F2937;
        margin-bottom: 2px;
      }

      .notification-message {
        font-size: 13px;
        color: #6B7280;
        line-height: 1.4;
        word-wrap: break-word;
      }

      .notification-close {
        width: 24px;
        height: 24px;
        border: none;
        background: transparent;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #9CA3AF;
        border-radius: 4px;
        transition: all 0.2s;
        flex-shrink: 0;
      }

      .notification-close:hover {
        background: #F3F4F6;
        color: #4B5563;
      }

      .notification-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: rgba(0, 0, 0, 0.1);
        border-radius: 0 0 12px 12px;
        overflow: hidden;
      }

      .notification-progress-bar {
        height: 100%;
        background: currentColor;
        opacity: 0.3;
        animation: progress linear forwards;
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(100px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes slideOut {
        from {
          opacity: 1;
          transform: translateX(0);
        }
        to {
          opacity: 0;
          transform: translateX(100px);
        }
      }

      @keyframes progress {
        from {
          width: 100%;
        }
        to {
          width: 0%;
        }
      }
    `;
        document.head.appendChild(styles);
    }

    // Show notification
    show(options) {
        this.init();

        const {
            type = 'info',
            title = '',
            message = '',
            duration = this.defaultDuration
        } = options;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.position = 'relative';

        const icon = this.getIcon(type);

        notification.innerHTML = `
      <div class="notification-icon">${icon}</div>
      <div class="notification-content">
        ${title ? `<div class="notification-title">${this.escapeHtml(title)}</div>` : ''}
        <div class="notification-message">${this.escapeHtml(message)}</div>
      </div>
      <button class="notification-close" aria-label="Close">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <div class="notification-progress">
        <div class="notification-progress-bar" style="animation-duration: ${duration}ms"></div>
      </div>
    `;

        // Add close handler
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => this.dismiss(notification));

        // Add to container
        this.container.appendChild(notification);

        // Auto-dismiss after duration
        setTimeout(() => {
            this.dismiss(notification);
        }, duration);

        return notification;
    }

    // Dismiss notification
    dismiss(notification) {
        if (!notification || !notification.parentNode) return;

        notification.classList.add('exiting');

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    // Get icon SVG by type
    getIcon(type) {
        const icons = {
            success: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"/>
      </svg>`,
            warning: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>`,
            error: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>`,
            info: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>`
        };
        return icons[type] || icons.info;
    }

    // Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Convenience methods
    success(message, title = 'Success') {
        return this.show({ type: 'success', title, message });
    }

    warning(message, title = 'Warning') {
        return this.show({ type: 'warning', title, message });
    }

    error(message, title = 'Error') {
        return this.show({ type: 'error', title, message });
    }

    info(message, title = 'Info') {
        return this.show({ type: 'info', title, message });
    }
}

// Create singleton
const notifications = new NotificationManager();

// Export
window.NotificationManager = NotificationManager;
window.notifications = notifications;

export default notifications;
export { NotificationManager, notifications };
