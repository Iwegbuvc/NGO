// Responsive admin hamburger/side menu logic
document.addEventListener("DOMContentLoaded", function () {
  const hamburgerBtn = document.getElementById("adminHamburgerBtn");
  const mobileNav = document.getElementById("adminMobileNav");
  const navOverlay = document.getElementById("adminNavOverlay");
  const closeNavBtn = document.getElementById("closeAdminNavBtn");

  if (hamburgerBtn && mobileNav && navOverlay) {
    hamburgerBtn.addEventListener("click", function () {
      mobileNav.classList.add("active");
      navOverlay.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  }
  function closeSidebar() {
    mobileNav.classList.remove("active");
    navOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }
  if (closeNavBtn) {
    closeNavBtn.addEventListener("click", closeSidebar);
  }
  if (navOverlay) {
    navOverlay.addEventListener("click", closeSidebar);
  }
  // Logout for mobile
  const logoutBtnMobile = document.getElementById("logoutBtnMobile");
  if (logoutBtnMobile) {
    logoutBtnMobile.onclick = function () {
      localStorage.removeItem("token");
      window.location.href = "/admin/login/index.html";
    };
  }
});
