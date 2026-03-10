import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';

function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'buyer',
    phone: '',
    location: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/register', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.user.role);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      if (res.data.user.role === 'farmer') {
        navigate('/farmer-login');
      } else {
        navigate('/buyer-login');
      }
    } catch (err) {
      setError('Registration failed (maybe email already used)');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-800 p-6 rounded-xl w-full max-w-sm"
      >
        <h1 className="text-xl font-semibold mb-4">Create Account</h1>
        {error && <p className="text-red-400 mb-2 text-sm">{error}</p>}
        <label className="block text-sm mb-1">Name</label>
        <input
          name="name"
          className="w-full mb-3 px-3 py-2 rounded bg-slate-900 text-white"
          value={form.name}
          onChange={handleChange}
        />
        <label className="block text-sm mb-1">Email</label>
        <input
          name="email"
          type="email"
          className="w-full mb-3 px-3 py-2 rounded bg-slate-900 text-white"
          value={form.email}
          onChange={handleChange}
        />
        <label className="block text-sm mb-1">Password</label>
        <input
          name="password"
          type="password"
          className="w-full mb-3 px-3 py-2 rounded bg-slate-900 text-white"
          value={form.password}
          onChange={handleChange}
        />
        <label className="block text-sm mb-1">Role</label>
        <select
          name="role"
          className="w-full mb-3 px-3 py-2 rounded bg-slate-900 text-white"
          value={form.role}
          onChange={handleChange}
        >
          <option value="buyer">Buyer</option>
          <option value="farmer">Farmer</option>
        </select>
        <label className="block text-sm mb-1">Phone</label>
        <input
          name="phone"
          className="w-full mb-3 px-3 py-2 rounded bg-slate-900 text-white"
          value={form.phone}
          onChange={handleChange}
        />
        <label className="block text-sm mb-1">Location</label>
        <input
          name="location"
          className="w-full mb-4 px-3 py-2 rounded bg-slate-900 text-white"
          value={form.location}
          onChange={handleChange}
        />
        <button
          type="submit"
          className="w-full bg-emerald-500 hover:bg-emerald-600 py-2 rounded font-medium"
        >
          Register
        </button>
        <p className="text-xs text-slate-400 mt-3">
          Already have an account?{' '}
          <Link to="/buyer-login" className="text-emerald-400">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
