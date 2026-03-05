// Redirect to login if not authenticated
if (!localStorage.getItem("token")) {
  var path = window.location.pathname;
  // Always redirect to ../login/index.html from any admin subpage
  if (path.match(/\/admin\/(.+)\/index\.html/)) {
    window.location.href = "../login/index.html";
  } else {
    // If on /admin/index.html, redirect to login in same folder
    window.location.href = "login/index.html";
  }
}
