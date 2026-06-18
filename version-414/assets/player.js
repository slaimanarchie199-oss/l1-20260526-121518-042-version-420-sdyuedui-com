(function () {
  var shell = document.querySelector('[data-player]');
  if (!shell) {
    return;
  }

  var video = shell.querySelector('video');
  var play = shell.querySelector('[data-play]');
  var src = shell.getAttribute('data-src');
  var ready = false;

  function attach() {
    if (ready) {
      return Promise.resolve();
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      return Promise.resolve();
    }

    video.src = src;
    return Promise.resolve();
  }

  function start() {
    shell.classList.add('is-playing');
    attach().then(function () {
      var task = video.play();
      if (task && typeof task.catch === 'function') {
        task.catch(function () {});
      }
    });
  }

  if (play) {
    play.addEventListener('click', start);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });
})();
