(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function attach(video, source, playWhenReady) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      if (playWhenReady) {
        video.addEventListener('loadedmetadata', function () {
          video.play().catch(function () {});
        }, { once: true });
      }
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        if (playWhenReady) {
          video.play().catch(function () {});
        }
      });
      video._hls = hls;
      return;
    }

    video.src = source;
    if (playWhenReady) {
      video.play().catch(function () {});
    }
  }

  function initPlayer(container) {
    const source = container.getAttribute('data-play');
    const video = container.querySelector('video');
    const cover = container.querySelector('.player-cover');
    let loaded = false;

    if (!source || !video) {
      return;
    }

    function start() {
      if (!loaded) {
        attach(video, source, true);
        loaded = true;
      } else {
        video.play().catch(function () {});
      }
      container.classList.add('is-playing');
      video.controls = true;
    }

    if (cover) {
      cover.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (!loaded) {
        start();
      }
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initPlayer);
  });
})();
