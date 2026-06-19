(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var menu = document.querySelector('.main-nav');
  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  var hero = document.querySelector('.hero');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var index = 0;
    var show = function (next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    show(0);
    if (slides.length > 1) {
      setInterval(function () {
        show(index + 1);
      }, 5000);
    }
  }

  var filterRoot = document.querySelector('[data-filter-root]');
  if (filterRoot) {
    var input = filterRoot.querySelector('[data-filter-input]');
    var region = filterRoot.querySelector('[data-filter-region]');
    var year = filterRoot.querySelector('[data-filter-year]');
    var genre = filterRoot.querySelector('[data-filter-genre]');
    var items = Array.prototype.slice.call(filterRoot.querySelectorAll('.filter-item'));
    var filter = function () {
      var q = input ? input.value.trim().toLowerCase() : '';
      var r = region ? region.value : '';
      var y = year ? year.value : '';
      var g = genre ? genre.value : '';
      items.forEach(function (item) {
        var text = [
          item.getAttribute('data-title'),
          item.getAttribute('data-region'),
          item.getAttribute('data-year'),
          item.getAttribute('data-genre'),
          item.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var ok = true;
        if (q && text.indexOf(q) === -1) {
          ok = false;
        }
        if (r && item.getAttribute('data-region') !== r) {
          ok = false;
        }
        if (y && item.getAttribute('data-year') !== y) {
          ok = false;
        }
        if (g && text.indexOf(g.toLowerCase()) === -1) {
          ok = false;
        }
        item.classList.toggle('hidden-item', !ok);
      });
    };
    [input, region, year, genre].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filter);
        control.addEventListener('change', filter);
      }
    });
  }
})();
