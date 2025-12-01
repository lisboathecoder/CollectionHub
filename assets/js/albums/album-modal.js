let selectedCardId = null;

function openAlbumModal(cardId) {
  selectedCardId = cardId;
  const modal = document.getElementById("albumModal");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  loadUserAlbums();
}

function closeAlbumModal() {
  const modal = document.getElementById("albumModal");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  selectedCardId = null;
}

async function loadUserAlbums() {
  const albumsList = document.getElementById("albumsList");
  const token = localStorage.getItem("token");

  if (!token) {
    albumsList.innerHTML = `
      <div class="albums-loading">
        <p>Please <a href="/pages/userLogin/login.html" style="color: #FF3E6C;">login</a> to manage your albums</p>
      </div>
    `;
    return;
  }

  try {
    const apiUrl = window.API_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${apiUrl}api/albums`, {
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
          <div class="album-card__count">${album.cardCount || 0} cards</div>
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

  if (!token || !selectedCardId) {
    return;
  }

  try {
    const response = await fetch(`/api/albums/${albumId}/cards`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ cardId: selectedCardId }),
    });

    if (!response.ok) {
      throw new Error("Failed to add card");
    }

    closeAlbumModal();
    showNotification("Card added to album successfully!");
  } catch (error) {
    console.error("Error adding card:", error);
    showNotification("Failed to add card. Please try again.", true);
  }
}

function goToCreateAlbum() {
  window.location.href = "/albums/index.html";
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
  if (e.target === modal.querySelector(".modal__backdrop")) {
    closeAlbumModal();
  }
});
