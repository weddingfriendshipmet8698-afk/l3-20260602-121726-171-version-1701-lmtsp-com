(function () {
    window.initMoviePlayer = function (mediaUrl) {
        var video = document.querySelector('.movie-video');
        var overlay = document.querySelector('.player-overlay');

        if (!video || !overlay || !mediaUrl) {
            return;
        }

        var prepared = false;
        var hls = null;

        function prepare() {
            if (prepared) {
                return;
            }

            prepared = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = mediaUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(mediaUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        overlay.classList.remove('is-hidden');
                    }
                });
                return;
            }

            overlay.classList.remove('is-hidden');
        }

        function play() {
            prepare();
            video.controls = true;
            var promise = video.play();

            if (promise && typeof promise.then === 'function') {
                promise.then(function () {
                    overlay.classList.add('is-hidden');
                }).catch(function () {
                    overlay.classList.remove('is-hidden');
                });
            } else {
                overlay.classList.add('is-hidden');
            }
        }

        overlay.addEventListener('click', play);
        video.addEventListener('play', function () {
            overlay.classList.add('is-hidden');
        });
        video.addEventListener('pause', function () {
            if (video.currentTime === 0 || video.ended) {
                overlay.classList.remove('is-hidden');
            }
        });

        prepare();
    };
})();
