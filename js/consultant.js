/**
 * consultant.js – consultant dashboard logic for Irelacta
 *
 * Views:
 *   - Dashboard overview (mum list + stats)
 *   - Mum profile detail (profile info + consultation history + add consultation)
 *   - Add new mum modal
 *   - Add consultation modal
 */

const ConsultantDash = (() => {
  let _selectedMumId = null;

  /* ═══ DASHBOARD ════════════════════════════════════ */
  function render() {
    _renderStats();
    _renderMumList();
    _showView('view-dashboard');
  }

  function _renderStats() {
    const mums  = DB.Mums.all();
    const cons  = DB.Consultations.all();
    document.getElementById('stat-mums').textContent          = mums.length;
    document.getElementById('stat-consultations').textContent = cons.length;

    // most recent consultation date
    const sorted = cons.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const recent = sorted[0];
    document.getElementById('stat-recent').textContent = recent
      ? fmtDate(recent.date) : '—';
  }

  function _renderMumList(filter = '') {
    const listEl = document.getElementById('mum-list');
    let mums     = DB.Mums.all();

    if (filter) {
      const q = filter.toLowerCase();
      mums = mums.filter(m =>
        m.name.toLowerCase().includes(q) ||
        (m.email || '').toLowerCase().includes(q) ||
        (m.babyName || '').toLowerCase().includes(q),
      );
    }

    if (!mums.length) {
      listEl.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-state__icon">👶</div>
          <div class="empty-state__title">No mum profiles found</div>
          <div class="empty-state__text">Add a new profile to get started.</div>
        </div>`;
      return;
    }

    // Build a per-mum consultation count in a single pass to avoid N+1 reads
    const allCons = DB.Consultations.all();
    const consCountMap = {};
    allCons.forEach(c => { consCountMap[c.mumId] = (consCountMap[c.mumId] || 0) + 1; });

    listEl.innerHTML = mums.map(m => {
      const consCount = consCountMap[m.id] || 0;
      return `
        <div class="mum-card" data-id="${esc(m.id)}" tabindex="0" role="button" aria-label="Open profile for ${esc(m.name)}">
          <div class="mum-card__avatar">${initials(m.name)}</div>
          <div class="mum-card__info">
            <div class="mum-card__name">${esc(m.name)}</div>
            <div class="mum-card__meta">
              ${m.babyName ? `🍼 ${esc(m.babyName)} &nbsp;` : ''}
              ${m.babyDob  ? `Born ${fmtDate(m.babyDob)}` : ''}
            </div>
            <div class="mum-card__meta" style="margin-top:0.4rem">
              <span class="badge badge-primary">${consCount} consultation${consCount !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>`;
    }).join('');

    listEl.querySelectorAll('.mum-card').forEach(card => {
      card.addEventListener('click',  () => openMumProfile(card.dataset.id));
      card.addEventListener('keydown', e => {
        const isEnter = e.key === 'Enter' || e.keyCode === 13;
        const isSpace = e.key === ' ' || e.key === 'Spacebar' || e.keyCode === 32;
        if (isEnter || isSpace) {
          if (isSpace) {
            e.preventDefault();
          }
          openMumProfile(card.dataset.id);
        }
      });
    });
  }

  /* ═══ MUM PROFILE VIEW ══════════════════════════════ */
  function openMumProfile(mumId) {
    _selectedMumId = mumId;
    _renderProfile(mumId);
    _renderConsultationHistory(mumId);
    _showView('view-mum-profile');
  }

  function _renderProfile(mumId) {
    const mum   = DB.Mums.findById(mumId);
    const pane  = document.getElementById('mum-profile-pane');
    if (!mum) return;

    const mumUser = DB.Users.findByMumId(mumId);

    pane.innerHTML = `
      <div class="profile-section">
        <div class="profile-avatar">${initials(mum.name)}</div>
        <div>
          <div class="profile-info__name">${esc(mum.name)}</div>
          ${mum.email
            ? `<div class="profile-info__detail">📧 ${esc(mum.email)}</div>`
            : ''}
          ${mum.phone
            ? `<div class="profile-info__detail">📞 ${esc(mum.phone)}</div>`
            : ''}
          ${mum.dob
            ? `<div class="profile-info__detail">🎂 ${fmtDate(mum.dob)} (${calcAge(mum.dob)} yrs)</div>`
            : ''}
          ${mum.babyName
            ? `<div class="profile-info__detail">🍼 Baby ${esc(mum.babyName)}
                 ${mum.babyDob ? ` – born ${fmtDate(mum.babyDob)}` : ''}
               </div>`
            : ''}
          ${mumUser
            ? `<div class="profile-info__detail">🔑 Login: <strong>${esc(mumUser.username)}</strong></div>`
            : ''}
          <div style="margin-top:0.6rem">
            <button class="btn btn-outline btn-sm" id="btn-edit-profile">✏️ Edit profile</button>
          </div>
        </div>
      </div>
      ${mum.notes ? `
        <hr class="divider">
        <div>
          <div class="text-sm text-lt" style="font-weight:700;text-transform:uppercase;letter-spacing:.04em">Clinical notes</div>
          <p style="margin-top:.35rem;font-size:.92rem">${esc(mum.notes)}</p>
        </div>` : ''}`;

    document.getElementById('btn-edit-profile').addEventListener('click', () => openEditMumModal(mumId));
  }

  function _renderConsultationHistory(mumId) {
    const listEl = document.getElementById('consultation-list');
    const cons   = DB.Consultations.forMum(mumId);

    document.getElementById('consultation-count').textContent =
      `${cons.length} consultation${cons.length !== 1 ? 's' : ''}`;

    if (!cons.length) {
      listEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">📋</div>
          <div class="empty-state__title">No consultations yet</div>
          <div class="empty-state__text">Add the first consultation record above.</div>
        </div>`;
      return;
    }

    listEl.innerHTML = cons.map(c => `
      <div class="consultation-card">
        <div class="consultation-card__header">
          <div class="consultation-card__date">
            📅 ${esc(fmtDate(c.date))} &nbsp; 🕐 ${esc(c.time)}
          </div>
          <button class="btn btn-ghost btn-sm" data-delete="${esc(c.id)}" title="Delete consultation">🗑</button>
        </div>
        ${c.notes ? `
          <div class="consultation-card__section">
            <div class="consultation-card__section-title">Notes</div>
            <div class="consultation-card__body">${esc(c.notes)}</div>
          </div>` : ''}
        ${c.recommendations ? `
          <div class="consultation-card__section">
            <div class="consultation-card__section-title">Recommendations</div>
            <div class="consultation-card__body">${esc(c.recommendations)}</div>
          </div>` : ''}
        ${c.nextSteps ? `
          <div class="consultation-card__section">
            <div class="consultation-card__section-title">Next steps / Actions</div>
            <div class="consultation-card__body">${esc(c.nextSteps)}</div>
          </div>` : ''}
      </div>`).join('');

    listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Delete this consultation record?')) {
          DB.Consultations.remove(btn.dataset.delete);
          _renderConsultationHistory(mumId);
          _renderStats();
          showToast('Consultation deleted', 'error');
        }
      });
    });
  }

  /* ═══ MODALS ════════════════════════════════════════ */

  /* ── Add mum modal ─────────────────────────────────── */
  function openAddMumModal() {
    clearForm(document.getElementById('form-add-mum'));
    document.getElementById('add-mum-error').textContent = '';
    openModal('modal-add-mum');
  }

  function _setupAddMumModal() {
    const form    = document.getElementById('form-add-mum');
    const errorEl = document.getElementById('add-mum-error');

    form.addEventListener('submit', e => {
      e.preventDefault();
      errorEl.textContent = '';
      errorEl.classList.add('hidden');
      const name = form['mum-name'].value.trim();
      if (!name) {
        errorEl.textContent = 'Name is required.';
        errorEl.classList.remove('hidden');
        return;
      }

      const mum = DB.Mums.add({
        name,
        email:    form['mum-email'].value.trim(),
        phone:    form['mum-phone'].value.trim(),
        dob:      form['mum-dob'].value,
        babyName: form['mum-baby-name'].value.trim(),
        babyDob:  form['mum-baby-dob'].value,
        notes:    form['mum-notes'].value.trim(),
      });

      // Create a mum login account with a unique username and random password
      let baseName = name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '').slice(0, 12);
      if (!baseName) {
        baseName = 'mum';
      }

      let username;
      let attempts    = 0;
      const maxAttempts = 1000;
      do {
        // Incorporate mum.id when available to greatly reduce collision risk
        const randomSuffix = Math.floor(Math.random() * 9000 + 1000); // 4-digit random
        const uniquePart   = (mum && mum.id != null)
          ? String(mum.id) + String(randomSuffix)
          : String(randomSuffix);
        username = baseName + uniquePart;
        attempts++;
        if (attempts >= maxAttempts) {
          console.error('Failed to generate unique username for mum', mum);
          errorEl.textContent = 'Profile created, but failed to create a unique login. Please try again or contact support.';
          errorEl.classList.remove('hidden');
          return;
        }
      } while (DB.Users.findByUsername(username));
      const chars    = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#';
      const password = Array.from(
        { length: 10 },
        () => chars[Math.floor(Math.random() * chars.length)],
      ).join('');
      DB.Users.add({ username, password, role: 'mum', name, mumId: mum.id });

      closeModal('modal-add-mum');
      _renderStats();
      _renderMumList(document.getElementById('mum-search').value);
      showToast(`Profile created for ${name}`, 'success');
      document.getElementById('new-login-info').textContent =
        `Login: ${username}  /  Password: ${password}`;
      openModal('modal-login-info');
    });
  }

  /* ── Edit mum modal ────────────────────────────────── */
  function openEditMumModal(mumId) {
    const mum  = DB.Mums.findById(mumId);
    if (!mum) return;
    const form = document.getElementById('form-edit-mum');
    form['edit-mum-name'].value      = mum.name     || '';
    form['edit-mum-email'].value     = mum.email    || '';
    form['edit-mum-phone'].value     = mum.phone    || '';
    form['edit-mum-dob'].value       = mum.dob      || '';
    form['edit-mum-baby-name'].value = mum.babyName || '';
    form['edit-mum-baby-dob'].value  = mum.babyDob  || '';
    form['edit-mum-notes'].value     = mum.notes    || '';
    form.dataset.mumId               = mumId;
    document.getElementById('edit-mum-error').textContent = '';
    openModal('modal-edit-mum');
  }

  function _setupEditMumModal() {
    const form    = document.getElementById('form-edit-mum');
    const errorEl = document.getElementById('edit-mum-error');

    form.addEventListener('submit', e => {
      e.preventDefault();
      errorEl.textContent = '';
      errorEl.classList.add('hidden');
      const name = form['edit-mum-name'].value.trim();
      if (!name) {
        errorEl.textContent = 'Name is required.';
        errorEl.classList.remove('hidden');
        return;
      }

      const mumId = form.dataset.mumId;
      DB.Mums.update(mumId, {
        name,
        email:    form['edit-mum-email'].value.trim(),
        phone:    form['edit-mum-phone'].value.trim(),
        dob:      form['edit-mum-dob'].value,
        babyName: form['edit-mum-baby-name'].value.trim(),
        babyDob:  form['edit-mum-baby-dob'].value,
        notes:    form['edit-mum-notes'].value.trim(),
      });

      closeModal('modal-edit-mum');
      _renderProfile(mumId);
      _renderMumList(document.getElementById('mum-search').value);
      showToast('Profile updated', 'success');
    });
  }

  /* ── Add consultation modal ────────────────────────── */
  function openAddConsultationModal() {
    const form = document.getElementById('form-add-consultation');
    clearForm(form);
    // default to today / now
    const d = new Date();
    form['cons-date'].value = d.toISOString().slice(0, 10);
    form['cons-time'].value = d.toTimeString().slice(0, 5);
    document.getElementById('add-cons-error').textContent = '';
    openModal('modal-add-consultation');
  }

  function _setupAddConsultationModal() {
    const form    = document.getElementById('form-add-consultation');
    const errorEl = document.getElementById('add-cons-error');

    form.addEventListener('submit', e => {
      e.preventDefault();
      errorEl.textContent = '';
      errorEl.classList.add('hidden');
      const date = form['cons-date'].value;
      const time = form['cons-time'].value;
      const notes = form['cons-notes'].value.trim();
      if (!date || !time) {
        errorEl.textContent = 'Date and time are required.';
        errorEl.classList.remove('hidden');
        return;
      }
      if (!notes) {
        errorEl.textContent = 'Consultation notes are required.';
        errorEl.classList.remove('hidden');
        return;
      }

      const user = DB.Session.get();
      DB.Consultations.add({
        mumId:           _selectedMumId,
        date,
        time,
        notes:           notes,
        recommendations: form['cons-recommendations'].value.trim(),
        nextSteps:       form['cons-next-steps'].value.trim(),
        consultantId:    user ? user.id : '',
      });

      closeModal('modal-add-consultation');
      _renderConsultationHistory(_selectedMumId);
      _renderStats();
      showToast('Consultation saved', 'success');
    });
  }

  /* ═══ VIEW SWITCHING ════════════════════════════════ */
  function _showView(id) {
    document.querySelectorAll('#page-consultant .view').forEach(v => v.classList.remove('active'));
    const view = document.getElementById(id);
    if (view) view.classList.add('active');
  }

  /* ═══ BOOTSTRAP ═════════════════════════════════════ */
  function bootstrap() {
    // Mum search
    document.getElementById('mum-search').addEventListener('input', e => {
      _renderMumList(e.target.value);
    });

    // Add mum button
    document.getElementById('btn-add-mum').addEventListener('click', openAddMumModal);

    // Back button
    document.getElementById('btn-back-to-dashboard').addEventListener('click', () => {
      _selectedMumId = null;
      render();
    });

    // Add consultation button
    document.getElementById('btn-add-consultation').addEventListener('click', openAddConsultationModal);

    // Modal close buttons
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => closeModal(btn.dataset.closeModal));
    });

    // Close overlay by clicking backdrop
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', e => {
        if (e.target === overlay) closeModal(overlay.id);
      });
    });

    _setupAddMumModal();
    _setupEditMumModal();
    _setupAddConsultationModal();
  }

  return { render, bootstrap };
})();
