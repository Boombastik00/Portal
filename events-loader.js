/**
 * PORTAL Dance Center — Events Loader
 * Загружает события из events.json, автоматически сортирует на предстоящие/прошедшие,
 * рендерит карточки и управляет пагинацией прошедших событий.
 *
 * Подключить в index.html ПОСЛЕ script.js:
 *   <script src="events-loader.js"></script>
 */

(function () {
    'use strict';

    const PAST_PER_PAGE = 4; // сколько прошедших событий показывать за раз (2×2)
    let pastEvents  = [];
    let pastPage    = 1;
    let pastTotal   = 0;

    // ── Утилиты ────────────────────────────────────────────────

    /** Форматируем дату для карточки предстоящего события */
    function formatUpcomingDate(dateStr) {
        const d = new Date(dateStr + 'T00:00:00');
        const months = [
            'января','февраля','марта','апреля','мая','июня',
            'июля','августа','сентября','октября','ноября','декабря'
        ];
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    }

    /** Сколько дней до события */
    function daysUntil(dateStr) {
        const now   = new Date(); now.setHours(0, 0, 0, 0);
        const event = new Date(dateStr + 'T00:00:00');
        return Math.ceil((event - now) / 86400000);
    }

    /** Экранирование HTML */
    function esc(str) {
        const d = document.createElement('div');
        d.textContent = str || '';
        return d.innerHTML;
    }

    // ── Рендер карточки предстоящего события ──────────────────

    function renderUpcomingCard(event) {
        const days = daysUntil(event.date);
        let label;
        if      (days === 0) label = 'Сегодня!';
        else if (days === 1) label = 'Завтра';
        else if (days <= 7)  label = `Через ${days} дн.`;
        else                 label = formatUpcomingDate(event.date);

        const photo = event.photo
            ? `url('${esc(event.photo)}')`
            : 'linear-gradient(135deg,#1a0a2e,#0d0d1a)';

        return `
        <div class="event-card">
            <div class="event-img" style="background-image:${photo}"></div>
            <div class="event-body">
                <p class="event-date">${esc(label)}</p>
                <h3 class="event-title">${esc(event.title)}</h3>
                <p class="event-desc">${esc(event.description)}</p>
                <a href="https://t.me/your_channel" target="_blank"
                   class="btn-outline" style="margin-top:8px">Следить в TG</a>
            </div>
        </div>`;
    }

    // ── Рендер карточки прошедшего события ────────────────────

    function renderPastCard(event) {
        const photo = event.photo
            ? `url('${esc(event.photo)}')`
            : 'linear-gradient(135deg,#1a0a2e,#0d0d1a)';

        return `
        <div class="past-event-card">
            <div class="past-event-img" style="background-image:${photo}">
                <div class="past-event-img-overlay"></div>
                <div class="past-event-label">${esc(event.date_display || formatUpcomingDate(event.date))}</div>
            </div>
            <div class="past-event-body">
                <h3 class="past-event-title">${esc(event.title)}</h3>
                <p class="past-event-desc">${esc(event.description)}</p>
            </div>
        </div>`;
    }

    // ── Рендер страницы прошедших событий ─────────────────────

    function renderPastPage(page) {
        const grid    = document.getElementById('past-events-grid');
        const counter = document.getElementById('pastCounter');
        const prevBtn = document.getElementById('pastPrev');
        const nextBtn = document.getElementById('pastNext');
        if (!grid) return;

        const totalPages = Math.ceil(pastTotal / PAST_PER_PAGE);
        const start      = (page - 1) * PAST_PER_PAGE;
        const slice      = pastEvents.slice(start, start + PAST_PER_PAGE);

        grid.innerHTML = slice.map(renderPastCard).join('');

        if (counter) {
            counter.innerHTML = `<span>${page}</span> / ${totalPages}`;
        }
        if (prevBtn) prevBtn.disabled = (page === 1);
        if (nextBtn) nextBtn.disabled = (page >= totalPages);

        pastPage = page;
    }

    // ── Инициализация секции событий ──────────────────────────

    function initEvents(data) {
        const today    = new Date(); today.setHours(0, 0, 0, 0);
        const events   = data.events || [];

        const upcoming = [];
        const past     = [];

        events.forEach(function(e) {
            const d = new Date(e.date + 'T00:00:00');
            (d >= today ? upcoming : past).push(e);
        });

        // Сортируем: ближайшие — первыми; прошедшие — свежие первыми
        upcoming.sort(function(a, b) { return a.date.localeCompare(b.date); });
        past.sort(function(a, b)     { return b.date.localeCompare(a.date); });

        // ── Предстоящие ──
        const upcomingSlider = document.getElementById('slider-upcoming');
        const upcomingEmpty  = document.getElementById('upcoming-empty');
        const sliderCont     = upcomingSlider && upcomingSlider.closest('.slider-container');

        if (upcomingSlider) {
            if (upcoming.length === 0) {
                if (sliderCont) sliderCont.style.display = 'none';
                if (upcomingEmpty) upcomingEmpty.style.display = '';
            } else {
                upcomingSlider.innerHTML = upcoming.map(renderUpcomingCard).join('');
                if (sliderCont) sliderCont.style.display = '';
                if (upcomingEmpty) upcomingEmpty.style.display = 'none';
            }
        }

        // ── Прошедшие ──
        pastEvents = past;
        pastTotal  = past.length;

        const pastEmpty = document.getElementById('past-empty');
        const pastNav   = document.querySelector('.past-slider-nav');

        if (pastTotal === 0) {
            if (pastEmpty) pastEmpty.style.display = '';
            if (pastNav)   pastNav.style.display   = 'none';
        } else {
            if (pastEmpty) pastEmpty.style.display = 'none';

            // Скрываем стрелки если событий не больше одной страницы
            if (pastNav) {
                pastNav.style.display = (pastTotal > PAST_PER_PAGE) ? '' : 'none';
            }
            renderPastPage(1);
        }

        // Кнопки пагинации прошедших
        const prevBtn = document.getElementById('pastPrev');
        const nextBtn = document.getElementById('pastNext');

        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                if (pastPage > 1) renderPastPage(pastPage - 1);
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                var totalPages = Math.ceil(pastTotal / PAST_PER_PAGE);
                if (pastPage < totalPages) renderPastPage(pastPage + 1);
            });
        }
    }

    // ── Загрузка events.json ───────────────────────────────────

    function loadEvents() {
        fetch('events.json?_=' + Date.now())
            .then(function(r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            })
            .then(function(data) { initEvents(data); })
            .catch(function(err) {
                console.warn('[PORTAL] Не удалось загрузить events.json:', err);
                var upEl = document.getElementById('upcoming-empty');
                var paEl = document.getElementById('past-empty');
                var slCont = document.querySelector('#tab-upcoming .slider-container');
                if (slCont) slCont.style.display = 'none';
                if (upEl)   upEl.style.display   = '';
                if (paEl)   paEl.style.display   = '';
            });
    }

    // Запускаем после загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadEvents);
    } else {
        loadEvents();
    }

})();
