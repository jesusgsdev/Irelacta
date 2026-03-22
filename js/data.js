/**
 * data.js – localStorage data layer for Irelacta
 *
 * Schema
 * ──────
 * users          : [{ id, username, password, role('consultant'|'mum'), name, mumId? }]
 * mums           : [{ id, name, email, phone, dob, babyName, babyDob, notes, createdAt }]
 * consultations  : [{ id, mumId, date, time, notes, recommendations, nextSteps, consultantId, createdAt }]
 */

const DB = (() => {
  const KEYS = {
    USERS:         'irelacta_users',
    MUMS:          'irelacta_mums',
    CONSULTATIONS: 'irelacta_consultations',
    CURRENT_USER:  'irelacta_current_user',
  };

  /* ── helpers ─────────────────────────────────────── */
  const uid = () => '_' + Math.random().toString(36).slice(2, 11);
  const now = () => new Date().toISOString();

  const read  = key => JSON.parse(localStorage.getItem(key) || 'null');
  const write = (key, val) => localStorage.setItem(key, JSON.stringify(val));

  /* ── seed demo data ──────────────────────────────── */
  function seed() {
    if (read(KEYS.USERS)) return; // already seeded

    const consultantId = uid();
    const mum1Id       = uid();
    const mum2Id       = uid();
    const mum3Id       = uid();
    const mum4Id       = uid();
    const mum5Id       = uid();
    const mum1UserId   = uid();
    const mum2UserId   = uid();
    const mum3UserId   = uid();
    const mum4UserId   = uid();
    const mum5UserId   = uid();
    const cons1Id      = uid();
    const cons2Id      = uid();
    const cons3Id      = uid();

    write(KEYS.USERS, [
      {
        id: consultantId, username: 'consultant',
        password: 'demo1234', role: 'consultant',
        name: 'Dr. Sarah O\'Brien',
      },
      {
        id: mum1UserId, username: 'emma',
        password: 'demo1234', role: 'mum',
        name: 'Emma Thompson', mumId: mum1Id,
      },
      {
        id: mum2UserId, username: 'lily',
        password: 'demo1234', role: 'mum',
        name: 'Lily García', mumId: mum2Id,
      },
      {
        id: mum3UserId, username: 'claire',
        password: 'demo1234', role: 'mum',
        name: 'Claire Murphy', mumId: mum3Id,
      },
      {
        id: mum4UserId, username: 'sophie',
        password: 'demo1234', role: 'mum',
        name: 'Sophie Walsh', mumId: mum4Id,
      },
      {
        id: mum5UserId, username: 'aoife',
        password: 'demo1234', role: 'mum',
        name: 'Aoife Brennan', mumId: mum5Id,
      },
    ]);

    write(KEYS.MUMS, [
      {
        id: mum1Id, name: 'Emma Thompson',
        email: 'emma@example.com', phone: '+353 87 123 4567',
        dob: '1991-06-14',
        babyName: 'Oliver', babyDob: '2026-01-10',
        notes: 'First-time mum. Had a C-section. Breastfeeding well.',
        createdAt: '2026-01-11T09:00:00.000Z',
      },
      {
        id: mum2Id, name: 'Lily García',
        email: 'lily@example.com', phone: '+353 86 765 4321',
        dob: '1988-11-03',
        babyName: 'Sofia', babyDob: '2026-02-05',
        notes: 'Second baby. Natural birth. Experiencing mild postnatal anxiety.',
        createdAt: '2026-02-06T10:30:00.000Z',
      },
      {
        id: mum3Id, name: 'Claire Murphy',
        email: 'claire@example.com', phone: '+353 85 234 5678',
        dob: '1993-03-22',
        babyName: 'Noah', babyDob: '2025-12-15',
        notes: 'First-time mum. Natural birth. Significant breastfeeding difficulties with latch and milk supply.',
        createdAt: '2025-12-20T09:00:00.000Z',
      },
      {
        id: mum4Id, name: 'Sophie Walsh',
        email: 'sophie@example.com', phone: '+353 89 345 6789',
        dob: '1990-07-18',
        babyName: null, babyDob: null,
        notes: 'Currently 30 weeks pregnant. First pregnancy. Regular antenatal follow-up appointments.',
        createdAt: '2025-11-10T10:00:00.000Z',
      },
      {
        id: mum5Id, name: 'Aoife Brennan',
        email: 'aoife@example.com', phone: '+353 83 456 7890',
        dob: '1995-11-29',
        babyName: null, babyDob: null,
        notes: 'Currently 32 weeks pregnant. Using hypnobirthing techniques to manage birth anxiety.',
        createdAt: '2026-01-05T11:00:00.000Z',
      },
    ]);

    /* Helper: generate one consultation per matching weekday in each given month.
       dayOfWeek follows JS Date convention: 0=Sun, 1=Mon … 6=Sat */
    function makeWeekly(mumId, dayOfWeek, months, time, notes, recommendations, nextSteps) {
      return months.flatMap(([y, m]) => {
        const last = new Date(y, m, 0).getDate();
        const slots = [];
        for (let d = 1; d <= last; d++) {
          if (new Date(y, m - 1, d).getDay() === dayOfWeek) {
            const ds = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            slots.push({
              id: uid(), mumId,
              date: ds, time,
              notes, recommendations, nextSteps,
              consultantId,
              createdAt: `${ds}T${time}:00.000Z`,
            });
          }
        }
        return slots;
      });
    }

    const marchApril = [[2026, 3], [2026, 4]];

    write(KEYS.CONSULTATIONS, [
      // ── Existing consultations ──────────────────────────
      {
        id: cons1Id, mumId: mum1Id,
        date: '2026-01-15', time: '10:00',
        notes: 'Emma is recovering well from the C-section. Wound healing normally. Baby is feeding every 2–3 hours.',
        recommendations: 'Continue paracetamol as needed for pain. Gentle walks recommended. Avoid lifting heavy objects.',
        nextSteps: 'Review wound at next visit. Refer to physiotherapy for pelvic floor exercises.',
        consultantId,
        createdAt: '2026-01-15T10:45:00.000Z',
      },
      {
        id: cons2Id, mumId: mum1Id,
        date: '2026-02-05', time: '11:30',
        notes: 'Six-week check. Emma is doing well emotionally and physically. Slight tiredness reported.',
        recommendations: 'Iron supplements due to borderline low levels in blood test. Encourage rest when baby sleeps.',
        nextSteps: 'Repeat blood test in 4 weeks. Provide information on local new-mum support group.',
        consultantId,
        createdAt: '2026-02-05T12:15:00.000Z',
      },
      {
        id: cons3Id, mumId: mum2Id,
        date: '2026-02-10', time: '14:00',
        notes: 'Lily reports difficulty sleeping and persistent worry. Edinburgh Postnatal Depression Scale score: 10.',
        recommendations: 'Normalise anxiety. Breathing exercises introduced. Encouraged journalling. Partner support discussed.',
        nextSteps: 'Refer to perinatal mental health team if symptoms worsen. Follow up in 2 weeks.',
        consultantId,
        createdAt: '2026-02-10T14:50:00.000Z',
      },
      // ── Claire Murphy – 5 lactation consultations ──────
      {
        id: uid(), mumId: mum3Id,
        date: '2025-12-20', time: '10:00',
        notes: 'Initial breastfeeding assessment. Claire reports significant pain during feeds. Latch observed and found to be shallow.',
        recommendations: 'Laid-back breastfeeding position trialled. Nipple shields provided temporarily. Increase feed frequency.',
        nextSteps: 'Return in two weeks for latch reassessment. Contact helpline if pain worsens.',
        consultantId,
        createdAt: '2025-12-20T10:45:00.000Z',
      },
      {
        id: uid(), mumId: mum3Id,
        date: '2026-01-05', time: '10:30',
        notes: 'Latch showing improvement with laid-back position. Pain reduced. Noah\'s weight gain slightly below expected curve – milk supply concerns raised.',
        recommendations: 'Offer both breasts at each feed. Top up with expressed milk after feeds if needed.',
        nextSteps: 'Weigh Noah weekly. Introduce hand expression and pumping to stimulate supply.',
        consultantId,
        createdAt: '2026-01-05T11:15:00.000Z',
      },
      {
        id: uid(), mumId: mum3Id,
        date: '2026-01-19', time: '10:00',
        notes: 'Power pumping schedule introduced over the past fortnight. Claire is supplementing with expressed milk. Noah\'s weight gain improving.',
        recommendations: 'Continue power pumping twice daily. Stay hydrated and maintain regular meals. Rest as much as possible.',
        nextSteps: 'Review supply increase at next session. Consider temporary formula top-up if weight gain stalls.',
        consultantId,
        createdAt: '2026-01-19T10:50:00.000Z',
      },
      {
        id: uid(), mumId: mum3Id,
        date: '2026-02-02', time: '10:30',
        notes: 'Milk supply noticeably recovering. Claire more confident with latch. Supplemental feeds reduced. Noah back on growth curve.',
        recommendations: 'Gradually phase out formula top-ups over next two weeks. Continue skin-to-skin contact.',
        nextSteps: 'Final lactation review in two weeks to confirm full breastfeeding established.',
        consultantId,
        createdAt: '2026-02-02T11:20:00.000Z',
      },
      {
        id: uid(), mumId: mum3Id,
        date: '2026-02-16', time: '10:00',
        notes: 'Full breastfeeding now established. Pain-free latch confirmed. Noah gaining weight consistently. Claire reports growing enjoyment of feeds.',
        recommendations: 'No formula supplementation needed. Continue current feeding routine. Self-care and rest remain important.',
        nextSteps: 'Discharge from intensive lactation support. Open appointment available if concerns arise.',
        consultantId,
        createdAt: '2026-02-16T10:45:00.000Z',
      },
      // ── Sophie Walsh – pregnancy follow-up consultations ─
      {
        id: uid(), mumId: mum4Id,
        date: '2025-11-15', time: '11:00',
        notes: 'Review of 20-week anatomy scan results. All structures developing normally. Placenta anterior, position noted. Sophie feeling well, mild heartburn reported.',
        recommendations: 'Small frequent meals to manage heartburn. Avoid lying down immediately after eating. Antacids approved if needed.',
        nextSteps: 'Schedule glucose tolerance test at 24 weeks. Continue folic acid and vitamin D supplementation.',
        consultantId,
        createdAt: '2025-11-15T11:45:00.000Z',
      },
      {
        id: uid(), mumId: mum4Id,
        date: '2025-12-10', time: '11:00',
        notes: '24-week check. GTT result normal – gestational diabetes ruled out. Baby\'s movements felt regularly. Blood pressure within normal range. Discussing birth preferences.',
        recommendations: 'Continue gentle exercise – walking and swimming recommended. Stay hydrated. Track foetal movements daily.',
        nextSteps: 'Begin antenatal classes. Prepare birth plan draft for next appointment.',
        consultantId,
        createdAt: '2025-12-10T11:50:00.000Z',
      },
      {
        id: uid(), mumId: mum4Id,
        date: '2026-01-20', time: '11:00',
        notes: '28-week check. Baby in cephalic (head-down) position. Symphysis-fundal height measuring appropriately. Sophie reports pelvic girdle discomfort beginning.',
        recommendations: 'Refer to physiotherapy for pelvic girdle pain. Supportive belt may help. Sleep with pillow between knees.',
        nextSteps: 'Arrange 32-week growth scan. Complete birth plan. Discuss pain management options for labour.',
        consultantId,
        createdAt: '2026-01-20T11:55:00.000Z',
      },
      // ── Aoife Brennan – hypnotherapy consultations ──────
      {
        id: uid(), mumId: mum5Id,
        date: '2026-01-12', time: '15:00',
        notes: 'Introduction to hypnobirthing. Aoife presents with significant birth anxiety, primarily fear of loss of control. Goals and expectations discussed.',
        recommendations: 'Begin daily listening to hypnobirthing relaxation audio. Practice diaphragmatic breathing for 10 minutes each morning.',
        nextSteps: 'Introduce birth partner to techniques at next session. Obtain hypnobirthing workbook.',
        consultantId,
        createdAt: '2026-01-12T15:50:00.000Z',
      },
      {
        id: uid(), mumId: mum5Id,
        date: '2026-02-09', time: '15:00',
        notes: 'Breathing techniques and progressive relaxation practised with birth partner present. Aoife reporting reduced anxiety around birth. Surge breathing introduced.',
        recommendations: 'Practice surge breathing daily. Continue audio tracks at bedtime. Journalling positive birth affirmations encouraged.',
        nextSteps: 'Prepare personalised birth affirmation cards. Introduce visualisation of calm birth environment.',
        consultantId,
        createdAt: '2026-02-09T15:55:00.000Z',
      },
      {
        id: uid(), mumId: mum5Id,
        date: '2026-03-02', time: '15:00',
        notes: 'Birth preparation and positive affirmations session. Aoife confident and calm. Fear transformed into positive anticipation. Birth partner fully engaged in supporting role.',
        recommendations: 'Listen to birth preparation audio daily. Review birth preferences document with midwife.',
        nextSteps: 'Final hypnobirthing session at 38 weeks. Provide birth partner cue cards for labour support.',
        consultantId,
        createdAt: '2026-03-02T15:55:00.000Z',
      },
      // ── March & April weekly scheduled consultations ────
      ...makeWeekly(
        mum1Id, 1, marchApril, '10:00',
        'Weekly postnatal check-in. C-section recovery and breastfeeding progress reviewed.',
        'Continue iron supplements. Rest when possible.',
        'Schedule next weekly check.',
      ),
      ...makeWeekly(
        mum2Id, 2, marchApril, '14:00',
        'Weekly postnatal wellbeing session. Anxiety management strategies and sleep discussed.',
        'Continue breathing exercises and journalling.',
        'Check in with partner support.',
      ),
      ...makeWeekly(
        mum3Id, 3, marchApril, '10:30',
        'Weekly lactation support session. Breastfeeding progress and latch technique reviewed.',
        'Maintain feeding schedule. Stay well hydrated.',
        'Monitor baby\'s weight gain.',
      ),
      ...makeWeekly(
        mum4Id, 4, marchApril, '11:00',
        'Weekly antenatal check-in. Pregnancy progress and foetal movement monitored.',
        'Attend antenatal classes. Keep active with gentle exercise.',
        'Blood pressure check at next visit.',
      ),
      ...makeWeekly(
        mum5Id, 5, marchApril, '15:00',
        'Weekly hypnobirthing session. Relaxation techniques and positive birth visualisation practised.',
        'Daily breathing exercises. Listen to hypnobirthing audio tracks.',
        'Practise birth partner support cues.',
      ),
    ]);
  }

  /* ── users ───────────────────────────────────────── */
  const Users = {
    all: () => read(KEYS.USERS) || [],
    findByUsername: username => Users.all().find(u => u.username === username),
    findById: id => Users.all().find(u => u.id === id),
    findByMumId: mumId => Users.all().find(u => u.mumId === mumId),
    add(data) {
      const users = Users.all();
      if (data.username && users.some(u => u.username === data.username)) return null;
      const user  = { id: uid(), createdAt: now(), ...data };
      users.push(user);
      write(KEYS.USERS, users);
      return user;
    },
  };

  /* ── mums ────────────────────────────────────────── */
  const Mums = {
    all: () => read(KEYS.MUMS) || [],
    findById: id => Mums.all().find(m => m.id === id),
    add(data) {
      const mums = Mums.all();
      const mum  = { id: uid(), createdAt: now(), ...data };
      mums.push(mum);
      write(KEYS.MUMS, mums);
      return mum;
    },
    update(id, data) {
      const mums    = Mums.all();
      const idx     = mums.findIndex(m => m.id === id);
      if (idx === -1) return null;
      mums[idx]     = { ...mums[idx], ...data, updatedAt: now() };
      write(KEYS.MUMS, mums);
      return mums[idx];
    },
  };

  /* ── consultations ───────────────────────────────── */
  const Consultations = {
    all: () => read(KEYS.CONSULTATIONS) || [],
    forMum: mumId => Consultations.all()
      .filter(c => c.mumId === mumId)
      .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)),
    add(data) {
      const list = Consultations.all();
      const item = { id: uid(), createdAt: now(), ...data };
      list.push(item);
      write(KEYS.CONSULTATIONS, list);
      return item;
    },
    remove(id) {
      const list = Consultations.all().filter(c => c.id !== id);
      write(KEYS.CONSULTATIONS, list);
    },
  };

  /* ── auth session ────────────────────────────────── */
  // NOTE: Passwords are stored in plain text for this demo application.
  // A production application must use proper password hashing (e.g. bcrypt
  // via a server-side API) and never store credentials in localStorage.
  const Session = {
    get:    () => read(KEYS.CURRENT_USER),
    set:    user => write(KEYS.CURRENT_USER, user),
    clear:  () => localStorage.removeItem(KEYS.CURRENT_USER),
    login(username, password) {
      const user = Users.findByUsername(username);
      if (!user || user.password !== password) return null;
      Session.set(user);
      return user;
    },
  };

  seed();

  return { Users, Mums, Consultations, Session };
})();
