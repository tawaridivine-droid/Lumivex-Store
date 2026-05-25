import os
import time
import schedule
import requests
import threading
from datetime import date
from http.server import HTTPServer, BaseHTTPRequestHandler

# Setup
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
DISCORD_WEBHOOK = os.environ.get("DISCORD_WEBHOOK")
PORT = int(os.environ.get("PORT", 1000))

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

TRENDING_PRODUCTS = [
    {"title": "Portable Mini Projector 4K", "price": 49.99, "supplier_price": 18.00, "category": "Electronics", "trending_score": 9},
    {"title": "Magnetic Wireless Charger Stand", "price": 29.99, "supplier_price": 8.00, "category": "Electronics", "trending_score": 9},
    {"title": "LED Strip Lights RGB Smart", "price": 24.99, "supplier_price": 6.00, "category": "Home", "trending_score": 8},
    {"title": "Posture Corrector Back Support", "price": 34.99, "supplier_price": 9.00, "category": "Health", "trending_score": 8},
    {"title": "Viral Kitchen Gadget Set", "price": 39.99, "supplier_price": 12.00, "category": "Kitchen", "trending_score": 9},
    {"title": "Smart Watch Fitness Tracker", "price": 59.99, "supplier_price": 20.00, "category": "Electronics", "trending_score": 10},
    {"title": "Portable Blender USB Rechargeable", "price": 27.99, "supplier_price": 7.00, "category": "Kitchen", "trending_score": 8},
    {"title": "Aesthetic Neon LED Sign", "price": 44.99, "supplier_price": 14.00, "category": "Home", "trending_score": 9},
    {"title": "Wireless Earbuds Pro", "price": 39.99, "supplier_price": 12.00, "category": "Electronics", "trending_score": 9},
    {"title": "Smart Reusable Notebook", "price": 29.99, "supplier_price": 8.00, "category": "Stationery", "trending_score": 8},
]

# Simple web server to keep Render happy
class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"Lumivex Bot is running 24/7!")
    def log_message(self, format, *args):
        pass

def start_server():
    server = HTTPServer(("0.0.0.0", PORT), Handler)
    server.serve_forever()

def db_get(table, filters=""):
    url = f"{SUPABASE_URL}/rest/v1/{table}?{filters}"
    res = requests.get(url, headers=HEADERS)
    return res.json() if res.status_code == 200 else []

def db_post(table, data):
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    res = requests.post(url, headers=HEADERS, json=data)
    return res.status_code in [200, 201]

def db_patch(table, filters, data):
    url = f"{SUPABASE_URL}/rest/v1/{table}?{filters}"
    res = requests.patch(url, headers=HEADERS, json=data)
    return res.status_code in [200, 204]

def send_discord(message):
    if not DISCORD_WEBHOOK:
        print("No Discord webhook set")
        return
    try:
        requests.post(DISCORD_WEBHOOK, json={"content": message})
        print("Discord alert sent")
    except Exception as e:
        print(f"Discord error: {e}")

def find_trending_products():
    print("Bot scanning for trending products...")
    listed = 0
    for product in TRENDING_PRODUCTS:
        try:
            existing = db_get("products", f"title=eq.{product['title']}&select=id")
            if existing:
                continue
            success = db_post("products", {
                "title": product["title"],
                "price": product["price"],
                "supplier_price": product["supplier_price"],
                "category": product["category"],
                "trending_score": product["trending_score"],
                "supplier_name": "AliExpress",
                "is_active": True,
                "is_own_product": False,
                "description": f"Trending product — {product['title']}. High demand globally. Fast shipping available.",
                "seo_slug": product["title"].lower().replace(" ", "-"),
            })
            if success:
                listed += 1
                print(f"Listed: {product['title']}")
        except Exception as e:
            print(f"Error listing {product['title']}: {e}")
    return listed

def process_orders():
    print("Bot checking pending orders...")
    try:
        pending = db_get("orders", "status=eq.pending")
        processed = 0
        for order in pending:
            db_patch("orders", f"id=eq.{order['id']}", {
                "status": "processing",
                "supplier_name": "AliExpress",
                "supplier_order_id": f"AE-{order['id'][:8].upper()}",
            })
            processed += 1
        if processed > 0:
            send_discord(f"Processed {processed} pending orders automatically!")
        return processed
    except Exception as e:
        print(f"Order processing error: {e}")
        return 0

def update_portfolio(listed):
    print("Updating portfolio...")
    try:
        orders = db_get("orders", "select=total_price,profit")
        total_revenue = sum(o.get("total_price", 0) or 0 for o in orders)
        total_profit = sum(o.get("profit", 0) or 0 for o in orders)
        total_orders = len(orders)
        existing = db_get("portfolio", f"date=eq.{date.today()}")
        data = {
            "total_revenue": total_revenue,
            "total_profit": total_profit,
            "total_orders": total_orders,
            "new_products_listed": listed,
        }
        if existing:
            db_patch("portfolio", f"date=eq.{date.today()}", data)
        else:
            data["date"] = str(date.today())
            db_post("portfolio", data)
        return total_revenue, total_profit, total_orders
    except Exception as e:
        print(f"Portfolio error: {e}")
        return 0, 0, 0

def daily_report():
    print("Running daily bot cycle...")
    listed = find_trending_products()
    process_orders()
    revenue, profit, total_orders = update_portfolio(listed)
    message = f"""
**LUMIVEX STORE — DAILY BOT REPORT**
Date: {date.today()}

**Store Stats:**
Total Revenue: ${revenue:.2f}
Total Profit: ${profit:.2f}
Total Orders: {total_orders}
New Products Listed: {listed}

**Bot Status:**
Trend Hunter — Active
Auto Lister — Active
Fulfillment Bot — Active
Discord Alerts — Active

Keep driving traffic. Bot handles everything else!
    """
    send_discord(message)
    print("Daily report complete!")

def run_bot():
    print("Lumivex Bot Starting...")
    send_discord("**Lumivex Store Bot is ONLINE and running 24/7!**")
    daily_report()
    schedule.every().day.at("06:00").do(daily_report)
    schedule.every().day.at("18:00").do(daily_report)
    schedule.every(30).minutes.do(process_orders)
    while True:
        schedule.run_pending()
        time.sleep(60)

if __name__ == "__main__":
    # Start web server in background thread
    thread = threading.Thread(target=start_server)
    thread.daemon = True
    thread.start()
    print(f"Web server started on port {PORT}")
    # Run bot in main thread
    run_bot()
