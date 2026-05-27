
(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        stop();
        show(Number(dot.getAttribute("data-slide")) || 0);
        start();
      });
    });

    start();
  }

  function setupFilters() {
    var search = document.querySelector(".site-search");
    var filters = Array.prototype.slice.call(document.querySelectorAll(".site-filter"));
    var reset = document.querySelector(".filter-reset");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    if (!cards.length || (!search && !filters.length)) {
      return;
    }

    function apply() {
      var query = search ? search.value.trim().toLowerCase() : "";
      var typeValue = "";
      var yearValue = "";
      filters.forEach(function (select) {
        if (select.getAttribute("data-filter") === "type") {
          typeValue = select.value;
        }
        if (select.getAttribute("data-filter") === "year") {
          yearValue = select.value;
        }
      });
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-keywords") || "",
          card.getAttribute("data-region") || "",
          card.getAttribute("data-type") || ""
        ].join(" ").toLowerCase();
        var cardType = card.getAttribute("data-type") || "";
        var cardYear = Number(card.getAttribute("data-year") || "0");
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchType = !typeValue || cardType === typeValue;
        var matchYear = !yearValue || cardYear >= Number(yearValue);
        card.classList.toggle("is-hidden", !(matchQuery && matchType && matchYear));
      });
    }

    if (search) {
      search.addEventListener("input", apply);
    }
    filters.forEach(function (select) {
      select.addEventListener("change", apply);
    });
    if (reset) {
      reset.addEventListener("click", function () {
        if (search) {
          search.value = "";
        }
        filters.forEach(function (select) {
          select.value = "";
        });
        apply();
      });
    }
  }

  window.initMoviePlayer = function (source) {
    var video = document.getElementById("movie-player");
    var overlay = document.getElementById("movie-cover");
    var button = document.getElementById("movie-play");
    var errorBox = document.getElementById("movie-error");
    var readyToPlay = false;
    var hlsInstance = null;

    if (!video || !source) {
      return;
    }

    function showError() {
      if (errorBox) {
        errorBox.hidden = false;
      }
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    function prepare() {
      if (readyToPlay) {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            hlsInstance.destroy();
            showError();
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        showError();
      }
      readyToPlay = true;
    }

    function play() {
      prepare();
      hideOverlay();
      video.controls = true;
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          showError();
        });
      }
    }

    function toggle() {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }
    if (button) {
      button.addEventListener("click", toggle);
    }
    video.addEventListener("click", toggle);
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    setupNavigation();
    setupHero();
    setupFilters();
  });
})();
