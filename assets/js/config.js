const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000/"
    : "https://collectionhub.up.railway.app/";

window.API_BASE_URL = API_BASE_URL;
