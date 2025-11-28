const urlParams = new URLSearchParams(window.location.search);
const profileUserId = urlParams.get('userId');
let currentUser = null;
let viewingUser = null;
document.addEventListener('DOMContentLoaded', async () => {
    await loadCurrentUser();
    await loadProfile();
    setupEventListeners();
});

async function loadCurrentUser() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/pages/userLogin/login.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}users/me`, {
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

async function loadProfile() {
    const loading = document.getElementById('loading');
    const profileContent = document.getElementById('profileContent');
    const token = localStorage.getItem('token');

    const userId = profileUserId || currentUser?.id;

    if (!userId) {
        window.location.href = '/pages/userLogin/login.html';
        return;
    }

    try {
        const userResponse = await fetch(`${API_BASE_URL}users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!userResponse.ok) {
            throw new Error('Usuário não encontrado');
        }

        viewingUser = await userResponse.json();
        const isOwnProfile = viewingUser.id === currentUser.id;

        document.getElementById('userAvatar').src = viewingUser.avatarUrl || '/assets/images/icon.png';
        document.getElementById('userName').textContent = viewingUser.name || viewingUser.username;
        document.getElementById('userEmail').textContent = viewingUser.email;

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

        await Promise.all([
            loadUserAlbums(userId),
        ]);

        loading.style.display = 'none';
        profileContent.style.display = 'block';

    } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        alert('Erro ao carregar perfil do usuário');
    }
}

    const noAlbums = document.getElementById('noAlbums');

    try {
        const response = await fetch(`${API_BASE_URL}albums/user/${userId}`, {
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

function setupEventListeners() {
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;
            switchTab(tabName);
        });
    });

    const friendActionBtn = document.getElementById('friendActionBtn');
    friendActionBtn.addEventListener('click', handleFriendAction);

    const editProfileBtn = document.getElementById('editProfileBtn');
    editProfileBtn.addEventListener('click', () => {
        alert('Funcionalidade de editar perfil em desenvolvimento');
    });
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });

    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}Tab`).classList.add('active');
}