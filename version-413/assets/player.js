(function () {
    window.initPlayer = function (streamUrl) {
        var video = document.getElementById('movie-player');
        var overlay = document.querySelector('[data-player-overlay]');
        var loaded = false;
        var hls = null;

        if (!video || !streamUrl) {
            return;
        }

        function loadStream() {
            if (loaded) {
                return;
            }
            loaded = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                return;
            }

            video.src = streamUrl;
        }

        function startPlayback() {
            loadStream();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var playRequest = video.play();
            if (playRequest && typeof playRequest.catch === 'function') {
                playRequest.catch(function () {
                    if (overlay) {
                        overlay.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener('click', startPlayback);
        }

        video.addEventListener('click', function () {
            if (!loaded || video.paused) {
                startPlayback();
            }
        });

        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });

        video.addEventListener('ended', function () {
            if (overlay) {
                overlay.classList.remove('is-hidden');
            }
        });

        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    };
})();
