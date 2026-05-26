// TradingPal — Firebase auth, Firestore, and Storage shared module
(function () {

  const CFG = {
    apiKey:            "AIzaSyDI-D5ruFEFMFwJo5kFwKxjueXjM4dILvM",
    authDomain:        "tradingpal-b34c3.firebaseapp.com",
    projectId:         "tradingpal-b34c3",
    storageBucket:     "tradingpal-b34c3.firebasestorage.app",
    messagingSenderId: "379808896124",
    appId:             "1:379808896124:web:46eb97a708525588eba5f9"
  };

  if (!firebase.apps.length) firebase.initializeApp(CFG);
  const auth = firebase.auth();
  const db   = firebase.firestore();
  const stor = firebase.storage();
  window.fbAuth = auth;
  window.fbDb   = db;

  // ── Modal injection on DOM ready ────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    const overlay = document.getElementById('tp-auth-overlay');
    if (!overlay) return;

    overlay.innerHTML = `
      <div id="tp-modal-card">
        <div class="tp-logo">
          <svg viewBox="0 0 36 36" fill="none" width="38" height="38">
            <circle cx="18" cy="18" r="17" stroke="#06d6f3" stroke-width="1.5" opacity=".4"/>
            <path d="M8 24 L14 14 L20 19 L26 10" stroke="#06d6f3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="26" cy="10" r="3" fill="#7c3aed"/>
            <path d="M18 4 L19 2 L20 4" fill="#fbbf24" opacity=".8"/>
          </svg>
          <span>TradingPal</span>
        </div>
        <div class="tp-sub">Your cosmic trading journal</div>

        <div class="tp-tabs">
          <button class="tp-tab tp-tab-on" id="tp-tab-si"  onclick="TPAuth.switchTab('si')">Sign In</button>
          <button class="tp-tab"            id="tp-tab-reg" onclick="TPAuth.switchTab('reg')">Create Account</button>
        </div>

        <div id="tp-form-si">
          <div class="tp-field"><label>Email</label>
            <input type="email" id="tp-si-email" placeholder="you@example.com"
                   onkeydown="if(event.key==='Enter')TPAuth.signIn()" /></div>
          <div class="tp-field"><label>Password</label>
            <input type="password" id="tp-si-pass" placeholder="Your password"
                   onkeydown="if(event.key==='Enter')TPAuth.signIn()" /></div>
          <div class="tp-err" id="tp-si-err"></div>
          <button class="tp-submit" id="tp-si-btn" onclick="TPAuth.signIn()">Sign In</button>
        </div>

        <div id="tp-form-reg" style="display:none">
          <div class="tp-field"><label>Username</label>
            <input type="text" id="tp-reg-name" placeholder="Display name" maxlength="30"
                   onkeydown="if(event.key==='Enter')TPAuth.register()" /></div>
          <div class="tp-field"><label>Email</label>
            <input type="email" id="tp-reg-email" placeholder="you@example.com"
                   onkeydown="if(event.key==='Enter')TPAuth.register()" /></div>
          <div class="tp-field"><label>Password</label>
            <input type="password" id="tp-reg-pass" placeholder="Min 6 characters"
                   onkeydown="if(event.key==='Enter')TPAuth.register()" /></div>
          <div class="tp-err" id="tp-reg-err"></div>
          <button class="tp-submit" id="tp-reg-btn" onclick="TPAuth.register()">Create Account</button>
        </div>
      </div>`;

    // Styles
    const s = document.createElement('style');
    s.textContent = `
      #tp-auth-overlay {
        position:fixed;inset:0;z-index:2000;
        background:rgba(6,6,26,.97);backdrop-filter:blur(14px);
        align-items:center;justify-content:center;flex-direction:column;
      }
      #tp-modal-card {
        background:rgba(15,15,40,.97);border:1px solid rgba(120,80,255,.35);
        border-radius:22px;padding:40px 44px;width:min(430px,92vw);
        box-shadow:0 0 60px rgba(124,58,237,.25),0 0 120px rgba(6,214,243,.08);
      }
      .tp-logo {
        display:flex;align-items:center;gap:12px;
        font-size:1.45rem;font-weight:800;color:#06d6f3;
        text-shadow:0 0 20px rgba(6,214,243,.5);margin-bottom:6px;
      }
      .tp-sub { font-size:.78rem;color:#7b85a3;margin-bottom:28px; }
      .tp-tabs {
        display:flex;gap:0;margin-bottom:24px;
        background:rgba(255,255,255,.04);border-radius:10px;padding:4px;
        border:1px solid rgba(120,80,255,.2);
      }
      .tp-tab {
        flex:1;padding:9px;border-radius:7px;border:none;cursor:pointer;
        font-size:.82rem;font-weight:600;font-family:inherit;
        background:transparent;color:#7b85a3;transition:all .2s;
      }
      .tp-tab-on { background:rgba(124,58,237,.25);color:#06d6f3; }
      .tp-field { margin-bottom:16px; }
      .tp-field label {
        display:block;font-size:.7rem;font-weight:700;letter-spacing:.1em;
        text-transform:uppercase;color:#7b85a3;margin-bottom:7px;
      }
      .tp-field input {
        width:100%;padding:11px 14px;border-radius:10px;
        background:rgba(255,255,255,.05);border:1px solid rgba(120,80,255,.25);
        color:#e2e8f0;font-size:.9rem;font-family:inherit;outline:none;
        transition:border-color .2s,box-shadow .2s;box-sizing:border-box;
      }
      .tp-field input:focus { border-color:#06d6f3;box-shadow:0 0 0 3px rgba(6,214,243,.12); }
      .tp-err { font-size:.78rem;color:#ff4d6d;min-height:18px;margin-bottom:12px;text-align:center; }
      .tp-submit {
        width:100%;padding:13px;border-radius:11px;border:none;cursor:pointer;
        font-size:.9rem;font-weight:700;font-family:inherit;letter-spacing:.03em;
        background:linear-gradient(135deg,#7c3aed,#5b21b6);color:#fff;
        box-shadow:0 0 20px rgba(124,58,237,.4);transition:opacity .2s,box-shadow .2s;
      }
      .tp-submit:hover { opacity:.9;box-shadow:0 0 30px rgba(124,58,237,.6); }
      .tp-submit:disabled { opacity:.5;cursor:not-allowed; }
      #tp-user-nav { display:flex;align-items:center;gap:10px;margin-left:8px; }
      #tp-user-name {
        font-size:.78rem;font-weight:600;color:#7b85a3;
        max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
      }
      #tp-logout-btn {
        padding:6px 14px;border-radius:999px;font-size:.75rem;font-weight:600;
        border:1px solid rgba(255,77,109,.3);background:transparent;
        color:#ff4d6d;cursor:pointer;font-family:inherit;transition:all .2s;
      }
      #tp-logout-btn:hover { background:rgba(255,77,109,.1);border-color:#ff4d6d; }
      #tp-mig-banner {
        position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
        background:rgba(15,15,40,.97);border:1px solid rgba(6,214,243,.3);
        border-radius:14px;padding:16px 22px;z-index:500;
        display:flex;align-items:center;gap:14px;flex-wrap:wrap;
        box-shadow:0 0 30px rgba(6,214,243,.15);max-width:540px;width:92vw;
        font-size:.82rem;
      }
      #tp-mig-banner .mig-text { color:#e2e8f0;flex:1;min-width:160px;line-height:1.4; }
      #tp-mig-banner .mig-text strong { color:#06d6f3; }
      .mig-btn {
        padding:8px 16px;border-radius:8px;font-size:.78rem;font-weight:700;
        cursor:pointer;border:none;font-family:inherit;transition:opacity .2s;
        white-space:nowrap;
      }
      .mig-btn.pri { background:linear-gradient(135deg,#7c3aed,#5b21b6);color:#fff; }
      .mig-btn.sec { background:rgba(255,255,255,.06);color:#7b85a3;border:1px solid rgba(120,80,255,.2); }
      .mig-btn:hover { opacity:.85; }
    `;
    document.head.appendChild(s);
  });

  // ── Auth state ──────────────────────────────────────────────────────────
  auth.onAuthStateChanged(async function (user) {
    const overlay = document.getElementById('tp-auth-overlay');
    if (user) {
      if (overlay) overlay.style.display = 'none';
      _injectUserNav(user);
      if (typeof window.onTPReady === 'function') await window.onTPReady(user);
    } else {
      if (overlay) overlay.style.display = 'flex';
    }
  });

  // ── User nav injection ──────────────────────────────────────────────────
  function _injectUserNav(user) {
    if (document.getElementById('tp-user-nav')) return;
    const nav = document.querySelector('nav.nav-pills');
    if (!nav) return;
    const div = document.createElement('div');
    div.id = 'tp-user-nav';
    div.innerHTML =
      `<span id="tp-user-name">👤 ${user.displayName || user.email.split('@')[0]}</span>` +
      `<button id="tp-logout-btn" onclick="TPAuth.signOut()">Sign Out</button>`;
    nav.parentNode.insertBefore(div, nav.nextSibling);
  }

  // ── Firestore / Storage helpers ─────────────────────────────────────────
  window.TPDb = {
    async loadTrades(uid) {
      const snap = await db.collection('users').doc(uid).collection('trades')
        .orderBy('createdAt', 'desc').get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    async saveTrade(uid, tradeData) {
      const { screenshot, ...fields } = tradeData;
      fields.createdAt    = firebase.firestore.FieldValue.serverTimestamp();
      fields.hasScreenshot = false;
      const ref = await db.collection('users').doc(uid).collection('trades').add(fields);
      if (screenshot) {
        try {
          const url = await TPDb.uploadScreenshot(uid, ref.id, screenshot);
          await ref.update({ screenshotUrl: url, hasScreenshot: true });
          return { id: ref.id, ...fields, screenshotUrl: url, hasScreenshot: true };
        } catch (e) { console.warn('Screenshot upload failed:', e); }
      }
      return { id: ref.id, ...fields };
    },

    async deleteTrade(uid, docId) {
      await db.collection('users').doc(uid).collection('trades').doc(docId).delete();
      try { await stor.ref(`screenshots/${uid}/${docId}`).delete(); } catch (_) {}
    },

    async uploadScreenshot(uid, docId, base64data) {
      const blob = _b64ToBlob(base64data);
      const ref  = stor.ref(`screenshots/${uid}/${docId}`);
      await ref.put(blob);
      return ref.getDownloadURL();
    },

    async migrateTrades(uid, localTrades, onProgress) {
      let done = 0;
      for (const t of localTrades) {
        await TPDb.saveTrade(uid, t);
        done++;
        if (onProgress) onProgress(done, localTrades.length);
      }
      localStorage.removeItem('tp_trades');
    }
  };

  // ── Auth actions ────────────────────────────────────────────────────────
  window.TPAuth = {
    switchTab(tab) {
      const reg = tab === 'reg';
      document.getElementById('tp-form-si').style.display  = reg ? 'none'  : 'block';
      document.getElementById('tp-form-reg').style.display = reg ? 'block' : 'none';
      document.getElementById('tp-tab-si').classList.toggle('tp-tab-on', !reg);
      document.getElementById('tp-tab-reg').classList.toggle('tp-tab-on', reg);
    },

    async signIn() {
      const email = document.getElementById('tp-si-email').value.trim();
      const pass  = document.getElementById('tp-si-pass').value;
      const err   = document.getElementById('tp-si-err');
      const btn   = document.getElementById('tp-si-btn');
      err.textContent = '';
      if (!email || !pass) { err.textContent = 'Please fill in all fields.'; return; }
      btn.disabled = true; btn.textContent = 'Signing in…';
      try {
        await auth.signInWithEmailAndPassword(email, pass);
      } catch (e) {
        err.textContent = _authErr(e.code);
        btn.disabled = false; btn.textContent = 'Sign In';
      }
    },

    async register() {
      const name  = document.getElementById('tp-reg-name').value.trim();
      const email = document.getElementById('tp-reg-email').value.trim();
      const pass  = document.getElementById('tp-reg-pass').value;
      const err   = document.getElementById('tp-reg-err');
      const btn   = document.getElementById('tp-reg-btn');
      err.textContent = '';
      if (!name || !email || !pass) { err.textContent = 'Please fill in all fields.'; return; }
      if (pass.length < 6) { err.textContent = 'Password must be at least 6 characters.'; return; }
      btn.disabled = true; btn.textContent = 'Creating account…';
      try {
        const cred = await auth.createUserWithEmailAndPassword(email, pass);
        await cred.user.updateProfile({ displayName: name });
      } catch (e) {
        err.textContent = _authErr(e.code);
        btn.disabled = false; btn.textContent = 'Create Account';
      }
    },

    async signOut() {
      if (!confirm('Sign out of TradingPal?')) return;
      await auth.signOut();
      location.reload();
    },

    getCurrentUser() { return auth.currentUser; }
  };

  // ── Migration banner ────────────────────────────────────────────────────
  window.TPMigrate = {
    offer(uid, localTrades) {
      if (!localTrades.length || document.getElementById('tp-mig-banner')) return;
      const banner = document.createElement('div');
      banner.id = 'tp-mig-banner';
      banner.innerHTML =
        `<div class="mig-text"><strong>${localTrades.length} trade${localTrades.length > 1 ? 's' : ''}</strong>` +
        ` found in this browser. Sync them to your account to access them anywhere.</div>` +
        `<button class="mig-btn pri" id="tp-mig-yes">Sync Now</button>` +
        `<button class="mig-btn sec" onclick="document.getElementById('tp-mig-banner').remove()">Dismiss</button>`;
      document.body.appendChild(banner);

      document.getElementById('tp-mig-yes').onclick = async function () {
        this.disabled = true; this.textContent = 'Syncing…';
        const textEl = banner.querySelector('.mig-text');
        await TPDb.migrateTrades(uid, localTrades, (done, total) => {
          textEl.innerHTML = `Syncing… <strong>${done} / ${total}</strong>`;
        });
        banner.remove();
        const toast = document.createElement('div');
        toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);' +
          'background:rgba(0,245,160,.15);border:1px solid rgba(0,245,160,.3);color:#00f5a0;' +
          'padding:12px 24px;border-radius:10px;z-index:500;font-size:.82rem;font-weight:700;white-space:nowrap';
        toast.textContent = '✓ Trades synced to your account!';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3500);
        if (typeof window.onTPReady === 'function') window.onTPReady(auth.currentUser);
      };
    }
  };

  // ── Helpers ─────────────────────────────────────────────────────────────
  function _b64ToBlob(dataUrl) {
    const [meta, data] = dataUrl.split(';base64,');
    const type = meta.split(':')[1];
    const raw  = atob(data);
    const arr  = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
    return new Blob([arr], { type });
  }

  function _authErr(code) {
    const map = {
      'auth/user-not-found':       'No account found with this email.',
      'auth/wrong-password':       'Incorrect password.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/invalid-email':        'Please enter a valid email address.',
      'auth/weak-password':        'Password must be at least 6 characters.',
      'auth/too-many-requests':    'Too many attempts. Try again later.',
      'auth/invalid-credential':   'Invalid email or password.'
    };
    return map[code] || 'Something went wrong. Please try again.';
  }

})();
