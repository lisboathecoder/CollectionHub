const urlParams = new URLSearchParams(window.location.search);
const albumId = urlParams.get('id');

async function carregarAlbum() {
    try {
        const res = await fetch(`/api/albums/${albumId}`);
        
        if (res.ok) {
            const result = await res.json();
            renderizarAlbum(result.album);
        } else {
            alert('Erro ao carregar álbum');
            window.location.href = '/albums';
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao carregar álbum');
    }
}

function renderizarAlbum(album) {
    document.getElementById('albumTitle').textContent = album.name;
    
    const cardsDiv = document.getElementById('albumCards');
    
    if (album.items.length === 0) {
        cardsDiv.innerHTML = '<p class="empty">Este álbum está vazio. Adicione cards!</p>';
        return;
    }
    
    cardsDiv.innerHTML = album.items.map(item => {
        if (item.card) {
            return `
                <div class="card-item">
                    <img src="${item.card.imageUrl}" alt="${item.card.nameEn}">
                    <div class="card-info">
                        <h4>${item.card.nameEn}</h4>
                        <p class="card-set">${item.card.set.nameEn}</p>
                        <p class="card-rarity">${item.card.rarity.name}</p>
                        <p class="card-quantity">Quantidade: ${item.quantity}</p>
                        ${item.notes ? `<p class="card-notes">${item.notes}</p>` : ''}
                    </div>
                    <button class="btn-remove" onclick="removerItem(${item.id})">🗑️</button>
                </div>
            `;
        } else {
            return `
                <div class="card-item custom">
                    <img src="${item.customImage}" alt="${item.customName}">
                    <div class="card-info">
                        <h4>${item.customName}</h4>
                        <p class="card-custom">Card Customizado</p>
                        <p class="card-quantity">Quantidade: ${item.quantity}</p>
                        ${item.notes ? `<p class="card-notes">${item.notes}</p>` : ''}
                    </div>
                    <button class="btn-remove" onclick="removerItem(${item.id})">🗑️</button>
                </div>
            `;
        }
    }).join('');
}

function mostrarModalAdicionarCard() {
    document.getElementById('modalAdicionarCard').style.display = 'block';
}

function fecharModal() {
    document.getElementById('modalAdicionarCard').style.display = 'none';
}

function trocarTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-btn');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    buttons.forEach(btn => btn.classList.remove('active'));
    
    if (tabName === 'banco') {
        document.getElementById('tabBanco').classList.add('active');
        buttons[0].classList.add('active');
    } else {
        document.getElementById('tabCustom').classList.add('active');
        buttons[1].classList.add('active');
    }
}

async function buscarCards() {
    const query = document.getElementById('searchCard').value;
    
    if (!query) {
        alert('Digite algo para buscar');
        return;
    }
    
    try {
        const res = await fetch(`/api/pokemon/cards?q=${encodeURIComponent(query)}&pageSize=20`);
        
        if (res.ok) {
            const result = await res.json();
            renderizarResultadosBusca(result.cards.items);
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

function renderizarResultadosBusca(cards) {
    const resultsDiv = document.getElementById('searchResults');
    
    if (cards.length === 0) {
        resultsDiv.innerHTML = '<p>Nenhum card encontrado</p>';
        return;
    }
    
    resultsDiv.innerHTML = cards.map(card => `
        <div class="search-result-item" onclick="adicionarCardDoBanco(${card.id})">
            <img src="${card.imageUrl}" alt="${card.nameEn}">
            <div>
                <h5>${card.nameEn}</h5>
                <p>${card.set.nameEn} - ${card.rarity.name}</p>
            </div>
        </div>
    `).join('');
}

async function adicionarCardDoBanco(cardId) {
    const data = {
        cardId: cardId,
        quantity: 1
    };
    
    try {
        const res = await fetch(`/api/albums/${albumId}/items`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (res.ok) {
            alert('Card adicionado ao álbum!');
            fecharModal();
            carregarAlbum();
        } else {
            const err = await res.json();
            alert(err.erro || 'Erro ao adicionar card');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao adicionar card');
    }
}

document.getElementById('formCardCustomizado').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    let imageUrl = document.getElementById('customCardImageUrl').value;
    
    if (!imageUrl) {
        const fileInput = document.getElementById('customCardImage');
        if (fileInput.files[0]) {
            imageUrl = await uploadImagem(fileInput.files[0]);
        }
    }
    
    if (!imageUrl) {
        alert('Forneça uma imagem (arquivo ou URL)');
        return;
    }
    
    const data = {
        customName: document.getElementById('customCardName').value,
        customImage: imageUrl,
        quantity: parseInt(document.getElementById('customQuantity').value),
        notes: document.getElementById('customNotes').value || null
    };
    
    try {
        const res = await fetch(`/api/albums/${albumId}/items`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (res.ok) {
            alert('Card customizado adicionado!');
            fecharModal();
            carregarAlbum();
        } else {
            const err = await res.json();
            alert(err.erro || 'Erro ao adicionar card');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao adicionar card');
    }
});

async function uploadImagem(file) {
    try {
        const reader = new FileReader();
        
        return new Promise((resolve, reject) => {
            reader.onloadend = async () => {
                const base64 = reader.result.split(',')[1];
                
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ image: base64 })
                });
                
                if (res.ok) {
                    const result = await res.json();
                    resolve(result.imageUrl);
                } else {
                    reject(new Error('Erro ao fazer upload'));
                }
            };
            
            reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
            reader.readAsDataURL(file);
        });
    } catch (error) {
        console.error('Erro no upload:', error);
        throw error;
    }
}

async function removerItem(itemId) {
    if (!confirm('Remover este card do álbum?')) return;
    
    try {
        const res = await fetch(`/api/albums/items/${itemId}`, {
            method: 'DELETE'
        });
        
        if (res.ok) {
            alert('Card removido!');
            carregarAlbum();
        } else {
            alert('Erro ao remover card');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao remover card');
    }
}

async function editarAlbum() {
    const novoNome = prompt('Novo nome do álbum:');
    if (!novoNome) return;
    
    try {
        const res = await fetch(`/api/albums/${albumId}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: novoNome })
        });
        
        if (res.ok) {
            alert('Álbum atualizado!');
            carregarAlbum();
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

async function deletarAlbum() {
    if (!confirm('Tem certeza que deseja excluir este álbum? Esta ação não pode ser desfeita.')) return;
    
    try {
        const res = await fetch(`/api/albums/${albumId}`, {
            method: 'DELETE'
        });
        
        if (res.ok) {
            alert('Álbum excluído!');
            window.location.href = '/albums';
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

window.onclick = function(event) {
    const modal = document.getElementById('modalAdicionarCard');
    if (event.target == modal) {
        fecharModal();
    }
}

carregarAlbum();
