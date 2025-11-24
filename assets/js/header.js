document.addEventListener('DOMContentLoaded', () => {
    const profileLink = document.getElementById('profileLink');
    const profileImage = document.getElementById('profileImage');
    
    const loginPath = "../../pages/userLogin/login.html";
    const dashboardPath = "../../pages/app/dashboard.html";
    const defaultImagePath = "../../assets/images/icon.png"; 
    const exampleUserImagePath = "../../assets/images/icon.png"; 

    function checkLoginStatus() {
        let isLoggedIn = false;
        let userAvatar = defaultImagePath; 

        if (localStorage.getItem('userIsAuthenticated') === 'true') {
            isLoggedIn = true;
            userAvatar = localStorage.getItem('userAvatarUrl') || exampleUserImagePath; 
        }

        if (isLoggedIn) {
            if(profileLink) profileLink.href = dashboardPath;
            if(profileImage) {
                profileImage.src = userAvatar;
                profileImage.alt = "Ir para o Perfil";
                profileImage.classList.add('profile-pic'); 
            }
        } else {
            if(profileLink) profileLink.href = loginPath;
            if(profileImage) {
                profileImage.src = defaultImagePath;
                profileImage.alt = "Fazer Login / Cadastrar";
                profileImage.classList.remove('profile-pic');
            }
        }
    }

    checkLoginStatus();
});