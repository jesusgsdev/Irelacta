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
    const mum1UserId   = uid();
    const mum2UserId   = uid();
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
    ]);

    write(KEYS.CONSULTATIONS, [
      {
        id: cons1Id, mumId: mum1Id,
        date: '2026-01-15', time: '10:00',
        notes: 'Emma is recovering well from the C-section. Wound healing normally. Baby is feeding every 2–3 hours.',
        recommendations: 'Continue paracetamol as needed for pain. Gentle walks recommended. Avoid lifting heavy objects.',
        nextSteps: 'Review wound at next visit. Refer to physiotherapy for pelvic floor exercises.',
        consultantId: consultantId,
        createdAt: '2026-01-15T10:45:00.000Z',
      },
      {
        id: cons2Id, mumId: mum1Id,
        date: '2026-02-05', time: '11:30',
        notes: 'Six-week check. Emma is doing well emotionally and physically. Slight tiredness reported.',
        recommendations: 'Iron supplements due to borderline low levels in blood test. Encourage rest when baby sleeps.',
        nextSteps: 'Repeat blood test in 4 weeks. Provide information on local new-mum support group.',
        consultantId: consultantId,
        createdAt: '2026-02-05T12:15:00.000Z',
      },
      {
        id: cons3Id, mumId: mum2Id,
        date: '2026-02-10', time: '14:00',
        notes: 'Lily reports difficulty sleeping and persistent worry. Edinburgh Postnatal Depression Scale score: 10.',
        recommendations: 'Normalise anxiety. Breathing exercises introduced. Encouraged journalling. Partner support discussed.',
        nextSteps: 'Refer to perinatal mental health team if symptoms worsen. Follow up in 2 weeks.',
        consultantId: consultantId,
        createdAt: '2026-02-10T14:50:00.000Z',
      },
    ]);
  }

  /* ── users ───────────────────────────────────────── */
  const Users = {
    all: () => read(KEYS.USERS) || [],
    findByUsername: username => Users.all().find(u => u.username === username),
    findById: id => Users.all().find(u => u.id === id),
    add(data) {
      const users = Users.all();
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
