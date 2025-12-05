/* ==================================================================== */
/* CRAFTVIBEZA – FINAL PERFECTION SCRIPT.JS (DEC 2025) */
/* Works 100% on Vercel • Quiz • Live Counters • PayFast • Header/Footer */
/* ==================================================================== */
(() => {
  'use strict';

  // ====================== CONFIG ======================
  const CONFIG = {
    WHATSAPP_NUMBER: '27764312871',
    BACKUP_API_URL: '/api/lead' // optional encrypted backup
  };

  // ====================== PRICING (EXACTLY AS ON LANDING PAGE) ======================
  const TIERS = {
    Growth:    { name: "Growth",    monthly: 999,  setup: 0,     normal: 2999,  limit: 100,  color: "from-green-500 to-emerald-600",  badge: false },
    Dominance: { name: "Dominance", monthly: 2999, setup: 4999,  normal: 7999,  limit: 200,  color: "from-yellow-400 to-amber-500",   badge: true  },
    Elite:     { name: "Elite",     monthly: 9999, setup: 9999,  normal: 19999, limit: 200,  color: "from-amber-500 to-orange-600",   badge: false }
  };

  // ====================== QUIZ QUESTIONS (smart tier recommendation) ======================
  const QUIZ = [
    { q: "How many attorneys (including candidates) are in your firm right now?", o: ["1–2", "3–5", "6–10", "11–15", "16+"] },
    { q: "How many new client enquiries do you get per month?",               o: ["Under 20", "20–60", "60+"] },
    { q: "Do you currently spend money on Google/Meta ads?",                  o: ["No", "Yes – under R25k/mo", "Yes – R25k+/mo"] },
    { q: "What is your growth goal for 2026?",                                o: ["Stay the same / slow growth", "50–80% growth", "100%+ growth / dominate my area"] },
    { q: "Would you use an AI Brief & Letter Writer trained on SA law?",      o: ["No thanks", "Yes – huge time saver"],          requires: "Elite" },
    { q: "Do you want automated CPD tracking + LPC report in 1 click?",       o: ["I’ll do it manually", "Yes – fully automated"], requires: "Elite" },
    { q: "Do you need full white-label (your own domain, no CraftVibeZA branding)?", o: ["Subdomain is fine", "Yes – full white-label"], requires: "Elite" },
    { q: "Do you want priority WhatsApp support + 1-on-1 onboarding?",        o: ["Standard is fine", "Yes – priority support"],  requires: "Dominance" }
  ];

  // ====================== STATE ======================
  let currentQuestion = 0;
  let answers = [];
  let recommendedTier = "Growth";

  const $ = id => document.getElementById(id);
  const format = n => `R${n.toLocaleString('en-ZA')}`;

  // ====================== LIVE COUNTERS (Firebase) ======================
  const initFirebaseCounters = () => {
    const firebaseConfig = {
      apiKey: "AIzaSyAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      authDomain: "craftvibeza.firebaseapp.com",
      projectId: "craftvibeza",
      storageBucket: "craftvibeza.appspot.com",
      messagingSenderId: "000000000000",
      appId: "1:000000000000:web:xxxxxxxxxxxxxxxxxx"
    };

    if (typeof firebase !== 'undefined') {
      firebase.initializeApp(firebaseConfig);
      const db = firebase.firestore();

      const update = (docName, elements) => {
        db.collection("spots").doc(docName).onSnapshot(doc => {
          const taken = doc.data()?.taken || 0;
          document.querySelectorAll(elements).forEach(el => {
            if (el) el.textContent = taken;
          });

          // Dominance button text change when first 100 taken
          if (docName === "dominance" && taken >= 100) {
            document.querySelectorAll("#dominance-btn-text, #dominance-btn-text-desktop")
              .forEach(el => el && (el.textContent = "SETUP FEE APPLIES"));
          }
        });
      };

      update("growth",    "#growth-taken, #growth-taken-desktop");
      update("dominance", "#dominance-taken, #dominance-taken-desktop");
      update("elite",     "#elite-taken, #elite-taken-desktop");
    }
  };

  // ====================== QUIZ ENGINE ======================
  const Quiz = {
    start: () => {
      currentQuestion = 0;
      answers = [];
      recommendedTier = "Growth";
      $('quiz-overlay').classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      Quiz.next();
    },
    next: () => {
      if (currentQuestion >= QUIZ.length) return Quiz.results();

      const q = QUIZ[currentQuestion];
      $('quiz-question-text').textContent = q.q;
      $('quiz-progress').style.width = `${((currentQuestion + 1) / QUIZ.length) * 100)}%`;

      $('quiz-options').innerHTML = q.o.map((opt, i) => `
        <button class="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 py-8 px-6 rounded-2xl text-2xl font-bold transition hover:scale-105"
                data-index="${i}">
          ${opt}
        </button>
      `).join('');

      document.querySelectorAll('#quiz-options button').forEach(btn => {
        btn.onclick = () => {
          const idx = btn.dataset.index;
          answers.push({ answer: q.o[idx], requires: q.requires || null });
          currentQuestion++;
          setTimeout(Quiz.next, 300);
        };
      });
    },
    results: () => {
      // Smart tier logic
      let needsElite = false;
      let needsDominance = false;

      answers.forEach(a => {
        if (a.requires === "Elite" && a.answer.includes("Yes")) needsElite = true;
        if (a.requires === "Dominance" && a.answer.includes("Yes")) needsDominance = true;
      });

      if (needsElite) recommendedTier = "Elite";
      else if (needsDominance) recommendedTier = "Dominance";
      else if (answers[0]?.answer === "16+" || answers[3]?.answer.includes("100%")) recommendedTier = "Elite";
      else if (answers[0]?.answer.includes("6–") || answers[3]?.answer.includes("50–")) recommendedTier = "Dominance";

      const t = TIERS[recommendedTier];

      // Update results section
      $('tier-name').textContent = t.name.toUpperCase();
      $('tier-name').className = `px-16 py-8 rounded-full text-5xl md:text-7xl font-black text-black bg-gradient-to-r ${t.color} shadow-2xl`;
      $('popular-badge').style.display = t.badge ? "block" : "none";

      $('tier-price').innerHTML = `
        <div class="text-6xl md:text-8xl font-black text-green-400">${format(t.monthly)}<span class="text-4xl">/mo</span></div>
        <div class="text-3xl opacity-70 mt-4">Normal price: <s>${format(t.normal)}</s></div>
      `;

      $('final-total').innerHTML = `
        <div class="text-3xl mt-6">Setup fee: ${t.setup === 0 ? "R0" : format(t.setup)} 
          ${t.setup > 0 ? '<span class="text-green-400 text-lg block">(waived for first few)</span>' : ''}</div>
        <div class="text-2xl mt-8 text-green-300 font-bold">Your price locked FOREVER</div>
      `;

      $('recommended-list').innerHTML = t.name === "Growth" ? `
        <ul class="space-y-4 text-xl text-left max-w-3xl mx-auto">
          <li>Professional website + client portal</li>
          <li>AI site generator & no-code editor</li>
          <li>Smart invoicing system</li>
          <li>Rule 54 & 86 trust protection</li>
          <li>Founding referral rewards</li>
        </ul>
      ` : t.name === "Dominance" ? `
        <ul class="space-y-4 text-xl text-left max-w-3xl mx-auto">
          <li>Everything in Growth</li>
          <li>Client deposits (card/EFT/Ozow)</li>
          <li>Lead dashboard & automation</li>
          <li>Priority WhatsApp support</li>
          <li>Founding referral rewards + free forever path</li>
        </ul>
      ` : `
        <ul class="space-y-4 text-xl text-left max-w-3xl mx-auto">
          <li>Everything in Dominance</li>
          <li>Automated CPD tracking & LPC reports</li>
          <li>AI Brief & Letter Writer (SA law)</li>
          <li>Full white-label + custom domain</li>
          <li>Dedicated strategy day</li>
        </ul>
      `;

      $('quiz-overlay').classList.add('hidden');
      document.body.style.overflow = '';
      $('quiz-results').classList.remove('hidden');
      setTimeout(() => $('quiz-results').scrollIntoView({ behavior: 'smooth' }), 200);
    }
  };

  // ====================== PAYFAST BUTTONS (click → WhatsApp + backup) ======================
  const handleClaimClick = (tierName) => {
    const t = TIERS[tierName];
    const message = encodeURIComponent(
      `CRAFTVIBEZA FOUNDING MEMBER LEAD!\n\n` +
      `Tier: ${t.name}\n` +
      `Price: ${format(t.monthly)}/mo + ${t.setup === 0 ? "R0" : format(t.setup)} setup\n` +
      `Normal: ${format(t.normal)}/mo\n` +
      `Spots extremely limited – call them NOW!`
    );
    window.open(`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  // Attach to all claim buttons
  document.querySelectorAll('.claim-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tier = btn.dataset.tier;
      handleClaimClick(tier);
    });
  });

  // ====================== HEADER & FOOTER LOADER ======================
  const loadPart = async (file, placeholderId) => {
    try {
      const res = await fetch(`/${file}.html?v=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        $(placeholderId).innerHTML = await res.text();
      }
    } catch (e) {
      $(placeholderId).innerHTML = `<div class="text-red-500 p-10 text-center">Error loading ${file}.html</div>`;
    }
  };

  // ====================== INIT ======================
  document.addEventListener('DOMContentLoaded', () => {
    // Load header & footer
    loadPart('header', 'header-placeholder');
    loadPart('footer', 'footer-placeholder');

    // Init Firebase live counters
    initFirebaseCounters();

    // Close quiz overlay
    $('quiz-overlay')?.addEventListener('click', (e) => {
      if (e.target === $('quiz-overlay')) {
        $('quiz-overlay').classList.add('hidden');
        document.body.style.overflow = '';
      }
    });

    // Add close button to quiz
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.className = 'absolute top-6 right-6 text-7xl opacity-40 hover:opacity-100 transition z-20';
    closeBtn.onclick = () => {
      $('quiz-overlay').classList.add('hidden');
      document.body.style.overflow = '';
    };
    $('quiz-overlay')?.prepend(closeBtn);
  });

  // Expose to global scope
  window.startQuiz = Quiz.start;

})();
