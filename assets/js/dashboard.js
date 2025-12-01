document.addEventListener("DOMContentLoaded", () => {
  async function loadUserData() {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/pages/userLogin/login.html";
        return;
      }

      const apiUrl = window.apiUrl;
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
      renderProfile(user);
    } catch (error) {
      console.error("❌ Erro ao carregar perfil:", error);
      document.getElementById("profile-name").innerText = "Erro ao carregar.";
    }
  }

  // Tab navigation
  const tabLinks = document.querySelectorAll(".profile-nav-link");
  tabLinks.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();

      // Remove active de todas as abas
      tabLinks.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      // Esconde todos os conteúdos
      document.querySelectorAll(".tab-content").forEach((content) => {
        content.style.display = "none";
        content.classList.remove("active");
      });

      // Mostra o conteúdo da aba clicada
      const tabName = tab.getAttribute("data-tab");
      const tabContent = document.getElementById(`tab-${tabName}`);
      if (tabContent) {
        tabContent.style.display = "block";
        tabContent.classList.add("active");
      }

      // Carrega dados específicos da aba
      if (tabName === "colecao") {
        loadUserAlbums();
      } else if (tabName === "atividades") {
        loadUserActivities();
      }
    });
  });

  async function loadUserAlbums() {
    try {
      const token = localStorage.getItem("token");
      const apiUrl = window.apiUrl;

      const response = await fetch(apiUrl("api/albums"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
        .map(
          (album) => `
        <a href="/pages/albums/album-view.html?id=${
          album.id
        }" class="album-card">
          <div class="album-cover">
            <i class="fa-solid fa-layer-group"></i>
          </div>
          <div class="album-info">
            <h3>${album.name}</h3>
            <p>${album.description || "Sem descrição"}</p>
            <span class="album-count">${album._count?.items || 0} cartas</span>
          </div>
        </a>
      `
        )
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
    // TODO: Implementar carregamento de atividades
    console.log("Carregando atividades...");
  }

  function renderProfile(user) {
    document.getElementById("profile-name").innerText = user.username;
    document.getElementById("profile-nickname").innerText =
      user.nickname || `@${user.username}`;
    document.getElementById("profile-bio").innerText =
      user.bio || "Sem biografia.";

    const locationSpan = document
      .getElementById("meta-location")
      ?.querySelector("span");
    if (locationSpan) locationSpan.innerText = user.location || "Brasil";

    document.getElementById("stat-items-count").innerText = user.stats.items;
    document.getElementById("stat-collections-count").innerText =
      user.stats.sets;

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

    const inputName = document.getElementById("input-full-name");
    const inputNick = document.getElementById("input-nick-name");
    const inputBio = document.getElementById("input-bio");
    const inputLoc = document.getElementById("input-location");

    if (inputName) inputName.value = user.nickname || user.username || "";
    if (inputNick) inputNick.value = user.username || "";
    if (inputBio) inputBio.value = user.bio || "";
    if (inputLoc) inputLoc.value = user.location || "";
  }

  loadUserData();

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

  function openModal() {
    editProfileModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
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
});
