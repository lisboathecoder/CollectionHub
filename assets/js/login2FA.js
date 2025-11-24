const codeBoxes = document.querySelectorAll(".code-box");
const form = document.getElementById("twofa-form");
const errorMessage = document.getElementById("error-message");

window.addEventListener("load", () => {
  codeBoxes[0].focus();
});

codeBoxes.forEach((box, index) => {
  box.addEventListener("input", (e) => {
    const value = e.target.value;

    if (value && !/^\d$/.test(value)) {
      e.target.value = "";
      return;
    }

    if (value && index < codeBoxes.length - 1) {
      codeBoxes[index + 1].focus();
    }

    errorMessage.textContent = "";
  });
  
    input.addEventListener("paste", (e) => {
      e.preventDefault();
      const pasteData = e.clipboardData.getData("text").trim();

    if (/^\d{6}$/.test(pasteData)) {
      pasteData.split("").forEach((char, i) => {
        if (codeBoxes[i]) {
          codeBoxes[i].value = char;
        }
      });
      codeBoxes[5].focus();
    }
  });

  box.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      codeBoxes[index - 1].focus();
    }
  });
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const code = Array.from(codeBoxes)
    .map((box) => box.value)
    .join("");

  if (code.length !== 6) {
    errorMessage.textContent = "Por favor, digite todos os 6 dígitos";
    return;
  }

  try {
    const email = sessionStorage.getItem("verificationEmail");

    if (!email) {
      errorMessage.textContent = "Sessão expirada. Faça login novamente.";
      setTimeout(() => {
        window.location.href = "/pages/userLogin/login.html";
      }, 2000);
      return;
    }

    const response = await fetch("/api/auth/verify-2fa", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, code }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);
      sessionStorage.removeItem("verificationEmail");
      window.location.href = "/index.html";
    } else {
      errorMessage.textContent = data.message || "Código inválido";
      codeBoxes.forEach((box) => (box.value = ""));
      codeBoxes[0].focus();
    }
  } catch (error) {
    console.error("Erro:", error);
    errorMessage.textContent = "Erro ao verificar código. Tente novamente.";
  }
});
