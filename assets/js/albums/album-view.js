window.API_BASE_URL = window.API_BASE_URL || "http://localhost:3000/";
console.log("album-view.js loaded, API_BASE_URL:", API_BASE_URL);

let currentAlbum = null;
let albumCards = [];

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, API_BASE_URL:", window.API_BASE_URL);

  const token = localStorage.getItem("token");
  if (!token) {
    console.log("No token found, redirecting to login");
    window.location.href = "/pages/userLogin/login.html";
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const albumId = urlParams.get("id");

  console.log("Album ID from URL:", albumId);

  if (!albumId) {
    alert("Álbum não encontrado");
    window.history.back();
    return;
  }

  loadAlbum(albumId);

  const searchBtn = document.getElementById("searchCardsBtn");
  const searchInput = document.getElementById("cardSearchInput");
  const editBtn = document.getElementById("editBtn");
  const shareBtn = document.getElementById("shareBtn");
  const deleteBtn = document.getElementById("deleteBtn");

  if (searchBtn) {
    searchBtn.addEventListener("click", searchCards);
  } else {
    console.error("searchCardsBtn not found");
  }

  if (searchInput) {
    searchInput.addEventListener("input", handleSearchInput);
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") searchCards();
    });
  } else {
    console.error("cardSearchInput not found");
  }

  document.addEventListener("click", (e) => {
    const searchResults = document.getElementById("searchResults");
    const searchBox = document.querySelector(".search-box-albums");

    if (searchResults && searchBox && !searchBox.contains(e.target)) {
      searchResults.style.display = "none";
    }
  });

  if (editBtn) {
    editBtn.addEventListener("click", () => editAlbum(albumId));
  } else {
    console.error("editBtn not found");
  }

  if (shareBtn) {
    shareBtn.addEventListener("click", () => shareAlbum(albumId));
  } else {
    console.error("shareBtn not found");
  }

  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => deleteAlbum(albumId));
  } else {
    console.error("deleteBtn not found");
  }

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
    console.log("Loading album:", albumId);
    console.log("API URL:", API_BASE_URL);

    const response = await fetch(`${API_BASE_URL}api/albums/${albumId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error("Erro ao carregar álbum");
    }

    currentAlbum = await response.json();
    console.log("Album loaded:", currentAlbum);

    document.getElementById("albumName").textContent =
      currentAlbum.name || "Álbum sem nome";
    document.getElementById("albumDescription").textContent =
      currentAlbum.description || "Sem descrição";

    const items = currentAlbum.items || currentAlbum._count?.items || [];
    const cardCount = Array.isArray(items)
      ? items.length
      : typeof items === "number"
      ? items
      : 0;

    console.log("Card count:", cardCount);

    document.getElementById("cardCount").textContent = `${cardCount} ${
      cardCount === 1 ? "carta" : "cartas"
    }`;
    document.getElementById("totalCards").textContent = cardCount;

    const createdDate = new Date(currentAlbum.createdAt).toLocaleDateString(
      "pt-BR"
    );
    document.getElementById("createdDate").textContent = createdDate;

    if (
      currentAlbum.items &&
      Array.isArray(currentAlbum.items) &&
      currentAlbum.items.length > 0
    ) {
      albumCards = currentAlbum.items;
      renderCards();
    } else {
      console.log("No items to render");
      renderCards();
    }
  } catch (error) {
    console.error("Error loading album:", error);
    alert("Erro ao carregar álbum: " + error.message);
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

let searchTimeout = null;

async function searchCards() {
  const query = document.getElementById("cardSearchInput").value.trim();
  const searchResults = document.getElementById("searchResults");

  if (query.length < 2) {
    searchResults.style.display = "none";
    return;
  }

  searchResults.style.display = "block";
  searchResults.innerHTML =
    '<div class="search-loading"><i class="fa-solid fa-spinner fa-spin"></i> Buscando...</div>';

  try {
    const response = await fetch(
      `${API_BASE_URL}api/cards/search?q=${encodeURIComponent(query)}`
    );

    if (!response.ok) throw new Error("Erro ao buscar cartas");

    const cards = await response.json();

    if (cards.length === 0) {
      searchResults.innerHTML = `
        <div class="search-no-results">
          <i class="fa-solid fa-magnifying-glass"></i>
          <p>Nenhuma carta encontrada</p>
        </div>
      `;
      return;
    }

    searchResults.innerHTML = cards
      .slice(0, 10)
      .map(
        (card) => `
        <div class="search-result-item" data-card='${JSON.stringify(
          card
        ).replace(/'/g, "&#39;")}'>
          <img src="${card.imageUrl}" alt="${
          card.nameEn
        }" class="search-result-image" onerror="this.src='/assets/images/placeholder-card.png'">
          <div class="search-result-info">
            <div class="search-result-name">${card.nameEn}</div>
            <div class="search-result-details">
              <span><i class="fa-solid fa-layer-group"></i> ${
                card.set?.nameEn || "N/A"
              }</span>
              <span><i class="fa-solid fa-hashtag"></i>${card.number}</span>
            </div>
          </div>
          <i class="fa-solid fa-plus search-result-add"></i>
        </div>
      `
      )
      .join("");

    document.querySelectorAll(".search-result-item").forEach((item) => {
      item.addEventListener("click", function () {
        const cardData = JSON.parse(this.dataset.card);
        addCardToAlbum(cardData);
      });
    });
  } catch (error) {
    console.error("Error searching cards:", error);
    searchResults.innerHTML = `
      <div class="search-no-results">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <p>Erro ao buscar cartas</p>
      </div>
    `;
  }
}

function handleSearchInput() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(searchCards, 300);
}

async function addCardToAlbum(card) {
  const token = localStorage.getItem("token");
  const searchResults = document.getElementById("searchResults");

  try {
    const response = await fetch(
      `${API_BASE_URL}api/albums/${currentAlbum.id}/cards`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cardId: card.id,
          quantity: 1,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erro ao adicionar carta");
    }

    const newItem = await response.json();

    albumCards.push({
      id: newItem.id,
      card: card,
      customName: null,
    });

    const cardCount = albumCards.length;
    document.getElementById("cardCount").textContent = `${cardCount} ${
      cardCount === 1 ? "carta" : "cartas"
    }`;
    document.getElementById("totalCards").textContent = cardCount;

    renderCards();

    searchResults.style.display = "none";
    document.getElementById("cardSearchInput").value = "";

    showToast("Carta adicionada com sucesso!", "success");
  } catch (error) {
    console.error("Error adding card:", error);
    showToast(error.message || "Erro ao adicionar carta", "error");
  }
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
