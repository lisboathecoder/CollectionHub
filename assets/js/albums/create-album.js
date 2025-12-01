window.API_BASE_URL = window.API_BASE_URL || "http://localhost:3000/";

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/pages/userLogin/login.html";
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const albumType = urlParams.get("type") || "pokemon-tcg-pocket";

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

  nameInput.addEventListener("input", () => {
    nameCount.textContent = nameInput.value.length;
  });

  descInput.addEventListener("input", () => {
    descCount.textContent = descInput.value.length;
  });

  categorySelect.addEventListener("change", () => {
    if (categorySelect.value === "custom") {
      customCategoryGroup.classList.remove("hidden");
      customCategoryInput.required = true;
    } else {
      customCategoryGroup.classList.add("hidden");
      customCategoryInput.required = false;
    }
  });

  coverInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        coverPreviewImg.src = e.target.result;
        coverPreview.classList.remove("hidden");
      };
      reader.readAsDataURL(file);
    } else {
      coverPreview.classList.add("hidden");
    }
  });

  cancelBtn.addEventListener("click", () => {
    if (confirm("Deseja cancelar a criação do álbum?")) {
      window.history.back();
    }
  });

  form.addEventListener("submit", async (e) => {
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
      submitBtn.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Criando...';

      let coverUrl = null;

      if (coverInput.files && coverInput.files[0]) {
        const file = coverInput.files[0];
        const reader = new FileReader();

        coverUrl = await new Promise((resolve, reject) => {
          reader.onload = async (e) => {
            try {
              const base64Image = e.target.result;
              const uploadResponse = await fetch(apiUrl("api/upload"), {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  image: base64Image,
                  type: "album-cover",
                }),
              });

              if (uploadResponse.ok) {
                const uploadData = await uploadResponse.json();
                resolve(uploadData.url);
              } else {
                const errorData = await uploadResponse.json();
                reject(
                  new Error(errorData.error || "Erro ao fazer upload da imagem")
                );
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
        throw new Error(error.error || "Erro ao criar álbum");
      }

      const album = await response.json();

      showSuccess("Álbum criado com sucesso!");

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
    errorMessage.classList.add("active");
    successMessage.classList.remove("active");
    setTimeout(() => {
      errorMessage.classList.remove("active");
    }, 5000);
  }

  function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.classList.add("active");
    errorMessage.classList.remove("active");
  }
});

function updateAlbumTypeDisplay(type) {
  const gameTypeIcon = document.getElementById("gameTypeIcon");
  const gameTypeText = document.getElementById("gameTypeText");

  const typeMapping = {
    "pokemon-tcg-pocket": {
      icon: "fa-cards-blank",
      text: "Pokémon TCG Pocket",
    },
    pokemon: { icon: "fa-cards-blank", text: "Pokémon TCG" },
    magic: { icon: "fa-hat-wizard", text: "Magic: The Gathering" },
    yugioh: { icon: "fa-dragon", text: "Yu-Gi-Oh!" },
    onepiece: { icon: "fa-ship", text: "One Piece Card Game" },
    custom: { icon: "fa-star", text: "Personalizado" },
  };

  const config = typeMapping[type] || typeMapping["custom"];

  if (gameTypeIcon) {
    gameTypeIcon.className = `fa-solid ${config.icon} game-type-icon`;
  }
  if (gameTypeText) {
    gameTypeText.textContent = config.text;
  }
}
