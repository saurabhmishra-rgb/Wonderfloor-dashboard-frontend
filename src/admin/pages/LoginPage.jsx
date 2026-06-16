import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_NODE_BACKEND_URL || 'https://wonderfloor-dashboard.vercel.app';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // If redirected from Signup, grab the success message
  const successMessage = location.state?.message;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('wonderfloor_admin_token', data.token);
        navigate('/admin');
      } else {
        setError(data.error || 'Login failed. Please check credentials.');
      }
    } catch (err) {
      setError('Server connection failed. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f5] flex items-center justify-center p-4 font-sans text-[#111111]">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-[#e8e8e8] p-8">
        
        <div className="flex flex-col items-center mb-8">
          <img src="https://www.wonderfloor.co.in/assets/img/logo/logo.png" alt="Wonderfloor" className="h-10 object-contain mb-4" />
          <h2 className="text-xl font-bold tracking-tight">Admin Portal</h2>
          <p className="text-[13px] text-[#aaaaaa] mt-1">Sign in to manage products and rooms</p>
        </div>

        {successMessage && <div className="mb-4 p-3 bg-[#edf9f5] text-[#0b9e7a] text-sm rounded-lg border border-[#0b9e7a] text-center">{successMessage}</div>}
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#555555] uppercase tracking-wider mb-1.5">Email Address</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 bg-[#fafafa] border border-[#e0e0e0] rounded-lg focus:outline-none focus:border-[#0b9e7a] text-[14px]" placeholder="admin@wonderfloor.com" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-[#555555] uppercase tracking-wider">Password</label>
              {/* FORGOT PASSWORD LINK */}
              {/* <Link to="/admin/forgot-password" className="text-[12px] text-[#0b9e7a] hover:underline font-medium">Forgot Password?</Link> */}
            </div>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2.5 bg-[#fafafa] border border-[#e0e0e0] rounded-lg focus:outline-none focus:border-[#0b9e7a] text-[14px]" placeholder="••••••••" />
          </div>

          <button type="submit" disabled={loading} className="w-full mt-2 bg-[#0b9e7a] hover:bg-[#09866a] text-white font-medium py-2.5 rounded-lg transition-colors flex justify-center">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* SIGN UP LINK */}
        {/* <p className="text-center text-[13px] text-[#555555] mt-6">
          Don't have an account? <Link to="/admin/signup" className="text-[#0b9e7a] hover:underline font-semibold">Sign Up</Link>
        </p> */}

      </div>
    </div>
  );
}
