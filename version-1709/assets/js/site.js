(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function bindNavigation() {
        var toggle = document.querySelector(".nav-toggle");
        var nav = document.querySelector(".site-nav");

        if (!toggle || !nav) {
            return;
        }

        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function bindHero() {
        var hero = document.querySelector("[data-hero]");

        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector(".hero-prev");
        var next = hero.querySelector(".hero-next");
        var active = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }

            active = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }

            timer = window.setInterval(function () {
                show(active + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(active - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(active + 1);
                restart();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-slide")) || 0);
                restart();
            });
        });

        show(0);
        restart();
    }

    function bindFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-search-scope]"));

        scopes.forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var sort = scope.querySelector("[data-sort-select]");
            var list = scope.querySelector("[data-filter-list]");

            if (!list) {
                return;
            }

            var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

            cards.forEach(function (card, index) {
                card.setAttribute("data-index", index.toString());
            });

            function apply() {
                var term = normalize(input ? input.value : "");

                cards.forEach(function (card) {
                    var text = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-tags")
                    ].join(" "));

                    card.style.display = !term || text.indexOf(term) !== -1 ? "" : "none";
                });

                var mode = sort ? sort.value : "default";
                var sorted = cards.slice();

                sorted.sort(function (a, b) {
                    if (mode === "year-desc") {
                        return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
                    }

                    if (mode === "year-asc") {
                        return Number(a.getAttribute("data-year")) - Number(b.getAttribute("data-year"));
                    }

                    if (mode === "title") {
                        return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-CN");
                    }

                    return Number(a.getAttribute("data-index")) - Number(b.getAttribute("data-index"));
                });

                sorted.forEach(function (card) {
                    list.appendChild(card);
                });
            }

            if (input) {
                input.addEventListener("input", apply);
            }

            if (sort) {
                sort.addEventListener("change", apply);
            }

            apply();
        });
    }

    window.initMoviePlayer = function (playerId, mediaUrl) {
        var player = document.getElementById(playerId);

        if (!player) {
            return;
        }

        var video = player.querySelector("video");
        var cover = player.querySelector(".player-cover");
        var attached = false;

        if (!video) {
            return;
        }

        function attachMedia() {
            if (attached) {
                return;
            }

            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = mediaUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls();
                hls.loadSource(mediaUrl);
                hls.attachMedia(video);
            } else {
                video.src = mediaUrl;
            }
        }

        function startPlayback() {
            attachMedia();
            video.controls = true;

            if (cover) {
                cover.classList.add("is-hidden");
            }

            var attempt = video.play();

            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {
                    if (cover) {
                        cover.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (cover) {
            cover.addEventListener("click", startPlayback);
        }

        video.addEventListener("click", function () {
            if (!attached) {
                startPlayback();
            }
        });
    };

    ready(function () {
        bindNavigation();
        bindHero();
        bindFilters();
    });
})();
