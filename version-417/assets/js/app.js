(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initMobileMenu() {
        var header = document.querySelector(".site-header");
        var button = document.querySelector(".mobile-menu-button");
        if (!header || !button) {
            return;
        }
        button.addEventListener("click", function () {
            var isOpen = header.classList.toggle("is-open");
            button.setAttribute("aria-expanded", String(isOpen));
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        if (slides.length === 0) {
            return;
        }
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function activate(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot) {
                dot.classList.toggle("is-active", Number(dot.getAttribute("data-hero-dot")) === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                activate(index + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                activate(Number(dot.getAttribute("data-hero-dot")));
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                activate(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                activate(index + 1);
                start();
            });
        }

        var slider = document.querySelector(".hero-slider");
        if (slider) {
            slider.addEventListener("mouseenter", stop);
            slider.addEventListener("mouseleave", start);
        }
        activate(0);
        start();
    }

    function renderSearchResults(input, resultsBox, items) {
        var query = normalize(input.value);
        if (!query) {
            resultsBox.hidden = true;
            resultsBox.innerHTML = "";
            return;
        }
        var results = items.filter(function (item) {
            var text = normalize([
                item.title,
                item.year,
                item.region,
                item.type,
                item.genre,
                item.category,
                (item.tags || []).join(" "),
                item.oneLine
            ].join(" "));
            return text.indexOf(query) !== -1;
        }).slice(0, 10);

        if (results.length === 0) {
            resultsBox.hidden = false;
            resultsBox.innerHTML = '<p class="search-empty">没有找到匹配影片</p>';
            return;
        }

        resultsBox.hidden = false;
        resultsBox.innerHTML = results.map(function (item) {
            return [
                '<a class="search-result-card" href="' + escapeHtml(item.url) + '">',
                '    <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '">',
                '    <span>',
                '        <strong>' + escapeHtml(item.title) + '</strong>',
                '        <span>' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + ' · ' + escapeHtml(item.genre) + '</span>',
                '    </span>',
                '</a>'
            ].join("");
        }).join("");
    }

    function initSearch() {
        if (!Array.isArray(window.MOVIE_INDEX) && typeof MOVIE_INDEX === "undefined") {
            return;
        }
        var items = window.MOVIE_INDEX || MOVIE_INDEX;
        var inputs = Array.prototype.slice.call(document.querySelectorAll(".site-search-input"));
        inputs.forEach(function (input) {
            var container = input.closest(".site-search") || input.parentElement;
            var resultsBox = container ? container.querySelector(".site-search-results") : null;
            if (!resultsBox) {
                return;
            }
            input.addEventListener("input", function () {
                renderSearchResults(input, resultsBox, items);
            });
            input.addEventListener("focus", function () {
                renderSearchResults(input, resultsBox, items);
            });
        });

        document.addEventListener("click", function (event) {
            if (!event.target.closest(".site-search") && !event.target.closest(".quick-search-card")) {
                document.querySelectorAll(".site-search-results").forEach(function (box) {
                    box.hidden = true;
                });
            }
        });
    }

    function initFilters() {
        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var input = scope.querySelector(".filter-input");
            var chips = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-value]"));
            var grid = scope.nextElementSibling ? scope.nextElementSibling.querySelector(".movie-grid") : null;
            var count = scope.querySelector(".filter-count");
            if (!grid) {
                return;
            }
            var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
            var activeValue = "all";

            function apply() {
                var query = input ? normalize(input.value) : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var text = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-tags")
                    ].join(" "));
                    var matchesQuery = !query || text.indexOf(query) !== -1;
                    var matchesChip = activeValue === "all" || text.indexOf(normalize(activeValue)) !== -1;
                    var show = matchesQuery && matchesChip;
                    card.classList.toggle("is-filter-hidden", !show);
                    if (show) {
                        visible += 1;
                    }
                });
                if (count) {
                    count.textContent = "显示 " + visible + " 部";
                }
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            chips.forEach(function (chip) {
                chip.addEventListener("click", function () {
                    chips.forEach(function (item) {
                        item.classList.remove("is-active");
                    });
                    chip.classList.add("is-active");
                    activeValue = chip.getAttribute("data-filter-value") || "all";
                    apply();
                });
            });
            apply();
        });
    }

    ready(function () {
        initMobileMenu();
        initHero();
        initSearch();
        initFilters();
    });
})();
