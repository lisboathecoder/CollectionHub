// Get user ID from URL
const urlParams = new URLSearchParams(window.location.search);
const profileUserId = urlParams.get('userId');
let currentUser = null;
let viewingUser = null;
let friendshipStatus = null;

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    await loadCurrentUser();
    await loadProfile();
    setupEventListeners();
});

// Load current logged-in user
async function loadCurrentUser() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/pages/userLogin/login.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            currentUser = await response.json();
        } else {
            localStorage.removeItem('token');
            window.location.href = '/pages/userLogin/login.html';
        }
    } catch (error) {
        console.error('Erro ao carregar usuário atual:', error);
    }
}

// Load profile data
async function loadProfile() {
    const loading = document.getElementById('loading');
    const profileContent = document.getElementById('profileContent');
    const token = localStorage.getItem('token');

    // If no userId in URL, show current user's profile
    const userId = profileUserId || currentUser?.id;

    if (!userId) {
        window.location.href = '/pages/userLogin/login.html';
        return;
    }

    try {
        // Load user data
        const userResponse = await fetch(`${API_BASE_URL}/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!userResponse.ok) {
            throw new Error('Usuário não encontrado');
        }

        viewingUser = await userResponse.json();

        // Check if viewing own profile
        const isOwnProfile = viewingUser.id === currentUser.id;

        // Load friendship status if viewing another user
        if (!isOwnProfile) {
            await loadFriendshipStatus(userId);
        }

        // Update UI
        document.getElementById('userName').textContent = viewingUser.name || viewingUser.username;
        document.getElementById('userEmail').textContent = viewingUser.email;

        // Show appropriate action button
        const friendActionBtn = document.getElementById('friendActionBtn');
        const editProfileBtn = document.getElementById('editProfileBtn');

        if (isOwnProfile) {
            editProfileBtn.style.display = 'flex';
            friendActionBtn.style.display = 'none';
        } else {
            editProfileBtn.style.display = 'none';
            friendActionBtn.style.display = 'flex';
            updateFriendButton();
        }

        // Load albums and friends
        await Promise.all([
            loadUserAlbums(userId),
            loadUserFriends(userId)
        ]);

        loading.style.display = 'none';
        profileContent.style.display = 'block';

    } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        alert('Erro ao carregar perfil do usuário');
    }
}

// Load friendship status
async function loadFriendshipStatus(userId) {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_BASE_URL}/friends/status/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            friendshipStatus = await response.json();
        }
    } catch (error) {
        console.error('Erro ao verificar status de amizade:', error);
    }
}

// Update friend button based on status
function updateFriendButton() {
    const friendActionBtn = document.getElementById('friendActionBtn');
    const friendBtnText = document.getElementById('friendBtnText');
    const icon = friendActionBtn.querySelector('i');

    if (!friendshipStatus) {
        // Not friends, show add friend button
        icon.className = 'fa-solid fa-user-plus';
        friendBtnText.textContent = 'Adicionar Amigo';
        friendActionBtn.className = 'btn-primary';
        friendActionBtn.disabled = false;
    } else if (friendshipStatus.status === 'pending') {
        if (friendshipStatus.initiatorId === currentUser.id) {
            // Current user sent the request
            icon.className = 'fa-solid fa-clock';
            friendBtnText.textContent = 'Solicitação Enviada';
            friendActionBtn.className = 'btn-secondary';
            friendActionBtn.disabled = true;
        } else {
            // Received friend request
            icon.className = 'fa-solid fa-user-check';
            friendBtnText.textContent = 'Aceitar Solicitação';
            friendActionBtn.className = 'btn-primary';
            friendActionBtn.disabled = false;
        }
    } else if (friendshipStatus.status === 'accepted') {
        // Already friends
        icon.className = 'fa-solid fa-user-check';
        friendBtnText.textContent = 'Amigos';
        friendActionBtn.className = 'btn-success';
        friendActionBtn.disabled = false;
    }
}

// Load user albums
async function loadUserAlbums(userId) {
    const token = localStorage.getItem('token');
    const albumsGrid = document.getElementById('albumsGrid');
    const noAlbums = document.getElementById('noAlbums');

    try {
        const response = await fetch(`${API_BASE_URL}/albums/user/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const albums = await response.json();
            
            document.getElementById('albumCount').textContent = albums.length;

            if (albums.length === 0) {
                albumsGrid.style.display = 'none';
                noAlbums.style.display = 'flex';
            } else {
                albumsGrid.innerHTML = albums.map(album => `
                    <div class="album-card" onclick="window.location.href='/pages/app/album-details.html?id=${album.id}'">
                        <div class="album-icon">
                            <i class="fa-solid fa-book"></i>
                        </div>
                        <div class="album-info">
                            <h3>${album.name}</h3>
                            <p class="album-game-type">${album.gameType === 'pokemon' ? 'Pokémon TCG Pocket' : 'Personalizado'}</p>
                            <p class="album-stats">${album._count?.items || 0} itens</p>
                        </div>
                    </div>
                `).join('');
                albumsGrid.style.display = 'grid';
                noAlbums.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Erro ao carregar álbuns:', error);
    }
}

// Load user friends
async function loadUserFriends(userId) {
    const token = localStorage.getItem('token');
    const friendsList = document.getElementById('friendsList');
    const noFriends = document.getElementById('noFriends');

    try {
        const response = await fetch(`${API_BASE_URL}/friends?userId=${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const friends = await response.json();
            
            document.getElementById('friendCount').textContent = friends.length;

            if (friends.length === 0) {
                friendsList.style.display = 'none';
                noFriends.style.display = 'flex';
            } else {
                friendsList.innerHTML = friends.map(friend => `
                    <div class="friend-card" onclick="window.location.href='/pages/app/profile.html?userId=${friend.id}'">
                        <img src="/assets/images/icon.png" alt="${friend.name}" class="friend-avatar">
                        <div class="friend-info">
                            <h4>${friend.name || friend.username}</h4>
                            <p>${friend.email}</p>
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

// Setup event listeners
function setupEventListeners() {
    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;
            switchTab(tabName);
        });
    });

    // Friend action button
    const friendActionBtn = document.getElementById('friendActionBtn');
    friendActionBtn.addEventListener('click', handleFriendAction);

    // Edit profile button
    const editProfileBtn = document.getElementById('editProfileBtn');
    editProfileBtn.addEventListener('click', () => {
        alert('Funcionalidade de editar perfil em desenvolvimento');
    });
}

// Switch between tabs
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });

    // Update tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}Tab`).classList.add('active');
}

// Handle friend action (add, accept, remove)
async function handleFriendAction() {
    const token = localStorage.getItem('token');
    const friendActionBtn = document.getElementById('friendActionBtn');

    try {
        if (!friendshipStatus) {
            // Send friend request
            const response = await fetch(`${API_BASE_URL}/friends/request/${viewingUser.id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                alert('Solicitação de amizade enviada!');
                await loadFriendshipStatus(viewingUser.id);
                updateFriendButton();
            } else {
                const error = await response.json();
                alert(error.error || 'Erro ao enviar solicitação');
            }
        } else if (friendshipStatus.status === 'pending' && friendshipStatus.initiatorId !== currentUser.id) {
            // Accept friend request
            const response = await fetch(`${API_BASE_URL}/friends/accept/${friendshipStatus.id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                alert('Solicitação aceita! Agora vocês são amigos.');
                await loadFriendshipStatus(viewingUser.id);
                updateFriendButton();
                await loadUserFriends(viewingUser.id);
            } else {
                alert('Erro ao aceitar solicitação');
            }
        } else if (friendshipStatus.status === 'accepted') {
            // Remove friend
            if (confirm('Tem certeza que deseja remover este amigo?')) {
                const response = await fetch(`${API_BASE_URL}/friends/${friendshipStatus.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    alert('Amigo removido');
                    friendshipStatus = null;
                    updateFriendButton();
                    await loadUserFriends(viewingUser.id);
                } else {
                    alert('Erro ao remover amigo');
                }
            }
        }
    } catch (error) {
        console.error('Erro ao processar ação de amizade:', error);
        alert('Erro ao processar ação');
    }
}
