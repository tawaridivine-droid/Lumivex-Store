import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'
import { Package, ShoppingBag, DollarSign, TrendingUp, Plus, LogOut } from 'lucide-react'

export default function Dashboard({ user }) {
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [portfolio, setPortfolio] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newProduct, setNewProduct] = useState({ title: '', price: '', supplier_price: '', description: '', category: '', images: '' })
  const [adding, setAdding] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (!user) { router.push('/auth'); return }
    fetchData()
  }, [user])

  async function fetchData() {
    const [{ data: o }, { data: p }, { data: port }] = await Promise.all([
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('portfolio').select('*').order('date', { ascending: false }).limit(1)
    ])
    if (o) setOrders(o)
    if (p) setProducts(p)
    if (port) setPortfolio(port[0])
    setLoading(false)
  }

  async function addProduct() {
    setAdding(true)
    const { error } = await supabase.from('products').insert({
      title: newProduct.title,
      price: parseFloat(newProduct.price),
      supplier_price: parseFloat(newProduct.supplier_price),
      description: newProduct.description,
      category: newProduct.category,
      images: newProduct.images ? [newProduct.images] : [],
      is_own_product: true,
      is_active: true,
      trending_score: 10,
    })
    if (!error) {
      setNewProduct({ title: '', price: '', supplier_price: '', description: '', category: '', images: '' })
      setShowForm(false)
      fetchData()
    }
    setAdding(false)
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_price || 0), 0)
  const totalProfit = orders.reduce((sum, o) => sum + (o.profit || 0), 0)

  return (
    <>
      <Head><title>Dashboard — Creative Store</title></Head>
      <nav className="glass fixed top-0 w-full z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/"><h1 className="text-2xl font-black gradient-text cursor-pointer">⚡ Creative Store</h1></Link>
          <button onClick={logout} className="flex items-center gap-2 text-gray-400 hover:text-white transition">
            <LogOut size={18} /><span className="text-sm">Logout</span>
          </button>
        </div>
      </nav>

      <div className="pt-24 px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-black mb-2">Dashboard <span className="gradient-text">Control Room</span></h1>
          <p className="text-gray-400 mb-8">Welcome back, {user?.email} 👋</p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: <DollarSign size={24} />, label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}` },
              { icon: <TrendingUp size={24} />, label: 'Total Profit', value: `$${totalProfit.toFixed(2)}` },
              { icon: <ShoppingBag size={24} />, label: 'Total Orders', value: orders.length },
              { icon: <Package size={24} />, label: 'Total Products', value: products.length },
            ].map((stat, i) => (
              <div key={i} className="glass rounded-2xl p-4">
                <div className="text-primary mb-2">{stat.icon}</div>
                <div className="text-2xl font-black gradient-text">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Bot Portfolio Report */}
          {portfolio && (
            <div className="glass rounded-2xl p-6 mb-8 border border-primary/30">
              <h2 className="text-xl font-black mb-4">🤖 Latest Bot Report</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><div className="text-primary font-black text-xl">${portfolio.total_revenue}</div><div className="text-gray-400 text-sm">Revenue</div></div>
                <div><div className="text-primary font-black text-xl">${portfolio.total_profit}</div><div className="text-gray-400 text-sm">Profit</div></div>
                <div><div className="text-primary font-black text-xl">{portfolio.total_orders}</div><div className="text-gray-400 text-sm">Orders</div></div>
                <div><div className="text-primary font-black text-xl">{portfolio.new_products_listed}</div><div className="text-gray-400 text-sm">New Products</div></div>
              </div>
              {portfolio.top_product && <p className="text-gray-400 text-sm mt-4">🔥 Top Product: {portfolio.top_product}</p>}
            </div>
          )}

          {/* Add Your Own Product */}
          <div className="glass rounded-2xl p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black">⭐ Add Your Own Product</h2>
              <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm">
                <Plus size={16} />{showForm ? 'Cancel' : 'Add Product'}
              </button>
            </div>

            {showForm && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {[
                  { name: 'title', placeholder: 'Product Title' },
                  { name: 'category', placeholder: 'Category (e.g. Electronics)' },
                  { name: 'price', placeholder: 'Selling Price (e.g. 29.99)', type: 'number' },
                  { name: 'supplier_price', placeholder: 'Supplier Price (e.g. 12.00)', type: 'number' },
                  { name: 'images', placeholder: 'Image URL (optional)' },
                ].map((field) => (
                  <input
                    key={field.name}
                    type={field.type || 'text'}
                    placeholder={field.placeholder}
                    value={newProduct[field.name]}
                    onChange={(e) => setNewProduct({ ...newProduct, [field.name]: e.target.value })}
                    className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                  />
                ))}
                <textarea
                  placeholder="Product Description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary md:col-span-2 h-24 resize-none"
                />
                <button
                  onClick={addProduct}
                  disabled={adding}
                  className="btn-primary md:col-span-2 py-3 rounded-xl font-bold"
                >
                  {adding ? '⏳ Adding...' : '🚀 Add Product to Store'}
                </button>
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="glass rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-black mb-4">📦 Recent Orders</h2>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">⏳</div>
                <p className="text-gray-400">No orders yet. Start driving traffic!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-white/10">
                      <th className="text-left py-2">Customer</th>
                      <th className="text-left py-2">Product</th>
                      <th className="text-left py-2">Amount</th>
                      <th className="text-left py-2">Profit</th>
                      <th className="text-left py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3">{order.customer_name || 'N/A'}</td>
                        <td className="py-3 text-gray-400">{order.product_id?.slice(0, 8)}...</td>
                        <td className="py-3 text-primary font-bold">${order.total_price}</td>
                        <td className="py-3 text-green-400 font-bold">${order.profit}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                            order.status === 'shipped' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Products List */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-black mb-4">🛍️ All Products ({products.length})</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.map((product) => (
                <div key={product.id} className="glass rounded-xl p-3">
                  <div className="h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center mb-2">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <span className="text-3xl">📦</span>
                    )}
                  </div>
                  <p className="text-xs font-bold line-clamp-2">{product.title}</p>
                  <div className="flex justify-between mt-1">
                    <span className="text-primary text-xs font-black">${product.price}</span>
                    <span className="text-green-400 text-xs">+${(product.price - product.supplier_price).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
