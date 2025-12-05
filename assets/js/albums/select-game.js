document.addEventListener('DOMContentLoaded', () => {
    const gameCards = document.querySelectorAll('.game-card');

    gameCards.forEach(card => {
        card.addEventListener('click', () => {
            const gameType = card.getAttribute('data-game');

            // Redirecionar com parâmetro na URL
            if (gameType === 'pokemon') {
                window.location.href = '/pages/albums/create-album.html?type=pokemon-tcg-pocket';
            } else {
                window.location.href = `/pages/albums/create-album.html?type=${gameType}`;
            }
        });
    });
});
