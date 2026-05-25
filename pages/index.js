import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import { ShoppingCart, Search, TrendingUp, Star, Zap, Globe } from 'lucide-react'

export default function Home({ user }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState([])

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    const { data, error } = await supabase
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
        <title>Creative Store — Trending Products Worldwide</title>
        <meta name="description" content="Discover trending products from around the world. Best prices, fast shipping, automated store." />
        <meta name="keywords" content="trending products, online store, best deals, dropshipping, creative store" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Navbar */}
      <nav className="glass fixed top-0 w-full z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/">
            <h1 className="text-2xl font-900 gradient-text cursor-pointer">
              ⚡ Creative Store
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

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center pt-20 px-6">
        <div className="text-center max-w-4xl mx-auto animate-fadeIn">
          <div className="inline-block bg-primary/20 border border-primary/30 rounded-full px-4 py-2 text-sm text-primary mb-6">
            🔥 AI-Powered Trending Products Updated Daily
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
                🛍️ Shop Now
              </button>
            </Link>
            <Link href="/auth">
              <button className="glass text-white text-lg px-8 py-4 rounded-lg hover:bg-white/10 transition">
                Get Started Free
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-16 max-w-2xl mx-auto">
            <div className="glass rounded-xl p-4">
              <div className="text-3xl font-black gradient-text">24/7</div>
              <div className="text-gray-400 text-sm">Bot Active</div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="text-3xl font-black gradient-text">5 Plus</div>
              <div className="text-gray-400 text-sm">Suppliers</div>
