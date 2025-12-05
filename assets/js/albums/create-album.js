window.API_BASE_URL = window.API_BASE_URL || "http://localhost:3000/";

let coverImageFile = null;

// Função para remover imagem de capa
window.removeCoverImage = function() {
  coverImageFile = null;
  document.getElementById('coverImage').value = '';
  document.getElementById('coverPreview').style.display = 'none';
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
  const response = await fetch(apiUrl('api/upload'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ image: base64Image })
  });
  
  if (!response.ok) {
    throw new Error('Erro ao fazer upload da imagem');
  }
  
  const data = await response.json();
  return data.imageUrl;
}

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/pages/userLogin/login.html";
    return;
  }
  
  // Handler para upload de imagem de capa
  const coverInput = document.getElementById('coverImage');
  if (coverInput) {
    coverInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
          showToast('Por favor, selecione uma imagem válida', 'error');
          e.target.value = '';
          return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
          showToast('A imagem deve ter no máximo 5MB', 'error');
          e.target.value = '';
          return;
        }
        
        coverImageFile = file;
        const preview = document.getElementById('coverPreview');
        const previewImg = document.getElementById('coverPreviewImg');
        const fileLabel = document.querySelector('.file-label');
        
        const reader = new FileReader();
        reader.onload = (e) => {
          previewImg.src = e.target.result;
          preview.style.display = 'block';
          if (fileLabel) fileLabel.style.display = 'none';
        };
        reader.readAsDataURL(file);
      }
    });
  }

  const urlParams = new URLSearchParams(window.location.search);
  const albumType = urlParams.get("type") || "pokemon-tcg-pocket";

  // Atualizar display e obter o gameType correto para o backend
  const gameTypeValue = updateAlbumTypeDisplay(albumType);

  const form = document.getElementById("createAlbumForm");
  const nameInput = document.getElementById("albumName");
  const descriptionInput = document.getElementById("albumDescription");
  const nameCount = document.getElementById("nameCount");
  const descriptionCount = document.getElementById("descriptionCount");
  const cancelBtn = document.getElementById("cancelBtn");
  const submitBtn = document.getElementById("submitBtn");
  const errorMessage = document.getElementById("errorMessage");
  const successMessage = document.getElementById("successMessage");

  nameInput.addEventListener("input", () => {
    nameCount.textContent = `${nameInput.value.length}/50`;
  });
  
  if (descriptionInput && descriptionCount) {
    descriptionInput.addEventListener("input", () => {
      descriptionCount.textContent = `${descriptionInput.value.length}/500`;
    });
  }

  cancelBtn.addEventListener("click", () => {
    if (confirm("Deseja cancelar a criação do álbum?")) {
      window.history.back();
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const description = descriptionInput?.value.trim() || null;
    const customCategory = document.getElementById("customCategory")?.value.trim() || null;
    const isPublic = document.getElementById("isPublic").checked;

    if (!name) {
      showToast("Por favor, insira um nome para o álbum", "error");
      return;
    }
    
    // Validar categoria personalizada se for álbum custom
    if (gameTypeValue === "custom" && !customCategory) {
      showToast("Por favor, defina uma categoria para o álbum personalizado", "error");
      return;
    }

    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Criando...';

      let coverUrl = null;
      
      // Se há imagem de capa, fazer upload primeiro
      if (coverImageFile) {
        submitBtn.innerHTML =
          '<i class="fa-solid fa-spinner fa-spin"></i> Enviando imagem...';
        try {
          const base64Image = await fileToBase64(coverImageFile);
          coverUrl = await uploadImage(base64Image);
          console.log('✅ Upload da capa concluído:', coverUrl);
        } catch (uploadError) {
          console.error('❌ Erro no upload da capa:', uploadError);
          showToast('Erro ao fazer upload da imagem da capa', "error");
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Criar Álbum';
          return;
        }
        submitBtn.innerHTML =
          '<i class="fa-solid fa-spinner fa-spin"></i> Criando álbum...';
      }

      const albumData = {
        name,
        description,
        gameType: gameTypeValue,
        customCategory: gameTypeValue === "custom" ? customCategory : null,
        isPublic: isPublic,
        coverUrl: coverUrl,
      };
      
      console.log('📦 Dados do álbum:', albumData);

      const response = await fetch(apiUrl("api/albums"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(albumData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao criar álbum");
      }

      const album = await response.json();
      console.log('✅ Álbum criado:', album);

      showToast("Álbum criado com sucesso!", "success");

      // Check if there's a pending card to add
      const pendingCard = localStorage.getItem("pendingCard");
      if (pendingCard) {
        try {
          const card = JSON.parse(pendingCard);
          console.log("📦 Found pending card to add:", card);

          // Add the card to the newly created album
          const addCardResponse = await fetch(
            apiUrl(`api/albums/${album.id}/items`),
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                cardId: String(card.id || card),
                quantity: 1,
              }),
            }
          );

          if (addCardResponse.ok) {
            console.log("✅ Card added to new album successfully");
            localStorage.removeItem("pendingCard");
          } else {
            console.error(
              "❌ Failed to add card to new album:",
              await addCardResponse.text()
            );
          }
        } catch (err) {
          console.error("❌ Error adding pending card:", err);
        }
      }

      setTimeout(() => {
        window.location.href = `/pages/albums/album-view.html?id=${album.id}`;
      }, 1500);
    } catch (error) {
      console.error('❌ Erro ao criar álbum:', error);
      showToast(error.message || "Erro ao criar álbum", "error");
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Criar Álbum';
    }
  });
});

function updateAlbumTypeDisplay(type) {
  const gameTypeIcon = document.getElementById("gameTypeIcon");
  const gameTypeText = document.getElementById("gameTypeText");
  const customCategoryGroup = document.getElementById("customCategoryGroup");
  const customCategoryInput = document.getElementById("customCategory");

  const typeMapping = {
    "pokemon-tcg-pocket": {
      icon: "fa-cards-blank",
      text: "Pokémon TCG Pocket",
      value: "pokemon"
    },
    pokemon: { icon: "fa-cards-blank", text: "Pokémon TCG", value: "pokemon" },
    custom: { icon: "fa-star", text: "Personalizado", value: "custom" },
  };

  const config = typeMapping[type] || typeMapping["custom"];

  if (gameTypeIcon) {
    gameTypeIcon.className = `fa-solid ${config.icon} game-type-icon`;
  }
  if (gameTypeText) {
    gameTypeText.textContent = config.text;
  }
  
  // Mostrar/esconder campo de categoria personalizada
  if (type === "custom") {
    if (customCategoryGroup) customCategoryGroup.style.display = "flex";
    if (customCategoryInput) customCategoryInput.required = true;
  } else {
    if (customCategoryGroup) customCategoryGroup.style.display = "none";
    if (customCategoryInput) customCategoryInput.required = false;
  }
  
  return config.value;
}
