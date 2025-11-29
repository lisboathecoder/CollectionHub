// My Albums Script
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/pages/userLogin/login.html';
        return;
    }

    loadAlbums();
});

async function loadAlbums() {
    const token = localStorage.getItem('token');
    const content = document.getElementById('albumsContent');

    try {
        const profileResponse = await fetch(`${API_BASE_URL}api/profile/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!profileResponse.ok) {
            throw new Error('Erro ao carregar perfil');
        }

        const user = await profileResponse.json();

        // Then fetch albums
        const response = await fetch(`${API_BASE_URL}api/albums/user/${user.id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar álbuns');
        }

        const data = await response.json();
        const albums = data.albums || [];

        if (albums.length === 0) {
            content.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-folder-open"></i>
                    <h2>Nenhum álbum criado</h2>
                    <p>Comece criando seu primeiro álbum para organizar sua coleção</p>
                    <a href="/pages/app/select-album-type.html" class="btn-create">
                        <i class="fa-solid fa-plus"></i>
                        Criar Primeiro Álbum
                    </a>
                </div>
            `;
            return;
        }

        renderAlbums(albums);

    } catch (error) {
        console.error('Error loading albums:', error);
        content.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-exclamation-triangle"></i>
                <h2>Erro ao carregar álbuns</h2>
                <p>${error.message}</p>
            </div>
        `;
    }
}

function renderAlbums(albums) {
    const content = document.getElementById('albumsContent');

    const albumsHTML = albums.map(album => {
        const cardCount = album.items?.length || 0;
        const createdDate = new Date(album.createdAt).toLocaleDateString('pt-BR');
        const gameType = album.gameType || 'custom';
        
        let typeBadge = '';
        let typeIcon = '';
        
        if (gameType === 'pokemon' || gameType === 'pokemon-tcg-pocket') {
            typeBadge = 'Pokémon TCG Pocket';
            typeIcon = '<i class="fa-solid fa-cards-blank"></i>';
        } else {
            typeBadge = 'Personalizado';
            typeIcon = '<i class="fa-solid fa-star"></i>';
        }

        return `
            <div class="album-card" onclick="goToAlbum(${album.id})">
                <div class="album-card-content">
                    <div class="album-type-badge">
                        ${typeIcon}
                        <span>${typeBadge}</span>
                    </div>
                    <h3>${album.name}</h3>
                    <p>${album.description || 'Sem descrição'}</p>
                    <div class="album-stats">
                        <div class="stat">
                            <i class="fa-solid fa-cards-blank"></i>
                            <span>${cardCount}</span> ${cardCount === 1 ? 'carta' : 'cartas'}
                        </div>
                        <div class="stat">
                            <i class="fa-solid fa-calendar"></i>
                            <span>${createdDate}</span>
                        </div>
                        <div class="stat">
                            <i class="fa-solid fa-${album.isPublic ? 'globe' : 'lock'}"></i>
                            <span>${album.isPublic ? 'Público' : 'Privado'}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    content.innerHTML = `<div class="albums-grid">${albumsHTML}</div>`;
}

function goToAlbum(albumId) {
    window.location.href = `/pages/app/album-view.html?id=${albumId}`;
}

// Make goToAlbum available globally
window.goToAlbum = goToAlbum;
