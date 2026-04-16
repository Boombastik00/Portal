import http.server, json, os, urllib.request, urllib.parse

BOT_TOKEN = "8223084229:AAHsHWBJrBF6z1T6dB0TAp4tNQU5ITnZ2yc"
ADMIN_ID  = 8087798647  # твой Telegram ID

SITE_DIR  = os.path.dirname(os.path.abspath(__file__))

def notify(code):
    text = urllib.parse.quote(f"🎟 Сгенерировался промокод: {code}")
    url  = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage?chat_id={ADMIN_ID}&text={text}"
    try: urllib.request.urlopen(url, timeout=5)
    except: pass

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=SITE_DIR, **kw)

    def do_POST(self):
        if self.path == '/promo-notify':
            length = int(self.headers.get('Content-Length', 0))
            data   = json.loads(self.rfile.read(length))
            notify(data.get('code', '???'))
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b'ok')
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, *a): pass  # тишина в терминале

if __name__ == '__main__':
    import threading
    def run_server():
        print("Сервер запущен: http://localhost:8080")
        http.server.HTTPServer(('', 8080), Handler).serve_forever()
    threading.Thread(target=run_server, daemon=True).start()
    print("Запускаю бота...")
    import bot as portal_bot
    portal_bot.main()
