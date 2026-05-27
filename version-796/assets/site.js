(function () {
  function $(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function $all(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = $('[data-menu-button]');
    var panel = $('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var carousel = $('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = $all('[data-hero-slide]', carousel);
    var dots = $all('[data-hero-dot]', carousel);
    var prev = $('[data-hero-prev]', carousel);
    var next = $('[data-hero-next]', carousel);
    var index = 0;
    var timer = null;

    function show(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        play();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        play();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', play);
    show(0);
    play();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initFilters() {
    $all('[data-filter-form]').forEach(function (form) {
      var list = form.parentElement.querySelector('[data-filter-list]');
      if (!list) {
        return;
      }
      var cards = $all('.movie-card', list);
      var searchInput = $('[data-filter-search]', form);
      var categorySelect = $('[data-filter-category]', form);
      var typeSelect = $('[data-filter-type]', form);
      var regionSelect = $('[data-filter-region]', form);
      var yearSelect = $('[data-filter-year]', form);
      var state = form.parentElement.querySelector('[data-filter-state]');
      var params = new URLSearchParams(window.location.search);
      var incoming = params.get('q');
      if (incoming && searchInput) {
        searchInput.value = incoming;
      }

      function apply() {
        var q = normalize(searchInput && searchInput.value);
        var category = normalize(categorySelect && categorySelect.value);
        var type = normalize(typeSelect && typeSelect.value);
        var region = normalize(regionSelect && regionSelect.value);
        var year = normalize(yearSelect && yearSelect.value);
        var visible = 0;
        cards.forEach(function (card) {
          var keywords = normalize(card.getAttribute('data-keywords') + ' ' + card.textContent);
          var ok = true;
          if (q && keywords.indexOf(q) === -1) {
            ok = false;
          }
          if (category && normalize(card.getAttribute('data-category')) !== category) {
            ok = false;
          }
          if (type && normalize(card.getAttribute('data-type')) !== type) {
            ok = false;
          }
          if (region && normalize(card.getAttribute('data-region')) !== region) {
            ok = false;
          }
          if (year && normalize(card.getAttribute('data-year')) !== year) {
            ok = false;
          }
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });
        if (state) {
          state.textContent = visible > 0 ? '筛选结果已更新' : '没有找到匹配内容';
        }
      }

      form.addEventListener('submit', function (event) {
        event.preventDefault();
        apply();
      });
      [searchInput, categorySelect, typeSelect, regionSelect, yearSelect].forEach(function (element) {
        if (element) {
          element.addEventListener('input', apply);
          element.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  window.initMoviePlayer = function (source) {
    var video = $('.movie-player');
    var overlay = $('.player-overlay');
    if (!video || !source) {
      return;
    }
    var hls = null;
    var ready = false;

    function bind() {
      if (ready) {
        return true;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        ready = true;
        return true;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
        ready = true;
        return true;
      }
      return false;
    }

    function play() {
      if (!bind()) {
        return;
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
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
      overlay.addEventListener('click', play);
    }

    video.addEventListener('click', function (event) {
      if (event.target === video) {
        toggle();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (overlay && video.currentTime < 0.2) {
        overlay.classList.remove('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
