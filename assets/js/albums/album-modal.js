let selectedCard = null;

function openAlbumModal(cardIdOrCard) {
  // Support both old (ID only) and new (full card object) formats
  if (typeof cardIdOrCard === "object") {
    selectedCard = cardIdOrCard;
  } else {
    selectedCard = { id: cardIdOrCard };
  }

  const modal = document.getElementById("albumModal");
  if (!modal) {
    console.error("❌ Album modal not found in DOM");
    return;
  }
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  loadUserAlbums();
}

// Alias for compatibility
function openAddToAlbumModal(card) {
  openAlbumModal(card);
}

function closeAlbumModal() {
  const modal = document.getElementById("albumModal");
  if (modal) modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  selectedCard = null;
}

async function loadUserAlbums() {
  const albumsList = document.getElementById("albumsList");
  const token = localStorage.getItem("token");

  if (!albumsList) return;

  if (!token) {
    albumsList.innerHTML = `
      <div class="albums-loading">
        <p>Please <a href="/pages/userLogin/login.html" style="color: #FF3E6C;">login</a> to manage your albums</p>
      </div>
    `;
    return;
  }

  try {
    const apiUrl = window.apiUrl;
    const response = await fetch(apiUrl("api/albums"), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to load albums");
    }

    const albums = await response.json();

    if (albums.length === 0) {
      albumsList.innerHTML = `
        <div class="albums-loading">
          <p>You don't have any albums yet</p>
        </div>
      `;
      return;
    }

    albumsList.innerHTML = albums
      .map(
        (album) => `
        <div class="album-card" onclick="addCardToAlbum(${album.id})">
          <div class="album-card__icon">📁</div>
          <div class="album-card__name">${album.name}</div>
          <div class="album-card__count">${
            album._count?.items || album.items?.length || 0
          } items</div>
        </div>
      `
      )
      .join("");
  } catch (error) {
    console.error("Error loading albums:", error);
    albumsList.innerHTML = `
      <div class="albums-loading">
        <p>Failed to load albums. Please try again.</p>
      </div>
    `;
  }
}

async function addCardToAlbum(albumId) {
  const token = localStorage.getItem("token");

  if (!token || !selectedCard) {
    console.error("❌ Missing token or selected card");
    return;
  }

  try {
    const apiUrl = window.apiUrl;
    let cardId = selectedCard.id || selectedCard;

    // Ensure cardId is a string (API might expect string)
    if (typeof cardId === "number") {
      cardId = String(cardId);
    }

    console.log("📤 Adding card to album:", { albumId, cardId, selectedCard });

    const requestBody = {
      cardId: cardId,
      quantity: 1,
    };

    console.log("📦 Request body:", requestBody);

    const response = await fetch(apiUrl(`api/albums/${albumId}/items`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log("📥 Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Response error:", errorText);
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { error: errorText };
      }
      throw new Error(
        error.error || error.erro || error.detalhes || "Failed to add card"
      );
    }

    const result = await response.json();
    console.log("✅ Card added successfully:", result);

    closeAlbumModal();
    showNotification("Card added to album successfully!");
  } catch (error) {
    console.error("❌ Error adding card:", error);
    showNotification(
      error.message || "Failed to add card. Please try again.",
      true
    );
  }
}

function goToCreateAlbum() {
  // Save selected card to localStorage so we can add it after album creation
  if (selectedCard) {
    localStorage.setItem("pendingCard", JSON.stringify(selectedCard));
    console.log("💾 Saved pending card:", selectedCard);
  }
  window.location.href = "/pages/albums/select-game.html";
}

function showNotification(message, isError = false) {
  const notification = document.createElement("div");
  notification.className = `notification ${isError ? "error" : "success"}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${isError ? "#ff4444" : "#00cc66"};
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

document.addEventListener("click", (e) => {
  const modal = document.getElementById("albumModal");
  if (!modal) return;
  const backdrop = modal.querySelector(".modal__backdrop");
  if (backdrop && e.target === backdrop) {
    closeAlbumModal();
  }
});
