document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  const bell = document.getElementById('notificationBell');
  bell.addEventListener('click', async () => {
    const response = await fetch(`${window.API_BASE_URL}/api/notifications`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      const notifications = await response.json();
      // Exiba notificações em modal ou dropdown
      alert(notifications.map(n => n.mensagem).join('\n'));
    }
  });
});