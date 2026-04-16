(function () {
    var BPM = 75;
    var BEAT_MS = (60 / BPM) * 1000;
    var TOLERANCE = BEAT_MS * 0.45;
    var WIN_STREAK = Math.ceil(5000 / BEAT_MS);

    var section = document.createElement('section');
    section.id = 'rhythm-section';
    section.innerHTML = '<div class="rhythm-inner"><div class="rhythm-left"><p class="rhythm-eyebrow">ПРОВЕРЬ СЕБЯ</p><h2 class="rhythm-title">ПОПАДЁШЬ<br>В РИТМ?</h2><p class="rhythm-sub">Жми в такт кружку — 5 секунд точного ритма и получишь кое-что приятное 👀</p></div><div class="rhythm-right"><div class="rhythm-orb-wrap"><div class="rhythm-orb" id="rhythmOrb"></div><div class="rhythm-ripple"></div></div><button class="rhythm-btn" id="rhythmBtn">В ТАКТ</button><div class="rhythm-feedback" id="rhythmFeedback"></div><div class="rhythm-streak" id="rhythmStreak"></div></div></div><div class="promo-overlay" id="promoOverlay"><div class="promo-card"><div class="promo-emoji">🎉</div><h3 class="promo-title">У ТЕБЯ ТАЛАНТ!</h3><p class="promo-sub">Такие нам нужны — приходи на пробное занятие и убедись сам.</p><div class="promo-code-wrap"><span class="promo-label">ТВОЙ ПРОМОКОД</span><div class="promo-code" id="promoCode">PORTAL-XXXX</div><span class="promo-discount">−20% на любое направление</span></div><div class="promo-timer-wrap"><span class="promo-timer-label">⏱ Промокод действует:</span><span class="promo-timer" id="promoTimer">23:59:59</span></div><div class="promo-actions"><a href="https://t.me/your_manager" target="_blank" class="promo-cta">ВОСПОЛЬЗОВАТЬСЯ ПРОМОКОДОМ ↗</a><button class="promo-close" id="promoClose">Вау, спасибо! Закрыть</button></div></div></div>';

    var hero = document.getElementById('hero');
    if (hero && hero.nextSibling) {
        hero.parentNode.insertBefore(section, hero.nextSibling);
    } else {
        document.body.appendChild(section);
    }

    var style = document.createElement('style');
    style.textContent = '#rhythm-section{background:#0a0a0f;border-top:1px solid rgba(255,255,255,0.06);border-bottom:1px solid rgba(255,255,255,0.06);padding:80px 0;position:relative;overflow:hidden}#rhythm-section::before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse 60% 80% at 70% 50%,rgba(160,80,255,0.07) 0%,transparent 70%);pointer-events:none}.rhythm-inner{max-width:1100px;margin:0 auto;padding:0 40px;display:flex;align-items:center;justify-content:space-between;gap:60px}.rhythm-left{flex:1}.rhythm-eyebrow{font-size:0.68rem;letter-spacing:5px;text-transform:uppercase;color:#a050ff;margin-bottom:16px}.rhythm-title{font-size:clamp(2rem,5vw,3.2rem);font-weight:900;letter-spacing:-1px;line-height:1.05;color:#fff;margin-bottom:20px}.rhythm-sub{font-size:0.9rem;color:rgba(255,255,255,0.45);line-height:1.7}.rhythm-right{display:flex;flex-direction:column;align-items:center;gap:20px;flex-shrink:0}.rhythm-orb-wrap{position:relative;width:120px;height:120px;display:flex;align-items:center;justify-content:center}.rhythm-orb{width:80px;height:80px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#c060ff,#6020cc);box-shadow:0 0 30px rgba(160,60,255,0.5);animation:orbPulse var(--beat) ease-in-out infinite;position:relative;z-index:2}.rhythm-ripple{position:absolute;inset:10px;border-radius:50%;border:2px solid rgba(160,60,255,0.4);animation:ripple var(--beat) ease-out infinite}@keyframes orbPulse{0%{transform:scale(0.88);box-shadow:0 0 20px rgba(160,60,255,0.3)}50%{transform:scale(1.12);box-shadow:0 0 50px rgba(160,60,255,0.8),0 0 80px rgba(160,60,255,0.3)}100%{transform:scale(0.88);box-shadow:0 0 20px rgba(160,60,255,0.3)}}@keyframes ripple{0%{transform:scale(0.9);opacity:0.6}100%{transform:scale(1.8);opacity:0}}.rhythm-btn{background:transparent;border:1px solid rgba(160,60,255,0.6);color:#fff;font-size:0.72rem;font-weight:700;letter-spacing:4px;text-transform:uppercase;padding:14px 36px;cursor:pointer;transition:background 0.2s,border-color 0.2s,transform 0.08s;font-family:inherit;user-select:none;-webkit-user-select:none}.rhythm-btn:hover{background:rgba(160,60,255,0.15);border-color:#a050ff}.rhythm-btn:active{transform:scale(0.94);background:rgba(160,60,255,0.3)}.rhythm-feedback{font-size:0.78rem;letter-spacing:2px;text-transform:uppercase;height:20px;transition:color 0.2s}.rhythm-feedback.hit{color:#a050ff}.rhythm-feedback.miss{color:rgba(255,80,80,0.8)}.rhythm-streak{font-size:0.68rem;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.25);height:16px}.promo-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:9000;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(6px)}.promo-overlay.active{display:flex}.promo-card{background:#0f0f1a;border:1px solid rgba(160,60,255,0.4);box-shadow:0 0 60px rgba(160,60,255,0.2);max-width:440px;width:100%;padding:40px 36px;text-align:center;animation:promoIn 0.4s cubic-bezier(0.34,1.56,0.64,1)}@keyframes promoIn{from{transform:scale(0.7);opacity:0}to{transform:scale(1);opacity:1}}.promo-emoji{font-size:2.5rem;margin-bottom:12px}.promo-title{font-size:1.6rem;font-weight:900;letter-spacing:2px;color:#fff;margin-bottom:10px}.promo-sub{font-size:0.85rem;color:rgba(255,255,255,0.5);line-height:1.6;margin-bottom:24px}.promo-code-wrap{background:rgba(160,60,255,0.1);border:1px solid rgba(160,60,255,0.3);padding:16px 20px;margin-bottom:16px}.promo-label{display:block;font-size:0.6rem;letter-spacing:4px;text-transform:uppercase;color:rgba(255,255,255,0.35);margin-bottom:6px}.promo-code{font-size:1.6rem;font-weight:900;letter-spacing:6px;color:#c060ff;margin-bottom:4px}.promo-discount{font-size:0.72rem;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.5)}.promo-timer-wrap{display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:24px;font-size:0.78rem;color:rgba(255,255,255,0.4)}.promo-timer{color:#ff6060;font-weight:700;font-size:0.9rem;letter-spacing:2px}.promo-actions{display:flex;flex-direction:column;gap:10px}.promo-cta{display:block;background:linear-gradient(135deg,#a050ff,#6020cc);color:#fff;text-decoration:none;font-size:0.72rem;font-weight:700;letter-spacing:3px;text-transform:uppercase;padding:16px 24px;transition:opacity 0.2s,transform 0.2s}.promo-cta:hover{opacity:0.85;transform:translateY(-2px)}.promo-close{background:none;border:none;color:rgba(255,255,255,0.3);font-size:0.75rem;cursor:pointer;font-family:inherit;padding:8px;transition:color 0.2s}.promo-close:hover{color:rgba(255,255,255,0.6)}';
    document.head.appendChild(style);

    document.getElementById('rhythm-section').style.setProperty('--beat', BEAT_MS + 'ms');

    var btn = document.getElementById('rhythmBtn');
    var feedback = document.getElementById('rhythmFeedback');
    var streakEl = document.getElementById('rhythmStreak');
    var overlay = document.getElementById('promoOverlay');
    var closeBtn = document.getElementById('promoClose');
    var codeEl = document.getElementById('promoCode');
    var timerEl = document.getElementById('promoTimer');

    var streak = 0;
    var won = false;
    var timerInterval = null;
    var startTime = performance.now();

    function generateCode() {
        var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        var code = 'PORTAL-';
        for (var i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
        return code;
    }

    function startPromoTimer() {
        var total = 24 * 3600;
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(function () {
            total--;
            if (total <= 0) { clearInterval(timerInterval); total = 0; }
            var h = Math.floor(total / 3600);
            var m = Math.floor((total % 3600) / 60);
            var s = total % 60;
            timerEl.textContent = String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
        }, 1000);
    }

    function showPromo() {
        var code = generateCode();
        codeEl.textContent = code;
        overlay.classList.add('active');
        startPromoTimer();
        document.body.style.overflow = 'hidden';
        fetch('/promo-notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code })
        }).catch(function(){});
    }

    closeBtn.addEventListener('click', function () {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    });

    function onTap() {
        if (won) return;
        var elapsed = (performance.now() - startTime) % BEAT_MS;
        var distToPeak = Math.abs(elapsed - BEAT_MS * 0.5);
        if (distToPeak > BEAT_MS / 2) distToPeak = BEAT_MS - distToPeak;

        if (distToPeak <= TOLERANCE) {
            streak++;
            feedback.textContent = streak >= WIN_STREAK ? '🔥 ИДЕАЛЬНО!' : '✓ В ТАКТ';
            feedback.className = 'rhythm-feedback hit';
            streakEl.textContent = streak + ' / ' + WIN_STREAK + ' ПОПАДАНИЙ';
            if (streak >= WIN_STREAK) { won = true; setTimeout(showPromo, 400); }
        } else {
            streak = 0;
            feedback.textContent = '✗ МИМО';
            feedback.className = 'rhythm-feedback miss';
            streakEl.textContent = '';
        }
    }

    btn.addEventListener('click', onTap);
})();
