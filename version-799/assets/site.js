(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");

        if (toggle && menu) {
            toggle.addEventListener("click", function () {
                menu.classList.toggle("is-open");
            });
        }

        initHeroCarousel();
        initMovieFilters();
    });

    function initHeroCarousel() {
        var slider = document.querySelector("[data-hero-slider]");

        if (!slider) {
            return;
        }

        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
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

        function start() {
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

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var nextIndex = Number(dot.getAttribute("data-hero-dot"));
                show(nextIndex);
                start();
            });
        });

        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initMovieFilters() {
        var panel = document.querySelector("[data-filter-panel]");
        var list = document.querySelector("[data-filter-list]");

        if (!panel || !list) {
            return;
        }

        var input = panel.querySelector("[data-filter-input]");
        var typeSelect = panel.querySelector("[data-filter-type]");
        var yearSelect = panel.querySelector("[data-filter-year]");
        var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));

        function yearMatches(cardYear, selectedYear) {
            var year = Number(cardYear);

            if (!selectedYear) {
                return true;
            }

            if (selectedYear === "classic") {
                return year > 0 && year < 2000;
            }

            if (selectedYear === "2010") {
                return year >= 2010 && year <= 2019;
            }

            if (selectedYear === "2000") {
                return year >= 2000 && year <= 2009;
            }

            return String(cardYear).indexOf(selectedYear) !== -1;
        }

        function applyFilters() {
            var keyword = (input && input.value ? input.value : "").trim().toLowerCase();
            var typeValue = typeSelect && typeSelect.value ? typeSelect.value : "";
            var yearValue = yearSelect && yearSelect.value ? yearSelect.value : "";

            cards.forEach(function (card) {
                var title = card.getAttribute("data-title") || "";
                var region = card.getAttribute("data-region") || "";
                var type = card.getAttribute("data-type") || "";
                var year = card.getAttribute("data-year") || "";
                var genre = card.getAttribute("data-genre") || "";
                var tags = card.getAttribute("data-tags") || "";
                var text = [title, region, type, year, genre, tags, card.textContent].join(" ").toLowerCase();
                var keywordOk = !keyword || text.indexOf(keyword) !== -1;
                var typeOk = !typeValue || type.indexOf(typeValue) !== -1;
                var yearOk = yearMatches(year, yearValue);

                card.classList.toggle("is-hidden", !(keywordOk && typeOk && yearOk));
            });
        }

        if (input) {
            input.addEventListener("input", applyFilters);
        }

        if (typeSelect) {
            typeSelect.addEventListener("change", applyFilters);
        }

        if (yearSelect) {
            yearSelect.addEventListener("change", applyFilters);
        }

        applyFilters();
    }

    window.setupMoviePlayer = function (videoId, buttonId, source) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);

        if (!video || !button || !source) {
            return;
        }

        var attached = false;
        var hlsInstance = null;

        function attach() {
            if (attached) {
                return;
            }

            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                return;
            }

            video.src = source;
        }

        function play() {
            attach();
            button.classList.add("is-hidden");
            video.setAttribute("controls", "controls");

            var promise = video.play();

            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    button.classList.remove("is-hidden");
                });
            }
        }

        button.addEventListener("click", play);

        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    };
})();
