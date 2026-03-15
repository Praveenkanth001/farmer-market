import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '../api';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [token]);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const unread = res.data.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Notif fetch error:", err);
    }
  };

  const linkClass = (path) =>
    `text-xs sm:text-sm px-2 ${
      location.pathname === path
        ? 'text-emerald-900 border-b-2 border-emerald-600 pb-1'
        : 'text-emerald-900/70 hover:text-emerald-900'
    }`;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <header className="border-b border-emerald-100 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        {/* logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <div className="h-8 w-8 rounded-full bg-emerald-700 flex items-center justify-center text-white text-lg">
            🌿
          </div>
          <span className="font-semibold text-emerald-900 text-sm sm:text-base">
            FarmDirect
          </span>
        </div>

        {/* center nav links */}
        <nav className="hidden md:flex gap-4 text-sm">
          <button className={linkClass('/')} onClick={() => navigate('/')}>
            Home
          </button>
          <button
            className={linkClass('/market')}
            onClick={() => navigate('/market')}
          >
            Marketplace
          </button>
          <button
            className={linkClass('/farmers')}
            onClick={() => navigate('/farmers')}
          >
            Farmers
          </button>
          <button
            className={linkClass('/agri-doctor')}
            onClick={() => navigate('/agri-doctor')}
          >
            Agri-Doctor
          </button>
          <button
            className={linkClass('/ai-price')}
            onClick={() => navigate('/ai-price')}
          >
            Market Rates
          </button>
          <button
            className={linkClass('/about')}
            onClick={() => navigate('/about')}
          >
            About
          </button>
          <button
            className={linkClass('/contact')}
            onClick={() => navigate('/contact')}
          >
            Contact
          </button>
          <button
            className={linkClass('/profile')}
            onClick={() => navigate('/profile')}
          >
            Profile
          </button>
        </nav>

        {/* right icons + logout */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/cart')}
            className="text-emerald-900/80 hover:text-emerald-900 text-sm"
            title="Cart"
          >
            🛒
          </button>
          <button
            onClick={() => {
              const role = localStorage.getItem('role');
              if (role === 'farmer') navigate('/farmer-orders');
              else navigate('/my-orders');
            }}
            className="text-emerald-900/80 hover:text-emerald-900 text-sm relative"
            title="Orders"
          >
            📦
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] h-3 w-3 flex items-center justify-center rounded-full animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-full border border-emerald-600 text-xs sm:text-sm text-emerald-800 hover:bg-emerald-600 hover:text-white"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
