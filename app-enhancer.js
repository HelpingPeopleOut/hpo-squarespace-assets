/**
 * ===================================================================
 * HPO.CENTER APP ENHANCER V2.1 (Resilient)
 * ===================================================================
 * This version adds "null checks" to prevent script errors on pages
 * where specific elements (like tab navigations) do not exist.
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
  if (scrollBtn) {
    const toggleVisibility = () => scrollBtn.classList.toggle('visible', window.scrollY > 300);
    window.addEventListener('scroll', toggleVisibility, { passive: true });
    toggleVisibility(); // Check on page load
    scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  const exitModal = document.getElementById('hpo-exit-modal');
  if (exitModal) {
    const closeModalBtn = exitModal.querySelector('.hpo-modal-close');
    let exitIntentShown = sessionStorage.getItem('hpo_modal_shown') === 'true';
    const showExitModal = () => {
      if (exitIntentShown) return;
      exitModal.classList.add('show-modal');
      sessionStorage.setItem('hpo_modal_shown', 'true');
      exitIntentShown = true;
    };
    setTimeout(showExitModal, 45000);
    document.addEventListener('mouseleave', e => { if (e.clientY < 10) showExitModal(); });
    if(closeModalBtn) closeModalBtn.addEventListener('click', () => exitModal.classList.remove('show-modal'));
    exitModal.addEventListener('click', e => { if (e.target === exitModal) exitModal.classList.remove('show-modal'); });
  }

  // --- 3. TAB SWITCHING LOGIC (WITH NULL CHECKS) ---
  window.switchContent = function(event, tabId) {
      event.preventDefault();
      const navLinks = document.querySelectorAll('.hpo-nav-link');
      const contentPanels = document.querySelectorAll('.hpo-content-panel');
      if(navLinks.length === 0 || contentPanels.length === 0) return;
      
      navLinks.forEach(link => link.classList.remove('active'));
      contentPanels.forEach(panel => panel.classList.remove('active'));
      const activeLink = document.querySelector(`.hpo-nav-link[href="#${tabId}"]`);
      if (activeLink) activeLink.classList.add('active');
      const activePanel = document.getElementById(tabId);
      if (activePanel) activePanel.classList.add('active');
  };
    
  window.switchAgentTab = function(event, tabId) {
      event.preventDefault();
      const agentNavLinks = document.querySelectorAll('.hpo-agent-nav-link');
      const agentContentPanels = document.querySelectorAll('.hpo-agent-content-panel');
      if(agentNavLinks.length === 0 || agentContentPanels.length === 0) return;

      agentNavLinks.forEach(link => link.classList.remove('active'));
      agentContentPanels.forEach(panel => panel.classList.remove('active'));
      const activeLink = document.querySelector(`.hpo-agent-nav-link[href="#${tabId}"]`);
      if(activeLink) activeLink.classList.add('active');
      const activePanel = document.getElementById(tabId);
      if (activePanel) activePanel.classList.add('active');
  };

  // --- 4. REFERRAL MODAL LOGIC ---
  const referralModal = document.getElementById('hpo-referral-modal');
  if (referralModal) {
    const closeReferralModalBtn = referralModal.querySelector('.hpo-modal-close');
    const openReferralButtons = document.querySelectorAll('#open-referral-modal-agent-hub, #open-referral-modal-how-it-works, #open-referral-modal-submit-tab');
    
    openReferralButtons.forEach(btn => {
        if(btn) btn.addEventListener('click', () => referralModal.classList.add('show-modal'));
    });
    if(closeReferralModalBtn) closeReferralModalBtn.addEventListener('click', () => referralModal.classList.remove('show-modal'));
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