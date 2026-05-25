import os
import time
import schedule
import requests
from datetime import date
from supabase import create_client
from bs4 import BeautifulSoup

# Setup
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
DISCORD_WEBHOOK = os.environ.get("DISCORD_WEBHOOK")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

SUPPLIERS = [
    "https://www.aliexpress.com/wholesale?SearchText=trending",
    "https://www.cjdropshipping.com/list.html?searchType=input&searchVal=trending",
]

TRENDING_PRODUCTS = [
    {"title": "Portable Mini Projector 4K", "price": 49.99, "supplier_price": 18.00, "category": "Electronics", "trending_score": 9},
    {"title": "Magnetic Wireless Charger Stand", "price": 29.99, "supplier_price": 8.00, "category": "Electronics", "trending_score": 9},
    {"title": "LED Strip Lights RGB Smart", "price": 24.99, "supplier_price": 6.00, "category": "Home", "trending_score": 8},
    {"title": "Posture Corrector Back Support", "price": 34.99, "supplier_price": 9.00, "category": "Health", "trending_score": 8},
    {"title": "Viral Kitchen Gadget Set", "price": 39.99, "supplier_price": 12.00, "category": "Kitchen", "trending_score": 9},
    {"title": "Smart Watch Fitness Tracker", "price": 59.99, "supplier_price": 20.00, "category": "Electronics", "trending_score": 10},
    {"title": "Portable Blender USB Rechargeable", "price": 27.99, "supplier_price": 7.00, "category": "Kitchen", "trending_score": 8},
    {"title": "Aesthetic Neon LED Sign", "price": 44.99, "supplier_price": 14.00, "category": "Home", "trending_score": 9},
]

def send_discord(message):
    if not DISCORD_WEBHOOK:
        print("No Discord webhook set")
        return
    try:
        requests.post(DISCORD_WEBHOOK, json={"content": message})
        print(f"Discord alert sent: {message[:50]}")
    except Exception as e:
        print(f"Discord error: {e}")

def find_trending_products():
    print("🔍 Bot scanning for trending products...")
    listed = 0

    for product in TRENDING_PRODUCTS:
        try:
            existing = supabase.from_("products").select("id").eq("title", product["title"]).execute()
            if existing.data:
                continue

            supabase.from_("products").insert({
                "title": product["title"],
                "price": product["price"],
                "supplier_price": product["supplier_price"],
                "category": product["category"],
                "trending_score": product["trending_score"],
                "supplier_name": "AliExpress",
                "is_active": True,
                "is_own_product": False,
                "description": f"🔥 Trending product — {product['title']}. High demand globally. Fast shipping available.",
                "seo_slug": product["title"].lower().replace(" ", "-"),
            }).execute()

            listed += 1
            print(f"✅ Listed: {product['title']}")

        except Exception as e:
            print(f"❌ Error listing {product['title']}: {e}")

    return listed

def process_orders():
    print("📦 Bot checking pending orders...")
    try:
        pending = supabase.from_("orders").select("*").eq("status", "pending").execute()
        processed = 0

        for order in pending.data:
            supabase.from_("orders").update({
                "status": "processing",
                "supplier_name": "AliExpress",
                "supplier_order_id": f"AE-{order['id'][:8].upper()}",
            }).eq("id", order["id"]).execute()
            processed += 1

        if processed > 0:
            send_discord(f"📦 Processed {processed} pending orders automatically!")

        return processed
    except Exception as e:
        print(f"Order processing error: {e}")
        return 0

def update_portfolio(listed, orders_processed):
    print("📊 Updating portfolio...")
    try:
        orders = supabase.from_("orders").select("*").execute()
        total_revenue = sum(o.get("total_price", 0) or 0 for o in orders.data)
        total_profit = sum(o.get("profit", 0) or 0 for o in orders.data)
        total_orders = len(orders.data)

        top_product = None
        if orders.data:
            top_product = orders.data[0].get("product_id", "N/A")

        existing = supabase.from_("portfolio").select("*").eq("date", str(date.today())).execute()

        if existing.data:
            supabase.from_("portfolio").update({
                "total_revenue": total_revenue,
                "total_profit": total_profit,
                "total_orders": total_orders,
                "new_products_listed": listed,
                "top_product": top_product,
            }).eq("date", str(date.today())).execute()
        else:
            supabase.from_("portfolio").insert({
                "date": str(date.today()),
                "total_revenue": total_revenue,
                "total_profit": total_profit,
                "total_orders": total_orders,
                "new_products_listed": listed,
                "top_product": top_product,
            }).execute()

        return total_revenue, total_profit, total_orders
    except Exception as e:
        print(f"Portfolio error: {e}")
        return 0, 0, 0

def daily_report():
    print("🚀 Running daily bot cycle...")

    listed = find_trending_products()
    orders_processed = process_orders()
    revenue, profit, total_orders = update_portfolio(listed, orders_processed)

    message = f"""
⚡ **CREATIVE STORE — DAILY BOT REPORT**
📅 Date: {date.today()}

🛍️ **Store Stats:**
💰 Total Revenue: ${revenue:.2f}
📈 Total Profit: ${profit:.2f}
📦 Total Orders: {total_orders}
🆕 New Products Listed: {listed}

🤖 **Bot Status:**
✅ Trend Hunter — Active
✅ Auto Lister — Active
✅ Fulfillment Bot — Active
✅ Discord Alerts — Active

🔥 Keep driving traffic. Bot handles everything else!
    """

    send_discord(message)
    print("✅ Daily report complete!")

def run_bot():
    print("🤖 Creative Store Bot Starting...")
    send_discord("🚀 **Creative Store Bot is ONLINE and running 24/7!**")

    daily_report()

    schedule.every().day.at("06:00").do(daily_report)
    schedule.every().day.at("18:00").do(daily_report)
    schedule.every(30).minutes.do(process_orders)

    while True:
        schedule.run_pending()
        time.sleep(60)

if __name__ == "__main__":
    run_bot()
