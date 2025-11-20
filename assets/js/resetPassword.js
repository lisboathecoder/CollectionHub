document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("reset-password-form");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirm-password");

  const resetToken = localStorage.getItem("reset_token");

  if (!resetToken) {
    alert("Invalid session. Please start the password reset process again.");
    window.location.href = "/pages/userLogin/forgotPassword.html";
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (password.length < 8) {
      alert("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match. Please try again.");
      confirmPasswordInput.value = "";
      confirmPasswordInput.focus();
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
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
        alert(data.message || "Error resetting password. Please try again.");

        if (data.expired) {
          localStorage.removeItem("reset_token");
          setTimeout(() => {
            window.location.href = "/pages/userLogin/forgotPassword.html";
          }, 2000);
        }
      }
    } catch (error) {
      alert("An error occurred. Please check your connection and try again.");
    }
  });
});
