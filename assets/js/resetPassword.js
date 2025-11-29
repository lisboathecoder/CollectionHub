document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("reset-password-form");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirm-password");

  const resetToken = localStorage.getItem("reset_token");

  if (!resetToken) {
    alert("Sessão inválida. Por favor, inicie o processo de redefinição de senha novamente.");
    window.location.href = "/pages/userLogin/forgotPassword.html";
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (password.length < 8) {
      alert("Opa, a senha deve ter no mínimo 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      alert("As senhas não coincidem. Por favor, tente novamente.");
      confirmPasswordInput.value = "";
      confirmPasswordInput.focus();
      return;
    }

    try {
      const apiUrl = window.API_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}api/auth/reset-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resetToken,
          newPassword: password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.removeItem("reset_token");

        alert(
          "Password reset successfully! You can now login with your new password."
        );

        setTimeout(() => {
          window.location.href = "/pages/userLogin/login.html";
        }, 1500);
      } else {
        alert(data.message || "Erro ao redefinir a senha. Por favor, tente novamente.");

        if (data.expired) {
          localStorage.removeItem("reset_token");
          setTimeout(() => {
            window.location.href = "/pages/userLogin/forgotPassword.html";
          }, 2000);
        }
      }
    } catch (error) {
      alert("Ocorreu um erro. Por favor, verifique sua conexão e tente novamente.");
    }
  });
});
