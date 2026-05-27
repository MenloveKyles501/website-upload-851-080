(function () {
    function setupPlayer(box) {
        var video = box.querySelector('video');
        var button = box.querySelector('.play-layer');
        var src = box.getAttribute('data-hls');
        var loaded = false;
        var hls = null;

        if (!video || !button || !src) {
            return;
        }

        function loadSource() {
            if (loaded) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
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

            video.controls = true;
            loaded = true;
        }

        function playVideo(event) {
            if (event) {
                event.preventDefault();
            }

            loadSource();
            button.classList.add('is-hidden');

            var playResult = video.play();
            if (playResult && typeof playResult.catch === 'function') {
                playResult.catch(function () {
                    button.classList.remove('is-hidden');
                });
            }
        }

        button.addEventListener('click', playVideo);

        video.addEventListener('click', function () {
            if (!loaded) {
                playVideo();
            }
        });

        video.addEventListener('play', function () {
            button.classList.add('is-hidden');
        });

        video.addEventListener('ended', function () {
            button.classList.remove('is-hidden');
        });

        window.addEventListener('beforeunload', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    }

    document.querySelectorAll('.player-box').forEach(setupPlayer);
})();
