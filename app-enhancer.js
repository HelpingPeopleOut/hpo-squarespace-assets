/**
 * ===================================================================
 * HPO.CENTER APP ENHANCER V1.0
 * ===================================================================
 * This file consolidates all custom JavaScript functionality for the site.
 * It includes:
 * 1. PWA Service Worker Registration
 * 2. The Interaction Manager (Floating Buttons & Intelligent Modal)
 * 3. UTM Parameter & Lead Source Tracking
 * 4. Dynamic Page Prefetching for faster navigation
 * * Implemented: July 2025
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
  const HPO_Interactions = {
    config: { modalTimeout: 30000, scrollDepthTrigger: 50, scrollTopShowPixels: 300 },
    modalHasBeenTriggered: false,
    elements: {},
    init() {
      this.cacheElements();
      if (this.elements.modalOverlay) this.setupEventListeners();
    },
    cacheElements() {
      this.elements.scrollTopBtn = document.getElementById('hpo-scroll-to-top');
      this.elements.modalOverlay = document.getElementById('hpo-smart-modal');
      this.elements.closeModalBtn = this.elements.modalOverlay ? this.elements.modalOverlay.querySelector('.hpo-modal-close') : null;
      this.elements.dontShowCheckbox = document.getElementById('hpo-dont-show-again-checkbox'); // Assuming you might add this back later
    },
    setupEventListeners() {
      setTimeout(() => this.triggerModal('timer'), this.config.modalTimeout);
      window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
      document.addEventListener('mouseleave', (e) => this.handleExitIntent(e));
      if (this.elements.closeModalBtn) {
        this.elements.closeModalBtn.addEventListener('click', () => this.hideModal());
      }
      this.elements.modalOverlay.addEventListener('click', (e) => { if (e.target === this.elements.modalOverlay) this.hideModal(); });
      if(this.elements.scrollTopBtn) {
        this.elements.scrollTopBtn.addEventListener('click', () => this.scrollToTop());
      }
    },
    handleScroll() {
      if(this.elements.scrollTopBtn) {
        this.elements.scrollTopBtn.classList.toggle('visible', window.scrollY > this.config.scrollTopShowPixels);
      }
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent >= this.config.scrollDepthTrigger) {
        this.triggerModal('scroll_depth');
      }
    },
    handleExitIntent(event) { if (event.clientY < 10) this.triggerModal('exit_intent'); },
    triggerModal(triggerType) {
      const isPermanentlyDismissed = localStorage.getItem('hpoModalDismissed_v3') === 'true';
      if (this.modalHasBeenTriggered || isPermanentlyDismissed) return;
      
      this.modalHasBeenTriggered = true;
      this.elements.modalOverlay.classList.add('show-modal');
      
      if (typeof gtag === 'function') {
        gtag('event', 'modal_triggered', { 'event_category': 'Engagement', 'event_label': `Trigger: ${triggerType}` });
      }
    },
    hideModal() {
      if (this.elements.dontShowCheckbox && this.elements.dontShowCheckbox.checked) {
        localStorage.setItem('hpoModalDismissed_v3', 'true');
      }
      this.elements.modalOverlay.classList.remove('show-modal');
    },
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (typeof gtag === 'function') {
        gtag('event', 'click', {'event_category': 'Navigation', 'event_label': 'Scroll to Top'});
      }
    }
  };
  HPO_Interactions.init(); // Run the Interaction Manager

  
  // --- 3. DYNAMIC PAGE PREFETCHING ---
  const prefetchLink = (e) => {
    const link = e.target.closest('a');
    if (link && link.href && (link.href.startsWith(window.location.origin) || link.href.startsWith('/')) && !link.href.includes('#')) {
      const prefetcher = document.createElement('link');
      prefetcher.rel = 'prefetch';
      prefetcher.href = link.href;
      document.head.appendChild(prefetcher);
    }
  };
  document.body.addEventListener('mouseenter', prefetchLink, { capture: true, passive: true });


  // --- 4. UTM PARAMETER & LEAD SOURCE TRACKING ---
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
    if (hasUtm) {
      localStorage.setItem('hpo_lead_source', JSON.stringify(leadData));
    }
  } catch(e) { console.warn("HPO UTM tracking error:", e); }

});