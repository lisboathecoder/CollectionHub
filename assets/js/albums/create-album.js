if (typeof window.API_BASE_URL === "undefined") {
    window.API_BASE_URL = 'http://localhost:3000';
}
const API_BASE_URL = window.API_BASE_URL;

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/pages/userLogin/login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const albumType = urlParams.get('type') || 'pokemon-tcg-pocket';

    updateAlbumTypeDisplay(albumType);

  const form = document.getElementById("createAlbumForm");
  const nameInput = document.getElementById("albumName");
  const descInput = document.getElementById("albumDescription");
  const categorySelect = document.getElementById("albumCategory");
  const customCategoryInput = document.getElementById("customCategory");
  const customCategoryGroup = document.getElementById("customCategoryGroup");
  const coverInput = document.getElementById("albumCover");
  const coverPreview = document.getElementById("coverPreview");
  const coverPreviewImg = document.getElementById("coverPreviewImg");
  const nameCount = document.getElementById("nameCount");
  const descCount = document.getElementById("descCount");
  const cancelBtn = document.getElementById("cancelBtn");
  const submitBtn = document.getElementById("submitBtn");
  const errorMessage = document.getElementById("errorMessage");
  const successMessage = document.getElementById("successMessage");

    nameInput.addEventListener('input', () => {
        nameCount.textContent = nameInput.value.length;
    });

  descInput.addEventListener("input", () => {
    descCount.textContent = descInput.value.length;
  });

  // Mostrar/ocultar campo de categoria personalizada
  categorySelect.addEventListener("change", () => {
    if (categorySelect.value === "custom") {
      customCategoryGroup.style.display = "block";
      customCategoryInput.required = true;
    } else {
      customCategoryGroup.style.display = "none";
      customCategoryInput.required = false;
    }
  });

  // Preview da imagem de capa
  coverInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        coverPreviewImg.src = e.target.result;
        coverPreview.style.display = "block";
      };
      reader.readAsDataURL(file);
    } else {
      coverPreview.style.display = "none";
    }
  });

    cancelBtn.addEventListener('click', () => {
        if (confirm('Deseja cancelar a criação do álbum?')) {
            window.history.back();
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

    const name = nameInput.value.trim();
    const description = descInput.value.trim();
    const category = categorySelect.value;
    const customCategory = customCategoryInput.value.trim();
    const isPublic = document.getElementById("isPublic").checked;

    if (!name) {
      showError("Por favor, insira um nome para o álbum");
      return;
    }

    if (category === "custom" && !customCategory) {
      showError("Por favor, insira o nome da categoria personalizada");
      return;
    }

        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Criando...';

      let coverUrl = null;

      // Upload da imagem de capa se fornecida
      if (coverInput.files && coverInput.files[0]) {
        const file = coverInput.files[0];
        const reader = new FileReader();

        coverUrl = await new Promise((resolve, reject) => {
          reader.onload = async (e) => {
            try {
              const base64Image = e.target.result;
              const uploadResponse = await fetch(
                `${API_BASE_URL}api/profile/upload-image`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    image: base64Image,
                    type: "album-cover",
                  }),
                }
              );

              if (uploadResponse.ok) {
                const uploadData = await uploadResponse.json();
                resolve(uploadData.url);
              } else {
                reject(new Error("Erro ao fazer upload da imagem"));
              }
            } catch (error) {
              reject(error);
            }
          };
          reader.readAsDataURL(file);
        });
      }

      const albumData = {
        name,
        description: description || null,
        type: category === "custom" ? customCategory : category,
        gameType: category === "custom" ? customCategory : category,
        isPublic: isPublic,
      };

      if (coverUrl) {
        albumData.coverUrl = coverUrl;
      }

      const response = await fetch(`${API_BASE_URL}api/albums`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(albumData),
      });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao criar álbum');
            }

            const album = await response.json();

            showSuccess('Álbum criado com sucesso!');

      setTimeout(() => {
        window.location.href = `/pages/albums/album-view.html?id=${album.id}`;
      }, 1500);
    } catch (error) {
      console.error(error);
      showError(error.message || "Erro ao criar álbum");
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Criar Álbum';
    }
  });

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
    successMessage.style.display = "none";
    setTimeout(() => {
      errorMessage.style.display = "none";
    }, 5000);
  }

  function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.style.display = "block";
    errorMessage.style.display = "none";
  }
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
