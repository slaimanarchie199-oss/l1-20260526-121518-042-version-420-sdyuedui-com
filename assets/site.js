const SELECTORS = {
  menuToggle: '[data-menu-toggle]',
  mobileNav: '[data-mobile-nav]',
  heroSlide: '[data-hero-slide]',
  heroDot: '[data-hero-dot]',
  heroThumb: '[data-hero-thumb]',
  localFilter: '[data-local-filter]',
  cardFilter: '[data-card-filter]',
  cardGrid: '.js-card-grid',
  localCount: '[data-local-count]',
  emptyState: '[data-empty-state]',
  player: '[data-player]',
  playButton: '[data-play-button]',
  playerStatus: '[data-player-status]',
  searchPage: '#site-search-page',
  searchResults: '[data-search-results]',
  searchCount: '[data-search-count]',
  searchEmpty: '[data-search-empty]'
};

function escapeHTML(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function normalize(value) {
  return String(value ?? '').trim().toLowerCase();
}

function initMobileNavigation() {
  const toggle = document.querySelector(SELECTORS.menuToggle);
  const nav = document.querySelector(SELECTORS.mobileNav);
  if (!toggle || !nav) {
    return;
  }

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
}

function initHeroSlider() {
  const slides = Array.from(document.querySelectorAll(SELECTORS.heroSlide));
  const dots = Array.from(document.querySelectorAll(SELECTORS.heroDot));
  const thumbs = Array.from(document.querySelectorAll(SELECTORS.heroThumb));
  if (slides.length <= 1) {
    return;
  }

  let activeIndex = 0;
  let timer = null;

  function setActive(index) {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === activeIndex);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === activeIndex);
    });
    thumbs.forEach((thumb, thumbIndex) => {
      thumb.classList.toggle('is-active', thumbIndex === activeIndex);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(() => setActive(activeIndex + 1), 5200);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      setActive(Number(dot.dataset.heroDot || 0));
      start();
    });
  });

  const slider = document.querySelector('.hero-slider');
  if (slider) {
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
  }

  start();
}

function initLocalFilters() {
  const grid = document.querySelector(SELECTORS.cardGrid);
  const input = document.querySelector(SELECTORS.localFilter);
  const selects = Array.from(document.querySelectorAll(SELECTORS.cardFilter));
  if (!grid || (!input && selects.length === 0)) {
    return;
  }

  const cards = Array.from(grid.querySelectorAll('.movie-card'));
  const count = document.querySelector(SELECTORS.localCount);
  const empty = document.querySelector(SELECTORS.emptyState);

  function applyFilters() {
    const keyword = normalize(input ? input.value : '');
    const filters = Object.fromEntries(
      selects.map((select) => [select.dataset.cardFilter, normalize(select.value)])
    );
    let visibleCount = 0;

    cards.forEach((card) => {
      const searchable = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genre,
        card.textContent
      ].join(' '));
      const matchKeyword = !keyword || searchable.includes(keyword);
      const matchYear = !filters.year || normalize(card.dataset.year).includes(filters.year);
      const matchType = !filters.type || normalize(card.dataset.type).includes(filters.type);
      const isVisible = matchKeyword && matchYear && matchType;
      card.hidden = !isVisible;
      if (isVisible) {
        visibleCount += 1;
      }
    });

    if (count) {
      count.textContent = `共 ${visibleCount} 部影片`;
    }
    if (empty) {
      empty.hidden = visibleCount > 0;
    }
  }

  if (input) {
    input.addEventListener('input', applyFilters);
  }
  selects.forEach((select) => select.addEventListener('change', applyFilters));
  applyFilters();
}

async function initPlayer(shell) {
  if (shell.dataset.ready === 'true') {
    return;
  }

  const video = shell.querySelector('video');
  const status = shell.querySelector(SELECTORS.playerStatus);
  const source = shell.dataset.src;
  if (!video || !source) {
    if (status) {
      status.textContent = '播放源缺失。';
    }
    return;
  }

  shell.dataset.ready = 'true';
  if (status) {
    status.textContent = '正在加载播放源...';
  }

  try {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else {
      const module = await import('./hls.esm.js');
      const Hls = module.H;
      if (Hls && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        shell.hlsInstance = hls;
      } else {
        video.src = source;
      }
    }

    video.controls = true;
    shell.classList.add('is-playing');
    await video.play();
  } catch (error) {
    shell.classList.remove('is-playing');
    shell.dataset.ready = 'false';
    if (status) {
      status.textContent = '浏览器阻止了自动播放，请再次点击播放按钮。';
    }
    console.warn('Player initialization failed:', error);
  }
}

function initPlayers() {
  const shells = Array.from(document.querySelectorAll(SELECTORS.player));
  shells.forEach((shell) => {
    const button = shell.querySelector(SELECTORS.playButton);
    const video = shell.querySelector('video');
    if (button) {
      button.addEventListener('click', () => initPlayer(shell));
    }
    if (video) {
      video.addEventListener('click', () => initPlayer(shell));
    }
  });
}

function renderMovieCard(movie) {
  const tagHTML = (movie.tags || [])
    .slice(0, 4)
    .map((tag) => `<span>${escapeHTML(tag)}</span>`)
    .join('');

  return `
<article class="movie-card" data-title="${escapeHTML(movie.title)}" data-region="${escapeHTML(movie.region)}" data-type="${escapeHTML(movie.type)}" data-year="${escapeHTML(movie.year)}" data-genre="${escapeHTML(movie.genre)}">
  <a class="poster-link" href="${escapeHTML(movie.url)}" aria-label="观看${escapeHTML(movie.title)}">
    <span class="poster" style="background-image: linear-gradient(180deg, rgba(17, 24, 39, 0.05), rgba(17, 24, 39, 0.86)), url('${escapeHTML(movie.cover)}');">
      <span class="poster-badge">${escapeHTML(movie.type)}</span>
      <span class="poster-year">${escapeHTML(movie.year)}</span>
    </span>
  </a>
  <div class="movie-card__body">
    <h3><a href="${escapeHTML(movie.url)}">${escapeHTML(movie.title)}</a></h3>
    <p class="movie-meta">${escapeHTML(movie.region)} · ${escapeHTML(movie.genre)}</p>
    <p class="movie-card__summary">${escapeHTML(movie.oneLine)}</p>
    <div class="tag-row">${tagHTML}</div>
  </div>
</article>`.trim();
}

async function initSearchPage() {
  const searchPage = document.querySelector(SELECTORS.searchPage);
  const results = document.querySelector(SELECTORS.searchResults);
  if (!searchPage || !results) {
    return;
  }

  const { MOVIES } = await import('./movies.js');
  const params = new URLSearchParams(window.location.search);
  const input = searchPage.querySelector('[data-search-input]');
  const category = searchPage.querySelector('[data-search-category]');
  const type = searchPage.querySelector('[data-search-type]');
  const year = searchPage.querySelector('[data-search-year]');
  const count = document.querySelector(SELECTORS.searchCount);
  const empty = document.querySelector(SELECTORS.searchEmpty);
  const reset = document.querySelector('[data-search-reset]');

  if (input && params.get('q')) {
    input.value = params.get('q');
  }

  function applySearch() {
    const keyword = normalize(input ? input.value : '');
    const categoryValue = normalize(category ? category.value : '');
    const typeValue = normalize(type ? type.value : '');
    const yearValue = normalize(year ? year.value : '');

    const filtered = MOVIES.filter((movie) => {
      const haystack = normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.categoryName,
        movie.oneLine,
        (movie.tags || []).join(' ')
      ].join(' '));
      return (!keyword || haystack.includes(keyword))
        && (!categoryValue || normalize(movie.category) === categoryValue)
        && (!typeValue || normalize(movie.type).includes(typeValue))
        && (!yearValue || normalize(movie.year).includes(yearValue));
    }).sort((a, b) => b.score - a.score);

    const visibleMovies = filtered.slice(0, 120);
    results.innerHTML = visibleMovies.map(renderMovieCard).join('\n');

    if (count) {
      const suffix = filtered.length > visibleMovies.length ? `，已显示前 ${visibleMovies.length} 部` : '';
      count.textContent = `找到 ${filtered.length} 部影片${suffix}`;
    }
    if (empty) {
      empty.hidden = filtered.length > 0;
    }
  }

  [input, category, type, year].forEach((element) => {
    if (element) {
      element.addEventListener('input', applySearch);
      element.addEventListener('change', applySearch);
    }
  });

  if (reset) {
    reset.addEventListener('click', () => {
      if (input) {
        input.value = '';
      }
      if (category) {
        category.value = '';
      }
      if (type) {
        type.value = '';
      }
      if (year) {
        year.value = '';
      }
      applySearch();
    });
  }

  applySearch();
}

function init() {
  initMobileNavigation();
  initHeroSlider();
  initLocalFilters();
  initPlayers();
  initSearchPage();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
