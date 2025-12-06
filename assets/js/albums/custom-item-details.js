window.API_BASE_URL = window.API_BASE_URL || "http://localhost:3000/";

let currentItem = null;
let currentAlbumId = null;

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/pages/userLogin/login.html";
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get("id");
  currentAlbumId = urlParams.get("albumId");

  if (!itemId || !currentAlbumId) {
    showToast("❌ Item ou álbum não encontrado", "error", 5000);
    setTimeout(() => window.history.back(), 2000);
    return;
  }

  loadCustomItem(itemId);
});

async function loadCustomItem(itemId) {
  const token = localStorage.getItem("token");
  const loadingState = document.getElementById("loadingState");
  const itemContent = document.getElementById("itemContent");

  try {
    // Buscar detalhes do álbum para obter os itens
    const response = await fetch(apiUrl(`api/albums/${currentAlbumId}`), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao carregar item (${response.status})`);
    }

    const album = await response.json();
    console.log('📦 Album completo:', album);
    console.log('📋 Items do album:', album.items);
    
    const item = album.items.find(i => i.id === parseInt(itemId));
    console.log('🔍 Item encontrado:', item);

    if (!item || !item.customName) {
      throw new Error("Item personalizado não encontrado");
    }

    currentItem = item;

    // Preencher dados na página
    document.getElementById("itemName").textContent = item.customName;
    document.getElementById("albumName").textContent = album.name;
    document.getElementById("itemQuantity").textContent = item.quantity || 1;
    document.getElementById("itemDate").textContent = new Date(item.createdAt).toLocaleDateString('pt-BR');

    console.log('🖼️ Item customImage:', item.customImage);
    console.log('📦 Item completo:', item);

    const itemImage = document.getElementById("itemImage");
    const imagePlaceholder = document.getElementById("imagePlaceholder");

    if (item.customImage && item.customImage.trim() !== '') {
      itemImage.src = item.customImage;
      itemImage.alt = item.customName;
      itemImage.style.display = 'block';
      imagePlaceholder.style.display = 'none';
      
      itemImage.onerror = () => {
        console.error('❌ Erro ao carregar imagem:', item.customImage);
        itemImage.style.display = 'none';
        imagePlaceholder.style.display = 'flex';
      };
    } else {
      console.log('⚠️ Sem customImage, mostrando placeholder');
      itemImage.style.display = 'none';
      imagePlaceholder.style.display = 'flex';
    }

    // Mostrar notas se existirem
    if (item.notes) {
      document.getElementById("itemNotes").textContent = item.notes;
      document.getElementById("notesSection").style.display = "block";
    }

    // Atualizar título da página
    document.title = `${item.customName} - CollectionHub`;

    loadingState.style.display = "none";
    itemContent.style.display = "block";

  } catch (error) {
    console.error("Erro ao carregar item:", error);
    showToast(`❌ ${error.message}`, "error", 6000);
    loadingState.style.display = "none";
    setTimeout(() => window.history.back(), 2000);
  }
}

function editCustomItem() {
  // Voltar para o álbum e abrir modal de edição
  showToast("ℹ️ Funcionalidade de edição em desenvolvimento", "info", 4000);
}

async function deleteCustomItem() {
  if (!confirm(`Deseja remover "${currentItem.customName}" do álbum?`)) {
    return;
  }

  const token = localStorage.getItem("token");

  try {
    const response = await fetch(
      apiUrl(`api/albums/${currentAlbumId}/items/${currentItem.id}`),
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `Erro ao remover item (${response.status})`);
    }

    showToast("✅ Item removido com sucesso!", "success", 5000);
    setTimeout(() => {
      window.location.href = `/pages/albums/album-view.html?id=${currentAlbumId}`;
    }, 1500);

  } catch (error) {
    console.error("Erro ao remover item:", error);
    showToast(`❌ ${error.message}`, "error", 6000);
  }
}
