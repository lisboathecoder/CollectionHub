// Configuração para URLs da API
// No Netlify, a API estará no mesmo domínio via Netlify Functions
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000'
  : window.location.origin; // Usa o mesmo domínio (ex: https://seu-site.netlify.app)

// Exporta para uso global
window.API_BASE_URL = API_BASE_URL;
