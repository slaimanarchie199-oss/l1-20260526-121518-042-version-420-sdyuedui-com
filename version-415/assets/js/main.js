(function () {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var nav = document.querySelector('[data-nav-links]');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var searchInput = document.querySelector('[data-global-search]');
  var searchResults = document.querySelector('[data-search-results]');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function renderSearch(items) {
    if (!searchResults) {
      return;
    }

    if (!items.length) {
      searchResults.innerHTML = '<div class="search-empty">没有找到相关影片</div>';
      searchResults.classList.add('is-open');
      return;
    }

    searchResults.innerHTML = items.map(function (item) {
      return [
        '<a class="search-result-item" href="' + item.url + '">',
        '<img src="' + item.cover + '" alt="' + item.title + '">',
        '<span><strong>' + item.title + '</strong><span>' + item.year + ' · ' + item.genre + '</span></span>',
        '</a>'
      ].join('');
    }).join('');
    searchResults.classList.add('is-open');
  }

  if (searchInput && searchResults && Array.isArray(window.MOVIE_SEARCH_INDEX)) {
    searchInput.addEventListener('input', function () {
      var keyword = normalize(searchInput.value);

      if (!keyword) {
        searchResults.classList.remove('is-open');
        searchResults.innerHTML = '';
        return;
      }

      var matches = window.MOVIE_SEARCH_INDEX.filter(function (item) {
        var text = normalize(item.title + ' ' + item.genre + ' ' + item.tags + ' ' + item.oneLine);
        return text.indexOf(keyword) !== -1;
      }).slice(0, 9);

      renderSearch(matches);
    });

    document.addEventListener('click', function (event) {
      if (!searchResults.contains(event.target) && event.target !== searchInput) {
        searchResults.classList.remove('is-open');
      }
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startHero() {
      stopHero();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stopHero() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (slides.length) {
      if (prev) {
        prev.addEventListener('click', function () {
          showSlide(current - 1);
          startHero();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          showSlide(current + 1);
          startHero();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
          startHero();
        });
      });

      hero.addEventListener('mouseenter', stopHero);
      hero.addEventListener('mouseleave', startHero);
      startHero();
    }
  }

  var filterInput = document.querySelector('[data-card-filter]');
  var cardList = document.querySelector('[data-card-list]');

  if (filterInput && cardList) {
    var cards = Array.prototype.slice.call(cardList.querySelectorAll('[data-filter-card]'));
    var defaultOrder = cards.slice();
    var sortButtons = Array.prototype.slice.call(document.querySelectorAll('[data-sort]'));

    function cardText(card) {
      return normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' '));
    }

    function applyFilter() {
      var keyword = normalize(filterInput.value);

      cards.forEach(function (card) {
        var visible = !keyword || cardText(card).indexOf(keyword) !== -1;
        card.style.display = visible ? '' : 'none';
      });
    }

    function setSort(mode) {
      var sorted = defaultOrder.slice();

      if (mode === 'year') {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
        });
      }

      if (mode === 'title') {
        sorted.sort(function (a, b) {
          return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-Hans-CN');
        });
      }

      sorted.forEach(function (card) {
        cardList.appendChild(card);
      });
      cards = sorted;
      applyFilter();
    }

    filterInput.addEventListener('input', applyFilter);

    sortButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        sortButtons.forEach(function (item) {
          item.classList.remove('is-active');
        });
        button.classList.add('is-active');
        setSort(button.getAttribute('data-sort'));
      });
    });
  }

  var panel = document.querySelector('[data-player-panel]');

  if (panel) {
    var video = panel.querySelector('[data-video-player]');
    var cover = panel.querySelector('[data-play-cover]');
    var hlsInstance = null;

    function prepareVideo() {
      if (!video || video.getAttribute('data-ready') === '1') {
        return;
      }

      var streamUrl = video.getAttribute('data-stream');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls();
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }

      video.setAttribute('data-ready', '1');
    }

    function playVideo() {
      prepareVideo();

      if (cover) {
        cover.classList.add('is-hidden');
      }

      if (video) {
        var request = video.play();
        if (request && typeof request.catch === 'function') {
          request.catch(function () {});
        }
      }
    }

    if (cover) {
      cover.addEventListener('click', playVideo);
    }

    panel.addEventListener('click', function (event) {
      if (event.target === video && video.getAttribute('data-ready') !== '1') {
        playVideo();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
}());
