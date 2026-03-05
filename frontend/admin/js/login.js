// Admin Login Logic
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");

if (loginForm) {
  loginForm.onsubmit = async function (e) {
    e.preventDefault();
    loginError.textContent = "";
    const formData = new FormData(this);
    const email = formData.get("email");
    const password = formData.get("password");
    try {
      const res = await fetch(
        "https://alexokoriengobe.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
          // Show success message, then redirect after short delay
          loginError.style.color = "green";
          loginError.textContent = "Login successful! Redirecting...";
          setTimeout(function() {
            window.location.href = "index.html";
          }, 800); // 800ms delay for mobile reliability
      } else {
        loginError.textContent = data.message || "Login failed";
      }
    } catch (err) {
      loginError.textContent = "Network error. Please try again.";
    }
  };
}
