// Notifications System

let notificationsDropdown = null;
let unreadCount = 0;

document.addEventListener('DOMContentLoaded', () => {
    const notificationBell = document.getElementById('notificationBell');
    
    if (notificationBell) {
        initNotifications(notificationBell);
    }
});

function initNotifications(bellElement) {
    // Create dropdown
    createNotificationsDropdown(bellElement);
    
    // Load unread count
    loadUnreadCount();
    
    // Set up periodic refresh
    setInterval(loadUnreadCount, 30000); // Refresh every 30 seconds
    
    // Click handler
    bellElement.addEventListener('click', async (e) => {
        e.stopPropagation();
        
        if (notificationsDropdown.classList.contains('active')) {
            hideNotifications();
        } else {
            await showNotifications();
        }
    });
    
    // Close on click outside
    document.addEventListener('click', (e) => {
        if (!bellElement.contains(e.target) && !notificationsDropdown.contains(e.target)) {
            hideNotifications();
        }
    });
}

function createNotificationsDropdown(bellElement) {
    notificationsDropdown = document.createElement('div');
    notificationsDropdown.className = 'notifications-dropdown';
    notificationsDropdown.innerHTML = `
        <div class="notifications-header">
            <h3>Notificações</h3>
            <button class="mark-all-read-btn" id="markAllReadBtn">
                <i class="fa-solid fa-check-double"></i>
            </button>
        </div>
        <div class="notifications-list" id="notificationsList">
            <div class="notifications-loading">
                <i class="fa-solid fa-spinner fa-spin"></i>
                <p>Carregando...</p>
            </div>
        </div>
        <div class="notifications-footer">
            <a href="/pages/app/notifications.html">Ver todas</a>
        </div>
    `;
    
    // Position dropdown relative to navbar-right
    const navbarRight = document.querySelector('.navbar-right');
    if (navbarRight) {
        navbarRight.style.position = 'relative';
        navbarRight.appendChild(notificationsDropdown);
    }
    
    // Mark all as read handler
    document.getElementById('markAllReadBtn').addEventListener('click', async (e) => {
        e.stopPropagation();
        await markAllAsRead();
    });
}

async function loadUnreadCount() {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
        const apiUrl = window.API_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${apiUrl}/api/notifications/unread-count`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            unreadCount = data.count;
            updateBellBadge();
        }
    } catch (error) {
        console.error('Error loading unread count:', error);
    }
}

function updateBellBadge() {
    const bell = document.getElementById('notificationBell');
    if (!bell) return;
    
    // Remove existing badge
    const existingBadge = bell.querySelector('.notification-badge');
    if (existingBadge) {
        existingBadge.remove();
    }
    
    // Add new badge if there are unread notifications
    if (unreadCount > 0) {
        const badge = document.createElement('span');
        badge.className = 'notification-badge';
        badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
        bell.style.position = 'relative';
        bell.appendChild(badge);
    }
}

async function showNotifications() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/pages/userLogin/login.html';
        return;
    }
    
    notificationsDropdown.classList.add('active');
    
    const listElement = document.getElementById('notificationsList');
    listElement.innerHTML = `
        <div class="notifications-loading">
            <i class="fa-solid fa-spinner fa-spin"></i>
            <p>Carregando...</p>
        </div>
    `;
    
    try {
        const apiUrl = window.API_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${apiUrl}/api/notifications?limit=10`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const notifications = await response.json();
            renderNotifications(notifications);
        } else {
            listElement.innerHTML = `
                <div class="notifications-empty">
                    <i class="fa-solid fa-bell-slash"></i>
                    <p>Erro ao carregar notificações</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading notifications:', error);
        listElement.innerHTML = `
            <div class="notifications-empty">
                <i class="fa-solid fa-bell-slash"></i>
                <p>Erro ao carregar notificações</p>
            </div>
        `;
    }
}

function renderNotifications(notifications) {
    const listElement = document.getElementById('notificationsList');
    
    if (notifications.length === 0) {
        listElement.innerHTML = `
            <div class="notifications-empty">
                <i class="fa-solid fa-bell-slash"></i>
                <p>Nenhuma notificação</p>
            </div>
        `;
        return;
    }
    
    listElement.innerHTML = notifications.map(notification => `
        <div class="notification-item ${!notification.isRead ? 'unread' : ''}" data-id="${notification.id}">
            <div class="notification-icon ${getNotificationIconClass(notification.type)}">
                <i class="${getNotificationIcon(notification.type)}"></i>
            </div>
            <div class="notification-content">
                <p class="notification-title">${notification.title}</p>
                <p class="notification-message">${notification.message}</p>
                <span class="notification-time">${formatNotificationTime(notification.createdAt)}</span>
            </div>
            ${!notification.isRead ? `
                <button class="notification-mark-read" data-id="${notification.id}">
                    <i class="fa-solid fa-check"></i>
                </button>
            ` : ''}
        </div>
    `).join('');
    
    // Add click handlers
    listElement.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', async (e) => {
            if (e.target.closest('.notification-mark-read')) {
                e.stopPropagation();
                await markAsRead(item.dataset.id);
                return;
            }
            
            await handleNotificationClick(notifications.find(n => n.id === parseInt(item.dataset.id)));
        });
    });
}

function getNotificationIcon(type) {
    const icons = {
        'friend_request': 'fa-solid fa-user-plus',
        'friend_accepted': 'fa-solid fa-user-check',
        'album_created': 'fa-solid fa-book',
        'album_updated': 'fa-solid fa-pen-to-square'
    };
    return icons[type] || 'fa-solid fa-bell';
}

function getNotificationIconClass(type) {
    const classes = {
        'friend_request': 'icon-friend',
        'friend_accepted': 'icon-friend-accepted',
        'album_created': 'icon-album',
        'album_updated': 'icon-album'
    };
    return classes[type] || '';
}

function formatNotificationTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

async function markAsRead(notificationId) {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
        const apiUrl = window.API_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${apiUrl}/api/notifications/${notificationId}/read`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            // Update UI
            const item = document.querySelector(`.notification-item[data-id="${notificationId}"]`);
            if (item) {
                item.classList.remove('unread');
                const button = item.querySelector('.notification-mark-read');
                if (button) button.remove();
            }
            
            // Update count
            await loadUnreadCount();
        }
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
}

async function markAllAsRead() {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
        const apiUrl = window.API_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${apiUrl}/api/notifications/read-all`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            // Reload notifications
            await showNotifications();
            await loadUnreadCount();
        }
    } catch (error) {
        console.error('Error marking all as read:', error);
    }
}

async function handleNotificationClick(notification) {
    // Mark as read
    if (!notification.isRead) {
        await markAsRead(notification.id);
    }
    
    // Navigate based on notification type
    const metadata = notification.metadata;
    
    switch (notification.type) {
        case 'friend_request':
            window.location.href = '/pages/app/friends.html';
            break;
        case 'friend_accepted':
            if (metadata?.userId) {
                window.location.href = `/pages/app/profile.html?id=${metadata.userId}`;
            }
            break;
        case 'album_created':
        case 'album_updated':
            if (metadata?.albumId) {
                window.location.href = `/albums/album.html?id=${metadata.albumId}`;
            }
            break;
    }
    
    hideNotifications();
}

function hideNotifications() {
    if (notificationsDropdown) {
        notificationsDropdown.classList.remove('active');
    }
}
