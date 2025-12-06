const API_BASE_URL = window.API_BASE_URL || "http://localhost:3000/";
const urlParams = new URLSearchParams(window.location.search);
const albumId = urlParams.get("id");
let album = null;

const API_BASE = (window.API_BASE_URL || "http://localhost:3000").replace(
  /\/+$/g,
  ""
);

document.addEventListener("DOMContentLoaded", async () => {
  await checkAuth();
  if (albumId) {
    await loadAlbumDetails();
    setupEventListeners();
  } else {
    showToast("⚠️ ID do álbum não encontrado na URL. Redirecionando...", "error", 6000);
    setTimeout(() => {
      window.location.href = "/pages/albums/albums-list.html";
    }, 2000);
  }
});

async function checkAuth() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/pages/userLogin/login.html";
    return;
  }
}

async function loadAlbumDetails() {
  const token = localStorage.getItem("token");
  const loading = document.getElementById("loading");
  const albumContent = document.getElementById("albumContent");

  try {
    const response = await fetch(`${API_BASE}/api/albums/${albumId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 404) {
        throw new Error("Álbum não encontrado. Ele pode ter sido deletado ou você não tem permissão para acessá-lo.");
      } else if (response.status === 401) {
        throw new Error("Sessão expirada. Faça login novamente.");
      } else if (response.status === 403) {
        throw new Error("Você não tem permissão para acessar este álbum.");
      } else {
        throw new Error(errorData.error || errorData.message || `Erro ao carregar álbum (${response.status})`);
      }
    }

    album = await response.json();

    document.title = `${album.name} - Collection Hub`;

    document.getElementById("albumName").textContent = album.name;

    const gameTypeElement = document.getElementById("albumGameType");
    gameTypeElement.innerHTML =
      album.gameType === "pokemon"
        ? '<i class="fa-solid fa-bolt"></i> Pokémon TCG Pocket'
        : '<i class="fa-solid fa-star"></i> Personalizado';

    if (album.description) {
      document.getElementById("albumDescription").textContent =
        album.description;
    } else {
      document.getElementById("albumDescription").style.display = "none";
    }

    document.getElementById("albumItemCount").textContent = `${
      album.items?.length || 0
    } ${album.items?.length === 1 ? "item" : "itens"}`;
    document.getElementById("albumDate").textContent = `Criado em ${formatDate(
      album.createdAt
    )}`;

    displayItems(album.items || []);

    loading.style.display = "none";
    albumContent.style.display = "block";
  } catch (error) {
    console.error("Erro ao carregar álbum:", error);
    const errorMsg = error.message || "Erro desconhecido ao carregar álbum";
    alert(`Erro: ${errorMsg}`);
    window.location.href = "/pages/albums/albums-list.html";
  }
}

function displayItems(items) {
  const itemsGrid = document.getElementById("itemsGrid");
  const emptyItems = document.getElementById("emptyItems");

  if (items.length === 0) {
    itemsGrid.style.display = "none";
    emptyItems.style.display = "flex";
  } else {
    itemsGrid.innerHTML = items
      .map(
        (item) => `
            <div class="album-item-card">
                <div class="item-image-wrapper">
                    <img src="${
                      item.cardData?.imageUrl ||
                      "/assets/images/placeholder-card.png"
                    }" 
                         alt="${item.cardData?.nameEn || "Card"}"
                         onerror="this.src='/assets/images/placeholder-card.png'">
                </div>
                <div class="item-info">
                    <h4>${
                      item.cardData?.nameEn || item.customName || "Card"
                    }</h4>
                    ${
                      item.cardData?.rarity
                        ? `<p class="item-rarity">${item.cardData.rarity.name}</p>`
                        : ""
                    }
                    ${
                      item.quantity > 1
                        ? `<p class="item-quantity">Quantidade: ${item.quantity}</p>`
                        : ""
                    }
                </div>
                <button onclick="removeItem('${item.id}', '${
          item.cardData?.nameEn || item.customName
        }')" 
                        class="btn-remove-item" title="Remover carta">
                    <i class="fa-solid fa-times"></i>
                </button>
            </div>
        `
      )
      .join("");
    itemsGrid.style.display = "grid";
    emptyItems.style.display = "none";
  }
}

function setupEventListeners() {
  document.getElementById("editAlbumBtn").addEventListener("click", editAlbum);
  document
    .getElementById("deleteAlbumBtn")
    .addEventListener("click", deleteAlbum);
}

function editAlbum() {
  const newName = prompt("Novo nome do álbum:", album.name);
  if (newName && newName !== album.name) {
    updateAlbum({ name: newName });
  }
}

async function updateAlbum(updates) {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`${API_BASE}/api/albums/${albumId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    if (response.ok) {
      showToast("✅ Álbum atualizado com sucesso!", "success", 5000);
      await loadAlbumDetails();
    } else {
      const error = await response.json();
      showToast(error.error || "Erro ao atualizar álbum. Tente novamente.", "error", 6000);
    }
  } catch (error) {
    console.error("Erro ao atualizar álbum:", error);
    showToast("Erro ao atualizar álbum. Tente novamente.", "error", 6000);
  }
}

async function deleteAlbum() {
  if (
    !confirm(
      `Tem certeza que deseja excluir o álbum "${album.name}"? Esta ação não pode ser desfeita.`
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

    if (response.ok) {
      showToast("✅ Álbum excluído com sucesso! Redirecionando...", "success", 5000);
      setTimeout(() => {
        window.location.href = "/pages/app/albums-list.html";
      }, 1500);
    } else {
      const error = await response.json();
      showToast(error.error || "Erro ao excluir álbum", "error", 6000);
    }
  } catch (error) {
    console.error("Erro ao excluir álbum:", error);
    showToast("Erro ao excluir álbum. Tente novamente.", "error", 6000);
  }
}

async function removeItem(itemId, itemName) {
  if (!confirm(`Remover "${itemName}" do álbum?`)) {
    return;
  }

  const token = localStorage.getItem("token");

  try {
    const response = await fetch(
  `${API_BASE}/api/albums/${albumId}/cards/${itemId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      showToast("✅ Carta removida do álbum", "success", 5000);
      await loadAlbumDetails();
    } else {
      const error = await response.json();
      showToast(error.error || "Erro ao remover carta", "error", 6000);
    }
  } catch (error) {
    console.error("Erro ao remover carta:", error);
    showToast("Erro ao remover carta. Tente novamente.", "error", 6000);
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// showToast agora é fornecido globalmente por /assets/js/toast.js
