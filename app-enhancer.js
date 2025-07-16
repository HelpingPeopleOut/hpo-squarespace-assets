/**
 * ===================================================================
 * HPO.CENTER APP ENHANCER V2.0
 * ===================================================================
 * This file consolidates all custom JavaScript functionality for the site.
 * New in this version: Agent Hub tab switching.
 * ===================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

  // --- 1. PWA SERVICE WORKER REGISTRATION ---
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/s/service-worker.js')
        .then(reg => console.log('HPO ServiceWorker Registered | Scope:', reg.scope))
        .catch(err => console.error('HPO ServiceWorker Failed:', err));
    });
  }

  // --- 2. INTERACTION MANAGER (MODAL & FLOATING BUTTONS) ---
  const scrollBtn = document.getElementById('scroll-to-top');
  const exitModal = document.getElementById('hpo-exit-modal');
  const closeModalBtn = exitModal ? exitModal.querySelector('.hpo-modal-close') : null;
  let exitIntentShown = sessionStorage.getItem('hpo_modal_shown') === 'true';

  if (scrollBtn) {
    const toggleVisibility = () => scrollBtn.classList.toggle('show', window.scrollY > 300);
    window.addEventListener('scroll', toggleVisibility, { passive: true });
    toggleVisibility();
    scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  const showExitModal = () => {
    if (exitIntentShown || !exitModal) return;
    exitModal.classList.add('show-modal');
    sessionStorage.setItem('hpo_modal_shown', 'true');
    exitIntentShown = true;
  };

  if (exitModal) {
    setTimeout(showExitModal, 45000);
    document.addEventListener('mouseleave', e => { if (e.clientY < 10) showExitModal(); });
    closeModalBtn.addEventListener('click', () => exitModal.classList.remove('show-modal'));
    exitModal.addEventListener('click', e => { if (e.target === exitModal) exitModal.classList.remove('show-modal'); });
  }
  
  // --- 3. AGENT HUB & PROCESS TAB SWITCHING ---
  window.switchContent = function(event, tabId) {
      event.preventDefault();
      document.querySelectorAll('.hpo-nav-link').forEach(link => link.classList.remove('active'));
      document.querySelectorAll('.hpo-content-panel').forEach(panel => panel.classList.remove('active'));
      document.querySelector(`.hpo-nav-link[href="#${tabId}"]`).classList.add('active');
      document.getElementById(tabId).classList.add('active');
  };
    
  window.switchAgentTab = function(event, tabId) {
      event.preventDefault();
      document.querySelectorAll('.hpo-agent-nav-link').forEach(link => link.classList.remove('active'));
      document.querySelectorAll('.hpo-agent-content-panel').forEach(panel => panel.classList.remove('active'));
      document.querySelector(`.hpo-agent-nav-link[href="#${tabId}"]`).classList.add('active');
      document.getElementById(tabId).classList.add('active');
  };

  // --- 4. REFERRAL MODAL LOGIC ---
  const referralModal = document.getElementById('hpo-referral-modal');
  const closeReferralModalBtn = referralModal ? referralModal.querySelector('.hpo-modal-close') : null;
  const openReferralButtons = document.querySelectorAll('#open-referral-modal-agent-hub, #open-referral-modal-how-it-works, #open-referral-modal-submit-tab');

  if (referralModal) {
      openReferralButtons.forEach(btn => {
          btn.addEventListener('click', () => referralModal.classList.add('show-modal'));
      });
      closeReferralModalBtn.addEventListener('click', () => referralModal.classList.remove('show-modal'));
      referralModal.addEventListener('click', e => { if (e.target === referralModal) referralModal.classList.remove('show-modal'); });
  }

  // --- 5. UTM & LEAD TRACKING ---
  try {
    const params = new URLSearchParams(window.location.search);
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'];
    const leadData = {};
    let hasUtm = false;
    utmKeys.forEach(key => {
      if (params.has(key)) {
        leadData[key] = params.get(key);
        hasUtm = true;
      }
    });
    if (hasUtm) localStorage.setItem('hpo_lead_source', JSON.stringify(leadData));
  } catch(e) { console.warn("HPO UTM tracking error:", e); }

});