import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import { ShoppingCart, Search, TrendingUp, Zap, Globe, Star } from 'lucide-react'

export default function Home({ user }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState([])

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('trending_score', { ascending: false })
    if (data) setProducts(data)
    setLoading(false)
  }

  const filteredProducts = products.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase())
  )

  const addToCart = (product) => {
    setCart([...cart, product])
  }

  return (
    <>
      <Head>
        <title>Lumivex Store — Trending Products Worldwide</title>
        <meta name="description" content="Discover trending products from around the world. Best prices, fast shipping. Lumivex Store." />
        <meta name="keywords" content="trending products, online store, best deals, lumivex store" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <nav className="glass fixed top-0 w-full z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/">
            <h1 className="text-2xl font-black gradient-text cursor-pointer">
              Lumivex Store
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-primary w-64"
              />
            </div>
            <div className="relative cursor-pointer">
              <ShoppingCart className="text-white" size={24} />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </div>
            {user ? (
              <Link href="/dashboard">
                <button className="btn-primary text-sm">Dashboard</button>
              </Link>
            ) : (
              <Link href="/auth">
                <button className="btn-primary text-sm">Login</button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <section className="min-h-screen flex items-center justify-center pt-20 px-6">
        <div className="text-center max-w-4xl mx-auto animate-fadeIn">
          <div className="inline-block bg-primary/20 border border-primary/30 rounded-full px-4 py-2 text-sm text-primary mb-6">
            AI-Powered Trending Products Updated Daily
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6">
            Shop What The
            <span className="gradient-text"> World Is Buying</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Our AI bot scans the internet 24/7 to find products people are spending thousands on. Get them first. Get them here.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/products">
              <button className="btn-primary text-lg px-8 py-4">
                Shop Now
              </button>
            </Link>
            <Link href="/auth">
              <button className="glass text-white text-lg px-8 py-4 rounded-lg hover:bg-white/10 transition">
                Get Started Free
              </button>
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-6 mt-16 max-w-2xl mx-auto">
            <div className="glass rounded-xl p-4">
              <div className="text-3xl font-black gradient-text">24/7</div>
              <div className="text-gray-400 text-sm">Bot Active</div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="text-3xl font-black gradient-text">5 Plus</div>
              <div className="text-gray-400 text-sm">Suppliers</div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="text-3xl font-black gradient-text">$0</div>
              <div className="text-gray-400 text-sm">Inventory Cost</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-12">
            Why <span className="gradient-text">Lumivex Store?</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Zap size={32} />, title: "AI Trend Detection", desc: "Bot scans Amazon, TikTok, Pinterest daily to find winning products automatically" },
              { icon: <Globe size={32} />, title: "Global Suppliers", desc: "5 suppliers worldwide. If one runs out, another fulfills automatically. Zero delays." },
              { icon: <Star size={32} />, title: "Automated Fulfillment", desc: "Orders processed automatically. Customers notified instantly. You just collect profit." },
            ].map((f, i) => (
              <div key={i} className="glass rounded-2xl p-6 hover:border-primary/50 transition product-card">
                <div className="text-primary mb-4">{f.icon}</div>
                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-gray-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-12">
            <TrendingUp className="text-primary" size={32} />
            <h2 className="text-4xl font-black">
              Trending <span className="gradient-text">Right Now</span>
            </h2>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="glass rounded-2xl h-64 animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-2xl font-bold mb-2">Bot is Finding Products...</h3>
              <p className="text-gray-400">Our AI is scanning the internet for trending products. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="glass rounded-2xl overflow-hidden product-card cursor-pointer">
                  <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-6xl">📦</span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-sm mb-2 line-clamp-2">{product.title}</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-primary font-black">${product.price}</span>
                      <button
                        onClick={() => addToCart(product)}
                        className="bg-primary/20 hover:bg-primary text-white text-xs px-3 py-1 rounded-full transition"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="glass mt-20 py-10 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl font-black gradient-text mb-2">Lumivex Store</h2>
          <p className="text-gray-400 text-sm">AI-Powered Automated Dropshipping Store</p>
          <p className="text-gray-600 text-xs mt-4">2025 Lumivex Store. All rights reserved.</p>
        </div>
      </footer>
    </>
  )
}
