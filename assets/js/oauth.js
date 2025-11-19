const githubButton = document.querySelector(".github button");
const googleButton = document.querySelector(".google button");

const GITHUB_CLIENT_ID = "Ov23li2t6eaF0ZJAgV7L";
const GOOGLE_CLIENT_ID =
  "133503123644-vgbca7k88dgfhqlm4r5jp4cr4gl7p841.apps.googleusercontent.com";
const REDIRECT_URI = window.location.origin;

githubButton?.addEventListener("click", () => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${REDIRECT_URI}/api/auth/github/callback&scope=user:email`;
  window.location.href = githubAuthUrl;
});

googleButton?.addEventListener("click", () => {
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}/api/auth/google/callback&response_type=code&scope=email profile`;
  window.location.href = googleAuthUrl;
});
