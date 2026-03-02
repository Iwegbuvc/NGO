// ========== TESTIMONIALS SECTION WITH PAGINATION ========== //
const TESTI_API_BASE = "https://alexokoriengobe.onrender.com/api/testimonials";
let testiPage = 1;
const testiLimit = 5;

// Load all testimonials (paginated)
async function loadTestimonials(page = 1) {
  const res = await authFetch(
    `${TESTI_API_BASE}/getAllTesti?page=${page}&limit=${testiLimit}`,
  );
  const data = await res.json();
  const testimonials = data.testimonials || [];
  const totalPages = data.totalPages || 1;
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
    el.querySelector(".delete-btn").onclick = () =>
      showDeleteTestiModal(testi._id);
    el.querySelector(".edit-btn").onclick = () => openEditTestiModal(testi);
    list.appendChild(el);
  });
  // ========== Delete Testimonial Modal Logic (Global) ==========
  const deleteTestiModal = document.getElementById("deleteTestiModal");
  const closeDeleteTestiModalBtn = document.getElementById(
    "closeDeleteTestiModal",
  );
  const cancelDeleteTestiBtn = document.getElementById("cancelDeleteTestiBtn");
  const confirmDeleteTestiBtn = document.getElementById(
    "confirmDeleteTestiBtn",
  );
  let deletingTestiId = null;

  function showDeleteTestiModal(testiId) {
    deletingTestiId = testiId;
    if (deleteTestiModal) deleteTestiModal.style.display = "flex";
  }

  if (closeDeleteTestiModalBtn) {
    closeDeleteTestiModalBtn.onclick = () => {
      deleteTestiModal.style.display = "none";
      deletingTestiId = null;
    };
  }
  if (cancelDeleteTestiBtn) {
    cancelDeleteTestiBtn.onclick = () => {
      deleteTestiModal.style.display = "none";
      deletingTestiId = null;
    };
  }
  if (confirmDeleteTestiBtn) {
    confirmDeleteTestiBtn.onclick = async () => {
      if (!deletingTestiId) return;
      try {
        const response = await authFetch(
          `${TESTI_API_BASE}/delete/${deletingTestiId}`,
          {
            method: "DELETE",
          },
        );
        if (!response.ok) throw new Error("Failed to delete testimonial");
        deleteTestiModal.style.display = "none";
        deletingTestiId = null;
        loadTestimonials(testiPage);
      } catch (err) {
        showToast("Delete failed. Please try again.", "error");
      }
    };
  }

  // ========== Edit Testimonial Modal Logic (Global) ==========
  const editTestiModal = document.getElementById("editTestiModal");
  const closeEditTestiModalBtn = document.getElementById("closeEditTestiModal");
  const editTestimonialForm = document.getElementById("edit-testimonial-form");
  let editingTestiId = null;

  function openEditTestiModal(testi) {
    if (!editTestiModal || !editTestimonialForm) return;
    editingTestiId = testi._id;
    document.getElementById("editTestiId").value = testi._id;
    document.getElementById("editTestiName").value = testi.name;
    document.getElementById("editTestiLocation").value = testi.location;
    document.getElementById("editTestiText").value = testi.text;
    editTestiModal.style.display = "flex";
  }

  if (closeEditTestiModalBtn) {
    closeEditTestiModalBtn.onclick = () => {
      editTestiModal.style.display = "none";
      editingTestiId = null;
    };
  }

  if (editTestiModal) {
    window.addEventListener("click", function (event) {
      if (event.target === editTestiModal) {
        editTestiModal.style.display = "none";
        editingTestiId = null;
      }
    });
  }

  if (editTestimonialForm) {
    editTestimonialForm.onsubmit = async function (e) {
      e.preventDefault();
      if (!editingTestiId) return;
      const name = document.getElementById("editTestiName").value;
      const location = document.getElementById("editTestiLocation").value;
      const text = document.getElementById("editTestiText").value;
      const userImageInput = editTestimonialForm.querySelector(
        'input[name="userImage"]',
      );
      const formData = new FormData();
      formData.append("name", name);
      formData.append("location", location);
      formData.append("text", text);
      if (userImageInput && userImageInput.files[0]) {
        formData.append("userImage", userImageInput.files[0]);
      }
      const saveBtn = editTestimonialForm.querySelector(
        'button[type="submit"]',
      );
      let originalText = "";
      if (saveBtn) {
        originalText = saveBtn.textContent;
        saveBtn.disabled = true;
        saveBtn.textContent = "Uploading...";
        // Force reflow to ensure text updates immediately
        saveBtn.offsetWidth;
      }
      try {
        const response = await authFetch(
          `${TESTI_API_BASE}/edit/${editingTestiId}`,
          {
            method: "PUT",
            body: formData,
          },
        );
        if (!response.ok) throw new Error("Failed to update testimonial");
        editTestiModal.style.display = "none";
        editingTestiId = null;
        loadTestimonials(testiPage);
      } catch (err) {
        showToast("Update failed. Please try again.", "error");
      } finally {
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.textContent = originalText || "Save Changes";
        }
      }
    };
  }
  renderTestiPagination(totalPages, page);
}

function renderTestiPagination(totalPages, currentPage) {
  let container = document.getElementById("testimonials-pagination");
  if (!container) {
    container = document.createElement("div");
    container.id = "testimonials-pagination";
    container.className = "pagination";
    document.getElementById("testimonials-list").after(container);
  }
  container.innerHTML = "";
  if (totalPages <= 1) return;

  // Prev arrow
  const prevBtn = document.createElement("button");
  prevBtn.innerHTML = "&#8592;";
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => {
    if (currentPage > 1) {
      testiPage = currentPage - 1;
      loadTestimonials(testiPage);
    }
  };
  container.appendChild(prevBtn);

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = i === currentPage ? "active" : "";
    btn.onclick = () => {
      testiPage = i;
      loadTestimonials(i);
    };
    container.appendChild(btn);
  }

  // Next arrow
  const nextBtn = document.createElement("button");
  nextBtn.innerHTML = "&#8594;";
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => {
    if (currentPage < totalPages) {
      testiPage = currentPage + 1;
      loadTestimonials(testiPage);
    }
  };
  container.appendChild(nextBtn);
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("testimonials-list")) loadTestimonials();
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
      loadTestimonials(1);
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
    window.location.href = "login.html";
    return null;
  } catch (err) {
    localStorage.removeItem("token");
    window.location.href = "login.html";
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
  window.location.href = "login.html";
}

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
    if (!fileInput.files[0]) { showToast("Please select an image.", "error"); return; }
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
