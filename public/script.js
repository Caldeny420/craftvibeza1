/* ==================================================================== */
/* CRAFTVIBEZA 2026 – FINAL PERFECTION SCRIPT.JS – GUARANTEED TO WORK   */
/* INCL. VERCEL */
/* UPDATED TO MATCH NUCLEAR LANDING PAGE – EVERY WORD IS NOW LIVE      */
/* ==================================================================== */
(() => {
  'use strict';

  // ====================== CONFIG ======================
  const CONFIG = {
    WHATSAPP_NUMBER: '27764312871',
    BACKUP_API_URL: '/api/lead' // Your lead.js – works perfectly
  };

  // ====================== QUIZ DATA ======================
  const QUIZ_DATA = [
    { q: "How many attorneys (including candidates) are in your firm right now?", o: ["1–2", "3–8", "9+"], tier: ["Growth","Dominance","Elite"] },
    { q: "How many new client enquiries do you get per month?", o: ["Under 20", "20–60", "60+"], tier: ["Growth","Dominance","Elite"] },
    { q: "Do you currently spend money on Google or Meta ads?", o: ["No", "Yes – under R25k/mo", "Yes – R25k+/mo"], tier: ["Growth","Dominance","Elite"] },
    { q: "What is your growth goal for 2026?", o: ["Stay the same / slow growth", "50–80% growth", "100%+ growth / dominate my area"], tier: ["Growth","Dominance","Elite"] },
    { q: "Would you like your own affiliate/referral program so other attorneys send you clients for commission?", o: ["No thanks", "Yes – I want referral income"], requires: "Dominance" },
    { q: "Do you want priority WhatsApp support + 1-on-1 onboarding?", o: ["Standard support is fine", "Yes – priority + personal onboarding"], requires: "Dominance" },
    { q: "Do you need full white-label (your own domain, no CraftVibeZA branding)?", o: ["Subdomain is perfect", "Yes – full white-label & custom domain"], requires: "Elite" },
    { q: "Would you use an AI Brief & Letter Writer trained on South African law?", o: ["Not interested", "Yes – huge time saver"], requires: "Elite" },
    { q: "Do you want automated LPC/CPD tracking & reporting (no more Excel hell)?", o: ["I’ll do it manually", "Yes – fully automated"], requires: "Elite" }
  ];

  // ====================== FINAL PRICING BUNDLES (MATCHES LANDING PAGE 100%) ======================
  const BUNDLES = {
    Growth: {
      name: "Growth",
      monthly: 14900,
      setup: 49900,
      color: "from-green-500 to-emerald-600",
      description: `
        <div class="text-4xl font-black text-green-400 mb-8">Growth – R14,900/mo (locked forever)</div>
        <ul class="space-y-5 text-xl leading-relaxed text-left max-w-2xl mx-auto">
          <li>Professional website on yourfirm.craftvibeza.com</li>
          <li>AI full-site generator + no-code editor</li>
          <li>Lead dashboard + automated calendar booking</li>
          <li><strong>The Smartest Invoice System Ever Built for SA Attorneys</strong></li>
          <li><strong>NEVER Get Disbarred Over Trust Money Again</strong> (Rule 54 & 86 protection)</li>
        </ul>
        <p class="mt-10 text-2xl font-bold text-green-300">Perfect for solo practitioners & small firms ready to grow.</p>`
    },
    Dominance: {
      name: "Dominance",
      monthly: 29900,
      setup: 89900,
      color: "from-yellow-400 to-amber-500",
      description: `
        <div class="text-4xl font-black text-yellow-400 mb-8">Dominance – R29,900/mo <span class="bg-red-600 text-white px-4 py-1 rounded-full text-lg">MOST CHOSEN</span></div>
        <p class="text-xl opacity-90 mb-6"><strong>Everything in Growth, plus:</strong></p>
        <ul class="space-y-5 text-xl leading-relaxed text-left max-w-2xl mx-auto">
          <li>Automated Email + WhatsApp sequences (late chasers, referrals, birthdays)</li>
          <li>Analytics, ROI dashboard, affiliate revenue sharing</li>
          <li>Priority WhatsApp support + 1-on-1 onboarding</li>
        </ul>
        <p class="mt-10 text-2xl font-bold text-yellow-300">For firms who want to dominate their area in 2026.</p>`
    },
    Elite: {
      name: "Elite",
      monthly: 49900,
      setup: 149900,
      color: "from-amber-500 to-orange-600",
      description: `
        <div class="text-4xl font-black text-amber-400 mb-8">Elite – R49,900/mo (the top 1%)</div>
        <p class="text-xl opacity-90 mb-6"><strong>Everything in Dominance, plus:</strong></p>
        <ul class="space-y-5 text-xl leading-relaxed text-left max-w-2xl mx-auto">
          <li>Never Miss CPD Points or Get Struck Off Again (fully automated)</li>
          <li>AI Brief & Letter Writer (trained exclusively on SA law)</li>
          <li>Full white-label + custom domain</li>
          <li>Dedicated account manager + strategy day</li>
        </ul>
        <p class="mt-10 text-2xl font-bold text-amber-300">For the firms who refuse to play small.</p>`
    }
  };

  // ====================== STATE ======================
  let currentQuestion = 0;
  let answers = [];
  let selectedTier = "Growth";
  const $ = id => document.getElementById(id);
  const formatPrice = n => `R${n.toLocaleString('en-ZA')}`;

  // ====================== ENCRYPTED BACKUP ======================
  const backupLead = async (name, phone, tier, monthly, setup) => {
    if (!CONFIG.BACKUP_API_URL || typeof CryptoJS === 'undefined') return;
    const payload = JSON.stringify({ name, phone, tier, monthly, setup, time: new Date().toISOString(), url: location.href });
    const encrypted = CryptoJS.AES.encrypt(payload, 'craftvibeza-2026-backup-key').toString();
    try {
      await fetch(CONFIG.BACKUP_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ encrypted })
      });
    } catch (e) {
      console.warn("Backup failed (optional)", e);
    }
  };

  // ====================== QUIZ ENGINE ======================
  const Quiz = {
    start: () => {
      currentQuestion = 0; answers = []; selectedTier = "Growth";
      $('quiz-overlay').classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      Quiz.next();
    },
    next: () => {
      if (currentQuestion >= QUIZ_DATA.length) return Quiz.showResults();
      const q = QUIZ_DATA[currentQuestion];
      $('quiz-question-text').textContent = q.q;
      $('quiz-progress').style.width = `${((currentQuestion + 1) / QUIZ_DATA.length) * 100}%`;
      $('quiz-options').innerHTML = q.o.map((opt, i) => `
        <button class="quiz-btn bg-zinc-800 hover:bg-green-600 text-white font-bold text-2xl py-8 px-10 rounded-2xl border-2 border-zinc-700 hover:border-green-500 transition-all hover:scale-105 shadow-lg w-full" data-index="${i}">
          ${opt}
        </button>
      `).join('');

      document.querySelectorAll('.quiz-btn').forEach(btn => {
        btn.onclick = () => {
          const idx = parseInt(btn.dataset.index);
          answers[currentQuestion] = { answer: q.o[idx], requires: q.requires || null };
          currentQuestion++;
          setTimeout(Quiz.next, 300);
        };
      });
    },
    showResults: () => {
      $('quiz-overlay').classList.add('hidden');
      document.body.style.overflow = '';

      let needsElite = false, needsDominance = false;
      answers.forEach(a => {
        if (a.requires && a.answer.toLowerCase().includes('yes')) {
          if (a.requires === "Elite") needsElite = true;
          if (a.requires === "Dominance") needsDominance = true;
        }
      });

      selectedTier = needsElite ? "Elite" : needsDominance ? "Dominance" : "Growth";
      const b = BUNDLES[selectedTier];

      $('tier-name').textContent = b.name.toUpperCase();
      $('tier-name').className = `px-16 py-8 rounded-full text-5xl md:text-7xl font-black text-black bg-gradient-to-r ${b.color} shadow-2xl`;
      $('popular-badge').style.display = selectedTier === "Dominance" ? "block" : "none";

      $('tier-price').innerHTML = `
        <div class="text-6xl md:text-8xl font-black text-green-400">${formatPrice(b.monthly)}<span class="text-4xl">/mo</span></div>
        <div class="text-3xl opacity-70 mt-4">One-time setup: ${formatPrice(b.setup)}</div>
      `;

      $('final-total').textContent = `Founding Price: ${formatPrice(b.monthly)}/mo + ${formatPrice(b.setup)} setup – LOCKED FOREVER`;
      $('recommended-list').innerHTML = b.description;

      $('quiz-results').classList.remove('hidden');
      setTimeout(() => $('quiz-results').scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  // ====================== POPIA CONSENT TOGGLE (NUCLEAR RESET PROOF) ======================
  window.toggleConsent = (block) => {
    const checkbox = block.querySelector('input[type="checkbox"]');
    const box = block.querySelector('.checkbox-custom');
    const icon = box?.querySelector('i');

    if (!checkbox || !box || !icon) return console.error("Consent toggle failed");

    checkbox.checked = !checkbox.checked;

    if (checkbox.checked) {
      icon.classList.remove('hidden');
      block.classList.remove('bg-zinc-800/50');
      block.classList.add('bg-green-900/50', 'border-4', 'border-green-500', 'ring-4', 'ring-green-500/60');
      box.classList.add('border-green-500', 'bg-green-500/20');
    } else {
      icon.classList.add('hidden');
      block.classList.remove('bg-green-900/50', 'border-4', 'border-green-500', 'ring-green-500/60');
      block.classList.add('bg-zinc-800/50');
      box.classList.remove('border-green-500', 'bg-green-500/20');
    }
  };

  // ====================== FORM SUBMISSION (BOTH FORMS) ======================
  document.addEventListener('submit', e => {
    if (!e.target.matches('#capture-form, #direct-capture-form')) return;
    e.preventDefault();

    const nameInput = e.target.querySelector('input[name="name"]') || e.target.querySelector('input[type="text"]');
    const phoneInput = e.target.querySelector('input[name="phone"]') || e.target.querySelector('input[type="tel"]');
    const checkbox = e.target.querySelector('input[type="checkbox"]');

    if (!nameInput?.value.trim()) return alert('Please enter your full name');
    if (!phoneInput?.value.trim()) return alert('Please enter your WhatsApp number');
    if (!checkbox?.checked) return alert('Please accept POPIA consent');

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim().replace(/\D/g, '').replace(/^0/, '27');
    const tier = selectedTier || "Dominance";
    const b = BUNDLES[tier];

    const message = encodeURIComponent(
      `CRAFTVIBEZA – NEW FOUNDING PARTNER LEAD (12-SPOT)\n\n` +
      `Name: ${name}\n` +
      `Tier: ${tier}\n` +
      `Price: ${formatPrice(b.monthly)}/mo + ${formatPrice(b.setup)} setup\n` +
      `WhatsApp: +${phone}\n\n` +
      `CALL THEM NOW — THEY ARE READY TO JOIN!`
    );

    window.open(`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${message}`, '_blank');
    backupLead(name, phone, tier, b.monthly, b.setup);

    alert('Message sent! We’re calling you in under 60 seconds.');
    
    // NUCLEAR FORM RESET
    e.target.reset();
    const block = e.target.querySelector('[onclick*="toggleConsent"]');
    if (block) {
      const icon = block.querySelector('i');
      const input = block.querySelector('input[type="checkbox"]');
      if (icon) icon.classList.add('hidden');
      if (input) input.checked = false;
      block.classList.remove('bg-green-900/50','border-4','border-green-500','ring-4','ring-green-500/60');
      block.classList.add('bg-zinc-800/50');
      const box = block.querySelector('.checkbox-custom');
      if (box) box.classList.remove('border-green-500', 'bg-green-500/20');
    }
  });

  // ====================== HEADER & FOOTER LOADER ======================
  const loadPart = async (file, placeholderId) => {
    const path = `/${file}.html`;
    try {
      const res = await fetch(path + '?v=' + Date.now(), { cache: "no-store" });
      if (res.ok) {
        $(placeholderId).innerHTML = await res.text();
        return;
      }
    } catch (e) {}
    $(placeholderId).innerHTML = `<div class="text-red-500 p-10 text-center text-2xl">Error: ${file}.html missing</div>`;
  };

  // ====================== INIT ======================
  document.addEventListener('DOMContentLoaded', () => {
    loadPart('header', 'header-placeholder');
    loadPart('footer', 'footer-placeholder');

    // Close button for quiz
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.className = 'close-btn absolute top-6 right-6 text-7xl opacity-40 hover:opacity-100 transition z-20';
    closeBtn.onclick = () => {
      $('quiz-overlay').classList.add('hidden');
      document.body.style.overflow = '';
    };
    $('quiz-overlay')?.prepend(closeBtn);
  });

  window.startQuiz = Quiz.start;
})();
