window.API_BASE_URL = window.API_BASE_URL || "http://localhost:3000/";

let currentItem = null;
let currentAlbumId = null;

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/pages/userLogin/login.html";
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get("id");
  currentAlbumId = urlParams.get("albumId");

  if (!itemId || !currentAlbumId) {
    showToast("❌ Item ou álbum não encontrado", "error", 5000);
    setTimeout(() => window.history.back(), 2000);
    return;
  }

  loadCustomItem(itemId);
});

async function loadCustomItem(itemId) {
  const token = localStorage.getItem("token");
  const loadingState = document.getElementById("loadingState");
  const itemContent = document.getElementById("itemContent");

  try {
    // Buscar detalhes do álbum para obter os itens
    const response = await fetch(apiUrl(`api/albums/${currentAlbumId}`), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao carregar item (${response.status})`);
    }

    const album = await response.json();
    console.log('📦 Album completo:', album);
    console.log('📋 Items do album:', album.items);
    
    const item = album.items.find(i => i.id === parseInt(itemId));
    console.log('🔍 Item encontrado:', item);

    if (!item || !item.customName) {
      throw new Error("Item personalizado não encontrado");
    }

    currentItem = item;

    // Preencher dados na página
    document.getElementById("itemName").textContent = item.customName;
    document.getElementById("albumName").textContent = album.name;
    document.getElementById("itemQuantity").textContent = item.quantity || 1;
    document.getElementById("itemDate").textContent = new Date(item.createdAt).toLocaleDateString('pt-BR');

    console.log('🖼️ Item customImage:', item.customImage);
    console.log('📦 Item completo:', item);

    const itemImage = document.getElementById("itemImage");
    const imagePlaceholder = document.getElementById("imagePlaceholder");

    if (item.customImage && item.customImage.trim() !== '') {
      itemImage.src = item.customImage;
      itemImage.alt = item.customName;
      itemImage.style.display = 'block';
      imagePlaceholder.style.display = 'none';
      
      itemImage.onerror = () => {
        console.error('❌ Erro ao carregar imagem:', item.customImage);
        itemImage.style.display = 'none';
        imagePlaceholder.style.display = 'flex';
      };
    } else {
      console.log('⚠️ Sem customImage, mostrando placeholder');
      itemImage.style.display = 'none';
      imagePlaceholder.style.display = 'flex';
    }

    // Mostrar notas se existirem
    if (item.notes) {
      document.getElementById("itemNotes").textContent = item.notes;
      document.getElementById("notesSection").style.display = "block";
    }

    // Atualizar título da página
    document.title = `${item.customName} - CollectionHub`;

    loadingState.style.display = "none";
    itemContent.style.display = "block";

  } catch (error) {
    console.error("Erro ao carregar item:", error);
    showToast(`❌ ${error.message}`, "error", 6000);
    loadingState.style.display = "none";
    setTimeout(() => window.history.back(), 2000);
  }
}

function editCustomItem() {
  if (!currentItem) {
    showToast("❌ Item não carregado", "error", 3000);
    return;
  }

  // Criar modal de edição
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.id = "editItemModal";
  modal.innerHTML = `
    <div class="modal-content custom-item-modal">
      <div class="modal-header">
        <div class="modal-header-content">
          <i class="fa-solid fa-pen"></i>
          <h2>Editar Item Personalizado</h2>
        </div>
        <button class="btn-close-modal" onclick="closeEditModal()">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div class="modal-body">
        <form id="editItemForm" class="custom-item-form">
          <div class="form-group">
            <label for="editItemName">Nome do Item *</label>
            <input 
              type="text" 
              id="editItemName" 
              class="form-input" 
              placeholder="Ex: Figura de Ação do Batman"
              value="${currentItem.customName || ''}"
              required 
              maxlength="100"
            />
          </div>

          <div class="form-group">
            <label for="editItemNotes">Descrição/Notas</label>
            <textarea 
              id="editItemNotes" 
              class="form-input" 
              rows="3" 
              placeholder="Adicione detalhes sobre este item..."
              maxlength="500"
            >${currentItem.notes || ''}</textarea>
          </div>

          <div class="form-group">
            <label for="editItemImage">Imagem do Item</label>
            <div class="image-upload-area" id="editImageUploadArea">
              <input 
                type="file" 
                id="editItemImage" 
                accept="image/*" 
                style="display: none;"
              />
              <div class="upload-placeholder" id="editUploadPlaceholder" style="${currentItem.customImage ? 'display: none;' : ''}">
                <i class="fa-solid fa-cloud-arrow-up"></i>
                <p>Clique para selecionar uma nova imagem</p>
                <span>PNG, JPG ou WEBP (máx. 5MB)</span>
              </div>
              <div class="image-preview" id="editImagePreview" style="${currentItem.customImage ? 'display: flex;' : 'display: none;'}">
                <img src="${currentItem.customImage || ''}" alt="Preview" id="editPreviewImg" />
                <div class="image-preview-actions">
                  <button type="button" class="btn-change-image" onclick="document.getElementById('editItemImage').click()">
                    <i class="fa-solid fa-rotate"></i> Trocar Imagem
                  </button>
                  <button type="button" class="btn-remove-image" onclick="removeEditImage()">
                    <i class="fa-solid fa-trash"></i> Remover Imagem
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" onclick="closeEditModal()">Cancelar</button>
            <button type="submit" class="btn-primary" id="submitEditBtn">
              <i class="fa-solid fa-save"></i> Salvar Alterações
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
  const imageInput = document.getElementById("editItemImage");
  const uploadArea = document.getElementById("editImageUploadArea");
  const uploadPlaceholder = document.getElementById("editUploadPlaceholder");
  const imagePreview = document.getElementById("editImagePreview");
  const previewImg = document.getElementById("editPreviewImg");

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
      handleEditImageSelect(file, previewImg, uploadPlaceholder, imagePreview);
    }
  });

  // File input change
  imageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      handleEditImageSelect(file, previewImg, uploadPlaceholder, imagePreview);
    }
  });

  // Form submit
  document.getElementById("editItemForm").addEventListener("submit", handleEditSubmit);
}

function handleEditImageSelect(file, previewImg, uploadPlaceholder, imagePreview) {
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
  };
  reader.readAsDataURL(file);
}

window.removeEditImage = function() {
  const fileInput = document.getElementById("editItemImage");
  const preview = document.getElementById("editImagePreview");
  const placeholder = document.getElementById("editUploadPlaceholder");
  
  if (fileInput) fileInput.value = '';
  if (preview) preview.style.display = 'none';
  if (placeholder) placeholder.style.display = 'flex';
  
  // Marcar para remover imagem
  currentItem.removeImage = true;
};

window.closeEditModal = function() {
  const modal = document.getElementById("editItemModal");
  if (modal) {
    modal.classList.remove("active");
    document.body.classList.remove('modal-open');
    setTimeout(() => modal.remove(), 300);
  }
};

async function handleEditSubmit(e) {
  e.preventDefault();

  const name = document.getElementById("editItemName").value.trim();
  const notes = document.getElementById("editItemNotes").value.trim();
  const imageInput = document.getElementById("editItemImage");
  const submitBtn = document.getElementById("submitEditBtn");

  if (!name) {
    showToast("⚠️ Nome do item é obrigatório", "error", 5000);
    return;
  }

  // Disable button
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';

  try {
    const token = localStorage.getItem("token");
    let imageUrl = currentItem.customImage;

    // Se uma nova imagem foi selecionada, fazer upload
    if (imageInput.files[0]) {
      console.log('🔄 Upload de nova imagem...');
      imageUrl = await uploadEditImage(imageInput.files[0], token);
      console.log('✅ Nova imagem:', imageUrl);
    } else if (currentItem.removeImage) {
      // Se marcado para remover
      imageUrl = null;
    }

    // Atualizar item
    const requestBody = {
      customName: name,
      customImage: imageUrl,
      notes: notes || null,
    };

    console.log('📤 Atualizando item:', requestBody);
    console.log('🔗 URL:', `${window.API_BASE}/api/albums/items/${currentItem.id}`);

    const response = await fetch(
      `${window.API_BASE}/api/albums/items/${currentItem.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `Erro ao atualizar item (${response.status})`);
    }

    const updatedItem = await response.json();
    console.log("✅ Item atualizado:", updatedItem);

    // Atualizar dados na página
    currentItem = updatedItem;
    document.getElementById("itemName").textContent = updatedItem.customName;
    document.getElementById("itemNotes").textContent = updatedItem.notes || '';
    
    if (updatedItem.notes) {
      document.getElementById("notesSection").style.display = "block";
    } else {
      document.getElementById("notesSection").style.display = "none";
    }

    const itemImage = document.getElementById("itemImage");
    const imagePlaceholder = document.getElementById("imagePlaceholder");

    if (updatedItem.customImage && updatedItem.customImage.trim() !== '') {
      itemImage.src = updatedItem.customImage;
      itemImage.style.display = 'block';
      imagePlaceholder.style.display = 'none';
    } else {
      itemImage.style.display = 'none';
      imagePlaceholder.style.display = 'flex';
    }

    showToast("✅ Item atualizado com sucesso!", "success", 5000);
    closeEditModal();
    
    // Recarregar a página para mostrar as alterações
    setTimeout(() => {
      window.location.reload();
    }, 500);

  } catch (error) {
    console.error("❌ Erro ao atualizar item:", error);
    showToast(`❌ ${error.message}`, "error", 6000);
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fa-solid fa-save"></i> Salvar Alterações';
  }
}

async function uploadEditImage(file, token) {
  try {
    console.log('📤 Redimensionando e enviando imagem...');
    
    // Resize para 600x600
    const resizedBase64 = await resizeImage(file, 600, 600);

    // Upload para ImgBB
    const response = await fetch(`${window.API_BASE}/api/upload`, {
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
        throw new Error(errorData.error || errorData.message || `Erro ao fazer upload (${response.status})`);
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

function resizeImage(file, maxWidth, maxHeight) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

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

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const base64 = canvas.toDataURL('image/jpeg', 0.85);
        resolve(base64);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function deleteCustomItem() {
  if (!confirm(`Deseja remover "${currentItem.customName}" do álbum?`)) {
    return;
  }

  const token = localStorage.getItem("token");

  try {
    const response = await fetch(
      `${window.API_BASE}/api/albums/${currentAlbumId}/items/${currentItem.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `Erro ao remover item (${response.status})`);
    }

    showToast("✅ Item removido com sucesso!", "success", 5000);
    setTimeout(() => {
      window.location.href = `/pages/albums/album-view.html?id=${currentAlbumId}`;
    }, 1500);

  } catch (error) {
    console.error("Erro ao remover item:", error);
    showToast(`❌ ${error.message}`, "error", 6000);
  }
}
