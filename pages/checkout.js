import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function Checkout() {
  const router = useRouter()
  const { productId, productName, price } = router.query
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
  })
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleFlutterwave = async () => {
    setLoading(true)
    const FlutterwaveCheckout = (await import('flutterwave-react-v3')).useFlutterwave
    window.FlutterwaveCheckout({
      public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_KEY,
      tx_ref: `lumivex-${Date.now()}`,
      amount: price,
      currency: 'USD',
      payment_options: 'card,banktransfer,ussd',
      customer: {
        email: form.email,
        phone_number: form.phone,
        name: form.name,
      },
      customizations: {
        title: 'Lumivex Store',
        description: `Payment for ${productName}`,
        logo: 'https://lumivex-store.vercel.app/favicon.ico',
      },
      callback: async (response) => {
        if (response.status === 'successful') {
          await saveOrder('flutterwave', response.transaction_id)
          setSuccess(true)
        }
        setLoading(false)
      },
      onclose: () => setLoading(false),
    })
  }

  const handleBankTransfer = async () => {
    setLoading(true)
    await saveOrder('bank_transfer', 'pending')
    setSuccess(true)
    setLoading(false)
  }

  const saveOrder = async (method, transactionId) => {
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: productId,
        customer_name: form.name,
        customer_email: form.email,
        customer_phone: form.phone,
        customer_address: `${form.address}, ${form.city}, ${form.country}`,
        total_price: parseFloat(price),
        profit: parseFloat(price) * 0.4,
        status: 'pending',
        payment_method: method,
        transaction_id: transactionId,
      }),
    })
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="glass rounded-3xl p-8 text-center max-w-md w-full animate-fadeIn">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-black gradient-text mb-4">Order Placed!</h1>
          <p className="text-gray-400 mb-2">Thank you {form.name}!</p>
          <p className="text-gray-400 mb-6">Your order is being processed. You will receive updates via email.</p>
          {paymentMethod === 'bank_transfer' && (
            <div className="glass rounded-xl p-4 mb-6 text-left">
              <h3 className="font-bold mb-3 text-primary">Bank Transfer Details:</h3>
              <p className="text-sm text-gray-300">Bank: <span className="text-white font-bold">Your Bank Name</span></p>
              <p className="text-sm text-gray-300">Account Number: <span className="text-white font-bold">Your Account Number</span></p>
              <p className="text-sm text-gray-300">Account Name: <span className="text-white font-bold">Your Name</span></p>
              <p className="text-sm text-gray-300">Amount: <span className="text-primary font-black">${price}</span></p>
              <p className="text-sm text-yellow-400 mt-2">Please use your order ID as reference when transferring.</p>
            </div>
          )}
          <button
            onClick={() => router.push('/')}
            className="btn-primary w-full py-3 rounded-xl font-bold"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Checkout — Lumivex Store</title>
      </Head>

      <div className="min-h-screen py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-black mb-2">
            Secure <span className="gradient-text">Checkout</span>
          </h1>
          <p className="text-gray-400 mb-8">You are ordering: <span className="text-white font-bold">{productName}</span></p>

          <div className="glass rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-black mb-4">Shipping Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'name', placeholder: 'Full Name' },
                { name: 'email', placeholder: 'Email Address' },
                { name: 'phone', placeholder: 'Phone Number' },
                { name: 'address', placeholder: 'Street Address' },
                { name: 'city', placeholder: 'City' },
                { name: 'country', placeholder: 'Country' },
              ].map((field) => (
                <input
                  key={field.name}
                  type="text"
                  name={field.name}
                  placeholder={field.placeholder}
                  value={form[field.name]}
                  onChange={handleChange}
                  className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                />
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-black mb-4">Payment Method</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => setPaymentMethod('card')}
                className={`p-4 rounded-xl border-2 transition text-left ${
                  paymentMethod === 'card'
                    ? 'border-primary bg-primary/20'
                    : 'border-white/20 glass'
                }`}
              >
                <div className="text-2xl mb-2">💳</div>
                <div className="font-bold">Card Payment</div>
                <div className="text-gray-400 text-sm">Visa, Mastercard, Crypto</div>
              </button>
              <button
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`p-4 rounded-xl border-2 transition text-left ${
                  paymentMethod === 'bank_transfer'
                    ? 'border-primary bg-primary/20'
                    : 'border-white/20 glass'
                }`}
              >
                <div className="text-2xl mb-2">🏦</div>
                <div className="font-bold">Bank Transfer</div>
                <div className="text-gray-400 text-sm">Direct bank transfer</div>
              </button>
            </div>

            <div className="glass rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Product</span>
                <span className="font-bold">{productName}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-400">Total</span>
                <span className="text-primary font-black text-xl">${price}</span>
              </div>
            </div>

            <button
              onClick={paymentMethod === 'card' ? handleFlutterwave : handleBankTransfer}
              disabled={loading || !form.name || !form.email || !form.address}
              className="btn-primary w-full py-4 rounded-xl font-black text-lg disabled:opacity-50"
            >
              {loading ? '⏳ Processing...' : paymentMethod === 'card' ? `💳 Pay $${price} Now` : `🏦 Place Order — Pay via Bank Transfer`}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
