(function () {
  'use strict';

  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  // Горизонтальная лента и телефон живут только на широком и достаточно высоком экране (см. те же условия в CSS)
  var WIDE = '(min-width: 900px) and (min-height: 640px)';
  var REDUCE = '(prefers-reduced-motion: reduce)';

  var ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ESC[c]; });
  }
  function safeHref(h) {
    return /^(https?:|mailto:|tel:|tg:)/i.test(h || '') ? h : '';
  }
  function list(a) { return Array.isArray(a) ? a : []; }
  function pad(n) { return ('0' + n).slice(-2); }

  /* ---------- Язык ----------
     Приоритет: ?lang=en в адресе (им удобно делиться) → прошлый выбор → язык браузера */
  var LANGS = ['ru', 'en'];
  function pickLang() {
    var q = new URLSearchParams(location.search).get('lang');
    if (LANGS.indexOf(q) > -1) { try { localStorage.setItem('lang', q); } catch (e) {} return q; }
    try { var saved = localStorage.getItem('lang'); if (LANGS.indexOf(saved) > -1) return saved; } catch (e) {}
    return /^ru/i.test(navigator.language || 'ru') ? 'ru' : 'en';
  }
  var LANG = pickLang();

  // Перевод накладывается поверх русских данных: ключи верхнего уровня заменяются, вложенные объекты сливаются
  function isObj(v) { return !!v && typeof v === 'object' && !Array.isArray(v); }
  function localize(base, over) {
    if (!over) return base;
    var out = {};
    Object.keys(base).forEach(function (k) { out[k] = base[k]; });
    Object.keys(over).forEach(function (k) {
      out[k] = isObj(base[k]) && isObj(over[k]) ? Object.assign({}, base[k], over[k]) : over[k];
    });
    return out;
  }
  var R = localize(window.RESUME || {}, LANG === 'en' ? window.RESUME_EN : null);

  // Тексты интерфейса (не контента): ключи стоят в разметке как data-i18n / data-i18n-html / data-i18n-aria
  var UI = {
    ru: {
      about: 'Обо мне', exp: 'Опыт', expTitle: 'Опыт работы', other: 'Прочее', cgi: '3D и видео', iceberg: 'Айсберг',
      skills: 'Навыки', education: 'Образование', contacts: 'Контакты', getInTouch: 'Связаться', seeExp: 'Смотреть опыт',
      scroll: 'Листайте', loading: 'загрузка', depth: 'Глубина', source: 'Оригинал резюме ↗', workTogether: 'Давайте<br>работать вместе',
      phoneTitle: 'Уличные часы', phoneUnit: '°C · телеметрия', phoneRow: 'Часы', toTop: 'Наверх', sections: 'Разделы', theme: 'Переключить тему',
      eduHigher: 'Образование', eduSchool: 'Школа', eduCourses: 'Курсы и сертификаты', watch: 'Смотреть',
      gallery: 'Фото и видео', close: 'Закрыть', cloud: 'Облаком', groups: 'По группам', dragHint: 'Теги можно хватать и бросать'
    },
    en: {
      about: 'About', exp: 'Experience', expTitle: 'Experience', other: 'More', cgi: '3D & video', iceberg: 'Iceberg',
      skills: 'Skills', education: 'Education', contacts: 'Contacts', getInTouch: 'Get in touch', seeExp: 'See experience',
      scroll: 'Scroll', loading: 'loading', depth: 'Depth', source: 'Original résumé (RU) ↗', workTogether: 'Let’s<br>work together',
      phoneTitle: 'Street clocks', phoneUnit: '°C · telemetry', phoneRow: 'Clock', toTop: 'Back to top', sections: 'Sections', theme: 'Toggle theme',
      eduHigher: 'Education', eduSchool: 'School', eduCourses: 'Courses and certificates', watch: 'Watch',
      gallery: 'Photos & video', close: 'Close', cloud: 'As a cloud', groups: 'By group', dragHint: 'Grab the tags and throw them around'
    }
  };
  function t(key) { return (UI[LANG] || UI.ru)[key] || UI.ru[key] || ''; }

  function applyUI() {
    root.lang = LANG;
    $$('[data-i18n]').forEach(function (el) { el.textContent = t(el.dataset.i18n); });
    $$('[data-i18n-html]').forEach(function (el) { el.innerHTML = t(el.dataset.i18nHtml); }); // только строки из словаря выше
    $$('[data-i18n-aria]').forEach(function (el) { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
    $$('.phone__list span').forEach(function (s, i) { s.textContent = t('phoneRow') + ' ' + pad(i + 1); });

    // Кнопка показывает язык, на который переключит. Перезагрузка — самый надёжный способ пересобрать SplitText и триггеры
    var btn = $('#lang');
    var next = LANG === 'ru' ? 'en' : 'ru';
    btn.textContent = next.toUpperCase();
    btn.addEventListener('click', function () {
      try { localStorage.setItem('lang', next); sessionStorage.setItem('skipIntro', '1'); } catch (e) {}
      var url = new URL(location.href);
      url.searchParams.set('lang', next);
      url.hash = '';
      location.href = url.toString();
    });
  }

  /* ---------- Рендер контента из data.js ---------- */

  function chips(items) {
    return list(items).map(function (t) { return '<li class="chip">' + esc(t) + '</li>'; }).join('');
  }

  function eduRows(label, rows) {
    rows = list(rows);
    if (!rows.length) return '';
    return '<div><p class="edu__label" data-reveal>' + label + '</p>' + rows.map(function (e) {
      return '<div class="edu__row" data-reveal>' +
        '<div class="edu__period">' + esc(e.period) + '</div>' +
        '<div><h3 class="edu__title">' + esc(e.title) + '</h3>' +
        '<p class="edu__place">' + [e.place, e.note].filter(Boolean).map(esc).join(', ') + '</p></div>' +
      '</div>';
    }).join('') + '</div>';
  }

  // Ось времени над образованием: ширина отрезка ∝ числу лет. Рассчитана на идущие подряд периоды
  function eduAxis(rows) {
    rows = rows.filter(function (r) { return r.from && r.to > r.from; }).sort(function (a, b) { return a.from - b.from; });
    if (rows.length < 2) return '';
    return '<div class="edu__axis" aria-hidden="true">' + rows.map(function (r) {
      var years = r.to - r.from;
      return '<div class="edu__seg" style="flex:' + years + '" data-years="' + years + '">' +
        '<span class="edu__seg-name">' + esc(r.short || r.place) + '</span><i class="edu__seg-bar"></i>' +
        '<span class="edu__seg-year">' + esc(r.from) + '</span></div>';
    }).join('') + '<span class="edu__axis-end">' + esc(rows[rows.length - 1].to) + '</span></div>';
  }

  // Прячем раздел и его пункт меню, если данных нет
  function dropSection(id) {
    var s = document.getElementById(id);
    if (s) s.remove();
    var link = $('.nav__links a[href="#' + id + '"]');
    if (link) link.remove();
  }

  function render() {
    applyUI();
    var name = R.name || '';
    R.initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w.charAt(0); }).join('').toUpperCase();

    if (name) document.title = [name, R.role].filter(Boolean).join(' — ');
    var desc = $('meta[name="description"]');
    if (desc && (R.lead || R.role)) desc.setAttribute('content', [name, R.role, R.lead].filter(Boolean).join('. '));

    $$('[data-bind]').forEach(function (el) {
      var v = R[el.dataset.bind];
      if (v) el.textContent = v;
      else (el.closest('[data-optional]') || el).remove();
    });

    $('#heroMeta').innerHTML = chips(R.meta);

    // Фото: показываем только те блоки, для которых в data.js есть картинка
    var photos = R.photos || {};
    function photo(id, src, alt, caption) {
      var fig = document.getElementById(id);
      if (!fig) return;
      if (!src) { fig.remove(); return; }
      var img = $('img', fig);
      img.src = src;
      img.alt = alt;
      var cap = $('figcaption', fig);
      if (cap) { if (caption) cap.textContent = caption; else cap.remove(); }
      fig.hidden = false;
    }
    photo('heroPhoto', photos.hero, name);
    if (photos.hero) $('.hero__device').classList.add('has-photo');
    photo('aboutPhoto', photos.about, name);
    var cp = photos.contacts || {};
    photo('contactsPhoto', cp.src, name, cp.caption);

    // Бегущая строка: две одинаковые половины для бесшовной петли
    var words = list(R.marquee);
    if (words.length) {
      var half = [];
      while (half.length < 8) half = half.concat(words);
      var html = half.map(function (w) { return '<span class="marquee__item">' + esc(w) + '</span>'; }).join('');
      $('#marquee').innerHTML = html + html;
    } else {
      $('.marquee').remove();
    }

    if (list(R.about).length || list(R.stats).length) {
      $('#aboutText').innerHTML = list(R.about).map(function (p, i) {
        return i === 0 ? '<p class="about__lead" id="aboutLead">' + esc(p) + '</p>' : '<p data-reveal>' + esc(p) + '</p>';
      }).join('');
      $('#stats').innerHTML = list(R.stats).map(function (s) {
        var num = s.text
          ? '<span data-scramble>' + esc(s.text) + '</span>'
          : '<span data-count="' + esc(s.value) + '">' + esc(s.value) + '</span><i>' + esc(s.suffix) + '</i>';
        return '<div class="stat" data-reveal><dt>' + num + '</dt><dd>' + esc(s.label) + '</dd></div>';
      }).join('');
    } else {
      dropSection('about');
    }

    if (list(R.experience).length) {
      var lastGroup = null;
      $('#jobs').innerHTML = R.experience.map(function (j) {
        var points = list(j.points).map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('');
        var tags = chips(j.tags);
        var group = j.group && j.group !== lastGroup ? '<p class="timeline__group" data-reveal>' + esc(j.group) + '</p>' : '';
        lastGroup = j.group || lastGroup;
        var links = list(j.links).map(function (l) {
          var href = safeHref(l.href);
          return href ? '<a class="job__link" href="' + esc(href) + '" target="_blank" rel="noopener">' + esc(l.label) + ' ↗</a>' : '';
        }).join('');
        var media = list(j.media).map(function (m) {
          return '<figure class="job__media"><img src="' + esc(encodeURI(m.src)) + '" alt="' + esc(m.alt) + '" loading="lazy"' +
            (m.w && m.h ? ' width="' + esc(m.w) + '" height="' + esc(m.h) + '"' : '') + '></figure>';
        }).join('');
        return group + '<article class="job">' +
          '<span class="job__dot" aria-hidden="true"></span>' +
          '<div class="job__period">' + esc(j.period) + '</div>' +
          '<div>' +
            '<h3 class="job__title">' + esc(j.position) + '</h3>' +
            '<p class="job__company">' + esc(j.company) + (j.place ? ' <span>· ' + esc(j.place) + '</span>' : '') + '</p>' +
            (points ? '<ul class="job__points">' + points + '</ul>' : '') +
            (tags ? '<ul class="tags">' + tags + '</ul>' : '') +
            links + media +
          '</div>' +
        '</article>';
      }).join('');
    } else {
      dropSection('experience');
    }

    if (list(R.other).length) {
      $('#otherTrack').innerHTML = R.other.map(function (o, i) {
        var stunt = o.flip ? ' data-flip="' + esc(o.flip) + '"' : o.spin ? ' data-spin="' + esc(o.spin) + '"' : '';
        var href = safeHref(o.href);
        // карточка с фото: снимок фоном под затемняющим градиентом
        if (o.image) stunt += ' data-media style="background-image:linear-gradient(rgba(0,0,0,.1),rgba(0,0,0,.82) 78%),url(' + esc(encodeURI(o.image)) + ')"';
        return '<article class="other-card"' + stunt + '><span class="other-card__num" aria-hidden="true">' + pad(i + 1) + '</span>' +
          '<h3>' + esc(o.title) + '</h3><p>' + esc(o.text) + '</p>' +
          (href ? '<a class="other-card__link" href="' + esc(href) + '" target="_blank" rel="noopener">' + esc(o.linkLabel || t('watch')) + ' ↗</a>' : '') +
          (o.spin ? '<svg class="other-card__glider" viewBox="0 0 64 28" aria-hidden="true"><path fill="currentColor" d="M2 14 L50 12 Q62 14 50 16 Z M29 14 L23 0 L29 0 L37 14 L29 28 L23 28 Z M5 14 L2 8 L6 8 L9 14 L6 20 L2 20 Z"/></svg>' : '') +
          (list(o.gallery).length ? '<button class="other-card__link" type="button" data-gallery="' + i + '">' + esc(t('gallery')) + ' →</button>' : '') +
        '</article>';
      }).join('');
      $('#otherTotal').textContent = pad(R.other.length);
    } else {
      dropSection('other');
    }

    var cgi = R.cgi;
    if (cgi && list(cgi.steps).length) {
      if (cgi.studio) $('#cgiStudio').textContent = cgi.studio;
      else $('#cgiStudio').remove();
      $('#cgiIntro').textContent = cgi.intro || '';
      $('#pipeOf').textContent = '/ ' + pad(cgi.steps.length);
      $('#pipeSteps').innerHTML = cgi.steps.map(function (s, i) {
        var tools = chips(s.tools);
        return '<li class="pipe-step"><span class="pipe-step__n">' + pad(i + 1) + '</span><h3>' + esc(s.title) + '</h3><p>' + esc(s.text) + '</p>' +
          (tools ? '<ul class="tags">' + tools + '</ul>' : '') + '</li>';
      }).join('');
    } else {
      dropSection('cgi');
    }

    if (list(R.skills).length || list(R.languages).length) {
      $('#skillGroups').innerHTML = list(R.skills).map(function (g) {
        return '<div class="skill-group"><h3>' + esc(g.group) + '</h3><ul>' + chips(g.items) + '</ul></div>';
      }).join('');
      $('#langs').innerHTML = list(R.languages).map(function (l) {
        var dots = '';
        for (var i = 1; i <= 5; i++) dots += '<i' + (i <= (l.score || 0) ? ' class="is-on"' : '') + '></i>';
        return '<div class="lang"><span class="lang__name">' + esc(l.name) + '</span>' +
          '<span class="lang__level">' + esc(l.level) + '</span>' +
          (l.score ? '<span class="lang__dots" aria-hidden="true">' + dots + '</span>' : '') + '</div>';
      }).join('');
    } else {
      dropSection('skills');
    }

    var edu = eduRows(t('eduHigher'), R.education) + eduRows(t('eduSchool'), R.schools) + eduRows(t('eduCourses'), R.courses);
    if (edu) $('#edu').innerHTML = eduAxis(list(R.schools).concat(list(R.education))) + edu;
    else dropSection('education');

    $('#contactList').innerHTML = list(R.contacts).map(function (c) {
      var href = safeHref(c.href);
      var inner = '<span class="contact__label">' + esc(c.label) + '</span>' +
        '<span class="contact__value">' + esc(c.value) + '</span>' +
        (href ? '<span class="contact__arrow" aria-hidden="true">↗</span>' : '');
      var ext = /^https?:/i.test(href) ? ' target="_blank" rel="noopener"' : '';
      return '<li data-reveal>' + (href
        ? '<a class="contact" href="' + esc(href) + '"' + ext + '>' + inner + '</a>'
        : '<div class="contact">' + inner + '</div>') + '</li>';
    }).join('');

    var hashtags = list(R.hashtags);
    if (hashtags.length) {
      $('#hashtags').innerHTML = hashtags.map(function (h) { return '<li>' + esc(h) + '</li>'; }).join('');
      $('meta[name="keywords"]').setAttribute('content', hashtags.join(', '));
    } else {
      $('#hashtags').remove();
    }

    // Нумерация заголовков — по фактически оставшимся разделам
    $$('.section__num').forEach(function (n, i) { n.textContent = pad(i + 1); });

    $('#footerBig').textContent = name;
    $('#copyright').textContent = '© ' + new Date().getFullYear() + (name ? ' ' + name : '');
    var src = $('#sourceLink');
    if (safeHref(R.sourceUrl)) { src.href = R.sourceUrl; src.hidden = false; }
  }

  /* ---------- GymChess: кадры комикса и инфографика ----------
     Кадры нарисованы кодом (SVG 320×230): линии наследуют цвет игрока (.p1 — акцент, .p2 — чернила),
     поэтому комикс сам перекрашивается в тёмной теме. Подписи и реплики приходят из data.js */
  function gcLine(x1, y1, x2, y2, cls) {
    return '<line' + (cls ? ' class="' + cls + '"' : '') + ' x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"/>';
  }
  // Человечек: голова в (x, y), ступни на y + 90. pose: stand | win
  function gcPerson(cls, x, y, pose) {
    var arms = pose === 'win'
      ? gcLine(x, y + 22, x - 21, y - 8) + gcLine(x, y + 22, x + 21, y - 8)
      : gcLine(x, y + 22, x - 15, y + 50) + gcLine(x, y + 22, x + 15, y + 50);
    return '<g class="' + cls + '"><circle cx="' + x + '" cy="' + y + '" r="11"/>' + gcLine(x, y + 11, x, y + 54) +
      gcLine(x, y + 54, x - 13, y + 90) + gcLine(x, y + 54, x + 13, y + 90) + arms + '</g>';
  }
  function gcBar(x1, x2, y) {
    return '<path class="p2" d="M' + x1 + ' 206V' + y + 'M' + x2 + ' 206V' + y + 'M' + (x1 - 12) + ' ' + y + 'H' + (x2 + 12) + '"/>';
  }
  function gcClock(cls, x, y, text, tick) {
    return '<g class="' + cls + '"><rect x="' + x + '" y="' + y + '" width="92" height="36" rx="9"/>' +
      '<text class="t"' + (tick ? ' data-tick="' + tick + '"' : '') + ' x="' + (x + 46) + '" y="' + (y + 26) + '" text-anchor="middle">' + text + '</text></g>';
  }
  var GC_GROUND = '<line class="soft" x1="8" y1="206" x2="312" y2="206"/>';

  function gcPanels() {
    var steps = '';
    for (var i = 1; i <= 7; i++) {
      steps += '<rect class="gc-fill gc-step' + (i === 7 ? ' is-now' : '') + '" x="' + (168 + (i - 1) * 19) + '" y="' + (206 - i * 15) + '" width="13" height="' + (i * 15) + '" rx="3"/>';
    }
    return [
      // 1. Двое у турника, телефон с двумя часами
      GC_GROUND + gcBar(112, 208, 70) + gcPerson('p1', 56, 116, 'stand') + gcPerson('p2', 264, 116, 'stand') +
        '<g class="p2"><rect x="131" y="134" width="58" height="72" rx="9"/>' + gcLine(139, 170, 181, 170, 'soft') + '</g>' +
        '<text class="t t--sm p1" x="160" y="160" text-anchor="middle">10:00</text><text class="t t--sm p2" x="160" y="192" text-anchor="middle">10:00</text>',

      // 2. Игрок 1 подтягивается — идут его часы; у соперника часы стоят
      GC_GROUND + gcBar(96, 196, 34) +
        '<g class="p1 gc-hang"><g class="gc-hang__body"><circle cx="146" cy="68" r="11"/>' + gcLine(146, 79, 146, 122) + gcLine(146, 122, 136, 156) + gcLine(146, 122, 158, 152) + '</g>' +
        gcLine(132, 34, 146, 90, 'gc-hang__arm') + gcLine(160, 34, 146, 90, 'gc-hang__arm') + '</g>' +
        gcPerson('p2', 268, 116, 'stand') + gcClock('p1', 10, 118, '09:41', '581:560') +
        '<text class="t t--sm soft" x="56" y="176" text-anchor="middle">10:00</text>',

      // 3. Лесенка выросла, игрок устал, время тает
      GC_GROUND + '<g class="p1"><circle cx="112" cy="116" r="11"/>' + gcLine(90, 160, 106, 126) + gcLine(90, 160, 80, 206) + gcLine(90, 160, 104, 206) +
        gcLine(104, 132, 96, 176) + gcLine(104, 132, 112, 178) + '</g>' +
        '<path class="gc-fill gc-sweat" d="M134 92q5 8 0 12q-5-4 0-12z"/><path class="gc-fill gc-sweat" d="M146 112q5 8 0 12q-5-4 0-12z"/><path class="gc-fill gc-sweat" d="M128 124q5 8 0 12q-5-4 0-12z"/>' +
        steps + '<text class="t t--sm p1" x="289" y="94" text-anchor="middle">×7</text>' + gcClock('gc-red', 214, 12, '01:12', '72:55'),

      // 4. Флаг упал: у проигравшего 00:00, победитель с кубком
      GC_GROUND + gcPerson('p2', 96, 116, 'win') +
        '<g class="gc-gold gc-trophy"><path d="M82 46h28v12a14 14 0 0 1-28 0zM96 72v12M86 86h20M82 50h-8a8 8 0 0 0 8 10M110 50h8a8 8 0 0 1-8 10"/></g>' +
        '<g class="gc-phone"><g class="p2"><rect x="196" y="78" width="96" height="128" rx="13"/></g>' +
        '<text class="t gc-red gc-zero" x="244" y="152" text-anchor="middle">00:00</text>' +
        '<g class="gc-red gc-flag">' + gcLine(244, 78, 244, 50) + '<path d="M244 50l22 8l-22 8"/></g></g>' +
        '<circle class="gc-fill gc-gold gc-confetti" cx="40" cy="60" r="4"/><circle class="gc-fill p1 gc-confetti" cx="150" cy="40" r="4"/><circle class="gc-fill gc-gold gc-confetti" cx="164" cy="96" r="3"/><circle class="gc-fill p1 gc-confetti" cx="34" cy="120" r="3"/>'
    ];
  }

  /* Поза для иллюстрации распознавания. lift — на сколько поднялись плечи (0 — вис, 42 — подбородок над перекладиной).
     Запястья закреплены на перекладине, локоть находится обратной кинематикой (две кости равной длины).
     Возвращает угол в локте и признак «подбородок выше перекладины» — по ним работает автомат состояний */
  function gcPose(lift) {
    var body = document.getElementById('gcBody');
    if (!body) return null;
    var BAR = 64, BONE = 24, sy = 111 - lift;
    body.setAttribute('transform', 'translate(0,' + (-lift) + ')');
    var angle = 0;
    [['L', 128, 120, -1], ['R', 156, 164, 1]].forEach(function (a) {
      var sx = a[1], wx = a[2], dx = wx - sx, dy = BAR - sy;
      var d = Math.min(Math.hypot(dx, dy), BONE * 2 - 0.01);
      var h = Math.sqrt(BONE * BONE - d * d / 4);
      var mx = (sx + wx) / 2, my = (sy + BAR) / 2;
      var px = -dy / d, py = dx / d;          // перпендикуляр к линии плечо—запястье
      if (px * a[3] < 0) { px = -px; py = -py; } // локоть — наружу
      var ex = mx + px * h, ey = my + py * h;
      var up = document.getElementById('gcU' + a[0]), fo = document.getElementById('gcF' + a[0]);
      up.setAttribute('x1', sx); up.setAttribute('y1', sy); up.setAttribute('x2', ex); up.setAttribute('y2', ey);
      fo.setAttribute('x1', ex); fo.setAttribute('y1', ey); fo.setAttribute('x2', wx); fo.setAttribute('y2', BAR);
      var ke = document.getElementById('gcKE' + a[0]), ks = document.getElementById('gcKS' + a[0]);
      ke.setAttribute('cx', ex); ke.setAttribute('cy', ey); ks.setAttribute('cx', sx); ks.setAttribute('cy', sy);
      angle = Math.acos(Math.max(-1, Math.min(1, 1 - d * d / (2 * BONE * BONE)))) * 180 / Math.PI;
    });
    var chinY = 93 - lift + 11;
    var chin = document.getElementById('gcKChin'), hip = document.getElementById('gcKHip');
    chin.setAttribute('cx', 142); chin.setAttribute('cy', chinY);
    hip.setAttribute('cx', 142); hip.setAttribute('cy', 160 - lift);
    document.getElementById('gcAngle').textContent = '∠ ' + Math.round(angle) + '°';
    return { angle: angle, chinAbove: chinY < BAR - 1 };
  }

  function renderGymChess() {
    var G = R.gymchess;
    if (!G) { dropSection('gymchess'); return; }
    $('#gcKicker').textContent = G.kicker || '';
    $('#gcTagline').textContent = G.tagline || '';
    $('#gcLead').textContent = G.lead || '';
    var repo = $('#gcRepo');
    if (safeHref(G.repo)) { repo.href = G.repo; repo.textContent = (G.repoLabel || 'GitHub') + ' ↗'; }
    else repo.parentNode.remove();

    var art = gcPanels();
    // где висит реплика и с какой стороны хвостик (он указывает на говорящего)
    var bubblePos = ['right:5%;top:4%', 'right:3%;top:21%', 'left:14%;top:10%;max-width:46%', 'left:37%;top:5%'];
    var bubbleTail = ['r', 'r', 'l', 'l'];
    $('#gcComic').innerHTML = list(G.comic).slice(0, art.length).map(function (p, i) {
      return '<li class="comic__panel"><div class="comic__frame"><span class="comic__num">' + (i + 1) + '</span>' +
        (p.bubble ? '<p class="comic__bubble comic__bubble--' + bubbleTail[i] + '" style="' + bubblePos[i] + '">' + esc(p.bubble) + '</p>' : '') +
        '<svg class="comic__art" viewBox="0 0 320 230" role="img" aria-label="' + esc(p.caption) + '">' + art[i] + '</svg></div>' +
        '<p class="comic__caption">' + esc(p.caption) + '</p></li>';
    }).join('');


    // «Как засчитываются подтягивания»: слева — как есть сейчас, справа — концепт автоподсчёта (так и подписан)
    var C = G.counting;
    if (C && C.now && C.next) {
      var L = C.next.labels || {};
      var nowArt = '<svg class="comic__art gc-now" viewBox="0 0 260 190" aria-hidden="true">' +
        '<g class="p2"><rect x="72" y="8" width="116" height="176" rx="18"/></g>' +
        '<rect class="gc-active" id="gcNowHi" x="82" y="26" width="96" height="40" rx="10"/>' +
        '<text class="t p1" id="gcNowA" x="130" y="54" text-anchor="middle">08:12</text>' +
        '<text class="t p2" id="gcNowB" x="130" y="102" text-anchor="middle">09:30</text>' +
        '<g id="gcNowBtn"><rect class="gc-btn" x="84" y="132" width="92" height="34" rx="17"/>' +
        '<text class="gc-btn-t" x="130" y="154" text-anchor="middle">' + esc(C.now.button) + '</text></g>' +
        '<circle class="p1 gc-thin" id="gcNowTap" cx="130" cy="149" r="16"/></svg>';

      var nextArt = '<div class="gc-pose"><svg class="comic__art gc-pose__cam" viewBox="0 0 284 300" role="img" aria-label="' + esc(C.next.title) + '">' +
        // «видоискатель» камеры
        '<g class="soft"><rect x="14" y="14" width="256" height="272" rx="20"/></g>' +
        '<g class="p2 gc-thin"><path d="M30 50V30H50M234 30H254V50M254 250V270H234M50 270H30V250"/></g>' +
        '<circle class="gc-fill gc-red" cx="44" cy="44" r="4" id="gcRec"/>' +
        '<line class="gc-dash gc-ok" x1="24" y1="64" x2="262" y2="64"/>' +
        '<text class="t t--xs gc-ok" x="258" y="58" text-anchor="end">' + esc(L.bar) + '</text>' +
        '<g transform="translate(-50,-22) scale(1.35)">' +
        '<g class="p2"><line x1="70" y1="64" x2="214" y2="64" stroke-width="6"/></g>' +
        // фигура: плечи/голова/корпус двигаются, локти считаются обратной кинематикой
        '<g class="p1"><g id="gcBody"><circle cx="142" cy="93" r="11"/><line x1="128" y1="111" x2="156" y2="111"/><line x1="142" y1="111" x2="142" y2="160"/>' +
        '<line x1="142" y1="160" x2="132" y2="196"/><line x1="142" y1="160" x2="156" y2="192"/></g>' +
        '<line id="gcUL"/><line id="gcFL"/><line id="gcUR"/><line id="gcFR"/></g>' +
        '<g id="gcDots"><circle class="kp" r="4.5" cx="120" cy="64"/><circle class="kp" r="4.5" cx="164" cy="64"/>' +
        '<circle class="kp" r="4.5" id="gcKEL"/><circle class="kp" r="4.5" id="gcKER"/><circle class="kp" r="4.5" id="gcKSL"/><circle class="kp" r="4.5" id="gcKSR"/>' +
        '<circle class="kp" r="4.5" id="gcKChin"/><circle class="kp" r="4.5" id="gcKHip"/></g></g>' +
        '<text class="t t--xs p2" id="gcAngle" x="262" y="176" text-anchor="end">∠ 170°</text>' +
        '<text class="t t--xs gc-muted" x="262" y="190" text-anchor="end">' + esc(L.angle) + '</text>' +
        '<rect class="gc-pill" id="gcStateBox" x="30" y="236" width="86" height="26" rx="13"/>' +
        '<text class="gc-pill-t" id="gcState" x="73" y="254" text-anchor="middle">' + esc(L.down) + '</text>' +
        '<text class="t p1" id="gcReps" x="250" y="258" text-anchor="end">×0</text>' +
        '<text class="t t--xs gc-muted" x="250" y="236" text-anchor="end">' + esc(L.reps) + '</text>' +
        // сигнал: высота подбородка во времени и два порога (гистерезис)
        '</svg><svg class="comic__art gc-pose__sig" viewBox="290 0 346 300" aria-hidden="true">' +
        '<text class="t t--xs gc-muted" x="300" y="30">' + esc(L.signal) + '</text>' +
        '<g class="soft gc-thin"><path d="M300 40V220H624"/></g>' +
        '<line class="gc-dash gc-ok" x1="300" y1="72" x2="624" y2="72"/><text class="t t--xs gc-ok" x="622" y="58" text-anchor="end">' + esc(L.high) + '</text>' +
        '<line class="gc-dash gc-muted" x1="300" y1="200" x2="624" y2="200"/><text class="t t--xs gc-muted" x="622" y="214" text-anchor="end">' + esc(L.low) + '</text>' +
        '<path class="p1" id="gcSignal" stroke-width="3"/><g id="gcMarks"></g>' +
        '<text class="t t--xs" id="gcVerdict" x="462" y="250" text-anchor="middle"></text>' +
        '<text class="t t--xs gc-muted" x="462" y="278" text-anchor="middle">' + esc(L.rule) + '</text></svg></div>';

      $('#gcCount').innerHTML = '<h3 class="gc-count__title" data-reveal>' + esc(C.title) + '</h3><div class="gc-count__grid">' +
        '<article class="gc-count__card" data-reveal><span class="gc-badge">' + esc(C.now.badge) + '</span><h4>' + esc(C.now.title) + '</h4><p>' + esc(C.now.text) + '</p><div class="gc-count__art">' + nowArt + '</div></article>' +
        '<article class="gc-count__card gc-count__card--concept" data-reveal><span class="gc-badge gc-badge--concept">' + esc(C.next.badge) + '</span><h4>' + esc(C.next.title) + '</h4><p>' + esc(C.next.text) + '</p><div class="gc-count__art">' + nextArt + '</div></article></div>';
      gcPose(0); // статичная поза, если анимаций не будет
    } else {
      $('#gcCount').remove();
    }

    var facts = list(G.facts).map(function (f) {
      var num = f.text ? '<span>' + esc(f.text) + '</span>' : '<span data-count="' + esc(f.value) + '">' + esc(f.value) + '</span>';
      return '<div class="stat" data-reveal><dt>' + num + '</dt><dd>' + esc(f.label) + '</dd></div>';
    }).join('');
    var ladders = list(G.ladders).map(function (l, i) {
      var max = Math.max.apply(null, list(l.steps).concat([1]));
      var bars = list(l.steps).map(function (s) { return '<i style="height:' + Math.round(s / max * 100) + '%"></i>'; }).join('');
      // первая лесенка общая (ступени по очереди) — полосатая; остальные у каждого свои — одноцветные
      return '<div class="gc-ladder' + (i ? ' gc-ladder--own' : '') + '" data-reveal><div class="gc-ladder__bars">' + bars + '</div>' +
        '<p class="gc-ladder__name">' + esc(l.name) + '<span>' + esc(l.pattern) + '</span></p><p class="gc-ladder__note">' + esc(l.note) + '</p></div>';
    }).join('');
    var flow = list(G.flow).map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('');
    var potential = list(G.potential).map(function (p) { return '<li data-reveal>' + esc(p) + '</li>'; }).join('');

    $('#gcInfo').innerHTML =
      (facts ? '<dl class="gc__facts">' + facts + '</dl>' : '') +
      '<div>' + (ladders ? '<p class="gc__h" data-reveal>' + esc(G.laddersTitle) + '</p><div class="gc__ladders">' + ladders + '</div>' : '') + '</div>' +
      '<div>' +
        (flow ? '<p class="gc__h" data-reveal>' + esc(G.flowTitle) + '</p><ol class="gc__flow"><span class="gc__flow-line" aria-hidden="true"></span>' + flow + '</ol>' : '') +
        (list(G.stack).length ? '<p class="gc__h" data-reveal>' + esc(G.stackTitle) + '</p><ul class="gc__chips">' + chips(G.stack) + '</ul>' : '') +
        (potential ? '<p class="gc__h" data-reveal>' + esc(G.potentialTitle) + '</p><ul class="gc__potential">' + potential + '</ul>' : '') +
      '</div>';
  }

  /* ---------- «Айсберг»: город проектов ---------- */

  // Детерминированный генератор: город одинаковый при каждой загрузке
  var seed = 11;
  function rnd() {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  }

  var NEON = ['#ff4fa3', '#ffd23f', '#39e6ff', '#9dff6a'];

  // Горящие окна ставятся точно в ячейки CSS-сетки окон (шаг 10×14, окно с отступом 3×6)
  function windows(cols, rows, max, share) {
    var n = Math.min(max, Math.round(cols * rows * share));
    var html = '';
    for (var i = 0; i < n; i++) {
      html += '<i class="win" style="left:' + (3 + 10 * Math.floor(rnd() * cols)) + 'px;top:' + (6 + 14 * Math.floor(rnd() * rows)) + 'px"></i>';
    }
    return html;
  }

  function renderIceberg(live) {
    var B = R.iceberg;
    var sec = $('#iceberg');
    if (!B || !list(B.projects).length) { dropSection('iceberg'); return; }

    // В «живой» сцене море глубокое (в него ныряет камера), в статичной — компактное
    var DEPTH = live ? 190 : 110;
    sec.style.setProperty('--depth', DEPTH + 'vh');

    $('#bergKicker').textContent = B.kicker || '';
    $('#bergTitle').textContent = B.title || '';
    $('#bergTip').textContent = B.tip || '';
    $('#bergUnit').textContent = B.unit || '';

    var W = root.clientWidth;
    var VH = window.innerHeight / 100;
    var small = W < 600;
    var n = Math.max(10, Math.min(B.projects.length, Math.floor(W * 0.92 / (small ? 22 : 30))));
    var items = B.projects.slice().sort(function (a, b) { return b.gb - a.gb; }).slice(0, n);
    var max = items[0].gb || 1;

    // Самые крупные проекты — в центре, мелкие — к краям: получается силуэт айсберга
    var slots = [];
    var center = Math.floor(n / 2);
    items.forEach(function (p, rank) {
      slots[center + Math.ceil(rank / 2) * (rank % 2 ? -1 : 1)] = { p: p, rank: rank };
    });

    var weights = slots.map(function (s) { return s.rank === 0 ? 1.7 : 0.8 + rnd() * 0.5; });
    var sum = weights.reduce(function (a, b) { return a + b; }, 0);
    var SPAN = 92, GAP = 0.4;
    var x = (100 - SPAN) / 2;

    var city = slots.map(function (s, i) {
      var w = weights[i] / sum * SPAN;
      var left = x;
      x += w;
      var wpx = (w - GAP) / 100 * W;
      var top = (3 + 12 * Math.pow(1 - s.rank / n, 1.7) + rnd() * 2.5) * (small ? 0.7 : 1); // над водой, vh
      var deep = 12 + Math.pow(s.p.gb / max, 0.28) * (DEPTH - 28);                           // под водой, vh (степень сглаживает разрыв 218 ГБ ↔ 0.03 ГБ)
      var cols = Math.max(1, Math.floor((wpx - 3) / 10));

      var roof = '';
      if (s.rank === 0) {
        // центральная башня с уступами и шпилем — привет Эмпайр-стейт
        roof = '<i class="bld__crown" style="left:20%;width:60%;bottom:' + top + 'vh;height:3vh"></i>' +
          '<i class="bld__crown" style="left:36%;width:28%;bottom:' + (top + 3) + 'vh;height:2vh"></i>' +
          '<i class="bld__crown" style="left:calc(50% - 1px);width:2px;bottom:' + (top + 5) + 'vh;height:3vh"></i>';
      } else if (wpx >= 18 && s.rank % 3 === 1) {
        roof = '<i class="bld__tank" style="bottom:calc(' + top + 'vh + 4px)"></i>';
      }
      var neon = wpx >= 24 && deep >= 40
        ? '<span class="bld__neon" style="--neon:' + NEON[i % NEON.length] + '">' + esc(s.p.name) + '</span>'
        : '';

      return '<div class="bld" style="left:' + left + '%;width:' + (w - GAP) + '%">' +
        '<div class="bld__top" style="height:' + top + 'vh">' + windows(cols, Math.floor(top * VH / 14), 6, 0.12) + '</div>' + roof +
        '<div class="bld__deep" style="height:' + deep + 'vh">' + neon + windows(cols, Math.floor(deep * VH / 14), 9, 0.04) + '</div>' +
      '</div>';
    }).join('');

    // Неоновые вывески на разной глубине
    var signX = small ? [4, 46, 8, 40, 22] : [6, 66, 12, 60, 34];
    var signs = list(B.brands).slice(0, signX.length).map(function (b, i) {
      return '<div class="berg__sign" style="left:' + signX[i] + '%;top:' + (DEPTH * (0.14 + i * 0.16)) + 'vh;--neon:' + NEON[i % NEON.length] +
        ';rotate:' + (i % 2 ? 3 : -4) + 'deg">' + esc(b) + '</div>';
    }).join('');
    // Гигантская контурная цифра в бездне — рисуется под зданиями
    var abyss = B.total ? '<div class="berg__abyss" style="top:' + (DEPTH - 40) + 'vh">' + esc(B.total) + ' ' + esc(B.unit || '') + '</div>' : '';
    $('#bergCity').innerHTML = abyss + city + signs;

    var stars = '';
    for (var i = 0; i < 60; i++) {
      stars += '<i style="left:' + (rnd() * 100) + '%;top:' + (rnd() * 72) + '%;opacity:' + (0.3 + rnd() * 0.7) + '"></i>';
    }
    $('#bergStars').innerHTML = stars;

    var bubbles = '';
    for (var j = 0; j < 14; j++) {
      var d = 4 + Math.round(rnd() * 10);
      bubbles += '<i style="left:' + (rnd() * 100) + '%;width:' + d + 'px;height:' + d + 'px"></i>';
    }
    $('#bergBubbles').innerHTML = bubbles;

    var tick = [];
    while (tick.length < 12 && list(B.ticker).length) tick = tick.concat(B.ticker);
    var tickHtml = tick.map(function (t) { return '<span>' + esc(t) + ' ●</span>'; }).join('');
    $('#bergTicker').innerHTML = tickHtml + tickHtml;

    $('#bergStops').innerHTML = list(B.stops).map(function (s) {
      // как в метро: на светлых линиях (жёлтая N) буква чёрная
      var c = parseInt(String(s.color).slice(1), 16);
      var light = 0.299 * (c >> 16) + 0.587 * (c >> 8 & 255) + 0.114 * (c & 255) > 180;
      return '<li class="berg__stop"><span class="berg__bullet" style="--c:' + esc(s.color) + (light ? ';--t:#111' : '') + '">' + esc(s.line) + '</span>' +
        '<b class="berg__value">' + esc(s.value) + '</b><span class="berg__label">' + esc(s.label) + '</span></li>';
    }).join('');
  }

  /* ---------- График телеметрии в макете телефона ---------- */

  // Линия шире окна графика: группа едет влево на один шаг, затем точки сдвигаются — получается бесконечная лента
  function makeChart() {
    var line = $('#chartLine');
    var area = $('#chartArea');
    if (!line) return null;

    var STEP = 16, COUNT = 20, H = 90;
    var pts = [], y = 48;
    // input (необязательно): level 0..1 — высота курсора, energy 0..1 — скорость мыши.
    // Линия тянется к уровню курсора, а шум тем сильнее, чем быстрее двигают мышь. Без input — случайное блуждание
    function next(input) {
      if (input && input.level != null) y += (72 - input.level * 56 - y) * 0.5 + (Math.random() - 0.5) * (5 + input.energy * 42);
      else y += (Math.random() - 0.5) * 32;
      y = Math.max(12, Math.min(76, y));
      return y;
    }
    function x(i) { return (i - 2) * STEP; }
    function draw() {
      var d = 'M' + x(0) + ' ' + pts[0];
      for (var i = 1; i < COUNT - 1; i++) {
        d += ' Q' + x(i) + ' ' + pts[i] + ' ' + (x(i) + STEP / 2) + ' ' + ((pts[i] + pts[i + 1]) / 2);
      }
      line.setAttribute('d', d);
      area.setAttribute('d', d + ' L' + (x(COUNT - 2) + STEP / 2) + ' ' + H + ' L' + x(0) + ' ' + H + ' Z');
    }
    for (var i = 0; i < COUNT; i++) pts.push(next());
    draw();

    return {
      step: STEP,
      // сдвигает ленту на одну точку и возвращает свежее «показание»
      shift: function (input) {
        pts.shift();
        pts.push(next(input));
        draw();
        return 18 + (H - pts[COUNT - 4]) / H * 14;
      }
    };
  }

  /* ---------- Галерея ----------
     Нативный <dialog>: фокус-ловушка и Esc из коробки. Содержимое создаётся при открытии,
     поэтому видео не качается, пока его не попросили */
  function initLightbox(motion) {
    var box = $('#lightbox');
    if (!box || !box.showModal) return;
    var grid = $('.lightbox__grid', box);
    var gsap = window.gsap;

    function finish() {
      box.close();
      grid.innerHTML = '';
      if (motion) gsap.set(box, { clearProps: 'all' });
    }
    function close() {
      var v = $('video', box);
      if (v) v.pause();
      if (!motion) { finish(); return; }
      gsap.to(box, { autoAlpha: 0, scale: 0.96, y: 20, duration: 0.25, ease: 'power2.in', onComplete: finish });
    }

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-gallery]');
      if (!btn) return;
      var card = list(R.other)[+btn.dataset.gallery];
      if (!card) return;
      $('.lightbox__title', box).textContent = card.title || '';
      $('.lightbox__text', box).textContent = card.text || '';
      grid.innerHTML = list(card.gallery).map(function (m) {
        if (m.video) {
          return '<video controls playsinline preload="metadata"' + (m.poster ? ' poster="' + esc(encodeURI(m.poster)) + '"' : '') + '>' +
            '<source src="' + esc(encodeURI(m.video)) + '" type="video/mp4"></video>';
        }
        return '<img src="' + esc(encodeURI(m.src)) + '" alt="' + esc(m.alt) + '" loading="lazy">';
      }).join('');
      box.showModal();
      if (!motion) return;
      gsap.fromTo(box, { autoAlpha: 0, scale: 0.94, y: 34 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.5, ease: 'power3.out' });
      gsap.from(grid.children, { autoAlpha: 0, y: 30, duration: 0.6, stagger: 0.08, delay: 0.15, ease: 'power3.out' });
    });

    box.addEventListener('cancel', function (e) { e.preventDefault(); close(); }); // Esc — тоже через анимацию
    box.addEventListener('click', function (e) {
      if (e.target === box || e.target.closest('.lightbox__close')) close();
    });
  }

  /* ---------- 3D-голова ----------
     Из одного фото настоящую 3D-модель не получить, поэтому приём такой: фрагментный шейдер считает область головы
     поверхностью эллипсоида, поворачивает её (yaw/pitch) и для каждого пикселя берёт цвет из той точки фото, которая
     оказалась бы здесь после поворота. К краю эллипса смещение плавно гаснет — шва с фоном нет. Углы небольшие:
     дальше ~20° плоское фото уже выдаёт себя. Без WebGL остаётся обычная картинка. */
  function initHead3D(fig) {
    var img = $('img', fig);
    var canvas = document.createElement('canvas');
    var gl = canvas.getContext('webgl', { antialias: true, alpha: false });
    if (!img || !gl) return null;

    // Эллипсоид заметно больше самой головы: его кромка должна приходиться на ровный фон. На кромке шейдеру нечем
    // заполнять «открывшуюся» при повороте полосу, он растягивает соседние пиксели — на однотонной стене этого не видно,
    // а на ухе или волосах было бы. Центр — примерно на уровне ушей, это ось поворота головы
    var HEAD = { cx: 0.52, cy: 0.47, rx: 0.41, ry: 0.385 };
    var FOCUS = { x: 0.5, y: 0.22 }; // как object-position у исходной картинки
    var ZOOM = 1.06;                  // запас по краям, чтобы смещения не вытаскивали «пустоту»
    var MAX_YAW = 0.3, MAX_PITCH = 0.17;

    var VS = 'attribute vec2 a; varying vec2 v; void main(){ v = a * 0.5 + 0.5; gl_Position = vec4(a, 0.0, 1.0); }';
    var FS = [
      'precision highp float;',
      'varying vec2 v;',
      'uniform sampler2D tex;',
      'uniform vec2 look;', // x — поворот вправо (yaw), y — наклон вниз (pitch), радианы
      'uniform vec4 fit;',  // xy — масштаб, zw — сдвиг: uv рамки → uv фото (аналог object-fit: cover)
      'uniform vec2 hc;',
      'uniform vec2 hr;',
      'void main(){',
      '  vec2 uv = fit.zw + vec2(v.x, 1.0 - v.y) * fit.xy;',
      '  vec2 p = (uv - hc) / hr;',
      '  float r2 = dot(p, p);',
      '  vec2 off = vec2(0.0);',
      '  float shade = 1.0;',
      '  if (r2 < 1.0) {',
      '    float z = sqrt(1.0 - r2);',
      '    float cy = cos(look.x), sy = sin(look.x), cp = cos(look.y), sp = sin(look.y);',
      '    vec3 q = vec3(p.x, p.y * cp - z * sp, p.y * sp + z * cp);', // обратный наклон
      '    q = vec3(q.x * cy - q.z * sy, q.y, q.x * sy + q.z * cy);',   // обратный поворот
      '    float w = smoothstep(0.0, 0.6, z) * smoothstep(-0.1, 0.3, q.z);',
      '    off = (q.xy - p) * hr * w;',
      '    shade = 1.0 - 0.22 * w * clamp(-p.x * sy * 2.2, 0.0, 1.0);', // дальняя щека чуть уходит в тень
      '  }',
      '  float body = smoothstep(hc.y + hr.y * 0.8, hc.y + hr.y * 1.3, uv.y);',
      '  off += look * vec2(-0.014, 0.008) * body;', // плечи слегка остаются на месте — параллакс
      '  vec3 c = texture2D(tex, clamp(uv + off, 0.002, 0.998)).rgb;',
      '  gl_FragColor = vec4(c * shade, 1.0);',
      '}'
    ].join('\n');

    function compile(type, src) {
      var sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null;
    }
    var vs = compile(gl.VERTEX_SHADER, VS), fs = compile(gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) return null;
    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    gl.useProgram(prog);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var U = { look: gl.getUniformLocation(prog, 'look'), fit: gl.getUniformLocation(prog, 'fit') };
    gl.uniform2f(gl.getUniformLocation(prog, 'hc'), HEAD.cx, HEAD.cy);
    gl.uniform2f(gl.getUniformLocation(prog, 'hr'), HEAD.rx, HEAD.ry);

    var ready = false, dirty = true;
    var cur = { x: 0, y: 0 };

    function resize() {
      var r = fig.getBoundingClientRect();
      if (!r.width || !r.height || !img.naturalWidth) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      var box = r.width / r.height, pic = img.naturalWidth / img.naturalHeight;
      var sx = box > pic ? 1 : box / pic, sy = box > pic ? pic / box : 1;
      sx /= ZOOM; sy /= ZOOM;
      gl.uniform4f(U.fit, sx, sy, (1 - sx) * FOCUS.x, (1 - sy) * FOCUS.y);
      dirty = true;
    }
    function upload() {
      var tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      ready = true;
      resize();
      fig.appendChild(canvas);
      fig.classList.add('is-3d');
    }
    if (img.complete && img.naturalWidth) upload();
    else img.addEventListener('load', upload, { once: true });
    if (window.ResizeObserver) new ResizeObserver(resize).observe(fig);

    return {
      canvas: canvas,
      maxYaw: MAX_YAW,
      maxPitch: MAX_PITCH,
      // плавно ведёт голову к цели; k — доля пути за кадр. Рисует только когда что-то изменилось
      step: function (tx, ty, k) {
        var dx = tx - cur.x, dy = ty - cur.y;
        if (Math.abs(dx) > 0.0004 || Math.abs(dy) > 0.0004) { cur.x += dx * k; cur.y += dy * k; dirty = true; }
        if (!ready || !dirty) return;
        dirty = false;
        gl.uniform2f(U.look, cur.x, cur.y);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
    };
  }

  /* ---------- Тема ---------- */

  function initTheme() {
    var btn = $('#theme');
    var busy = false;

    function apply(theme) {
      root.dataset.theme = theme;
      try { localStorage.setItem('theme', theme); } catch (e) {}
    }

    btn.addEventListener('click', function () {
      var dark = root.dataset.theme
        ? root.dataset.theme === 'dark'
        : window.matchMedia('(prefers-color-scheme: dark)').matches;
      var next = dark ? 'light' : 'dark';

      if (!window.gsap || busy || window.matchMedia(REDUCE).matches) { apply(next); return; }

      // Новая тема «разливается» кругом из кнопки
      busy = true;
      var r = btn.getBoundingClientRect();
      var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      var radius = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy));
      var wipe = document.createElement('div');
      wipe.className = 'theme-wipe';
      wipe.style.background = next === 'dark' ? '#0d0d0f' : '#f5f4ef';
      document.body.appendChild(wipe);

      window.gsap.timeline({ onComplete: function () { wipe.remove(); busy = false; } })
        .fromTo(wipe,
          { clipPath: 'circle(0px at ' + cx + 'px ' + cy + 'px)' },
          { clipPath: 'circle(' + radius + 'px at ' + cx + 'px ' + cy + 'px)', duration: 0.75, ease: 'power3.inOut' })
        .add(function () { apply(next); })
        .to(wipe, { autoAlpha: 0, duration: 0.35 }, '+=0.05');
    });
  }

  /* ---------- Анимации ---------- */

  function initMotion(chart) {
    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    var SplitText = window.SplitText;
    gsap.registerPlugin(ScrollTrigger, window.ScrollToPlugin, SplitText, window.ScrambleTextPlugin);

    // Необязательные плагины: если какой-то не загрузился, отключается только его фича
    var X = {
      Smoother: window.ScrollSmoother, Flip: window.Flip, Draggable: window.Draggable,
      Inertia: window.InertiaPlugin, MotionPath: window.MotionPathPlugin, DrawSVG: window.DrawSVGPlugin
    };
    Object.keys(X).forEach(function (k) { if (X[k]) gsap.registerPlugin(X[k]); });

    var introPlayed = false;
    try { // пришли после переключения языка — сразу к делу, без прелоадера
      if (sessionStorage.getItem('skipIntro')) { introPlayed = true; sessionStorage.removeItem('skipIntro'); }
    } catch (e) {}
    var mm = gsap.matchMedia();
    var head3d; // undefined — ещё не пробовали, null — WebGL недоступен

    mm.add({
      motion: '(prefers-reduced-motion: no-preference)',
      reduce: REDUCE,
      fine: '(pointer: fine)',
      wide: WIDE
    }, function (ctx) {
      var c = ctx.conditions;
      var loader = $('.loader');

      if (c.reduce) {
        if (loader) loader.remove();
        gsap.set('[data-reveal], [data-hero]', { autoAlpha: 1 });
        $$('.job').forEach(function (j) { j.classList.add('is-active'); });
        return;
      }

      var pointer = null; // датчик курсора, заполняется ниже только для мыши
      var cleanups = [];
      function on(el, type, fn) {
        el.addEventListener(type, fn);
        cleanups.push(function () { el.removeEventListener(type, fn); });
      }
      function splitChars(el) {
        return SplitText.create(el, { type: 'words,chars', mask: 'words', wordsClass: 'w' }).chars;
      }

      // Инерционный скролл всей страницы. Создаётся до любых ScrollTrigger; на тач-экранах остаётся нативный скролл
      var smoother = null;
      if (X.Smoother && $('#smooth-wrapper')) {
        smoother = X.Smoother.create({ wrapper: '#smooth-wrapper', content: '#smooth-content', smooth: 1.15, smoothTouch: false, effects: false });
        cleanups.push(function () { smoother.kill(); });
      }

      /* Трюки номера карточки. Сальто: выпрыгивает, делает заданное число оборотов, приземляется с отскоком.
         Штопор: входит во вращение со снижением, раскручивается, затем вывод — вращение гаснет, набор высоты */
      function salto(card) {
        var num = $('.other-card__num', card);
        if (card.dataset.flipping) return;
        card.dataset.flipping = '1';
        var tl = gsap.timeline({ onComplete: function () { delete card.dataset.flipping; } });
        if (card.dataset.spin) {
          tl.to(num, { y: 44, duration: 1.5, ease: 'power1.in' }, 0)
            .to(num, { rotation: '+=' + 360 * (parseFloat(card.dataset.spin) || 1), duration: 1.9, ease: 'power2.inOut' }, 0)
            .to(num, { y: 0, duration: 0.9, ease: 'power3.out' }, 1.5);
          // планер: снижение по спирали (MotionPath, нос по касательной), затем вывод и возврат на место
          var glider = $('.other-card__glider', card);
          if (glider && X.MotionPath) {
            tl.to(glider, {
              motionPath: { path: [{ x: -46, y: 26 }, { x: 0, y: 52 }, { x: 46, y: 78 }, { x: 0, y: 104 }, { x: -46, y: 130 }, { x: -8, y: 150 }], curviness: 1.6, autoRotate: true },
              duration: 2.1, ease: 'power1.in'
            }, 0).to(glider, { x: 0, y: 0, rotation: 0, duration: 1, ease: 'power2.inOut' }, 2.2);
          }
        } else {
          tl.to(num, { y: -54, duration: 0.42, ease: 'power2.out' })
            .to(num, { rotation: '-=' + 360 * (parseFloat(card.dataset.flip) || 1), duration: 0.8, ease: 'power1.inOut' }, 0.05)
            .to(num, { y: 0, duration: 0.5, ease: 'bounce.out' }, 0.42);
        }
      }

      /* Горизонтальная лента «Прочее». Создаётся первой: закрепление меняет высоту страницы,
         и все триггеры ниже должны считаться уже с её учётом */
      var track = $('#otherTrack');
      if (track && c.wide) {
        var travel = function () { return Math.max(0, track.scrollWidth - root.clientWidth); };
        var total = track.children.length;
        var now = $('#otherNow');
        var cards = $$('.other-card', track);
        // точки прилипания: позиция каждой карточки в долях от всего пути ленты
        var snapPoints = function () {
          var way = travel();
          if (!way) return [0];
          return cards.map(function (c) { return Math.min(1, (c.offsetLeft - cards[0].offsetLeft) / way); }).concat([1]);
        };
        var slide = gsap.to(track, {
          x: function () { return -travel(); },
          ease: 'none',
          scrollTrigger: {
            trigger: '#other',
            start: 'top top',
            end: function () { return '+=' + travel(); },
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            snap: { snapTo: function (v) { return gsap.utils.snap(snapPoints(), v); }, duration: { min: 0.2, max: 0.55 }, delay: 0.08, ease: 'power2.out' },
            onUpdate: function (self) {
              now.textContent = pad(Math.min(total, Math.floor(self.progress * total) + 1));
            }
          }
        });
        // Карточки «проявляются», въезжая в экран, а номера едут с параллаксом — всё привязано к горизонтальному движению
        $$('.other-card', track).forEach(function (card) {
          gsap.from(card, {
            opacity: 0.2, scale: 0.86, rotation: 3, ease: 'none',
            scrollTrigger: { trigger: card, containerAnimation: slide, start: 'left 100%', end: 'left 62%', scrub: true }
          });
          gsap.fromTo($('.other-card__num', card), { x: 40 }, {
            x: -20, ease: 'none',
            scrollTrigger: { trigger: card, containerAnimation: slide, start: 'left 100%', end: 'right 0%', scrub: true }
          });
          if (card.dataset.flip || card.dataset.spin) {
            ScrollTrigger.create({ trigger: card, containerAnimation: slide, start: 'left 72%', onEnter: function () { salto(card); } });
          }
        });
      } else if (track) {
        $$('.other-card', track).forEach(function (card) {
          gsap.from(card, {
            autoAlpha: 0, y: 48, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: card, start: 'top 88%', once: true }
          });
          if (card.dataset.flip || card.dataset.spin) {
            ScrollTrigger.create({ trigger: card, start: 'top 70%', onEnter: function () { salto(card); } });
          }
        });
      }
      // …и повторяет сальто при наведении
      if (track && c.fine) {
        $$('.other-card[data-flip], .other-card[data-spin]', track).forEach(function (card) {
          on(card, 'pointerenter', function () { salto(card); });
        });
      }

      /* «Айсберг»: закреплённая сцена. Скролл = погружение: мир едет вверх, лёд нарастает вниз,
         счётчик глубины считает гигабайты, остановки метро сменяют друг друга */
      var berg = $('#iceberg');
      if (berg) {
        berg.classList.add('is-live');
        cleanups.push(function () { berg.classList.remove('is-live'); });

        var world = $('#bergWorld');
        var stage = $('.berg__stage', berg);
        var dive = function () { return Math.max(0, world.offsetHeight - stage.clientHeight); };
        var depth = { v: 0 };
        var depthEl = $('#bergDepth');
        var stops = $$('.berg__stop', berg);
        var step = 0.8 / Math.max(1, stops.length);

        var descent = gsap.timeline({
          scrollTrigger: {
            trigger: berg,
            start: 'top top',
            end: function () { return '+=' + dive() * 1.5; },
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true
          }
        });
        descent
          .to(world, { y: function () { return -dive(); }, ease: 'none', duration: 0.92 }, 0)
          .from('.bld__deep', { scaleY: 0, ease: 'power2.out', duration: 0.3, stagger: { each: 0.004, from: 'center' } }, 0)
          .fromTo('.berg__gauge, .berg__bubbles', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.04 }, 0.04)
          .to(depth, {
            v: (R.iceberg && R.iceberg.total) || 0, ease: 'none', duration: 0.88,
            onUpdate: function () { depthEl.textContent = Math.round(depth.v); }
          }, 0.04);
        stops.forEach(function (stop, i) {
          var at = 0.1 + i * step;
          descent.fromTo(stop, { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 0.035, ease: 'power2.out' }, at);
          if (i < stops.length - 1) descent.to(stop, { autoAlpha: 0, y: -40, duration: 0.03, ease: 'power2.in' }, at + step - 0.035);
        });
        descent.to({}, { duration: 0.001 }, 1); // добиваем длину таймлайна до 1: последняя остановка остаётся на экране

        // Выход на сцену ещё до закрепления: заголовок по буквам, скайлайн вырастает от центра, всходит луна
        gsap.timeline({ scrollTrigger: { trigger: berg, start: 'top 70%', once: true } })
          .from('.berg__moon', { y: 90, autoAlpha: 0, duration: 1.6, ease: 'power2.out' }, 0)
          .from(splitChars('#bergTitle'), { yPercent: 120, duration: 0.9, stagger: 0.025, ease: 'power4.out' }, 0)
          .from('.berg__kicker, .berg__tip', { autoAlpha: 0, y: 16, duration: 0.7, stagger: 0.12, ease: 'power2.out' }, 0.2)
          .from('.bld__top', { scaleY: 0, duration: 0.9, ease: 'back.out(1.3)', stagger: { each: 0.025, from: 'center' } }, 0.1)
          .from('.bld__crown, .bld__tank', { autoAlpha: 0, y: 10, duration: 0.5, stagger: 0.03 }, 0.9);

        // Фоновая жизнь города: окна, звёзды, неон, LED-строка, пузыри. Вне экрана всё на паузе
        var ambient = [
          gsap.to($$('.win', berg), { opacity: 0.12, duration: 'random(0.5, 1.8)', delay: 'random(0, 3)', repeat: -1, yoyo: true, ease: 'sine.inOut' }),
          gsap.to('#bergStars i', { opacity: 0.1, duration: 'random(0.8, 2.4)', delay: 'random(0, 3)', repeat: -1, yoyo: true, ease: 'sine.inOut' }),
          gsap.to('#bergTicker', { xPercent: -50, ease: 'none', duration: 36, repeat: -1 }),
          gsap.fromTo('#bergBubbles i', { y: 0 }, {
            y: function () { return -(stage.clientHeight + 60); },
            x: 'random(-40, 40)', duration: 'random(5, 10)', delay: 'random(0, 8)', repeat: -1, ease: 'none'
          })
        ];
        $$('.bld__neon, .berg__sign', berg).forEach(function (sign) {
          ambient.push(gsap.timeline({ repeat: -1, repeatDelay: gsap.utils.random(2, 6), delay: gsap.utils.random(0, 4) })
            .to(sign, { opacity: 0.25, duration: 0.05 })
            .to(sign, { opacity: 1, duration: 0.05 })
            .to(sign, { opacity: 0.4, duration: 0.04 }, '+=0.08')
            .to(sign, { opacity: 1, duration: 0.12 }));
        });
        // Подлодка-такси проплывает через сцену по кривой (MotionPath), привязанной к погружению
        var sub = $('#bergSub');
        if (sub && X.MotionPath) {
          var SW = stage.clientWidth, SH = stage.clientHeight;
          gsap.set(sub, { x: -280, y: SH * 0.5 });
          descent.fromTo(sub, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.02 }, 0.2)
            .to(sub, {
              motionPath: { path: [{ x: -280, y: SH * 0.5 }, { x: SW * 0.22, y: SH * 0.34 }, { x: SW * 0.52, y: SH * 0.5 }, { x: SW * 0.78, y: SH * 0.3 }, { x: SW + 120, y: SH * 0.42 }], curviness: 1.4 },
              ease: 'none', duration: 0.6
            }, 0.2)
            // второй заход: лодка возвращается слева и паркуется внизу, рядом с финальной цифрой
            .set(sub, { x: -280, y: SH * 0.62 }, 0.82)
            .to(sub, {
              motionPath: { path: [{ x: -280, y: SH * 0.62 }, { x: SW * 0.3, y: SH * 0.5 }, { x: Math.max(16, SW - (sub.getBoundingClientRect().width || 160) - 28), y: SH * 0.36 }], curviness: 1.3 },
              ease: 'power2.out', duration: 0.16
            }, 0.82);
          ambient.push(gsap.to('.berg__prop', { scaleY: 0.12, duration: 0.09, yoyo: true, repeat: -1, ease: 'sine.inOut', svgOrigin: '10 62' }));
          ambient.push(gsap.to(sub, { rotation: 3, duration: 1.8, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
        }

        ScrollTrigger.create({
          trigger: berg.parentNode, // pin-spacer: его границы учитывают длину закрепления
          start: 'top bottom',
          end: 'bottom top',
          onToggle: function (self) { ambient.forEach(function (a) { a.paused(!self.isActive); }); }
        });
        if (!ScrollTrigger.isInViewport(berg)) ambient.forEach(function (a) { a.pause(); });
      }

      /* Вступление: счётчик прелоадера → шторка → имя по буквам → «расшифровка» должности */
      var intro = gsap.timeline({ defaults: { ease: 'power4.out' } });
      if (loader && !introPlayed) {
        var count = { v: 0 };
        var num = $('#loaderNum');
        intro
          .to(count, { v: 100, duration: 0.9, ease: 'power2.inOut', onUpdate: function () { num.textContent = Math.round(count.v); } })
          .to(loader, { yPercent: -100, duration: 0.8, ease: 'power4.inOut', onComplete: function () { loader.remove(); } }, '+=0.1')
          .addLabel('show', '-=0.4');
      } else {
        if (loader) loader.remove();
        intro.addLabel('show', 0);
      }
      introPlayed = true;

      var heroChars = splitChars('#heroTitle');
      intro
        .from(heroChars, { yPercent: 120, duration: 1, stagger: 0.025 }, 'show')
        .fromTo('[data-hero]', { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08 }, 'show+=0.35')
        .from('.hero__glow', { scale: 0.6, autoAlpha: 0, duration: 1.8, ease: 'power2.out' }, 'show')
        .from('.nav', { yPercent: -100, duration: 0.9 }, 'show+=0.2');
      if ($('#heroRole')) {
        intro.to('#heroRole', { duration: 1.4, ease: 'none', scrambleText: { text: R.role, chars: '01<>/{}_', speed: 0.5 } }, 'show+=0.45');
      }

      // Рукописное подчёркивание имени прочерчивается (DrawSVG)
      if (X.DrawSVG && $('.hero__scribble')) {
        intro.from('.hero__scribble path', { drawSVG: '0%', duration: 1.1, ease: 'power2.inOut' }, 'show+=0.9');
      }

      // Портрет: открывается шторкой снизу вверх, снимок «отъезжает» из крупного плана
      var heroPhoto = $('#heroPhoto');
      if (heroPhoto) {
        intro.fromTo(heroPhoto, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'power4.inOut' }, 'show')
          .from(heroPhoto, { scale: 1.12, duration: 1.9, ease: 'power3.out' }, 'show');
      }

      /* 3D-голова следит за курсором по всей странице. Нет курсора (или тач) — сама плавно осматривается */
      if (heroPhoto && head3d === undefined) head3d = initHead3D(heroPhoto); // один раз на всё время жизни страницы
      var gaze = { x: 0, y: 0, tracking: false, idleAt: 0 };
      if (head3d) {
        var idle = { x: -0.24, y: 0.03 };
        gsap.to(idle, { x: 0.24, duration: 3.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
        gsap.to(idle, { y: -0.05, duration: 2.3, ease: 'sine.inOut', yoyo: true, repeat: -1 });
        var headVisible = true;
        ScrollTrigger.create({
          trigger: '.hero', start: 'top bottom', end: 'bottom top',
          onToggle: function (self) { headVisible = self.isActive; }
        });
        var tickHead = function (time, dt) {
          if (!headVisible) return;
          if (gaze.tracking && time - gaze.idleAt > 4) gaze.tracking = false; // курсор замер — возвращаемся к осмотру
          var k = Math.min(1, (gaze.tracking ? 0.11 : 0.04) * gsap.ticker.deltaRatio());
          head3d.step(gaze.tracking ? gaze.x : idle.x, gaze.tracking ? gaze.y : idle.y, k);
        };
        gsap.ticker.add(tickHead);
        cleanups.push(function () { gsap.ticker.remove(tickHead); });
      }

      // Уход с первого экрана: текст вверх, телефон вниз
      gsap.to('.hero__text', {
        yPercent: -14, autoAlpha: 0.15, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      });

      /* Телефон: 3D-въезд, покачивание, наклон за курсором, живой график и «пинги» узлов */
      if (chart && c.wide) {
        intro.from('.phone', { autoAlpha: 0, y: 120, rotationY: -35, rotationX: 12, duration: 1.7, ease: 'power3.out' }, heroPhoto ? 'show+=0.7' : 'show+=0.1');
        gsap.to('.phone-tilt', { y: -14, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
        gsap.to('.hero__device', {
          yPercent: 16, rotation: 5, ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
        });

        var value = $('#phoneValue');
        var reading = { v: parseFloat(value.textContent) };
        var feed = gsap.to('#chartGroup', {
          x: -chart.step, duration: 0.9, ease: 'none', repeat: -1,
          onRepeat: function () {
            // курсор «рулит» графиком: высота — уровень, скорость — шум и темп ленты; без движения всё затухает
            if (pointer) {
              gsap.to(feed, { timeScale: 1 + pointer.energy * 3.5, duration: 0.4, overwrite: true });
              pointer.energy *= 0.55;
            }
            gsap.to(reading, {
              v: chart.shift(pointer), duration: 0.8, ease: 'power1.out',
              onUpdate: function () { value.textContent = reading.v.toFixed(1); }
            });
          }
        });
        var rows = $$('.phone__list li');
        var pings = gsap.timeline({ repeat: -1, repeatDelay: 1.1 }).call(function () {
          var row = rows[Math.floor(Math.random() * rows.length)];
          $('em', row).textContent = gsap.utils.random(8, 42, 1) + ' ms';
          gsap.fromTo($('i', row), { scale: 2.4 }, { scale: 1, duration: 0.7, ease: 'power2.out' });
          gsap.fromTo(row, { backgroundColor: '#23262f' }, { backgroundColor: '#16181e', duration: 0.9 });
        });
        // Вне экрана макет не тратит кадры
        ScrollTrigger.create({
          trigger: '.hero', start: 'top bottom', end: 'bottom top',
          onToggle: function (self) { feed.paused(!self.isActive); pings.paused(!self.isActive); }
        });
      }

      /* Заголовки разделов: линия чертится, номер выезжает, текст поднимается по буквам */
      $$('.section__head').forEach(function (head) {
        gsap.timeline({ scrollTrigger: { trigger: head, start: 'top 86%', once: true } })
          .from($('.section__line', head), { scaleX: 0, duration: 1.2, ease: 'power3.inOut' })
          .from($$('.section__num, .other__count, .skills__toggle', head), { autoAlpha: 0, x: -14, duration: 0.6, ease: 'power2.out' }, 0.15)
          .from(splitChars($('h2', head)), { yPercent: 120, duration: 0.85, stagger: 0.022, ease: 'power4.out' }, 0.1);
      });

      // «Обо мне»: текст наливается цветом слово за словом по мере скролла
      var lead = $('#aboutLead');
      if (lead) {
        var leadWords = SplitText.create(lead, { type: 'words' }).words;
        gsap.fromTo(leadWords, { opacity: 0.14 }, {
          opacity: 1, stagger: 0.1, ease: 'none',
          scrollTrigger: { trigger: lead, start: 'top 82%', end: 'bottom 48%', scrub: 0.4 }
        });
      }

      // Фото в «Обо мне»: кадр раскрывается из уменьшенной рамки, снимок внутри едет с параллаксом
      var aboutPhoto = $('#aboutPhoto');
      if (aboutPhoto) {
        gsap.fromTo(aboutPhoto, { clipPath: 'inset(14% 10% 14% 10% round 24px)' }, {
          clipPath: 'inset(0% 0% 0% 0% round 24px)', ease: 'none',
          scrollTrigger: { trigger: aboutPhoto, start: 'top 92%', end: 'top 35%', scrub: 0.5 }
        });
        gsap.fromTo($('img', aboutPhoto), { yPercent: -9 }, {
          yPercent: 9, ease: 'none',
          scrollTrigger: { trigger: aboutPhoto, start: 'top bottom', end: 'bottom top', scrub: true }
        });
      }

      // Фото в «Контактах»: выезжает шторкой с лёгким поворотом и плывёт против скролла
      var contactsPhoto = $('#contactsPhoto');
      if (contactsPhoto) {
        gsap.fromTo(contactsPhoto, { clipPath: 'inset(100% 0% 0% 0% round 24px)', rotation: 6, y: 60 }, {
          clipPath: 'inset(0% 0% 0% 0% round 24px)', rotation: 0, y: 0, duration: 1.3, ease: 'power4.out',
          clearProps: 'clipPath', // иначе скругление маски срезает уголок подписи под фото
          scrollTrigger: { trigger: contactsPhoto, start: 'top 88%', once: true }
        });
        gsap.fromTo($('img', contactsPhoto), { yPercent: -7 }, {
          yPercent: 7, ease: 'none',
          scrollTrigger: { trigger: contactsPhoto, start: 'top bottom', end: 'bottom top', scrub: true }
        });
      }

      // Появление простых блоков пачками
      gsap.set('[data-reveal]', { autoAlpha: 0, y: 28 });
      ScrollTrigger.batch('[data-reveal]', {
        start: 'top 90%',
        once: true,
        onEnter: function (els) {
          gsap.to(els, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, overwrite: true });
        }
      });

      // Цифры: счётчики и «расшифровка» текстовых значений
      $$('[data-count]').forEach(function (el) {
        var end = parseFloat(el.dataset.count);
        if (isNaN(end)) return;
        var dec = (String(el.dataset.count).split('.')[1] || '').length;
        var o = { v: 0 };
        gsap.to(o, {
          v: end, duration: 1.8, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 92%', once: true },
          onUpdate: function () { el.textContent = o.v.toFixed(dec); }
        });
      });
      $$('[data-scramble]').forEach(function (el) {
        gsap.to(el, {
          duration: 1.6, ease: 'none',
          scrambleText: { text: el.textContent, chars: 'upperCase', speed: 0.4 },
          scrollTrigger: { trigger: el, start: 'top 92%', once: true }
        });
      });

      /* Опыт: линия заполняется по скроллу, каждое место работы собирается по частям */
      if ($('.timeline')) {
        gsap.fromTo('.timeline__bar', { scaleY: 0 }, {
          scaleY: 1, ease: 'none',
          scrollTrigger: { trigger: '.timeline', start: 'top 65%', end: 'bottom 65%', scrub: true }
        });
        $$('.job').forEach(function (job) {
          ScrollTrigger.create({
            trigger: job,
            start: 'top 65%',
            onEnter: function () {
              job.classList.add('is-active');
              gsap.fromTo($('.job__dot', job), { scale: 2.2 }, { scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.5)' });
            },
            onLeaveBack: function () { job.classList.remove('is-active'); }
          });

          var tl = gsap.timeline({ defaults: { ease: 'power3.out' }, scrollTrigger: { trigger: job, start: 'top 84%', once: true } });
          tl.from($('.job__period', job), { autoAlpha: 0, x: -24, duration: 0.7 })
            .from($$('.job__title, .job__company', job), { autoAlpha: 0, y: 24, duration: 0.8, stagger: 0.08 }, 0.05);
          var points = $$('.job__points li', job);
          if (points.length) tl.from(points, { autoAlpha: 0, x: -18, duration: 0.6, stagger: 0.06 }, 0.25);
          var tags = $$('.tags .chip', job);
          if (tags.length) tl.from(tags, { autoAlpha: 0, scale: 0.5, duration: 0.5, stagger: 0.04, ease: 'back.out(2)' }, '-=0.3');
          var extras = $$('.job__link, .job__media', job);
          if (extras.length) tl.from(extras, { autoAlpha: 0, y: 26, duration: 0.8, stagger: 0.12 }, '-=0.2');
        });
      }

      /* GymChess: кадры комикса «прорисовываются тушью» (DrawSVG), затем в них начинается жизнь:
         игрок подтягивается, часы тикают, капает пот, падает флаг. Вне экрана всё на паузе */
      var panels = $$('.comic__panel');
      if (panels.length) {
        var life = [];
        var mmss = function (s) { s = Math.max(0, Math.round(s)); return pad(Math.floor(s / 60)) + ':' + pad(s % 60); };

        panels.forEach(function (panel, i) {
          var ink = $$('.comic__art line, .comic__art path, .comic__art circle, .comic__art rect', panel)
            .filter(function (el) { return !el.classList.contains('gc-fill'); });
          var tl = gsap.timeline({ delay: (i % 4) * 0.14, scrollTrigger: { trigger: panel, start: 'top 86%', once: true } });
          tl.from(panel, { autoAlpha: 0, scale: 0.86, rotation: i % 2 ? 3 : -3, y: 34, duration: 0.7, ease: 'back.out(1.5)' });
          if (X.DrawSVG && ink.length) tl.from(ink, { drawSVG: '0%', duration: 0.75, stagger: 0.03, ease: 'power2.inOut' }, 0.15);
          var solid = $$('.t, .gc-fill:not(.gc-step)', panel);
          if (solid.length) tl.from(solid, { autoAlpha: 0, duration: 0.4, stagger: 0.04 }, 0.7);
          var stepsUp = $$('.gc-step', panel);
          if (stepsUp.length) tl.from(stepsUp, { scaleY: 0, transformOrigin: '50% 100%', duration: 0.5, stagger: 0.07, ease: 'back.out(1.6)' }, 0.6);
          var bubble = $('.comic__bubble', panel);
          if (bubble) tl.from(bubble, { autoAlpha: 0, scale: 0.4, y: 14, duration: 0.5, ease: 'back.out(2.2)' }, 0.95);
          tl.from($('.comic__caption', panel), { autoAlpha: 0, y: 10, duration: 0.5 }, 0.8);
          var flag = $('.gc-flag', panel);
          if (flag) tl.to(flag, { rotation: 96, svgOrigin: '244 78', duration: 0.7, ease: 'bounce.out' }, 1.5);
        });

        // подтягивание: тело едет вверх, руки «сгибаются» — концы линий привязаны к плечам
        var hang = $('.gc-hang');
        if (hang) {
          var torso = $('.gc-hang__body', hang), arms = $$('.gc-hang__arm', hang), lift = { v: 0 };
          life.push(gsap.to(lift, {
            v: -27, duration: 0.55, ease: 'power2.inOut', yoyo: true, repeat: -1, repeatDelay: 0.18,
            onUpdate: function () {
              gsap.set(torso, { y: lift.v });
              arms.forEach(function (a) { a.setAttribute('y2', 90 + lift.v); });
            }
          }));
        }
        $$('[data-tick]').forEach(function (el) { // «идущие» часы: from:to в секундах, по кругу
          var range = el.dataset.tick.split(':'), clock = { s: +range[0] };
          life.push(gsap.to(clock, {
            s: +range[1], duration: Math.abs(range[0] - range[1]), ease: 'none', repeat: -1,
            onUpdate: function () { el.textContent = mmss(clock.s); }
          }));
        });
        life.push(gsap.fromTo('.gc-sweat', { y: 0, autoAlpha: 1 }, { y: 18, autoAlpha: 0, duration: 0.9, ease: 'power1.in', stagger: 0.3, repeat: -1 }));
        life.push(gsap.to('.gc-trophy', { y: -6, duration: 0.7, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
        life.push(gsap.to('.gc-zero', { autoAlpha: 0.2, duration: 0.45, ease: 'steps(1)', yoyo: true, repeat: -1 }));
        life.push(gsap.to('.gc-phone', { x: 2, duration: 0.05, yoyo: true, repeat: -1, repeatDelay: 0.9 })); // вибрация по таймауту
        life.push(gsap.to('.gc-confetti', { y: 'random(-10, 10)', x: 'random(-8, 8)', duration: 'random(1.2, 2.2)', ease: 'sine.inOut', yoyo: true, repeat: -1 }));
        /* Иллюстрации подсчёта. «Сейчас»: тап по кнопке передаёт ход, подсветка часов меняется.
           Концепт: фигура подтягивается, автомат состояний ВНИЗУ→ВВЕРХУ→ВНИЗУ считает повторы по углу в локте
           и положению подбородка; каждый четвёртый повтор не дотянут — и честно не засчитывается */
        if ($('#gcNowBtn')) {
          var turnA = true;
          life.push(gsap.timeline({ repeat: -1, repeatDelay: 1.3 })
            .to('#gcNowBtn', { scale: 0.93, svgOrigin: '130 149', duration: 0.1, yoyo: true, repeat: 1 })
            .fromTo('#gcNowTap', { scale: 0.5, autoAlpha: 0.9, svgOrigin: '130 149' }, { scale: 2.1, autoAlpha: 0, duration: 0.7, ease: 'power2.out' }, 0)
            .call(function () { turnA = !turnA; gsap.to('#gcNowHi', { y: turnA ? 0 : 48, duration: 0.35, ease: 'power3.out' }); }, null, 0.12));
          var nowClocks = { a: 492, b: 570 };
          life.push(gsap.to({}, {
            duration: 1, repeat: -1, ease: 'none',
            onRepeat: function () {
              if (turnA) nowClocks.a = nowClocks.a > 1 ? nowClocks.a - 1 : 492; else nowClocks.b = nowClocks.b > 1 ? nowClocks.b - 1 : 570;
              $('#gcNowA').textContent = mmss(nowClocks.a);
              $('#gcNowB').textContent = mmss(nowClocks.b);
            }
          }));
        }

        if ($('#gcBody')) {
          var CL = (R.gymchess.counting.next.labels) || {};
          var lift = { v: 0 }, state = 'down', reps = 0, peak = 0;
          var samples = [], marks = [];
          var sigEl = $('#gcSignal'), marksEl = $('#gcMarks'), verdict = $('#gcVerdict');
          var X0 = 300, X1 = 624, N = 108, STEPX = (X1 - X0) / (N - 1);
          var yOf = function (v) { return 210 - v * 3.45; }; // 0 → низ графика, 42 → над верхним порогом
          var flash = function (text, cls) {
            verdict.textContent = text;
            verdict.setAttribute('class', 't t--xs ' + cls);
            gsap.fromTo(verdict, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.3, overwrite: true });
            gsap.to(verdict, { autoAlpha: 0, duration: 0.4, delay: 1.1 });
          };
          var setState = function (s) {
            state = s;
            $('#gcState').textContent = s === 'up' ? CL.up : CL.down;
            gsap.fromTo('#gcStateBox', { scale: 1.12, svgOrigin: '73 249' }, { scale: 1, duration: 0.3, ease: 'back.out(3)' });
          };

          var seq = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });
          [42, 42, 42, 27].forEach(function (h) {
            seq.to(lift, { v: h, duration: 0.75, ease: 'power2.inOut' }).to(lift, { v: 0, duration: 0.65, ease: 'power2.inOut' }, '+=0.12');
          });
          life.push(seq);

          var poseTick = function () {
            if (seq.paused()) return;
            var p = gcPose(lift.v);
            peak = Math.max(peak, lift.v);
            if (state === 'down' && p.chinAbove) setState('up');
            else if (p.angle > 162 && peak > 8) { // руки выпрямились после движения — повтор закончился
              if (state === 'up') {
                reps = reps >= 9 ? 1 : reps + 1;
                $('#gcReps').textContent = '×' + reps;
                gsap.fromTo('#gcReps', { scale: 1.5, svgOrigin: '236 250' }, { scale: 1, duration: 0.4, ease: 'back.out(3)' });
                setState('down');
                flash(CL.ok, 'gc-ok');
                marks.push({ age: 0, ok: true });
              } else {
                flash(CL.miss, 'gc-red');
                marks.push({ age: 0, ok: false });
              }
              peak = 0;
            }
            // лента сигнала: новое значение справа, старые уезжают влево
            samples.push(lift.v);
            if (samples.length > N) samples.shift();
            var d = '';
            for (var k = 0; k < samples.length; k++) d += (k ? 'L' : 'M') + (X1 - (samples.length - 1 - k) * STEPX).toFixed(1) + ' ' + yOf(samples[k]).toFixed(1);
            sigEl.setAttribute('d', d);
            var html = '';
            marks.forEach(function (m) { m.age++; });
            marks = marks.filter(function (m) { return m.age < N; });
            marks.forEach(function (m) {
              var mx = (X1 - m.age * STEPX).toFixed(1);
              html += m.ok ? '<circle class="gc-fill gc-ok" cx="' + mx + '" cy="228" r="4"/>'
                : '<path class="gc-red gc-thin" d="M' + (mx - 4) + ' 224l8 8m0-8l-8 8"/>';
            });
            marksEl.innerHTML = html;
          };
          gsap.ticker.add(poseTick);
          cleanups.push(function () { gsap.ticker.remove(poseTick); });
          life.push(gsap.to('#gcRec', { autoAlpha: 0.15, duration: 0.6, ease: 'steps(1)', yoyo: true, repeat: -1 }));
        }

        ScrollTrigger.create({
          trigger: '#gymchess', start: 'top bottom', end: 'bottom top',
          onToggle: function (self) { life.forEach(function (a) { a.paused(!self.isActive); }); }
        });
        if (!ScrollTrigger.isInViewport($('#gymchess'))) life.forEach(function (a) { a.pause(); });

        // инфографика: ступени лесенок вырастают, путь игрока прочерчивается, этапы «загораются» по очереди
        $$('.gc-ladder').forEach(function (card) {
          gsap.from($$('.gc-ladder__bars i', card), {
            scaleY: 0, duration: 0.6, ease: 'back.out(1.7)', stagger: 0.06,
            scrollTrigger: { trigger: card, start: 'top 88%', once: true }
          });
        });
        if ($('.gc__flow')) {
          gsap.timeline({ scrollTrigger: { trigger: '.gc__flow', start: 'top 88%', once: true } })
            .from('.gc__flow-line', { scaleX: 0, duration: 1.2, ease: 'power2.inOut' })
            .from('.gc__flow li', { autoAlpha: 0, y: 14, scale: 0.7, duration: 0.5, ease: 'back.out(2)', stagger: 0.22 }, 0.05);
        }
        var gcChips = $$('.gc__chips .chip');
        if (gcChips.length) {
          gsap.from(gcChips, {
            autoAlpha: 0, scale: 0.5, duration: 0.45, ease: 'back.out(2)', stagger: 0.04,
            scrollTrigger: { trigger: '.gc__chips', start: 'top 90%', once: true }
          });
        }
      }

      /* «3D и видео»: линия пайплайна заполняется по скроллу, активный шаг подсвечивается,
         а «липкий» счётчик слева перелистывает номер в сторону движения */
      var pipe = $('.pipe');
      var pipeSteps = $$('.pipe-step');
      if (pipe && pipeSteps.length) {
        pipe.classList.add('pipe--live');
        cleanups.push(function () { pipe.classList.remove('pipe--live'); });

        // «Липкий» счётчик: внутри ScrollSmoother position: sticky не работает, поэтому блок держит pin
        var aside = $('.pipe__aside', pipe);
        if (c.wide && aside) {
          ScrollTrigger.create({
            trigger: pipe,
            start: 'top top+=96',
            end: function () { return '+=' + Math.max(0, pipe.offsetHeight - aside.offsetHeight); },
            pin: aside,
            pinSpacing: false,
            invalidateOnRefresh: true
          });
        }

        gsap.fromTo('.pipe__fill', { scaleY: 0 }, {
          scaleY: 1, ease: 'none',
          scrollTrigger: { trigger: '.pipe__list', start: 'top 60%', end: 'bottom 60%', scrub: true }
        });

        var pipeNum = $('#pipeNum');
        var currentStep = 0;
        var flip = null;
        var activate = function (i) {
          pipeSteps.forEach(function (s, k) { s.classList.toggle('is-active', k === i); });
          if (i === currentStep) return;
          var dir = i > currentStep ? 1 : -1;
          currentStep = i;
          if (flip) flip.kill(); // быстрый скролл: прерываем прошлое перелистывание, номер всё равно выставит новое
          flip = gsap.timeline()
            .to(pipeNum, { yPercent: -100 * dir, duration: 0.22, ease: 'power2.in' })
            .call(function () { pipeNum.textContent = pad(i + 1); })
            .fromTo(pipeNum, { yPercent: 100 * dir }, { yPercent: 0, duration: 0.4, ease: 'power3.out' });
        };
        pipeSteps[0].classList.add('is-active');

        pipeSteps.forEach(function (step, i) {
          ScrollTrigger.create({
            trigger: step,
            start: 'top 60%',
            end: 'bottom 60%',
            onEnter: function () { activate(i); },
            onEnterBack: function () { activate(i); }
          });
          // анимируем детей, а не сам шаг: его opacity занята подсветкой активного
          gsap.from(step.children, {
            autoAlpha: 0, y: 26, duration: 0.8, stagger: 0.08, ease: 'power3.out',
            scrollTrigger: { trigger: step, start: 'top 86%', once: true }
          });
        });
      }

      // Навыки и языки: карточка поднимается, чипы и точки «выщёлкиваются» по одному
      $$('.skill-group, .lang').forEach(function (card, i) {
        gsap.timeline({ delay: (i % 4) * 0.08, scrollTrigger: { trigger: card, start: 'top 90%', once: true } })
          .from(card, { autoAlpha: 0, y: 40, duration: 0.8, ease: 'power3.out' })
          .from($$('.chip, .lang__dots i', card), { autoAlpha: 0, scale: 0, duration: 0.45, stagger: 0.05, ease: 'back.out(2.2)' }, 0.2);
      });

      /* Навыки: Flip. Чипы физически переезжают из карточек-групп в общее облако (по алфавиту) и обратно,
         а Flip анимирует перелёт каждого из старой позиции в новую */
      var skillsToggle = $('#skillsToggle');
      var skillCloud = $('#skillCloud');
      var skillGroups = $('#skillGroups');
      if (X.Flip && skillsToggle && skillCloud && skillGroups) {
        var skillChips = $$('.chip', skillGroups);
        skillChips.forEach(function (chip) { chip._home = chip.parentNode; });
        var asCloud = false;
        var flipping = false;
        skillsToggle.hidden = false;
        skillsToggle.textContent = t('cloud');
        on(skillsToggle, 'click', function () {
          if (flipping) return;
          flipping = true;
          // чипы могли ещё не проявиться (анимация появления по скроллу) — фиксируем их в конечном виде
          gsap.killTweensOf(skillChips);
          gsap.set(skillChips, { clearProps: 'all' });
          var state = X.Flip.getState(skillChips);
          asCloud = !asCloud;
          if (asCloud) {
            skillChips.slice().sort(function (a, b) { return a.textContent.localeCompare(b.textContent); })
              .forEach(function (chip) { skillCloud.appendChild(chip); });
          } else {
            skillChips.forEach(function (chip) { chip._home.appendChild(chip); });
            gsap.fromTo('.skill-group', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 });
          }
          skillCloud.hidden = !asCloud;
          skillGroups.classList.toggle('is-hidden', asCloud);
          skillsToggle.textContent = t(asCloud ? 'groups' : 'cloud');
          X.Flip.from(state, {
            duration: 0.9, ease: 'power3.inOut', absolute: true, stagger: { each: 0.012, from: 'random' },
            onComplete: function () { flipping = false; ScrollTrigger.refresh(); } // высота секции изменилась
          });
        });
        cleanups.push(function () { // вернуть разметку в исходное состояние перед пересборкой анимаций
          skillChips.forEach(function (chip) { chip._home.appendChild(chip); });
          skillCloud.hidden = true;
          skillGroups.classList.remove('is-hidden');
          skillsToggle.hidden = true;
        });
      }

      // Образование: ось времени прочерчивается слева направо, отрезок за отрезком — длительность ∝ годам
      var segs = $$('.edu__seg');
      if (segs.length) {
        var axis = gsap.timeline({ scrollTrigger: { trigger: '.edu__axis', start: 'top 85%', once: true } });
        segs.forEach(function (seg) {
          axis.from($('.edu__seg-bar', seg), { scaleX: 0, duration: Math.max(0.25, seg.dataset.years * 0.2), ease: 'none' })
            .from($$('.edu__seg-name, .edu__seg-year', seg), { autoAlpha: 0, y: 8, duration: 0.4, ease: 'power2.out' }, '<');
        });
        axis.from('.edu__axis-end', { autoAlpha: 0, duration: 0.3 });
      }

      // Контакты: крупный заголовок по буквам
      var contactsTitle = $('#contactsTitle');
      if (contactsTitle) {
        gsap.from(splitChars(contactsTitle), {
          yPercent: 120, duration: 0.9, stagger: 0.018, ease: 'power4.out',
          scrollTrigger: { trigger: contactsTitle, start: 'top 85%', once: true }
        });
      }

      // Рукописная стрелка к контактам прочерчивается (DrawSVG)
      if (X.DrawSVG && $('.contacts__arrow')) {
        gsap.from('.contacts__arrow path', {
          drawSVG: '0%', duration: 0.9, ease: 'power2.inOut', stagger: 0.75,
          scrollTrigger: { trigger: '.contacts__arrow', start: 'top 82%', once: true }
        });
      }

      // Хэштеги слетаются со всех сторон в случайном порядке
      var hashItems = $$('#hashtags li');
      if (hashItems.length) {
        gsap.from(hashItems, {
          autoAlpha: 0, x: 'random(-140, 140)', y: 'random(-90, 90)', rotation: 'random(-28, 28)', scale: 0.5,
          duration: 1.1, ease: 'back.out(1.4)', stagger: { each: 0.035, from: 'random' },
          scrollTrigger: { trigger: '#hashtags', start: 'top 92%', once: true }
        });
      }

      // Подвал: контурное имя едет навстречу скроллу
      gsap.fromTo('#footerBig', { xPercent: 6 }, {
        xPercent: -28, ease: 'none',
        scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: 0.5 }
      });

      // Полоса прокрутки
      gsap.to('.progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

      // Шапка: прячется при скролле вниз, возвращается при скролле вверх
      var nav = $('#nav');
      // Фото и карточки слегка перекашивает от скорости скролла
      var skewers = $$('.about__photo, .job__media, .contacts__shot').map(function (el) {
        return gsap.quickTo(el, 'skewY', { duration: 0.5, ease: 'power3' });
      });
      var unskew = function () { skewers.forEach(function (to) { to(0); }); };
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: function (self) {
          var hide = self.direction === 1 && self.scroll() > 240;
          gsap.to(nav, { yPercent: hide ? -100 : 0, duration: 0.4, ease: 'power2.out', overwrite: true });
          var k = gsap.utils.clamp(-3.5, 3.5, self.getVelocity() / -480);
          skewers.forEach(function (to) { to(k); });
        }
      });
      ScrollTrigger.addEventListener('scrollEnd', unskew);
      cleanups.push(function () { ScrollTrigger.removeEventListener('scrollEnd', unskew); });

      // Бегущая строка: ускоряется и наклоняется от скорости скролла
      var marquee = $('#marquee');
      if (marquee) {
        var loop = gsap.to(marquee, { xPercent: -50, ease: 'none', duration: 40, repeat: -1 });
        loop.totalTime(loop.duration() * 50); // запас по времени, чтобы ленту можно было крутить и назад
        var skew = gsap.quickTo(marquee, 'skewX', { duration: 0.4, ease: 'power3' });
        var settle = function () { skew(0); };
        ScrollTrigger.create({
          start: 0,
          end: 'max',
          onUpdate: function (self) {
            var v = self.getVelocity();
            skew(gsap.utils.clamp(-12, 12, v / -220));
            gsap.killTweensOf(loop);
            var dir = self.direction || 1; // скролл вверх — лента едет в обратную сторону
            gsap.timeline()
              .to(loop, { timeScale: dir * (1 + Math.min(Math.abs(v) / 250, 6)), duration: 0.2 })
              .to(loop, { timeScale: dir, duration: 1.2, ease: 'power2.out' });
          }
        });
        ScrollTrigger.addEventListener('scrollEnd', settle);
        cleanups.push(function () { ScrollTrigger.removeEventListener('scrollEnd', settle); });

        // Ленту можно тянуть влево-вправо и бросать — мышью и пальцем (вертикальный скролл страницы при этом работает).
        // Тянем невидимый прокси, а его сдвиг пересчитываем во время петли: так бесшовность сохраняется сама собой
        if (X.Draggable) {
          var strip = marquee.parentNode;
          var proxy = document.createElement('div');
          var grabTime = 0;
          var secPerPx = function () { return loop.duration() / (marquee.scrollWidth / 2); };
          var scrubLoop = function () { loop.totalTime(Math.max(0, grabTime - this.x * secPerPx())); };
          var stripDrag = X.Draggable.create(proxy, {
            trigger: strip, type: 'x', inertia: !!X.Inertia,
            onPress: function () {
              gsap.killTweensOf(loop);
              loop.pause();
              grabTime = loop.totalTime();
              gsap.set(proxy, { x: 0 });
              this.update();
            },
            onDrag: scrubLoop,
            onThrowUpdate: scrubLoop,
            onThrowComplete: function () { loop.timeScale(1).play(); },
            onRelease: function () {
              var self = this; // без инерции (или без броска) сразу отпускаем ленту дальше
              gsap.delayedCall(0.06, function () { if (!self.isThrowing) loop.timeScale(1).play(); });
            }
          })[0];
          strip.classList.add('is-draggable');
          cleanups.push(function () { stripDrag.kill(); strip.classList.remove('is-draggable'); });
        }
      }

      // Подсветка активного пункта меню (у закреплённой секции ориентируемся на её pin-spacer)
      $$('.nav__links a').forEach(function (a) {
        var target = $(a.getAttribute('href'));
        if (!target) return;
        var spacer = target.parentNode;
        ScrollTrigger.create({
          trigger: spacer.classList.contains('pin-spacer') ? spacer : target,
          start: 'top center',
          end: 'bottom center',
          onToggle: function (self) { a.classList.toggle('is-active', self.isActive); }
        });
      });

      // Плавный переход по якорям
      on(document, 'click', function (e) {
        var a = e.target.closest('a[href^="#"]');
        if (!a) return;
        var id = a.getAttribute('href');
        var target = id === '#top' ? 0 : $(id);
        if (target === null) return;
        e.preventDefault();
        if (smoother) smoother.scrollTo(target, true, 'top top');
        else gsap.to(window, { duration: 1.2, ease: 'power3.inOut', scrollTo: { y: target, autoKill: true } });
      });

      /* Только для мыши: свечение, наклон телефона, курсор-кольцо, «магнитные» кнопки, расшифровка контактов */
      if (c.fine) {
        // Общий датчик курсора: положение и сглаженная скорость. Его читают 3D-голова и график в телефоне
        pointer = { level: null, energy: 0, x: 0, y: 0, t: 0 };
        on(window, 'pointermove', function (e) {
          var now = performance.now();
          var speed = pointer.t ? Math.hypot(e.clientX - pointer.x, e.clientY - pointer.y) / Math.max(16, now - pointer.t) : 0; // px/мс
          pointer.energy = Math.min(1, pointer.energy * 0.7 + speed * 0.3);
          pointer.level = 1 - e.clientY / window.innerHeight;
          pointer.x = e.clientX; pointer.y = e.clientY; pointer.t = now;

          if (head3d) {
            var r = heroPhoto.getBoundingClientRect();
            var nx = (e.clientX - (r.left + r.width / 2)) / (window.innerWidth * 0.5);
            var ny = (e.clientY - (r.top + r.height * 0.42)) / (window.innerHeight * 0.5);
            gaze.x = gsap.utils.clamp(-1, 1, nx) * head3d.maxYaw;
            gaze.y = gsap.utils.clamp(-1, 1, ny) * head3d.maxPitch;
            gaze.tracking = true;
            gaze.idleAt = gsap.ticker.time;
          }
        });

        var hero = $('.hero');
        var glowX = gsap.quickTo('.hero__glow', 'x', { duration: 0.9, ease: 'power3' });
        var glowY = gsap.quickTo('.hero__glow', 'y', { duration: 0.9, ease: 'power3' });
        var tiltX = gsap.quickTo('.phone-tilt', 'rotationY', { duration: 0.8, ease: 'power3' });
        var tiltY = gsap.quickTo('.phone-tilt', 'rotationX', { duration: 0.8, ease: 'power3' });
        // плоский параллакс фото нужен только когда нет 3D-головы
        var shotX = heroPhoto && !head3d ? gsap.quickTo($('img', heroPhoto), 'x', { duration: 1, ease: 'power3' }) : null;
        var shotY = heroPhoto && !head3d ? gsap.quickTo($('img', heroPhoto), 'y', { duration: 1, ease: 'power3' }) : null;
        on(hero, 'pointermove', function (e) {
          var r = hero.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width - 0.5;
          var py = (e.clientY - r.top) / r.height - 0.5;
          if (shotX) { shotX(px * -18); shotY(py * -14); }
          glowX(px * r.width);
          glowY(py * r.height);
          tiltX(px * 22);
          tiltY(py * -16);
        });
        on(hero, 'pointerleave', function () { tiltX(0); tiltY(0); });

        // Вариативный шрифт: буквы имени «худеют» рядом с курсором
        var weightTo = heroChars.map(function (ch) { return gsap.quickTo(ch, 'fontWeight', { duration: 0.45, ease: 'power3' }); });
        on(hero, 'pointermove', function (e) {
          heroChars.forEach(function (ch, i) {
            var r = ch.getBoundingClientRect();
            var d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
            weightTo[i](gsap.utils.clamp(200, 800, gsap.utils.mapRange(40, 300, 200, 800, d)));
          });
        });
        on(hero, 'pointerleave', function () { weightTo.forEach(function (to) { to(800); }); });

        // 3D-наклон карточек за курсором
        $$('.stat, .skill-group, .lang, .gc-ladder').forEach(function (el) {
          gsap.set(el, { transformPerspective: 900 });
          var rx = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power3' });
          var ry = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power3' });
          on(el, 'pointermove', function (e) {
            var r = el.getBoundingClientRect();
            ry(((e.clientX - r.left) / r.width - 0.5) * 12);
            rx(((e.clientY - r.top) / r.height - 0.5) * -12);
          });
          on(el, 'pointerleave', function () { rx(0); ry(0); });
        });

        // Хэштеги можно хватать и бросать (Draggable + Inertia), в пределах секции
        if (X.Draggable && hashItems.length) {
          var drags = X.Draggable.create(hashItems, {
            type: 'x,y', bounds: '#contacts', inertia: !!X.Inertia, edgeResistance: 0.75, zIndexBoost: true,
            onPress: function () { gsap.to(this.target, { scale: 1.2, duration: 0.2 }); },
            onRelease: function () { gsap.to(this.target, { scale: 1, duration: 0.3 }); }
          });
          var hint = $('.hashtags__hint');
          if (hint) hint.hidden = false;
          cleanups.push(function () {
            drags.forEach(function (d) { d.kill(); });
            if (hint) hint.hidden = true;
          });
        }

        var cursor = $('.cursor');
        var curX = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3' });
        var curY = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3' });
        var curState = '';
        on(window, 'pointermove', function (e) {
          curX(e.clientX);
          curY(e.clientY);
          var hot = !!e.target.closest('a, button');
          if (curState === (hot ? 'hot' : 'idle')) return; // твин только при смене состояния, а не на каждое движение
          curState = hot ? 'hot' : 'idle';
          gsap.to(cursor, {
            autoAlpha: 1, scale: hot ? 1.9 : 1,
            backgroundColor: hot ? 'rgba(255, 106, 51, 0.18)' : 'rgba(255, 106, 51, 0)',
            duration: 0.3, overwrite: 'auto'
          });
        });
        on(root, 'pointerleave', function () {
          curState = '';
          gsap.to(cursor, { autoAlpha: 0, duration: 0.3, overwrite: 'auto' });
        });

        $$('.magnetic').forEach(function (el) {
          var xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3' });
          var yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3' });
          on(el, 'pointermove', function (e) {
            var r = el.getBoundingClientRect();
            xTo((e.clientX - r.left - r.width / 2) * 0.3);
            yTo((e.clientY - r.top - r.height / 2) * 0.3);
          });
          on(el, 'pointerleave', function () { xTo(0); yTo(0); });
        });

        $$('a.contact').forEach(function (a) {
          var value = $('.contact__value', a);
          var text = value.textContent;
          on(a, 'pointerenter', function () {
            gsap.to(value, { duration: 0.7, ease: 'none', overwrite: true, scrambleText: { text: text, chars: 'lowerCase', speed: 0.6 } });
          });
        });
      }

      return function () { cleanups.forEach(function (fn) { fn(); }); };
    });

    // Шрифт меняет высоту блоков — пересчитываем точки срабатывания
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
  }

  var hasGsap = !!(window.gsap && window.ScrollTrigger && window.SplitText && window.ScrambleTextPlugin && window.ScrollToPlugin);

  render();
  renderGymChess();
  $$('.section__num').forEach(function (n, i) { n.textContent = pad(i + 1); }); // GymChess мог выпасть — нумерация заново
  renderIceberg(hasGsap && !window.matchMedia(REDUCE).matches);
  var chart = makeChart();
  initTheme();
  initLightbox(hasGsap && !window.matchMedia(REDUCE).matches);

  if (hasGsap) initMotion(chart);
  else root.classList.remove('js'); // GSAP не загрузился — показываем всё без анимаций
})();
