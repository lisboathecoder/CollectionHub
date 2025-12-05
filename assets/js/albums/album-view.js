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
  const response = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ image: base64Image })
  });
  
  if (!response.ok) {
    throw new Error('Erro ao fazer upload da imagem');
  }
  
  const data = await response.json();
  return data.imageUrl;
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
      throw new Error("Erro ao carregar álbum");
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

    const items = currentAlbum.items || currentAlbum._count?.items || [];
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
      renderCards();
      // Verificar status dos favoritos após renderizar
      setTimeout(() => checkFavoritesStatus(), 500);
    } else {
      console.log("No items to render");
      renderCards();
    }
  } catch (error) {
    console.error("Error loading album:", error);
    alert("Erro ao carregar álbum: " + error.message);
    window.history.back();
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

  grid.innerHTML = albumCards
    .map((item) => {
      const card = item.card || {};
      const isCustomItem = !item.cardId && item.customName;
      const imageUrl =
        item.customImage ||
        card.imageUrl ||
        "/assets/images/placeholder-card.png";
      const name = item.customName || card.nameEn || "Unknown";
      const number = card.number || "-";
      const displayNumber = isCustomItem
        ? "<i class='fa-solid fa-star'></i> Personalizado"
        : `#${number}`;

      return `
            <div class="card-item ${
              isCustomItem ? "custom-item" : ""
            }" data-item-id="${item.id}" ${
        !isCustomItem && card.id
          ? `onclick="window.location.href='/pages/explore/card-details.html?id=${card.id}'" style="cursor: pointer;"`
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
                <img src="${imageUrl}" alt="${name}" onerror="this.src='/assets/images/placeholder-card.png'">
                <div class="card-item-name">${name}</div>
                <div class="card-item-number">${displayNumber}</div>
                ${
                  item.notes
                    ? `<div class="card-item-notes" title="${item.notes}"><i class="fa-solid fa-note-sticky"></i></div>`
                    : ""
                }
            </div>
        `;
    })
    .join("");
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

    if (!response.ok) throw new Error("Erro ao buscar cartas");

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
    showToast("Álbum inválido", "error");
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

    showToast("Carta adicionada com sucesso!", "success");
  } catch (error) {
    console.error("❌ Erro ao adicionar:", error);
    showToast(error.message || "Erro ao adicionar carta", "error");
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
      throw new Error("Erro ao remover carta");
    }

    albumCards = albumCards.filter((item) => item.id !== itemId);

    document.getElementById("cardCount").textContent = `${albumCards.length} ${
      albumCards.length === 1 ? "carta" : "cartas"
    }`;
    document.getElementById("totalCards").textContent = albumCards.length;

    renderCards();

    showToast("Carta removida com sucesso", "success");
  } catch (error) {
    console.error("Error removing card:", error);
    showToast("Erro ao remover carta", "error");
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
          alert('Por favor, selecione uma imagem válida');
          return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
          alert('A imagem deve ter no máximo 5MB');
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
        showToast("Nome do álbum é obrigatório", "error");
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
          const base64Image = await fileToBase64(file);
          coverUrl = await uploadImageForEdit(base64Image, token);
          
          if (submitBtn) {
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';
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
          const error = await response.json();
          throw new Error(error.message || "Erro ao atualizar álbum");
        }

        showToast("Álbum atualizado com sucesso!", "success");
        closeEditModal();

        // Recarrega o álbum
        await loadAlbum(albumId);
      } catch (error) {
        console.error("Error updating album:", error);
        showToast(error.message || "Erro ao atualizar álbum", "error");
      }
    });
};

window.shareAlbum = function (albumId) {
  const url = window.location.href;
  navigator.clipboard
    .writeText(url)
    .then(() => {
      showToast("Link copiado para a área de transferência!", "success");
    })
    .catch(() => {
      showToast("Erro ao copiar link", "error");
    });
};

window.deleteAlbum = async function (albumId) {
  // Verify ownership before allowing delete
  const currentUserId = await getCurrentUserId();
  if (currentAlbum && currentAlbum.userId !== currentUserId) {
    showToast("Você não tem permissão para deletar este álbum", "error");
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
      throw new Error("Erro ao deletar álbum");
    }

    showToast("Álbum deletado com sucesso", "success");

    setTimeout(() => {
      window.location.href = "/pages/app/collection.html";
    }, 1500);
  } catch (error) {
    console.error("Error deleting album:", error);
    showToast("Erro ao deletar álbum", "error");
  }
};

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = "toast toast-" + type;
  toast.textContent = message;
  toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: ${
          type === "success"
            ? "#4caf50"
            : type === "error"
            ? "#f44336"
            : "#2196f3"
        };
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 5000); // Aumentado de 3000 para 4500ms (4.5 segundos)
}

const style = document.createElement("style");
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

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
        <h2><i class="fa-solid fa-image"></i> Adicionar Item Personalizado</h2>
        <button class="btn-close-modal" onclick="closeCustomItemModal()">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div class="modal-body">
        <p style="color: #9aa7b0; margin-bottom: 20px;">
          <i class="fa-solid fa-circle-info"></i> 
          Adicione qualquer colecionável: figuras, moedas, selos, quadrinhos, etc.
        </p>
        <form id="customItemForm">
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
                required
              />
              <div class="upload-placeholder" id="uploadPlaceholder">
                <i class="fa-solid fa-cloud-arrow-up"></i>
                <p>Clique para selecionar uma imagem</p>
                <span>PNG, JPG ou WEBP (máx. 5MB)</span>
              </div>
              <div class="image-preview" id="imagePreview" style="display: none;">
                <img src="" alt="Preview" id="previewImg" />
                <button type="button" class="btn-change-image" onclick="document.getElementById('customItemImage').click()">
                  <i class="fa-solid fa-rotate"></i> Trocar Imagem
                </button>
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
  setTimeout(() => modal.classList.add("active"), 10);

  // Event listeners
  const imageInput = document.getElementById("customItemImage");
  const uploadArea = document.getElementById("imageUploadArea");
  const uploadPlaceholder = document.getElementById("uploadPlaceholder");
  const imagePreview = document.getElementById("imagePreview");
  const previewImg = document.getElementById("previewImg");

  // Click na área de upload
  uploadPlaceholder.addEventListener("click", () => imageInput.click());

  // Drag & Drop
  uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadArea.classList.add("drag-over");
  });

  uploadArea.addEventListener("dragleave", () => {
    uploadArea.classList.remove("drag-over");
  });

  uploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadArea.classList.remove("drag-over");
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleImageSelect(file, previewImg, uploadPlaceholder, imagePreview);
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
  document
    .getElementById("customItemForm")
    .addEventListener("submit", handleCustomItemSubmit);
}

function handleImageSelect(file, previewImg, uploadPlaceholder, imagePreview) {
  // Valida tamanho (5MB)
  if (file.size > 5 * 1024 * 1024) {
    showToast("Imagem muito grande! Máximo 5MB", "error");
    return;
  }

  // Preview
  const reader = new FileReader();
  reader.onload = (e) => {
    previewImg.src = e.target.result;
    uploadPlaceholder.style.display = "none";
    imagePreview.style.display = "flex";
  };
  reader.readAsDataURL(file);
}

async function handleCustomItemSubmit(e) {
  e.preventDefault();

  const name = document.getElementById("customItemName").value.trim();
  const notes = document.getElementById("customItemNotes").value.trim();
  const imageInput = document.getElementById("customItemImage");
  const submitBtn = document.getElementById("submitCustomItemBtn");

  if (!name) {
    showToast("Nome do item é obrigatório", "error");
    return;
  }

  if (!imageInput.files[0]) {
    showToast("Imagem é obrigatória", "error");
    return;
  }

  // Disable button
  submitBtn.disabled = true;
  submitBtn.innerHTML =
    '<i class="fa-solid fa-spinner fa-spin"></i> Processando...';

  try {
    // 1. Resize e upload da imagem
    const imageUrl = await uploadCustomImage(imageInput.files[0]);

    // 2. Adiciona item ao álbum
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${API_BASE}/api/albums/${currentAlbum.id}/cards`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customName: name,
          customImage: imageUrl,
          notes: notes || null,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erro ao adicionar item");
    }

    const newItem = await response.json();
    console.log("✅ Item personalizado criado:", newItem);

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

    showToast("Item personalizado adicionado com sucesso!", "success");
    closeCustomItemModal();
  } catch (error) {
    console.error("❌ Erro ao criar item:", error);
    showToast(error.message || "Erro ao adicionar item", "error");
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Adicionar Item';
  }
}

async function uploadCustomImage(file) {
  try {
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

    if (!response.ok) {
      throw new Error("Erro ao fazer upload da imagem");
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error("❌ Erro no upload:", error);
    throw new Error("Erro ao fazer upload da imagem");
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
    setTimeout(() => modal.remove(), 300);
  }
};

// Função para favoritar/desfavoritar uma carta
window.toggleFavorite = async function (cardId, button) {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Faça login para adicionar favoritos");
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
