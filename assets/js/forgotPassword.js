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
      alert("Please enter your email address");
      return;
    }

    try {
      const response = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem("reset_email", email);

        alert("Verification code sent to your email!");

        setTimeout(() => {
          window.location.href = "/pages/userLogin/forgot2FA.html";
        }, 1500);
      } else {
        alert(
          data.message || "Error sending verification code. Please try again."
        );
      }
    } catch (error) {
      alert("An error occurred. Please check your connection and try again.");
    }
  });
});
