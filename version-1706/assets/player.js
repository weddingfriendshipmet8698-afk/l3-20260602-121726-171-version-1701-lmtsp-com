(function () {
  var hlsPromise = null;

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (!hlsPromise) {
      hlsPromise = new Promise(function (resolve, reject) {
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
        script.onload = function () {
          resolve(window.Hls);
        };
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
    return hlsPromise;
  }

  function initPlayer(box) {
    var video = box.querySelector('video');
    var button = box.querySelector('.play-button');
    if (!video || !button) {
      return;
    }
    var stream = video.getAttribute('data-stream');
    var prepared = false;

    function prepare() {
      if (prepared || !stream) {
        return Promise.resolve();
      }
      prepared = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        return Promise.resolve();
      }
      return loadHls().then(function (Hls) {
        if (Hls && Hls.isSupported()) {
          var hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
      });
    }

    function toggle() {
      prepare().then(function () {
        if (video.paused) {
          video.play();
        } else {
          video.pause();
        }
      });
    }

    button.addEventListener('click', toggle);
    video.addEventListener('click', toggle);
    video.addEventListener('play', function () {
      button.classList.add('playing');
      button.textContent = 'Ⅱ';
    });
    video.addEventListener('pause', function () {
      button.classList.remove('playing');
      button.textContent = '▶';
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initPlayer);
})();
