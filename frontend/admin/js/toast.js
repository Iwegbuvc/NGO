// Toast notification system for admin panel
// Usage: showToast('Message', 'error'|'success'|'info')
(function () {
  const style = document.createElement("style");
  style.textContent = `
    .toast {
      position: fixed;
      bottom: 32px;
      left: 50%;
      transform: translateX(-50%);
      min-width: 220px;
      max-width: 90vw;
      background: #2e3657;
      color: #fff;
      padding: 1em 2em;
      border-radius: 8px;
      box-shadow: 0 2px 16px rgba(30,40,90,0.15);
      font-size: 1.1em;
      z-index: 9999;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s, bottom 0.3s;
    }
    .toast.show {
      opacity: 1;
      pointer-events: auto;
      bottom: 48px;
    }
    .toast.error { background: #e53e3e; }
    .toast.success { background: #22c55e; }
    .toast.info { background: #2563eb; }
  `;
  document.head.appendChild(style);

  window.showToast = function (msg, type = "info") {
    let toast = document.querySelector(".toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.className = "toast " + type;
    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3200);
  };
})();
