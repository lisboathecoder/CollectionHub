document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("forgot-twofa-form");
  const codeInputs = document.querySelectorAll(".code-box");
  const errorMessage = document.getElementById("error-message");

  codeInputs.forEach((input, index) => {
    input.addEventListener("input", (e) => {
      const value = e.target.value;

      if (value.length === 1 && index < codeInputs.length - 1) {
        codeInputs[index + 1].focus();
      }
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !e.target.value && index > 0) {
        codeInputs[index - 1].focus();
      }
    });

    input.addEventListener("paste", (e) => {
      e.preventDefault();
      const pasteData = e.clipboardData.getData("text").trim();

      if (/^\d{6}$/.test(pasteData)) {
        pasteData.split("").forEach((char, i) => {
          if (codeInputs[i]) {
            codeInputs[i].value = char;
          }
        });
        codeInputs[5].focus();
      }
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const code = Array.from(codeInputs)
      .map((input) => input.value)
      .join("");

    if (code.length !== 6) {
      showError("Please enter all 6 digits");
      return;
    }

    const email = localStorage.getItem("reset_email");

    if (!email) {
      showError(
        "Session expired. Please start the password reset process again."
      );
      setTimeout(() => {
        window.location.href = "/pages/userLogin/forgotPassword.html";
      }, 2000);
      return;
    }

    try {
      const apiUrl = window.API_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/auth/verify-reset-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem("reset_token", data.resetToken);
        localStorage.removeItem("reset_email");

        window.location.href = "/pages/userLogin/resetPassword.html";
      } else {
        showError(
          data.message || "Invalid verification code. Please try again."
        );
        codeInputs.forEach((input) => (input.value = ""));
        codeInputs[0].focus();
      }
    } catch (error) {
      showError("An error occurred. Please try again.");
    }
  });

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";

    setTimeout(() => {
      errorMessage.style.display = "none";
    }, 5000);
  }
});