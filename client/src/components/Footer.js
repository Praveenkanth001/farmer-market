import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-emerald-900 flex items-center gap-2">
              <span className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white text-lg">🌱</span>
              FarmDirect
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Connecting farmers directly with buyers. Fresh produce, fair prices, no middlemen.
            </p>
            <div className="flex space-x-4 pt-2">
              {/* Social Placeholders */}
              <a href="#" className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center hover:bg-emerald-100 transition">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center hover:bg-emerald-100 transition">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.85-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6">Quick Links</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link to="/marketplace" className="hover:text-emerald-600 transition">Marketplace</Link></li>
              <li><Link to="/about" className="hover:text-emerald-600 transition">About Us</Link></li>
              <li><Link to="/how-it-works" className="hover:text-emerald-600 transition">How It Works</Link></li>
              <li><Link to="/faqs" className="hover:text-emerald-600 transition">FAQs</Link></li>
            </ul>
          </div>

          {/* Column 3: For Users */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6">For Users</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link to="/register-farmer" className="hover:text-emerald-600 transition">Join as Farmer</Link></li>
              <li><Link to="/register-buyer" className="hover:text-emerald-600 transition">Join as Buyer</Link></li>
              <li><Link to="/pricing" className="hover:text-emerald-600 transition">Pricing</Link></li>
              <li><Link to="/contact" className="hover:text-emerald-600 transition">Support</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6">Contact Us</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li className="flex items-center gap-3">
                <span className="text-emerald-600">✉️</span>
                <a href="mailto:hello@farmdirect.com" className="hover:text-emerald-600 transition">hello@farmdirect.com</a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-emerald-600">📞</span>
                <a href="tel:+15551234567" className="hover:text-emerald-600 transition">+1 (555) 123-4567</a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-emerald-600">📍</span>
                <span>San Francisco, CA</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright */}
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>© 2026 FarmDirect. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-gray-600">Privacy Policy</a>
            <a href="#" className="hover:text-gray-600">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
