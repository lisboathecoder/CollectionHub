const SET_INFO = {
  A1: {
    name: "Genetic Apex",
    logo: "https://i.ibb.co/JFH2gxzL/LOGO-expansion-A1-en-US.webp",
  },
  A1A: {
    name: "Mythical Island",
    logo: "https://i.ibb.co/Mx4LF0Bj/LOGO-expansion-A1-A-en-US.webp",
  },
  A2: {
    name: "Space-Time Smackdown",
    logo: "https://i.ibb.co/7tsrnh7F/LOGO-expansion-A2-en-US.webp",
  },
  A2A: {
    name: "Triumphant Light",
    logo: "https://i.ibb.co/HDJKYY9B/LOGO-expansion-A2-A-en-US.webp",
  },
  A2B: {
    name: "Shining Revelry",
    logo: "https://i.ibb.co/8DpYB66d/LOGO-expansion-A2-B-en-US.webp",
  },
  A3: {
    name: "Celestial Guardians",
    logo: "https://i.ibb.co/Ng9Z8NtS/LOGO-expansion-A3-en-US.webp",
  },
  A3A: {
    name: "Extradimensional Crisis",
    logo: "https://i.ibb.co/WNfxg3W4/LOGO-expansion-A3-A-en-US.webp",
  },
  A3B: {
    name: "Eevee Grove",
    logo: "https://i.ibb.co/F4cbCqbN/LOGO-expansion-A3-B-en-US.webp",
  },
  A4: {
    name: "Wisdom of Sea and Sky",
    logo: "https://i.ibb.co/9mNDC3Ct/LOGO-expansion-A4-en-US.webp",
  },
  A4A: {
    name: "Secluded Springs",
    logo: "https://i.ibb.co/wDXnz9K/LOGO-expansion-A4-A-en-US.webp",
  },
  A4B: {
    name: "Deluxe Pack: ex",
    logo: "https://i.ibb.co/Pv18yXWk/LOGO-expansion-A4-B-en-US.webp",
  },
  B1: {
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

const PACK_IMAGES = {
  Charizard: "https://i.ibb.co/DDHw39kH/Genetic-Apex-Charizard.jpg",
  Mewtwo: "https://i.ibb.co/wZ2cMYtN/Genetic-Apex-Mewtwo.jpg",
  Pikachu: "https://i.ibb.co/jvw2c0x7/Genetic-Apex-Pikachu.jpg",
  Mew: "https://i.ibb.co/zhvftLyp/Mythical-Island.jpg",
  Dialga: "https://i.ibb.co/cSZZ4q8S/Space-Time-Smackdown-Dialga.jpg",
  Palkia: "https://i.ibb.co/Rp9R9YZS/Space-Time-Smackdown-Palkia.jpg",
  Arceus: "https://i.ibb.co/Lh8YXp2Q/Triumphant-Light.png",
  "Shining Revelry": "https://i.ibb.co/CGbPrHF/Shining-Revelry.jpg",
  Lunala: "https://i.ibb.co/v6N1RBxv/Celestial-Guardians-Lunala.jpg",
  Solgaleo: "https://i.ibb.co/ZzS9F16n/Celestial-Guardians-Solgaleo.jpg",
  "Extradimensional Crisis":
    "https://i.ibb.co/ZpJm2m4R/Extradimensional-Crisis.jpg",
  "Eevee Grove": "https://i.ibb.co/chKM3sP1/Eevee-Grove.jpg",
  "Ho-Oh": "https://i.ibb.co/J83t3ND/Wisdom-of-Sea-and-Sky-Ho-Oh.jpg",
  Lugia: "https://i.ibb.co/pj0S8Nv4/Wisdom-of-Sea-and-Sky-Lugia.jpg",
  "Secluded Springs": "https://i.ibb.co/S4hYrPML/Secluded-Springs.jpg",
  "Deluxe Pack": "https://i.ibb.co/XZBT1ZD5/Deluxe-Pack.jpg",
  "Mega Blaziken": "https://i.ibb.co/C5tW8vtW/Mega-Rising-Mega-Blaziken.jpg",
  "Mega Altaria": "https://i.ibb.co/tMkkWXGy/Mega-Rising-Mega-Altaria.jpg",
  "Mega Gyarados": "https://i.ibb.co/yc6QQYGp/Mega-Rising-Mega-Gyarados.jpg",
};

let allCards = [];
let filteredCards = [];
let currentPage = 1;
const cardsPerPage = 50;

const urlParams = new URLSearchParams(window.location.search);
const setCode = urlParams.get("set");
const packName = urlParams.get("pack");
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

async function loadCards() {
  if (!setCode || !packName) {
    showError("No set or pack specified");
    return;
  }

  try {
    loadingEl.style.display = "flex";
    errorEl.style.display = "none";

    const apiUrl = window.API_BASE_URL || "http://localhost:3000";
    console.log("🔍 Buscando cartas do pack:", packName, "no set:", setCode);
    console.log("🌐 API URL:", `${apiUrl}api/pokemon/cards?set=${setCode}`);

    const response = await fetch(
      `${apiUrl}api/pokemon/cards?set=${setCode}&orderBy=number&pageSize=500`
    );

    console.log("📡 Status da resposta:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Erro na resposta:", errorText);
      throw new Error("Failed to fetch cards");
    }

    const data = await response.json();

    const decodedPackName = decodeURIComponent(packName);

    let packCards = data.filter(
      (card) =>
        card.packs && card.packs.some((pack) => pack.name === decodedPackName)
    );

    if (packCards.length === 0) {
      console.log(
        `Pack ${decodedPackName} não encontrado, mostrando todas as cartas do set`
      );
      packCards = data;
    }

    allCards = packCards;
    filteredCards = [...allCards];

    if (allCards.length === 0) {
      showError(`No cards found for ${decodedPackName} pack`);
      return;
    }

    populateRarityFilter();

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
  rarityFilterEl.innerHTML = "";
  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = "All";
  rarityFilterEl.appendChild(allOption);

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

  const totalPages = Math.ceil(filteredCards.length / cardsPerPage);
  const startIndex = (currentPage - 1) * cardsPerPage;
  const endIndex = startIndex + cardsPerPage;
  const cardsToShow = filteredCards.slice(startIndex, endIndex);

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
    cardEl.addEventListener("click", () => {
      openCardModal(card);
    });

    cardsGridEl.appendChild(cardEl);
  });

  renderPagination(totalPages);
}

function openCardModal(card) {
  const modal = document.createElement("div");
  modal.className = "card-detail-modal";
  modal.id = "card-detail-modal";

  const imageUrl = card.imageUrl || "/assets/images/placeholder-card.png";
  const cardName = card.nameEn || "Unknown";
  const rarityName = card.rarity?.name || "Unknown";

  modal.innerHTML = `
    <div class="card-detail-modal__overlay"></div>
    <div class="card-detail-modal__content">
      <button class="card-detail-modal__close" aria-label="Close">×</button>
      <div class="card-detail-modal__image-wrapper">
        <img src="${imageUrl}" alt="${cardName}" class="card-detail-modal__image" onerror="this.src='/assets/images/placeholder-card.png'">
      </div>
      <button class="card-detail-modal__add-btn" onclick="openAddToAlbumModalWithCard(${JSON.stringify(
        card
      ).replace(/"/g, "&quot;")})">
        <i class="fa-solid fa-plus"></i> Add to Album
      </button>
    </div>
  `;

  document.body.appendChild(modal);

  const closeBtn = modal.querySelector(".card-detail-modal__close");
  const overlay = modal.querySelector(".card-detail-modal__overlay");

  const closeModal = () => {
    modal.classList.add("closing");
    setTimeout(() => {
      document.body.removeChild(modal);
    }, 300);
  };

  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", closeModal);

  const escHandler = (e) => {
    if (e.key === "Escape") {
      closeModal();
      document.removeEventListener("keydown", escHandler);
    }
  };
  document.addEventListener("keydown", escHandler);

  setTimeout(() => {
    modal.classList.add("active");
  }, 10);
}

function openAddToAlbumModalWithCard(card) {
  if (typeof openAddToAlbumModal === "function") {
    openAddToAlbumModal(card);
  } else {
    console.error("openAddToAlbumModal function not found");
  }
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

  currentPage = 1;
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
        return 0;
    }
  });
}

rarityFilterEl.addEventListener("change", applyFilters);
sortFilterEl.addEventListener("change", () => {
  applySorting();
  renderCards();
});
searchInputEl.addEventListener("input", applyFilters);

loadCards();
