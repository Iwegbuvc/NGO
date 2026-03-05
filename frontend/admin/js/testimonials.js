// Testimonials Admin Logic
const TESTI_API_BASE = "https://alexokoriengobe.onrender.com/api/testimonials";

// --- Token Refresh Logic (reuse from admin.js if possible) ---
async function refreshAccessToken() {
  try {
    const res = await fetch(
      "https://alexokoriengobe.onrender.com/api/auth/refresh-token",
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      },
    );
    if (res.ok) {
      const data = await res.json();
      if (data.accessToken) {
        localStorage.setItem("token", data.accessToken);
        return data.accessToken;
      }
    }
    localStorage.removeItem("token");
    window.location.href = "../login/index.html";
    return null;
  } catch (err) {
    localStorage.removeItem("token");
    window.location.href = "../login/index.html";
    return null;
  }
}

async function authFetch(url, options = {}) {
  let token = localStorage.getItem("token");
  options.headers = options.headers || {};
  if (token) {
    options.headers["Authorization"] = `Bearer ${token}`;
  }
  let res = await fetch(url, options);
  if (res.status === 401 || res.status === 403) {
    token = await refreshAccessToken();
    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
      res = await fetch(url, options);
    }
  }
  return res;
}

// Load all testimonials
async function loadTestimonials() {
  const res = await authFetch(`${TESTI_API_BASE}/getAllTesti`);
  const data = await res.json();
  const list = document.getElementById("testimonials-list");
  if (!list) return;
  list.innerHTML = "";
  (data.testimonials || []).forEach((testi) => {
    const el = document.createElement("div");
    el.className = "testimonial-card";
    el.innerHTML = `
      <img src="${testi.userImage}" alt="User" style="width:60px;height:60px;border-radius:50%;object-fit:cover;">
      <div class="testimonial-content">
        <div class="testimonial-text">${testi.text}</div>
        <div class="testimonial-meta">
          <span class="testimonial-name">${testi.name}</span> |
          <span class="testimonial-location">${testi.location}</span>
        </div>
        <div class="testimonial-actions">
          <button class="edit-btn">Edit</button>
          <button class="delete-btn">Delete</button>
        </div>
      </div>
    `;
    // Delete
    el.querySelector(".delete-btn").onclick = () => showDeleteModal(testi._id);
    // Edit
    el.querySelector(".edit-btn").onclick = () => openEditModal(testi);
    list.appendChild(el);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadTestimonials();
});

// Add testimonial
const testimonialForm = document.getElementById("testimonial-form");
if (testimonialForm) {
  const addBtn = testimonialForm.querySelector('button[type="submit"]');
  testimonialForm.onsubmit = async function (e) {
    e.preventDefault();
    if (addBtn) {
      addBtn.disabled = true;
      const originalText = addBtn.textContent;
      addBtn.textContent = "Uploading...";
    }
    const formData = new FormData(this);
    try {
      await authFetch(`${TESTI_API_BASE}/addTesti`, {
        method: "POST",
        body: formData,
      });
      this.reset();
      loadTestimonials();
    } catch (err) {
      showToast("Upload failed. Please try again.", "error");
    } finally {
      if (addBtn) {
        addBtn.disabled = false;
        addBtn.textContent = "Add Testimonial";
      }
    }
  };
}

// --- Modal logic for edit/delete (to be implemented in next step) ---
// You can add modal logic for editing and deleting testimonials similar to projects.
