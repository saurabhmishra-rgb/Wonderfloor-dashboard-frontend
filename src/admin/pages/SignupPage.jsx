import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_NODE_BACKEND_URL || 'http://localhost:8000';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      
      const data = await res.json();

      if (res.ok && data.success) {
        navigate('/admin/login', { state: { message: 'Account created! Please log in.' } });
      } else {
        setError(data.error || 'Registration failed.');
      }
    } catch (err) {
      setError('Server connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f5] flex items-center justify-center p-4 font-sans text-[#111111]">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-[#e8e8e8] p-8">
        
        <div className="flex flex-col items-center mb-8">
          <img src="https://www.wonderfloor.co.in/assets/img/logo/logo.png" alt="Wonderfloor" className="h-10 object-contain mb-4" />
          <h2 className="text-xl font-bold tracking-tight">Create an Account</h2>
          <p className="text-[13px] text-[#aaaaaa] mt-1">Sign up for the Admin Portal</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">{error}</div>}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#555555] uppercase tracking-wider mb-1.5">Full Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 bg-[#fafafa] border border-[#e0e0e0] rounded-lg focus:outline-none focus:border-[#0b9e7a] text-[14px]" placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#555555] uppercase tracking-wider mb-1.5">Email Address</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 bg-[#fafafa] border border-[#e0e0e0] rounded-lg focus:outline-none focus:border-[#0b9e7a] text-[14px]" placeholder="admin@wonderfloor.com" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#555555] uppercase tracking-wider mb-1.5">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2.5 bg-[#fafafa] border border-[#e0e0e0] rounded-lg focus:outline-none focus:border-[#0b9e7a] text-[14px]" placeholder="••••••••" />
          </div>

          <button type="submit" disabled={loading} className="w-full mt-2 bg-[#0b9e7a] hover:bg-[#09866a] text-white font-medium py-2.5 rounded-lg transition-colors">
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-[13px] text-[#555555] mt-6">
          Already have an account? <Link to="/admin/login" className="text-[#0b9e7a] hover:underline font-semibold">Log In</Link>
        </p>
      </div>
    </div>
  );
}