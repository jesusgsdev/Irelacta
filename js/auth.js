/**
 * auth.js – login / logout / navbar for Irelacta
 */

const Auth = (() => {
  /* ── Login page ──────────────────────────────────── */
  function init() {
    const form       = document.getElementById('login-form');
    const errorEl    = document.getElementById('login-error');
    const roleTabs   = document.querySelectorAll('.role-tab');
    const usernameEl = document.getElementById('login-username');
    const passwordEl = document.getElementById('login-password');
    const hintEl     = document.getElementById('login-hint');

    function activateRoleTab(targetTab) {
      // Update visual state, ARIA state, and tab order for all tabs
      roleTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
        t.setAttribute('tabindex', '-1');
      });

      if (!targetTab) return;

      targetTab.classList.add('active');
      targetTab.setAttribute('aria-selected', 'true');
      targetTab.setAttribute('tabindex', '0');

      const role = targetTab.dataset.role;
      if (hintEl) {
        if (role === 'consultant') {
          hintEl.textContent = 'Demo: consultant / demo1234';
        } else {
          hintEl.textContent = 'Demo: emma / demo1234  or  lily / demo1234';
        }
      }
    }

    // Role tab switching fills demo credentials as a hint
    roleTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        activateRoleTab(tab);
        tab.focus();
      });
    });

    // Select default tab
    if (roleTabs[0]) activateRoleTab(roleTabs[0]);

    function setError(msg) {
      errorEl.textContent = msg;
      errorEl.classList.toggle('hidden', !msg);
    }

    form.addEventListener('submit', e => {
      e.preventDefault();
      setError('');
      const username = usernameEl.value.trim();
      const password = passwordEl.value;

      const user = DB.Session.login(username, password);
      if (!user) {
        setError('Incorrect username or password. Please try again.');
        return;
      }

      afterLogin(user);
    });
  }

  function afterLogin(user) {
    updateNavbar(user);
    if (user.role === 'consultant') {
      ConsultantDash.render();
      showPage('page-consultant');
    } else {
      MumDash.render(user.mumId);
      showPage('page-mum');
    }
  }

  /* ── Navbar ──────────────────────────────────────── */
  function updateNavbar(user) {
    const navUser  = document.getElementById('nav-user');
    const logoutBtn = document.getElementById('btn-logout');
    if (navUser) navUser.textContent = user ? `👋 ${user.name}` : '';
    if (logoutBtn) {
      logoutBtn.classList.toggle('hidden', !user);
      logoutBtn.onclick = logout;
    }
  }

  function logout() {
    DB.Session.clear();
    updateNavbar(null);
    showPage('page-login');
  }

  /* ── Auto-restore session ────────────────────────── */
  function restore() {
    const user = DB.Session.get();
    if (user) {
      afterLogin(user);
    } else {
      showPage('page-login');
    }
  }

  return { init, restore, updateNavbar, logout };
})();
