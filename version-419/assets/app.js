(function () {
  var hlsPromise = null;

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (hlsPromise) {
      return hlsPromise;
    }
    hlsPromise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js';
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return hlsPromise;
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-button]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
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

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    start();
  }

  function initLocalSearch() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
    scopes.forEach(function (scope) {
      var input = scope.querySelector('[data-local-search]');
      var typeSelect = scope.querySelector('[data-type-filter]');
      var yearSelect = scope.querySelector('[data-year-filter]');
      var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
      if (!cards.length) {
        return;
      }

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var type = typeSelect ? typeSelect.value : '';
        var year = yearSelect ? yearSelect.value : '';
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-type') || '',
            card.getAttribute('data-tags') || '',
            card.getAttribute('data-year') || ''
          ].join(' ').toLowerCase();
          var okQuery = !query || haystack.indexOf(query) >= 0;
          var okType = !type || (card.getAttribute('data-type') || '').indexOf(type) >= 0;
          var okYear = !year || (card.getAttribute('data-year') || '') === year;
          card.classList.toggle('is-hidden-card', !(okQuery && okType && okYear));
        });
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (typeSelect) {
        typeSelect.addEventListener('change', apply);
      }
      if (yearSelect) {
        yearSelect.addEventListener('change', apply);
      }
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q && input) {
        input.value = q;
        apply();
      }
    });
  }

  function initPlayer(streamUrl) {
    var video = document.getElementById('movie-video');
    var button = document.getElementById('movie-play');
    if (!video || !button || !streamUrl) {
      return;
    }
    var started = false;

    function playNow() {
      if (started) {
        video.play().catch(function () {});
        return;
      }
      started = true;
      button.classList.add('is-hidden');
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        video.play().catch(function () {});
        return;
      }
      loadHls().then(function (Hls) {
        if (Hls && Hls.isSupported()) {
          var hls = new Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.src = streamUrl;
          video.play().catch(function () {});
        }
      }).catch(function () {
        video.src = streamUrl;
        video.play().catch(function () {});
      });
    }

    button.addEventListener('click', playNow);
    video.addEventListener('click', function () {
      if (!started) {
        playNow();
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initLocalSearch();
  });

  window.MovieSite = {
    initPlayer: initPlayer
  };
})();
