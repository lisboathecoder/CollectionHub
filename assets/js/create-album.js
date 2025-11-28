// Create Album Script
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/pages/userLogin/login.html';
        return;
    }

    // Get album type from URL
    const urlParams = new URLSearchParams(window.location.search);
    const albumType = urlParams.get('type') || 'pokemon-tcg-pocket';

    // Update UI based on type
    updateAlbumTypeDisplay(albumType);

    // Form elements
    const form = document.getElementById('createAlbumForm');
    const nameInput = document.getElementById('albumName');
    const descInput = document.getElementById('albumDescription');
    const nameCount = document.getElementById('nameCount');
    const descCount = document.getElementById('descCount');
    const cancelBtn = document.getElementById('cancelBtn');
    const submitBtn = document.getElementById('submitBtn');
    const errorMessage = document.getElementById('errorMessage');

    // Character counters
    nameInput.addEventListener('input', () => {
        nameCount.textContent = nameInput.value.length;
    });

    descInput.addEventListener('input', () => {
        descCount.textContent = descInput.value.length;
    });

    // Cancel button
    cancelBtn.addEventListener('click', () => {
        if (confirm('Deseja cancelar a criação do álbum?')) {
            window.history.back();
        }
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = nameInput.value.trim();
        const description = descInput.value.trim();

        if (!name) {
            showError('Por favor, insira um nome para o álbum');
            return;
        }

        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Criando...';

            const response = await fetch(`${API_BASE_URL}/api/albums`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name,
                    description: description || null,
                    type: albumType,
                    isPublic: true
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao criar álbum');
            }

            const album = await response.json();

            // Show success message
            showSuccess('Álbum criado com sucesso!');

            // Redirect to album page after a short delay
            setTimeout(() => {
                window.location.href = `/pages/app/album-view.html?id=${album.id}`;
            }, 1000);

        } catch (error) {
            console.error('Error creating album:', error);
            showError(error.message);
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Criar Álbum';
        }
    });
});

function updateAlbumTypeDisplay(type) {
    const typeDisplay = document.getElementById('albumTypeDisplay');
    const typeName = document.getElementById('albumTypeName');

    if (type === 'pokemon-tcg-pocket') {
        typeDisplay.innerHTML = `
            <img src="/assets/images/pokemon-tcg-pocket-logo.png" alt="Pokemon TCG Pocket" 
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
            <i class="fa-solid fa-cards-blank" style="display: none;"></i>
            <span>Pokémon TCG Pocket</span>
        `;
    } else {
        typeDisplay.innerHTML = `
            <i class="fa-solid fa-star"></i>
            <span>Personalizado</span>
        `;
    }
}

function showError(message) {
    const errorEl = document.getElementById('errorMessage');
    errorEl.textContent = message;
    errorEl.style.display = 'block';

    setTimeout(() => {
        errorEl.style.display = 'none';
    }, 5000);
}

function showSuccess(message) {
    const errorEl = document.getElementById('errorMessage');
    errorEl.style.background = 'rgba(76, 175, 80, 0.1)';
    errorEl.style.borderColor = 'rgba(76, 175, 80, 0.3)';
    errorEl.style.color = '#4caf50';
    errorEl.textContent = message;
    errorEl.style.display = 'block';
}
