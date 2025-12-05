window.showToast = function(message, type = 'info', duration = 4000) {
  // remover toasts existentes
  const existingToasts = document.querySelectorAll('.toast-notification');
  existingToasts.forEach(toast => {
    toast.remove();
  });

  // criar novo toast
  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type}`;
  
  // ícones baseados no tipo
  const icons = {
    success: 'fa-circle-check',
    error: 'fa-circle-xmark',
    warning: 'fa-triangle-exclamation',
    info: 'fa-circle-info'
  };
  
  const icon = icons[type] || icons.info;
  
  toast.innerHTML = `
    <div class="toast-icon">
      <i class="fa-solid ${icon}"></i>
    </div>
    <div class="toast-content">
      <p class="toast-message">${message}</p>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">
      <i class="fa-solid fa-xmark"></i>
    </button>
  `;
  
  document.body.appendChild(toast);
  
  // animar entrada
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  // auto-remover após duração
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);
};

// compatibilidade
window.showSuccess = function(message) {
  window.showToast(message, 'success');
};

window.showError = function(message) {
  window.showToast(message, 'error');
};

window.showWarning = function(message) {
  window.showToast(message, 'warning');
};

window.showInfo = function(message) {
  window.showToast(message, 'info');
};
