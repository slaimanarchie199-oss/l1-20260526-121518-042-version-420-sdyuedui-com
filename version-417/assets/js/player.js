(function () {
    function getElements() {
        return {
            video: document.getElementById("movieVideo"),
            button: document.getElementById("playButton")
        };
    }

    function canUseNativeHls(video) {
        return video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL");
    }

    function attachNative(video, url) {
        if (video.getAttribute("src") !== url) {
            video.src = url;
        }
        return Promise.resolve();
    }

    function attachWithHls(video, url) {
        return new Promise(function (resolve, reject) {
            if (!window.Hls || !window.Hls.isSupported()) {
                reject(new Error("hls unsupported"));
                return;
            }
            if (video.hlsInstance) {
                video.hlsInstance.destroy();
            }
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            video.hlsInstance = hls;
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                resolve();
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    reject(new Error(data.type || "hls error"));
                }
            });
        });
    }

    function playVideo(video) {
        var playback = video.play();
        if (playback && typeof playback.catch === "function") {
            playback.catch(function () {});
        }
    }

    window.initializeMoviePlayer = function (url) {
        var elements = getElements();
        var video = elements.video;
        var button = elements.button;
        if (!video || !button || !url) {
            return;
        }
        var prepared = false;

        function prepare() {
            if (prepared) {
                return Promise.resolve();
            }
            prepared = true;
            if (canUseNativeHls(video)) {
                return attachNative(video, url);
            }
            if (window.Hls && window.Hls.isSupported()) {
                return attachWithHls(video, url);
            }
            return attachNative(video, url);
        }

        function start() {
            button.classList.add("is-hidden");
            prepare()
                .then(function () {
                    playVideo(video);
                })
                .catch(function () {
                    button.classList.remove("is-hidden");
                });
        }

        button.addEventListener("click", start);
        video.addEventListener("play", function () {
            button.classList.add("is-hidden");
        });
        video.addEventListener("pause", function () {
            if (video.currentTime === 0 || video.ended) {
                button.classList.remove("is-hidden");
            }
        });
        video.addEventListener("ended", function () {
            button.classList.remove("is-hidden");
        });
    };
})();
