import { useState } from 'react'
import Head from 'next/head'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'

export default function Auth() {
  const router = useRouter()
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    email: '',
    password: '',
    username: '',
    full_name: '',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleEmailAuth = async () => {
    setLoading(true)
    setError('')

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            username: form.username,
            full_name: form.full_name,
          }
        }
      })
      if (error) setError(error.message)
      else {
        await supabase.from('users').insert({
          email: form.email,
          username: form.username,
          full_name: form.full_name,
          provider: 'email',
        })
        router.push('/')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })
      if (error) setError(error.message)
      else router.push('/')
    }
    setLoading(false)
  }

  const handleGoogleAuth = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    })
    if (error) setError(error.message)
  }

  return (
    <>
      <Head>
        <title>{mode === 'login' ? 'Login' : 'Sign Up'} — Creative Store</title>
      </Head>

      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="glass rounded-3xl p-8 w-full max-w-md animate-fadeIn">
          
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black gradient-text">⚡ Creative Store</h1>
            <p className="text-gray-400 mt-2">
              {mode === 'login' ? 'Welcome back!' : 'Create your account'}
            </p>
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleAuth}
            className="w-full glass border border-white/20 rounded-xl py-3 flex items-center justify-center gap-3 hover:bg-white/10 transition mb-6"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            <span className="font-semibold">Continue with Google</span>
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-gray-500 text-sm">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Form */}
          <div className="space-y-4">
            {mode === 'signup' && (
              <>
                <input
                  type="text"
                  name="full_name"
                  placeholder="Full Name"
                  value={form.full_name}
                  onChange={handleChange}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                />
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={form.username}
                  onChange={handleChange}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                />
              </>
            )}

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
            />

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleEmailAuth}
              disabled={loading}
              className="btn-primary w-full py-3 text-center rounded-xl font-bold"
            >
              {loading ? '⏳ Please wait...' : mode === 'login' ? '🚀 Login' : '🎉 Create Account'}
            </button>
          </div>

          {/* Toggle */}
          <p className="text-center text-gray-400 mt-6 text-sm">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-primary font-semibold ml-2 hover:underline"
            >
              {mode === 'login' ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </>
  )
}
