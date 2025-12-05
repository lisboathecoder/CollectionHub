function getCardIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateTime(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function fetchCardDetails(cardId) {
  const apiBase = (window.API_BASE_URL || "http://localhost:3000").replace(
    /\/+$/g,
    ""
  );

  try {
    const response = await fetch(`${apiBase}/api/pokemon/cards/id/${cardId}`);

    if (!response.ok) {
      throw new Error("Carta não encontrada");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar detalhes da carta:", error);
    throw error;
  }
}

function getRarityColor(rarityCode) {
  const rarityColors = {
    common: "#6b7280",
    uncommon: "#10b981",
    rare: "#3b82f6",
    "rare holo": "#8b5cf6",
    "ultra rare": "#f59e0b",
    "secret rare": "#ef4444",
  };

  return rarityColors[rarityCode?.toLowerCase()] || "#6b7280";
}

function renderCardDetails(card) {
  const breadcrumbSet = document.getElementById("breadcrumbSet");
  if (breadcrumbSet && card.set) {
    breadcrumbSet.textContent = card.set.nameEn;
  }

  const cardImage = document.getElementById("cardImage");
  cardImage.src = card.imageUrl || "/assets/images/card-placeholder.png";
  cardImage.alt = card.nameEn || "Card";

  const cardName = document.getElementById("cardName");
  cardName.textContent = card.nameEn || "Nome não disponível";

  const cardRarity = document.getElementById("cardRarity");
  if (card.rarity) {
    cardRarity.textContent = card.rarity.name;
    cardRarity.style.backgroundColor = getRarityColor(card.rarity.code);
  } else {
    cardRarity.textContent = "N/A";
  }

  // Meta informações
  document.getElementById("cardNumber").textContent = `#${card.number || "000"}`;
  document.getElementById("cardSet").textContent = card.set?.nameEn || "N/A";
  document.getElementById("cardSetCode").textContent = card.setCode || "N/A";
  document.getElementById("cardReleaseDate").textContent = formatDate(
    card.set?.releaseDate
  );
  document.getElementById("cardRarityName").textContent =
    card.rarity?.name || "N/A";
  document.getElementById("cardId").textContent = card.id;

  // Informações adicionais
  document.getElementById("cardSlug").textContent = card.slug || "-";
  document.getElementById("cardImageName").textContent = card.imageName || "-";
  document.getElementById("cardCreatedAt").textContent = formatDateTime(
    card.createdAt
  );
  document.getElementById("cardUpdatedAt").textContent = formatDateTime(
    card.updatedAt
  );

  // Informações do set
  document.getElementById("setCardCount").textContent =
    card.set?.count || "0";

  // Configurar botão de adicionar ao álbum
  const addToAlbumBtn = document.getElementById("addToAlbumBtn");
  addToAlbumBtn.addEventListener("click", () => {
    if (typeof openAddToAlbumModal !== "undefined") {
      openAddToAlbumModal(card);
    } else {
      alert("Função de adicionar ao álbum não está disponível.");
    }
  });

  // Configurar botão de compartilhar
  const shareBtn = document.getElementById("shareBtn");
  shareBtn.addEventListener("click", () => shareCard(card));
}

// Função para compartilhar carta
function shareCard(card) {
  const shareUrl = window.location.href;
  const shareText = `Confira esta carta: ${card.nameEn} - ${card.set?.nameEn || ""}`;

  if (navigator.share) {
    navigator
      .share({
        title: card.nameEn,
        text: shareText,
        url: shareUrl,
      })
      .catch((error) => console.log("Erro ao compartilhar:", error));
  } else {
    // Fallback: copiar para clipboard
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        alert("Link copiado para a área de transferência!");
      })
      .catch((error) => {
        console.error("Erro ao copiar link:", error);
        alert("Não foi possível copiar o link.");
      });
  }
}

// Mostrar estado de loading
function showLoading() {
  document.getElementById("loadingState").style.display = "flex";
  document.getElementById("errorState").style.display = "none";
  document.getElementById("cardDetailsContent").style.display = "none";
}

// Mostrar estado de erro
function showError() {
  document.getElementById("loadingState").style.display = "none";
  document.getElementById("errorState").style.display = "flex";
  document.getElementById("cardDetailsContent").style.display = "none";
}

// Mostrar conteúdo da carta
function showContent() {
  document.getElementById("loadingState").style.display = "none";
  document.getElementById("errorState").style.display = "none";
  document.getElementById("cardDetailsContent").style.display = "block";
}

// Inicializar página
async function initCardDetailsPage() {
  const cardId = getCardIdFromUrl();

  if (!cardId) {
    showError();
    return;
  }

  showLoading();

  try {
    const card = await fetchCardDetails(cardId);
    renderCardDetails(card);
    showContent();
  } catch (error) {
    showError();
  }
}

// Carregar detalhes quando a página estiver pronta
document.addEventListener("DOMContentLoaded", initCardDetailsPage);
