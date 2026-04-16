"""
PORTAL Dance Center — Telegram Bot для управления событиями
============================================================
Запуск: python bot.py
Зависимости: pip install python-telegram-bot==20.*

Команды:
  /add    — добавить новое событие (диалог)
  /list   — список всех событий с ID
  /delete — удалить событие по ID
  /cancel — отменить текущий диалог
"""

import json
import os
import uuid
import logging
from datetime import datetime
from pathlib import Path

from telegram import Update, ReplyKeyboardRemove
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    ConversationHandler,
    filters,
    ContextTypes,
)

# ─────────────────────────────────────────────────────────────
#  НАСТРОЙКИ — отредактируй перед запуском
# ─────────────────────────────────────────────────────────────

BOT_TOKEN = "8223084229:AAHsHWBJrBF6z1T6dB0TAp4tNQU5ITnZ2yc"           # Получить у @BotFather
ADMIN_IDS = [8087798647]                  # Telegram user ID администраторов
EVENTS_FILE = "events.json"             # Путь к файлу данных (рядом с сайтом)
PHOTOS_DIR  = "img"                     # Папка для фото событий

# ─────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# Состояния диалога /add
TITLE, DESCRIPTION, PHOTO, DATE = range(4)

MONTHS_RU = {
    1: "января",  2: "февраля",  3: "марта",    4: "апреля",
    5: "мая",     6: "июня",     7: "июля",      8: "августа",
    9: "сентября",10: "октября", 11: "ноября",  12: "декабря",
}


# ── helpers ──────────────────────────────────────────────────

def load_events() -> dict:
    if not os.path.exists(EVENTS_FILE):
        return {"events": []}
    with open(EVENTS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def save_events(data: dict) -> None:
    with open(EVENTS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def is_admin(user_id: int) -> bool:
    return not ADMIN_IDS or user_id in ADMIN_IDS


# ── /start ───────────────────────────────────────────────────

async def cmd_start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(
        "👋 Привет! Я бот управления событиями *PORTAL*.\n\n"
        "📋 Команды:\n"
        "  /add — добавить новое событие\n"
        "  /list — посмотреть список событий\n"
        "  /delete `<id>` — удалить событие\n"
        "  /cancel — отменить текущий диалог",
        parse_mode="Markdown",
    )


# ── /add ─────────────────────────────────────────────────────

async def add_start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    if not is_admin(update.effective_user.id):
        await update.message.reply_text("⛔ У вас нет доступа к этой команде.")
        return ConversationHandler.END

    context.user_data.clear()
    await update.message.reply_text(
        "📝 *Добавление нового события*\n\n"
        "Шаг 1/4 — Введите *название* события:\n"
        "_(или /cancel для отмены)_",
        parse_mode="Markdown",
    )
    return TITLE


async def add_title(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    context.user_data["title"] = update.message.text.strip()
    await update.message.reply_text(
        "✍️ Шаг 2/4 — Введите *описание* события:",
        parse_mode="Markdown",
    )
    return DESCRIPTION


async def add_description(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    context.user_data["description"] = update.message.text.strip()
    await update.message.reply_text(
        "📸 Шаг 3/4 — Отправьте *фото* события\n"
        "_(или /skip чтобы пропустить)_",
        parse_mode="Markdown",
    )
    return PHOTO


async def add_photo(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Получаем фото, сохраняем на диск."""
    os.makedirs(PHOTOS_DIR, exist_ok=True)

    event_id = uuid.uuid4().hex[:8]
    filename = f"event_{event_id}.jpg"
    filepath = os.path.join(PHOTOS_DIR, filename)

    photo_file = await update.message.photo[-1].get_file()  # наивысшее разрешение
    await photo_file.download_to_drive(filepath)

    context.user_data["photo"]    = f"img/{filename}"
    context.user_data["event_id"] = event_id

    await update.message.reply_text(
        "📅 Шаг 4/4 — Введите *дату* события в формате `ДД.ММ.ГГГГ`\n"
        "Например: `15.04.2026`",
        parse_mode="Markdown",
    )
    return DATE


async def skip_photo(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    context.user_data["photo"]    = ""
    context.user_data["event_id"] = uuid.uuid4().hex[:8]
    await update.message.reply_text(
        "📅 Шаг 4/4 — Введите *дату* события в формате `ДД.ММ.ГГГГ`\n"
        "Например: `15.04.2026`",
        parse_mode="Markdown",
    )
    return DATE


async def add_date(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    date_str = update.message.text.strip()

    try:
        date_obj = datetime.strptime(date_str, "%d.%m.%Y")
    except ValueError:
        await update.message.reply_text(
            "❌ Неверный формат. Используйте `ДД.ММ.ГГГГ`, например `15.04.2026`\n"
            "Попробуйте ещё раз:",
            parse_mode="Markdown",
        )
        return DATE

    date_display = f"{date_obj.day} {MONTHS_RU[date_obj.month]}"

    event = {
        "id":          context.user_data["event_id"],
        "title":       context.user_data["title"],
        "description": context.user_data["description"],
        "photo":       context.user_data["photo"],
        "date":        date_obj.strftime("%Y-%m-%d"),
        "date_display": date_display,
        "created_at":  datetime.now().isoformat(),
    }

    data = load_events()
    data["events"].append(event)
    save_events(data)

    preview_desc = event["description"]
    if len(preview_desc) > 120:
        preview_desc = preview_desc[:120] + "…"

    await update.message.reply_text(
        "✅ *Событие добавлено!*\n\n"
        f"🎉 *{event['title']}*\n"
        f"📅 {date_display} ({date_obj.strftime('%Y-%m-%d')})\n"
        f"📝 {preview_desc}\n\n"
        f"🆔 `{event['id']}`",
        parse_mode="Markdown",
    )

    context.user_data.clear()
    return ConversationHandler.END


async def add_cancel(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    context.user_data.clear()
    await update.message.reply_text(
        "❌ Добавление события отменено.",
        reply_markup=ReplyKeyboardRemove(),
    )
    return ConversationHandler.END


# ── /list ────────────────────────────────────────────────────

async def cmd_list(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    data   = load_events()
    events = data.get("events", [])

    if not events:
        await update.message.reply_text("📭 Список событий пуст.")
        return

    today    = datetime.now().date()
    upcoming = []
    past     = []

    for e in events:
        try:
            d = datetime.strptime(e["date"], "%Y-%m-%d").date()
            (upcoming if d >= today else past).append(e)
        except Exception:
            upcoming.append(e)

    msg = "📋 *Список событий:*\n\n"

    if upcoming:
        msg += "🔜 *Предстоящие:*\n"
        for e in sorted(upcoming, key=lambda x: x["date"]):
            msg += f"  • `{e['id']}` — *{e['title']}*  _{e.get('date_display', e['date'])}_\n"
        msg += "\n"

    if past:
        msg += "✅ *Прошедшие:*\n"
        for e in sorted(past, key=lambda x: x["date"], reverse=True):
            msg += f"  • `{e['id']}` — *{e['title']}*  _{e.get('date_display', e['date'])}_\n"

    await update.message.reply_text(msg, parse_mode="Markdown")


# ── /delete ──────────────────────────────────────────────────

async def cmd_delete(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not is_admin(update.effective_user.id):
        await update.message.reply_text("⛔ У вас нет доступа к этой команде.")
        return

    if not context.args:
        await update.message.reply_text(
            "Использование: `/delete <id>`\n"
            "Посмотреть ID событий: /list",
            parse_mode="Markdown",
        )
        return

    event_id = context.args[0]
    data     = load_events()
    before   = len(data["events"])
    data["events"] = [e for e in data["events"] if e["id"] != event_id]

    if len(data["events"]) < before:
        save_events(data)
        await update.message.reply_text(
            f"✅ Событие `{event_id}` удалено.", parse_mode="Markdown"
        )
    else:
        await update.message.reply_text(
            f"❌ Событие с ID `{event_id}` не найдено.\nПроверь: /list",
            parse_mode="Markdown",
        )


# ── main ─────────────────────────────────────────────────────

def main() -> None:
    _app = None

def get_app():
    return _app

async def notify_promo(code: str) -> None:
    if _app is None:
        return
    msg = f"🎟 *Новый промокод с сайта!*\n\n`{code}`\n\nКто-то выбил ритм-игру 🎉"
    for admin_id in ADMIN_IDS:
        try:
            await _app.bot.send_message(chat_id=admin_id, text=msg, parse_mode="Markdown")
        except Exception as e:
            logger.warning(f"Ошибка уведомления: {e}")

def main() -> None:
    global _app
    _app = Application.builder().token(BOT_TOKEN).build()

    conv = ConversationHandler(
        entry_points=[CommandHandler("add", add_start)],
        states={
            TITLE:       [MessageHandler(filters.TEXT & ~filters.COMMAND, add_title)],
            DESCRIPTION: [MessageHandler(filters.TEXT & ~filters.COMMAND, add_description)],
            PHOTO: [
                MessageHandler(filters.PHOTO, add_photo),
                CommandHandler("skip", skip_photo),
            ],
            DATE: [MessageHandler(filters.TEXT & ~filters.COMMAND, add_date)],
        },
        fallbacks=[CommandHandler("cancel", add_cancel)],
    )

    _app.add_handler(CommandHandler("start",  cmd_start))
    _app.add_handler(CommandHandler("list",   cmd_list))
    _app.add_handler(CommandHandler("delete", cmd_delete))
    _app.add_handler(conv)

    logger.info("PORTAL Bot запущен. Ожидаю команды…")
    _app.run_polling(drop_pending_updates=True)


if __name__ == "__main__":
    main()
