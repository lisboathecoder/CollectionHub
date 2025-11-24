// Configuração para atualizar as URLs da API em produção
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000'
  : 'https://SEU-BACKEND-URL.onrender.com';

// Exporta para uso global
window.API_BASE_URL = API_BASE_URL;
