const API_BASE_URL = window.API_BASE_URL || "http://localhost:3000/";

const githubButton = document.querySelector(".oauth-button github-button");
const googleButton = document.querySelector(".oauth-button google-button");
const GITHUB_CLIENT_ID = "Ov23li2t6eaF0ZJAgV7L";
const GOOGLE_CLIENT_ID =
  "133503123644-8to0kqg77hc2rpc1ga0l5f4am3lt8rlj.apps.googleusercontent.com ";

githubButton?.addEventListener("click", () => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${API_BASE_URL}/api/auth/github/callback&scope=user:email`;
  window.location.href = githubAuthUrl;
});

googleButton?.addEventListener("click", () => {
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${API_BASE_URL}/api/auth/google/callback&response_type=code&scope=email profile`;
  window.location.href = googleAuthUrl;
});
