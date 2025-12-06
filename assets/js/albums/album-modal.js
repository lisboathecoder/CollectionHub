let selectedCard = null;

const albumIcons = ['📚', '⭐', '🎴', '🎯', '💎', '🏆', '🎨', '🔥', '⚡', '🌟', '🎪', '🎭', '🎬', '🎮', '🎲'];

function getRandomIcon() {
  return albumIcons[Math.floor(Math.random() * albumIcons.length)];
}

function openAlbumModal(cardIdOrCard) {
  if (typeof cardIdOrCard === "object") {
    selectedCard = cardIdOrCard;
  } else {
    selectedCard = { id: cardIdOrCard };
  }

  const modal = document.getElementById("albumModal");
  if (!modal) {
    console.error("❌ Album modal not found");
    return;
  }
  
  modal.classList.add('active');
  document.body.classList.add("modal-open");
  loadUserAlbums();
}

function openAddToAlbumModal(card) {
  openAlbumModal(card);
}

function closeAlbumModal() {
  const modal = document.getElementById("albumModal");
  if (modal) {
    modal.classList.remove('active');
  }
  document.body.classList.remove("modal-open");
  selectedCard = null;
}

async function loadUserAlbums() {
  const albumsList = document.getElementById("albumsList");
  const token = localStorage.getItem("token");

  if (!albumsList) return;

  if (!token) {
    albumsList.innerHTML = `
      <div class="albums-loading">
        <i class="fa-solid fa-lock" style="font-size: 48px; color: #ff3e6c; margin-bottom: 12px;"></i>
        <p style="margin-bottom: 8px;">Faça login para adicionar cartas aos seus álbuns</p>
        <a href="/pages/userLogin/login.html" style="color: #ff3e6c; font-weight: 600; text-decoration: none;">
          <i class="fa-solid fa-arrow-right"></i> Fazer Login
        </a>
      </div>
    `;
    return;
  }

  try {
    const apiUrl = window.apiUrl;
    const response = await fetch(apiUrl("api/albums"), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error("Erro ao carregar álbuns");
    }

    const albums = await response.json();

    if (albums.length === 0) {
      albumsList.innerHTML = `
        <div class="albums-loading">
          <i class="fa-solid fa-folder-open" style="font-size: 48px; color: #999; margin-bottom: 12px;"></i>
          <p style="margin-bottom: 8px;">Você ainda não tem álbuns</p>
          <p style="font-size: 13px; color: #666;">Crie seu primeiro álbum!</p>
        </div>
      `;
      return;
    }

    if (!window.albumIconsMap) {
      window.albumIconsMap = {};
    }

    albumsList.innerHTML = albums.map((album) => {
      if (!window.albumIconsMap[album.id]) {
        window.albumIconsMap[album.id] = getRandomIcon();
      }
      const icon = window.albumIconsMap[album.id];
      const itemCount = album._count?.items || album.items?.length || 0;
      
      return `
        <div class="album-card" onclick="addCardToAlbum(${album.id})" data-album-id="${album.id}">
          <div class="album-card__icon">${icon}</div>
          <div class="album-card__name" title="${album.name}">${album.name}</div>
          <div class="album-card__count">
            <i class="fa-solid fa-layer-group"></i>
            <span>${itemCount} ${itemCount === 1 ? 'carta' : 'cartas'}</span>
          </div>
        </div>
      `;
    }).join("");
  } catch (error) {
    console.error("Error loading albums:", error);
    albumsList.innerHTML = `
      <div class="albums-loading">
        <i class="fa-solid fa-exclamation-triangle" style="font-size: 48px; color: #ff9800; margin-bottom: 12px;"></i>
        <p>Erro ao carregar álbuns</p>
        <button onclick="loadUserAlbums()" style="margin-top: 12px; padding: 8px 16px; background: #ff3e6c; color: #fff; border: none; border-radius: 6px; cursor: pointer;">
          Tentar Novamente
        </button>
      </div>
    `;
  }
}

async function addCardToAlbum(albumId) {
  const token = localStorage.getItem("token");

  if (!token || !selectedCard) {
    console.error("❌ Missing token or card");
    return;
  }

  const albumCard = document.querySelector(`.album-card[data-album-id="${albumId}"]`);

  try {
    const apiUrl = window.apiUrl;
    const cardId = String(selectedCard.id || selectedCard);

    const response = await fetch(apiUrl(`api/albums/${albumId}/items`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ cardId, quantity: 1 }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.erro || error.error || "Erro ao adicionar");
    }

    if (typeof showNotification === "function") {
      showNotification("✨ Carta adicionada com sucesso!", "success");
    }
    
    setTimeout(() => closeAlbumModal(), 1000);
    
  } catch (error) {
    console.error("❌ Error:", error);
    if (typeof showNotification === "function") {
      showNotification(error.message || "Erro ao adicionar carta", "error");
    }
  }
}

function goToCreateAlbum() {
  if (selectedCard) {
    localStorage.setItem("pendingCard", JSON.stringify(selectedCard));
  }
  window.location.href = "/pages/albums/select-game.html";
}
