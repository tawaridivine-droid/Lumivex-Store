import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import { ShoppingCart, Search, Filter, TrendingUp, Star } from 'lucide-react'
import { useRouter } from 'next/router'

export default function Products({ user }) {
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [cart, setCart] = useState([])
  const [notification, setNotification] = useState('')

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

  const filteredProducts = products.filter(p => {
    const matchSearch = p.title?.toLowerCase().includes(search.toLowerCase())
    const matchCategory = category === 'all' || p.category === category
    return matchSearch && matchCategory
  })

  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))]

  const addToCart = (product) => {
    setCart([...cart, product])
    setNotification(`✅ ${product.title} added to cart!`)
    setTimeout(() => setNotification(''), 3000)
  }

  return (
    <>
      <Head>
        <title>All Products — Creative Store</title>
        <meta name="description" content="Browse all trending products on Creative Store. AI-curated products updated daily." />
      </Head>

      {/* Navbar */}
      <nav className="glass fixed top-0 w-full z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/">
            <h1 className="text-2xl font-black gradient-text cursor-pointer">⚡ Creative Store</h1>
          </Link>
          <div className="flex items-center gap-4">
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

      {/* Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-primary text-white px-6 py-3 rounded-xl shadow-lg animate-fadeIn">
          {notification}
        </div>
      )}

      <div className="pt-24 px-6 pb-20">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="text-primary" size={32} />
            <h1 className="text-4xl font-black">
              All <span className="gradient-text">Products</span>
            </h1>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition capitalize ${
                    category === cat
                      ? 'bg-primary text-white'
                      : 'glass text-gray-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="glass rounded-2xl h-72 animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-2xl font-bold mb-2">Bot is Finding Products...</h3>
              <p className="text-gray-400">Our AI is scanning for trending products. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="glass rounded-2xl overflow-hidden product-card cursor-pointer group">
                  <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center relative">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-6xl">📦</span>
                    )}
                    {product.trending_score > 7 && (
                      <div className="absolute top-2 left-2 bg-secondary text-white text-xs px-2 py-1 rounded-full font-bold">
                        🔥 Hot
                      </div>
                    )}
                    {product.is_own_product && (
                      <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-full font-bold">
                        ⭐ Featured
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-sm mb-1 line-clamp-2">{product.title}</h3>
                    <p className="text-gray-400 text-xs mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-primary font-black text-lg">${product.price}</span>
                      <button
                        onClick={() => addToCart(product)}
                        className="bg-primary/20 hover:bg-primary text-white text-xs px-3 py-2 rounded-xl transition font-semibold"
onClick={() => router.push(`/checkout?productId=${product.id}&productName=${product.title}&price=${product.price}`)}
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="glass py-8 px-6 text-center">
        <h2 className="text-xl font-black gradient-text">⚡ Creative Store</h2>
        <p className="text-gray-600 text-xs mt-2">© 2025 Creative Store. All rights reserved.</p>
      </footer>
    </>
  )
}
