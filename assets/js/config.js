// Configuração para URLs da API
// No Netlify, a API estará no mesmo domínio via Netlify Functions

const API_BASE_URL = window.location.hostname === 'localhost'

  ? 'http://localhost:3000'

  : 'https://collectionhub-production.up.railway.app/'; 
  

window.API_BASE_URL = API_BASE_URL;