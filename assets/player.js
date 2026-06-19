(function () {
  var boxes = Array.prototype.slice.call(document.querySelectorAll('.player-box'));

  boxes.forEach(function (box) {
    var video = box.querySelector('video');
    var button = box.querySelector('.play-layer');
    var stream = box.getAttribute('data-video');
    var loaded = false;
    var hls = null;

    function loadStream() {
      if (loaded || !video || !stream) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }

      loaded = true;
    }

    function playVideo() {
      loadStream();
      box.classList.add('is-playing');
      video.setAttribute('controls', 'controls');
      var result = video.play();

      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });
    }
  });
})();
