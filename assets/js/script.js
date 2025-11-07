document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
        username: form.username.value.trim(),
        email: form.email.value.trim(),
        password: form.password.value
    };
    const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (res.ok) {
        // leva para o arquivo fornecido:
        window.location.href = '/pages/userLogin/login.html';
    } else {
        const err = await res.json();
        alert(err.message || 'Erro ao registrar');
    }
});