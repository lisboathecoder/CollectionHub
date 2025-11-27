document.addEventListener('DOMContentLoaded', () => {
    const profileLink = document.getElementById('profileLink');
    const profileImage = document.getElementById('profileImage');
    
    const loginPath = "/pages/userLogin/login.html";
    const dashboardPath = "/pages/app/dashboard.html";
    const albumsPath = "/albums/index.html";
    const defaultImagePath = "/assets/images/icon.png";

    async function checkLoginStatus() {
        const token = localStorage.getItem('token');

        if (token) {
            try {
                const apiUrl = window.API_BASE_URL || 'http://localhost:3000';
                const response = await fetch(`${apiUrl}/api/profile/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const user = await response.json();
                    
                    if (profileImage) {
                        // Smooth fade transition when changing image
                        profileImage.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                        profileImage.style.opacity = '0';
                        
                        setTimeout(() => {
                            profileImage.src = user.avatarUrl || defaultImagePath;
                            profileImage.alt = "Profile Menu";
                            profileImage.classList.add('profile-pic');
                            profileImage.style.opacity = '1';
                        }, 300);
                    }

                    // Create dropdown menu
                    if (profileLink) {
                        profileLink.removeAttribute('href');
                        profileLink.classList.remove('nav-item');
                        profileLink.classList.add('user-profile');
                        profileLink.style.cursor = 'pointer';
                        profileLink.style.position = 'relative';
                        
                        // Create dropdown
                        const dropdown = document.createElement('div');
                        dropdown.className = 'profile-dropdown';
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
                                <i class="fa-solid fa-user"></i> Profile
                            </a>
                            <a href="${albumsPath}" style="display: block; padding: 12px 16px; color: #fff; text-decoration: none; border-bottom: 1px solid #333;">
                                <i class="fa-solid fa-book"></i> Albums
                            </a>
                            <a href="#" id="logout-btn" style="display: block; padding: 12px 16px; color: #FF3E6C; text-decoration: none;">
                                <i class="fa-solid fa-right-from-bracket"></i> Logout
                            </a>
                        `;

                        profileLink.appendChild(dropdown);

                        // Toggle dropdown (only on image click, not on links)
                        profileImage.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
                        });

                        // Close dropdown when clicking outside
                        document.addEventListener('click', (e) => {
                            if (!profileLink.contains(e.target)) {
                                dropdown.style.display = 'none';
                            }
                        });

                        // Logout handler
                        const logoutBtn = dropdown.querySelector('#logout-btn');
                        logoutBtn.addEventListener('click', (e) => {
                            e.preventDefault();
                            localStorage.removeItem('token');
                            window.location.href = loginPath;
                        });
                    }

                    return;
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        }

        // Not logged in
        if (profileLink) {
            profileLink.href = loginPath;
            profileLink.classList.add('nav-item');
            profileLink.classList.remove('user-profile');
        }
        if (profileImage) {
            profileImage.style.transition = 'opacity 0.3s ease';
            profileImage.src = defaultImagePath;
            profileImage.alt = "Login / Register";
            profileImage.classList.remove('profile-pic');
        }
    }

    checkLoginStatus();
});