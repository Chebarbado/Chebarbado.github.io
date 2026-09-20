// English version: overrides texts from data.js. Any top-level key missing here falls back to the
// Russian one; for nested objects (photos, cgi, iceberg) missing fields fall back too. Arrays are replaced whole.
window.RESUME_EN = {
  name: 'Alexandr Vinogradov',
  role: 'Hardware & Software Engineer · Android Developer · Video Generalist · Motion Designer · 3D Artist',
  status: 'Open to offers',
  lead: 'Turnkey hardware-software products, Android, Laravel back ends and CGI production. Strongest at Android app optimization: networking, memory leaks, profiling.',
  meta: ['Saint Petersburg', 'Kotlin / Java', 'Laravel', 'Blender'],

  photos: {
    contacts: { src: 'img/signal.webp', caption: 'Looking for signal — drop me a line' }
  },

  about: [
    'I have worked through the full development cycle — from architecture, modules and dependencies to the codebase and release support.',
    'Strongest at Android app optimization: networking, memory leaks, profiling.'
  ],

  stats: [
    { value: 7, suffix: '+', label: 'years in software development' },
    { value: 4, suffix: '+', label: 'years in Android' },
    { value: 2, suffix: '', label: 'mobile platforms: Android and iOS' },
    { text: 'C1', label: 'English' }
  ],

  experience: [
    {
      group: 'Own projects',
      period: '12.2021 — present',
      position: 'Hardware & Software Engineer',
      company: 'GK Time',
      place: 'own project, development under an outsourcing contract',
      points: [
        'Full development cycle of the hardware-software product and bringing it to production',
        'Built apps for dispatching distributed devices from scratch, designed the architecture',
        'Real-time device control',
        'MQTT and API integration, network error handling',
        'Telemetry processing and visualization',
        'Local app cache, SQL',
        'Push notifications: Firebase / Huawei Messaging',
        'Unit and integration tests',
        'Investigating and fixing incidents based on telemetry',
        'Enclosure and part design in Fusion 360, drawings for batch laser cutting'
      ],
      tags: ['Android', 'Hardware', 'MQTT', 'Firebase', 'Huawei Messaging', 'SQL', 'Fusion 360'],
      links: [
        { label: 'Moscow Doverie TV report on street clocks (in Russian) — from 12:20', href: 'https://www.doverie-tv.ru/videos/31259' }
      ],
      media: [
        { src: 'img/gktime-clock.webp', alt: 'GK Time facade clock', w: 960, h: 720 }
      ]
    },
    {
      group: 'Own projects',
      period: '2022 — present',
      position: 'Founder · Video Generalist, Motion Designer, 3D Artist',
      company: 'RNR Studio',
      place: 'CGI & Commercial Production',
      points: [
        'Full CGI video cycle: from the manufacturer\'s CAD model to an edited video with sound',
        'Photorealistic rendering in Cycles: materials, lighting, studio scenes',
        'Product assembly and disassembly animation, physical simulations of water, steam and dust',
        'Editing and compositing in Premiere Pro and After Effects: commercials, tutorials, horizontal and vertical cuts',
        'Work with Russian and international clients (Germany)'
      ],
      tags: ['Blender', 'Cycles', 'Premiere Pro', 'After Effects', 'Fusion 360']
    },
    {
      group: 'Employment',
      period: '02.2019 — 06.2021',
      position: 'Full-stack Developer',
      company: 'Muravey LLC',
      place: 'software development',
      points: [
        'Architecture design and development of a web application',
        'Back end on Laravel, API design',
        'Front-end integration (Vue, React), asynchronous interaction (AJAX)',
        'MySQL database work'
      ],
      tags: ['Laravel', 'Vue 2', 'TypeScript', 'Vanilla JS', 'React', 'MySQL']
    },
    {
      group: 'Employment',
      period: '',
      position: 'Developer',
      company: 'Plotnost Sveta LLC',
      place: 'telecommunications company',
      points: [],
      tags: []
    }
  ],

  gymchess: {
    kicker: 'Own product · Android · Kotlin · Jetpack Compose',
    tagline: 'A pull-up ladder with a chess clock',
    lead: 'A promising game app built on a social sports mechanic. A workout becomes a turn-based duel: 2–4 people, one phone, a clock for each. Your clock only runs on your turn, so rest is a resource you pay for with time.',
    repoLabel: 'Code on GitHub',
    comic: [
      { bubble: 'Ladder to 10, ten minutes each. Go!', caption: 'Two people at the bar and one phone. Each has their own chess clock.' },
      { bubble: 'Your clock is ticking!', caption: 'Your turn — your time runs. Finish the set, pass the turn. While your rival works, you rest for free.' },
      { bubble: 'I need a break… but it costs time', caption: 'The ladder grows: 1, 2, 3… Every second of rest on your turn eats your reserve. That is the tactics.' },
      { bubble: 'Flag fell!', caption: 'Out of time — you are out. The winner completes the ladder with the most time left.' }
    ],
    counting: {
      title: 'How pull-ups are counted',
      now: {
        badge: 'Today',
        title: 'Your rival is the referee',
        text: 'The phone lies nearby. Finish your set, tap “Pass turn”, and your rival’s clock starts. Rep quality is policed by the people standing next to you — that is the social mechanic.',
        button: 'Pass turn'
      },
      next: {
        badge: 'Concept · not in the code yet',
        title: 'Camera auto-counting',
        text: 'A phone on a tripod watches the player; a pose-estimation model returns key points: wrists, elbows, shoulders, chin. A rep counts only when the chin rises above the bar and the arms then fully extend. Fall short and it does not count.',
        labels: {
          bar: 'bar line', angle: 'elbow angle', up: 'UP', down: 'DOWN', reps: 'reps',
          signal: 'chin height', high: 'threshold: above the bar', low: 'threshold: arms straight',
          ok: '+1 counted', miss: 'not counted', rule: 'DOWN → UP → DOWN = +1'
        }
      }
    },
    facts: [
      { text: '2–4', label: 'players on one device' },
      { value: 4, label: 'ladder types' },
      { value: 2, label: 'exercises: pull-ups and dips' },
      { value: 50, label: 'unit tests for the engine and screens' }
    ],
    laddersTitle: 'Ladder types',
    ladders: [
      { name: 'Fast', pattern: '1-2-3…', steps: [1, 2, 3, 4, 5, 6, 7], note: 'shared: players alternate steps' },
      { name: 'Slow', pattern: '1-1-2-2…', steps: [1, 1, 2, 2, 3, 3, 4], note: 'each climbs their own' },
      { name: 'Up only', pattern: '1…N', steps: [1, 2, 3, 4, 5, 6, 7], note: 'each climbs their own' },
      { name: 'Up and down', pattern: '1…N…1', steps: [1, 2, 3, 4, 3, 2, 1], note: 'each climbs their own' }
    ],
    flowTitle: 'Player journey',
    flow: ['Setup', 'Players', 'Game', 'Results', 'History'],
    stackTitle: 'Under the hood',
    stack: ['Kotlin', 'Jetpack Compose', 'Material 3', 'Navigation Compose', 'DataStore', 'MVVM', 'Pure domain layer', 'Coroutines', 'Sound and vibration on timeout', 'History: 50 games'],
    potentialTitle: 'Where it can grow',
    potential: ['Online duels and rating', 'Challenges for friends and teams', 'More exercises', 'Progress statistics']
  },

  other: [
    { title: 'Android and iOS', text: 'Built Android and iOS apps end to end — from development to publishing on Google Play and the App Store.' },
    { title: '3D and shaders', text: 'Built 3D shader pipelines in C++ and GLSL (game engine).' },
    { title: 'Photogrammetry / 3DGS', text: 'Built an end-to-end photogrammetry / 3DGS system.' },
    { title: 'CTF', text: 'I take part in CTF competitions: t-ctf, alfa-ctf, avito-ctf. At avito-ctf our team finished in the top 20.' },
    { title: 'Hardware', text: 'Hands-on experience building hardware solutions.' },
    { title: 'NeuroSlav neurogadget', text: 'A friendly project together with the Almazov National Medical Research Centre and Tusion Ltd. 2018.',
      image: 'img/neuroslav-2.webp',
      gallery: [
        { video: 'media/neuroslav.mp4', poster: 'img/neuroslav-2.webp' },
        { src: 'img/neuroslav-1.webp', alt: 'NeuroSlav neurogadget: enclosure with status LED' },
        { src: 'img/neuroslav-2.webp', alt: 'NeuroSlav neurogadget: electronics unit on the headband' },
        { src: 'img/neuroslav-3.webp', alt: 'NeuroSlav neurogadget: headband with ear clips' }
      ] },
    { title: 'Acrobatics', text: 'A hobby. Wall flip from five steps; most rotations in a single-jump somersault — 2.', flip: 2, image: 'img/bridge.webp' },
    { title: 'Spin', text: 'Performed a spin in an L-13 Blaník. 2025.', href: 'https://youtu.be/6_RURLVdiws', linkLabel: 'Watch the video', spin: 3 }
  ],

  skills: [
    { group: 'Languages and platform', items: ['Kotlin', 'Java', 'Android SDK'] },
    { group: 'Architecture and async', items: ['Clean Architecture, MVP, MVVM', 'DI, Dagger2', 'Coroutines', 'RxJava, Kotlin Flow'] },
    { group: 'Data and networking', items: ['Room', 'SQLDelight', 'Retrofit', 'REST API, Webhooks', 'Firebase'] },
    { group: 'Optimization and quality', items: ['Profiling', 'Memory leak hunting', 'Network optimization', 'Unit tests, Mockk', 'Git, terminal'] },
    { group: 'Web and back end', items: ['Laravel', 'Vue 2', 'TypeScript', 'Vanilla JS', 'React', 'MySQL', 'AJAX'] },
    { group: '3D, video and hardware', items: ['Blender', 'Cycles', 'C++ / GLSL', 'Photogrammetry / 3DGS', 'Premiere Pro', 'After Effects', 'Fusion 360'] }
  ],

  cgi: {
    intro: 'The whole CGI video cycle in one pair of hands: from the manufacturer\'s CAD model to an edited video with sound. Focus: photo-real.',
    steps: [
      { title: 'Model', text: 'Importing manufacturer CAD models (STEP, STL), cleaning up and refining geometry, modelling what is missing in Blender and Fusion 360.', tools: ['Blender', 'Fusion 360', 'STEP / STL'] },
      { title: 'Scene', text: 'Photorealistic materials, lighting and environment for the product: plastic, glass, metal, water. Studio scenes and interiors.', tools: ['Blender', 'Materials', 'Lighting'] },
      { title: 'Animation and simulation', text: 'Product assembly and disassembly, mechanics demos. Physical simulations of water, steam and dust — 2,455 frames of VDB cache.', tools: ['Blender physics', 'Fluid sim', 'VDB'] },
      { title: 'Render', text: 'Photo-real rendering in Cycles. PNG and EXR sequences — 5,887,000 frames, square and widescreen, up to 3K.', tools: ['Cycles', 'PNG / EXR', '2K — 3K'] },
      { title: 'Edit', text: 'Editing in Premiere Pro, graphics and compositing in After Effects. Commercials (including 30-second marketplace ads), tutorials, horizontal and vertical cuts.', tools: ['Premiere Pro', 'After Effects', '16:9 · 9:16'] },
      { title: 'Sound', text: 'Music selection and sound design: a working library of 400+ tracks and effects.', tools: ['Music', 'Sound FX'] }
    ]
  },

  iceberg: {
    title: 'Tip of the iceberg',
    tip: 'On a résumé it is a single line — “3D shader pipelines”. Below the waterline there is a whole CGI production: 3D product videos with water, steam and dust simulations.',
    unit: 'TB',
    stops: [
      { line: 'A', color: '#0039a6', value: '30+', label: 'projects: from vacuum cleaners to medical devices' },
      { line: '1', color: '#ee352e', value: '196', label: 'Blender scenes across 27 projects · 85 GB' },
      { line: 'N', color: '#fccc0a', value: '2,455', label: 'frames of VDB simulations: water, steam, dust' },
      { line: '7', color: '#b933ad', value: '5,887,000', label: 'rendered frames: PNG and EXR sequences, up to 3K' },
      { line: 'G', color: '#6cbe45', value: '833', label: 'video files: sources, assemblies and final cuts · Premiere Pro, After Effects' },
      { line: 'L', color: '#a7a9ac', value: '259', label: 'STL models, Fusion 360, DXF and DWG — enclosures, parts, sheet-metal cutting' },
      { line: 'S', color: '#ff6a33', value: '51 TB', label: 'of working files · 2022–2026. And that is just the tip.' }
    ],
    brands: ['Home appliances', 'Medical', 'Climate', 'Kitchen', 'Home care'],
    projects: [
      { name: 'Wet vacuum', gb: 218.33 }, { name: 'Robot vacuum', gb: 53.75 }, { name: 'Range hood', gb: 42.99 },
      { name: 'Steam care', gb: 32.06 }, { name: 'Project 05', gb: 27.47 }, { name: 'Boat drive', gb: 23.54 },
      { name: 'Project 07', gb: 11.09 }, { name: 'Project 08', gb: 10.31 }, { name: 'Project 09', gb: 6.89 },
      { name: 'Project 10', gb: 6.59 }, { name: 'Project 11', gb: 6.48 }, { name: 'Project 12', gb: 4.52 },
      { name: 'Project 13', gb: 4.13 }, { name: 'Project 14', gb: 3.93 }, { name: 'Project 15', gb: 3.54 },
      { name: 'Medical device', gb: 3.33 }, { name: 'Air washer', gb: 3.13 }, { name: 'Iron', gb: 2.86 },
      { name: 'Project 19', gb: 2.32 }, { name: 'Showreel', gb: 1.6 }, { name: 'Project 21', gb: 1.55 },
      { name: 'Project 22', gb: 1.25 }, { name: 'Project 23', gb: 1.11 }, { name: 'Project 24', gb: 1.04 },
      { name: 'Project 25', gb: 0.99 }, { name: 'Project 26', gb: 0.81 }, { name: 'Project 27', gb: 0.79 },
      { name: 'Project 28', gb: 0.64 }, { name: 'Project 29', gb: 0.4 }, { name: 'Project 30', gb: 0.06 },
      { name: 'Juicer', gb: 0.04 }, { name: 'GK Time', gb: 0.03 }
    ]
  },

  languages: [
    { name: 'English', level: 'C1 — advanced', score: 4 },
    { name: 'Russian', level: 'C2 — native', score: 5 }
  ],

  education: [
    { period: '', title: 'Moscow Technological Institute', place: 'design engineer', note: '' },
    { period: '2012 — 2014', from: 2012, to: 2014, short: 'UNECON', title: 'St. Petersburg State University of Economics (UNECON)', place: 'Faculty of Economics', note: 'accounting and management' },
    { period: '2006 — 2012', from: 2006, to: 2012, short: 'SPbU', title: 'St. Petersburg State University (SPbU)', place: 'Faculty of Applied Mathematics and Control Processes', note: 'Dept. of Economic Systems Modelling' }
  ],
  schools: [
    { period: '2005 — 2006', from: 2005, to: 2006, short: '555', title: 'School No. 555', place: 'Saint Petersburg', note: '' },
    { period: '2004 — 2005', from: 2004, to: 2005, short: '239', title: 'Physics and Mathematics Lyceum No. 239', place: 'Saint Petersburg', note: '' }
  ],

  contacts: [
    { label: 'Phone', value: '+7 981 893-24-92', href: 'tel:+79818932492' },
    { label: 'Email', value: '6420527@mail.ru', href: 'mailto:6420527@mail.ru' },
    { label: 'GitHub', value: 'github.com/Chebarbado', href: 'https://github.com/Chebarbado' }
  ]
};
