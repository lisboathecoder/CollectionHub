document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".caixa-texto");
  const emailInput = document.getElementById("email");
  const backLink = document.querySelector(".back-link");

  backLink.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "/pages/userLogin/login.html";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();

    if (!email) {
      alert("Por favor, insira seu endereço de email");
      return;
    }

    try {
      const apiUrl = window.apiUrl;
      const response = await fetch(apiUrl("api/auth/request-password-reset"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem("reset_email", email);

        alert("Código de verificação enviado para seu email!");

        setTimeout(() => {
          window.location.href = "/pages/userLogin/forgot2FA.html";
        }, 1500);
      } else {
        alert(
          data.message ||
            "Erro ao enviar o código de verificação. Por favor, tente novamente."
        );
      }
    } catch (error) {
      alert(
        "Ocorreu um erro. Por favor, verifique sua conexão e tente novamente."
      );
    }
  });
});
