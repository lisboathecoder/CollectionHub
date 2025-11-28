// Global Search System with Suggestions and Animated Placeholder

// Sample card names and collections for suggestions
const sampleSuggestions = [
  "Charizard ex",
  "Pikachu ex",
  "Mewtwo ex",
  "Mew ex",
  "Genetic Apex",
  "Mythical Island",
  "Space-Time Smackdown",
  "Pikachu Crown",
  "Charizard",
  "Articuno ex",
  "Zapdos ex",
  "Moltres ex",
  "Venusaur ex",
  "Blastoise ex",
];

// Placeholder animation texts
const placeholderTexts = [
  "Search collection... ",
  "Charizard ex ",
  "Pikachu Crown ",
  "Mewtwo ex ",
  "Genetic Apex ",
  "Mythical Island ",
  "Mew ex ",
  "Articuno ex ",
];

let currentPlaceholderIndex = 0;
let typingInterval;
let currentText = "";
let isDeleting = false;
let charIndex = 0;
let searchDebounceTimer = null;

// Initialize search for all pages
function initGlobalSearch() {
  const searchInput = document.querySelector(".search-input");
  const searchBtn = document.querySelector(".search-btn");

  if (!searchInput) return;

  // Create suggestions dropdown
  const suggestionsDropdown = document.createElement("div");
  suggestionsDropdown.className = "search-suggestions";
  suggestionsDropdown.id = "search-suggestions";
  searchInput.parentElement.appendChild(suggestionsDropdown);

  // Start placeholder animation
  startPlaceholderAnimation(searchInput);

  // Input event for suggestions
  searchInput.addEventListener("input", (e) => {
    const value = e.target.value.trim();

    if (value.length > 0) {
      stopPlaceholderAnimation();
      
      // Debounce search requests
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }
      
      searchDebounceTimer = setTimeout(() => {
        showSuggestions(value, suggestionsDropdown);
      }, 300);
    } else {
      hideSuggestions(suggestionsDropdown);
      startPlaceholderAnimation(searchInput);
    }
  });

  // Focus event - stop animation
  searchInput.addEventListener("focus", () => {
    if (searchInput.value.trim().length === 0) {
      searchInput.placeholder = "Search collection...";
    }
  });

  // Blur event - restart animation if empty
  searchInput.addEventListener("blur", () => {
    setTimeout(() => {
      if (searchInput.value.trim().length === 0) {
        startPlaceholderAnimation(searchInput);
      }
      hideSuggestions(suggestionsDropdown);
    }, 200);
  });

  // Search button click
  searchBtn.addEventListener("click", () => {
    performSearch(searchInput.value);
  });

  // Enter key to search
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      performSearch(searchInput.value);
    }
  });

  // Click outside to close suggestions
  document.addEventListener("click", (e) => {
    if (!searchInput.parentElement.contains(e.target)) {
      hideSuggestions(suggestionsDropdown);
    }
  });
}

// Animated placeholder typing effect
function startPlaceholderAnimation(input) {
  if (typingInterval) return; // Already running

  const typeSpeed = 100; // ms per character
  const deleteSpeed = 50;
  const pauseTime = 2000; // pause before deleting

  typingInterval = setInterval(
    () => {
      const targetText = placeholderTexts[currentPlaceholderIndex];

      if (!isDeleting) {
        // Typing
        currentText = targetText.substring(0, charIndex + 1);
        charIndex++;

        if (charIndex === targetText.length) {
          // Finished typing, pause then start deleting
          isDeleting = true;
          clearInterval(typingInterval);
          typingInterval = null;
          setTimeout(() => {
            startPlaceholderAnimation(input);
          }, pauseTime);
          return;
        }
      } else {
        // Deleting
        currentText = targetText.substring(0, charIndex - 1);
        charIndex--;

        if (charIndex === 0) {
          // Finished deleting, move to next placeholder
          isDeleting = false;
          currentPlaceholderIndex =
            (currentPlaceholderIndex + 1) % placeholderTexts.length;
          clearInterval(typingInterval);
          typingInterval = null;
          setTimeout(() => {
            startPlaceholderAnimation(input);
          }, 500);
          return;
        }
      }

      input.placeholder = currentText + (isDeleting ? "" : "|");
    },
    isDeleting ? deleteSpeed : typeSpeed
  );
}
// Show suggestions based on input
async function showSuggestions(query, dropdown) {
  // Get static card suggestions
  const staticMatches = sampleSuggestions.filter((item) =>
    item.toLowerCase().includes(query.toLowerCase())
  );

  // Fetch user suggestions from API
  let userMatches = [];
  try {
    const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
    if (response.ok) {
      userMatches = await response.json();
    }
  } catch (error) {
    console.error("Error fetching user suggestions:", error);
  }

  // Combine all matches
  const allMatches = [];
  
  // Add users first
  userMatches.slice(0, 3).forEach(user => {
    allMatches.push({
      type: 'user',
      value: user.username,
      displayName: user.name || user.username,
      id: user.id
    });
  });

  // Add static card/collection suggestions
  const collections = [
    "Genetic Apex",
    "Mythical Island",
    "Space-Time Smackdown",
  ];

  staticMatches.slice(0, 6).forEach(match => {
    const isCollection = collections.includes(match);
    allMatches.push({
      type: isCollection ? 'collection' : 'card',
      value: match,
      displayName: match
    });
  });

  if (allMatches.length === 0) {
    hideSuggestions(dropdown);
    return;
  }

  dropdown.innerHTML = allMatches
    .map((match) => {
      let icon, typeLabel;
      
      if (match.type === 'user') {
        icon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                 <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                 <circle cx="12" cy="7" r="4"></circle>
               </svg>`;
        typeLabel = '<span class="suggestion-type suggestion-type--user">Usuário</span>';
      } else if (match.type === 'collection') {
        icon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                 <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                 <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
               </svg>`;
        typeLabel = '<span class="suggestion-type">Collection</span>';
      } else {
        icon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                 <rect x="2" y="3" width="20" height="14" rx="2"></rect>
                 <line x1="2" y1="9" x2="22" y2="9"></line>
               </svg>`;
        typeLabel = '<span class="suggestion-type">Card</span>';
      }

      return `
      <div class="suggestion-item" data-type="${match.type}" data-value="${match.value}" data-id="${match.id || ''}">
        ${icon}
        <span class="suggestion-text">${highlightMatch(match.displayName, query)}</span>
        ${typeLabel}
      </div>
    `;
    })
    .join("");

  dropdown.classList.add("active");

  // Add click handlers to suggestions
  dropdown.querySelectorAll(".suggestion-item").forEach((item) => {
    item.addEventListener("click", () => {
      const type = item.getAttribute("data-type");
      const value = item.getAttribute("data-value");
      const id = item.getAttribute("data-id");
      
      if (type === 'user') {
        // Redirect to user profile
        window.location.href = `/pages/app/profile.html?id=${id}`;
      } else {
        // Perform regular search for cards/collections
        document.querySelector(".search-input").value = value;
        performSearch(value);
      }
      
      hideSuggestions(dropdown);
    });
  });
} dropdown.querySelectorAll(".suggestion-item").forEach((item) => {
    item.addEventListener("click", () => {
      const value = item.getAttribute("data-value");
      document.querySelector(".search-input").value = value;
      performSearch(value);
      hideSuggestions(dropdown);
    });
  });

function hideSuggestions(dropdown) {
  dropdown.classList.remove("active");
}

function highlightMatch(text, query) {
  const regex = new RegExp(`(${query})`, "gi");
  return text.replace(regex, '<strong class="highlight">$1</strong>');
}

// Perform the actual search
async function performSearch(query) {
  if (!query || query.trim().length === 0) return;

  console.log("Searching for:", query);

  // Redirect to search results page
  window.location.href = `/pages/explore/searchResults.html?q=${encodeURIComponent(
    query
  )}`;
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", initGlobalSearch);
