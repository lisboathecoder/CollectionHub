// pega o ID da carta pela URL
function getCardIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// formata data para o formato brasileiro
function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// formata data e hora para o formato brasileiro
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

// busca os detalhes da carta na API
async function fetchCardDetails(cardId) {
  try {
    const response = await fetch(window.apiUrl(`api/pokemon/cards/id/${cardId}`));
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Erro na resposta:', errorData);
      throw new Error(errorData.mensagem || "Carta não encontrada");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar detalhes da carta:", error);
    throw error;
  }
}

// retorna a cor da raridade com base no código
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

// preenche a pagina com as informações da carta
function displayCardDetails(card) {
  const cardImage = document.getElementById("cardImage");
  // Priorizar imageUrl, depois tentar imageName
  if (card.imageUrl && card.imageUrl.startsWith('http')) {
    cardImage.src = card.imageUrl;
  } else if (card.imageName) {
    cardImage.src = `/assets/images/cards/${card.imageName}`;
  } else {
    cardImage.src = "/assets/images/card-placeholder.png";
  }
  cardImage.alt = card.nameEn || card.slug || "Card";
  
  // Adicionar handler de erro para imagem
  cardImage.onerror = function() {
    this.src = "/assets/images/card-placeholder.png";
  };

  const cardName = document.getElementById("cardName");
  cardName.textContent = card.nameEn || card.slug || "Nome não disponível";

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

  // configura o botao de adicionar ao album - vai direto pro modal de albuns
  const addToAlbumBtn = document.getElementById("addToAlbumBtn");
  addToAlbumBtn.addEventListener("click", () => {
    if (true) {
      localStorage.setItem('pendingCard', JSON.stringify(card));
      window.location.href = '/pages/albums/albums-list.html';
    } else {
      alert("Álbuns não estão disponíveis no momento.");
    }
  });

  // configura o botao de favoritar
  const favoriteBtn = document.getElementById("favoriteBtn");
  checkFavoriteStatus(card.id);
  favoriteBtn.addEventListener("click", () => toggleFavorite(card));

  // configura o botao de compartilhar
  const shareBtn = document.getElementById("shareBtn");
  shareBtn.addEventListener("click", () => shareCard(card));
}

// verifica se a carta ja esta nos favoritos
async function checkFavoriteStatus(cardId) {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const response = await fetch(window.apiUrl(`api/favorites/check/${cardId}`), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      const favoriteBtn = document.getElementById("favoriteBtn");
      const icon = favoriteBtn.querySelector("i");
      
      if (data.isFavorite) {
        icon.classList.remove("fa-regular");
        icon.classList.add("fa-solid");
        favoriteBtn.classList.add("favorited");
      }
    }
  } catch (error) {
    console.error("Erro ao verificar favorito:", error);
  }
}

// adiciona ou remove a carta dos favoritos
async function toggleFavorite(card) {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Você precisa estar logado para favoritar cartas");
      window.location.href = "/pages/userLogin/login.html";
      return;
    }

    const favoriteBtn = document.getElementById("favoriteBtn");
    const icon = favoriteBtn.querySelector("i");
    const isFavorited = icon.classList.contains("fa-solid");

    favoriteBtn.disabled = true;

    if (isFavorited) {
      // Remover dos favoritos
      const response = await fetch(window.apiUrl(`api/favorites/${card.id}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        icon.classList.remove("fa-solid");
        icon.classList.add("fa-regular");
        favoriteBtn.classList.remove("favorited");
        alert("Carta removida dos favoritos!");
      } else {
        throw new Error("Erro ao remover favorito");
      }
    } else {
      // Adicionar aos favoritos
      const response = await fetch(window.apiUrl("api/favorites"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cardId: card.id }),
      });

      if (response.ok) {
        icon.classList.remove("fa-regular");
        icon.classList.add("fa-solid");
        favoriteBtn.classList.add("favorited");
        alert("Carta adicionada aos favoritos!");
      } else {
        throw new Error("Erro ao adicionar favorito");
      }
    }
  } catch (error) {
    console.error("Erro ao favoritar carta:", error);
    alert("Erro ao favoritar carta. Tente novamente.");
  } finally {
    const favoriteBtn = document.getElementById("favoriteBtn");
    favoriteBtn.disabled = false;
  }
}

// compartilha a carta copiando o link
function shareCard(card) {
  const shareUrl = window.location.href;
  
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

// mostra o estado de carregamento
function showLoading() {
  document.getElementById("loadingState").style.display = "flex";
  document.getElementById("errorState").style.display = "none";
  document.getElementById("cardDetailsContent").style.display = "none";
}

// mostra o estado de erro com uma mensagem
function showError(message = "A carta que você está procurando não foi encontrada.") {
  document.getElementById("loadingState").style.display = "none";
  document.getElementById("errorState").style.display = "flex";
  document.getElementById("cardDetailsContent").style.display = "none";
  
  // Atualizar mensagem de erro se houver
  const errorMessage = document.querySelector("#errorState p");
  if (errorMessage) {
    errorMessage.textContent = message;
  }
}

// mostra o conteúdo da carta
function showContent() {
  document.getElementById("loadingState").style.display = "none";
  document.getElementById("errorState").style.display = "none";
  document.getElementById("cardDetailsContent").style.display = "block";
}

// inicializa a pagina carregando os detalhes da carta
async function initCardDetailsPage() {
  const cardId = getCardIdFromUrl();

  if (!cardId) {
    showError("ID da carta não fornecido na URL.");
    return;
  }

  showLoading();

  try {
    const card = await fetchCardDetails(cardId);
    displayCardDetails(card);
    showContent();
  } catch (error) {
    showError(error.message || "Erro ao carregar detalhes da carta.");
  }
}

// carrega os detalhes quando a página estiver pronta
document.addEventListener("DOMContentLoaded", initCardDetailsPage);
