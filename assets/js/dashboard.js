document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const viewingUserId = urlParams.get("userId");

  async function loadUserData() {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/pages/userLogin/login.html";
        return;
      }

      const apiUrl = window.apiUrl;

      // se ta vendo outro perfil
      if (viewingUserId) {
        const response = await fetch(apiUrl(`api/users/${viewingUserId}`), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Usuário não encontrado");
        }

        const user = await response.json();
        renderProfile(user, false); 
        return;
      }

      // carrega perfil proprio
      const response = await fetch(apiUrl("api/profile/me"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/pages/userLogin/login.html";
          return;
        }
        throw new Error("Erro ao carregar perfil");
      }

      const user = await response.json();
      renderProfile(user, true); 
    } catch (error) {
      console.error("❌ Erro ao carregar perfil:", error);
      document.getElementById("profile-name").innerText = "Erro ao carregar.";
    }
  }

  // navegacao das tabs
  const tabLinks = document.querySelectorAll(".profile-nav-link");
  tabLinks.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();

      tabLinks.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      document.querySelectorAll(".tab-content").forEach((content) => {
        content.style.display = "none";
        content.classList.remove("active");
      });

      const tabName = tab.getAttribute("data-tab");
      const tabContent = document.getElementById(`tab-${tabName}`);
      if (tabContent) {
        tabContent.style.display = "block";
        tabContent.classList.add("active");
      }

      // carrega dados
      if (tabName === "colecao") {
        loadUserAlbums();
      } else if (tabName === "atividades") {
        loadUserActivities();
      } else if (tabName === "favoritos") {
        loadUserFavorites();
      }
    });
  });

  async function loadUserAlbums() {
    try {
      console.log('carregando albums...');
      const token = localStorage.getItem("token");
      const apiUrl = window.apiUrl;

      let response;
      if (viewingUserId) {
        response = await fetch(apiUrl(`api/albums?userId=${viewingUserId}`), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        response = await fetch(apiUrl("api/albums"), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      if (!response.ok) throw new Error("Erro ao carregar álbuns");

      const albums = await response.json();
      const albumsGrid = document.getElementById("albums-grid");

      if (albums.length === 0) {
        albumsGrid.innerHTML = `
          <div class="empty-state">
            <i class="fa-solid fa-folder-open"></i>
            <p>Você ainda não criou nenhum álbum.</p>
            <a href="/pages/albums/create-album.html" class="btn-primary">Criar Álbum</a>
          </div>
        `;
        return;
      }

      albumsGrid.innerHTML = albums
        .map((album) => {
          let gameIcon = "fa-layer-group";
          if (
            album.gameType === "pokemon" ||
            album.gameType === "pokemon-tcg-pocket"
          ) {
            gameIcon = "fa-gamepad";
          } else if (album.gameType === "custom") {
            gameIcon = "fa-palette";
          }

          const coverContent = album.coverImage
            ? `<img src="${album.coverImage}" alt="${album.name}" class="album-cover-img" />`
            : `<i class="fa-solid ${gameIcon}"></i>`;

          return `
        <a href="/pages/albums/album-view.html?id=${
          album.id
        }" class="album-card">
          <div class="album-cover">
            ${coverContent}
          </div>
          <div class="album-info">
            <h3>${album.name}</h3>
            <p>${album.description || "Sem descrição"}</p>
            <span class="album-count">${album._count?.items || 0} cartas</span>
          </div>
        </a>
      `;
        })
        .join("");
    } catch (error) {
      console.error("❌ Erro ao carregar álbuns:", error);
      document.getElementById("albums-grid").innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <p>Erro ao carregar álbuns.</p>
        </div>
      `;
    }
  }

  async function loadUserActivities() {
    try {
      const token = localStorage.getItem("token");
      const apiUrl = window.apiUrl;

      let url = "api/activities?limit=20";
      if (viewingUserId) {
        url = `api/activities?userId=${viewingUserId}&limit=20`;
      }

      const response = await fetch(apiUrl(url), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Erro ao carregar atividades");

      const activities = await response.json();
      const activityFeed = document.getElementById("activity-feed");

      if (activities.length === 0) {
        activityFeed.innerHTML = `
          <div class="empty-state">
            <i class="fa-solid fa-ghost"></i>
            <p>Nenhuma atividade recente.</p>
          </div>
        `;
        return;
      }

      activityFeed.innerHTML = activities
        .map((activity) => {
          const { icon, text, color } = getActivityDisplay(activity);
          const timeAgo = formatTimeAgo(activity.createdAt);

          return `
            <div class="activity-item">
              <div class="activity-icon" style="background: ${color}20; color: ${color}">
                <i class="fa-solid ${icon}"></i>
              </div>
              <div class="activity-content">
                <p class="activity-text">${text}</p>
                <span class="activity-time">${timeAgo}</span>
              </div>
              ${
                activity.cardImage
                  ? `
                <div class="activity-thumbnail">
                  <img src="${activity.cardImage}" alt="${
                      activity.cardName || "Carta"
                    }" />
                </div>
              `
                  : ""
              }
            </div>
          `;
        })
        .join("");
    } catch (error) {
      console.error("❌ Erro ao carregar atividades:", error);
      document.getElementById("activity-feed").innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <p>Erro ao carregar atividades.</p>
        </div>
      `;
    }
  }

  function getActivityDisplay(activity) {
    const displays = {
      ALBUM_CREATED: {
        icon: "fa-folder-plus",
        text: `Criou o álbum <strong>${
          activity.albumName || "Álbum deletado"
        }</strong>`,
        color: "#00d4aa",
      },
      ALBUM_UPDATED: {
        icon: "fa-pen-to-square",
        text: `Editou o álbum <strong>${
          activity.albumName || "Álbum deletado"
        }</strong>`,
        color: "#ffa726",
      },
      ALBUM_DELETED: {
        icon: "fa-trash",
        text: `Deletou o álbum <strong>${
          activity.albumName || "Álbum"
        }</strong>`,
        color: "#ff3e6c",
      },
      CARD_ADDED: {
        icon: "fa-plus-circle",
        text: `Adicionou <strong>${
          activity.cardName
        }</strong> ao álbum <strong>${
          activity.albumName || "Álbum deletado"
        }</strong>`,
        color: "#00d4aa",
      },
      CARD_REMOVED: {
        icon: "fa-minus-circle",
        text: `Removeu <strong>${activity.cardName}</strong> do álbum <strong>${
          activity.albumName || "Álbum deletado"
        }</strong>`,
        color: "#ff3e6c",
      },
    };

    return (
      displays[activity.type] || {
        icon: "fa-circle",
        text: "Atividade desconhecida",
        color: "#666",
      }
    );
  }

  function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return "Agora mesmo";
    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;

    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  }

  function renderProfile(user, isOwnProfile = true) {
    document.getElementById("profile-name").innerText =
      user.username || user.name || "Usuário";
    document.getElementById("profile-nickname").innerText =
      user.nickname || `@${user.username || "user"}`;
    document.getElementById("profile-bio").innerText =
      user.bio || "Sem biografia.";

    const locationSpan = document
      .getElementById("meta-location")
      ?.querySelector("span");
    if (locationSpan) locationSpan.innerText = user.location || "Brasil";

    // Stats - handle both API formats
    const itemsCount = user.stats?.items || user._count?.albums || 0;
    const setsCount = user.stats?.sets || 0;

    document.getElementById("stat-items-count").innerText = itemsCount;
    document.getElementById("stat-collections-count").innerText = setsCount;

    if (user.avatarUrl) {
      document.getElementById("profile-pic-large").src = user.avatarUrl;
      const editAvatar = document.getElementById("edit-avatar-img");
      if (editAvatar) editAvatar.src = user.avatarUrl;
    }

    const coverEl = document.getElementById("profile-cover");
    const editCoverEl = document.getElementById("edit-cover-preview");

    if (user.coverUrl) {
      const url = `url('${user.coverUrl}')`;
      coverEl.style.backgroundImage = url;
      if (editCoverEl) editCoverEl.style.backgroundImage = url;
    } else {
      coverEl.style.backgroundColor = "#444";
      if (editCoverEl) editCoverEl.style.backgroundColor = "#333";
    }

    // so mostra edit se for perfil proprio
    const editBtn = document.getElementById("btn-edit-profile");
    if (editBtn) {
      editBtn.style.display = isOwnProfile ? "block" : "none";
    }

    const picOverlay = document.querySelector(".profile-pic-overlay");
    if (picOverlay) {
      picOverlay.style.display = isOwnProfile ? "flex" : "none";
    }

    // popula form só se for perfil proprio
    if (isOwnProfile) {
      const inputName = document.getElementById("input-full-name");
      const inputNick = document.getElementById("input-nick-name");
      const inputBio = document.getElementById("input-bio");
      const inputLoc = document.getElementById("input-location");

      if (inputName) inputName.value = user.nickname || user.username || "";
      if (inputNick) inputNick.value = user.username || "";
      if (inputBio) inputBio.value = user.bio || "";
      if (inputLoc) inputLoc.value = user.location || "";
    }
  }

  loadUserData();

  loadUserActivities();

  async function resizeImage(file, maxWidth, maxHeight) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          const aspectRatio = width / height;
          const targetRatio = maxWidth / maxHeight;

          if (maxWidth === 1500) {
            if (aspectRatio > targetRatio) {
              width = height * targetRatio;
            } else {
              height = width / targetRatio;
            }
            canvas.width = maxWidth;
            canvas.height = maxHeight;

            const ctx = canvas.getContext("2d");
            const scale = Math.max(maxWidth / width, maxHeight / height);
            const scaledWidth = width * scale;
            const scaledHeight = height * scale;
            const x = (maxWidth - scaledWidth) / 2;
            const y = (maxHeight - scaledHeight) / 2;

            ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
          } else {
            if (aspectRatio > targetRatio) {
              width = maxWidth;
              height = maxWidth / aspectRatio;
            } else {
              height = maxHeight;
              width = maxHeight * aspectRatio;
            }

            canvas.width = maxWidth;
            canvas.height = maxHeight;

            const ctx = canvas.getContext("2d");
            const x = (maxWidth - width) / 2;
            const y = (maxHeight - height) / 2;
            ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, maxWidth, maxHeight);
            ctx.drawImage(img, x, y, width, height);
          }

          resolve(canvas.toDataURL("image/jpeg", 0.9));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  const editProfileBtn = document.getElementById("btn-edit-profile");
  const editProfileModal = document.getElementById("edit-profile-modal");
  const closeModalBtn = document.getElementById("btn-close-modal");
  const editProfileForm = document.getElementById("edit-profile-form");

  const openModal = () => {
    editProfileModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  const closeModal = () => {
    editProfileModal.classList.remove("active");
    document.body.style.overflow = "";
  }

  if (editProfileBtn) editProfileBtn.addEventListener("click", openModal);
  if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);

  if (editProfileModal) {
    editProfileModal.addEventListener("click", (e) => {
      if (e.target === editProfileModal) closeModal();
    });
  }

  if (editProfileForm) {
    editProfileForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Sessão expirada. Faça login novamente.");
        window.location.href = "/pages/userLogin/login.html";
        return;
      }

      const submitBtn = document.querySelector(".btn-save-mini");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Salvando...";
      }

      try {
        const apiUrl = window.apiUrl;

        let avatarUrl = null;
        const avatarInput = document.getElementById("avatar-upload");
        if (avatarInput.files && avatarInput.files[0]) {
          console.log("🖼️ Avatar detectado:", avatarInput.files[0].name);
          const resizedAvatar = await resizeImage(
            avatarInput.files[0],
            400,
            400
          );
          console.log(
            "✂️ Avatar redimensionado, tamanho:",
            resizedAvatar.length,
            "chars"
          );

          const uploadResponse = await fetch(
            apiUrl("api/profile/upload-image"),
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ image: resizedAvatar, type: "avatar" }),
            }
          );

          console.log("📡 Upload avatar status:", uploadResponse.status);

          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            avatarUrl = uploadData.url;
            console.log("✅ Avatar URL:", avatarUrl);
          } else {
            const error = await uploadResponse.json();
            console.error("❌ Erro upload avatar:", error);
          }
        }

        let coverUrl = null;
        const coverInput = document.getElementById("cover-upload");
        if (coverInput.files && coverInput.files[0]) {
          console.log("🖼️ Cover detectado:", coverInput.files[0].name);
          const resizedCover = await resizeImage(
            coverInput.files[0],
            2000,
            667
          );
          console.log(
            "✂️ Cover redimensionado, tamanho:",
            resizedCover.length,
            "chars"
          );

          const uploadResponse = await fetch(
            apiUrl("api/profile/upload-image"),
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ image: resizedCover, type: "cover" }),
            }
          );

          console.log("📡 Upload cover status:", uploadResponse.status);

          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            coverUrl = uploadData.url;
            console.log("✅ Cover URL:", coverUrl);
          } else {
            const error = await uploadResponse.json();
            console.error("❌ Erro upload cover:", error);
          }
        }

        const profileData = {
          nickname: document.getElementById("input-full-name").value,
          username: document.getElementById("input-nick-name").value,
          bio: document.getElementById("input-bio").value,
          location: document.getElementById("input-location").value,
        };

        if (avatarUrl) profileData.avatarUrl = avatarUrl;
        if (coverUrl) profileData.coverUrl = coverUrl;

        console.log("📤 Enviando dados do perfil:", profileData);

        const response = await fetch(apiUrl("api/profile/me"), {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(profileData),
        });

        console.log("📥 Status da resposta:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Resposta do servidor:", data);
          alert("Perfil atualizado com sucesso!");
          closeModal();
          loadUserData();
        } else {
          const error = await response.json();
          console.error("❌ Erro do servidor:", error);
          alert(error.error || "Erro ao atualizar perfil");
        }
      } catch (error) {
        console.error("❌ Erro ao salvar:", error);
        alert("Erro ao salvar perfil. Tente novamente.");
      } finally {
        const submitBtn = document.querySelector(".btn-save-mini");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Salvar";
        }
      }
    });
  }

  const coverUpload = document.getElementById("cover-upload");
  const avatarUpload = document.getElementById("avatar-upload");

  function handleImagePreview(input, imgElement, bgElement) {
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = function (e) {
        if (imgElement) imgElement.src = e.target.result;
        if (bgElement)
          bgElement.style.backgroundImage = `url('${e.target.result}')`;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  if (avatarUpload) {
    avatarUpload.addEventListener("change", function () {
      handleImagePreview(
        this,
        document.getElementById("edit-avatar-img"),
        null
      );
    });
  }

  if (coverUpload) {
    coverUpload.addEventListener("change", function () {
      handleImagePreview(
        this,
        null,
        document.getElementById("edit-cover-preview")
      );
    });
  }

  // Função para carregar favoritos do usuário
  async function loadUserFavorites() {
    try {
      const token = localStorage.getItem("token");
      const apiUrl = window.apiUrl;

      const response = await fetch(apiUrl("api/favorites"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Erro ao carregar favoritos");

      const favorites = await response.json();
      const favoritesGrid = document.getElementById("favorites-grid");

      if (favorites.length === 0) {
        favoritesGrid.innerHTML = `
          <div class="empty-state">
            <i class="fa-solid fa-heart"></i>
            <p>Você ainda não adicionou nenhuma carta aos favoritos.</p>
          </div>
        `;
        return;
      }

      favoritesGrid.innerHTML = favorites
        .map((favorite) => {
          const card = favorite.card;
          return `
            <div class="favorite-card" onclick="window.location.href='/pages/explore/card-details.html?id=${
              card.id
            }'">
              <img src="${
                card.imageUrl || "/assets/images/placeholder-card.png"
              }" alt="${card.nameEn}" />
              <div class="favorite-card-info">
                <h4>${card.nameEn}</h4>
                <p>${card.set?.nameEn || ""} - #${card.number}</p>
              </div>
            </div>
          `;
        })
        .join("");
    } catch (error) {
      console.error("Erro ao carregar favoritos:", error);
      document.getElementById("favorites-grid").innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <p>Erro ao carregar favoritos.</p>
        </div>
      `;
    }
  }
});
