document.addEventListener('DOMContentLoaded', () => {
    const profileLink = document.getElementById('profileLink');
    const profileImage = document.getElementById('profileImage');
    const loginPath = "../../pages/userLogin/login.html";
    const dashboardPath = "../../pages/app/dashboard.html";
    const defaultImagePath = "../../assets/images/icon.png"; // Icone padrao (user deslogado)
    const exampleUserImagePath = "../../assets/images/icon.png"; // Icone de exemplo (user logado)

    // Função principal que verifica o estado de login e atualiza a UI
    function checkLoginStatus() {
        // =================================================================
        // LÓGICA DE AUTENTICAÇÃO (Onde você conecta o Backend)
        // =================================================================
        
        // **Neste ponto, você faria uma chamada para a sua API (ex: /api/auth/status)**
        
        let isLoggedIn = false;
        let userAvatar = defaultImagePath; 

        // -----------------------------------------------------------------
        // SIMULAÇÃO (Remova esta seção após conectar o backend)
        // -----------------------------------------------------------------
        
        if (localStorage.getItem('userIsAuthenticated') === 'true') {
            isLoggedIn = true;
            // Pega o avatar do usuário (simulação)
            userAvatar = localStorage.getItem('userAvatarUrl') || exampleUserImagePath; 
        }

        // =================================================================
        // MANIPULAÇÃO DO HEADER (IF/ELSE)
        // =================================================================
        if (isLoggedIn) {
            // SE ESTIVER LOGADO (Redireciona para o Perfil)
            profileLink.href = dashboardPath;
            profileImage.src = userAvatar;
            profileImage.alt = "Ir para o Perfil";
            
            // Adicional: Ativa um estilo visual para a foto de perfil logado (ex: borda rosa)
            profileImage.classList.add('profile-pic'); 
        } else {
            // SE NÃO ESTIVER LOGADO (Redireciona para o Login)
            profileLink.href = loginPath;
            profileImage.src = defaultImagePath;
            profileImage.alt = "Fazer Login / Cadastrar";
            
            // Remove o estilo profile-pic, se necessário
            profileImage.classList.remove('profile-pic');
        }
    }

    checkLoginStatus();
});