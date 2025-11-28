// Get album ID from URL
const urlParams = new URLSearchParams(window.location.search);
const albumId = urlParams.get('id');
let album = null;

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    if (albumId) {
        await loadAlbumDetails();
        setupEventListeners();
    } else {
        alert('ID do álbum não encontrado');
        window.location.href = '/pages/app/albums-list.html';
    }
});

// Check authentication
async function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/pages/userLogin/login.html';
        return;
    }
}

// Load album details
async function loadAlbumDetails() {
    const token = localStorage.getItem('token');
    const loading = document.getElementById('loading');
    const albumContent = document.getElementById('albumContent');

    try {
        const response = await fetch(`${API_BASE_URL}/albums/${albumId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Álbum não encontrado');
        }

        album = await response.json();

        // Update page title
        document.title = `${album.name} - Collection Hub`;

        // Update header
        document.getElementById('albumName').textContent = album.name;
        
        const gameTypeElement = document.getElementById('albumGameType');
        gameTypeElement.innerHTML = album.gameType === 'pokemon' 
            ? '<i class="fa-solid fa-bolt"></i> Pokémon TCG Pocket'
            : '<i class="fa-solid fa-star"></i> Personalizado';

        if (album.description) {
            document.getElementById('albumDescription').textContent = album.description;
        } else {
            document.getElementById('albumDescription').style.display = 'none';
        }

        document.getElementById('albumItemCount').textContent = `${album.items?.length || 0} ${album.items?.length === 1 ? 'item' : 'itens'}`;
        document.getElementById('albumDate').textContent = `Criado em ${formatDate(album.createdAt)}`;

        // Load items
        displayItems(album.items || []);

        loading.style.display = 'none';
        albumContent.style.display = 'block';

    } catch (error) {
        console.error('Erro ao carregar álbum:', error);
        alert('Erro ao carregar álbum');
        window.location.href = '/pages/app/albums-list.html';
    }
}

// Display album items
function displayItems(items) {
    const itemsGrid = document.getElementById('itemsGrid');
    const emptyItems = document.getElementById('emptyItems');

    if (items.length === 0) {
        itemsGrid.style.display = 'none';
        emptyItems.style.display = 'flex';
    } else {
        itemsGrid.innerHTML = items.map(item => `
            <div class="album-item-card">
                <div class="item-image-wrapper">
                    <img src="${item.cardData?.imageUrl || '/assets/images/placeholder-card.png'}" 
                         alt="${item.cardData?.nameEn || 'Card'}"
                         onerror="this.src='/assets/images/placeholder-card.png'">
                </div>
                <div class="item-info">
                    <h4>${item.cardData?.nameEn || item.customName || 'Card'}</h4>
                    ${item.cardData?.rarity ? `<p class="item-rarity">${item.cardData.rarity.name}</p>` : ''}
                    ${item.quantity > 1 ? `<p class="item-quantity">Quantidade: ${item.quantity}</p>` : ''}
                </div>
                <button onclick="removeItem('${item.id}', '${item.cardData?.nameEn || item.customName}')" 
                        class="btn-remove-item" title="Remover carta">
                    <i class="fa-solid fa-times"></i>
                </button>
            </div>
        `).join('');
        itemsGrid.style.display = 'grid';
        emptyItems.style.display = 'none';
    }
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('editAlbumBtn').addEventListener('click', editAlbum);
    document.getElementById('deleteAlbumBtn').addEventListener('click', deleteAlbum);
}

// Edit album
function editAlbum() {
    // For now, just show alert - can implement edit modal later
    const newName = prompt('Novo nome do álbum:', album.name);
    if (newName && newName !== album.name) {
        updateAlbum({ name: newName });
    }
}

// Update album
async function updateAlbum(updates) {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_BASE_URL}/albums/${albumId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updates)
        });

        if (response.ok) {
            showToast('Álbum atualizado com sucesso', 'success');
            await loadAlbumDetails();
        } else {
            const error = await response.json();
            showToast(error.error || 'Erro ao atualizar álbum', 'error');
        }
    } catch (error) {
        console.error('Erro ao atualizar álbum:', error);
        showToast('Erro ao atualizar álbum', 'error');
    }
}

// Delete album
async function deleteAlbum() {
    if (!confirm(`Tem certeza que deseja excluir o álbum "${album.name}"? Esta ação não pode ser desfeita.`)) {
        return;
    }

    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_BASE_URL}/albums/${albumId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            showToast('Álbum excluído com sucesso', 'success');
            setTimeout(() => {
                window.location.href = '/pages/app/albums-list.html';
            }, 1500);
        } else {
            const error = await response.json();
            showToast(error.error || 'Erro ao excluir álbum', 'error');
        }
    } catch (error) {
        console.error('Erro ao excluir álbum:', error);
        showToast('Erro ao excluir álbum', 'error');
    }
}

// Remove item from album
async function removeItem(itemId, itemName) {
    if (!confirm(`Remover "${itemName}" do álbum?`)) {
        return;
    }

    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_BASE_URL}/albums/${albumId}/cards/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            showToast('Carta removida do álbum', 'success');
            await loadAlbumDetails();
        } else {
            const error = await response.json();
            showToast(error.error || 'Erro ao remover carta', 'error');
        }
    } catch (error) {
        console.error('Erro ao remover carta:', error);
        showToast('Erro ao remover carta', 'error');
    }
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
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
