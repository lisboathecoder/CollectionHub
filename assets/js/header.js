document.addEventListener("DOMContentLoaded", () => {
  const profileLink = document.getElementById("profileLink");
  const profileImage = document.getElementById("profileImage");

  // Caminhos das páginas
  const loginPath = "/pages/userLogin/login.html";
  const dashboardPath = "/pages/app/dashboard.html";
  // Caminho da imagem padrão se o usuário não tiver foto ou não estiver logado
  const defaultImagePath = "/assets/images/icon.png";

  async function checkLoginStatus() {
    const token = localStorage.getItem("token");

    // Estado inicial: assumimos deslogado
    let isLoggedIn = false;
    let userData = null;

    if (token) {
      try {
        // Ajuste a URL da API conforme necessário (localhost ou produção)
        const apiUrl = window.API_BASE_URL || "http://localhost:3000";

        const response = await fetch(`${apiUrl}api/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          userData = await response.json();
          isLoggedIn = true;
        } else {
          // Se o token for inválido ou expirado, removemos
          if (response.status === 401) {
            localStorage.removeItem("token");
          }
        }
      } catch (error) {
        console.error("Erro ao verificar status de login:", error);
      }
    }

    updateHeaderUI(isLoggedIn, userData);
  }

  function updateHeaderUI(isLoggedIn, user) {
    if (isLoggedIn && user) {
      // --- ESTADO: LOGADO ---

      // 1. Atualizar Imagem
      if (profileImage) {
        // Usa avatarUrl do banco ou a imagem padrão se for null
        profileImage.src = user.avatarUrl || defaultImagePath;
        profileImage.alt = `${user.username || "Usuário"} Profile`;
        profileImage.classList.add("profile-pic"); // Adiciona estilo de foto de perfil (borda, etc)
      }

      // 2. Configurar Dropdown no Link
      if (profileLink) {
        // Remove navegação padrão para controlar via JS
        profileLink.removeAttribute("href");
        profileLink.classList.add("user-profile");
        profileLink.style.cursor = "pointer";
        profileLink.style.position = "relative";

        // Criar o menu dropdown se ele ainda não existir
        let dropdown = profileLink.querySelector(".profile-dropdown");

        if (!dropdown) {
          dropdown = document.createElement("div");
          dropdown.className = "profile-dropdown";
          // Estilos inline para o dropdown (pode ser movido para o CSS)
          dropdown.style.cssText = `
                        display: none;
                        position: absolute;
                        top: 100%;
                        right: 0;
                        background: #1a1a1a;
                        border: 1px solid #333;
                        border-radius: 8px;
                        margin-top: 10px;
                        min-width: 180px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
                        z-index: 1000;
                        overflow: hidden;
                    `;

          // Conteúdo do Dropdown
          dropdown.innerHTML = `
                        <a href="${dashboardPath}" class="dropdown-item" style="display: block; padding: 12px 16px; color: #fff; text-decoration: none; border-bottom: 1px solid #333; transition: background 0.2s;">
                            <i class="fa-solid fa-user" style="margin-right: 8px;"></i> Perfil
                        </a>
                        <a href="/pages/albums/albums-list.html" class="dropdown-item" style="display: block; padding: 12px 16px; color: #fff; text-decoration: none; border-bottom: 1px solid #333; transition: background 0.2s;">
                            <i class="fa-solid fa-book" style="margin-right: 8px;"></i> Meus Álbuns
                        </a>
                        <a href="#" id="logout-btn" class="dropdown-item" style="display: block; padding: 12px 16px; color: #FF3E6C; text-decoration: none; transition: background 0.2s;">
                            <i class="fa-solid fa-right-from-bracket" style="margin-right: 8px;"></i> Sair
                        </a>
                    `;

          profileLink.appendChild(dropdown);

          // Eventos de Hover para itens do dropdown (opcional, melhor via CSS)
          const items = dropdown.querySelectorAll(".dropdown-item");
          items.forEach((item) => {
            item.addEventListener(
              "mouseenter",
              () => (item.style.backgroundColor = "#333")
            );
            item.addEventListener(
              "mouseleave",
              () => (item.style.backgroundColor = "transparent")
            );
          });

          // Lógica de Logout
          const logoutBtn = dropdown.querySelector("#logout-btn");
          logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation(); // Impede fechar o dropdown imediatamente
            localStorage.removeItem("token");
            window.location.href = loginPath;
          });
        }

        // Toggle do Dropdown ao clicar na imagem ou no link
        const toggleDropdown = (e) => {
          e.preventDefault();
          e.stopPropagation();
          const isVisible = dropdown.style.display === "block";
          dropdown.style.display = isVisible ? "none" : "block";
        };

        // Remove listeners antigos para evitar duplicação (boa prática se a func rodar + de 1 vez)
        // Como aqui roda uma vez no DOMContentLoaded, é seguro adicionar direto.
        profileLink.onclick = toggleDropdown;
      }

      // Fechar dropdown ao clicar fora
      document.addEventListener("click", (e) => {
        const dropdown = profileLink
          ? profileLink.querySelector(".profile-dropdown")
          : null;
        if (dropdown && dropdown.style.display === "block") {
          if (!profileLink.contains(e.target)) {
            dropdown.style.display = "none";
          }
        }
      });
    } else {
      // --- ESTADO: DESLOGADO ---

      if (profileLink) {
        profileLink.href = loginPath; // Restaura link para login
        profileLink.classList.remove("user-profile");
        profileLink.style.cursor = "pointer";
        profileLink.onclick = null; // Remove evento de clique do dropdown

        // Se houver dropdown residual, remove
        const existingDropdown = profileLink.querySelector(".profile-dropdown");
        if (existingDropdown) {
          existingDropdown.remove();
        }
      }

      if (profileImage) {
        profileImage.src = defaultImagePath;
        profileImage.alt = "Fazer Login";
        profileImage.classList.remove("profile-pic");
      }
    }
  }

  // Inicia a verificação
  checkLoginStatus();
});
