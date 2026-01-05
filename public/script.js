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
    
    // THE #1 EMOTIONAL DRIVER – Trust Protection
    { q: "Do you want real-time alerts to prevent trust account violations (Rule 54 & 86)?", 
      o: ["Not a priority right now", "Yes – this is critical"], 
      requires: "Dominance" },
    
    // Advanced Trust Automation
    { q: "Do you need automatic trust allocation, tracking & full audit logs?", 
      o: ["Basic alerts are enough", "Yes – full automation & reconciliation"], 
      requires: "Dominance" },
    
    // Automation Workflows
    { q: "Do you want automated workflows (payment chasers, referral requests, lead nurturing)?", 
      o: ["No thanks", "Yes – save time & grow"], 
      requires: "Dominance" },
    
    // SARS & VAT Compliance
    { q: "Do you need SARS-compliant tax invoices with VAT options?", 
      o: ["No", "Yes – must be correct"], 
      requires: "Dominance" },
    
    // Apex – Branding
    { q: "Do you need full white-label (your own domain, no LexPilot branding)?", 
      o: ["Subdomain is fine", "Yes – full white-label"], 
      requires: "Apex" },
    
    // Apex – Premium Support
    { q: "Do you want dedicated onboarding & direct founder access?", 
      o: ["No", "Yes – priority support"], 
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
      const needsDominance = answers.some(a => a.requires === "Dominance" && /Yes|critical|full automation|save time|must be correct/.test(a.answer));
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

      // FEATURES – Exact match to pricing cards
      const featuresHTML = {
        Growth: `
          <div class="space-y-10 text-left">
            <div>
              <p class="text-2xl font-black mb-4 text-green-400">Core Features</p>
              <ul class="space-y-3 text-lg">
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Professional law firm website (standard)</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>AI website content generator + no-code editor</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Client intake & CRM</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Calendar / client booking</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Case / matter management</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Time tracking (per session)</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Document & file storage</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Disbursements (manual)</span></li>
              </ul>
            </div>
            <div>
              <p class="text-2xl font-black mb-4 text-green-400">Billing & Trust</p>
              <ul class="space-y-3 text-lg">
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Smart single-case invoicing</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>PDF invoice generation & email sending</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>PayFast payment links</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Auto trust deduction if balance exists</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Low-balance trust alerts</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Manual refund / void invoice</span></li>
              </ul>
            </div>
            <div>
              <p class="text-2xl font-black mb-4 text-green-400">VAT & Invoicing</p>
              <ul class="space-y-3 text-lg">
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Manual VAT field only</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Standard invoices (not tax invoices)</span></li>
              </ul>
            </div>
            <div>
              <p class="text-2xl font-black mb-4 text-green-400">Support</p>
              <ul class="space-y-3 text-lg">
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Email & WhatsApp support</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Founding referral rewards (refer 1 firm → 12 months free, 2 firms → free forever)</span></li>
              </ul>
            </div>
          </div>
        `,
        Dominance: `
          <div class="space-y-10 text-left">
            <p class="text-xl font-bold mb-8 opacity-90">Everything in Growth, plus:</p>
            <div>
              <p class="text-2xl font-black mb-4 text-yellow-400">Advanced Compliance</p>
              <ul class="space-y-3 text-lg">
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Real-time Rule 54 & Rule 86 alerts</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Auto trust allocation & tracking</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Advanced trust reconciliation & audit logs</span></li>
              </ul>
            </div>
            <div>
              <p class="text-2xl font-black mb-4 text-yellow-400">Automation & Scale</p>
              <ul class="space-y-3 text-lg">
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Multi-case & bulk invoicing</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Automatic invoice sending</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Automatic trust settlement</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Automated workflows: lead nurturing, payment chasers, referral requests</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Lead dashboard & revenue visibility</span></li>
              </ul>
            </div>
            <div>
              <p class="text-2xl font-black mb-4 text-yellow-400">VAT & SARS-Compliant Invoices</p>
              <ul class="space-y-3 text-lg">
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>VAT dropdown per invoice: Yes/No</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Automatic SARS-compliant tax invoices (if VAT = Yes)</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Audit log for VAT and invoice type</span></li>
              </ul>
            </div>
            <div>
              <p class="text-2xl font-black mb-4 text-yellow-400">Firm Operations</p>
              <ul class="space-y-3 text-lg">
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Multi-lawyer collaboration</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Assign cases & split billing</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Admin dashboard & firm-wide reporting</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>User & permission management</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Advanced document storage</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Bulk refunds & adjustments</span></li>
              </ul>
            </div>
            <div>
              <p class="text-2xl font-black mb-4 text-yellow-400">Support</p>
              <ul class="space-y-3 text-lg">
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Priority WhatsApp & email support</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Founding referral rewards (refer 1 firm → 12 months free, 2 firms → free forever)</span></li>
              </ul>
            </div>
          </div>
        `,
        Apex: `
          <div class="space-y-10 text-left">
            <p class="text-xl font-bold mb-8 opacity-90">Everything in Dominance, plus:</p>
            <div>
              <p class="text-2xl font-black mb-4 text-yellow-300">Brand & Control</p>
              <ul class="space-y-3 text-lg">
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>White-label website (your brand, your domain)</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Premium presentation for high-value clients</span></li>
              </ul>
            </div>
            <div>
              <p class="text-2xl font-black mb-4 text-yellow-300">Founder-Level Access</p>
              <ul class="space-y-3 text-lg">
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Dedicated onboarding</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Direct founder access & priority escalation</span></li>
              </ul>
            </div>
            <div>
              <p class="text-2xl font-black mb-4 text-yellow-300">Scale</p>
              <ul class="space-y-3 text-lg">
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Unlimited users & cases</span></li>
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Full operational freedom without tier-switching</span></li>
              </ul>
            </div>
            <div>
              <p class="text-2xl font-black mb-4 text-yellow-300">Support & Rewards</p>
              <ul class="space-y-3 text-lg">
                <li class="flex items-start gap-3"><i class="fas fa-check text-green-400 mt-1"></i><span>Founding referral rewards (refer 1 firm → 12 months free, 2 firms → free forever)</span></li>
              </ul>
            </div>
          </div>
        `
      };
      $('recommended-list').innerHTML = featuresHTML[finalTier];

      // Dynamic CTA
      const oldCta = document.querySelector('#quiz-results .dynamic-cta');
      if (oldCta) oldCta.remove();
      const buttonText = finalTier === "Apex" ? "JOIN APEX WAITLIST" : `CLAIM MY ${t.name.toUpperCase()} SPOT NOW`;
      const setupText = t.setup > 0 ? ` + ${format(t.setup)} setup${isWaived ? " (WAIVED!)" : ""}` : "";
      const action = finalTier === "Apex" ? "Join Apex waitlist" : "Secure my founding spot";
      const waMsg = encodeURIComponent(`LexPilot FOUNDING LEAD! Tier: ${t.name} | Price: ${format(t.monthly)}/mo${setupText} | Normal: ${format(t.normal)}/mo | ${action}!`);
      $('recommended-list').insertAdjacentHTML('afterend', `
        <div class="mt-16 dynamic-cta">
          <button class="claim-btn" data-tier="${finalTier}">
            <div class="inline-block bg-gradient-to-r ${t.color} hover:scale-105 transition-all text-black font-black text-3xl md:text-4xl px-12 py-8 rounded-full shadow-2xl w-full max-w-md">
              <i class="fab fa-whatsapp mr-4 text-4xl"></i> ${buttonText}
            </div>
          </button>
          <p class="mt-6 text-xl opacity-80">Reply in under 60 seconds • 24/7</p>
        </div>
      `);

      $('quiz-overlay').classList.add('hidden');
      document.body.style.overflow = '';
      $('quiz-results').classList.remove('hidden');
      $('quiz-results').scrollIntoView({ behavior: 'smooth' });
    }
  };
  // ====================== GLOBAL WHATSAPP HANDLER ======================
  document.addEventListener('click', e => {
    const btn = e.target.closest('.claim-btn');
    if (!btn) return;
    e.preventDefault();
    let tier = btn.dataset.tier || $('tier-name')?.textContent.trim();
    if (!tier || !TIERS[tier]) return;
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
    $('quiz-overlay')?.addEventListener('click', e => {
      if (e.target === $('quiz-overlay')) {
        $('quiz-overlay').classList.add('hidden');
        document.body.style.overflow = '';
      }
    });
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