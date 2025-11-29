const form = document.querySelector(".register-form");
const nicknameInput = document.getElementById("nickname");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const termsCheckbox = document.getElementById("terms");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  e.stopPropagation();

  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton.disabled) return;
  submitButton.disabled = true;

  const existingError = document.querySelector(".error-message");
  if (existingError) {
    existingError.remove();
  }

  document.querySelectorAll(".input-error").forEach((input) => {
    input.classList.remove("input-error");
  });

  const nickname = nicknameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if (!nickname || !email || !password || !confirmPassword) {
    showError("Por favor, preencha todos os campos");
    submitButton.disabled = false;
    return;
  }

  if (password.length < 8) {
    showError("A senha deve ter no mínimo 8 caracteres");
    passwordInput.classList.add("input-error");
    submitButton.disabled = false;
    return;
  }

  if (password !== confirmPassword) {
    showError("As senhas não coincidem");
    passwordInput.classList.add("input-error");
    confirmPasswordInput.classList.add("input-error");
    submitButton.disabled = false;
    return;
  }

  if (!termsCheckbox.checked) {
    showError("Você precisa aceitar os termos de uso");
    submitButton.disabled = false;
    return;
  }

  try {
    console.log("Enviando dados:", {
      username: nickname,
      email,
      password: "***",
    });

    const apiUrl = window.API_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${apiUrl}api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: nickname,
        email,
        password,
      }),
    });

    console.log("Status da resposta:", response.status);
    const data = await response.json();
    console.log("Dados recebidos:", data);

    if (response.ok) {
      alert("Conta criada com sucesso! Faça login para continuar.");
      window.location.href = "/pages/userLogin/login.html";
    } else {
      submitButton.disabled = false;
      showError(data.message || data.error || "Erro ao criar conta");
    }
  } catch (error) {
    console.error("Erro completo:", error);
    submitButton.disabled = false;
    showError("Erro ao criar conta. Tente novamente.");
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

  [nicknameInput, emailInput, passwordInput, confirmPasswordInput].forEach(
    (input) => {
      if (!input.value.trim()) {
        input.classList.add("input-error");
      }
    }
  );

  setTimeout(() => {
    document.querySelectorAll(".input-error").forEach((input) => {
      input.classList.remove("input-error");
    });
  }, 3000);
}
