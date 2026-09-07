/* ============================================================
   THE STILLWATER LETTERS — shared community renderer
   Reads window.STILLWATER_WEEK (from /data/this-week.js) and
   fills the pulse tiles, reflections, heartbeat, answered-prayer
   and share blocks. Every failure mode degrades to the honest
   static quiet-state already in the page — nothing breaks, and
   nothing false is ever shown.
   ============================================================ */
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else { fn(); }
  }

  /* Resolve "letter.title" style paths against the data object. */
  function pick(obj, path) {
    try {
      return path.split('.').reduce(function (o, k) {
        return (o == null) ? null : o[k];
      }, obj);
    } catch (_) { return null; }
  }

  function el(tag, className, text) {
    var n = document.createElement(tag);
    if (className) n.className = className;
    if (text != null) n.textContent = text;
    return n;
  }

  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  ready(function () {
    var W = window.STILLWATER_WEEK;
    if (!W || typeof W !== 'object') return;

    try {

      /* ---- simple text fills: <span data-sw-text="letter.title"> ---- */
      document.querySelectorAll('[data-sw-text]').forEach(function (node) {
        var v = pick(W, node.getAttribute('data-sw-text'));
        if (typeof v === 'string' && v.trim()) node.textContent = v;
        if (typeof v === 'number') node.textContent = String(v);
      });

      /* ---- links to the current letter: <a data-sw-link="letter"> ---- */
      if (W.letter && W.letter.slug) {
        document.querySelectorAll('[data-sw-link="letter"]').forEach(function (a) {
          a.setAttribute('href', '/letters/' + W.letter.slug + '/');
        });
      }

      /* ---- "Week of …" stamps ---- */
      if (W.weekOf) {
        document.querySelectorAll('[data-sw-weekof]').forEach(function (node) {
          node.textContent = 'Week of ' + W.weekOf;
        });
      }

      /* ---- Alice's prompt for the week ---- */
      if (W.prompt && W.prompt.trim()) {
        document.querySelectorAll('[data-sw-prompt]').forEach(function (node) {
          var body = node.querySelector('[data-sw-prompt-body]') || node;
          clear(body);
          body.appendChild(el('p', 'sw-prompt-text', '“' + W.prompt.trim() + '”'));
          node.hidden = false;
        });
      }

      /* ---- community reflections (real + permissioned only) ----
         On letter pages the container carries data-sw-slug; reflections
         only appear on the letter they belong to. */
      var refs = Array.isArray(W.reflections) ? W.reflections.filter(function (r) {
        return r && r.text && String(r.text).trim();
      }) : [];
      document.querySelectorAll('[data-sw-reflections]').forEach(function (node) {
        var gate = node.getAttribute('data-sw-slug');
        if (gate && (!W.letter || W.letter.slug !== gate)) return;
        if (!refs.length) return; /* keep the honest quiet-state */
        var body = node.querySelector('[data-sw-reflections-body]') || node;
        clear(body);
        refs.forEach(function (r) {
          var item = el('div', 'sw-reflection');
          var q = el('blockquote', null, '“' + String(r.text).trim() + '”');
          item.appendChild(q);
          if (r.name && String(r.name).trim()) {
            item.appendChild(el('cite', null, '— ' + String(r.name).trim()));
          }
          body.appendChild(item);
        });
        node.hidden = false;
      });

      /* ---- prayer heartbeat (aggregate only, real numbers only) ---- */
      var carried = (W.prayer && typeof W.prayer.carried === 'number') ? W.prayer.carried : 0;
      if (carried > 0) {
        document.querySelectorAll('[data-sw-heartbeat]').forEach(function (node) {
          var body = node.querySelector('[data-sw-heartbeat-body]') || node;
          clear(body);
          var line = el('div', 'sw-heartbeat-line');
          line.appendChild(el('span', 'sw-heartbeat-num', String(carried)));
          line.appendChild(el('span', null,
            carried === 1
              ? 'request is being carried in prayer this week — by name.'
              : 'requests are being carried in prayer this week — each one by name.'));
          body.appendChild(line);
          if (W.prayer.note && W.prayer.note.trim()) {
            var note = el('p', null, W.prayer.note.trim());
            note.style.marginTop = '0.8rem';
            body.appendChild(note);
          }
          node.hidden = false;
        });
      }

      /* ---- answered prayer (only with her blessing) ---- */
      if (W.answered && W.answered.text && String(W.answered.text).trim()) {
        document.querySelectorAll('[data-sw-answered]').forEach(function (node) {
          var body = node.querySelector('[data-sw-answered-body]') || node;
          clear(body);
          body.appendChild(el('blockquote', null, '“' + String(W.answered.text).trim() + '”'));
          if (W.answered.name && String(W.answered.name).trim()) {
            body.appendChild(el('cite', null, '— ' + String(W.answered.name).trim() + ', with her blessing'));
          }
          node.hidden = false;
        });
      }

      /* ---- gentle welcome line ---- */
      if (W.welcome && W.welcome.trim()) {
        document.querySelectorAll('[data-sw-welcome]').forEach(function (node) {
          var body = node.querySelector('[data-sw-welcome-body]') || node;
          clear(body);
          body.appendChild(el('p', 'sw-quiet', W.welcome.trim()));
          node.hidden = false;
        });
      }

    } catch (_) { /* quiet-states remain — never break the page */ }

    /* ---- share row: copy link / email / facebook / whatsapp ---- */
    try {
      document.querySelectorAll('[data-sw-share]').forEach(function (node) {
        if (node.childElementCount > 0) return; /* idempotent — never double-render */
        var canonical = document.querySelector('link[rel="canonical"]');
        var url = (canonical && canonical.href) || (location.origin + location.pathname);
        var title = node.getAttribute('data-sw-share-title') || document.title;

        var copyBtn = el('button', 'sw-btn-ghost', 'Copy the link');
        copyBtn.type = 'button';
        copyBtn.addEventListener('click', function () {
          function done() {
            copyBtn.textContent = '✦ Copied';
            setTimeout(function () { copyBtn.textContent = 'Copy the link'; }, 2200);
          }
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(done, function () { window.prompt('Copy this link:', url); });
          } else {
            window.prompt('Copy this link:', url);
          }
        });

        var mail = el('a', 'sw-btn-ghost', 'Send it by email');
        mail.href = 'mailto:?subject=' + encodeURIComponent('A letter I thought of you reading — ' + title)
                  + '&body=' + encodeURIComponent('I read this today and thought of you.\n\n' + url + '\n\nIt’s a quiet weekly letter called The Stillwater Letters — free, no strings.');

        var fb = el('a', 'sw-btn-ghost', 'Share on Facebook');
        fb.href = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url);
        fb.target = '_blank'; fb.rel = 'noopener';

        var wa = el('a', 'sw-btn-ghost', 'WhatsApp');
        wa.href = 'https://wa.me/?text=' + encodeURIComponent('I read this today and thought of you — ' + url);
        wa.target = '_blank'; wa.rel = 'noopener';

        node.appendChild(copyBtn);
        node.appendChild(mail);
        node.appendChild(fb);
        node.appendChild(wa);
      });
    } catch (_) { /* share row simply stays empty */ }
  });
})();
