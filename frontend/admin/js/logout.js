// Logout logic for all admin pages
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.onclick = async function () {
    // Remove token from localStorage
    localStorage.removeItem("token");
    // Optionally, call backend to invalidate refresh token
    try {
      await fetch("https://alexokoriengobe.onrender.com/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
    } catch (e) {}
    window.location.href = "/admin/login/index.html";
  };
}
