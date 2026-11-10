(function () {
  var data = window.CHRONOBIBLE_TIMELINE || [];
  var track = document.getElementById('atlas-track');
  var viewport = document.getElementById('atlas-viewport');
  var frame = document.getElementById('atlas-frame');
  var detailInner = document.getElementById('detail-inner');
  if (!track || !data.length) return;

  var periodColors = [
    '#b8892d', '#a86a2d', '#8c6b3f', '#7a6a2f', '#5f6f52',
    '#7a4b3a', '#4f6f68', '#6b5f74', '#3f6f6a', '#4a5f7a'
  ];

  var state = { active: 0 };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function booksTags(books, extraClass) {
    var cls = 'tag' + (extraClass ? ' ' + extraClass : '');
    return '<ul class="tag-list">' + (books || []).map(function (b) {
      return '<li class="' + cls + '">' + esc(b) + '</li>';
    }).join('') + '</ul>';
  }

  function buildLayerA(item, idx) {
    var books = item.books || [];
    var addl = item.additional || [];
    var preview = books.slice(0, 5);
    var remaining = books.length - preview.length;
    var listId = 'books-list-' + idx;
    var addlId = 'addl-list-' + idx;
    var html = '<div class="cell layer-a" style="grid-column:' + (idx + 1) + '">';
    html += '<p class="books-label">Scripture groupings</p>';
    html += booksTags(preview, '');
    if (remaining > 0) {
      html += '<button type="button" class="disclosure-btn" data-toggle="' + listId + '" aria-expanded="false" aria-controls="' + listId + '">Show all Scripture groupings (' + books.length + ')</button>';
      html += '<div id="' + listId + '" hidden>' + booksTags(books.slice(5), '') + '</div>';
    }
    if (addl.length) {
      html += '<p class="addl-label">Additional writings</p>';
      html += booksTags(addl, 'addl');
    }
    html += '</div>';
    return html;
  }

  var imageDims = {
    'period-01-creation-patriarchs': { w: 278, h: 1237 },
    'period-02-exodus-law': { w: 278, h: 1237 },
    'period-03-conquest-judges': { w: 278, h: 1237 },
    'period-04-united-monarchy': { w: 284, h: 1352 },
    'period-05-divided-kingdom': { w: 284, h: 1352 },
    'period-06-exile': { w: 284, h: 1352 },
    'period-07-post-exilic-return': { w: 284, h: 1352 },
    'period-08-intertestamental': { w: 273, h: 1352 },
    'period-09-ministry-of-jesus': { w: 240, h: 1356 },
    'period-10-early-church': { w: 329, h: 1356 }
  };

  function buildFigure(item, idx, color) {
    var slug = item.slug || item.id;
    var alt = item.imageAlt || ('Historical atlas illustration representing ' + item.title + '.');
    var dim = imageDims[slug] || { w: 332, h: 498 };
    var loading = idx < 2 ? 'eager' : 'lazy';
    var fetchp = idx < 2 ? ' fetchpriority="high"' : '';
    var html = '<div class="cell layer-b" style="grid-column:' + (idx + 1) + '">';
    html += '<figure class="figure-plate" data-asset-slug="' + esc(slug) + '">';
    html += '<img src="./assets/illustrations/' + esc(slug) + '.png" alt="' + esc(alt) + '" ' +
      'width="' + dim.w + '" height="' + dim.h + '" loading="' + loading + '" decoding="async"' + fetchp + ' />';
    html += '</figure></div>';
    return html;
  }

  function buildMarker(item, idx, color) {
    var html = '<div class="cell layer-c" style="grid-column:' + (idx + 1) + '">';
    html += '<button type="button" class="marker-btn period-marker" data-index="' + idx + '" data-id="' + esc(item.id) + '" ';
    html += 'aria-label="Select period ' + (idx + 1) + ': ' + esc(item.title) + ', ' + esc(item.period) + '" aria-pressed="false" ';
    html += 'style="--period-color:' + color + '"></button>';
    html += '</div>';
    return html;
  }

  function buildLayerD(item, idx, color) {
    var html = '<div class="cell layer-d" style="grid-column:' + (idx + 1) + ';--period-color:' + color + '">';
    html += '<button type="button" class="period-select" data-index="' + idx + '" aria-label="Show details for ' + esc(item.title) + '">';
    html += '<p class="period-date">' + esc(item.period) + '</p>';
    html += '<h3 class="period-title">' + esc(item.title) + '</h3>';
    html += '<p class="period-desc">' + esc(item.context) + '</p>';
    html += '</button>';
    html += '<a class="disclosure-btn" href="./download/">Download for Android</a>';
    html += '</div>';
    return html;
  }

  function buildInlineDetail(item, idx, color) {
    var detailId = 'inline-detail-' + idx;
    return '<div class="inline-detail" id="' + detailId + '" hidden>' + detailContent(item, color, true) + '</div>';
  }

  function detailContent(item, color, inline) {
    var books = item.books || [];
    var addl = item.additional || [];
    var html = '<div class="detail-inner" style="--period-color:' + color + '">';
    html += '<div class="detail-grid">';
    html += '<div>';
    html += '<p class="detail-date">' + esc(item.period) + '</p>';
    html += '<h3 id="' + (inline ? '' : 'detail-title') + '">' + esc(item.title) + '</h3>';
    html += '<p class="detail-context">' + esc(item.context) + '</p>';
    html += '<p class="detail-caveat">Approximate historical period — a guide for reading in historical order, not an assertion of exact composition or event dates. Groupings reflect the established ChronoBible chronology.</p>';
    html += '<div class="detail-actions"><a class="btn btn-primary" href="./download/">Download Android</a></div>';
    html += '</div>';
    html += '<div>';
    html += '<p class="detail-block-title">Scripture groupings (' + books.length + ')</p>';
    html += '<ul class="detail-list">' + books.map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('') + '</ul>';
    if (addl.length) {
      html += '<p class="detail-block-title addl">Additional writings (' + addl.length + ', distinguished)</p>';
      html += '<ul class="detail-list">' + addl.map(function (b) { return '<li class="addl">' + esc(b) + '</li>'; }).join('') + '</ul>';
    } else {
      html += '<p class="detail-block-title addl">Additional writings</p>';
      html += '<p class="detail-caveat" style="margin:0">None listed for this period.</p>';
    }
    html += '</div></div></div>';
    return html;
  }

  function render() {
    var html = '<div class="spine" aria-hidden="true"></div>';
    data.forEach(function (item, idx) {
      var color = periodColors[idx] || '#b8892d';
      html += '<article class="period-col" id="period-' + esc(item.id) + '" data-index="' + idx + '" data-id="' + esc(item.id) + '" role="listitem" style="--period-color:' + color + '">';
      html += buildLayerA(item, idx);
      html += buildFigure(item, idx, color);
      html += buildMarker(item, idx, color);
      html += buildLayerD(item, idx, color);
      html += buildInlineDetail(item, idx, color);
      html += '</article>';
    });
    track.innerHTML = html;
  }

  function getCols() {
    return Array.prototype.slice.call(track.querySelectorAll('.period-col'));
  }

  function updateScrollHints() {
    if (!viewport || !frame) return;
    var max = viewport.scrollWidth - viewport.clientWidth;
    var left = viewport.scrollLeft;
    var canLeft = left > 8;
    var canRight = max - left > 8;
    frame.classList.toggle('can-scroll-left', canLeft);
    frame.classList.toggle('can-scroll-right', canRight);
    var hint = document.getElementById('scroll-hint');
    if (hint && (canLeft || left > 40)) hint.style.visibility = 'hidden';
  }

  function select(index, opts) {
    opts = opts || {};
    if (index < 0 || index >= data.length) return;
    state.active = index;
    var cols = getCols();
    cols.forEach(function (col, i) {
      var active = i === index;
      col.classList.toggle('is-active', active);
      var marker = col.querySelector('.period-marker');
      if (marker) marker.setAttribute('aria-pressed', active ? 'true' : 'false');
      var inline = col.querySelector('.inline-detail');
      if (inline) {
        if (active) inline.removeAttribute('hidden'); else inline.setAttribute('hidden', '');
      }
    });
    var item = data[index];
    var color = periodColors[index] || '#b8892d';
    if (detailInner) {
      detailInner.innerHTML = detailContent(item, color, false);
      var h = detailInner.querySelector('h3');
      if (h) h.id = 'detail-title';
    }
    if (opts.updateHash && item && item.id) {
      try { history.replaceState(null, '', '#period-' + item.id); } catch (e) {}
    }
    if (opts.scrollIntoView) {
      var activeCol = cols[index];
      if (activeCol) {
        var isMobile = window.matchMedia('(max-width: 900px)').matches;
        if (isMobile) {
          activeCol.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'nearest' });
        } else {
          var marker = activeCol.querySelector('.period-marker');
          if (marker && marker.scrollIntoView) {
            marker.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
          }
        }
      }
    }
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function indexFromHash() {
    var h = (location.hash || '').replace(/^#/, '');
    if (!h) return -1;
    var id = h.indexOf('period-') === 0 ? h.slice('period-'.length) : h;
    for (var i = 0; i < data.length; i++) {
      if (data[i].id === id) return i;
    }
    return -1;
  }

  function onTrackClick(e) {
    var toggle = e.target.closest('[data-toggle]');
    if (toggle) {
      var tid = toggle.getAttribute('data-toggle');
      var target = tid && document.getElementById(tid);
      if (target) {
        var expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        if (expanded) target.setAttribute('hidden', ''); else target.removeAttribute('hidden');
        if (toggle.classList.contains('disclosure-btn') && toggle.textContent.indexOf('Scripture groupings') !== -1) {
          // keep label informative
          var col = toggle.closest('.period-col');
          var idx = col ? parseInt(col.getAttribute('data-index'), 10) : -1;
          var total = (idx >= 0 && data[idx] && data[idx].books) ? data[idx].books.length : 0;
          toggle.textContent = expanded ? ('Show all Scripture groupings (' + total + ')') : 'Show fewer Scripture groupings';
        }
      }
      return;
    }
    var marker = e.target.closest('.period-marker');
    if (marker) {
      var mi = parseInt(marker.getAttribute('data-index'), 10);
      select(mi, { updateHash: true, scrollIntoView: false });
      if (window.matchMedia('(max-width: 900px)').matches) {
        var inline = document.getElementById('inline-detail-' + mi);
        if (inline) inline.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'nearest' });
      } else if (detailInner) {
        detailInner.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'nearest' });
      }
      return;
    }
    var sel = e.target.closest('.period-select');
    if (sel) {
      var si = parseInt(sel.getAttribute('data-index'), 10);
      select(si, { updateHash: true, scrollIntoView: false });
      if (window.matchMedia('(max-width: 900px)').matches) {
        var inline2 = document.getElementById('inline-detail-' + si);
        if (inline2) inline2.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'nearest' });
      } else if (detailInner) {
        detailInner.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'nearest' });
      }
      return;
    }
    var fig = e.target.closest('.layer-b .figure-plate');
    if (fig) {
      var colf = fig.closest('.period-col');
      if (colf) {
        var fi = parseInt(colf.getAttribute('data-index'), 10);
        select(fi, { updateHash: true, scrollIntoView: false });
      }
      return;
    }
  }

  function onTrackKeydown(e) {
    var marker = e.target.closest('.period-marker');
    if (!marker) return;
    var idx = parseInt(marker.getAttribute('data-index'), 10);
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      var next = Math.min(data.length - 1, idx + 1);
      focusMarker(next);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      var prev = Math.max(0, idx - 1);
      focusMarker(prev);
    } else if (e.key === 'Home') {
      e.preventDefault(); focusMarker(0);
    } else if (e.key === 'End') {
      e.preventDefault(); focusMarker(data.length - 1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      select(idx, { updateHash: true, scrollIntoView: true });
    }
  }

  function focusMarker(index) {
    var cols = getCols();
    var col = cols[index];
    if (!col) return;
    var m = col.querySelector('.period-marker');
    if (m) {
      m.focus();
      select(index, { updateHash: true, scrollIntoView: true });
    }
  }

  render();
  track.addEventListener('click', onTrackClick);
  track.addEventListener('keydown', onTrackKeydown);

  if (viewport) {
    viewport.addEventListener('scroll', updateScrollHints, { passive: true });
    window.addEventListener('resize', updateScrollHints);
    // ensure markers are reachable by keyboard focus scrolling
  }

  var initial = indexFromHash();
  if (initial < 0) initial = 0;
  select(initial, { updateHash: false, scrollIntoView: false });
  updateScrollHints();

  window.addEventListener('hashchange', function () {
    var idx = indexFromHash();
    if (idx >= 0) select(idx, { updateHash: false, scrollIntoView: true });
  });
})();
