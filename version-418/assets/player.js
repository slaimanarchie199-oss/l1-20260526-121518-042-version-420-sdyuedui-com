(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
  players.forEach(function (wrap) {
    var video = wrap.querySelector('video');
    var cover = wrap.querySelector('[data-play-button]');
    if (!video) return;
    var source = video.dataset.stream;
    var initialized = false;
    var start = function () {
      if (!source) return;
      if (!initialized) {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
        initialized = true;
      }
      if (cover) cover.classList.add('is-hidden');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    };
    if (cover) cover.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (video.paused) start();
    });
  });
})();
