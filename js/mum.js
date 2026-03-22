/**
 * mum.js – mum (patient) dashboard logic for Irelacta
 *
 * Read-only view of:
 *   - Mum's own profile
 *   - Consultation history
 */

const MumDash = (() => {
  function render(mumId) {
    const mum = DB.Mums.findById(mumId);
    if (!mum) {
      document.getElementById('mum-dash-content').innerHTML = `
        <div class="alert alert-info">
          Your profile has not been set up yet. Please ask your consultant to create your profile.
        </div>`;
      return;
    }
    _renderProfile(mum);
    _renderHistory(mumId);
  }

  function _renderProfile(mum) {
    const el = document.getElementById('mum-dash-profile');
    el.innerHTML = `
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
            ? `<div class="profile-info__detail">🎂 ${fmtDate(mum.dob)}</div>`
            : ''}
          ${mum.babyName
            ? `<div class="profile-info__detail">
                 🍼 Baby <strong>${esc(mum.babyName)}</strong>
                 ${mum.babyDob ? ` – born ${fmtDate(mum.babyDob)}` : ''}
               </div>`
            : ''}
        </div>
      </div>`;
  }

  function _renderHistory(mumId) {
    const listEl = document.getElementById('mum-consultation-list');
    const cons   = DB.Consultations.forMum(mumId);

    document.getElementById('mum-cons-count').textContent =
      `${cons.length} consultation${cons.length !== 1 ? 's' : ''}`;

    if (!cons.length) {
      listEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">📋</div>
          <div class="empty-state__title">No consultations yet</div>
          <div class="empty-state__text">Your consultation history will appear here after your first visit.</div>
        </div>`;
      return;
    }

    listEl.innerHTML = cons.map(c => `
      <div class="consultation-card">
        <div class="consultation-card__header">
          <div class="consultation-card__date">
            📅 ${esc(fmtDate(c.date))} &nbsp; 🕐 ${esc(c.time)}
          </div>
          <span class="badge badge-primary">Consultation</span>
        </div>
        ${c.notes ? `
          <div class="consultation-card__section">
            <div class="consultation-card__section-title">Notes from your consultant</div>
            <div class="consultation-card__body">${esc(c.notes)}</div>
          </div>` : ''}
        ${c.recommendations ? `
          <div class="consultation-card__section">
            <div class="consultation-card__section-title">Recommendations</div>
            <div class="consultation-card__body">${esc(c.recommendations)}</div>
          </div>` : ''}
        ${c.nextSteps ? `
          <div class="consultation-card__section">
            <div class="consultation-card__section-title">Your next steps</div>
            <div class="consultation-card__body">${esc(c.nextSteps)}</div>
          </div>` : ''}
      </div>`).join('');
  }

  return { render };
})();
