// Configuração da API
const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://collectionhub.egoats.me/";

window.API_BASE_URL = API_BASE_URL;

window.API_BASE = (window.API_BASE_URL || "").replace(/\/+$/g, "");

window.apiUrl = function (route) {
  if (!route) return window.API_BASE;
  return window.API_BASE + (route.startsWith("/") ? route : "/" + route);
};

// Log para debug
console.log("🌐 API Configuration loaded:", {
  hostname: window.location.hostname,
  API_BASE_URL: window.API_BASE_URL,
  API_BASE: window.API_BASE
});
