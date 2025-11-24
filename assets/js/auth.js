async function fazerLogin(usernameOrEmail, password) {
    try {
        const apiUrl = window.API_BASE_URL || 'http://localhost:3000';
        const res = await fetch(`${apiUrl}/api/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usernameOrEmail, password })
        });

        if (res.ok) {
            const data = await res.json();
            
            localStorage.setItem('userId', data.id);
            localStorage.setItem('username', data.username);
            localStorage.setItem('token', data.token);
            
            return { success: true, user: data };
        } else {
            const err = await res.json();
            return { success: false, error: err.error || 'Erro ao fazer login' };
        }
    } catch (error) {
        return { success: false, error: 'Erro de conexão' };
    }
}

function fazerLogout() {
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    window.location.href = '/pages/userLogin/login.html';
}

function estaAutenticado() {
    return !!localStorage.getItem('token');
}

function obterToken() {
    return localStorage.getItem('token');
}

function obterUserId() {
    return localStorage.getItem('userId');
}

function obterUsername() {
    return localStorage.getItem('username');
}
