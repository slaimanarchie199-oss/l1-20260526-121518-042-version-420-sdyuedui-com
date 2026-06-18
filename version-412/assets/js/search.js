(function () {
  const data = window.SEARCH_MOVIES || [];
  const form = document.getElementById("search-page-form");
  const input = document.getElementById("search-query");
  const results = document.getElementById("search-results");
  const summary = document.getElementById("search-summary");
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get("q") || "";

  function normalize(text) {
    return String(text || "").toLowerCase();
  }

  function card(movie) {
    return [
      '<article class="movie-card">',
      '  <a class="movie-card-link" href="' + movie.href + '" aria-label="' + movie.title + ' 在线观看">',
      '    <div class="movie-poster">',
      '      <img src="' + movie.image + '" alt="' + movie.title + '" loading="lazy">',
      '      <div class="poster-shade"></div>',
      '      <span class="poster-type">' + movie.type + '</span>',
      '      <span class="poster-play">▶</span>',
      '    </div>',
      '    <div class="movie-card-body">',
      '      <h3>' + movie.title + '</h3>',
      '      <p class="movie-card-summary">' + movie.one_line + '</p>',
      '      <div class="movie-meta-row">',
      '        <span>' + movie.year + '</span>',
      '        <span>' + movie.region + '</span>',
      '      </div>',
      '      <p class="movie-genre">' + movie.genre + '</p>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join("\n");
  }

  function render(query) {
    const keyword = normalize(query).trim();
    const tokens = keyword ? keyword.split(/\s+/).filter(Boolean) : [];
    const matched = data.filter(function (movie) {
      const text = normalize(movie.title + " " + movie.region + " " + movie.year + " " + movie.genre + " " + movie.tags + " " + movie.one_line);
      return tokens.every(function (token) {
        return text.indexOf(token) !== -1;
      });
    });

    const output = keyword ? matched : data.slice(0, 60);

    if (summary) {
      summary.textContent = keyword ? "找到 " + matched.length + " 部相关影片" : "推荐浏览 60 部精选影片";
    }

    if (!results) {
      return;
    }

    if (!output.length) {
      results.innerHTML = '<div class="empty-message">没有找到匹配影片，请尝试更换关键词。</div>';
      return;
    }

    results.innerHTML = output.slice(0, 240).map(card).join("\n");
  }

  if (input) {
    input.value = initialQuery;
    input.addEventListener("input", function () {
      render(input.value);
    });
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const query = input ? input.value.trim() : "";
      const next = query ? "./search.html?q=" + encodeURIComponent(query) : "./search.html";
      window.history.replaceState(null, "", next);
      render(query);
    });
  }

  render(initialQuery);
})();
