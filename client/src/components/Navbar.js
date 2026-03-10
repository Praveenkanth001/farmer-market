import { useNavigate, useLocation } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

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
            onClick={() => navigate('/orders')}
            className="text-emerald-900/80 hover:text-emerald-900 text-sm"
            title="My Orders"
          >
            📦
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
