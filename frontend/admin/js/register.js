// Admin Registration Logic
const registerForm = document.getElementById("register-form");
const registerError = document.getElementById("register-error");
const registerSuccess = document.getElementById("register-success");

if (registerForm) {
  registerForm.onsubmit = async function (e) {
    e.preventDefault();
    registerError.textContent = "";
    registerSuccess.textContent = "";
    const formData = new FormData(this);
    const username = formData.get("username");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");
    if (password !== confirmPassword) {
      registerError.textContent = "Passwords do not match.";
      return;
    }
    try {
      const res = await fetch(
        "https://alexokoriengobe.onrender.com/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        },
      );
      const data = await res.json();
      if (res.ok) {
        registerSuccess.textContent =
          "Registration successful! You can now log in.";
        registerForm.reset();
      } else {
        registerError.textContent = data.message || "Registration failed.";
      }
    } catch (err) {
      registerError.textContent = "Network error. Please try again.";
    }
  };
}
