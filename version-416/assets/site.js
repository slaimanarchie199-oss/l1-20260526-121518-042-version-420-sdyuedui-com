(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-nav]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = document.querySelector("[data-hero-dots]");
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        if (!slides.length || !dots) {
            return;
        }
        var index = 0;
        var dotButtons = slides.map(function (_, i) {
            var dot = document.createElement("button");
            dot.type = "button";
            dot.setAttribute("aria-label", "切换到第 " + (i + 1) + " 张");
            dot.addEventListener("click", function () {
                show(i);
            });
            dots.appendChild(dot);
            return dot;
        });
        function show(nextIndex) {
            slides[index].classList.remove("is-active");
            dotButtons[index].classList.remove("is-active");
            index = (nextIndex + slides.length) % slides.length;
            slides[index].classList.add("is-active");
            dotButtons[index].classList.add("is-active");
        }
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
            });
        }
        dotButtons[0].classList.add("is-active");
        window.setInterval(function () {
            show(index + 1);
        }, 5600);
    }

    function setupCategoryFilter() {
        var scope = document.querySelector("[data-filter-scope]");
        if (!scope) {
            return;
        }
        var text = scope.querySelector("[data-filter-text]");
        var year = scope.querySelector("[data-filter-year]");
        var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-type]"));
        var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
        var count = scope.querySelector("[data-filter-count]");
        var activeType = "";
        function apply() {
            var q = (text && text.value || "").trim().toLowerCase();
            var y = year && year.value || "";
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = [
                    card.dataset.title,
                    card.dataset.type,
                    card.dataset.region,
                    card.dataset.genre,
                    card.dataset.year
                ].join(" ").toLowerCase();
                var okText = !q || haystack.indexOf(q) !== -1;
                var okYear = !y || card.dataset.year === y;
                var okType = !activeType || card.dataset.type === activeType;
                var show = okText && okYear && okType;
                card.style.display = show ? "" : "none";
                if (show) {
                    visible += 1;
                }
            });
            if (count) {
                count.textContent = visible;
            }
        }
        if (text) {
            text.addEventListener("input", apply);
        }
        if (year) {
            year.addEventListener("change", apply);
        }
        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                buttons.forEach(function (item) {
                    item.classList.remove("is-active");
                });
                button.classList.add("is-active");
                activeType = button.dataset.filterType || "";
                apply();
            });
        });
    }

    function movieCardMarkup(item) {
        var root = "";
        var tags = (item.tags || []).slice(0, 4).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "" +
            "<article class=\"movie-card\" data-title=\"" + escapeHtml(item.title) + "\">" +
            "<a class=\"poster-link\" href=\"" + root + "movies/" + item.id + ".html\">" +
            "<span class=\"poster-glow\"></span>" +
            "<img src=\"" + item.cover + ".jpg\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\" onerror=\"this.classList.add('is-missing')\">" +
            "<span class=\"poster-badge\">" + item.year + "</span>" +
            "<span class=\"poster-play\">播放</span>" +
            "</a>" +
            "<div class=\"movie-card-body\">" +
            "<h3><a href=\"" + root + "movies/" + item.id + ".html\">" + escapeHtml(item.title) + "</a></h3>" +
            "<p class=\"movie-meta\">" + escapeHtml(item.region) + " · " + escapeHtml(item.type) + " · " + escapeHtml(item.genre) + "</p>" +
            "<p class=\"movie-line\">" + escapeHtml(item.oneLine) + "</p>" +
            "<div class=\"tag-row\">" + tags + "</div>" +
            "</div>" +
            "</article>";
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>\"]/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;"
            }[char];
        });
    }

    function setupSearch() {
        var app = document.querySelector("[data-search-app]");
        if (!app || !window.MOVIE_INDEX) {
            return;
        }
        var input = app.querySelector("[data-search-input]");
        var type = app.querySelector("[data-search-type]");
        var clear = app.querySelector("[data-search-clear]");
        var results = app.querySelector("[data-search-results]");
        var count = app.querySelector("[data-search-count]");
        var params = new URLSearchParams(window.location.search);
        if (params.get("q")) {
            input.value = params.get("q");
        }
        function apply() {
            var q = (input.value || "").trim().toLowerCase();
            var t = type.value || "";
            var items = window.MOVIE_INDEX.filter(function (item) {
                var haystack = [
                    item.title,
                    item.region,
                    item.type,
                    item.year,
                    item.genre,
                    (item.tags || []).join(" "),
                    item.oneLine
                ].join(" ").toLowerCase();
                var okText = !q || haystack.indexOf(q) !== -1;
                var okType = !t || item.type.indexOf(t) !== -1;
                return okText && okType;
            }).slice(0, 240);
            results.innerHTML = items.map(movieCardMarkup).join("");
            count.textContent = items.length;
        }
        input.addEventListener("input", apply);
        type.addEventListener("change", apply);
        clear.addEventListener("click", function () {
            input.value = "";
            type.value = "";
            apply();
        });
        apply();
    }

    function setupPlayer() {
        var box = document.querySelector("[data-player]");
        if (!box) {
            return;
        }
        var src = box.dataset.src;
        var video = box.querySelector("video");
        var button = box.querySelector("[data-play-button]");
        var message = box.querySelector("[data-player-message]");
        if (!src || !video || !button) {
            if (message) {
                message.textContent = "当前影片没有可用播放源。";
            }
            return;
        }
        function play() {
            button.classList.add("is-hidden");
            if (message) {
                message.textContent = "正在初始化播放源，请稍候。";
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = src;
                video.play().catch(function () {});
                if (message) {
                    message.textContent = "播放源已加载。";
                }
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls();
                hls.loadSource(src);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                    if (message) {
                        message.textContent = "播放源已加载。";
                    }
                });
                hls.on(window.Hls.Events.ERROR, function () {
                    if (message) {
                        message.textContent = "播放源连接异常，请刷新页面后重试。";
                    }
                });
            } else {
                video.src = src;
                video.play().catch(function () {
                    if (message) {
                        message.textContent = "当前浏览器需要支持 HLS 才能播放该视频。";
                    }
                });
            }
        }
        button.addEventListener("click", play);
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupCategoryFilter();
        setupSearch();
        setupPlayer();
    });
})();
