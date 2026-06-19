(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function setupMobileMenu() {
        var button = document.querySelector('[data-mobile-menu-button]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function setupSearchForms() {
        document.querySelectorAll('[data-site-search]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[name="q"]');
                var query = input ? input.value.trim() : '';
                var target = './search.html';
                if (query) {
                    target += '?q=' + encodeURIComponent(query);
                }
                window.location.href = target;
            });
        });
    }

    function setupHeroCarousel() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        if (slides.length <= 1) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
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
                timer = null;
            }
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });
        var shell = document.querySelector('.hero-shell');
        if (shell) {
            shell.addEventListener('mouseenter', stop);
            shell.addEventListener('mouseleave', start);
        }
        start();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupFilters() {
        var list = document.querySelector('[data-filter-list]');
        if (!list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
        var input = document.querySelector('[data-filter-input]');
        var region = document.querySelector('[data-filter-region]');
        var type = document.querySelector('[data-filter-type]');
        var queryInput = document.querySelector('[data-search-query]');
        if (queryInput) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q') || '';
            queryInput.value = query;
        }
        function apply() {
            var text = normalize(input && input.value);
            var regionValue = normalize(region && region.value);
            var typeValue = normalize(type && type.value);
            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute('data-search'));
                var cardRegion = normalize(card.getAttribute('data-region'));
                var cardType = normalize(card.getAttribute('data-type'));
                var matchText = !text || haystack.indexOf(text) !== -1;
                var matchRegion = !regionValue || cardRegion === regionValue;
                var matchType = !typeValue || cardType === typeValue;
                card.classList.toggle('is-filter-hidden', !(matchText && matchRegion && matchType));
            });
        }
        [input, region, type].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
        apply();
    }

    function setupImageFallbacks() {
        document.querySelectorAll('.cover-image').forEach(function (image) {
            function hide() {
                image.classList.add('image-hidden');
            }
            image.addEventListener('error', hide);
            if (image.complete && image.naturalWidth === 0) {
                hide();
            }
        });
    }

    function loadHlsLibrary() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        if (window.__videoHlsLoading) {
            return window.__videoHlsLoading;
        }
        window.__videoHlsLoading = new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1';
            script.async = true;
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
        return window.__videoHlsLoading;
    }

    function setupPlayers() {
        document.querySelectorAll('[data-video-stage]').forEach(function (stage) {
            var video = stage.querySelector('video[data-hls]');
            var button = stage.querySelector('[data-play-button]');
            if (!video || !button) {
                return;
            }
            var started = false;
            var hlsInstance = null;
            function begin() {
                var source = video.getAttribute('data-hls');
                if (!source) {
                    return Promise.resolve();
                }
                if (started) {
                    return Promise.resolve();
                }
                started = true;
                if (video.canPlayType('application/vnd.apple.mpegURL') || video.canPlayType('application/x-mpegURL')) {
                    video.src = source;
                    return Promise.resolve();
                }
                return loadHlsLibrary().then(function (Hls) {
                    if (Hls && Hls.isSupported()) {
                        hlsInstance = new Hls({ enableWorker: true });
                        hlsInstance.loadSource(source);
                        hlsInstance.attachMedia(video);
                    } else {
                        video.src = source;
                    }
                }).catch(function () {
                    video.src = source;
                });
            }
            function play() {
                begin().then(function () {
                    video.controls = true;
                    button.classList.add('is-hidden');
                    return video.play();
                }).catch(function () {
                    button.classList.remove('is-hidden');
                });
            }
            button.addEventListener('click', play);
            stage.addEventListener('click', function (event) {
                if (event.target === video) {
                    return;
                }
                play();
            });
            video.addEventListener('pause', function () {
                if (video.currentTime === 0 || video.ended) {
                    button.classList.remove('is-hidden');
                }
            });
            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        setupMobileMenu();
        setupSearchForms();
        setupHeroCarousel();
        setupFilters();
        setupImageFallbacks();
        setupPlayers();
    });
})();
