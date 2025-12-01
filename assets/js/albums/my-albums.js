window.API_BASE_URL = window.API_BASE_URL || "http://localhost:3000/";
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const list = document.getElementById("albumsList");
  try {
    const response = await fetch(`${API_BASE_URL}api/albums/me`, {
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    });
    if (response.ok) {
      const albums = await response.json();
      if (albums.length === 0) {
        list.innerHTML = "<p>Você ainda não criou nenhum álbum.</p>";
      } else {
        list.innerHTML = albums
          .map(
            (album) => `
          <div class="album-card">
            <h2>${album.nome}</h2>
            <p>${album.publico ? "Público" : "Privado"}</p>
            <a href="/pages/albums/view-album.html?id=${
              album.id
            }" class="btn">Ver álbum</a>
          </div>
        `
          )
          .join("");
      }
    } else {
      list.innerHTML = "<p>Erro ao carregar álbuns.</p>";
    }
  } catch {
    list.innerHTML = "<p>Erro de conexão.</p>";
  }
});
