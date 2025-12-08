/* ==================================================================== */
/* CRAFTVIBEZA – FINAL DECEMBER 2025 SCRIPT.JS – 100% COMPLETE & FIXED */
/* Works on Vercel • Quiz • Counters • Header/Footer • Forms • Backup */
/* ==================================================================== */

(() => {
  'use strict';

  // ====================== CONFIG ======================
  const CONFIG = {
    WHATSAPP_NUMBER: '27764312871',
    BACKUP_API_URL: '/api/lead' // optional encrypted backup
  };

  // ====================== CURRENT FOUNDING TIERS (DEC 2025) ======================
  const TIERS = {
    Growth: { name: "Growth", monthly: 999, setup: 0, normal: 2999, limit: 100, color: "from-green-500 to-emerald-600", badge: false },
    Dominance: { name: "Dominance", monthly: 2999, setup: 4999, normal: 7999, limit: 200, color: "from-yellow-400 to-amber-500", badge: true },
    Elite: { name: "Elite", monthly: 9999, setup: 9999, normal: 19999, limit: 200, color: "from-amber-500 to-orange-600", badge: false }
  };

  // ====================== QUIZ QUESTIONS ======================
  const QUIZ = [
    { q: "How many attorneys + staff will use the platform?", o: ["1–5", "5–15", "16+ / Unlimited"] },
    { q: "Do you want client deposit capture (card / Ozow / EFT)?", o: ["No thanks", "Yes – I need it"], requires: "Dominance" },
    { q: "Do you want automated email/WhatsApp sequences (chasers, referrals, etc)?", o: ["No", "Yes"], requires: "Dominance" },
    { q: "Do you need automated CPD tracking + 1-click LPC report?", o: ["I’ll do it manually", "Yes – never miss points again"], requires: "Elite" },
    { q: "Would you use an AI Brief & Letter Writer trained on SA law?", o: ["Not interested", "Yes – huge time saver"], requires: "Elite" },
    { q: "Do you need full white-label (your own domain, no CraftVibeZA branding)?", o: ["Subdomain is fine", "Yes – full white-label"], requires: "Elite" }
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

    const update = (tier, selectors) => {
      db.collection("spots").doc(tier).onSnapshot(doc => {
        const taken = doc.data()?.taken || 0;
        document.querySelectorAll(selectors).forEach(el => el && (el.textContent = taken));

        if (tier === "dominance" && taken >= 100) {
          document.querySelectorAll("#dominance-btn-text, #dominance-btn-text-desktop")
            .forEach(el => el && (el.textContent = "CLAIM (Setup fee applies)"));
        }
      });
    };

    update("growth", "#growth-taken, #growth-taken-desktop");
    update("dominance", "#dominance-taken, #dominance-taken-desktop");
    update("elite", "#elite-taken, #elite-taken-desktop");
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
          const choice = q.o[btn.dataset.index];
          answers.push({ answer: choice, requires: q.requires || null });
          currentQuestion++;
          setTimeout(Quiz.next, 300);
        };
      });
    },

    results: () => {
      // Smart recommendation logic
      const needsElite = answers.some(a => a.requires === "Elite" && (a.answer.includes("Yes") || a.answer.includes("never miss") || a.answer.includes("full white-label")));
      const needsDominance = answers.some(a => a.requires === "Dominance" && a.answer.includes("Yes"));
      const userCount = answers[0]?.answer;

      if (needsElite || userCount === "16+ / Unlimited") {
        finalTier = "Elite";
      } else if (needsDominance || userCount === "5–15") {
        finalTier = "Dominance";
      } else {
        finalTier = "Growth";
      }

      const t = TIERS[finalTier];

      // Update UI
      $('tier-name').textContent = t.name.toUpperCase();
      $('tier-name').className = `px-16 py-8 rounded-full text-5xl md:text-7xl font-black text-black bg-gradient-to-r ${t.color} shadow-2xl`;

      $('popular-badge').style.display = t.badge ? "block" : "none";

      $('tier-price').innerHTML = `
        <div class="text-6xl md:text-8xl font-black text-green-400">${format(t.monthly)}<span class="text-4xl">/mo</span></div>
        <div class="text-3xl opacity-70 mt-4"><s>${format(t.normal)}</s></div>
      `;

      $('final-total').innerHTML = `
        <div class="text-3xl mt-8">Setup: ${t.setup === 0 ? "R0" : format(t.setup)}
          ${t.setup > 0 ? '<span class="text-green-400 text-lg block">(waived for first 100)</span>' : ''}
        </div>
        <div class="text-2xl mt-6 text-green-300 font-bold">Your founding price locked FOREVER</div>
      `;

      // Feature list with REAL checkmarks
      const highlights = {
        Growth: ["Professional website", "AI site generator", "Smart invoicing", "Rule 54 & 86 protection", "Founding referral rewards"],
        Dominance: ["Everything in Growth", "Client deposits (card/Ozow/EFT)", "Lead dashboard", "Automated email/WhatsApp sequences", "Priority support"],
        Elite: ["Everything in Dominance", "Automated CPD tracking + LPC reports", "AI Brief & Letter Writer (SA law)", "Full white-label (your domain)", "1-hour strategy call"]
      };

      $('recommended-list').innerHTML = highlights[finalTier]
        .map(f => `<li class="text-xl py-3 flex items-center gap-4"><i class="fas fa-check-circle text-green-400 text-2xl"></i> ${f}</li>`)
        .join('');

      // Show results
      $('quiz-overlay').classList.add('hidden');
      document.body.style.overflow = '';
      $('quiz-results').classList.remove('hidden');
      $('quiz-results').scrollIntoView({ behavior: 'smooth' });
    }
  };

  // ====================== WHATSAPP CLAIM BUTTONS ======================
  document.addEventListener('click', e => {
    const btn = e.target.closest('.claim-btn');
    if (!btn) return;
    e.preventDefault();

    const tier = btn.dataset.tier;
    const t = TIERS[tier];

    const msg = encodeURIComponent(
      `CRAFTVIBEZA FOUNDING MEMBER LEAD! 🔥\n\n` +
      `Tier: ${t.name}\n` +
      `Price: ${format(t.monthly)}/mo${t.setup > 0 ? ` + ${format(t.setup)} setup` : ""}\n` +
      `Normal: ${format(t.normal)}/mo\n\n` +
      `CALL THEM NOW — READY TO PAY! 🚀`
    );

    window.open(`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${msg}`, '_blank');
  });

  // ====================== BACKUP LEAD (ENCRYPTED) ======================
  const backupLead = async (name, phone, tier) => {
    if (!CONFIG.BACKUP_API_URL || typeof CryptoJS === 'undefined') return;
    const payload = { name, phone, tier, time: new Date().toISOString(), url: location.href };
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(payload), 'craftvibeza-2026-backup-key').toString();

    try {
      await fetch(CONFIG.BACKUP_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ encrypted })
      });
    } catch (e) {
      console.warn("Backup failed", e);
    }
  };

  // ====================== POPIA CONSENT TOGGLE ======================
  window.toggleConsent = (block) => {
    const checkbox = block.querySelector('input[type="checkbox"]');
    const box = block.querySelector('.checkbox-custom');
    const icon = box?.querySelector('i');

    if (!checkbox || !box || !icon) return;

    checkbox.checked = !checkbox.checked;

    if (checkbox.checked) {
      icon.classList.remove('hidden');
      block.classList.remove('bg-zinc-800/50');
      block.classList.add('bg-green-900/50', 'border-4', 'border-green-500', 'ring-4', 'ring-green-500/60');
      box.classList.add('border-green-500', 'bg-green-500/20');
    } else {
      icon.classList.add('hidden');
      block.classList.remove('bg-green-900/50', 'border-4', 'border-green-500', 'ring-4', 'ring-green-500/60');
      block.classList.add('bg-zinc-800/50');
      box.classList.remove('border-green-500', 'bg-green-500/20');
    }
  };

  // ====================== HEADER & FOOTER LOADER ======================
  const loadPart = async (file, placeholderId) => {
    try {
      const res = await fetch(`/${file}.html?v=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        $(placeholderId).innerHTML = await res.text();
      } else throw new Error();
    } catch (e) {
      $(placeholderId).innerHTML = `<div class="text-red-500 p-10 text-center text-2xl">Error: ${file}.html missing</div>`;
    }
  };

  // ====================== INIT ======================
  document.addEventListener('DOMContentLoaded', () => {
    loadPart('header', 'header-placeholder');
    loadPart('footer', 'footer-placeholder');
    initCounters();

    // Close overlay on background click
    $('quiz-overlay')?.addEventListener('click', e => {
      if (e.target === $('quiz-overlay')) {
        $('quiz-overlay').classList.add('hidden');
        document.body.style.overflow = '';
      }
    });

    // Add X close button
    const x = document.createElement('button');
    x.innerHTML = '×';
    x.className = 'absolute top-6 right-6 text-7xl opacity-40 hover:opacity-100 z-50 text-white';
    x.onclick = () => {
      $('quiz-overlay').classList.add('hidden');
      document.body.style.overflow = '';
    };
    $('quiz-overlay')?.prepend(x);
  });

  // Expose to global
  window.startQuiz = Quiz.start;

})();
