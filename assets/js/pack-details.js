// Mapeamento de códigos de set para nomes e logos
const SET_INFO = {
  A1: {
    name: "Genetic Apex",
    logo: "/assets/images/logo-boosters/Genetic-Apex-Logo.webp",
  },
  A1A: {
    name: "Mythical Island",
    logo: "/assets/images/logo-boosters/Mythical-island-logo.webp",
  },
  A2: {
    name: "Space-Time Smackdown",
    logo: "/assets/images/logo-boosters/Space-Time-Smackdown_Logo.webp",
  },
  A2A: {
    name: "Triumphant Light",
    logo: "/assets/images/logo-boosters/Triumphant-Ligth_Logo.webp",
  },
  A2B: {
    name: "Shining Revelry",
    logo: "/assets/images/logo-boosters/Shining-Revelry_Logo.webp",
  },
  A3: {
    name: "Celestial Guardians",
    logo: "/assets/images/logo-boosters/Celestial-Guardians_Logo.webp",
  },
  A3A: {
    name: "Extradimensional Crisis",
    logo: "/assets/images/logo-boosters/Extradimensional-Crisis_Logo.webp",
  },
  A3B: {
    name: "Eevee Grove",
    logo: "/assets/images/logo-boosters/Eevee-Grove_Logo.webp",
  },
  A4: {
    name: "Wisdom of Sea and Sky",
    logo: "/assets/images/logo-boosters/Wisdom-Of-Sea-And-Sky_Logo.webp",
  },
  A4A: {
    name: "Secluded Springs",
    logo: "/assets/images/logo-boosters/Secluded-Springs_Logo.webp",
  },
  A4B: {
    name: "Deluxe Pack: ex",
    logo: "/assets/images/logo-boosters/Deluxe-Pack-Ex_Logo.webp",
  },
  B1: {
    name: "Mega Rising",
    logo: "/assets/images/logo-boosters/Mega-Rising_Logo.webp",
  },
  "PROMO-A": {
    name: "Promo A",
    logo: "/assets/images/Collection logo branca.png",
  },
  "PROMO-B": {
    name: "Promo B",
    logo: "/assets/images/Collection logo branca.png",
  },
};

// Mapeamento de imagens dos packs
const PACK_IMAGES = {
  Charizard: "/assets/images/packs/Genetic Apex - Charizard.jpg",
  Mewtwo: "/assets/images/packs/Genetic Apex - Mewtwo.jpg",
  Pikachu: "/assets/images/packs/Genetic Apex - Pikachu.jpg",
  Mew: "/assets/images/packs/Mythical Island.jpg",
  Dialga: "/assets/images/packs/Space-Time Smackdown - Dialga.jpg",
  Palkia: "/assets/images/packs/Space-Time Smackdown - Palkia.jpg",
  Arceus: "/assets/images/packs/Triumphant Light.png",
  "Shining Revelry": "/assets/images/packs/Shining Revelry.jpg",
  Lunala: "/assets/images/packs/Celestial Guardians - Lunala.jpg",
  Solgaleo: "/assets/images/packs/Celestial Guardians - Solgaleo.jpg",
  "Extradimensional Crisis": "/assets/images/packs/Extradimensional Crisis.jpg",
  "Eevee Grove": "/assets/images/packs/Eevee Grove.jpg",
  "Ho-Oh": "/assets/images/packs/Wisdom of Sea and Sky - Ho-Oh.jpg",
  Lugia: "/assets/images/packs/Wisdom of Sea and Sky - Lugia.jpg",
  "Secluded Springs": "/assets/images/packs/Secluded Springs.jpg",
  "Deluxe Pack": "/assets/images/packs/Deluxe Pack.jpg",
  "Mega Blaziken": "/assets/images/packs/Mega Rising - Mega Blaziken.jpg",
  "Mega Altaria": "/assets/images/packs/Mega Rising - Mega Altaria.jpg",
  "Mega Gyarados": "/assets/images/packs/Mega Rising - Mega Gyarados.jpg",
};

let allCards = [];
let filteredCards = [];
let currentPage = 1;
const cardsPerPage = 48;

// Pega o código do set e nome do pack da URL
const urlParams = new URLSearchParams(window.location.search);
const setCode = urlParams.get("set");
const packName = urlParams.get("pack");

// Elementos DOM
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const packHeaderEl = document.getElementById("pack-header");
const filtersEl = document.getElementById("filters");
const cardsGridEl = document.getElementById("cards-grid");
const packNameEl = document.getElementById("pack-name");
const packInfoEl = document.getElementById("pack-info");
const rarityFilterEl = document.getElementById("rarity-filter");
const sortFilterEl = document.getElementById("sort-filter");
const searchInputEl = document.getElementById("search-input");

// Carrega as cartas do pack
async function loadCards() {
  if (!setCode || !packName) {
    showError("No set or pack specified");
    return;
  }

  try {
    loadingEl.style.display = "flex";
    errorEl.style.display = "none";

    // Busca as cartas do set inteiro e filtra pelo pack
    const response = await fetch(
      `/api/pokemon/cards?set=${setCode}&orderBy=rarity&pageSize=500`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch cards");
    }

    const data = await response.json();

    // Filtra apenas as cartas do pack específico
    const decodedPackName = decodeURIComponent(packName);
    allCards = data.filter(
      (card) =>
        card.packs && card.packs.some((pack) => pack.name === decodedPackName)
    );
    filteredCards = [...allCards];

    if (allCards.length === 0) {
      showError(`No cards found for ${decodedPackName} pack`);
      return;
    }

    // Popula filtros
    populateRarityFilter();

    // Atualiza header com logo do set e imagem do pack
    const setInfo = SET_INFO[setCode] || { name: setCode, logo: null };
    const packImage = PACK_IMAGES[decodedPackName];

    packNameEl.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; gap: 30px; flex-wrap: wrap;">
        ${
          setInfo.logo
            ? `<img src="${setInfo.logo}" alt="${setInfo.name}" style="max-width: 250px; height: auto;">`
            : ""
        }
        ${
          packImage
            ? `<img src="${packImage}" alt="${decodedPackName}" style="max-width: 200px; height: auto; border-radius: 12px;">`
            : ""
        }
      </div>
      <h2 style="margin-top: 20px;">${decodedPackName} Pack</h2>
    `;
    packInfoEl.textContent = `${allCards.length} cards from ${setInfo.name}`;
    document.getElementById(
      "page-title"
    ).textContent = `${decodedPackName} Pack - Collection Hub`;

    // Mostra conteúdo
    loadingEl.style.display = "none";
    packHeaderEl.style.display = "block";
    filtersEl.style.display = "flex";
    cardsGridEl.style.display = "grid";

    renderCards();
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

// Event Listeners
rarityFilterEl.addEventListener("change", applyFilters);
sortFilterEl.addEventListener("change", () => {
  applySorting();
  renderCards();
});
searchInputEl.addEventListener("input", applyFilters);

// Inicializa
loadCards();
