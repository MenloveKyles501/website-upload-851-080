(function () {
  const $ = function (selector, root) {
    return (root || document).querySelector(selector);
  };

  const $$ = function (selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  };

  function initMenu() {
    const button = $('[data-nav-toggle]');
    const panel = $('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    const hero = $('[data-hero]');
    if (!hero) {
      return;
    }
    const slides = $$('[data-hero-slide]', hero);
    const dots = $$('[data-hero-dot]', hero);
    const prev = $('[data-hero-prev]', hero);
    const next = $('[data-hero-next]', hero);
    let active = 0;
    let timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        start();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initRails() {
    $$('.rail-block').forEach(function (block) {
      const rail = $('[data-scroll-rail]', block);
      const left = $('[data-scroll-left]', block);
      const right = $('[data-scroll-right]', block);
      if (!rail) {
        return;
      }
      if (left) {
        left.addEventListener('click', function () {
          rail.scrollBy({ left: -420, behavior: 'smooth' });
        });
      }
      if (right) {
        right.addEventListener('click', function () {
          rail.scrollBy({ left: 420, behavior: 'smooth' });
        });
      }
    });
  }

  function initFilterPanel() {
    const panel = $('[data-filter-panel]');
    const list = $('[data-filter-list]');
    if (!panel || !list) {
      return;
    }
    const cards = $$('[data-card]', list);
    const empty = $('[data-filter-empty]');
    const search = $('[data-filter-search]', panel);
    const state = {
      year: 'all',
      region: 'all',
      type: 'all',
      text: ''
    };

    function matches(card) {
      const text = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-type'),
        card.getAttribute('data-tags')
      ].join(' ').toLowerCase();
      const year = card.getAttribute('data-year');
      const region = card.getAttribute('data-region');
      const type = card.getAttribute('data-type');
      if (state.year !== 'all' && String(year) !== String(state.year)) {
        return false;
      }
      if (state.region !== 'all' && String(region) !== String(state.region)) {
        return false;
      }
      if (state.type !== 'all' && String(type) !== String(state.type)) {
        return false;
      }
      if (state.text && text.indexOf(state.text) === -1) {
        return false;
      }
      return true;
    }

    function apply() {
      let visible = 0;
      cards.forEach(function (card) {
        const ok = matches(card);
        card.classList.toggle('is-hidden', !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    $$('[data-filter-group]', panel).forEach(function (group) {
      const key = group.getAttribute('data-filter-group');
      $$('[data-filter-value]', group).forEach(function (button) {
        button.addEventListener('click', function () {
          state[key] = button.getAttribute('data-filter-value');
          $$('[data-filter-value]', group).forEach(function (item) {
            item.classList.toggle('active', item === button);
          });
          apply();
        });
      });
    });

    if (search) {
      search.addEventListener('input', function () {
        state.text = search.value.trim().toLowerCase();
        apply();
      });
    }
  }

  function htmlEscape(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function cardHtml(movie) {
    return [
      '<a class="movie-card grid" href="./' + htmlEscape(movie.file) + '">',
      '<span class="poster-wrap">',
      '<img src="' + htmlEscape(movie.cover) + '" alt="' + htmlEscape(movie.title) + '" loading="lazy">',
      '<span class="poster-badge">' + htmlEscape(movie.year) + '</span>',
      '</span>',
      '<span class="card-body">',
      '<strong>' + htmlEscape(movie.title) + '</strong>',
      '<span class="card-line">' + htmlEscape(movie.oneLine) + '</span>',
      '<span class="card-meta"><em>' + htmlEscape(movie.region) + '</em><em>' + htmlEscape(movie.type) + '</em></span>',
      '</span>',
      '</a>'
    ].join('');
  }

  function initSearchPage() {
    const results = $('[data-search-results]');
    const form = $('[data-search-form]');
    const input = $('[data-search-input]');
    const title = $('[data-search-title]');
    if (!results || !form || !input || !window.MOVIE_INDEX) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const initial = params.get('q') || '';
    input.value = initial;

    function render(query) {
      const keyword = query.trim().toLowerCase();
      if (!keyword) {
        return;
      }
      const matched = window.MOVIE_INDEX.filter(function (movie) {
        return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine]
          .join(' ')
          .toLowerCase()
          .indexOf(keyword) !== -1;
      }).slice(0, 240);
      if (title) {
        title.textContent = '搜索结果：' + query;
      }
      results.innerHTML = matched.length ? matched.map(cardHtml).join('') : '<div class="empty-state is-visible">未找到相关内容</div>';
    }

    form.addEventListener('submit', function (event) {
      const query = input.value.trim();
      if (!query) {
        return;
      }
      event.preventDefault();
      history.replaceState(null, '', './search.html?q=' + encodeURIComponent(query));
      render(query);
    });

    if (initial) {
      render(initial);
    }
  }

  initMenu();
  initHero();
  initRails();
  initFilterPanel();
  initSearchPage();
})();
