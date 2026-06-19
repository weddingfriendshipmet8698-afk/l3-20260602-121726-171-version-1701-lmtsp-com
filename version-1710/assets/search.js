(function () {
    var input = document.querySelector('[data-search-input]');
    var form = document.querySelector('[data-search-form]');
    var results = document.querySelector('[data-search-results]');
    var title = document.querySelector('[data-search-title]');
    var desc = document.querySelector('[data-search-desc]');
    var movies = window.SITE_MOVIES || [];

    function card(movie) {
        var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return [
            '<article class="movie-card">',
            '<a class="card-cover" href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + '">',
            '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '<span class="card-play">▶</span>',
            '</a>',
            '<div class="card-body">',
            '<div class="card-meta">',
            '<span>' + escapeHtml(movie.year) + '</span>',
            '<span>' + escapeHtml(movie.region) + '</span>',
            '<span>' + escapeHtml(movie.type) + '</span>',
            '</div>',
            '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
            '<p>' + escapeHtml(movie.oneLine) + '</p>',
            '<div class="tag-list">' + tags + '</div>',
            '</div>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function render(query) {
        var keyword = String(query || '').trim().toLowerCase();
        var list;

        if (keyword) {
            list = movies.filter(function (movie) {
                var haystack = [
                    movie.title,
                    movie.oneLine,
                    movie.year,
                    movie.region,
                    movie.type,
                    movie.genre,
                    (movie.tags || []).join(' ')
                ].join(' ').toLowerCase();
                return haystack.indexOf(keyword) !== -1;
            }).slice(0, 120);
        } else {
            list = movies.slice(0, 60);
        }

        if (title) {
            title.textContent = keyword ? '“' + query + '”的搜索结果' : '热门片库入口';
        }

        if (desc) {
            desc.textContent = keyword ? '按关键词匹配片库内容。' : '默认展示部分热门影片，可输入关键词继续搜索。';
        }

        if (!results) {
            return;
        }

        if (list.length === 0) {
            results.innerHTML = '<div class="no-results">未找到匹配影片，请更换关键词。</div>';
            return;
        }

        results.innerHTML = list.map(card).join('');
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (input) {
        input.value = initialQuery;
    }

    if (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var query = input ? input.value.trim() : '';
            var url = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
            window.history.replaceState(null, '', url);
            render(query);
        });
    }

    render(initialQuery);
})();
