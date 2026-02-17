// Hamburger menu toggle
document.addEventListener("DOMContentLoaded", function () {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navMenu = document.getElementById('navMenu');
  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener('click', function () {
      navMenu.classList.toggle('open');
    });
  }
});
// Swiper JS will be imported from CDN in index.html
// Initialize Swiper after DOM loads

document.addEventListener("DOMContentLoaded", function () {
    // Scroll to Top Button Logic
    const scrollToTopBtn = document.getElementById("scrollToTopBtn");
    const heroSection = document.querySelector(".hero-section");
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
  var swiper = new Swiper(".swiper", {
    loop: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });

  // Testimonial Swiper
  var testimonialSwiper = new Swiper(".testimonial-swiper", {
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
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
