(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');
  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  if (slides.length > 1) {
    var active = 0;
    var showSlide = function (index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
      });
    });
    window.setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }

  var filterPanel = document.querySelector('[data-filter-panel]');
  if (filterPanel) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
    var keyword = filterPanel.querySelector('[data-filter-keyword]');
    var region = filterPanel.querySelector('[data-filter-region]');
    var type = filterPanel.querySelector('[data-filter-type]');
    var year = filterPanel.querySelector('[data-filter-year]');
    var empty = document.querySelector('[data-empty-state]');
    var apply = function () {
      var q = keyword ? keyword.value.trim().toLowerCase() : '';
      var r = region ? region.value : '';
      var t = type ? type.value : '';
      var y = year ? year.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = [card.dataset.title, card.dataset.region, card.dataset.type, card.dataset.year, card.dataset.genre].join(' ').toLowerCase();
        var ok = true;
        if (q && text.indexOf(q) === -1) ok = false;
        if (r && card.dataset.region !== r) ok = false;
        if (t && card.dataset.type !== t) ok = false;
        if (y && card.dataset.year !== y) ok = false;
        card.style.display = ok ? '' : 'none';
        if (ok) visible += 1;
      });
      if (empty) empty.style.display = visible ? 'none' : 'block';
    };
    [keyword, region, type, year].forEach(function (field) {
      if (field) field.addEventListener('input', apply);
      if (field) field.addEventListener('change', apply);
    });
  }
})();
