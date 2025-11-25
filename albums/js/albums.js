const userId = localStorage.getItem('userId') || '1';

async function carregarAlbums() {
    try {
        const res = await fetch(`/api/albums/user/${userId}`);
        
        if (res.ok) {
            const result = await res.json();
            renderizarAlbums(result.albums);
        } else {
            document.getElementById('albumsList').innerHTML = '<p class="error">Erro ao carregar álbuns</p>';
        }
    } catch (error) {
        console.error('Erro:', error);
        document.getElementById('albumsList').innerHTML = '<p class="error">Erro ao carregar álbuns</p>';
    }
}

function renderizarAlbums(albums) {
    const albumsDiv = document.getElementById('albumsList');
    
    if (albums.length === 0) {
        albumsDiv.innerHTML = '<p class="empty">Você ainda não tem álbuns. Crie seu primeiro álbum!</p>';
        return;
    }
    
    albumsDiv.innerHTML = albums.map(album => `
        <div class="album-card" onclick="verAlbum(${album.id})">
            <div class="album-preview">
                ${album.items.length > 0 && album.items[0].card?.imageUrl 
                    ? `<img src="${album.items[0].card.imageUrl}" alt="Preview">` 
                    : album.items.length > 0 && album.items[0].customImage
                    ? `<img src="${album.items[0].customImage}" alt="Preview">`
                    : '<div class="empty-preview">📁</div>'}
            </div>
            <div class="album-info">
                <h3>${album.name}</h3>
                <p class="album-stats">${album.items.length} cards</p>
                <span class="album-visibility">${album.isPublic ? '🌍 Público' : '🔒 Privado'}</span>
            </div>
        </div>
    `).join('');
}

function mostrarModalCriarAlbum() {
    document.getElementById('modalCriarAlbum').style.display = 'block';
}

function fecharModal() {
    document.getElementById('modalCriarAlbum').style.display = 'none';
    document.getElementById('formCriarAlbum').reset();
}

document.getElementById('formCriarAlbum').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const data = {
        userId: parseInt(userId),
        name: document.getElementById('albumName').value,
        isPublic: document.getElementById('isPublic').checked
    };
    
    console.log('Enviando dados:', data);
    
    try {
        const apiUrl = window.API_BASE_URL || 'http://localhost:3000';
        const res = await fetch(`${apiUrl}/api/albums`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        console.log('Status da resposta:', res.status);
        
        const result = await res.json();
        console.log('Resposta completa:', result);
        
        if (res.ok) {
            alert('Álbum criado com sucesso!');
            fecharModal();
            carregarAlbums();
        } else {
            console.error('Erro detalhado:', result);
            alert(`Erro ao criar álbum: ${result.erro || result.detalhes || JSON.stringify(result)}`);
        }
    } catch (error) {
        console.error('Erro completo:', error);
        alert(`Erro ao criar álbum: ${error.message}`);
    }
});

function verAlbum(albumId) {
    window.location.href = `/albums/album.html?id=${albumId}`;
}

window.onclick = function(event) {
    const modal = document.getElementById('modalCriarAlbum');
    if (event.target == modal) {
        fecharModal();
    }
}

carregarAlbums();
