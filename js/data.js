// Весь контент сайта (русская версия) — в этом файле. Английская — в data.en.js:
// там переопределяются только тексты, всё остальное (фото, ссылки, цифры) берётся отсюда.
// Пустые поля и пустые массивы просто не выводятся на странице.
window.RESUME = {
  name: 'Александр Виноградов',
  role: 'Разработчик программно-аппаратных решений · Android-разработчик · Video-дженералист · Motion-designer · 3D-artist',
  status: 'Открыт к предложениям',
  lead: 'Программно-аппаратные решения под ключ, Android, backend на Laravel и CGI-продакшн. Сильная сторона — оптимизация Android-приложений: сеть, утечки памяти, профилирование.',
  meta: ['Санкт-Петербург', 'Kotlin / Java', 'Laravel', 'Blender'],
  sourceUrl: 'https://myresume.ru/resume/8mfaOtYYyu8/',

  // Фото (лежат в img/). Любое поле можно убрать — блок просто не появится
  photos: {
    hero: 'img/portrait.webp',
    about: 'img/lookout.webp',
    contacts: { src: 'img/signal.webp', caption: 'Ловлю связь — напишите мне' }
  },

  // Бегущая строка под первым экраном
  marquee: ['Kotlin', 'Laravel', 'Android SDK', 'Blender', 'Vue 2 / TypeScript', 'MQTT', 'C++ / GLSL', 'Fusion 360', 'Cycles'],

  // Первый абзац — крупное заявление (проявляется по словам при скролле), остальные — обычный текст
  about: [
    'Участвовал в полном цикле разработки — от архитектуры, модулей и зависимостей до кодовой базы и сопровождения релиза.',
    'Сильная сторона — оптимизация Android-приложений: сеть, утечки памяти, профилирование.'
  ],

  // value — число (анимируется счётчиком) или text — строка (проявляется «расшифровкой»)
  stats: [
    { value: 7, suffix: '+', label: 'лет в разработке' },
    { value: 4, suffix: '+', label: 'года в Android' },
    { value: 2, suffix: '', label: 'мобильные платформы: Android и iOS' },
    { text: 'C1', label: 'английский' }
  ],

  // group — подзаголовок на таймлайне (выводится, когда меняется). links и media — необязательные
  experience: [
    {
      group: 'Собственные проекты',
      period: '12.2021 — н.в.',
      position: 'Разработчик программно-аппаратных решений',
      company: '«ГК Тайм»',
      place: 'собственный проект, разработка по договору аутсорса',
      points: [
        'Полный цикл разработки программно-аппаратной части и выведения в продакшен',
        'Разработка приложений для диспетчеризации распределённых устройств с нуля, создание архитектуры',
        'Реализация управления устройствами в реальном времени',
        'Интеграция с MQTT и API, обработка сетевых ошибок',
        'Обработка и отображение телеметрии',
        'Локальный кеш приложения, SQL',
        'Работа с пушами, Firebase / Huawei Messaging',
        'Юнит-тесты, интеграционные тесты',
        'Расследование и исправление инцидентов на основе телеметрии',
        'Проектирование корпусов и деталей в Fusion 360, чертежи для лазерной резки партиями'
      ],
      tags: ['Android', 'Hardware', 'MQTT', 'Firebase', 'Huawei Messaging', 'SQL', 'Fusion 360'],
      links: [
        { label: 'Сюжет телеканала «Москва Доверие» об уличных часах — с 12:20', href: 'https://www.doverie-tv.ru/videos/31259' }
      ],
      media: [
        { src: 'img/gktime-clock.webp', alt: 'Фасадные часы «ГК Тайм»', w: 960, h: 720 }
      ]
    },
    {
      group: 'Собственные проекты',
      period: '2022 — н.в.',
      position: 'Основатель · Video-дженералист, motion-designer, 3D-artist',
      company: 'RNR Studio',
      place: 'CGI & Commercial Production',
      points: [
        'Полный цикл CGI-ролика: от CAD-модели производителя до смонтированного видео со звуком',
        'Фотореалистичный рендер в Cycles: материалы, свет, студийные сцены',
        'Анимация сборки и разборки изделий, физические симуляции воды, пара и пыли',
        'Монтаж и композитинг в Premiere Pro и After Effects: рекламные ролики, обучающие видео, горизонтальные и вертикальные версии',
        'Работа с российскими и зарубежными заказчиками (Германия)'
      ],
      tags: ['Blender', 'Cycles', 'Premiere Pro', 'After Effects', 'Fusion 360']
    },
    {
      group: 'Работа в компаниях',
      period: '02.2019 — 06.2021',
      position: 'Fullstack-разработчик',
      company: 'ООО «Муравей»',
      place: 'разработка ПО',
      points: [
        'Проектирование архитектуры и разработка web-приложения',
        'Разработка backend на Laravel, создание API',
        'Интеграция frontend (Vue, React), реализация асинхронного взаимодействия (AJAX)',
        'Работа с базой данных MySQL'
      ],
      tags: ['Laravel', 'Vue 2', 'TypeScript', 'Vanilla JS', 'React', 'MySQL']
    },
    {
      group: 'Работа в компаниях',
      period: '',
      position: 'Разработчик',
      company: 'ООО «Плотность света»',
      place: 'телекоммуникационная компания',
      points: [],
      tags: []
    }
  ],

  // Карточки раздела «Прочее» (на десктопе — горизонтальный скролл).
  // href — ссылка в карточке; image — фото фоном; gallery — кнопка «Фото и видео» с галереей (video+poster или src+alt); flip / spin — номер карточки крутит сальто / штопор (число оборотов)
  other: [
    { title: 'Android и iOS', text: 'Разрабатывал Android и iOS приложения в полном цикле — от разработки до публикации в Google Play и App Store.' },
    { title: '3D и шейдеры', text: 'Создавал шейдерные пайплайны 3D на C++ и GLSL (игровой движок).' },
    { title: 'Фотограмметрия / 3DGS', text: 'Создал e2e систему фотограмметрии / 3DGS.' },
    { title: 'CTF', text: 'Участвую в соревнованиях CTF: t-ctf, alfa-ctf, avito-ctf. На avito-ctf итоговое место команды — в топ-20.' },
    { title: 'Hardware', text: 'Имею практический опыт создания hardware-решений.' },
    { title: 'Нейрогаджет «НейроСлав»', text: 'Дружеский проект совместно с ФГБУ «НМИЦ им. В. А. Алмазова» Минздрава России и Tusion Ltd. 2018.',
      image: 'img/neuroslav-2.webp',
      gallery: [
        { video: 'media/neuroslav.mp4', poster: 'img/neuroslav-2.webp' },
        { src: 'img/neuroslav-1.webp', alt: 'Нейрогаджет «НейроСлав»: корпус с индикатором' },
        { src: 'img/neuroslav-2.webp', alt: 'Нейрогаджет «НейроСлав»: блок электроники на ободке' },
        { src: 'img/neuroslav-3.webp', alt: 'Нейрогаджет «НейроСлав»: ободок с ушными клипсами' }
      ] },
    { title: 'Акробатика', text: 'Увлечение. Сальто с пяти шагов от стены; максимум оборотов в сальто с одного выпрыга — 2.', flip: 2, image: 'img/bridge.webp' },
    { title: 'Штопор', text: 'Выполнил штопор на L-13 Blaník. 2025.', href: 'https://youtu.be/6_RURLVdiws', linkLabel: 'Смотреть видео', spin: 3 }
  ],

  skills: [
    { group: 'Языки и платформа', items: ['Kotlin', 'Java', 'Android SDK'] },
    { group: 'Архитектура и асинхронность', items: ['Clean Architecture, MVP, MVVM', 'DI, Dagger2', 'Coroutines', 'RxJava, Kotlin Flow'] },
    { group: 'Данные и сеть', items: ['Room', 'SQLDelight', 'Retrofit', 'REST API, Webhooks', 'Firebase'] },
    { group: 'Оптимизация и качество', items: ['Профилирование', 'Поиск утечек памяти', 'Оптимизация сети', 'Unit-tests, Mockk', 'Git, terminal'] },
    { group: 'Web и backend', items: ['Laravel', 'Vue 2', 'TypeScript', 'Vanilla JS', 'React', 'MySQL', 'AJAX'] },
    { group: '3D, видео и hardware', items: ['Blender', 'Cycles', 'C++ / GLSL', 'Фотограмметрия / 3DGS', 'Premiere Pro', 'After Effects', 'Fusion 360'] }
  ],

  // «3D и видео»: пайплайн CGI-ролика по шагам
  cgi: {
    studio: 'RNR Studio · CGI & Commercial Production',
    intro: 'Полный цикл CGI-ролика в одних руках: от CAD-модели производителя до смонтированного видео со звуком. Направленность — photo-real.',
    steps: [
      { title: 'Модель', text: 'Импорт CAD-моделей производителя (STEP, STL), чистка и доработка геометрии, моделирование недостающего в Blender и Fusion 360.', tools: ['Blender', 'Fusion 360', 'STEP / STL'] },
      { title: 'Сцена', text: 'Фотореалистичные материалы, свет и окружение под продукт: пластик, стекло, металл, вода. Студийные сцены и интерьеры.', tools: ['Blender', 'Материалы', 'Свет'] },
      { title: 'Анимация и симуляции', text: 'Сборка и разборка изделий, демонстрация механики. Физические симуляции воды, пара и пыли — 2 455 кадров VDB-кэша.', tools: ['Blender physics', 'Fluid sim', 'VDB'] },
      { title: 'Рендер', text: 'Photo-real рендер в Cycles. Секвенции PNG и EXR — 5 887 000 кадров, квадратные и широкоформатные, до 3K.', tools: ['Cycles', 'PNG / EXR', '2K — 3K'] },
      { title: 'Монтаж', text: 'Сборка роликов в Premiere Pro, графика и композитинг в After Effects. Рекламные ролики (в том числе 30-секундные для Ozon), обучающие видео, горизонтальные и вертикальные версии.', tools: ['Premiere Pro', 'After Effects', '16:9 · 9:16'] },
      { title: 'Звук', text: 'Подбор музыки и sound design: рабочая библиотека из 400+ треков и эффектов.', tools: ['Музыка', 'Sound FX'] }
    ]
  },

  /* «Айсберг»: то, что не помещается в резюме. Здание = проект, глубина под водой ∝ его объёму.
     Названия заказчиков и моделей обезличены. Общий объём (51 ТБ) и число кадров рендера — оценка владельца
     по всему архиву; остальные цифры посчитаны по одной из папок проектов. */
  iceberg: {
    kicker: 'Vol. 51 TB · Late City Edition',
    title: 'Верхушка айсберга',
    tip: 'В резюме это одна строка — «шейдерные пайплайны 3D». Под водой — целый CGI-продакшн: 3D-ролики техники с симуляцией воды, пара и пыли.',
    total: 51,
    unit: 'ТБ',
    ticker: ['Blender', 'Cycles', 'Fluid sim', 'VDB', 'EXR', 'Premiere Pro', 'After Effects', 'Fusion 360', 'STL', 'GLSL'],
    // line/color — «маршрут» в стиле нью-йоркского метро
    stops: [
      { line: 'A', color: '#0039a6', value: '30+', label: 'проектов: от пылесосов до медтехники' },
      { line: '1', color: '#ee352e', value: '196', label: 'сцен Blender в 27 проектах · 85 ГБ' },
      { line: 'N', color: '#fccc0a', value: '2 455', label: 'кадров VDB-симуляций: вода, пар, пыль' },
      { line: '7', color: '#b933ad', value: '5 887 000', label: 'кадров рендера: секвенции PNG и EXR, до 3K' },
      { line: 'G', color: '#6cbe45', value: '833', label: 'видеофайла: исходники, сборки и финальные ролики · Premiere Pro, After Effects' },
      { line: 'L', color: '#a7a9ac', value: '259', label: 'STL-моделей, Fusion 360, DXF и DWG — корпуса, детали, раскрой металла' },
      { line: 'S', color: '#ff6a33', value: '51 ТБ', label: 'рабочих материалов · 2022–2026. И это только верхушка.' }
    ],
    brands: ['Бытовая техника', 'Медтехника', 'Климат', 'Кухня', 'Уход за домом'],
    projects: [
      { name: 'Моющий пылесос', gb: 218.33 }, { name: 'Робот-пылесос', gb: 53.75 }, { name: 'Вытяжка', gb: 42.99 },
      { name: 'Паровая техника', gb: 32.06 }, { name: 'Проект 05', gb: 27.47 }, { name: 'Лодочный привод', gb: 23.54 },
      { name: 'Проект 07', gb: 11.09 }, { name: 'Проект 08', gb: 10.31 }, { name: 'Проект 09', gb: 6.89 },
      { name: 'Проект 10', gb: 6.59 }, { name: 'Проект 11', gb: 6.48 }, { name: 'Проект 12', gb: 4.52 },
      { name: 'Проект 13', gb: 4.13 }, { name: 'Проект 14', gb: 3.93 }, { name: 'Проект 15', gb: 3.54 },
      { name: 'Медприбор', gb: 3.33 }, { name: 'Мойка воздуха', gb: 3.13 }, { name: 'Утюг', gb: 2.86 },
      { name: 'Проект 19', gb: 2.32 }, { name: 'Showreel', gb: 1.6 }, { name: 'Проект 21', gb: 1.55 },
      { name: 'Проект 22', gb: 1.25 }, { name: 'Проект 23', gb: 1.11 }, { name: 'Проект 24', gb: 1.04 },
      { name: 'Проект 25', gb: 0.99 }, { name: 'Проект 26', gb: 0.81 }, { name: 'Проект 27', gb: 0.79 },
      { name: 'Проект 28', gb: 0.64 }, { name: 'Проект 29', gb: 0.4 }, { name: 'Проект 30', gb: 0.06 },
      { name: 'Соковыжималка', gb: 0.04 }, { name: 'ГК Тайм', gb: 0.03 }
    ]
  },

  // score — уровень из 5
  languages: [
    { name: 'Английский', level: 'C1 — продвинутый', score: 4 },
    { name: 'Русский', level: 'C2 — профессиональный', score: 5 }
  ],

  // from/to — годы для оси времени над списком (записи без них на ось не попадают), short — подпись на оси
  education: [
    { period: '', title: 'Московский технологический институт', place: 'инженер-конструктор', note: '' },
    { period: '2012 — 2014', from: 2012, to: 2014, short: 'СПбГЭУ', title: 'СПбГЭУ', place: 'экономический фак.', note: 'бухгалтерия и менеджмент' },
    { period: '2006 — 2012', from: 2006, to: 2012, short: 'СПбГУ', title: 'СПбГУ', place: 'фак. ПМ-ПУ', note: 'каф. моделирования экономических систем' }
  ],
  schools: [
    { period: '2005 — 2006', from: 2005, to: 2006, short: '555', title: 'Школа № 555', place: 'Санкт-Петербург', note: '' },
    { period: '2004 — 2005', from: 2004, to: 2005, short: '239', title: 'Физико-математический лицей № 239', place: 'Санкт-Петербург', note: '' }
  ],
  courses: [],

  // Хэштеги: облако под контактами + meta keywords. Пишутся без «#» и без пробелов. Общие для обоих языков
  hashtags: [
    'Android', 'Kotlin', 'Java', 'AndroidPerformance', 'Profiling', 'MemoryLeaks', 'MQTT', 'IoT', 'Embedded', 'Hardware',
    'Laravel', 'Vue', 'TypeScript', 'Fullstack', 'Blender', 'Cycles', 'CGI', '3D', 'PhotoReal', 'MotionDesign',
    'VideoProduction', 'AfterEffects', 'PremierePro', 'Fusion360', 'GLSL', 'Cpp', 'Photogrammetry', '3DGS', 'CTF', 'SaintPetersburg'
  ],

  // href: mailto:, tel:, https:// или tg://
  contacts: [
    { label: 'Телефон', value: '+7 981 893-24-92', href: 'tel:+79818932492' },
    { label: 'Почта', value: '6420527@mail.ru', href: 'mailto:6420527@mail.ru' },
    { label: 'GitHub', value: 'github.com/Chebarbado', href: 'https://github.com/Chebarbado' }
  ]
};
