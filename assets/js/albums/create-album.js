// Create Album Form Handler

document.addEventListener('DOMContentLoaded', () => {
    // Get game type from sessionStorage
    const gameType = sessionStorage.getItem('albumGameType') || 'pokemon';
    
    // Update UI based on game type
    const gameTypeIcon = document.getElementById('gameTypeIcon');
    const gameTypeText = document.getElementById('gameTypeText');
    
    if (gameType === 'custom') {
        gameTypeIcon.className = 'fa-solid fa-layer-group game-type-icon';
        gameTypeText.textContent = 'Álbum Personalizado';
    } else {
        gameTypeIcon.className = 'fa-solid fa-book game-type-icon';
        gameTypeText.textContent = 'Pokemon TCG Pocket';
    }

    // Form submission
    const form = document.getElementById('createAlbumForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const albumName = document.getElementById('albumName').value.trim();
        const isPublic = document.getElementById('isPublic').checked;
        
        if (!albumName) {
            alert('Por favor, insira um nome para o álbum');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Você precisa estar logado para criar um álbum');
                window.location.href = '/pages/userLogin/login.html';
                return;
            }

            const apiUrl = window.API_BASE_URL || 'http://localhost:3000';
            const response = await fetch(`${apiUrl}/api/albums`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: albumName,
                    gameType: gameType,
                    isPublic: isPublic
                })
            });

            if (response.ok) {
                const album = await response.json();
                
                // Clear sessionStorage
                sessionStorage.removeItem('albumGameType');
                
                // Redirect to album view
                window.location.href = `/albums/album.html?id=${album.id}`;
            } else {
                const error = await response.json();
                alert(error.message || 'Erro ao criar álbum');
            }
        } catch (error) {
            console.error('Error creating album:', error);
            alert('Erro ao criar álbum. Tente novamente.');
        }
    });
});
