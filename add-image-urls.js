import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ler o arquivo cards.json
const cardsPath = path.join(__dirname, 'dist', 'cards.json');
const cards = JSON.parse(fs.readFileSync(cardsPath, 'utf8'));

// Processar cada carta
const updatedCards = cards.map(card => {
  if (card.imageName) {
    // Converter imageName para imageUrl
    // Substituir _ por - e manter a extensão .webp
    const imageUrl = card.imageName.replace(/_/g, '-');
    
    return {
      ...card,
      imageUrl: imageUrl
    };
  }
  return card;
});

// Salvar o arquivo atualizado
fs.writeFileSync(cardsPath, JSON.stringify(updatedCards, null, 2), 'utf8');

console.log(`✓ Processadas ${updatedCards.length} cartas`);
console.log(`✓ ImageUrls adicionados com sucesso!`);
