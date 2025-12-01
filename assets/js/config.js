const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://collectionhub.up.railway.app/";

window.API_BASE_URL = API_BASE_URL;

window.API_BASE = (window.API_BASE_URL || "").replace(/\/+$/g, "");

window.apiUrl = function (route) {
  if (!route) return window.API_BASE;
  return window.API_BASE + (route.startsWith("/") ? route : "/" + route);
};
