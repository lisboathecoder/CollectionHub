document.addEventListener('DOMContentLoaded', () => {
    const gameCards = document.querySelectorAll('.game-card');

    gameCards.forEach(card => {
        card.addEventListener('click', () => {
            const gameType = card.getAttribute('data-game');

            sessionStorage.setItem('albumGameType', gameType);

            window.location.href = '/pages/albums/create-album.html';
        });
    });
});
