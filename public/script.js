/* ==================================================================== */
/* CRAFTVIBEZA – FINAL DECEMBER 2025 SCRIPT.JS – NUCLEAR PERFECTION    */
/* Matches new feature table 100% • Quiz • Counters • Header/Footer   */
/* ==================================================================== */
(() => {
  'use strict';

  // ====================== CONFIG ======================
  const CONFIG = {
    WHATSAPP_NUMBER: '27764312871'
  };

  // ====================== TIERS – EXACTLY AS ON THE NEW LANDING PAGE ======================
  const TIERS = {
    Growth:    { name: "Growth",    monthly: 999,  normal: 2999,  setup: 0,     limit: 100,  color: "from-green-500 to-emerald-600",  badge: false },
    Dominance: { name: "Dominance", monthly: 2999, normal: 7999,  setup: 4999,  limit: 200,  color: "from-yellow-400 to-amber-500",   badge: true },
    Elite:     { name: "Elite",     monthly: 9999, normal: 19999, setup: 9999,  limit: 200,  color: "from-amber-500 to-orange-600",   badge: false }
  };

  // ====================== QUIZ – SMART LOGIC BASED ON NEW FEATURES ======================
  const QUIZ = [
    { q: "How many attorneys + staff will use the platform?", o: ["1–5", "5–15", "Unlimited / 16+"] },
    { q: "Do you want client deposit capture (card / Ozow / EFT)?", o: ["No", "Yes – essential"],                 requires: "Dominance" },
    { q: "Do you want automated email/SMS/WhatsApp sequences (chasers, referrals, etc)?", o: ["No", "Yes"], requires: "Dominance" },
    { q: "Do you need automated CPD tracking + 1-click LPC report?", o: ["No thanks", "Yes – I never want to miss points again"], requires: "Elite" },
    { q: "Would you use an AI Brief & Letter Writer trained only on South African law?", o: ["No", "Yes – massive time saver"], requires: "Elite" },
    { q: "Do you want full white-label (your own domain, no CraftVibeZA branding)?", o: ["Subdomain is fine", "Yes – full white-label"], requires: "Elite" }
  ];

  // ====================== STATE ======================
  let currentQuestion = 0;
  let answers = [];
  let finalTier = "Growth";

  const $ = id => document.getElementById(id);
  const format = n => `R${n.toLocaleString('en-ZA')}`;

  // ====================== FIREBASE LIVE COUNTERS ======================
  const initCounters = () => {
    if (typeof firebase === 'undefined') return;
    const db = firebase.firestore();

    const update = (tier, ids) => {
      db.collection("spots").doc(tier).onSnapshot(doc => {
        const taken = doc.data()?.taken || 0;
        document.querySelectorAll(ids).forEach(el => el && (el.textContent = taken));

        // Dominance: first 100 = setup waived
        if (tier === "dominance" && taken >= 100) {
          document.querySelectorAll("#dominance-btn-text, #dominance-btn-text-desktop")
            .forEach(el => el && (el.textContent = "CLAIM (Setup fee applies)"));
        }
      });
    };

    update("growth",    "#growth-taken, #growth-taken-desktop");
    update("dominance", "#dominance-taken, #dominance-taken-desktop");
    update("elite",     "#elite-taken, #elite-taken-desktop");
  };

  // ====================== QUIZ ENGINE ======================
  const Quiz = {
    start: () => {
      currentQuestion = 0;
      answers = [];
      finalTier = "Growth";
      $('quiz-overlay').classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      Quiz.next();
    },
    next: () => {
      if (currentQuestion >= QUIZ.length) return Quiz.showResults();

      const q = QUIZ[currentQuestion];
      $('quiz-question-text').textContent = q.q;
      $('quiz-progress').style.width = `${((currentQuestion + 1) / QUIZ.length * 100)}%`;

      $('quiz-options').innerHTML = q.o.map((opt, i) => `
        <button class="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 py-10 px-8 rounded-2xl text-2xl font-bold transition-all hover:scale-105 hover:border-green-500"
                data-index="${i}">
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
    showResults: () => {
      // Determine tier
      let needElite = answers.some(a => a.requires === "Elite" && a.answer.includes("Yes"));
      let needDominance = answers.some(a => a.requires === "Dominance" && a.answer.includes("Yes"));

      if (needElite) finalTier = "Elite";
      else if (needDominance || answers[0]?.answer === "Unlimited / 16+") finalTier = "Elite";
      else if (answers[0]?.answer === "5–15" || needDominance) finalTier = "Dominance";

      const t = TIERS[finalTier];

      // Update results UI
      $('tier-name').textContent = t.name.toUpperCase();
      $('tier-name').className = `px-16 py-8 rounded-full text-5xl md:text-7xl font-black text-black bg-gradient-to-r ${t.color} shadow-2xl`;
      $('popular-badge').style.display = t.badge ? "block" : "none";

      $('tier-price').innerHTML = `
        <div class="text-6xl md:text-8xl font-black text-green-400">${format(t.monthly)}<span class="text-4xl">/mo</span></div>
        <div class="text-3xl opacity-70 mt-4"><s>${format(t.normal)}</s></div>
      `;

      $('final-total').innerHTML = `
        <div class="text-3xl mt-8">Setup: ${t.setup === 0 ? "R0" : format(t.setup)} 
          ${t.setup > 0 ? '<span class="text-green-400 text-lg block">(waived for first few)</span>' : ''}</div>
        <div class="text-2xl mt-6 text-green-300 font-bold">Your founding price locked FOREVER</div>
      `;

      // Feature list
      const features = {
        Growth: ["Professional website", "AI site generator", "Smart invoicing", "Rule 54 & 86 protection", "Founding referral rewards"],
        Dominance: ["Everything in Growth", "Client deposits (card/Ozow/EFT)", "Lead dashboard", "Automated sequences", "Priority support"],
        Elite: ["Everything in Dominance", "Automated CPD + LPC reports", "AI Brief & Letter Writer (SA law)", "Full white-label + custom domain", "Strategy day"]
      };

      $('recommended-list').innerHTML = features[finalTier].map(f => `<li class="text-xl py-2">✓ ${f}</li>`).join('');

      $('quiz-overlay').classList.add('hidden');
      document.body.style.overflow = '';
      $('quiz-results').classList.remove('hidden');
      $('quiz-results').scrollIntoView({ behavior: 'smooth' });
    }
  };

  // ====================== CLAIM BUTTONS → WHATSAPP ======================
  document.querySelectorAll('.claim-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const tier = btn.dataset.tier;
      const t = TIERS[tier];
      const msg = encodeURIComponent(
        `CRAFTVIBEZA FOUNDING MEMBER LEAD!\n\n` +
        `Tier: ${t.name}\n` +
        `Price: ${format(t.monthly)}/mo${t.setup > 0 ? ` + ${format(t.setup)} setup` : ""}\n` +
        `Normal: ${format(t.normal)}/mo\n\n` +
        `CALL THEM IMMEDIATELY — READY TO JOIN!`
      );
      window.open(`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${msg}`, '_blank');
    });
  });

  // ====================== HEADER & FOOTER LOADER (BACK AND BETTER) ======================
  const loadPart = async (file, placeholder) => {
    try {
      const r = await fetch(`/${file}.html?v=${Date.now()}`, { cache: "no-store" });
      if (r.ok) $(placeholder).innerHTML = await r.text();
    } catch (e) {
      $(placeholder).innerHTML = `<div class="text-red-600 p-10 text-center">Missing ${file}.html</div>`;
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

    // X button
    const x = document.createElement('button');
    x.innerHTML = '×';
    x.className = 'absolute top-6 right-6 text-7xl opacity-40 hover:opacity-100 z-20';
    x.onclick = () => {
      $('quiz-overlay').classList.add('hidden');
      document.body.style.overflow = '';
    };
    $('quiz-overlay')?.prepend(x);
  });

  window.startQuiz = Quiz.start;

})();
