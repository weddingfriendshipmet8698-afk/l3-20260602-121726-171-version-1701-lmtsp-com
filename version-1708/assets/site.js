(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const nav = document.querySelector('[data-site-nav]');
  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let activeIndex = 0;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, currentIndex) {
        slide.classList.toggle('active', currentIndex === activeIndex);
      });
      dots.forEach(function (dot, currentIndex) {
        dot.classList.toggle('active', currentIndex === activeIndex);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.dataset.heroDot || 0));
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5000);
    }
  }

  const panels = Array.from(document.querySelectorAll('[data-filter-panel]'));
  panels.forEach(function (panel) {
    const input = panel.querySelector('[data-search-input]');
    const chips = Array.from(panel.querySelectorAll('[data-filter]'));
    const scope = panel.parentElement.querySelector('[data-search-scope]');
    if (!scope) {
      return;
    }
    const cards = Array.from(scope.querySelectorAll('.movie-card'));
    let filterValue = '全部';

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function cardText(card) {
      return normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.tags,
        card.textContent
      ].join(' '));
    }

    function applyFilter() {
      const query = normalize(input ? input.value : '');
      const tag = normalize(filterValue);
      cards.forEach(function (card) {
        const text = cardText(card);
        const matchQuery = !query || text.indexOf(query) !== -1;
        const matchTag = tag === '全部' || text.indexOf(tag) !== -1;
        card.classList.toggle('is-hidden', !(matchQuery && matchTag));
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      if (q) {
        input.value = q;
      }
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        filterValue = chip.dataset.filter || '全部';
        chips.forEach(function (item) {
          item.classList.toggle('active', item === chip);
        });
        applyFilter();
      });
    });

    applyFilter();
  });
})();

function initMoviePlayer(src) {
  const video = document.getElementById('movie-video');
  const overlay = document.getElementById('video-overlay');
  const status = document.getElementById('video-status');
  if (!video || !overlay || !src) {
    return;
  }

  let prepared = false;
  let hlsInstance = null;

  function setStatus(text) {
    if (status) {
      status.textContent = text || '';
    }
  }

  function prepare() {
    if (prepared) {
      return Promise.resolve();
    }
    prepared = true;
    setStatus('');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        maxBufferLength: 30,
        enableWorker: true
      });
      hlsInstance.loadSource(src);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.ERROR, function (_event, data) {
        if (data && data.fatal) {
          setStatus('视频暂时无法加载');
        }
      });
      return new Promise(function (resolve) {
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
      });
    }

    setStatus('视频暂时无法加载');
    return Promise.reject(new Error('media'));
  }

  function play() {
    prepare().then(function () {
      overlay.classList.add('hidden');
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          overlay.classList.remove('hidden');
        });
      }
    }).catch(function () {
      overlay.classList.remove('hidden');
    });
  }

  overlay.addEventListener('click', play);
  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });
  video.addEventListener('play', function () {
    overlay.classList.add('hidden');
  });
  video.addEventListener('pause', function () {
    if (!video.ended) {
      overlay.classList.remove('hidden');
    }
  });
  video.addEventListener('error', function () {
    setStatus('视频暂时无法加载');
  });
  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
