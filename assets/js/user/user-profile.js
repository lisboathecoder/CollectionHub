const apiUrl = window.apiUrl;

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get("id");
  const username = urlParams.get("username");

  if (!userId && !username) {
    alert("Usuário não especificado");
    window.history.back();
    return;
  }

  const backBtn = document.getElementById("backBtn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.history.back();
    });
  }

  await loadUserProfile(userId, username);
});

async function loadUserProfile(userId, username) {
  try {
    let user;

    if (userId) {
      const response = await fetch(apiUrl(`api/users/${userId}`));
      if (!response.ok) throw new Error("Usuário não encontrado");
      user = await response.json();
    } else if (username) {
      const cleanUsername = username.replace("@", "");
      const response = await fetch(
        apiUrl(`api/users/search?q=${encodeURIComponent(cleanUsername)}`)
      );
      if (!response.ok) throw new Error("Usuário não encontrado");
      const users = await response.json();

      if (users.length === 0) {
        throw new Error("Usuário não encontrado");
      }

      user = users.find(
        (u) =>
          u.username?.toLowerCase() === cleanUsername.toLowerCase() ||
          u.email?.toLowerCase() === cleanUsername.toLowerCase()
      );

      if (!user) {
        user = users[0];
      }
    }

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    displayUserInfo(user);
    await loadUserAlbums(user.id);
  } catch (error) {
    console.error("Error loading user profile:", error);
    document.querySelector(".profile-info h1").textContent =
      "Erro ao carregar perfil";
    document.querySelector(".user-email").textContent = error.message;
  }
}

function displayUserInfo(user) {
  const userAvatar = document.getElementById("userAvatar");
  const userName = document.getElementById("userName");
  const userEmail = document.getElementById("userEmail");

  if (userAvatar && user.avatarUrl) {
    userAvatar.src = user.avatarUrl;
  }

  if (userName) {
    userName.textContent = user.username || user.name || "Usuário";
  }

  if (userEmail) {
    userEmail.textContent = user.username
      ? `@${user.username}`
      : user.email || "";
  }

  document.title = `${
    user.username || user.name || "Usuário"
  } - Collection Hub`;
}

async function loadUserAlbums(userId) {
  const albumsGrid = document.getElementById("userAlbums");

  try {
    const response = await fetch(
      apiUrl(`api/albums?userId=${userId}&isPublic=true`)
    );

    if (!response.ok) {
      throw new Error("Erro ao carregar álbuns");
    }

    const albums = await response.json();

    const albumCount = document.getElementById("albumCount");
    if (albumCount) {
      albumCount.textContent = albums.length;
    }

    let totalCards = 0;
    albums.forEach((album) => {
      totalCards += album._count?.items || 0;
    });

    const cardCount = document.getElementById("cardCount");
    if (cardCount) {
      cardCount.textContent = totalCards;
    }

    if (albums.length === 0) {
      albumsGrid.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-book"></i>
          <h3>Nenhum álbum público</h3>
          <p>Este usuário ainda não possui álbuns públicos.</p>
        </div>
      `;
      return;
    }

    albumsGrid.innerHTML = albums
      .map(
        (album) => `
      <div class="album-card-list" onclick="viewAlbum('${album.id}')">
        <div class="album-card-header">
          <div class="album-icon-large">
            ${
              album.coverUrl
                ? `<img src="${album.coverUrl}" alt="${album.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;">`
                : `<i class="fa-solid fa-book"></i>`
            }
          </div>
          <div class="album-card-info">
            <h3>${album.name}</h3>
            <p style="color: #9aa7b0; font-size: 13px;">${
              album.description || "Sem descrição"
            }</p>
          </div>
        </div>
        <div class="album-card-stats">
          <div class="stat-item">
            <i class="fa-solid fa-layer-group"></i>
            <span>${album._count?.items || 0} cartas</span>
          </div>
          <div class="stat-item">
            <i class="fa-solid fa-calendar"></i>
            <span>${new Date(album.createdAt).toLocaleDateString(
              "pt-BR"
            )}</span>
          </div>
        </div>
      </div>
    `
      )
      .join("");
  } catch (error) {
    console.error("Error loading albums:", error);
    albumsGrid.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <h3>Erro ao carregar álbuns</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
}

function viewAlbum(albumId) {
  window.location.href = `/pages/albums/album-view.html?id=${albumId}`;
}
