const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get("token");

if (token) {
  localStorage.setItem("token", token);
  window.history.replaceState({}, document.title, window.location.pathname);
}
