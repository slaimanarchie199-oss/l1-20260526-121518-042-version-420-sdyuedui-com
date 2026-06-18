(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = $('[data-menu-toggle]');
  var mobileNav = $('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = $('[data-hero]');
  if (hero) {
    var slides = $all('[data-hero-slide]', hero);
    var dots = $all('[data-hero-dot]', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
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
      }
    }

    var prev = $('[data-hero-prev]', hero);
    var next = $('[data-hero-next]', hero);

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

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    start();
  }

  var searchInput = $('[data-search-input]');
  var searchPanel = $('[data-search-panel]');

  function resultMarkup(item) {
    return '<a href="' + item.url + '"><img src="' + item.cover + '" alt="' + item.title + '"><span><strong>' + item.title + '</strong><span>' + item.region + ' · ' + item.type + ' · ' + item.year + '</span></span></a>';
  }

  function findItems(query, limit) {
    var key = query.trim().toLowerCase();
    if (!key || !window.catalogItems) {
      return [];
    }
    return window.catalogItems.filter(function (item) {
      return item.keywords.toLowerCase().indexOf(key) >= 0;
    }).slice(0, limit || 12);
  }

  if (searchInput && searchPanel) {
    searchInput.addEventListener('input', function () {
      var items = findItems(searchInput.value, 10);
      searchPanel.innerHTML = items.map(resultMarkup).join('');
      searchPanel.classList.toggle('open', items.length > 0);
    });

    document.addEventListener('click', function (event) {
      if (!searchPanel.contains(event.target) && event.target !== searchInput) {
        searchPanel.classList.remove('open');
      }
    });
  }

  $all('[data-local-filter]').forEach(function (input) {
    input.addEventListener('input', function () {
      var list = $('[data-card-list]');
      var key = input.value.trim().toLowerCase();
      $all('.movie-card, .rank-item', list || document).forEach(function (card) {
        var haystack = (card.getAttribute('data-keywords') || card.textContent || '').toLowerCase();
        card.style.display = haystack.indexOf(key) >= 0 ? '' : 'none';
      });
    });
  });

  var searchPageInput = $('[data-search-page-input]');
  var searchResults = $('[data-search-results]');

  if (searchPageInput && searchResults && window.catalogItems) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    searchPageInput.value = q;

    function renderSearch(query) {
      var items = findItems(query, 80);
      if (!query.trim()) {
        items = window.catalogItems.slice(0, 60);
      }
      searchResults.innerHTML = items.map(function (item) {
        return '<article class="movie-card"><a class="poster" href="' + item.url + '"><img src="' + item.cover + '" alt="' + item.title + '" loading="lazy"><span class="poster-badge">' + item.year + '</span></a><div class="card-body"><a class="card-title" href="' + item.url + '">' + item.title + '</a><p class="card-meta">' + item.region + ' · ' + item.type + '</p><p class="card-desc">' + item.oneLine + '</p><div class="card-foot"><span>' + item.category + '</span><span>' + item.score + '</span></div></div></article>';
      }).join('');
    }

    renderSearch(q);

    searchPageInput.addEventListener('input', function () {
      renderSearch(searchPageInput.value);
    });
  }
})();
