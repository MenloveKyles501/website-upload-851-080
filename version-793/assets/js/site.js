(function() {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function openSearch(form) {
    form.addEventListener("submit", function(event) {
      var input = form.querySelector("input[name='q']");
      if (!input) {
        return;
      }
      var value = input.value.trim();
      if (!value) {
        return;
      }
      event.preventDefault();
      var target = form.getAttribute("action") || "search.html";
      window.location.href = target + "?q=" + encodeURIComponent(value);
    });
  }

  function activateHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

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
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function move(step) {
      show(index + step);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function() {
        move(1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function() {
        move(-1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function() {
        move(1);
        restart();
      });
    }

    dots.forEach(function(dot, dotIndex) {
      dot.addEventListener("click", function() {
        show(dotIndex);
        restart();
      });
    });

    show(0);
    restart();
  }

  function activateFilters() {
    var shells = Array.prototype.slice.call(document.querySelectorAll("[data-filter-shell]"));
    shells.forEach(function(shell) {
      var input = shell.querySelector("[data-filter-input]");
      var year = shell.querySelector("[data-filter-year]");
      var type = shell.querySelector("[data-filter-type]");
      var cards = Array.prototype.slice.call(shell.querySelectorAll("[data-card]"));
      var reset = shell.querySelector("[data-filter-reset]");
      var empty = shell.querySelector("[data-empty]");

      function filter() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var yearValue = year ? year.value : "";
        var typeValue = type ? type.value : "";
        var visible = 0;

        cards.forEach(function(card) {
          var text = (card.getAttribute("data-text") || "").toLowerCase();
          var cardYear = card.getAttribute("data-year") || "";
          var cardType = card.getAttribute("data-type") || "";
          var matched = true;

          if (keyword && text.indexOf(keyword) === -1) {
            matched = false;
          }
          if (yearValue && cardYear !== yearValue) {
            matched = false;
          }
          if (typeValue && cardType !== typeValue) {
            matched = false;
          }

          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [input, year, type].forEach(function(control) {
        if (control) {
          control.addEventListener("input", filter);
          control.addEventListener("change", filter);
        }
      });

      if (reset) {
        reset.addEventListener("click", function() {
          if (input) {
            input.value = "";
          }
          if (year) {
            year.value = "";
          }
          if (type) {
            type.value = "";
          }
          filter();
        });
      }

      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q && input) {
        input.value = q;
      }

      filter();
    });
  }

  function activateMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener("click", function() {
      panel.classList.toggle("is-open");
    });
  }

  function activatePlayer() {
    var video = document.querySelector("[data-player]");
    if (!video) {
      return;
    }

    var layer = document.querySelector("[data-player-cover]");
    var button = document.querySelector("[data-play-button]");
    var note = document.querySelector("[data-player-note]");
    var streamUrl = video.getAttribute("data-stream");
    var prepared = false;

    function prepare() {
      if (prepared || !streamUrl) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        window.__activeHls = hls;
      } else {
        video.src = streamUrl;
      }

      prepared = true;
    }

    function play() {
      prepare();
      if (layer) {
        layer.classList.add("is-hidden");
      }
      var task = video.play();
      if (task && typeof task.catch === "function") {
        task.catch(function() {
          if (layer) {
            layer.classList.remove("is-hidden");
          }
          if (note) {
            note.textContent = "播放加载失败，请稍后重试。";
          }
        });
      }
    }

    if (button) {
      button.addEventListener("click", play);
    }

    if (layer) {
      layer.addEventListener("click", function(event) {
        if (event.target === layer) {
          play();
        }
      });
    }

    video.addEventListener("play", function() {
      if (layer) {
        layer.classList.add("is-hidden");
      }
    });
  }

  ready(function() {
    Array.prototype.slice.call(document.querySelectorAll("[data-site-search]")).forEach(openSearch);
    activateMobileMenu();
    activateHero();
    activateFilters();
    activatePlayer();
  });
})();
