(function () {
    var navToggle = document.querySelector('.nav-toggle');
    var siteNav = document.querySelector('.site-nav');

    if (navToggle && siteNav) {
        navToggle.addEventListener('click', function () {
            siteNav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
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

    function startHero() {
        if (slides.length < 2) {
            return;
        }

        timer = window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    function resetHero() {
        if (timer) {
            window.clearInterval(timer);
        }
        startHero();
    }

    if (prev) {
        prev.addEventListener('click', function () {
            showSlide(current - 1);
            resetHero();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            showSlide(current + 1);
            resetHero();
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
            resetHero();
        });
    });

    showSlide(0);
    startHero();

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function filterCards(scope) {
        var input = scope.querySelector('[data-card-search]');
        var region = scope.querySelector('[data-card-region]');
        var type = scope.querySelector('[data-card-type]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.js-card'));
        var empty = scope.querySelector('[data-empty-state]');
        var words = normalize(input ? input.value : '');
        var regionValue = normalize(region ? region.value : '');
        var typeValue = normalize(type ? type.value : '');
        var visible = 0;

        cards.forEach(function (card) {
            var text = normalize(card.getAttribute('data-search'));
            var cardRegion = normalize(card.getAttribute('data-region'));
            var cardType = normalize(card.getAttribute('data-type'));
            var matched = true;

            if (words && text.indexOf(words) === -1) {
                matched = false;
            }

            if (regionValue && cardRegion.indexOf(regionValue) === -1) {
                matched = false;
            }

            if (typeValue && cardType.indexOf(typeValue) === -1) {
                matched = false;
            }

            card.hidden = !matched;
            if (matched) {
                visible += 1;
            }
        });

        if (empty) {
            empty.classList.toggle('is-visible', visible === 0);
        }
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(function (scope) {
        Array.prototype.slice.call(scope.querySelectorAll('[data-card-search], [data-card-region], [data-card-type]')).forEach(function (control) {
            control.addEventListener('input', function () {
                filterCards(scope);
            });
            control.addEventListener('change', function () {
                filterCards(scope);
            });
        });

        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        var input = scope.querySelector('[data-card-search]');
        if (q && input) {
            input.value = q;
        }

        filterCards(scope);
    });
})();
