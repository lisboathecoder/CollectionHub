// Select Game Type for Album Creation

document.addEventListener('DOMContentLoaded', () => {
    const gameCards = document.querySelectorAll('.game-card');

    gameCards.forEach(card => {
        card.addEventListener('click', () => {
            const gameType = card.getAttribute('data-game');
            
            // Store game type in sessionStorage
            sessionStorage.setItem('albumGameType', gameType);
            
            // Redirect to create album page
            window.location.href = '/pages/albums/create-album.html';
        });
    });
});
