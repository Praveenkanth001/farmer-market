import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';

function FarmerLogin() {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('farmer@example.com');
  const [password, setPassword] = useState('123456');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.user.role);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      if (res.data.user.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        if (res.data.user.role !== 'farmer') {
          return setError('This is not a farmer account');
        }
        navigate('/farmer-dashboard'); 
      }
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        role: 'farmer',
        phone,
        location,
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.user.role);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/farmer-dashboard'); // UPDATED: Go to farmer dashboard
    } catch (err) {
      setError('Registration failed (maybe email already used)');
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex justify-center">
      <div className="w-full max-w-md px-4 py-8">
        {/* top logo row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-emerald-700 flex items-center justify-center text-white text-lg">
              🌿
            </div>
            <span className="font-semibold text-emerald-900 text-sm sm:text-base">
              FarmDirect
            </span>
          </div>
        </div>

        {/* card */}
        <div className="bg-white rounded-3xl shadow-md border border-emerald-100 px-6 py-8">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-emerald-700 flex items-center justify-center text-white text-2xl">
              🌾
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-center text-emerald-900 mb-1">
            Farmer Portal
          </h1>
          <p className="text-center text-sm text-emerald-900/70 mb-6">
            Sell your fresh produce directly to buyers
          </p>

          {/* tabs */}
          <div className="flex mb-6 bg-emerald-50 rounded-full p-1">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-sm font-medium rounded-full ${
                mode === 'login'
                  ? 'bg-white shadow text-emerald-900'
                  : 'text-emerald-700'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-2 text-sm font-medium rounded-full ${
                mode === 'register'
                  ? 'bg-white shadow text-emerald-900'
                  : 'text-emerald-700'
              }`}
            >
              Register
            </button>
          </div>

          {error && (
            <p className="text-red-500 text-xs mb-3 text-center">{error}</p>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm text-emerald-900 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-emerald-900 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full mt-2 py-2.5 rounded-xl bg-emerald-700 text-white font-semibold text-sm shadow hover:bg-emerald-800"
              >
                Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-sm text-emerald-900 mb-1">
                  Name
                </label>
                <input
                  className="w-full rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-emerald-900 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-emerald-900 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-emerald-900 mb-1">
                  Phone
                </label>
                <input
                  className="w-full rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-emerald-900 mb-1">
                  Location
                </label>
                <input
                  className="w-full rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full mt-2 py-2.5 rounded-xl bg-emerald-700 text-white font-semibold text-sm shadow hover:bg-emerald-800"
              >
                Register
              </button>
            </form>
          )}

          <p className="mt-4 text-xs text-center text-emerald-900/60">
            Are you a buyer?{' '}
            <Link to="/buyer-login" className="text-emerald-700 underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default FarmerLogin;
