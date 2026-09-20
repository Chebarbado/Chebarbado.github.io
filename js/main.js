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
      eduHigher: 'Высшее образование', eduSchool: 'Школа', eduCourses: 'Курсы и сертификаты', watch: 'Смотреть',
      gallery: 'Фото и видео', close: 'Закрыть', cloud: 'Облаком', groups: 'По группам', dragHint: 'Теги можно хватать и бросать'
    },
    en: {
      about: 'About', exp: 'Experience', expTitle: 'Experience', other: 'More', cgi: '3D & video', iceberg: 'Iceberg',
      skills: 'Skills', education: 'Education', contacts: 'Contacts', getInTouch: 'Get in touch', seeExp: 'See experience',
      scroll: 'Scroll', loading: 'loading', depth: 'Depth', source: 'Original résumé (RU) ↗', workTogether: 'Let’s<br>work together',
      phoneTitle: 'Street clocks', phoneUnit: '°C · telemetry', phoneRow: 'Clock', toTop: 'Back to top', sections: 'Sections', theme: 'Toggle theme',
      eduHigher: 'Higher education', eduSchool: 'School', eduCourses: 'Courses and certificates', watch: 'Watch',
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
    function next() {
      y = Math.max(16, Math.min(72, y + (Math.random() - 0.5) * 32));
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
      shift: function () {
        pts.shift();
        pts.push(next());
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
            }, 0.2);
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
          .from($('img', heroPhoto), { scale: 1.35, duration: 1.9, ease: 'power3.out' }, 'show');
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
            gsap.to(reading, {
              v: chart.shift(), duration: 0.8, ease: 'power1.out',
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
        var hero = $('.hero');
        var glowX = gsap.quickTo('.hero__glow', 'x', { duration: 0.9, ease: 'power3' });
        var glowY = gsap.quickTo('.hero__glow', 'y', { duration: 0.9, ease: 'power3' });
        var tiltX = gsap.quickTo('.phone-tilt', 'rotationY', { duration: 0.8, ease: 'power3' });
        var tiltY = gsap.quickTo('.phone-tilt', 'rotationX', { duration: 0.8, ease: 'power3' });
        var shotX = heroPhoto ? gsap.quickTo($('img', heroPhoto), 'x', { duration: 1, ease: 'power3' }) : null;
        var shotY = heroPhoto ? gsap.quickTo($('img', heroPhoto), 'y', { duration: 1, ease: 'power3' }) : null;
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
        $$('.stat, .skill-group, .lang').forEach(function (el) {
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
  renderIceberg(hasGsap && !window.matchMedia(REDUCE).matches);
  var chart = makeChart();
  initTheme();
  initLightbox(hasGsap && !window.matchMedia(REDUCE).matches);

  if (hasGsap) initMotion(chart);
  else root.classList.remove('js'); // GSAP не загрузился — показываем всё без анимаций
})();
