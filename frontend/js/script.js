// Hamburger/Sidebar Mobile Nav
document.addEventListener("DOMContentLoaded", function () {
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const mobileNav = document.getElementById("mobileNav");
  const navOverlay = document.getElementById("navOverlay");
  const closeNavBtn = document.getElementById("closeNavBtn");
  // Open sidebar
  if (hamburgerBtn && mobileNav && navOverlay) {
    hamburgerBtn.addEventListener("click", function () {
      mobileNav.classList.add("active");
      navOverlay.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  }
  // Close sidebar
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
});
// Swiper JS will be imported from CDN in index.html
// Initialize Swiper after DOM loads

document.addEventListener("DOMContentLoaded", function () {
  // Scroll to Top Button Logic (guarded)
  const scrollToTopBtn = document.getElementById("scrollToTopBtn");
  const heroSection = document.querySelector(".hero-section");
  if (scrollToTopBtn) {
    function checkScroll() {
      let show = false;
      if (heroSection) {
        const heroBottom = heroSection.getBoundingClientRect().bottom;
        show = heroBottom < 0;
      } else {
        show = window.scrollY > 300;
      }
      if (show) {
        scrollToTopBtn.classList.add("show");
      } else {
        scrollToTopBtn.classList.remove("show");
      }
    }
    window.addEventListener("scroll", checkScroll);
    scrollToTopBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    checkScroll();
  }

  // Dynamically load slider images from backend
  fetch("https://alexokoriengobe.onrender.com/api/slider-images/getAll")
    .then((res) => res.json())
    .then((images) => {
      const wrapper = document.getElementById("slider-swiper-wrapper");
      if (wrapper) {
        wrapper.innerHTML = "";
        images.forEach((img) => {
          const slide = document.createElement("div");
          slide.className = "swiper-slide";
          slide.innerHTML = `<img src="${img.url}" alt="Slider Image" />`;
          wrapper.appendChild(slide);
        });
        // Re-init Swiper after DOM update
        new Swiper(".main-swiper", {
          loop: true,
          autoplay: {
            delay: 3000,
            disableOnInteraction: false,
          },
          pagination: {
            el: ".main-swiper .swiper-pagination",
            clickable: true,
          },
        });
      }
    });

  // Dynamically load testimonials from backend
  fetch(
    "https://alexokoriengobe.onrender.com/api/testimonials/getAllTesti?page=1&limit=10",
    {
      headers: {
        Authorization: localStorage.getItem("token")
          ? `Bearer ${localStorage.getItem("token")}`
          : undefined,
      },
    },
  )
    .then((res) => res.json())
    .then((data) => {
      const testimonials = data.testimonials || [];
      const wrapper = document.getElementById("testimonial-swiper-wrapper");
      if (wrapper) {
        wrapper.innerHTML = "";
        testimonials.forEach((testi) => {
          const slide = document.createElement("div");
          slide.className = "swiper-slide";
          slide.innerHTML = `
            <div class="testimonial-card">
              <div class="testimonial-quote">&#10077;</div>
              <div class="testimonial-text">${testi.text}</div>
              <div class="testimonial-user-row">
                <img class="testimonial-avatar" src="${testi.userImage}" alt="${testi.name}" />
                <div class="testimonial-user-info">
                  <div class="testimonial-name">${testi.name}</div>
                  <div class="testimonial-location">${testi.location}</div>
                </div>
              </div>
            </div>
          `;
          wrapper.appendChild(slide);
        });
        // Re-init Swiper after DOM update
        new Swiper(".testimonial-swiper", {
          loop: true,
          autoplay: false,
          slidesPerView: 1,
          spaceBetween: 30,
          pagination: {
            el: ".testimonial-swiper .swiper-pagination",
            type: "fraction",
          },
          navigation: {
            nextEl: ".testimonial-swiper .swiper-button-next",
            prevEl: ".testimonial-swiper .swiper-button-prev",
          },
          breakpoints: {
            768: {
              slidesPerView: 2,
            },
          },
        });
      }
    });
  // Testimonial modal logic
  //   const testimonialSlides = document.querySelectorAll(".testimonial-slide img");
  //   const modal = document.getElementById("testimonialModal");
  //   const modalText = document.getElementById("testimonialText");
  //   const closeModal = document.getElementById("closeModal");

  //   testimonialSlides.forEach((img) => {
  //     img.addEventListener("click", function () {
  //       const content = img.parentElement.getAttribute("data-content");
  //       modalText.textContent = content;
  //       modal.style.display = "flex";
  //     });
  //   });

  //   closeModal.addEventListener("click", function () {
  //     modal.style.display = "none";
  //   });

  //   window.addEventListener("click", function (e) {
});

// Fade-in animation for main sections
window.addEventListener("DOMContentLoaded", function () {
  const fadeSections = document.querySelectorAll(
    ".about-section, .projects-grid, .testimonial-section, .contact-section",
  );
  fadeSections.forEach((section, i) => {
    setTimeout(
      () => {
        section.style.opacity = "1";
        section.style.transform = "none";
      },
      200 + i * 200,
    );
  });
});
