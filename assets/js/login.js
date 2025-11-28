const form = document.querySelector(".login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const existingError = document.querySelector(".error-message");
  if (existingError) {
    existingError.remove();
  }

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showError("Por favor, preencha todos os campos");
    return;
  }

  try {
    const apiUrl = window.API_BASE_URL || 'http://localhost:3000' || '';
    const response = await fetch(`${apiUrl}api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ usernameOrEmail: email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      if (data.requires2FA) {
        sessionStorage.setItem("verificationEmail", email);
        window.location.href = "/pages/userLogin/login2FA.html";
      } else {
        localStorage.setItem("token", data.token);
        window.location.href = "/index.html";
      }
    } else {
      showError(data.message || "Email ou senha incorretos");
    }
  } catch (error) {
    console.error("Erro:", error);
    showError("Erro ao fazer login. Tente novamente.");
  }
});

function showError(message) {
  const existingError = document.querySelector(".error-message");
  if (existingError) {
    existingError.remove();
  }

  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.textContent = message;

  const passwordInput = document.getElementById("password");
  passwordInput.parentNode.insertBefore(errorDiv, passwordInput.nextSibling);

  emailInput.classList.add("input-error");
  passwordInput.classList.add("input-error");

  setTimeout(() => {
    emailInput.classList.remove("input-error");
    passwordInput.classList.remove("input-error");
  }, 3000);
}
