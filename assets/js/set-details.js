const SET_INFO = {
  "A1": {
    name: "Genetic Apex",
    logo: "https://i.ibb.co/JFH2gxzL/LOGO-expansion-A1-en-US.webp",
  },
  "A1A": {
    name: "Mythical Island",
    logo: "https://i.ibb.co/Mx4LF0Bj/LOGO-expansion-A1-A-en-US.webp",
  },
  "A2": {
    name: "Space-Time Smackdown",
    logo: "https://i.ibb.co/7tsrnh7F/LOGO-expansion-A2-en-US.webp",
  },
  "A2A": {
    name: "Triumphant Light",
    logo: "https://i.ibb.co/HDJKYY9B/LOGO-expansion-A2-A-en-US.webp",
  },
  "A2B": {
    name: "Shining Revelry",
    logo: "https://i.ibb.co/8DpYB66d/LOGO-expansion-A2-B-en-US.webp",
  },
  "A3": {
    name: "Celestial Guardians",
    logo: "https://i.ibb.co/Ng9Z8NtS/LOGO-expansion-A3-en-US.webp",
  },
  "A3A": {
    name: "Extradimensional Crisis",
    logo: "https://i.ibb.co/WNfxg3W4/LOGO-expansion-A3-A-en-US.webp",
  },
  "A3B": {
    name: "Eevee Grove",
    logo: "https://i.ibb.co/F4cbCqbN/LOGO-expansion-A3-B-en-US.webp",
  },
  "A4": {
    name: "Wisdom of Sea and Sky",
    logo: "https://i.ibb.co/9mNDC3Ct/LOGO-expansion-A4-en-US.webp",
  },
  "A4A": {
    name: "Secluded Springs",
    logo: "https://i.ibb.co/wDXnz9K/LOGO-expansion-A4-A-en-US.webp",
  },
  "A4B": {
    name: "Deluxe Pack: ex",
    logo: "https://i.ibb.co/Pv18yXWk/LOGO-expansion-A4-B-en-US.webp",
  },
  "B1": {
    name: "Mega Rising",
    logo: "https://i.ibb.co/1cBjRxD/LOGO-expansion-B1-en-US.webp",
  },
  "PROMO-A": {
    name: "Promos-A",
    logo: "https://i.ibb.co/Xx8FWqrk/LOGO-expansion-PROMO-A-en-US.webp",
  },
  "PROMO-B": {
    name: "Promos-B",
    logo: "https://i.ibb.co/sd9sWXZN/LOGO-expansion-PROMO-B-en-US.webp",
  },
};

let allCards = [];
let filteredCards = [];
let currentPage = 1;
const cardsPerPage = 48;

// Pega o código do set da URL
const urlParams = new URLSearchParams(window.location.search);
const setCode = urlParams.get("set");

// Elementos DOM
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const setHeaderEl = document.getElementById("set-header");
const filtersEl = document.getElementById("filters");
const cardsGridEl = document.getElementById("cards-grid");
const setNameEl = document.getElementById("set-name");
const setInfoEl = document.getElementById("set-info");
const rarityFilterEl = document.getElementById("rarity-filter");
const sortFilterEl = document.getElementById("sort-filter");
const searchInputEl = document.getElementById("search-input");

// Carrega as cartas do set
async function loadCards() {
  console.log("🚀 Iniciando carregamento de cards...");
  console.log("📋 Set code:", setCode);

  if (!setCode) {
    showError("No set specified");
    return;
  }

  try {
    loadingEl.style.display = "flex";
    errorEl.style.display = "none";

    const apiUrl = window.API_BASE_URL || 'http://localhost:3000' || 'https://collectionhub-production.up.railway.app';
    console.log('🔍 Buscando cartas do set:', setCode);
    console.log('🌐 API URL:', `${apiUrl}api/pokemon/cards?set=${setCode}`);
    
    const response = await fetch(
      `${apiUrl}api/pokemon/cards?set=${setCode}&orderBy=number&pageSize=500`
    );

    console.log('📡 Status da resposta:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na resposta:', errorText);
      throw new Error("Failed to fetch cards");
    }

    const data = await response.json();
    allCards = data;
    filteredCards = [...allCards];

    console.log("✅ Cards carregados:", allCards.length);

    if (allCards.length === 0) {
      showError("No cards found for this set");
      return;
    }

    // Popula filtros
    populateRarityFilter();

    // Atualiza header com logo
    const setInfo = SET_INFO[setCode] || { name: setCode, logo: null };
    setNameEl.innerHTML = setInfo.logo
      ? `<img src="${setInfo.logo}" alt="${setInfo.name}" style="max-width: 300px; height: auto; margin-bottom: 20px;">`
      : setInfo.name;
    setInfoEl.textContent = `${allCards.length} cards`;
    document.getElementById(
      "page-title"
    ).textContent = `${setInfo.name} - Collection Hub`;

    // Mostra conteúdo
    loadingEl.style.display = "none";
    setHeaderEl.style.display = "block";
    filtersEl.style.display = "flex";
    cardsGridEl.style.display = "grid";

    renderCards();
    console.log("🎨 Cards renderizados na tela");
  } catch (error) {
    console.error("Error loading cards:", error);
    showError("Failed to load cards. Please try again.");
  }
}

function showError(message) {
  loadingEl.style.display = "none";
  errorEl.style.display = "flex";
  errorEl.querySelector("p").textContent = message;
}

function populateRarityFilter() {
  const rarities = [
    ...new Set(allCards.map((card) => card.rarity?.name).filter(Boolean)),
  ];

  rarities.forEach((rarity) => {
    const option = document.createElement("option");
    option.value = rarity;
    option.textContent = rarity;
    rarityFilterEl.appendChild(option);
  });
}

function renderCards() {
  console.log("🎯 Renderizando", filteredCards.length, "cards...");
  cardsGridEl.innerHTML = "";

  if (filteredCards.length === 0) {
    cardsGridEl.innerHTML = '<p class="no-results">No cards found</p>';
    return;
  }

  // Calcular paginação
  const totalPages = Math.ceil(filteredCards.length / cardsPerPage);
  const startIndex = (currentPage - 1) * cardsPerPage;
  const endIndex = startIndex + cardsPerPage;
  const cardsToShow = filteredCards.slice(startIndex, endIndex);

  console.log("📄 Mostrando cards", startIndex, "a", endIndex);

  // Renderizar cards da página atual
  cardsToShow.forEach((card) => {
    const cardEl = document.createElement("div");
    cardEl.className = "card-item";

    const imageUrl = card.imageUrl || "/assets/images/placeholder-card.png";
    const cardName = card.nameEn || "Unknown";
    const rarityName = card.rarity?.name || "Unknown";

    cardEl.innerHTML = `
      <div class="card-image-container">
        <img src="${imageUrl}" alt="${cardName}" class="card-image" loading="lazy" onerror="this.src='/assets/images/placeholder-card.png'">
      </div>
      <div class="card-info">
        <h3 class="card-name">${cardName}</h3>
        <p class="card-number">#${card.number}</p>
        <span class="card-rarity rarity-${rarityName
          .toLowerCase()
          .replace(/\s+/g, "-")}">${rarityName}</span>
      </div>
    `;

    cardEl.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("🖱️ Carta clicada:", card.nameEn);
      openCardModal(card);
    });

    cardsGridEl.appendChild(cardEl);
  });

  // Renderizar paginação
  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  let paginationEl = document.getElementById("pagination");

  if (!paginationEl) {
    paginationEl = document.createElement("div");
    paginationEl.id = "pagination";
    paginationEl.className = "pagination";
    cardsGridEl.parentNode.appendChild(paginationEl);
  }

  if (totalPages <= 1) {
    paginationEl.style.display = "none";
    return;
  }

  paginationEl.style.display = "flex";
  paginationEl.innerHTML = `
    <button class="pagination-btn" id="prev-page" ${
      currentPage === 1 ? "disabled" : ""
    }>
      ← Previous
    </button>
    <span class="pagination-info">Page ${currentPage} of ${totalPages}</span>
    <button class="pagination-btn" id="next-page" ${
      currentPage === totalPages ? "disabled" : ""
    }>
      Next →
    </button>
  `;

  // Event listeners para paginação
  document.getElementById("prev-page")?.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderCards();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  document.getElementById("next-page")?.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderCards();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
}

function applyFilters() {
  const selectedRarity = rarityFilterEl.value;
  const searchTerm = searchInputEl.value.toLowerCase();

  filteredCards = allCards.filter((card) => {
    const matchesRarity =
      !selectedRarity || card.rarity?.name === selectedRarity;
    const matchesSearch =
      !searchTerm ||
      card.nameEn?.toLowerCase().includes(searchTerm) ||
      card.number.toString().includes(searchTerm);

    return matchesRarity && matchesSearch;
  });

  currentPage = 1; // Reset para primeira página ao filtrar
  applySorting();
  renderCards();
}

function applySorting() {
  const sortBy = sortFilterEl.value;

  filteredCards.sort((a, b) => {
    switch (sortBy) {
      case "number":
        return a.number - b.number;
      case "name":
        return (a.nameEn || "").localeCompare(b.nameEn || "");
      case "rarity":
      default:
        // Mantém a ordem de raridade da API
        return 0;
    }
  });
}

function openCardModal(card) {
  console.log("🔵 Abrindo modal para carta:", card);

  const imageUrl = card.imageUrl || "/assets/images/placeholder-card.png";
  const cardName = card.nameEn || "Unknown";

  const modal = document.createElement("div");
  modal.className = "card-detail-modal";
  modal.setAttribute("aria-hidden", "false");

  modal.innerHTML = `
    <div class="card-detail-modal__backdrop"></div>
    <div class="card-detail-modal__content">
      <button class="card-detail-modal__close">✕</button>
      <div class="card-detail-modal__image-wrapper">
        <img src="${imageUrl}" alt="${cardName}" class="card-detail-modal__image">
      </div>
      <button class="card-detail-modal__add-btn" onclick="event.stopPropagation(); openAddToAlbumModalWithCard(${JSON.stringify(card).replace(/"/g, '&quot;')})">
        <i class="fa-solid fa-plus"></i> Add to Album
      </button>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.classList.add("modal-open");

  console.log("✅ Modal adicionado ao DOM");

  const closeBtn = modal.querySelector(".card-detail-modal__close");
  const backdrop = modal.querySelector(".card-detail-modal__backdrop");

  const closeModal = () => {
    console.log("🔴 Fechando modal");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    setTimeout(() => modal.remove(), 200);
  };

  closeBtn.addEventListener("click", closeModal);
  backdrop.addEventListener("click", closeModal);
}

// Helper function to open Add to Album modal
function openAddToAlbumModalWithCard(card) {
  if (typeof openAddToAlbumModal === 'function') {
    openAddToAlbumModal(card);
  } else {
    console.error('openAddToAlbumModal function not found');
  }
}

// Event Listeners
rarityFilterEl.addEventListener("change", applyFilters);
sortFilterEl.addEventListener("change", () => {
  applySorting();
  renderCards();
});
searchInputEl.addEventListener("input", applyFilters);

// Inicializa
loadCards();
