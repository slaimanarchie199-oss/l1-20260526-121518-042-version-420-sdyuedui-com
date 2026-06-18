(function () {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
      menuButton.textContent = mobilePanel.classList.contains("is-open") ? "×" : "☰";
    });
  }

  document.querySelectorAll("[data-site-search]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const input = form.querySelector("input[name='q']");
      const keyword = input ? input.value.trim() : "";
      if (keyword) {
        window.location.href = "./search.html?q=" + encodeURIComponent(keyword);
      }
    });
  });

  document.querySelectorAll("[data-filter-input]").forEach(function (input) {
    const target = document.querySelector(input.getAttribute("data-filter-target"));
    const countNode = document.querySelector(input.getAttribute("data-filter-count"));
    if (!target) {
      return;
    }

    const cards = Array.prototype.slice.call(target.querySelectorAll(".movie-card"));

    function updateCards() {
      const keyword = input.value.trim().toLowerCase();
      let visible = 0;

      cards.forEach(function (card) {
        const text = (card.getAttribute("data-search") || "").toLowerCase();
        const matched = !keyword || text.indexOf(keyword) !== -1;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (countNode) {
        countNode.textContent = "当前显示 " + visible + " 部";
      }
    }

    input.addEventListener("input", updateCards);
    updateCards();
  });

  document.querySelectorAll(".hero-slider").forEach(function (slider) {
    const slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    const dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dots button"));
    let index = 0;
    let timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    showSlide(0);
    start();
  });
})();
