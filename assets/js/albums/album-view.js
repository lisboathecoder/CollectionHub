const API_BASE_URL = window.API_BASE_URL || "http://localhost:3000/";
let currentAlbum = null;
let albumCards = [];

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/pages/userLogin/login.html";
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const albumId = urlParams.get("id");

  if (!albumId) {
    alert("Álbum não encontrado");
    window.history.back();
    return;
  }

  loadAlbum(albumId);

  document
    .getElementById("searchCardsBtn")
    .addEventListener("click", searchCards);
  document
    .getElementById("cardSearchInput")
    .addEventListener("keypress", (e) => {
      if (e.key === "Enter") searchCards();
    });

  document
    .getElementById("editBtn")
    .addEventListener("click", () => editAlbum(albumId));
  document
    .getElementById("shareBtn")
    .addEventListener("click", () => shareAlbum(albumId));
  document
    .getElementById("deleteBtn")
    .addEventListener("click", () => deleteAlbum(albumId));

  document.querySelectorAll(".view-toggle button").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".view-toggle button")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
});

async function loadAlbum(albumId) {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`${API_BASE_URL}api/albums/${albumId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao carregar álbum");
    }

    currentAlbum = await response.json();

    document.getElementById("albumName").textContent = currentAlbum.name;
    document.getElementById("albumDescription").textContent =
      currentAlbum.description || "Sem descrição";

    const cardCount = currentAlbum.items?.length || 0;
    document.getElementById("cardCount").textContent = `${cardCount} ${
      cardCount === 1 ? "carta" : "cartas"
    }`;
    document.getElementById("totalCards").textContent = cardCount;

    const createdDate = new Date(currentAlbum.createdAt).toLocaleDateString(
      "pt-BR"
    );
    document.getElementById("createdDate").textContent = createdDate;

    if (currentAlbum.items && currentAlbum.items.length > 0) {
      albumCards = currentAlbum.items;
      renderCards();
    }
  } catch (error) {
    console.error("Error loading album:", error);
    alert("Erro ao carregar álbum");
    window.history.back();
  }
}

function renderCards() {
  const grid = document.getElementById("cardsGrid");

  if (albumCards.length === 0) {
    grid.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-cards-blank"></i>
                <h3>Nenhuma carta adicionada</h3>
                <p>Use a pesquisa acima para adicionar cartas ao seu álbum</p>
            </div>
        `;
    return;
  }

  grid.innerHTML = albumCards
    .map((item) => {
      const card = item.card || {};
      const imageUrl = card.imageUrl || "/assets/images/placeholder-card.png";
      const name = item.customName || card.nameEn || "Unknown";
      const number = card.number || "-";

      return `
            <div class="card-item" data-item-id="${item.id}">
                <button class="remove-card-btn" onclick="removeCard(${item.id})">
                    <i class="fa-solid fa-times"></i>
                </button>
                <img src="${imageUrl}" alt="${name}" onerror="this.src='/assets/images/placeholder-card.png'">
                <div class="card-item-name">${name}</div>
                <div class="card-item-number">#${number}</div>
            </div>
        `;
    })
    .join("");
}

async function searchCards() {
  const query = document.getElementById("cardSearchInput").value.trim();

  if (!query) {
    alert("Digite algo para pesquisar");
    return;
  }

  window.location.href = `/pages/explore/searchResults.html?q=${encodeURIComponent(
    query
  )}&album=${currentAlbum.id}`;
}

async function removeCard(itemId) {
  if (!confirm("Deseja remover esta carta do álbum?")) {
    return;
  }

  const token = localStorage.getItem("token");

  try {
    const response = await fetch(
      `${API_BASE_URL}api/albums/${currentAlbum.id}/items/${itemId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Erro ao remover carta");
    }

    albumCards = albumCards.filter((item) => item.id !== itemId);

    document.getElementById("cardCount").textContent = `${albumCards.length} ${
      albumCards.length === 1 ? "carta" : "cartas"
    }`;
    document.getElementById("totalCards").textContent = albumCards.length;

    renderCards();

    showToast("Carta removida com sucesso", "success");
  } catch (error) {
    console.error("Error removing card:", error);
    showToast("Erro ao remover carta", "error");
  }
}

function editAlbum(albumId) {
  alert("Funcionalidade de edição em desenvolvimento");
}

function shareAlbum(albumId) {
  const url = window.location.href;
  navigator.clipboard
    .writeText(url)
    .then(() => {
      showToast("Link copiado para a área de transferência!", "success");
    })
    .catch(() => {
      showToast("Erro ao copiar link", "error");
    });
}

async function deleteAlbum(albumId) {
  if (
    !confirm(
      "Tem certeza que deseja deletar este álbum? Esta ação não pode ser desfeita."
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

    if (!response.ok) {
      throw new Error("Erro ao deletar álbum");
    }

    showToast("Álbum deletado com sucesso", "success");

    setTimeout(() => {
      window.location.href = "/pages/app/collection.html";
    }, 1500);
  } catch (error) {
    console.error("Error deleting album:", error);
    showToast("Erro ao deletar álbum", "error");
  }
}

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = "toast toast-" + type;
  toast.textContent = message;
  toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: ${
          type === "success"
            ? "#4caf50"
            : type === "error"
            ? "#f44336"
            : "#2196f3"
        };
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}

const style = document.createElement("style");
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

window.removeCard = removeCard;
