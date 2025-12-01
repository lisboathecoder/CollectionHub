window.API_BASE_URL = window.API_BASE_URL || "http://localhost:3000/";
let allAlbums = [];
let filteredAlbums = [];

document.addEventListener("DOMContentLoaded", async () => {
  await checkAuth();
  await loadAlbums();
});

async function checkAuth() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/pages/userLogin/login.html";
    return;
  }
}

async function loadAlbums() {
  const token = localStorage.getItem("token");
  const loadingState = document.getElementById("loadingState");
  const albumsGrid = document.getElementById("albumsGrid");
  const emptyState = document.getElementById("emptyState");

  try {
    const response = await fetch(`${API_BASE_URL}api/albums`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      allAlbums = await response.json();
      filteredAlbums = [...allAlbums];

      loadingState.style.display = "none";

      if (allAlbums.length === 0) {
        albumsGrid.style.display = "none";
        emptyState.style.display = "flex";
      } else {
        emptyState.style.display = "none";
        displayAlbums(filteredAlbums);
      }
    } else {
      throw new Error("Erro ao carregar álbuns");
    }
  } catch (error) {
    console.error("Erro ao carregar álbuns:", error);
    loadingState.style.display = "none";
    showToast("Erro ao carregar álbuns", "error");
  }
}

function displayAlbums(albums) {
  const albumsGrid = document.getElementById("albumsGrid");

  albumsGrid.innerHTML = albums
    .map(
      (album) => `
        <div class="album-card-list" onclick="window.location.href='/pages/albums/album-view.html?id=${
          album.id
        }'">
            <div class="album-card-header">
                <div class="album-icon-large">
                    <i class="fa-solid fa-book"></i>
                </div>
                <div class="album-card-info">
                    <h3>${album.name}</h3>
                    <p class="album-game-type">
                        <i class="fa-solid ${
                          album.gameType === "pokemon" ? "fa-bolt" : "fa-star"
                        }"></i>
                        ${
                          album.gameType === "pokemon"
                            ? "Pokémon TCG Pocket"
                            : "Personalizado"
                        }
                    </p>
                </div>
                <div class="album-card-actions">
                    <button onclick="event.stopPropagation(); editAlbum('${
                      album.id
                    }')" class="btn-icon" title="Editar">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button onclick="event.stopPropagation(); deleteAlbum('${
                      album.id
                    }', '${
        album.name
      }')" class="btn-icon btn-danger" title="Excluir">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="album-card-stats">
                <div class="stat-item">
                    <i class="fa-solid fa-layer-group"></i>
                    <span>${album._count?.items || 0} itens</span>
                </div>
                <div class="stat-item">
                    <i class="fa-solid fa-clock"></i>
                    <span>${formatDate(album.updatedAt)}</span>
                </div>
            </div>
            ${
              album.description
                ? `<p class="album-description">${album.description}</p>`
                : ""
            }
        </div>
    `
    )
    .join("");

  albumsGrid.style.display = "grid";
}

function filterAlbums() {
  const gameTypeFilter = document.getElementById("gameTypeFilter").value;

  if (gameTypeFilter === "all") {
    filteredAlbums = [...allAlbums];
  } else {
    filteredAlbums = allAlbums.filter(
      (album) => album.gameType === gameTypeFilter
    );
  }

  sortAlbums();
}

function sortAlbums() {
  const sortFilter = document.getElementById("sortFilter").value;

  switch (sortFilter) {
    case "recent":
      filteredAlbums.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
      break;
    case "name":
      filteredAlbums.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "items":
      filteredAlbums.sort(
        (a, b) => (b._count?.items || 0) - (a._count?.items || 0)
      );
      break;
  }

  displayAlbums(filteredAlbums);
}

function editAlbum(albumId) {
  window.location.href = `/pages/albums/edit-album.html?id=${albumId}`;
}

async function deleteAlbum(albumId, albumName) {
  if (
    !confirm(
      `Tem certeza que deseja excluir o álbum "${albumName}"? Esta ação não pode ser desfeita.`
    )
  ) {
    return;
  }

  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`${API_BASE_URL}api/albums/${albumId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      showToast("Álbum excluído com sucesso", "success");
      await loadAlbums();
    } else {
      const error = await response.json();
      showToast(error.error || "Erro ao excluir álbum", "error");
    }
  } catch (error) {
    console.error("Erro ao excluir álbum:", error);
    showToast("Erro ao excluir álbum", "error");
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Hoje";
  } else if (diffDays === 1) {
    return "Ontem";
  } else if (diffDays < 7) {
    return `${diffDays} dias atrás`;
  } else {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }
}

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast-success ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 100);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
