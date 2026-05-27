(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    var slider = document.querySelector(".hero-slider");
    if (slider) {
      slider.addEventListener("mouseenter", stop);
      slider.addEventListener("mouseleave", start);
    }

    show(0);
    start();
  }

  function initFiltering() {
    var root = document.querySelector("[data-filter-root]");
    if (!root) {
      return;
    }
    var input = root.querySelector("[data-filter-input]");
    var genre = root.querySelector("[data-filter-genre]");
    var year = root.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(root.querySelectorAll(".movie-card"));
    var count = root.querySelector("[data-result-count]");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (input && query) {
      input.value = query;
    }

    function textOf(card, name) {
      return (card.getAttribute(name) || "").toLowerCase();
    }

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var genreValue = genre ? genre.value : "";
      var yearValue = year ? year.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [
          textOf(card, "data-title"),
          textOf(card, "data-genre"),
          textOf(card, "data-region"),
          textOf(card, "data-type"),
          textOf(card, "data-year")
        ].join(" ");
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchGenre = !genreValue || textOf(card, "data-genre").indexOf(genreValue.toLowerCase()) !== -1;
        var matchYear = !yearValue || textOf(card, "data-year").indexOf(yearValue.toLowerCase()) !== -1;
        var visibleCard = matchKeyword && matchGenre && matchYear;
        card.classList.toggle("hide-card", !visibleCard);
        if (visibleCard) {
          visible += 1;
        }
      });
      if (count) {
        count.textContent = "已显示 " + visible + " 部影片";
      }
    }

    [input, genre, year].forEach(function (item) {
      if (item) {
        item.addEventListener("input", apply);
        item.addEventListener("change", apply);
      }
    });
    apply();
  }

  function loadHls() {
    return new Promise(function (resolve, reject) {
      if (window.Hls) {
        resolve(window.Hls);
        return;
      }
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js";
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function initPlayer() {
    var video = document.querySelector("video[data-stream]");
    if (!video) {
      return;
    }
    var overlay = document.querySelector("[data-play-overlay]");
    var stream = video.getAttribute("data-stream");
    var attached = false;

    function attach() {
      if (attached || !stream) {
        return Promise.resolve();
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        return Promise.resolve();
      }
      return loadHls().then(function (Hls) {
        if (Hls && Hls.isSupported()) {
          var hls = new Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          video._hls = hls;
        } else {
          video.src = stream;
        }
      }).catch(function () {
        video.src = stream;
      });
    }

    function play() {
      attach().then(function () {
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            video.controls = true;
          });
        }
      });
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("hidden");
      }
    });
    video.addEventListener("pause", function () {
      if (overlay && video.currentTime < 1) {
        overlay.classList.remove("hidden");
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFiltering();
    initPlayer();
  });
})();
