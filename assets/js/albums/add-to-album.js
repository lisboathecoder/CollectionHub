// Add Card to Album Modal

let currentCard = null;
let userAlbums = [];

// Create modal HTML
function createAddToAlbumModal() {
    const modal = document.createElement('div');
    modal.id = 'addToAlbumModal';
    modal.className = 'modal-overlay add-to-album-modal';
    modal.innerHTML = `
        <div class="modal-content add-album-modal-content">
            <div class="modal-header">
                <h2>Adicionar ao Álbum</h2>
                <button class="btn-close-modal" onclick="closeAddToAlbumModal()">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="card-preview" id="cardPreview"></div>
                
                <div class="albums-section">
                    <h3>Selecione um álbum</h3>
                    <div class="albums-list-modal" id="albumsListModal">
                        <div class="albums-loading">
                            <i class="fa-solid fa-spinner fa-spin"></i>
                            <p>Carregando álbuns...</p>
                        </div>
                    </div>
                </div>
                
                <div class="create-new-album-section">
                    <button class="btn-create-new-album" onclick="location.href='/pages/albums/select-game.html'">
                        <i class="fa-solid fa-plus"></i>
                        Criar Novo Álbum
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Open modal with card data
async function openAddToAlbumModal(card) {
    currentCard = card;
    
    // Create modal if it doesn't exist
    if (!document.getElementById('addToAlbumModal')) {
        createAddToAlbumModal();
    }
    
    const modal = document.getElementById('addToAlbumModal');
    const cardPreview = document.getElementById('cardPreview');
    const albumsList = document.getElementById('albumsListModal');
    
    // Show card preview
    cardPreview.innerHTML = `
        <img src="${card.imageUrl}" alt="${card.nameEn}" class="card-image-preview">
        <div class="card-info-preview">
            <h4>${card.nameEn}</h4>
            <p>${card.set?.nameEn || ''} - #${card.number}</p>
        </div>
    `;
    
    // Show modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Load user albums
    await loadUserAlbums(albumsList);
}

// Close modal
function closeAddToAlbumModal() {
    const modal = document.getElementById('addToAlbumModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
    currentCard = null;
}

// Load user albums
async function loadUserAlbums(container) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        container.innerHTML = `
            <div class="no-albums">
                <i class="fa-solid fa-lock"></i>
                <p>Faça login para adicionar cartas aos seus álbuns</p>
                <button class="btn-login" onclick="location.href='/pages/userLogin/login.html'">
                    Fazer Login
                </button>
            </div>
        `;
        return;
    }
    
    try {
        const apiUrl = window.API_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${apiUrl}/api/albums`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            userAlbums = await response.json();
            renderAlbumsList(container);
        } else {
            container.innerHTML = `
                <div class="no-albums">
                    <i class="fa-solid fa-exclamation-triangle"></i>
                    <p>Erro ao carregar álbuns</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading albums:', error);
        container.innerHTML = `
            <div class="no-albums">
                <i class="fa-solid fa-exclamation-triangle"></i>
                <p>Erro ao carregar álbuns</p>
            </div>
        `;
    }
}

// Render albums list
function renderAlbumsList(container) {
    if (userAlbums.length === 0) {
        container.innerHTML = `
            <div class="no-albums">
                <i class="fa-solid fa-book-open"></i>
                <p>Você ainda não tem álbuns</p>
                <p class="hint">Crie seu primeiro álbum para começar sua coleção!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = userAlbums.map(album => `
        <div class="album-item-modal" onclick="addCardToAlbum(${album.id})">
            <div class="album-icon">
                <i class="${album.gameType === 'pokemon' ? 'fa-solid fa-book' : 'fa-solid fa-layer-group'}"></i>
            </div>
            <div class="album-info">
                <h4>${album.name}</h4>
                <p>${album._count?.items || 0} cartas</p>
            </div>
            <i class="fa-solid fa-chevron-right"></i>
        </div>
    `).join('');
}

// Add card to selected album
async function addCardToAlbum(albumId) {
    if (!currentCard) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Faça login para adicionar cartas');
        return;
    }
    
    try {
        const apiUrl = window.API_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${apiUrl}/api/albums/${albumId}/cards`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                cardId: currentCard.id,
                quantity: 1
            })
        });
        
        if (response.ok) {
            // Show success message
            showSuccessMessage();
            closeAddToAlbumModal();
        } else {
            const error = await response.json();
            alert(error.message || 'Erro ao adicionar carta ao álbum');
        }
    } catch (error) {
        console.error('Error adding card to album:', error);
        alert('Erro ao adicionar carta ao álbum');
    }
}

// Show success message
function showSuccessMessage() {
    const toast = document.createElement('div');
    toast.className = 'toast-success';
    toast.innerHTML = `
        <i class="fa-solid fa-check-circle"></i>
        <span>Carta adicionada ao álbum com sucesso!</span>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Click outside to close
document.addEventListener('click', (e) => {
    const modal = document.getElementById('addToAlbumModal');
    if (modal && e.target === modal) {
        closeAddToAlbumModal();
    }
});
