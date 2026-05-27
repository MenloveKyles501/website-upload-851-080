(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function bindMenu() {
    var toggle = document.querySelector(".menu-toggle");
    if (!toggle) {
      return;
    }
    toggle.addEventListener("click", function () {
      var opened = document.body.classList.toggle("menu-open");
      toggle.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  function bindHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    function start() {
      stop();
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
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function bindSearch() {
    document.querySelectorAll("[data-search-scope]").forEach(function (panel) {
      var input = panel.querySelector("[data-search-input]");
      var list = panel.parentElement.querySelector("[data-filter-list]");
      var chips = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-value]"));
      var activeFilter = "all";
      if (!input || !list) {
        return;
      }
      function normalize(value) {
        return String(value || "").trim().toLowerCase();
      }
      function cardText(card) {
        return normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags")
        ].join(" "));
      }
      function apply() {
        var q = normalize(input.value);
        var visible = 0;
        Array.prototype.slice.call(list.querySelectorAll(".movie-card")).forEach(function (card) {
          var matchText = !q || cardText(card).indexOf(q) !== -1;
          var filterText = [
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-tags")
          ].join(" ");
          var matchFilter = activeFilter === "all" || filterText.indexOf(activeFilter) !== -1;
          var show = matchText && matchFilter;
          card.style.display = show ? "" : "none";
          if (show) {
            visible += 1;
          }
        });
        panel.classList.toggle("has-empty", visible === 0);
      }
      input.addEventListener("input", apply);
      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          chips.forEach(function (item) {
            item.classList.remove("is-active");
          });
          chip.classList.add("is-active");
          activeFilter = chip.getAttribute("data-filter-value") || "all";
          apply();
        });
      });
    });
  }

  function bindPlayers() {
    document.querySelectorAll(".player-shell").forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector(".player-start");
      var src = shell.getAttribute("data-play-src");
      var loaded = false;
      var hls = null;
      if (!video || !button || !src) {
        return;
      }
      function attach() {
        if (loaded) {
          return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(src);
          hls.attachMedia(video);
        } else {
          video.src = src;
        }
      }
      function play() {
        attach();
        shell.classList.add("is-playing");
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {
            shell.classList.remove("is-playing");
          });
        }
      }
      button.addEventListener("click", function (event) {
        event.preventDefault();
        play();
      });
      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        if (!video.ended) {
          shell.classList.remove("is-playing");
        }
      });
      video.addEventListener("ended", function () {
        shell.classList.remove("is-playing");
      });
      video.addEventListener("click", function () {
        if (!loaded) {
          play();
        }
      });
      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  }

  ready(function () {
    bindMenu();
    bindHero();
    bindSearch();
    bindPlayers();
  });
})();
