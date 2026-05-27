(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var isOpen = mobileNav.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', String(isOpen));
        });
    }

    var carousels = document.querySelectorAll('.hero-carousel');
    carousels.forEach(function (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
        var prev = carousel.querySelector('.hero-prev');
        var next = carousel.querySelector('.hero-next');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });

            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
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

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-target')) || 0);
                start();
            });
        });

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        start();
    });

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    var params = new URLSearchParams(window.location.search);
    var queryFromUrl = params.get('q') || '';
    var filterPanels = document.querySelectorAll('.filter-panel');

    filterPanels.forEach(function (panel) {
        var input = panel.querySelector('.filter-input');
        var selects = Array.prototype.slice.call(panel.querySelectorAll('.filter-select'));
        var results = document.querySelector('.filter-results');
        var emptyState = document.querySelector('.empty-state');

        if (!input || !results) {
            return;
        }

        if (queryFromUrl) {
            input.value = queryFromUrl;
        }

        function applyFilter() {
            var keyword = normalize(input.value);
            var year = selects[0] ? normalize(selects[0].value) : '';
            var genre = selects[1] ? normalize(selects[1].value) : '';
            var cards = Array.prototype.slice.call(results.querySelectorAll('.movie-card'));
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var cardYear = normalize(card.getAttribute('data-year'));
                var cardGenre = normalize(card.getAttribute('data-genre') + ' ' + card.getAttribute('data-tags'));
                var matched = true;

                if (keyword && haystack.indexOf(keyword) === -1) {
                    matched = false;
                }

                if (year && cardYear !== year) {
                    matched = false;
                }

                if (genre && cardGenre.indexOf(genre) === -1) {
                    matched = false;
                }

                card.style.display = matched ? '' : 'none';

                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('is-visible', visible === 0);
            }
        }

        input.addEventListener('input', applyFilter);
        selects.forEach(function (select) {
            select.addEventListener('change', applyFilter);
        });
        applyFilter();
    });
})();
