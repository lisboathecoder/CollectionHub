document.getElementById('addFriendBtn').addEventListener('click', async () => {
    const userId = document.getElementById('profileContainer').dataset.userId;
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${window.API_BASE_URL}/api/friends/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ friendId: userId })
        });
        if (response.ok) {
            alert('Solicitação de amizade enviada!');
        } else {
            alert('Erro ao enviar solicitação.');
        }
    } catch {
        alert('Erro de conexão.');
    }
});