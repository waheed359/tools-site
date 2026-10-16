/* AI Money Tools — shared site JS */
(function () {
  'use strict';

  /* ---------- Region (UK / US) ---------- */
  var REG_KEY = 'amt-region';
  function getRegion() {
    try { return localStorage.getItem(REG_KEY) === 'us' ? 'us' : 'uk'; } catch (e) { return 'uk'; }
  }
  function setRegion(r) {
    try { localStorage.setItem(REG_KEY, r); } catch (e) {}
    document.body.setAttribute('data-region', r);
    document.querySelectorAll('.region-toggle button').forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-set-region') === r);
    });
    document.dispatchEvent(new CustomEvent('regionchange', { detail: { region: r } }));
  }
  window.AMT = {
    region: getRegion,
    cur: function () { return getRegion() === 'uk' ? '£' : '$'; },
    money: function (n, dp) {
      if (isNaN(n) || !isFinite(n)) n = 0;
      var d = (dp === undefined) ? 0 : dp;
      return (getRegion() === 'uk' ? '£' : '$') + Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) ;
    },
    moneySigned: function (n, dp) {
      var s = n < 0 ? '−' : '';
      return s + window.AMT.money(n, dp);
    },
    num: function (id, fallback) {
      var el = document.getElementById(id);
      if (!el) return fallback || 0;
      var v = parseFloat(String(el.value).replace(/[,£$\s]/g, ''));
      return isNaN(v) ? (fallback || 0) : v;
    },
    val: function (id) { var el = document.getElementById(id); return el ? el.value : ''; },
    pct: function (n, dp) { return (isNaN(n) ? 0 : n).toFixed(dp === undefined ? 1 : dp) + '%'; },
    show: function (id) {
      var el = document.getElementById(id);
      if (el) { el.classList.add('show'); el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
    },
    esc: function (s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    setRegion(getRegion());

    /* region toggle buttons */
    document.querySelectorAll('[data-set-region]').forEach(function (b) {
      b.addEventListener('click', function () { setRegion(b.getAttribute('data-set-region')); });
    });

    /* mobile menu */
    var mb = document.querySelector('.menu-btn');
    var links = document.querySelector('.nav-links');
    if (mb && links) {
      mb.addEventListener('click', function () {
        var open = links.classList.toggle('open');
        mb.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      links.addEventListener('click', function (e) {
        if (e.target.tagName === 'A') links.classList.remove('open');
      });
    }

    /* homepage category filters */
    var chips = document.querySelectorAll('.filters .chip');
    if (chips.length) {
      chips.forEach(function (c) {
        c.addEventListener('click', function () {
          chips.forEach(function (x) { x.classList.remove('on'); });
          c.classList.add('on');
          var cat = c.getAttribute('data-filter');
          document.querySelectorAll('.tool-grid .tool-card').forEach(function (card) {
            card.classList.toggle('hidden', cat !== 'all' && card.getAttribute('data-cat') !== cat);
          });
        });
      });
    }

    /* copy-to-clipboard buttons */
    document.querySelectorAll('[data-copy-target]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var t = document.getElementById(btn.getAttribute('data-copy-target'));
        if (!t) return;
        var text = t.innerText || t.value || '';
        function done() { var o = btn.textContent; btn.textContent = '✓ Copied'; setTimeout(function(){ btn.textContent = o; }, 1800); }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, done);
        } else {
          var ta = document.createElement('textarea');
          ta.value = text; document.body.appendChild(ta); ta.select();
          try { document.execCommand('copy'); } catch (e) {}
          document.body.removeChild(ta); done();
        }
      });
    });

    /* print buttons */
    document.querySelectorAll('[data-print]').forEach(function (btn) {
      btn.addEventListener('click', function () { window.print(); });
    });

    /* numeric enter-to-calculate */
    document.querySelectorAll('.tool-shell input').forEach(function (inp) {
      inp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          var go = document.querySelector('.tool-shell .btn-grad');
          if (go) { e.preventDefault(); go.click(); }
        }
      });
    });
  });
})();
