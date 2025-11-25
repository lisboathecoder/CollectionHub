// Search Suggestions Animation
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const searchSuggestions = document.getElementById('searchSuggestions');
    
    if (searchInput && searchSuggestions) {
        // Show suggestions on focus
        searchInput.addEventListener('focus', function() {
            searchSuggestions.classList.add('active');
        });
        
        // Hide suggestions when clicking outside
        document.addEventListener('click', function(event) {
            const searchBox = event.target.closest('.search-box');
            if (!searchBox) {
                searchSuggestions.classList.remove('active');
            }
        });
        
        // Handle suggestion item clicks
        const suggestionItems = searchSuggestions.querySelectorAll('.suggestion-item');
        suggestionItems.forEach(item => {
            item.addEventListener('click', function() {
                const suggestionText = this.querySelector('span:last-child').textContent;
                searchInput.value = suggestionText;
                searchSuggestions.classList.remove('active');
                // You can add search logic here
                console.log('Searching for:', suggestionText);
            });
        });
        
        // Optional: Filter suggestions based on input
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            
            if (searchTerm.length > 0) {
                suggestionItems.forEach(item => {
                    const text = item.querySelector('span:last-child').textContent.toLowerCase();
                    if (text.includes(searchTerm)) {
                        item.style.display = 'flex';
                    } else {
                        item.style.display = 'none';
                    }
                });
            } else {
                suggestionItems.forEach(item => {
                    item.style.display = 'flex';
                });
            }
        });
    }
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
        username: form.username.value.trim(),
        email: form.email.value.trim(),
        password: form.password.value
    };
    const apiUrl = window.API_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (res.ok) {
        window.location.href = '/pages/userLogin/login.html';
    } else {
        const err = await res.json();
        alert(err.message || 'Erro ao registrar');
    }
});

