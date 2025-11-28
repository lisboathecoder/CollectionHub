// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    await loadAllFriendData();
});

// Check authentication
async function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/pages/userLogin/login.html';
        return;
    }
}

// Load all friend-related data
async function loadAllFriendData() {
    await Promise.all([
        loadPendingRequests(),
        loadFriends(),
        loadSentRequests()
    ]);
}

// Load pending friend requests (incoming)
async function loadPendingRequests() {
    const token = localStorage.getItem('token');
    const pendingRequests = document.getElementById('pendingRequests');
    const noPending = document.getElementById('noPending');
    const pendingCount = document.getElementById('pendingCount');

    try {
        const response = await fetch(`${API_BASE_URL}/friends/pending`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const requests = await response.json();
            const incoming = requests.filter(r => r.status === 'pending' && r.receiverId);
            
            pendingCount.textContent = incoming.length;

            if (incoming.length === 0) {
                pendingRequests.style.display = 'none';
                noPending.style.display = 'flex';
            } else {
                pendingRequests.innerHTML = incoming.map(request => {
                    const friend = request.initiator;
                    return `
                        <div class="friend-request-card">
                            <img src="/assets/images/icon.png" alt="${friend.name}" class="friend-avatar">
                            <div class="friend-info">
                                <h4>${friend.name || friend.username}</h4>
                                <p>${friend.email}</p>
                                <span class="request-time">${formatDate(request.createdAt)}</span>
                            </div>
                            <div class="friend-actions">
                                <button onclick="acceptRequest('${request.id}')" class="btn-accept">
                                    <i class="fa-solid fa-check"></i> Aceitar
                                </button>
                                <button onclick="rejectRequest('${request.id}')" class="btn-reject">
                                    <i class="fa-solid fa-times"></i> Recusar
                                </button>
                            </div>
                        </div>
                    `;
                }).join('');
                pendingRequests.style.display = 'grid';
                noPending.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Erro ao carregar solicitações pendentes:', error);
    }
}

// Load current friends
async function loadFriends() {
    const token = localStorage.getItem('token');
    const friendsList = document.getElementById('friendsList');
    const noFriends = document.getElementById('noFriends');
    const friendsCount = document.getElementById('friendsCount');

    try {
        const response = await fetch(`${API_BASE_URL}/friends`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const friends = await response.json();
            
            friendsCount.textContent = friends.length;

            if (friends.length === 0) {
                friendsList.style.display = 'none';
                noFriends.style.display = 'flex';
            } else {
                friendsList.innerHTML = friends.map(friend => `
                    <div class="friend-card">
                        <img src="/assets/images/icon.png" alt="${friend.name}" class="friend-avatar" 
                             onclick="window.location.href='/pages/app/profile.html?userId=${friend.id}'">
                        <div class="friend-info" onclick="window.location.href='/pages/app/profile.html?userId=${friend.id}'">
                            <h4>${friend.name || friend.username}</h4>
                            <p>${friend.email}</p>
                        </div>
                        <div class="friend-actions">
                            <button onclick="viewProfile('${friend.id}')" class="btn-view" title="Ver Perfil">
                                <i class="fa-solid fa-eye"></i>
                            </button>
                            <button onclick="removeFriend('${friend.friendshipId}')" class="btn-remove" title="Remover Amigo">
                                <i class="fa-solid fa-user-minus"></i>
                            </button>
                        </div>
                    </div>
                `).join('');
                friendsList.style.display = 'grid';
                noFriends.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Erro ao carregar amigos:', error);
    }
}

// Load sent friend requests (outgoing)
async function loadSentRequests() {
    const token = localStorage.getItem('token');
    const sentRequests = document.getElementById('sentRequests');
    const noSent = document.getElementById('noSent');
    const sentCount = document.getElementById('sentCount');

    try {
        const response = await fetch(`${API_BASE_URL}/friends/pending`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const requests = await response.json();
            const outgoing = requests.filter(r => r.status === 'pending' && r.initiatorId);
            
            sentCount.textContent = outgoing.length;

            if (outgoing.length === 0) {
                sentRequests.style.display = 'none';
                noSent.style.display = 'flex';
            } else {
                sentRequests.innerHTML = outgoing.map(request => {
                    const friend = request.receiver;
                    return `
                        <div class="friend-request-card">
                            <img src="/assets/images/icon.png" alt="${friend.name}" class="friend-avatar">
                            <div class="friend-info">
                                <h4>${friend.name || friend.username}</h4>
                                <p>${friend.email}</p>
                                <span class="request-time">${formatDate(request.createdAt)}</span>
                            </div>
                            <div class="friend-actions">
                                <button onclick="cancelRequest('${request.id}')" class="btn-cancel">
                                    <i class="fa-solid fa-times"></i> Cancelar
                                </button>
                            </div>
                        </div>
                    `;
                }).join('');
                sentRequests.style.display = 'grid';
                noSent.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Erro ao carregar solicitações enviadas:', error);
    }
}

// Accept friend request
async function acceptRequest(friendshipId) {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_BASE_URL}/friends/accept/${friendshipId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            showToast('Solicitação aceita! Agora vocês são amigos.', 'success');
            await loadAllFriendData();
        } else {
            const error = await response.json();
            showToast(error.error || 'Erro ao aceitar solicitação', 'error');
        }
    } catch (error) {
        console.error('Erro ao aceitar solicitação:', error);
        showToast('Erro ao aceitar solicitação', 'error');
    }
}

// Reject friend request
async function rejectRequest(friendshipId) {
    const token = localStorage.getItem('token');

    if (!confirm('Tem certeza que deseja recusar esta solicitação?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/friends/reject/${friendshipId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            showToast('Solicitação recusada', 'info');
            await loadAllFriendData();
        } else {
            showToast('Erro ao recusar solicitação', 'error');
        }
    } catch (error) {
        console.error('Erro ao recusar solicitação:', error);
        showToast('Erro ao recusar solicitação', 'error');
    }
}

// Cancel sent friend request
async function cancelRequest(friendshipId) {
    const token = localStorage.getItem('token');

    if (!confirm('Tem certeza que deseja cancelar esta solicitação?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/friends/${friendshipId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            showToast('Solicitação cancelada', 'info');
            await loadAllFriendData();
        } else {
            showToast('Erro ao cancelar solicitação', 'error');
        }
    } catch (error) {
        console.error('Erro ao cancelar solicitação:', error);
        showToast('Erro ao cancelar solicitação', 'error');
    }
}

// Remove friend
async function removeFriend(friendshipId) {
    const token = localStorage.getItem('token');

    if (!confirm('Tem certeza que deseja remover este amigo?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/friends/${friendshipId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            showToast('Amigo removido', 'info');
            await loadAllFriendData();
        } else {
            showToast('Erro ao remover amigo', 'error');
        }
    } catch (error) {
        console.error('Erro ao remover amigo:', error);
        showToast('Erro ao remover amigo', 'error');
    }
}

// View friend profile
function viewProfile(userId) {
    window.location.href = `/pages/app/profile.html?userId=${userId}`;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return 'Hoje';
    } else if (diffDays === 1) {
        return 'Ontem';
    } else if (diffDays < 7) {
        return `${diffDays} dias atrás`;
    } else {
        return date.toLocaleDateString('pt-BR');
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast-success ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
