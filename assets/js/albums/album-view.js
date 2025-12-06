window.API_BASE_URL = window.API_BASE_URL || "http://localhost:3000/";
const API_BASE = (window.API_BASE_URL || "http://localhost:3000").replace(
  /\/+$/g,
  ""
);
console.log("album-view.js loaded, API_BASE:", API_BASE);

let currentAlbum = null;
let albumCards = [];

// Funções auxiliares para upload de imagem
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

async function uploadImageForEdit(base64Image, token) {
  try {
    console.log('📤 Iniciando upload de imagem...');
    
    const response = await fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ image: base64Image })
    });
    
    console.log('📥 Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Upload error:', errorData);
      
      if (response.status === 413) {
        throw new Error('Imagem muito grande. Tamanho máximo: 5MB');
      } else if (response.status === 400) {
        throw new Error(errorData.error || errorData.message || 'Formato de imagem inválido');
      } else if (response.status === 401) {
        throw new Error('Sessão expirada. Faça login novamente.');
      } else {
        throw new Error(errorData.error || errorData.message || `Erro ao fazer upload da imagem (${response.status})`);
      }
    }
    
    const data = await response.json();
    console.log('✅ Upload concluído:', data.imageUrl);
    return data.imageUrl;
  } catch (error) {
    console.error('❌ Erro no upload:', error);
    throw error;
  }
}

// Função para remover imagem de capa no modal de edição
window.removeEditCoverImage = function() {
  const fileInput = document.getElementById('editCoverImage');
  const preview = document.getElementById('editCoverPreview');
  const label = document.getElementById('editCoverLabel');
  
  if (fileInput) fileInput.value = '';
  if (preview) preview.style.display = 'none';
  if (label) label.style.display = 'block';
  
  // Limpar a coverUrl atual
  if (currentAlbum) {
    currentAlbum.coverUrl = null;
  }
};

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, API_BASE_URL:", window.API_BASE_URL);

  const token = localStorage.getItem("token");
  if (!token) {
    console.log("No token found, redirecting to login");
    window.location.href = "/pages/userLogin/login.html";
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const albumId = urlParams.get("id");

  console.log("Album ID from URL:", albumId);

  if (!albumId) {
    alert("Álbum não encontrado");
    window.history.back();
    return;
  }

  loadAlbum(albumId);

  const searchBtn = document.getElementById("searchCardsBtn");
  const searchInput = document.getElementById("cardSearchInput");
  const editBtn = document.getElementById("editBtn");
  const shareBtn = document.getElementById("shareBtn");
  const deleteBtn = document.getElementById("deleteBtn");

  if (searchBtn) {
    searchBtn.addEventListener("click", searchCards);
  } else {
    console.error("searchCardsBtn not found");
  }

  if (searchInput) {
    searchInput.addEventListener("input", handleSearchInput);
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") searchCards();
    });
  } else {
    console.error("cardSearchInput not found");
  }

  document.addEventListener("click", (e) => {
    const searchResults = document.getElementById("searchResults");
    const searchBox = document.querySelector(".search-box-albums");

    if (searchResults && searchBox && !searchBox.contains(e.target)) {
      searchResults.style.display = "none";
    }
  });

  if (editBtn) {
    editBtn.addEventListener("click", () => window.editAlbum(albumId));
  } else {
    console.error("editBtn not found");
  }

  if (shareBtn) {
    shareBtn.addEventListener("click", () => window.shareAlbum(albumId));
  } else {
    console.error("shareBtn not found");
  }

  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => window.deleteAlbum(albumId));
  } else {
    console.error("deleteBtn not found");
  }

  const addCustomItemBtn = document.getElementById("addCustomItemBtn");
  if (addCustomItemBtn) {
    addCustomItemBtn.addEventListener("click", openCustomItemModal);
  } else {
    console.error("addCustomItemBtn not found");
  }

  document.querySelectorAll(".view-toggle button").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".view-toggle button")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
});

async function loadAlbum(albumId) {
  const token = localStorage.getItem("token");

  try {
    console.log("Loading album:", albumId);
    console.log("API URL:", API_BASE);

    const response = await fetch(`${API_BASE}/api/albums/${albumId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      
      if (response.status === 404) {
        throw new Error("Álbum não encontrado. Pode ter sido deletado ou você não tem permissão para acessá-lo.");
      } else if (response.status === 401) {
        throw new Error("Sessão expirada. Faça login novamente.");
      } else if (response.status === 403) {
        throw new Error("Você não tem permissão para acessar este álbum.");
      } else {
        throw new Error(`Erro ao carregar álbum: ${errorText || 'Erro desconhecido'}`);
      }
    }

    currentAlbum = await response.json();
    console.log("Album loaded:", currentAlbum);

    // Check ownership
    const currentUserId = await getCurrentUserId();
    const isOwner = currentAlbum.userId === currentUserId;

    // Show/hide action buttons based on ownership
    const editBtn = document.getElementById("editBtn");
    const deleteBtn = document.getElementById("deleteBtn");
    if (editBtn && deleteBtn) {
      editBtn.style.display = isOwner ? "flex" : "none";
      deleteBtn.style.display = isOwner ? "flex" : "none";
    }

    document.getElementById("albumName").textContent =
      currentAlbum.name || "Álbum sem nome";
    document.getElementById("albumDescription").textContent =
      currentAlbum.description || "Sem descrição";

    // Display album cover
    const albumCover = document.getElementById("albumCover");
    const albumCoverPlaceholder = document.getElementById("albumCoverPlaceholder");
    
    if (currentAlbum.coverUrl && currentAlbum.coverUrl.trim() !== '') {
      albumCover.src = currentAlbum.coverUrl;
      albumCover.style.display = 'block';
      albumCoverPlaceholder.style.display = 'none';
      albumCover.onerror = () => {
        albumCover.style.display = 'none';
        albumCoverPlaceholder.style.display = 'flex';
      };
    } else {
      albumCover.style.display = 'none';
      albumCoverPlaceholder.style.display = 'flex';
    }

    const items = currentAlbum.items || currentAlbum._count?.items || [];
    console.log('📋 Items do album (album-view):', items);
    
    const cardCount = Array.isArray(items)
      ? items.length
      : typeof items === "number"
      ? items
      : 0;

    console.log("Card count:", cardCount);

    document.getElementById("cardCount").textContent = `${cardCount} ${
      cardCount === 1 ? "carta" : "cartas"
    }`;
    document.getElementById("totalCards").textContent = cardCount;

    const createdDate = new Date(currentAlbum.createdAt).toLocaleDateString(
      "pt-BR"
    );
    document.getElementById("createdDate").textContent = createdDate;

    // Display owner information
    const ownerInfo = document.getElementById("albumOwner");
    if (ownerInfo && currentAlbum.user) {
      ownerInfo.textContent = `Por: ${
        currentAlbum.user.username || currentAlbum.user.email
      }`;
      ownerInfo.style.display = "block";
    }

    // Display game type/category
    const gameTypeEl = document.getElementById("albumGameType");
    if (gameTypeEl) {
      let gameTypeText;
      
      if (currentAlbum.gameType === "pokemon" || currentAlbum.gameType === "pokemon-tcg-pocket") {
        gameTypeText = "Pokémon TCG Pocket";
      } else if (currentAlbum.gameType === "custom") {
        gameTypeText = currentAlbum.customCategory || "Personalizado";
      } else {
        gameTypeText = currentAlbum.gameType || "Personalizado";
      }
      
      gameTypeEl.innerHTML = `<i class="fa-solid fa-tag"></i> ${gameTypeText}`;
      gameTypeEl.style.display = "block";
    }
    
    // Esconder botão de item personalizado para álbuns de pokemon
    const addCustomItemBtn = document.getElementById("addCustomItemBtn");
    if (addCustomItemBtn) {
      if (currentAlbum.gameType === "pokemon" || currentAlbum.gameType === "pokemon-tcg-pocket") {
        addCustomItemBtn.style.display = "none";
      } else {
        addCustomItemBtn.style.display = "flex";
      }
    }

    if (
      currentAlbum.items &&
      Array.isArray(currentAlbum.items) &&
      currentAlbum.items.length > 0
    ) {
      albumCards = currentAlbum.items;
      console.log('📦 Items do álbum:', albumCards);
      console.log('🎨 Items personalizados:', albumCards.filter(item => item.customName));
      renderCards();
      // Verificar status dos favoritos após renderizar
      setTimeout(() => checkFavoritesStatus(), 500);
    } else {
      console.log("No items to render");
      renderCards();
    }
  } catch (error) {
    console.error("Error loading album:", error);
    showToast(error.message || "Erro ao carregar álbum", "error", 6000);
    setTimeout(() => {
      window.location.href = "/pages/albums/albums-list.html";
    }, 3000);
  }
}

function renderCards() {
  const grid = document.getElementById("cardsGrid");

  if (albumCards.length === 0) {
    grid.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-cards-blank"></i>
                <h3>Nenhuma carta adicionada</h3>
                <p>Use a pesquisa acima para adicionar cartas ao seu álbum</p>
            </div>
        `;
    return;
  }

  // Separar cartas Pokemon e itens personalizados
  const pokemonCards = albumCards.filter(item => item.cardId);
  const customItems = albumCards.filter(item => !item.cardId && item.customName);

  // Função helper para renderizar um item
  const renderItem = (item) => {
    const card = item.card || {};
    const isCustomItem = !item.cardId && item.customName;
    
    // Para itens personalizados, usar customImage ou placeholder
    let imageUrl;
    if (isCustomItem) {
      imageUrl = item.customImage && item.customImage.trim() !== '' 
        ? item.customImage 
        : "/assets/images/placeholder-card.png";
    } else {
      imageUrl = card.imageUrl || "/assets/images/placeholder-card.png";
    }
    
    const name = item.customName || card.nameEn || "Unknown";
    const number = card.number || "-";
    const displayNumber = isCustomItem
      ? "<i class='fa-solid fa-star'></i> Personalizado"
      : `#${number}`;

    // Define o link de destino baseado no tipo de item
    const itemLink = isCustomItem
      ? `/pages/albums/custom-item-details.html?id=${item.id}&albumId=${currentAlbum.id}`
      : card.id
      ? `/pages/explore/card-details.html?id=${card.id}`
      : null;

    return `
      <div class="card-item ${
        isCustomItem ? "custom-item" : ""
      }" data-item-id="${item.id}" ${
        itemLink
          ? `onclick="window.location.href='${itemLink}'" style="cursor: pointer;"`
          : ""
      }>
        <button class="remove-card-btn" onclick="event.stopPropagation(); window.removeCard(${
          item.id
        })">
          <i class="fa-solid fa-times"></i>
        </button>
        ${
          !isCustomItem && card.id
            ? `<button class="favorite-card-btn" onclick="event.stopPropagation(); window.toggleFavorite(${card.id}, this)" data-card-id="${card.id}">
            <i class="fa-solid fa-heart"></i>
          </button>`
            : ""
        }
        ${
          isCustomItem
            ? `<button class="edit-card-btn" onclick="event.stopPropagation(); window.location.href='${itemLink}'" title="Editar item">
            <i class="fa-solid fa-pen"></i>
          </button>`
            : ""
        }
        <div class="card-item-image-wrapper">
          ${imageUrl && imageUrl !== "/assets/images/placeholder-card.png" 
            ? `<img src="${imageUrl}" alt="${name}" onerror="this.src='/assets/images/placeholder-card.png'; this.onerror=null;">`
            : `<div class="card-item-placeholder">
                <i class="fa-solid fa-image"></i>
                <span>Sem imagem</span>
              </div>`
          }
        </div>
        <div class="card-item-info">
          <div class="card-item-name">${name}</div>
          <div class="card-item-number">${displayNumber}</div>
        </div>
      </div>
    `;
  };

  // Construir HTML com seções separadas se houver ambos os tipos
  let html = '';
  
  if (pokemonCards.length > 0 && customItems.length > 0) {
    // Mostrar ambas as seções separadas
    html += `
      <div class="cards-section-divider">
        <h3><i class="fa-solid fa-cards-blank"></i> Cartas Pokémon (${pokemonCards.length})</h3>
      </div>
      ${pokemonCards.map(renderItem).join('')}
      <div class="cards-section-divider">
        <h3><i class="fa-solid fa-star"></i> Itens Personalizados (${customItems.length})</h3>
      </div>
      ${customItems.map(renderItem).join('')}
    `;
  } else {
    // Mostrar apenas o tipo disponível
    html = albumCards.map(renderItem).join('');
  }

  grid.innerHTML = html;
}

let searchTimeout = null;

async function searchCards() {
  const inputEl = document.getElementById("cardSearchInput");
  const searchResults = document.getElementById("searchResults");
  if (!inputEl || !searchResults) return;

  const query = inputEl.value.trim();
  if (query.length < 2) {
    searchResults.style.display = "none";
    return;
  }

  searchResults.style.display = "block";
  searchResults.innerHTML =
    '<div class="search-loading"><i class="fa-solid fa-spinner fa-spin"></i> Buscando...</div>';

  try {
    const response = await fetch(
      `${API_BASE}/api/pokemon/cards/search?q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erro ao buscar cartas (${response.status})`);
    }

    const data = await response.json();
    const cards = Array.isArray(data) ? data : data.cards || [];

    if (cards.length === 0) {
      searchResults.innerHTML = `
        <div class="search-no-results">
          <i class="fa-solid fa-magnifying-glass"></i>
          <p>Nenhuma carta encontrada para "${query}"</p>
        </div>
      `;
      return;
    }

    searchResults.innerHTML = cards
      .map(
        (card) => `
        <div class="search-result-item" data-card-id="${card.id}">
          <img src="${
            card.imageUrl || "/assets/images/placeholder-card.png"
          }" alt="${card.nameEn}" />
          <div class="search-result-info">
            <strong>${card.nameEn || "Unknown"}</strong>
            <span>#${card.number || "-"} - ${card.set?.nameEn || ""}</span>
          </div>
          <button class="btn-add-card" onclick="window.addCardToAlbumById(${
            card.id
          })">
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>
      `
      )
      .join("");
  } catch (error) {
    console.error("Error searching cards:", error);
    searchResults.innerHTML = `
      <div class="search-no-results">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <p>Erro ao buscar cartas</p>
      </div>
    `;
  }
}

function handleSearchInput() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(searchCards, 300);
}

// Função global para adicionar carta por ID
window.addCardToAlbumById = async function (cardId) {
  console.log("🎴 Adicionando carta ID:", cardId);
  const token = localStorage.getItem("token");

  if (!currentAlbum || !currentAlbum.id) {
    console.error("❌ Álbum inválido:", currentAlbum);
    showToast("Álbum inválido ou não encontrado", "error", 5000);
    return;
  }

  const addButton = event.target.closest(".btn-add-card");
  if (addButton) {
    addButton.disabled = true;
    addButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
  }

  try {
    console.log("📤 POST:", `${API_BASE}/api/albums/${currentAlbum.id}/cards`);
    console.log("📦 Body:", JSON.stringify({ cardId: parseInt(cardId) }));

    const response = await fetch(
      `${API_BASE}/api/albums/${currentAlbum.id}/cards`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cardId: parseInt(cardId),
        }),
      }
    );

    console.log("📥 Status:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Erro:", errorData);
      throw new Error(errorData.message || "Erro ao adicionar carta");
    }

    const newItem = await response.json();
    console.log("✅ Item criado:", newItem);

    // Atualiza a lista de cartas
    albumCards.push(newItem);

    // Atualiza contadores
    const cardCount = albumCards.length;
    document.getElementById("cardCount").textContent = `${cardCount} ${
      cardCount === 1 ? "carta" : "cartas"
    }`;
    document.getElementById("totalCards").textContent = cardCount;

    // Re-renderiza o grid
    renderCards();

    // Limpa busca
    const searchResults = document.getElementById("searchResults");
    const searchInput = document.getElementById("cardSearchInput");
    if (searchResults) searchResults.style.display = "none";
    if (searchInput) searchInput.value = "";

    showToast("✨ Carta adicionada ao álbum com sucesso!", "success", 5000);
  } catch (error) {
    console.error("❌ Erro ao adicionar:", error);
    showToast(error.message || "Erro ao adicionar carta ao álbum", "error", 6000);
  } finally {
    if (addButton) {
      addButton.disabled = false;
      addButton.innerHTML = '<i class="fa-solid fa-plus"></i>';
    }
  }
};

window.removeCard = async function (itemId) {
  if (!confirm("Deseja remover esta carta do álbum?")) {
    return;
  }

  const token = localStorage.getItem("token");

  try {
    const response = await fetch(
      `${API_BASE}/api/albums/${currentAlbum.id}/cards/${itemId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `Erro ao remover carta do álbum (${response.status})`);
    }

    albumCards = albumCards.filter((item) => item.id !== itemId);

    document.getElementById("cardCount").textContent = `${albumCards.length} ${
      albumCards.length === 1 ? "carta" : "cartas"
    }`;
    document.getElementById("totalCards").textContent = albumCards.length;

    renderCards();

    showToast("✅ Carta removida do álbum com sucesso", "success", 5000);
  } catch (error) {
    console.error("Error removing card:", error);
    showToast(error.message || "Erro ao remover carta do álbum", "error", 6000);
  }
};

window.editAlbum = function (albumId) {
  if (!currentAlbum) return;

  // Cria modal de edição
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.id = "editAlbumModal";
  modal.innerHTML = `
    <div class="modal-content edit-album-modal">
      <div class="modal-header">
        <h2>Editar Álbum</h2>
        <button class="btn-close-modal" onclick="closeEditModal()">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div class="modal-body">
        <form id="editAlbumForm">
          <div class="form-group">
            <label for="editAlbumName">Nome do Álbum *</label>
            <input 
              type="text" 
              id="editAlbumName" 
              class="form-input" 
              value="${currentAlbum.name || ""}" 
              required 
              maxlength="100"
            />
          </div>

          <div class="form-group">
            <label for="editAlbumDescription">Descrição</label>
            <textarea 
              id="editAlbumDescription" 
              class="form-input" 
              rows="4" 
              maxlength="500"
            >${currentAlbum.description || ""}</textarea>
          </div>

          <div class="form-group">
            <label for="editCoverImage">Capa do Álbum (opcional)</label>
            <div class="image-upload-area">
              <input type="file" id="editCoverImage" class="file-input" accept="image/*" />
              <label for="editCoverImage" class="file-label" id="editCoverLabel">
                <i class="fa-solid fa-cloud-arrow-up"></i>
                <span>Clique para selecionar ou arraste a imagem</span>
              </label>
              <div id="editCoverPreview" class="image-preview" style="display: ${
                currentAlbum.coverUrl ? "block" : "none"
              };">
                <img id="editCoverPreviewImg" src="${
                  currentAlbum.coverUrl || ""
                }" alt="Preview" />
                <button type="button" class="btn-remove-image" onclick="removeEditCoverImage()">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>
            </div>
            <small class="form-hint">Se não informada, será usada a primeira carta do álbum</small>
          </div>

          <div class="form-group">
            <label for="editAlbumGameType">Tipo de Jogo *</label>
            <select id="editAlbumGameType" class="form-input" required>
              <option value="pokemon" ${
                currentAlbum.gameType === "pokemon" ||
                currentAlbum.gameType === "pokemon-tcg-pocket"
                  ? "selected"
                  : ""
              }>Pokémon TCG Pocket</option>
              <option value="custom" ${
                currentAlbum.gameType === "custom" ? "selected" : ""
              }>Personalizado</option>
            </select>
          </div>

          <div class="form-group">
            <label>
              <input 
                type="checkbox" 
                id="editAlbumPublic" 
                ${currentAlbum.isPublic ? "checked" : ""}
              />
              Tornar álbum público
            </label>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" onclick="closeEditModal()">Cancelar</button>
            <button type="submit" class="btn-primary">Salvar Alterações</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add("active"), 10);
  
  // Inicializar preview se já houver coverUrl
  if (currentAlbum.coverUrl) {
    const label = document.getElementById('editCoverLabel');
    if (label) label.style.display = 'none';
  }
  
  // Handler para preview de imagem
  const editCoverInput = document.getElementById('editCoverImage');
  if (editCoverInput) {
    editCoverInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
          showToast('Por favor, selecione uma imagem válida (JPG, PNG, GIF, etc.)', 'error');
          e.target.value = '';
          return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
          showToast('A imagem deve ter no máximo 5MB', 'error');
          e.target.value = '';
          return;
        }
        
        const preview = document.getElementById('editCoverPreview');
        const previewImg = document.getElementById('editCoverPreviewImg');
        const label = document.getElementById('editCoverLabel');
        
        const reader = new FileReader();
        reader.onload = (e) => {
          previewImg.src = e.target.result;
          preview.style.display = 'block';
          if (label) label.style.display = 'none';
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Handler do form
  document
    .getElementById("editAlbumForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("editAlbumName").value.trim();
      const description = document
        .getElementById("editAlbumDescription")
        .value.trim();
      const gameType = document.getElementById("editAlbumGameType").value;
      const isPublic = document.getElementById("editAlbumPublic").checked;
      const coverInput = document.getElementById("editCoverImage");

      if (!name) {
        showToast("Nome do álbum é obrigatório", "error", 5000);
        return;
      }

      const token = localStorage.getItem("token");
      
      let coverUrl = currentAlbum.coverUrl; // Manter a atual se não houver mudança

      try {
        // Se há nova imagem, fazer upload primeiro
        if (coverInput && coverInput.files && coverInput.files[0]) {
          const submitBtn = document.querySelector('.btn-primary');
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando imagem...';
          }
          
          const file = coverInput.files[0];
          console.log('📁 Arquivo selecionado:', file.name, 'Tamanho:', (file.size / 1024 / 1024).toFixed(2) + 'MB');
          
          const base64Image = await fileToBase64(file);
          coverUrl = await uploadImageForEdit(base64Image, token);
          
          if (submitBtn) {
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando álbum...';
          }
        }

        const response = await fetch(`${API_BASE}/api/albums/${albumId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            description,
            coverUrl,
            gameType,
            isPublic,
          }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.error || error.message || `Erro ao atualizar álbum (${response.status})`);
        }

        showToast("✅ Álbum atualizado com sucesso!", "success", 5000);
        closeEditModal();

        // Recarrega o álbum
        await loadAlbum(albumId);
      } catch (error) {
        console.error("❌ Error updating album:", error);
        showToast(error.message || "Erro ao atualizar álbum", "error", 6000);
        
        // Reabilitar botão em caso de erro
        const submitBtn = document.querySelector('.btn-primary');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fa-solid fa-save"></i> Salvar Alterações';
        }
      }
    });
};

window.shareAlbum = function (albumId) {
  const url = window.location.href;
  navigator.clipboard
    .writeText(url)
    .then(() => {
      showToast("🔗 Link copiado para a área de transferência!", "success", 4000);
    })
    .catch(() => {
      showToast("Erro ao copiar link. Tente novamente.", "error", 5000);
    });
};

window.deleteAlbum = async function (albumId) {
  // Verify ownership before allowing delete
  const currentUserId = await getCurrentUserId();
  if (currentAlbum && currentAlbum.userId !== currentUserId) {
    showToast("⚠️ Você não tem permissão para deletar este álbum", "error", 5000);
    return;
  }

  if (
    !confirm(
      "Tem certeza que deseja deletar este álbum? Esta ação não pode ser desfeita."
    )
  ) {
    return;
  }

  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`${API_BASE}/api/albums/${albumId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `Erro ao deletar álbum (${response.status})`);
    }

    showToast("Álbum deletado com sucesso! Redirecionando...", "success", 5000);

    setTimeout(() => {
      window.location.href = "/pages/albums/albums-list.html";
    }, 2500);
  } catch (error) {
    console.error("Error deleting album:", error);
    showToast(error.message || "Erro ao deletar álbum", "error", 6000);
  }
};

// showToast agora é fornecido globalmente por /assets/js/toast.js

window.removeCard = removeCard;

// Função para fechar modal de edição
window.closeEditModal = function () {
  const modal = document.getElementById("editAlbumModal");
  if (modal) {
    modal.classList.remove("active");
    setTimeout(() => modal.remove(), 300);
  }
};

// Helper to get current user ID
async function getCurrentUserId() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const response = await fetch(apiUrl("api/profile/me"), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      const user = await response.json();
      return user.id;
    }
  } catch (error) {
    console.error("Error getting current user:", error);
  }
  return null;
}

// ===== CUSTOM ITEM FUNCTIONALITY =====

function openCustomItemModal() {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.id = "customItemModal";
  modal.innerHTML = `
    <div class="modal-content custom-item-modal">
      <div class="modal-header">
        <div class="modal-header-content">
          <i class="fa-solid fa-image"></i>
          <h2>Adicionar Item Personalizado</h2>
        </div>
        <button class="btn-close-modal" onclick="closeCustomItemModal()">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div class="modal-body">
        <div class="modal-info-box">
          <i class="fa-solid fa-circle-info"></i> 
          <span>Adicione qualquer colecionável: figuras, moedas, selos, quadrinhos, etc.</span>
        </div>
        <form id="customItemForm" class="custom-item-form">
          <div class="form-group">
            <label for="customItemName">Nome do Item *</label>
            <input 
              type="text" 
              id="customItemName" 
              class="form-input" 
              placeholder="Ex: Figura de Ação do Batman"
              required 
              maxlength="100"
            />
          </div>

          <div class="form-group">
            <label for="customItemNotes">Descrição/Notas</label>
            <textarea 
              id="customItemNotes" 
              class="form-input" 
              rows="3" 
              placeholder="Adicione detalhes sobre este item..."
              maxlength="500"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="customItemImage">Imagem do Item *</label>
            <div class="image-upload-area" id="imageUploadArea">
              <input 
                type="file" 
                id="customItemImage" 
                accept="image/*" 
                style="display: none;"
              />
              <div class="upload-placeholder" id="uploadPlaceholder">
                <i class="fa-solid fa-cloud-arrow-up"></i>
                <p>Clique para selecionar uma imagem</p>
                <span>PNG, JPG ou WEBP (máx. 5MB)</span>
              </div>
              <div class="image-preview" id="imagePreview" style="display: none;">
                <img src="" alt="Preview" id="previewImg" />
                <div class="image-preview-actions">
                  <button type="button" class="btn-change-image" onclick="document.getElementById('customItemImage').click()">
                    <i class="fa-solid fa-rotate"></i> Trocar Imagem
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" onclick="closeCustomItemModal()">Cancelar</button>
            <button type="submit" class="btn-primary" id="submitCustomItemBtn">
              <i class="fa-solid fa-plus"></i> Adicionar Item
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.classList.add('modal-open');
  setTimeout(() => modal.classList.add("active"), 10);

  // Event listeners
  const imageInput = document.getElementById("customItemImage");
  const uploadArea = document.getElementById("imageUploadArea");
  const uploadPlaceholder = document.getElementById("uploadPlaceholder");
  const imagePreview = document.getElementById("imagePreview");
  const previewImg = document.getElementById("previewImg");

  // Click na área de upload (placeholder e área inteira)
  uploadPlaceholder.addEventListener("click", () => {
    console.log('📸 Click no placeholder');
    imageInput.click();
  });
  
  uploadArea.addEventListener("click", (e) => {
    // Se clicar na área mas não em um botão
    if (e.target === uploadArea || e.target.closest('.upload-placeholder')) {
      console.log('📸 Click na área de upload');
      imageInput.click();
    }
  });

  // Drag & Drop
  uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.add("drag-over");
  });

  uploadArea.addEventListener("dragleave", (e) => {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.remove("drag-over");
  });

  uploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.remove("drag-over");
    
    const file = e.dataTransfer.files[0];
    console.log('📁 Arquivo arrastado:', file);
    
    if (file && file.type.startsWith("image/")) {
      // Criar um novo FileList e atribuir ao input
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      imageInput.files = dataTransfer.files;
      
      // Mostrar preview
      handleImageSelect(file, previewImg, uploadPlaceholder, imagePreview);
    } else {
      showToast("⚠️ Por favor, selecione uma imagem válida", "error", 3000);
    }
  });

  // File input change
  imageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageSelect(file, previewImg, uploadPlaceholder, imagePreview);
    }
  });

  // Form submit
  const customItemForm = document.getElementById("customItemForm");
  if (customItemForm) {
    console.log('✅ Form encontrado, adicionando listener de submit');
    customItemForm.addEventListener("submit", handleCustomItemSubmit);
  } else {
    console.error('❌ Form customItemForm não encontrado!');
  }
}

function handleImageSelect(file, previewImg, uploadPlaceholder, imagePreview) {
  console.log('🖼️ handleImageSelect chamado:', file.name, file.size);
  
  // Valida tamanho (5MB)
  if (file.size > 5 * 1024 * 1024) {
    showToast("⚠️ Imagem muito grande! Máximo 5MB", "error", 5000);
    return;
  }

  // Preview
  const reader = new FileReader();
  reader.onload = (e) => {
    previewImg.src = e.target.result;
    uploadPlaceholder.style.display = "none";
    imagePreview.style.display = "flex";
    console.log('✅ Preview atualizado');
  };
  reader.readAsDataURL(file);
}

async function handleCustomItemSubmit(e) {
  e.preventDefault();
  console.log('🎯 handleCustomItemSubmit chamado');

  const name = document.getElementById("customItemName").value.trim();
  const notes = document.getElementById("customItemNotes").value.trim();
  const imageInput = document.getElementById("customItemImage");
  const submitBtn = document.getElementById("submitCustomItemBtn");

  console.log('📋 Dados do form:', { name, notes, hasImage: !!imageInput.files[0] });

  if (!name) {
    showToast("⚠️ Nome do item é obrigatório", "error", 5000);
    return;
  }

  if (!imageInput.files[0]) {
    showToast("⚠️ Imagem é obrigatória", "error", 5000);
    return;
  }

  // Disable button
  submitBtn.disabled = true;
  submitBtn.innerHTML =
    '<i class="fa-solid fa-spinner fa-spin"></i> Processando...';

  try {
    // 1. Resize e upload da imagem
    console.log('🔄 Iniciando upload da imagem...');
    const imageUrl = await uploadCustomImage(imageInput.files[0]);
    console.log('✅ URL da imagem recebida:', imageUrl);

    if (!imageUrl || imageUrl.trim() === '') {
      throw new Error('URL da imagem está vazia após upload');
    }

    // 2. Adiciona item ao álbum
    const token = localStorage.getItem("token");
    const requestBody = {
      customName: name,
      customImage: imageUrl,
      notes: notes || null,
    };
    
    console.log('📤 Enviando para API:', requestBody);
    
    const response = await fetch(
      `${API_BASE}/api/albums/${currentAlbum.id}/cards`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erro ao adicionar item");
    }

    const newItem = await response.json();
    console.log("✅ Item personalizado criado:", newItem);
    console.log("🖼️ customImage retornado:", newItem.customImage);

    // Atualiza lista
    albumCards.push(newItem);

    // Atualiza contadores
    const cardCount = albumCards.length;
    document.getElementById("cardCount").textContent = `${cardCount} ${
      cardCount === 1 ? "carta" : "cartas"
    }`;
    document.getElementById("totalCards").textContent = cardCount;

    // Re-renderiza
    renderCards();

    showToast("✨ Item personalizado adicionado com sucesso!", "success", 5000);
    closeCustomItemModal();
  } catch (error) {
    console.error("❌ Erro ao criar item:", error);
    showToast(error.message || "Erro ao adicionar item personalizado", "error", 6000);
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Adicionar Item';
  }
}

async function uploadCustomImage(file) {
  try {
    console.log('📤 Redimensionando e enviando imagem customizada...');
    
    // Resize para 600x600
    const resizedBase64 = await resizeImage(file, 600, 600);

    // Upload para ImgBB
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE}/api/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        image: resizedBase64,
        type: "custom-item",
      }),
    });

    console.log('📥 Upload response:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Upload error:', errorData);
      
      if (response.status === 413) {
        throw new Error('Imagem muito grande. Tamanho máximo: 5MB');
      } else if (response.status === 400) {
        throw new Error(errorData.error || errorData.message || 'Formato de imagem inválido');
      } else if (response.status === 401) {
        throw new Error('Sessão expirada. Faça login novamente.');
      } else {
        throw new Error(errorData.error || errorData.message || `Erro ao fazer upload da imagem (${response.status})`);
      }
    }

    const data = await response.json();
    console.log('✅ Upload response completa:', data);
    
    const imageUrl = data.imageUrl || data.url;
    console.log('📍 URL extraída:', imageUrl);
    
    if (!imageUrl) {
      console.error('❌ URL não encontrada na resposta:', data);
      throw new Error('URL da imagem não foi retornada pelo servidor');
    }
    
    return imageUrl;
  } catch (error) {
    console.error("❌ Erro no upload:", error);
    throw error;
  }
}

function resizeImage(file, maxWidth, maxHeight) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calcula proporções
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Converte para base64 (remove data:image/png;base64,)
        const base64 = canvas.toDataURL("image/jpeg", 0.9).split(",")[1];
        resolve(base64);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

window.closeCustomItemModal = function () {
  const modal = document.getElementById("customItemModal");
  if (modal) {
    modal.classList.remove("active");
    document.body.classList.remove('modal-open');
    setTimeout(() => modal.remove(), 300);
  }
};

// Função para favoritar/desfavoritar uma carta
window.toggleFavorite = async function (cardId, button) {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("⚠️ Faça login para adicionar cartas aos favoritos", "error", 5000);
      setTimeout(() => {
        window.location.href = "/pages/userLogin/login.html";
      }, 1500);
      return;
    }

    const apiBase = (window.API_BASE_URL || "http://localhost:3000").replace(
      /\/+$/g,
      ""
    );

    const isFavorited = button.classList.contains("favorited");

    if (isFavorited) {
      // Remover favorito
      const response = await fetch(`${apiBase}/api/favorites/${cardId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        button.classList.remove("favorited");
        showFavoriteToast("Removido dos favoritos", "info");
      }
    } else {
      // Adicionar favorito
      const response = await fetch(`${apiBase}/api/favorites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cardId }),
      });

      if (response.ok) {
        button.classList.add("favorited");
        showFavoriteToast("Adicionado aos favoritos!", "success");
      } else {
        const error = await response.json();
        showFavoriteToast(error.error || "Erro ao favoritar", "error");
      }
    }
  } catch (error) {
    console.error("Erro ao favoritar:", error);
    showFavoriteToast("Erro ao favoritar carta", "error");
  }
};

function showFavoriteToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${
      type === "success"
        ? "fa-check-circle"
        : type === "error"
        ? "fa-exclamation-circle"
        : "fa-info-circle"
    }"></i>
    <span>${message}</span>
  `;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: ${type === "success" ? "#00d4aa" : type === "error" ? "#ff3e6c" : "#3b82f6"};
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    opacity: 0;
    animation: fadeIn 0.3s ease forwards;
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "fadeOut 0.3s ease forwards";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Verificar status dos favoritos
async function checkFavoritesStatus() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const apiBase = (window.API_BASE_URL || "http://localhost:3000").replace(
      /\/+$/g,
      ""
    );

    const favoriteButtons = document.querySelectorAll(".favorite-card-btn");

    for (const button of favoriteButtons) {
      const cardId = button.getAttribute("data-card-id");
      if (!cardId) continue;

      const response = await fetch(
        `${apiBase}/api/favorites/check/${cardId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.isFavorite) {
          button.classList.add("favorited");
        }
      }
    }
  } catch (error) {
    console.error("Erro ao verificar favoritos:", error);
  }
}
