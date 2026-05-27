(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuToggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuToggle && mobileNav) {
      menuToggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
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

      function schedule() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          schedule();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          schedule();
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
          schedule();
        });
      });

      show(0);
      schedule();
    }

    var searchPanel = document.querySelector("[data-search-panel]");

    if (searchPanel) {
      var input = document.querySelector("[data-search-input]");
      var clear = document.querySelector("[data-search-clear]");
      var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-category]"));
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
      var activeCategory = "all";

      function normalize(value) {
        return String(value || "").toLowerCase().trim();
      }

      function render() {
        var query = normalize(input ? input.value : "");

        cards.forEach(function (card) {
          var category = card.getAttribute("data-category") || "";
          var text = normalize(card.getAttribute("data-search"));
          var categoryOk = activeCategory === "all" || category === activeCategory;
          var queryOk = !query || text.indexOf(query) !== -1;
          card.classList.toggle("is-hidden", !(categoryOk && queryOk));
        });
      }

      if (input) {
        input.addEventListener("input", render);
      }

      if (clear) {
        clear.addEventListener("click", function () {
          if (input) {
            input.value = "";
            input.focus();
          }
          render();
        });
      }

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          activeCategory = button.getAttribute("data-filter-category") || "all";
          buttons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          render();
        });
      });

      render();
    }
  });
})();
