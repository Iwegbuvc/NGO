// Redirect to login if not authenticated
if (!localStorage.getItem('token')) {
  window.location.href = 'login.html';
}
