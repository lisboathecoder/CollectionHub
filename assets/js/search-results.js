// Search Results Page Script

let allCards = [];
let filteredCards = [];
let currentPage = 1;
const cardsPerPage = 48;

// Get search query from URL
const urlParams = new URLSearchParams(window.location.search);
const searchQuery = urlParams.get("q");

// DOM Elements
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const searchTitleEl = document.getElementById("search-title");
const searchQueryEl = document.getElementById("search-query");
const collectionsSection = document.getElementById("collections-section");
const cardsSection = document.getElementById("cards-section");
const collectionsGrid = document.getElementById("collections-grid");
const cardsGrid = document.getElementById("cards-grid");
const cardsCountEl = document.getElementById("cards-count");

// Initialize
if (!searchQuery || searchQuery.trim().length === 0) {
  showError("Please enter a search term");
} else {
  searchQueryEl.textContent = `Results for: "${searchQuery}"`;
  performSearch(searchQuery);
}

async function performSearch(query) {
  try {
    loadingEl.style.display = "flex";
    errorEl.style.display = "none";

    const response = await fetch(
      `/api/pokemon/cards/search?q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error("Search failed");
    }

    const data = await response.json();

    loadingEl.style.display = "none";

    if (
      (!data.cards || data.cards.length === 0) &&
      (!data.collections || data.collections.length === 0)
    ) {
      showError("No results found");
      return;
    }

    // Display results
    displayCollections(data.collections || []);
    displayCards(data.cards || []);
  } catch (error) {
    console.error("Search error:", error);
    loadingEl.style.display = "none";
    showError("An error occurred. Please try again.");
  }
}

function displayCollections(collections) {
  if (!collections || collections.length === 0) {
    collectionsSection.style.display = "none";
    return;
  }

  collectionsSection.style.display = "block";
  collectionsGrid.innerHTML = "";

  collections.forEach((collection) => {
    const collectionCard = document.createElement("a");
    collectionCard.className = "collection-card";
    collectionCard.href = `/pages/explore/detalheSetPokemon.html?set=${collection.code}`;

    const logoUrl = getCollectionLogo(collection.code);

    collectionCard.innerHTML = `
      <div class="collection-card__image">
        <img src="${logoUrl}" alt="${collection.name}" onerror="this.src='/assets/images/Collection logo branca.png'">
      </div>
      <div class="collection-card__info">
        <h3>${collection.name}</h3>
        <p class="collection-code">${collection.code}</p>
      </div>
    `;

    collectionsGrid.appendChild(collectionCard);
  });
}

function displayCards(cards) {
  if (!cards || cards.length === 0) {
    cardsSection.style.display = "none";
    return;
  }

  allCards = cards;
  filteredCards = [...cards];
  cardsSection.style.display = "block";
  cardsCountEl.textContent = cards.length;

  renderCards();
}

function renderCards() {
  cardsGrid.innerHTML = "";

  if (filteredCards.length === 0) {
    cardsGrid.innerHTML = '<p class="no-results">No cards found</p>';
    return;
  }

  // Calculate pagination
  const totalPages = Math.ceil(filteredCards.length / cardsPerPage);
  const startIndex = (currentPage - 1) * cardsPerPage;
  const endIndex = startIndex + cardsPerPage;
  const cardsToShow = filteredCards.slice(startIndex, endIndex);

  // Render cards
  cardsToShow.forEach((card) => {
    const cardEl = document.createElement("div");
    cardEl.className = "card-item";

    const imageUrl = card.imageUrl || "/assets/images/placeholder-card.png";
    const cardName = card.nameEn || "Unknown";
    const rarityName = card.rarity || "Unknown";

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

    // Add click event to open modal
    cardEl.addEventListener("click", () => {
      openCardModal(card);
    });

    cardsGrid.appendChild(cardEl);
  });

  // Render pagination
  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  let paginationEl = document.getElementById("pagination");

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

  // Event listeners
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

// Card Modal Functions
function openCardModal(card) {
  const modal = document.createElement("div");
  modal.className = "card-detail-modal";
  modal.id = "card-detail-modal";

  const imageUrl = card.imageUrl || "/assets/images/placeholder-card.png";
  const cardName = card.nameEn || "Unknown";
  const rarityName = card.rarity || "Unknown";

  modal.innerHTML = `
    <div class="card-detail-modal__overlay"></div>
    <div class="card-detail-modal__content">
      <button class="card-detail-modal__close" aria-label="Close">×</button>
      <div class="card-detail-modal__image-wrapper">
        <img src="${imageUrl}" alt="${cardName}" class="card-detail-modal__image" onerror="this.src='/assets/images/placeholder-card.png'">
      </div>
      <button class="card-detail-modal__add-btn" onclick="openAlbumModal('${card.id}')">
        Add to your collection
      </button>
    </div>
  `;

  document.body.appendChild(modal);

  // Close modal handlers
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

  // ESC key to close
  const escHandler = (e) => {
    if (e.key === "Escape") {
      closeModal();
      document.removeEventListener("keydown", escHandler);
    }
  };
  document.addEventListener("keydown", escHandler);

  // Trigger animation
  setTimeout(() => {
    modal.classList.add("active");
  }, 10);
}

function showError(message) {
  loadingEl.style.display = "none";
  errorEl.style.display = "flex";
  errorEl.querySelector("p").textContent = message;
}

function getCollectionLogo(code) {
  const logos = {
    A1: "/assets/images/logo-boosters/genetic-apex-logo.webp",
    A1A: "/assets/images/logo-boosters/Mythical-island-logo.webp",
    A2: "/assets/images/logo-boosters/Space-Time-Smackdown_Logo.webp",
    A2A: "/assets/images/logo-boosters/Triumphant-Ligth_Logo.webp",
    A2B: "/assets/images/logo-boosters/Shining-Revelry_Logo.webp",
    A3: "/assets/images/logo-boosters/Celestial-Guardians_Logo.webp",
    A3A: "/assets/images/logo-boosters/Extradimensional-Crisis_Logo.webp",
    A3B: "/assets/images/logo-boosters/Eevee-Grove_Logo.webp",
    A4: "/assets/images/logo-boosters/Wisdom-Of-Sea-And-Sky_Logo.webp",
    A4A: "/assets/images/logo-boosters/Secluded-Springs_Logo.webp",
    A4B: "/assets/images/logo-boosters/Deluxe-Pack-Ex_Logo.webp",
    B1: "/assets/images/logo-boosters/Mega-Rising_Logo.webp",
    "PROMO-A": "https://i.ibb.co/Xx8FWqrk/LOGO-expansion-PROMO-A-en-US.webp",
    "PROMO-B": "https://i.ibb.co/sd9sWXZN/LOGO-expansion-PROMO-B-en-US.webp",
  };
  return logos[code] || "/assets/images/Collection logo branca.png";
}

// Stub function for album modal (not implemented on search page)
function openAlbumModal(cardId) {
  alert(
    "Please navigate to the set details page to add cards to your collection."
  );
}
