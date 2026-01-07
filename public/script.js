(() => {
  'use strict';
  // ====================== CONFIG ======================
  const CONFIG = {
    WHATSAPP_NUMBER: '27764312871'
  };
  // ====================== TIERS ======================
  const TIERS = {
    Growth: {
      name: "Growth",
      monthly: 999,
      setup: 0,
      normal: 2999,
      color: "from-green-500 to-emerald-600",
      waiveLimit: 999
    },
    Dominance: {
      name: "Dominance",
      monthly: 2999,
      setup: 4999,
      normal: 7999,
      color: "from-yellow-400 to-amber-500",
      waiveLimit: 100
    },
    Apex: {
      name: "Apex",
      monthly: 9999,
      setup: 9999,
      normal: 19999,
      color: "from-yellow-500 to-gold",
      waiveLimit: 50
    }
  };
  // ====================== QUIZ QUESTIONS ======================
  const QUIZ = [
    { q: "How many attorneys + staff will use the platform?", o: ["1–5", "5–15", "16+ / Unlimited"] },
    // Trust Protection – #1 emotional driver
    { q: "How important is preventing trust account violations (Rule 54 & 86)?",
      o: ["Not a priority", "Very important – I need real-time alerts"],
      requires: "Dominance" },
    // Advanced Trust Automation
    { q: "Do you want fully automated trust handling on invoices?",
      o: ["Manual is fine", "Yes – auto deduction, allocation & reconciliation"],
      requires: "Dominance" },
    // Automation Workflows
    { q: "Do you want automated payment chasers & overdue reminders?",
      o: ["No thanks", "Yes – get paid faster automatically"],
      requires: "Dominance" },
    // SARS & VAT Compliance
    { q: "Do you need SARS-compliant tax invoices with proper VAT handling?",
      o: ["Basic is enough", "Yes – must be fully compliant"],
      requires: "Dominance" },
    // Apex – White-label Branding
    { q: "Do you want full white-label (your own domain, no LexPilot branding)?",
      o: ["Subdomain is fine", "Yes – complete white-label"],
      requires: "Apex" },
    // Apex – Client Portal & Self-Service
    { q: "Do you want a client portal so clients can top up trust themselves?",
      o: ["Not needed", "Yes – premium client experience"],
      requires: "Apex" }
  ];
  // ====================== STATE ======================
  let currentQuestion = 0;
  let answers = [];
  let finalTier = "Growth";
  const $ = id => document.getElementById(id);
  const format = n => `R${n.toLocaleString('en-ZA')}`;
  // ====================== FIREBASE COUNTERS ======================
  const initCounters = () => {
    if (typeof firebase === 'undefined') return;
    const db = firebase.firestore();
    const updateCounter = (tierKey) => {
      const docRef = db.collection("spots").doc(tierKey.toLowerCase());
      docRef.onSnapshot(doc => {
        if (!doc.exists) return;
        const taken = doc.data()?.taken || 0;
        const displayId = `${tierKey.toLowerCase()}-taken`;
        if ($(displayId)) $(displayId).textContent = taken;
      });
    };
    updateCounter("Growth");
    updateCounter("Dominance");
    updateCounter("Apex");
  };
  // ====================== QUIZ ENGINE ======================
  const Quiz = {
    start: () => {
      currentQuestion = 0;
      answers = [];
      finalTier = "Growth";
      $('quiz-overlay')?.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      Quiz.next();
    },
    next: () => {
      if (currentQuestion >= QUIZ.length) return Quiz.results();
      const q = QUIZ[currentQuestion];
      $('quiz-question-text').textContent = q.q;
      $('quiz-progress').style.width = `${((currentQuestion + 1) / QUIZ.length) * 100}%`;
      $('quiz-options').innerHTML = q.o.map((opt, i) => `
        <button class="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 py-10 px-8 rounded-2xl text-2xl font-bold transition-all hover:scale-105 hover:border-green-500" data-index="${i}">
          ${opt}
        </button>
      `).join('');
      document.querySelectorAll('#quiz-options button').forEach(btn => {
        btn.onclick = () => {
          answers.push({ answer: q.o[btn.dataset.index], requires: q.requires || null });
          currentQuestion++;
          btn.classList.add('border-green-500', 'bg-zinc-700');
          setTimeout(Quiz.next, 400);
        };
      });
    },
    results: () => {
      // Determine tier
      const needsApex = answers.some(a => a.requires === "Apex" && a.answer.includes("Yes"));
      const needsDominance = answers.some(a => a.requires === "Dominance" && /Yes|Very important|auto deduction|paid faster|fully compliant/.test(a.answer));
      const userCount = answers[0]?.answer || "1–5";
      finalTier = (needsApex || userCount === "16+ / Unlimited") ? "Apex" :
                  (needsDominance || userCount === "5–15") ? "Dominance" : "Growth";
      const t = TIERS[finalTier];
      const takenDominance = parseInt($('dominance-taken')?.textContent || '0');
      const takenApex = parseInt($('apex-taken')?.textContent || '0');
      const isWaived = (finalTier === "Dominance" && takenDominance < t.waiveLimit) ||
                       (finalTier === "Apex" && takenApex < t.waiveLimit) ||
                       finalTier === "Growth";
      // Tier styling
      $('tier-name').textContent = t.name.toUpperCase();
      $('tier-name').className = `inline-block px-6 sm:px-10 md:px-16 py-5 sm:py-7 md:py-8 rounded-full text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-black bg-gradient-to-r ${t.color} shadow-2xl text-center leading-none`;
      $('popular-badge').style.display = finalTier === "Dominance" ? "block" : "none";
      // Pricing
      $('tier-price').innerHTML = `
        <div class="text-6xl md:text-8xl font-black text-green-400">${format(t.monthly)}<span class="text-4xl">/mo</span></div>
        <div class="text-3xl opacity-70 mt-4"><s>${format(t.normal)}</s></div>
      `;
      $('final-total').innerHTML = `
        <div class="text-3xl mt-8">
          ${t.setup > 0
            ? `Setup: ${format(t.setup)}${isWaived ? '<span class="text-green-400 text-2xl block font-bold">(WAIVED!)</span>' : `<span class="text-green-400 text-lg block">(waived for first ${t.waiveLimit} firms)</span>`}`
            : 'No Setup Fee'}
        </div>
        <div class="text-2xl mt-6 text-green-300 font-bold">Your founding price locked FOREVER</div>
      `;
      // RECOMMENDED FEATURES – Perfectly aligned with current landing page cards
      const featuresHTML = {
        Growth: `
          <div class="space-y-10 text-left">
            <div>
              <p class="text-2xl font-black mb-4 text-green-400">Core Features</p>
              <ul class="space-y-3 text-lg">
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Client & Matter Management</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Calendar & Booking</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Time Tracking & Billing</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Document & File Storage</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Disbursements (Manual)</span></li>
              </ul>
            </div>
            <div>
              <p class="text-2xl font-black mb-4 text-green-400">Billing & Trust</p>
              <ul class="space-y-3 text-lg">
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>PayFast Payment & Trust Deposit Links — One-click payments and top-ups</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>PDF Invoice Generation & Email Sending</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Manual Trust Deduction from Invoices — With shortfall warnings</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Low-Balance Alerts & Trust Shortfall Protection</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Manual Refund / Void with Auto Trust Refund</span></li>
              </ul>
            </div>
            <div>
              <p class="text-2xl font-black mb-4 text-green-400">VAT & Invoicing</p>
              <ul class="space-y-3 text-lg">
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Manual VAT Field Only</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Standard Invoices</span></li>
              </ul>
            </div>
            <div>
              <p class="text-2xl font-black mb-4 text-green-400">Support & Growth</p>
              <ul class="space-y-3 text-lg">
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Email & WhatsApp Support</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Referral Rewards — Refer 1 firm → 12 months free, 2 firms → free forever</span></li>
              </ul>
            </div>
          </div>
        `,
        Dominance: `
          <div class="space-y-10 text-left">
            <p class="text-xl font-bold mb-8 opacity-90">Everything in Growth, plus:</p>
            <div>
              <p class="text-2xl font-black mb-4 text-yellow-400">Automation & Scale</p>
              <ul class="space-y-3 text-lg">
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Bulk & Multi-Case Invoicing</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Fully Automated Trust Deductions from Invoices — Auto allocation, reconciliation, shortfall capping</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Automated Workflows — Payment chasers, overdue reminders, lead nurturing</span></li>
              </ul>
            </div>
            <div>
              <p class="text-2xl font-black mb-4 text-yellow-400">Team & Operations</p>
              <ul class="space-y-3 text-lg">
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Firm-Wide Dashboard — Real-time revenue, workloads, trust status</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Multi-Lawyer Collaboration</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Advanced Document Storage with Version Control</span></li>
              </ul>
            </div>
            <div>
              <p class="text-2xl font-black mb-4 text-yellow-400">Compliance & Reporting</p>
              <ul class="space-y-3 text-lg">
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Real-Time Rule 54 & 86 Alerts</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>SARS-Compliant Invoices with Audit Logs</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Advanced Reporting — Aged Debtors, LPC/Fidelity Fund exports</span></li>
              </ul>
            </div>
          </div>
        `,
        Apex: `
          <div class="space-y-10 text-left">
            <p class="text-xl font-bold mb-8 opacity-90">Everything in Dominance, plus:</p>
            <div>
              <p class="text-2xl font-black mb-4 text-yellow-300">Brand & Client Experience</p>
              <ul class="space-y-3 text-lg">
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>White-Label Website & Client Portal</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Client Portal Trust Top-Ups, Invoice Viewing & Payments</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Premium Automated Client Communications</span></li>
              </ul>
            </div>
            <div>
              <p class="text-2xl font-black mb-4 text-yellow-300">Advanced Automation</p>
              <ul class="space-y-3 text-lg">
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Workflow & Escalation Automation</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Advanced KPI & Lawyer Performance Dashboards</span></li>
              </ul>
            </div>
            <div>
              <p class="text-2xl font-black mb-4 text-yellow-300">Firm-Wide Control</p>
              <ul class="space-y-3 text-lg">
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Unlimited Users & Cases</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Customizable Dashboard</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Full Audit & Compliance Suite</span></li>
              </ul>
            </div>
          </div>
        `
      };
      $('recommended-list').innerHTML = featuresHTML[finalTier];
      // Dynamic WhatsApp CTA Button
      const oldCta = document.querySelector('#quiz-results .dynamic-cta');
      if (oldCta) oldCta.remove();
      const buttonText = finalTier === "Apex" ? "JOIN APEX WAITLIST" : `CLAIM MY ${t.name.toUpperCase()} SPOT`;
      const action = finalTier === "Apex" ? "Join Apex waitlist" : "Secure my founding spot";
      const setupText = t.setup > 0 ? ` + ${format(t.setup)} setup${isWaived ? " (WAIVED!)" : ""}` : "";
      const waMsg = encodeURIComponent(`LexPilot FOUNDING LEAD! Tier: ${t.name} | Price: ${format(t.monthly)}/mo${setupText} | Normal: ${format(t.normal)}/mo | ${action}!`);
      $('recommended-list').insertAdjacentHTML('afterend', `
        <div class="mt-16 dynamic-cta">
          <a href="https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${waMsg}" target="_blank" class="block">
            <div class="inline-block bg-gradient-to-r ${t.color} hover:scale-105 transition-all text-black font-black text-3xl md:text-4xl px-12 py-8 rounded-full shadow-2xl w-full max-w-md text-center">
              <i class="fab fa-whatsapp mr-4 text-4xl"></i> ${buttonText}
            </div>
          </a>
          <p class="mt-6 text-xl opacity-80">Reply in under 60 seconds • 24/7</p>
        </div>
      `);
      $('quiz-overlay').classList.add('hidden');
      document.body.style.overflow = '';
      $('quiz-results').classList.remove('hidden');
      $('quiz-results').scrollIntoView({ behavior: 'smooth' });
    }
  };
  // ====================== GLOBAL WHATSAPP HANDLER (for pricing page buttons) ======================
  document.addEventListener('click', e => {
    const btn = e.target.closest('.claim-btn');
    if (!btn) return;
    e.preventDefault();
    let tier = btn.dataset.tier;
    if (!tier) return;
    const t = TIERS[tier];
    const takenDominance = parseInt($('dominance-taken')?.textContent || '0');
    const takenApex = parseInt($('apex-taken')?.textContent || '0');
    const isWaived = (tier === "Dominance" && takenDominance < t.waiveLimit) ||
                     (tier === "Apex" && takenApex < t.waiveLimit) ||
                     tier === "Growth";
    const setupText = t.setup > 0 ? ` + ${format(t.setup)} setup${isWaived ? " (WAIVED!)" : ""}` : "";
    const action = tier === "Apex" ? "Join Apex waitlist" : "Secure my founding spot";
    const waMsg = encodeURIComponent(`LexPilot FOUNDING LEAD! Tier: ${t.name} | Price: ${format(t.monthly)}/mo${setupText} | Normal: ${format(t.normal)}/mo | ${action}!`);
    window.open(`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${waMsg}`, '_blank');
  });
  // ====================== TRIAL BUTTONS → WhatsApp "Free Trial" ======================
  document.addEventListener('click', e => {
    if (e.target.closest('button') && e.target.textContent.includes('Start 14-Day Free Trial')) {
      e.preventDefault();
      const waMsg = encodeURIComponent(`Hi LexPilot! I'd like to start the 14-day free trial.`);
      window.open(`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${waMsg}`, '_blank');
    }
    if (e.target.closest('button') && e.target.textContent.includes('Join Waitlist')) {
      e.preventDefault();
      const waMsg = encodeURIComponent(`Hi LexPilot! Please add me to the Apex waitlist.`);
      window.open(`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${waMsg}`, '_blank');
    }
  });
  // ====================== HEADER & FOOTER LOADER ======================
  const loadPart = async (file, placeholderId) => {
    const el = $(placeholderId);
    if (!el) return;
    try {
      const res = await fetch(`/${file}.html?v=${Date.now()}`, { cache: "no-store" });
      if (res.ok) el.innerHTML = await res.text();
      else el.innerHTML = `<div class="text-red-500 p-10 text-center text-2xl">Error: ${file}.html missing</div>`;
    } catch (e) {
      el.innerHTML = `<div class="text-red-500 p-10 text-center text-2xl">Failed to load ${file}.html</div>`;
    }
  };
  // ====================== INIT ======================
  document.addEventListener('DOMContentLoaded', () => {
    loadPart('header', 'header-placeholder');
    loadPart('footer', 'footer-placeholder');
    initCounters();
    // Close quiz overlay on background click
    $('quiz-overlay')?.addEventListener('click', e => {
      if (e.target === $('quiz-overlay')) {
        $('quiz-overlay').classList.add('hidden');
        document.body.style.overflow = '';
      }
    });
    // Add close button to quiz
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.className = 'absolute top-6 right-6 text-7xl opacity-40 hover:opacity-100 z-50 text-white';
    closeBtn.onclick = () => {
      $('quiz-overlay')?.classList.add('hidden');
      document.body.style.overflow = '';
    };
    $('quiz-overlay')?.prepend(closeBtn);
  });
  window.startQuiz = Quiz.start;
})();