import { H as Hls } from './hls.js';

function setupPlayer(player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-player-button]');

    if (!video || !button) {
        return;
    }

    var source = video.getAttribute('data-src');
    var ready = false;
    var hlsInstance = null;

    function attachSource() {
        if (ready || !source) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
        } else {
            video.src = source;
        }

        ready = true;
    }

    function startPlayback() {
        attachSource();
        button.classList.add('is-hidden');
        video.controls = true;

        var playResult = video.play();
        if (playResult && typeof playResult.catch === 'function') {
            playResult.catch(function () {});
        }
    }

    button.addEventListener('click', startPlayback);
    video.addEventListener('click', function () {
        if (!ready) {
            startPlayback();
        }
    });

    window.addEventListener('pagehide', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}

Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
