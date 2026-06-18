(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
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

        function setSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                setSlide(current + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                setSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                setSlide(current + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                setSlide(index);
                startTimer();
            });
        });

        setSlide(0);
        startTimer();
    }

    var searchInput = document.querySelector('[data-search-input]');
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    var activeFilter = 'all';

    function applyFilters() {
        var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

        cards.forEach(function (card) {
            var text = (card.getAttribute('data-search') || '').toLowerCase();
            var category = card.getAttribute('data-category') || '';
            var matchesQuery = !query || text.indexOf(query) !== -1;
            var matchesFilter = activeFilter === 'all' || category === activeFilter;
            card.classList.toggle('is-hidden', !(matchesQuery && matchesFilter));
        });
    }

    if (searchInput) {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');
        if (initialQuery) {
            searchInput.value = initialQuery;
        }
        searchInput.addEventListener('input', applyFilters);
        applyFilters();
    }

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            activeFilter = button.getAttribute('data-filter') || 'all';
            filterButtons.forEach(function (item) {
                item.classList.toggle('active', item === button);
            });
            applyFilters();
        });
    });
})();
