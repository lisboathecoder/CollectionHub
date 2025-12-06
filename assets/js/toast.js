// Sistema de Notificações Toast - CollectionHub

class ToastNotification {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    if (!document.getElementById('toast-container')) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    } else {
      this.container = document.getElementById('toast-container');
    }

    if (!document.getElementById('toast-styles')) {
      this.addStyles();
    }
  }

  addStyles() {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      .toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .toast {
        background: #2a2a2a;
        border-radius: 8px;
        padding: 16px 20px;
        min-width: 300px;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        gap: 12px;
        animation: slideIn 0.3s ease-out;
        border-left: 4px solid;
      }

      .toast.success { border-color: #4caf50; }
      .toast.error { border-color: #f44336; }
      .toast.warning { border-color: #ff9800; }
      .toast.info { border-color: #2196f3; }

      .toast-icon {
        font-size: 24px;
        flex-shrink: 0;
      }

      .toast.success .toast-icon { color: #4caf50; }
      .toast.error .toast-icon { color: #f44336; }
      .toast.warning .toast-icon { color: #ff9800; }
      .toast.info .toast-icon { color: #2196f3; }

      .toast-content {
        flex: 1;
      }

      .toast-title {
        font-weight: 600;
        font-size: 15px;
        margin-bottom: 4px;
        color: #fff;
      }

      .toast-message {
        font-size: 14px;
        color: #ccc;
        line-height: 1.4;
      }

      .toast-close {
        background: transparent;
        border: none;
        color: #999;
        font-size: 18px;
        cursor: pointer;
        padding: 4px;
        transition: color 0.2s;
      }

      .toast-close:hover {
        color: #fff;
      }

      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes slideOut {
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }

      .toast.removing {
        animation: slideOut 0.3s ease-in forwards;
      }

      @media (max-width: 640px) {
        .toast-container {
          left: 16px;
          right: 16px;
        }
        .toast {
          min-width: auto;
        }
      }
    `;
    document.head.appendChild(style);
  }

  show(message, type = 'info', duration = 4000) {
    const config = {
      success: { icon: 'fa-circle-check', title: 'Sucesso!' },
      error: { icon: 'fa-circle-xmark', title: 'Erro!' },
      warning: { icon: 'fa-triangle-exclamation', title: 'Atenção!' },
      info: { icon: 'fa-circle-info', title: 'Informação' }
    };

    const { icon, title } = config[type] || config.info;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    toast.innerHTML = `
      <div class="toast-icon">
        <i class="fa-solid ${icon}"></i>
      </div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close">
        <i class="fa-solid fa-times"></i>
      </button>
    `;

    this.container.appendChild(toast);

    toast.querySelector('.toast-close').addEventListener('click', () => {
      this.remove(toast);
    });

    setTimeout(() => this.remove(toast), duration);

    return toast;
  }

  remove(toast) {
    if (!toast || !toast.parentElement) return;
    
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }

  success(message, duration = 4000) {
    return this.show(message, 'success', duration);
  }

  error(message, duration = 5000) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration = 4500) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration = 4000) {
    return this.show(message, 'info', duration);
  }
}

window.Toast = new ToastNotification();

window.showToast = (message, type = 'info', duration) => {
  return window.Toast.show(message, type, duration);
};

window.showNotification = (message, type = 'success') => {
  return window.Toast.show(message, type);
};

console.log('Toast system loaded');
