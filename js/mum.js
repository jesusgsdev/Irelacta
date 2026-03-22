/**
 * mum.js – mum (patient) dashboard logic for Irelacta
 *
 * Read-only view of:
 *   - Mum's own profile
 *   - Consultation history
 */

const MumDash = (() => {
  let _historyPage = 1;
  const HISTORY_PER_PAGE = 3;

  function render(mumId) {
    const mum = DB.Mums.findById(mumId);
    if (!mum) {
      document.getElementById('mum-dash-content').innerHTML = `
        <div class="alert alert-info">
          Your profile has not been set up yet. Please ask your consultant to create your profile.
        </div>`;
      return;
    }
    _historyPage = 1;
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
    const pagerEl = document.getElementById('mum-cons-pagination');
    const cons   = DB.Consultations.forMum(mumId);
    const totalPages = Math.max(1, Math.ceil(cons.length / HISTORY_PER_PAGE));
    _historyPage = Math.min(Math.max(_historyPage, 1), totalPages);
    const start = (_historyPage - 1) * HISTORY_PER_PAGE;
    const pageCons = cons.slice(start, start + HISTORY_PER_PAGE);

    document.getElementById('mum-cons-count').textContent =
      `${cons.length} consultation${cons.length !== 1 ? 's' : ''}`;

    if (!cons.length) {
      listEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">📋</div>
          <div class="empty-state__title">No consultations yet</div>
          <div class="empty-state__text">Your consultation history will appear here after your first visit.</div>
        </div>`;
      pagerEl.innerHTML = '';
      return;
    }

    listEl.innerHTML = pageCons.map(c => `
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

      pagerEl.innerHTML = `
        <div class="pagination-bar__meta">
          Showing ${start + 1}-${Math.min(start + HISTORY_PER_PAGE, cons.length)} of ${cons.length}
        </div>
        <div class="pagination-bar__actions">
          <button class="btn btn-ghost btn-sm" id="btn-mum-cons-prev" ${_historyPage === 1 ? 'disabled' : ''}>‹ Previous</button>
          <span class="pagination-bar__meta">Page ${_historyPage} of ${totalPages}</span>
          <button class="btn btn-ghost btn-sm" id="btn-mum-cons-next" ${_historyPage === totalPages ? 'disabled' : ''}>Next ›</button>
        </div>`;

      const prevBtn = document.getElementById('btn-mum-cons-prev');
      const nextBtn = document.getElementById('btn-mum-cons-next');

      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          if (_historyPage > 1) {
            _historyPage--;
            _renderHistory(mumId);
          }
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          if (_historyPage < totalPages) {
            _historyPage++;
            _renderHistory(mumId);
          }
        });
      }
  }

  return { render };
})();
