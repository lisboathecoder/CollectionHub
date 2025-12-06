document.addEventListener("DOMContentLoaded", () => {
  const profileLink = document.getElementById("profileLink");
  const profileImage = document.getElementById("profileImage");

  const loginPath = "/pages/userLogin/login.html";
  const dashboardPath = "/pages/app/dashboard.html";
  const albumsPath = "/pages/app/select-album-type.html";
  const defaultImagePath = "/assets/images/icon.png";

  async function checkLoginStatus() {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const apiUrl = window.apiUrl;
        const response = await fetch(apiUrl("api/profile/me"), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const user = await response.json();

          if (profileImage) {
            profileImage.style.transition =
              "opacity 0.3s ease, transform 0.3s ease";
            profileImage.style.opacity = "0";

            setTimeout(() => {
              profileImage.src = user.avatarUrl || defaultImagePath;
              profileImage.alt = "Profile Menu";
              profileImage.classList.add("profile-pic");
              profileImage.style.opacity = "1";
            }, 300);
          }

          if (profileLink) {
            profileLink.removeAttribute("href");
            profileLink.classList.remove("nav-item");
            profileLink.classList.add("user-profile");
            profileLink.style.cursor = "pointer";
            profileLink.style.position = "relative";

            const dropdown = document.createElement("div");
            dropdown.className = "profile-dropdown";
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
                        `;

            dropdown.innerHTML = `
                            <a href="${dashboardPath}" style="display: block; padding: 12px 16px; color: #fff; text-decoration: none; border-bottom: 1px solid #333;">
                                <i class="fa-solid fa-user"></i> Perfil
                            </a>
                            <a href="/pages/albums/albums-list.html" style="display: block; padding: 12px 16px; color: #fff; text-decoration: none; border-bottom: 1px solid #333;">
                                <i class="fa-solid fa-book"></i> Meus Álbuns
                            </a>
                            <a href="#" id="logout-btn" style="display: block; padding: 12px 16px; color: #FF3E6C; text-decoration: none;">
                                <i class="fa-solid fa-right-from-bracket"></i> Sair
                            </a>
                        `;

            profileLink.appendChild(dropdown);

            profileImage.addEventListener("click", (e) => {
              e.preventDefault();
              e.stopPropagation();
              
              // Toggle dropdown
              const isVisible = dropdown.style.display === "block";
              dropdown.style.display = isVisible ? "none" : "block";
              
              if (!isVisible) {
                // Calcular posição do botão em relação à tela
                const rect = profileLink.getBoundingClientRect();
                const windowWidth = window.innerWidth;
                const dropdownWidth = 180; // min-width do dropdown
                
                // Se o botão está mais à esquerda (menos de metade da tela), abre para direita
                // Se está mais à direita, abre para esquerda
                if (rect.left < windowWidth / 2) {
                  dropdown.style.right = "auto";
                  dropdown.style.left = "0";
                } else {
                  dropdown.style.right = "0";
                  dropdown.style.left = "auto";
                }
              }
            });

            document.addEventListener("click", (e) => {
              if (!profileLink.contains(e.target)) {
                dropdown.style.display = "none";
              }
            });

            const logoutBtn = dropdown.querySelector("#logout-btn");
            logoutBtn.addEventListener("click", (e) => {
              e.preventDefault();
              localStorage.removeItem("token");
              window.location.href = loginPath;
            });
          }

          return;
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }

    if (profileLink) {
      profileLink.href = loginPath;
      profileLink.classList.add("nav-item");
      profileLink.classList.remove("user-profile");
    }
    if (profileImage) {
      profileImage.style.transition = "opacity 0.3s ease";
      profileImage.src = defaultImagePath;
      profileImage.alt = "Login / Register";
      profileImage.classList.remove("profile-pic");
    }
  }

  checkLoginStatus();
});
