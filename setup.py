#!/usr/bin/env python3
"""
PORTAL setup.py - патчит index.html для работы с events.json и ботом.
Запусти один раз из папки сайта: python setup.py
"""
import os, shutil, re
from datetime import datetime

HTML_FILE = "index.html"
BACKUP = "index.html.bak_" + datetime.now().strftime("%Y%m%d_%H%M%S")

NEW_CSS = """
        /* Past-events slider navigation */
        .past-slider-nav {
            display: flex; align-items: center; gap: 20px; margin-bottom: 28px;
        }
        .past-slider-arrow {
            width: 48px; height: 48px; background: transparent;
            border: 1px solid var(--gray-mid); color: var(--white);
            font-size: 1.1rem; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            transition: background var(--transition), border-color var(--transition);
            font-family: var(--font); flex-shrink: 0;
        }
        .past-slider-arrow:hover { background: var(--pink); border-color: var(--pink); }
        .past-slider-arrow:disabled { opacity: 0.2; cursor: not-allowed; }
        .past-slider-arrow:disabled:hover { background: transparent; border-color: var(--gray-mid); }
        .past-slider-counter {
            font-size: 0.72rem; letter-spacing: 4px; text-transform: uppercase;
            color: rgba(255,255,255,0.45);
        }
        .past-slider-counter span { color: var(--pink); }
"""

NEW_EVENTS = '''    <section class="events" id="events">
        <div class="container">
            <div class="section-header">
                <span class="section-tag">02 / СОБЫТИЯ</span>
                <h2 class="section-title">МЕРОПРИЯТИЯ</h2>
            </div>
            <div class="tabs-nav">
                <button class="tab-btn active" data-tab="upcoming">Предстоящие</button>
                <button class="tab-btn" data-tab="past">Прошедшие</button>
            </div>
            <div class="tab-panel active" id="tab-upcoming">
                <div class="slider-container">
                    <div class="slider" id="slider-upcoming"></div>
                    <div class="slider-arrows">
                        <button class="slider-arrow slider-prev" data-target="slider-upcoming" aria-label="Назад">&#8592;</button>
                        <button class="slider-arrow slider-next" data-target="slider-upcoming" aria-label="Вперёд">&#8594;</button>
                    </div>
                </div>
                <div id="upcoming-empty" style="display:none;padding:48px 0;text-align:center;color:rgba(255,255,255,0.35);font-size:0.82rem;letter-spacing:3px;text-transform:uppercase;">
                    Предстоящих событий пока нет &mdash; следите в&nbsp;<a href="https://t.me/your_channel" target="_blank" style="color:var(--pink)">Telegram</a>
                </div>
            </div>
            <div class="tab-panel" id="tab-past">
                <div class="past-slider-container">
                    <div class="past-slider-nav" style="display:none">
                        <button class="past-slider-arrow" id="pastPrev" disabled>&#8592;</button>
                        <span class="past-slider-counter" id="pastCounter"></span>
                        <button class="past-slider-arrow" id="pastNext">&#8594;</button>
                    </div>
                    <div class="past-events-grid" id="past-events-grid"></div>
                </div>
                <div id="past-empty" style="display:none;padding:48px 0;text-align:center;color:rgba(255,255,255,0.35);font-size:0.82rem;letter-spacing:3px;text-transform:uppercase;">
                    Прошедших событий пока нет
                </div>
            </div>
        </div>
    </section>'''

def main():
    if not os.path.exists(HTML_FILE):
        print("Файл index.html не найден. Запусти из папки сайта.")
        return

    shutil.copy2(HTML_FILE, BACKUP)
    print("Резервная копия:", BACKUP)

    with open(HTML_FILE, "r", encoding="utf-8") as f:
        html = f.read()

    # 1. CSS
    html = html.replace("    </style>\n</head>", NEW_CSS + "\n    </style>\n</head>", 1)

    # 2. Events section
    start = html.find('    <section class="events" id="events">')
    end   = html.find('\n    <section class="rental"')
    if start != -1 and end != -1:
        html = html[:start] + NEW_EVENTS + html[end:]
        print("Секция событий обновлена.")
    else:
        print("ВНИМАНИЕ: секция events не найдена, пропускаю.")

    # 3. Script tag
    if "events-loader.js" not in html:
        html = html.replace("\n</body>", '\n    <script src="events-loader.js"></script>\n</body>', 1)
        print("Тег events-loader.js добавлен.")

    with open(HTML_FILE, "w", encoding="utf-8") as f:
        f.write(html)

    print("index.html обновлён!")
    print()
    print("Следующие шаги:")
    print("  1. Скопируй events.json и events-loader.js рядом с index.html")
    print("  2. В bot.py вставь BOT_TOKEN и свой ID в ADMIN_IDS")
    print("  3. pip install python-telegram-bot==20.*")
    print("  4. python bot.py")

if __name__ == "__main__":
    main()
