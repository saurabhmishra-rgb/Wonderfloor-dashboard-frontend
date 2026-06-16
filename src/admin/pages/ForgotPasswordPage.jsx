import { useState } from 'react';
import { Link } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_NODE_BACKEND_URL || 'https://wonderfloor-dashboard.vercel.app';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();

      if (res.ok && data.success) {
        setStatus({ type: 'success', message: data.message });
        setEmail('');
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to send reset link.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Server connection failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f5] flex items-center justify-center p-4 font-sans text-[#111111]">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-[#e8e8e8] p-8">
        
        <div className="flex flex-col items-center mb-8">
          <img src="https://www.wonderfloor.co.in/assets/img/logo/logo.png" alt="Wonderfloor" className="h-10 object-contain mb-4" />
          <h2 className="text-xl font-bold tracking-tight">Reset Password</h2>
          <p className="text-[13px] text-[#aaaaaa] mt-1 text-center">Enter your email and we'll send you a link to reset your password.</p>
        </div>

        {status.message && (
          <div className={`mb-4 p-3 text-sm rounded-lg border text-center ${status.type === 'success' ? 'bg-[#edf9f5] text-[#0b9e7a] border-[#0b9e7a]' : 'bg-red-50 text-red-600 border-red-100'}`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#555555] uppercase tracking-wider mb-1.5">Email Address</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 bg-[#fafafa] border border-[#e0e0e0] rounded-lg focus:outline-none focus:border-[#0b9e7a] text-[14px]" placeholder="admin@wonderfloor.com" />
          </div>

          <button type="submit" disabled={loading} className="w-full mt-2 bg-[#0b9e7a] hover:bg-[#09866a] text-white font-medium py-2.5 rounded-lg transition-colors">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="text-center text-[13px] mt-6">
          <Link to="/admin/login" className="text-[#0b9e7a] hover:underline font-semibold flex items-center justify-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
