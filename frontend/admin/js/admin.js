// ========== AUTH CHECK ========== //
// --- Token Refresh Logic ---
async function refreshAccessToken() {
  try {
    const res = await fetch(
      "https://alexokoriengobe.onrender.com/api/auth/refresh-token",
      {
        method: "POST",
        credentials: "include", // Important: send cookies!
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
    // If refresh fails, force logout
    localStorage.removeItem("token");
    window.location.href = "login/index.html";
    return null;
  } catch (err) {
    localStorage.removeItem("token");
    window.location.href = "login/index.html";
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
    // Try to refresh token
    token = await refreshAccessToken();
    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
      res = await fetch(url, options); // Retry original request
    }
  }
  return res;
}
if (!localStorage.getItem("token")) {
  window.location.href = "login/index.html";
}

// ========== TESTIMONIALS SECTION WITH PAGINATION ========== //
// ========== ADMIN STATS MANAGEMENT ========== //
const STATS_API_BASE = "https://alexokoriengobe.onrender.com/api/stats";
const STATS_GET_URL = STATS_API_BASE + "/getStats";
const STATS_ADD_URL = STATS_API_BASE + "/addStat";
const STATS_UPDATE_URL = STATS_API_BASE + "/updateStat";
const STATS_DELETE_URL = STATS_API_BASE + "/deleteStat";

async function fetchStats() {
  const res = await authFetch(STATS_GET_URL);
  return await res.json();
}

let deletingStatId = null;

function showDeleteStatModal(statId) {
  deletingStatId = statId;
  const modal = document.getElementById("deleteStatModal");
  if (modal) modal.style.display = "flex";
}

function hideDeleteStatModal() {
  const modal = document.getElementById("deleteStatModal");
  if (modal) modal.style.display = "none";
  deletingStatId = null;
}

async function deleteStatConfirmed() {
  if (!deletingStatId) return;
  const res = await authFetch(`${STATS_DELETE_URL}/${deletingStatId}`, {
    method: "DELETE",
  });
  if (res.ok) {
    hideDeleteStatModal();
    loadStats();
    if (typeof showToast === "function") showToast("Stat deleted successfully", "success");
  } else {
    hideDeleteStatModal();
    if (typeof showToast === "function") showToast("Error deleting stat", "error");
  }
}

function renderStats(stats) {
  const list = document.getElementById("admin-stats-list");
  if (!list) return;
  list.innerHTML = "";
  stats.forEach((stat) => {
    const card = document.createElement("div");
    card.className = "admin-stat-card";
    card.innerHTML = `
      <span class="stat-icon"><i class="fa ${stat.icon}"></i></span>
      <span class="stat-number">${stat.number}</span>
      <span class="stat-label">${stat.label}</span>
      <button class="edit-stat-btn">Edit</button>
      <button class="delete-stat-btn">Delete</button>
    `;
    card.querySelector(".edit-stat-btn").onclick = () => openStatForm(stat);
    card.querySelector(".delete-stat-btn").onclick = () => showDeleteStatModal(stat._id);
    list.appendChild(card);
  });
}

async function loadStats() {
  const stats = await fetchStats();
  renderStats(stats);
}

function openStatForm(stat = {}) {
  document.getElementById("statFormModal").style.display = "flex";
  document.getElementById("statFormTitle").textContent = stat._id
    ? "Edit Stat"
    : "Add Stat";
  const form = document.getElementById("statForm");
  form.icon.value = stat.icon || "";
  form.number.value = stat.number || "";
  form.label.value = stat.label || "";
  form._id.value = stat._id || "";
}

document.getElementById("addStatBtn").onclick = () => openStatForm();
document.getElementById("closeStatForm").onclick = () => {
  document.getElementById("statFormModal").style.display = "none";
};

document.getElementById("statForm").onsubmit = async function (e) {
  e.preventDefault();
  const form = e.target;
  const stat = {
    icon: form.icon.value,
    number: form.number.value,
    label: form.label.value,
  };
  const id = form._id.value;
  let res;
  if (id) {
    res = await authFetch(`${STATS_UPDATE_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stat),
    });
  } else {
    res = await authFetch(STATS_ADD_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stat),
    });
  }
  if (res.ok) {
    document.getElementById("statFormModal").style.display = "none";
    loadStats();
  } else {
    alert("Error saving stat");
  }
};

// Modal HTML for delete confirmation
if (!document.getElementById("deleteStatModal")) {
  const modal = document.createElement("div");
  modal.id = "deleteStatModal";
  modal.style.display = "none";
  modal.style.position = "fixed";
  modal.style.top = 0;
  modal.style.left = 0;
  modal.style.width = "100vw";
  modal.style.height = "100vh";
  modal.style.background = "rgba(0,0,0,0.4)";
  modal.style.alignItems = "center";
  modal.style.justifyContent = "center";
  modal.style.zIndex = 9999;
  modal.innerHTML = `
    <div style="background:#fff;padding:2em 2.5em;border-radius:12px;min-width:260px;display:flex;flex-direction:column;align-items:center;">
      <div style="font-size:1.2em;font-weight:600;margin-bottom:1.2em;">Are you sure you want to delete this stat?</div>
      <div style="display:flex;gap:1em;">
        <button id="confirmDeleteStatBtn" style="background:#e53e3e;color:#fff;border:none;border-radius:8px;padding:0.6em 1.5em;font-size:1em;font-weight:600;">Delete</button>
        <button id="cancelDeleteStatBtn" style="background:#2e3657;color:#fff;border:none;border-radius:8px;padding:0.6em 1.5em;font-size:1em;font-weight:600;">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById("confirmDeleteStatBtn").onclick = deleteStatConfirmed;
  document.getElementById("cancelDeleteStatBtn").onclick = hideDeleteStatModal;
  modal.onclick = function(e) {
    if (e.target === modal) hideDeleteStatModal();
  };
}

// Load stats on dashboard page load
document.addEventListener("DOMContentLoaded", loadStats);

// ========== SLIDER IMAGES ADMIN ========== //
const SLIDER_API_BASE =
  "https://alexokoriengobe.onrender.com/api/slider-images";

// Fetch and display slider images
async function loadSliderImages() {
  const res = await authFetch(`${SLIDER_API_BASE}/getAll`);
  const images = await res.json();
  const list = document.getElementById("slider-images-list");
  if (!list) return;
  list.innerHTML = "";
  images.forEach((img) => {
    const el = document.createElement("div");
    el.innerHTML = `<img src="${img.url}" style="max-width:180px;max-height:100px;margin:0.5em;" /><button data-id="${img._id}">Delete</button>`;
    el.querySelector("button").onclick = async () => {
      await authFetch(`${SLIDER_API_BASE}/${img._id}`, { method: "DELETE" });
      loadSliderImages();
    };
    list.appendChild(el);
  });
}

// Upload slider image
const sliderForm = document.getElementById("slider-upload-form");
if (sliderForm) {
  sliderForm.onsubmit = async function (e) {
    e.preventDefault();
    const formData = new FormData();
    const fileInput = sliderForm.querySelector('input[name="sliderImage"]');
    if (!fileInput.files[0]) {
      showToast("Please select an image.", "error");
      return;
    }
    formData.append("image", fileInput.files[0]);
    const uploadBtn = sliderForm.querySelector('button[type="submit"]');
    let originalText = "";
    if (uploadBtn) {
      originalText = uploadBtn.textContent;
      uploadBtn.disabled = true;
      uploadBtn.textContent = "Uploading...";
    }
    try {
      const response = await authFetch(`${SLIDER_API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to upload image");
      sliderForm.reset();
      loadSliderImages();
    } catch (err) {
      showToast("Upload failed. Please try again.", "error");
    } finally {
      if (uploadBtn) {
        uploadBtn.disabled = false;
        uploadBtn.textContent = originalText || "Upload Image";
      }
    }
  };
  loadSliderImages();
}
const editModal = document.getElementById("editProjectModal");
const closeEditModalBtn = document.getElementById("closeEditModal");
const editProjectForm = document.getElementById("edit-project-form");
let editingProjectId = null;

function openEditModal(project) {
  editingProjectId = project._id;
  document.getElementById("editLocation").value = project.location;
  document.getElementById("editDescription").value = project.description;
  document.getElementById("editText").value = project.text;
  editModal.style.display = "flex";
}

if (closeEditModalBtn) {
  closeEditModalBtn.onclick = () => {
    editModal.style.display = "none";
    editingProjectId = null;
  };
}

if (editModal) {
  window.onclick = function (event) {
    if (event.target === editModal) {
      editModal.style.display = "none";
      editingProjectId = null;
    }
  };
}

if (editProjectForm) {
  editProjectForm.onsubmit = async function (e) {
    e.preventDefault();
    if (!editingProjectId) return;
    const location = document.getElementById("editLocation").value;
    const description = document.getElementById("editDescription").value;
    const text = document.getElementById("editText").value;
    const formData = new FormData();
    formData.append("location", location);
    formData.append("description", description);
    formData.append("text", text);
    await authFetch(`${API_BASE}/editProject/${editingProjectId}`, {
      method: "PUT",
      body: formData,
    });
    editModal.style.display = "none";
    editingProjectId = null;
    loadProjects();
  };
}

// ========== PROJECTS SECTION ========== //
const API_BASE = "https://alexokoriengobe.onrender.com/api/projects";

// Helper: Get token from localStorage (adjust if you use a different method)
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Pagination for projects
let projectPage = 1;
const projectLimit = 5;

// Fetch and display paginated projects
async function loadProjects(page = 1) {
  const res = await authFetch(
    `${API_BASE}/allProjects?page=${page}&limit=${projectLimit}`,
  );
  const data = await res.json();
  const list = document.getElementById("projects-list");
  if (!list) return;
  list.innerHTML = "";
  (data.projects || []).forEach((project) => {
    const el = document.createElement("div");
    el.className = "project-card";
    // Images (2 per row, wrap if more)
    const imagesDiv = document.createElement("div");
    imagesDiv.className = "project-images";
    project.images.forEach((url) => {
      const img = document.createElement("img");
      img.src = url;
      imagesDiv.appendChild(img);
    });
    el.appendChild(imagesDiv);
    // Title
    const title = document.createElement("div");
    title.className = "project-title";
    title.textContent = project.text;
    el.appendChild(title);
    // Description
    const desc = document.createElement("div");
    desc.className = "project-description";
    desc.textContent = project.description;
    el.appendChild(desc);
    // Location
    const loc = document.createElement("div");
    loc.className = "project-location";
    loc.textContent = project.location;
    el.appendChild(loc);
    // Actions
    const actions = document.createElement("div");
    actions.className = "project-actions";
    actions.innerHTML = `
      <button class="edit-btn">Edit</button>
      <button class="delete-btn">Delete</button>
    `;
    el.appendChild(actions);
    // Delete handler using custom modal
    actions.querySelector(".delete-btn").onclick = async () => {
      await authFetch(`${API_BASE}/deleteProject/${project._id}`, {
        method: "DELETE",
      });
      loadProjects(projectPage);
    };
    // Edit handler
    actions.querySelector(".edit-btn").onclick = () => {
      openEditModal(project);
    };
    list.appendChild(el);
  });
  renderProjectPagination(data.totalPages || 1, page);
}

function renderProjectPagination(totalPages, currentPage) {
  let container = document.getElementById("projects-pagination");
  if (!container) {
    container = document.createElement("div");
    container.id = "projects-pagination";
    container.className = "pagination";
    document.getElementById("projects-list").after(container);
  }
  container.innerHTML = "";
  if (totalPages <= 1) return;

  // Prev arrow
  const prevBtn = document.createElement("button");
  prevBtn.innerHTML = "&#8592;";
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => {
    if (currentPage > 1) {
      projectPage = currentPage - 1;
      loadProjects(projectPage);
    }
  };
  container.appendChild(prevBtn);

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = i === currentPage ? "active" : "";
    btn.onclick = () => {
      projectPage = i;
      loadProjects(i);
    };
    container.appendChild(btn);
  }

  // Next arrow
  const nextBtn = document.createElement("button");
  nextBtn.innerHTML = "&#8594;";
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => {
    if (currentPage < totalPages) {
      projectPage = currentPage + 1;
      loadProjects(projectPage);
    }
  };
  container.appendChild(nextBtn);
}

// Add project handler
const projectForm = document.getElementById("project-form");
if (projectForm) {
  const addBtn = projectForm.querySelector('button[type="submit"]');
  projectForm.onsubmit = async function (e) {
    e.preventDefault();
    if (addBtn) {
      addBtn.disabled = true;
      const originalText = addBtn.textContent;
      addBtn.textContent = "Uploading...";
    }
    const formData = new FormData(this);
    // At least 2 images required
    if (formData.getAll("projectImages").length < 2) {
      showToast("Please select at least 2 images.", "error");
      if (addBtn) {
        addBtn.disabled = false;
        addBtn.textContent = "Add Project";
      }
      return;
    }
    // Rename field to 'images' for backend
    const images = formData.getAll("projectImages");
    formData.delete("projectImages");
    images.forEach((img) => formData.append("images", img));
    try {
      await authFetch(`${API_BASE}/addProject`, {
        method: "POST",
        body: formData,
      });
      this.reset();
      loadProjects(1);
    } catch (err) {
      showToast("Upload failed. Please try again.", "error");
    } finally {
      if (addBtn) {
        addBtn.disabled = false;
        addBtn.textContent = "Add Project";
      }
    }
  };
  loadProjects(1);
}
