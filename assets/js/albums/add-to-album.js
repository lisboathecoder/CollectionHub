let currentCard = null;
let userAlbums = [];

function createAddToAlbumModal() {
  const modal = document.createElement("div");
  modal.id = "addToAlbumModal";
  modal.className = "modal-overlay add-to-album-modal";
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
                
                <div class="custom-card-section">
                    <button class="btn-add-custom-card" onclick="showCustomCardForm()">
                        <i class="fa-solid fa-star"></i>
                        Adicionar Carta Personalizada
                    </button>
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

async function openAddToAlbumModal(card) {
  currentCard = card;

  if (!document.getElementById("addToAlbumModal")) {
    createAddToAlbumModal();
  }

  const modal = document.getElementById("addToAlbumModal");
  const cardPreview = document.getElementById("cardPreview");
  const albumsList = document.getElementById("albumsListModal");

  cardPreview.innerHTML = `
        <img src="${card.imageUrl}" alt="${
    card.nameEn
  }" class="card-image-preview">
        <div class="card-info-preview">
            <h4>${card.nameEn}</h4>
            <p>${card.set?.nameEn || ""} - #${card.number}</p>
            <button class="btn-view-details" onclick="viewCardDetails(${card.id})">
                <i class="fa-solid fa-circle-info"></i>
                Ver Detalhes
            </button>
        </div>
    `;

  modal.classList.add("active");
  document.body.classList.add("modal-open");

  await loadUserAlbums(albumsList);
}

function closeAddToAlbumModal() {
  const modal = document.getElementById("addToAlbumModal");
  if (modal) {
    modal.classList.remove("active");
    document.body.classList.remove("modal-open");
  }
  currentCard = null;
}

async function loadUserAlbums(container, isCustomCard = false) {
  const token = localStorage.getItem("token");

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
    const apiBase = (window.API_BASE_URL || "http://localhost:3000").replace(
      /\/+$/g,
      ""
    );
    const response = await fetch(`${apiBase}/api/albums`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      userAlbums = await response.json();
      renderAlbumsList(container, isCustomCard);
    } else {
      container.innerHTML = `
                <div class="no-albums">
                    <i class="fa-solid fa-exclamation-triangle"></i>
                    <p>Erro ao carregar álbuns</p>
                </div>
            `;
    }
  } catch (error) {
    console.error("Error loading albums:", error);
    container.innerHTML = `
            <div class="no-albums">
                <i class="fa-solid fa-exclamation-triangle"></i>
                <p>Erro ao carregar álbuns</p>
            </div>
        `;
  }
}

function renderAlbumsList(container, isCustomCard = false) {
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

  const clickHandler = isCustomCard ? "addCustomCardToAlbum" : "addCardToAlbum";
  
  container.innerHTML = userAlbums
    .map(
      (album) => `
        <div class="album-item-modal" onclick="${clickHandler}(${album.id})">
            <div class="album-icon">
                <i class="${
                  album.gameType === "pokemon"
                    ? "fa-solid fa-book"
                    : "fa-solid fa-layer-group"
                }"></i>
            </div>
            <div class="album-info">
                <h4>${album.name}</h4>
                <p>${album._count?.items || 0} cartas</p>
            </div>
            <i class="fa-solid fa-chevron-right"></i>
        </div>
    `
    )
    .join("");
}

async function addCardToAlbum(albumId) {
  if (!currentCard) return;

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Faça login para adicionar cartas");
    return;
  }

  try {
    const apiBase = (window.API_BASE_URL || "http://localhost:3000").replace(
      /\/+$/g,
      ""
    );
    const response = await fetch(`${apiBase}/api/albums/${albumId}/cards`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        cardId: currentCard.id,
        quantity: 1,
      }),
    });

    if (response.ok) {
      showSuccessMessage();
      closeAddToAlbumModal();
    } else {
      const error = await response.json();
      alert(error.message || "Erro ao adicionar carta ao álbum");
    }
  } catch (error) {
    console.error("Error adding card to album:", error);
    alert("Erro ao adicionar carta ao álbum");
  }
}

function showSuccessMessage() {
  const toast = document.createElement("div");
  toast.className = "toast-success";
  toast.innerHTML = `
        <i class="fa-solid fa-check-circle"></i>
        <span>Carta adicionada ao álbum com sucesso!</span>
    `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 100);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Função para visualizar detalhes da carta
function viewCardDetails(cardId) {
  window.location.href = `/pages/explore/card-details.html?id=${cardId}`;
}

// Função para mostrar formulário de carta personalizada
window.showCustomCardForm = function() {
  const cardPreview = document.getElementById("cardPreview");
  const albumsSection = document.querySelector(".albums-section");
  
  cardPreview.innerHTML = `
    <div class="custom-card-form">
      <h3>Adicionar Carta Personalizada</h3>
      <div class="form-group">
        <label for="customCardName">Nome da Carta *</label>
        <input type="text" id="customCardName" class="form-input" placeholder="Ex: Pikachu Especial" required />
      </div>
      <div class="form-group">
        <label for="customCardImageFile">Imagem da Carta *</label>
        <div class="image-upload-area" id="customCardUploadArea">
          <input type="file" id="customCardImageFile" class="file-input" accept="image/*" required />
          <label for="customCardImageFile" class="file-label" id="customCardFileLabel">
            <i class="fa-solid fa-cloud-arrow-up"></i>
            <span>Clique para selecionar ou arraste a imagem</span>
          </label>
          <div id="customCardPreview" class="image-preview" style="display: none;">
            <img id="customCardPreviewImg" src="" alt="Preview" />
            <button type="button" class="btn-remove-image" onclick="removeCustomCardImage()">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
      </div>
      <div class="form-group">
        <label for="customCardNotes">Notas (opcional)</label>
        <textarea id="customCardNotes" class="form-input" rows="3" placeholder="Adicione observações sobre esta carta..."></textarea>
      </div>
      <div class="form-actions">
        <button class="btn-cancel" onclick="closeAddToAlbumModal()">Cancelar</button>
      </div>
    </div>
  `;
  
  // Adicionar handler para preview da imagem
  setTimeout(() => {
    const fileInput = document.getElementById('customCardImageFile');
    const uploadArea = document.getElementById('customCardUploadArea');
    
    if (fileInput && uploadArea) {
      // Click handler
      fileInput.addEventListener('change', (e) => {
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
          
          const preview = document.getElementById('customCardPreview');
          const previewImg = document.getElementById('customCardPreviewImg');
          const label = document.getElementById('customCardFileLabel');
          
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
  }, 100);
  
  albumsSection.style.display = "block";
  albumsSection.querySelector("h3").textContent = "Selecione um álbum para adicionar";
  
  // Atualiza o comportamento dos cards de álbum para adicionar carta personalizada
  loadUserAlbums(document.getElementById("albumsListModal"), true);
};

// Função para remover imagem de carta personalizada
window.removeCustomCardImage = function() {
  const fileInput = document.getElementById('customCardImageFile');
  const preview = document.getElementById('customCardPreview');
  const label = document.getElementById('customCardFileLabel');
  
  if (fileInput) fileInput.value = '';
  if (preview) preview.style.display = 'none';
  if (label) label.style.display = 'block';
};

// Função para converter arquivo para base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// Função para fazer upload da imagem
async function uploadImage(base64Image) {
  const apiBase = (window.API_BASE_URL || "http://localhost:3000").replace(/\/+$/g, "");
  const token = localStorage.getItem("token");
  
  const response = await fetch(`${apiBase}api/upload`, {
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

// Função para adicionar carta personalizada ao álbum
async function addCustomCardToAlbum(albumId) {
  const customName = document.getElementById("customCardName")?.value.trim();
  const fileInput = document.getElementById("customCardImageFile");
  const notes = document.getElementById("customCardNotes")?.value.trim();
  
  if (!customName) {
    alert("Nome da carta é obrigatório");
    return;
  }
  
  if (!fileInput || !fileInput.files || !fileInput.files[0]) {
    alert("Por favor, selecione uma imagem para a carta");
    return;
  }
  
  const imageFile = fileInput.files[0];
  
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Faça login para adicionar cartas");
    return;
  }
  
  try {
    // Mostrar loading
    const albumsSection = document.querySelector(".albums-section");
    if (albumsSection) {
      albumsSection.innerHTML = `
        <div class="albums-loading">
          <i class="fa-solid fa-spinner fa-spin"></i>
          <p>Fazendo upload da imagem...</p>
        </div>
      `;
    }
    
    // Fazer upload da imagem primeiro
    const base64Image = await fileToBase64(imageFile);
    const customImage = await uploadImage(base64Image);
    
    if (albumsSection) {
      albumsSection.innerHTML = `
        <div class="albums-loading">
          <i class="fa-solid fa-spinner fa-spin"></i>
          <p>Adicionando carta ao álbum...</p>
        </div>
      `;
    }
    
    // Agora adicionar a carta ao álbum
    const apiBase = (window.API_BASE_URL || "http://localhost:3000").replace(/\/+$/g, "");
    const response = await fetch(`${apiBase}/api/albums/${albumId}/cards`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        customName,
        customImage,
        notes: notes || null,
      }),
    });
    
    if (response.ok) {
      showSuccessMessage();
      closeAddToAlbumModal();
    } else {
      const error = await response.json();
      alert(error.message || "Erro ao adicionar carta personalizada ao álbum");
      // Recarregar lista de álbuns em caso de erro
      loadUserAlbums(document.getElementById("albumsListModal"), true);
    }
  } catch (error) {
    console.error("Error adding custom card to album:", error);
    alert("Erro ao adicionar carta personalizada ao álbum: " + error.message);
    // Recarregar lista de álbuns em caso de erro
    loadUserAlbums(document.getElementById("albumsListModal"), true);
  }
}

document.addEventListener("click", (e) => {
  const modal = document.getElementById("addToAlbumModal");
  if (modal && e.target === modal) {
    closeAddToAlbumModal();
  }
});
